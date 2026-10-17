package br.edu.vivamais;

import static br.edu.vivamais.ApiModels.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import java.util.regex.*;
import javax.imageio.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service @Transactional
public class PrivateFileService {
 private final JdbcTemplate db;private final CareService care;private final FoundationRepository foundation;private final FileStorage store;private final TokenCodec tokens;private final OcrProvider ocr;private final FoodAnalysisProvider food;
 public PrivateFileService(JdbcTemplate db,CareService care,FoundationRepository foundation,FileStorage store,TokenCodec tokens,OcrProvider ocr,FoodAnalysisProvider food){this.db=db;this.care=care;this.foundation=foundation;this.store=store;this.tokens=tokens;this.ocr=ocr;this.food=food;}
 public static byte[] sanitize(byte[] bytes)throws Exception{
  if(bytes.length==0||bytes.length>2097152)throw CareService.error(413,"Use uma imagem PNG ou JPEG com até 2 MB.");
  try(var stream=ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))){var readers=ImageIO.getImageReaders(stream);if(!readers.hasNext())throw CareService.error(415,"Imagem inválida. Use PNG ou JPEG.");var reader=readers.next();
   try{String format=reader.getFormatName().toLowerCase(Locale.ROOT);if(!Set.of("png","jpeg","jpg").contains(format))throw CareService.error(415,"Formato não permitido.");reader.setInput(stream,true,true);int width=reader.getWidth(0),height=reader.getHeight(0);if(width<20||height<20||width>4096||height>4096||(long)width*height>12000000)throw CareService.error(413,"Dimensões da imagem fora do limite.");BufferedImage image=reader.read(0);ByteArrayOutputStream out=new ByteArrayOutputStream();ImageIO.write(image,"png",out);if(out.size()>2097152)throw CareService.error(413,"Reduza a imagem para até 2 MB.");return out.toByteArray();}finally{reader.dispose();}
  }
 }
 public Map<String,Object> upload(UUID patient,String purpose,MultipartFile file,UserView actor)throws Exception{
  care.access(patient,actor);if(!Set.of("MEAL","PRESSURE_DISPLAY").contains(purpose))throw CareService.error(400,"Finalidade inválida.");
  db.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?,1))",Object.class,patient.toString());
  if(db.queryForObject("SELECT count(*) FROM file_object WHERE patient_id=? AND created_at>=date_trunc('month',now())",Integer.class,patient)>=20)throw CareService.error(429,"Limite de 20 fotos por mês nesta demonstração.");
  byte[] clean=sanitize(file.getBytes());UUID id=UUID.randomUUID();String key=id+".bin";store.put(key,clean);
  try{db.update("INSERT INTO file_object(id,patient_id,author_id,object_key,mime_type,byte_size,sha256,purpose) VALUES(?,?,?,?,'image/png',?,?,?)",id,patient,actor.id(),key,clean.length,HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(clean)),purpose);foundation.audit(actor,"PRIVATE_FILE_CREATED","file_object",id);}
  catch(RuntimeException e){store.delete(key);throw e;}
  return care.rows("SELECT id,patient_id,mime_type,byte_size,purpose,created_at FROM file_object WHERE id=?",id).getFirst();
 }
 private Map<String,Object> file(UUID id,UserView actor){var found=care.rows("SELECT * FROM file_object WHERE id=?",id);if(found.isEmpty())throw CareService.error(403,"Arquivo não autorizado.");care.access(UUID.fromString(found.getFirst().get("patientId").toString()),actor);return found.getFirst();}
 public Map<String,Object> link(UUID file,SessionPrincipal principal){file(file,principal.user());String grant=tokens.issue();Instant expires=Instant.now().plusSeconds(60);db.update("DELETE FROM file_download_grant WHERE expires_at<now()");db.update("INSERT INTO file_download_grant(token_hash,file_id,session_id,expires_at) VALUES(?,?,?,?)",tokens.hash(grant),file,principal.sessionId(),java.sql.Timestamp.from(expires));foundation.audit(principal.user(),"PRIVATE_FILE_LINK_CREATED","file_object",file);return Map.of("path","/api/v1/files/"+file+"/content?access="+grant,"expiresAt",expires.toString());}
 public byte[] content(UUID file,String grant)throws Exception{
  if(grant==null||grant.length()>128)throw CareService.error(403,"Link inválido ou expirado.");
  var found=care.rows("SELECT f.object_key,u.id actor_id,u.organization_id FROM file_download_grant g JOIN auth_session s ON s.id=g.session_id JOIN user_account u ON u.id=s.user_account_id JOIN file_object f ON f.id=g.file_id JOIN patient p ON p.id=f.patient_id WHERE g.token_hash=? AND g.file_id=? AND g.expires_at>now() AND s.expires_at>now() AND s.revoked_at IS NULL AND u.enabled=true AND u.organization_id=p.organization_id AND (u.role='ADMIN' OR (u.role='PATIENT' AND p.user_account_id=u.id) OR (u.role='PROFESSIONAL' AND EXISTS(SELECT 1 FROM patient_professional_assignment a WHERE a.patient_id=p.id AND a.professional_id=u.id)))",tokens.hash(grant),file);
  if(found.isEmpty())throw CareService.error(403,"Link inválido ou expirado.");var row=found.getFirst();db.update("INSERT INTO audit_event(id,organization_id,actor_id,action,resource_type,resource_id) VALUES(?,?,?,'PRIVATE_FILE_VIEWED','file_object',?)",UUID.randomUUID(),UUID.fromString(row.get("organizationId").toString()),UUID.fromString(row.get("actorId").toString()),file);return store.get(row.get("objectKey").toString());
 }
 public Map<String,Object> recognize(UUID id,UserView actor)throws Exception{
  var file=file(id,actor);if(!file.get("purpose").equals("PRESSURE_DISPLAY"))throw CareService.error(400,"Selecione uma foto de visor de aparelho.");
  UUID patient=UUID.fromString(file.get("patientId").toString()),document=UUID.randomUUID();Path image=Files.createTempFile("viva-ocr-",".png");String status="UNAVAILABLE";Integer sys=null,dia=null,pulse=null;
  try{Files.write(image,store.get(file.get("objectKey").toString()));String text=ocr.recognize(image);sys=number(text,"(?:SYS|SIS|SYSTOLIC|SISTOLICA)");dia=number(text,"(?:DIA|DIASTOLIC|DIASTOLICA)");pulse=number(text,"(?:PULSE|PULSO|PUL)");
   if(sys==null||dia==null){var m=Pattern.compile("(?m)^\\s*(\\d{2,3})\\s*(?:[/| ]|\\R)+\\s*(\\d{2,3})(?:\\s+(\\d{2,3}))?\\s*$").matcher(text.trim());if(m.find()){sys=Integer.valueOf(m.group(1));dia=Integer.valueOf(m.group(2));if(m.group(3)!=null)pulse=Integer.valueOf(m.group(3));}}
   status=sys!=null&&dia!=null&&sys>0&&sys<=400&&dia>0&&dia<=400?"RECOGNIZED":"UNREADABLE";
  }catch(org.springframework.web.server.ResponseStatusException e){if(e.getStatusCode().value()==429)throw e;status="UNAVAILABLE";}catch(IOException e){status="UNAVAILABLE";}finally{Files.deleteIfExists(image);}
  if(!status.equals("RECOGNIZED")){sys=null;dia=null;pulse=null;}if(pulse!=null&&(pulse<1||pulse>300))pulse=null;
  db.update("INSERT INTO pressure_ocr_document(id,patient_id,file_id,status,systolic,diastolic,pulse) VALUES(?,?,?,?,?,?,?)",document,patient,id,status,sys,dia,pulse);foundation.audit(actor,"OCR_PROCESSED","pressure_ocr_document",document);
  var result=care.rows("SELECT id,file_id,status,systolic,diastolic,pulse,created_at FROM pressure_ocr_document WHERE id=?",document).getFirst();result.put("confirmationRequired",true);result.put("message",status.equals("RECOGNIZED")?"Confira todos os números antes de salvar. A foto é do visor; o celular não mede pressão.":status.equals("UNREADABLE")?"Não foi possível ler os números. Tire outra foto ou digite os valores.":"OCR indisponível neste ambiente. Digite os valores ou tente novamente depois.");return result;
 }
 private static Integer number(String text,String label){var match=Pattern.compile("(?i)\\b"+label+"\\b[^0-9]{0,15}([0-9]{2,3})").matcher(text);return match.find()?Integer.valueOf(match.group(1)):null;}
 public Map<String,Object> meal(UUID patient,UUID file,Instant occurredAt,String notes,UserView actor){
  care.access(patient,actor);var stored=file(file,actor);if(!stored.get("patientId").equals(patient.toString())||!stored.get("purpose").equals("MEAL"))throw CareService.error(400,"Foto não pertence a esta refeição.");if(occurredAt==null||occurredAt.isAfter(Instant.now().plusSeconds(300)))throw CareService.error(400,"Data da refeição inválida.");if(notes!=null&&notes.length()>2000)throw CareService.error(400,"Observação muito longa.");
  var existing=care.rows("SELECT * FROM meal_photo WHERE file_id=?",file);if(!existing.isEmpty())return existing.getFirst();UUID id=UUID.randomUUID();db.update("INSERT INTO meal_photo(id,patient_id,file_id,author_id,occurred_at,notes) VALUES(?,?,?,?,?,?)",id,patient,file,actor.id(),java.sql.Timestamp.from(occurredAt),Objects.toString(notes,""));foundation.audit(actor,"MEAL_CREATED","meal_photo",id);return care.rows("SELECT * FROM meal_photo WHERE id=?",id).getFirst();
 }
 public CareModels.Page<Map<String,Object>> meals(UUID patient,int page,int size,UserView actor){care.access(patient,actor);if(page<0||page>100000||size<1||size>100)throw CareService.error(400,"Paginação inválida.");return new CareModels.Page<>(care.rows("SELECT * FROM meal_photo WHERE patient_id=? ORDER BY occurred_at DESC,id DESC LIMIT ? OFFSET ?",patient,size,(long)page*size),db.queryForObject("SELECT count(*) FROM meal_photo WHERE patient_id=?",Long.class,patient),page,size);}
 public Map<String,Object> analyze(UUID meal,UserView actor)throws Exception{
  var found=care.rows("SELECT m.*,f.object_key FROM meal_photo m JOIN file_object f ON f.id=m.file_id WHERE m.id=?",meal);if(found.isEmpty())throw CareService.error(403,"Refeição não autorizada.");var row=found.getFirst();care.access(UUID.fromString(row.get("patientId").toString()),actor);
  if(!food.enabled())return Map.of("status","UNAVAILABLE","providerCalled",false,"message","Análise automatizada indisponível. Critérios e serviço precisam de configuração e revisão clínica.","educationalAlternative","Leve a foto à equipe de saúde para conversar sobre a refeição. A foto, sozinha, não mede sódio, gordura, porções ou nutrientes.");
  db.queryForObject("SELECT pg_advisory_xact_lock(41050821)",Object.class);
  // Re-read after the lock: another request may have completed this assessment while we waited.
  row=care.rows("SELECT m.*,f.object_key FROM meal_photo m JOIN file_object f ON f.id=m.file_id WHERE m.id=?",meal).getFirst();
  if(row.get("assessment")!=null){@SuppressWarnings("unchecked")var result=(Map<String,Object>)row.get("assessment");return result;}
  if(db.queryForObject("SELECT count(*) FROM food_analysis_attempt WHERE created_at>=date_trunc('day',now())",Integer.class)>=5)throw CareService.error(429,"Limite diário de análises atingido nesta demonstração.");
  if(db.queryForObject("SELECT count(*) FROM food_analysis_attempt WHERE meal_id=?",Integer.class,meal)>=2)throw CareService.error(429,"Limite de tentativas para esta foto atingido.");
  UUID attempt=UUID.randomUUID();db.update("INSERT INTO food_analysis_attempt(id,meal_id,actor_id,status) VALUES(?,?,?,'STARTED')",attempt,meal,actor.id());
  try{var result=food.assess(store.get(row.get("objectKey").toString()));db.update("UPDATE meal_photo SET analysis_status=?,assessment=?::jsonb WHERE id=?",result.get("status"),care.encode(result),meal);db.update("UPDATE food_analysis_attempt SET status='SUCCEEDED' WHERE id=?",attempt);foundation.audit(actor,"FOOD_ANALYSIS_COMPLETED","meal_photo",meal);return result;}
  catch(Exception exception){db.update("UPDATE food_analysis_attempt SET status='FAILED' WHERE id=?",attempt);return Map.of("status","UNAVAILABLE","providerCalled",true,"message","Análise automatizada indisponível. O serviço não retornou uma avaliação válida.");}
 }
}

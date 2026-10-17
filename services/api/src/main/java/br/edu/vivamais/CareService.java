package br.edu.vivamais;

import static br.edu.vivamais.ApiModels.*;
import static br.edu.vivamais.CareModels.*;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import java.util.function.Supplier;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@Transactional
public class CareService {
 private final JdbcTemplate db; private final FoundationRepository foundation; private final ObjectMapper json;
 private final TokenCodec tokens; private final PasswordEncoder passwords;
 public CareService(JdbcTemplate db,FoundationRepository foundation,ObjectMapper json,TokenCodec tokens,PasswordEncoder passwords) {
  this.db=db;this.foundation=foundation;this.json=json;this.tokens=tokens;this.passwords=passwords;
 }
 public PatientView access(UUID id,UserView actor) {
  return foundation.authorizedPatient(id,actor).orElseThrow(()->error(403,"Você não possui permissão para este paciente."));
 }
 public void professional(UserView actor) { if(actor.role()==Role.PATIENT) throw error(403,"Ação exclusiva de profissional autorizado."); }
 public static ResponseStatusException error(int status,String detail) { return new ResponseStatusException(HttpStatus.valueOf(status),detail); }
 private void time(Instant at) { if(at==null||at.isAfter(Instant.now().plusSeconds(300))||at.isBefore(Instant.parse("1900-01-01T00:00:00Z"))) throw error(400,"Confira a data e a hora informadas."); }
 private static Timestamp ts(Instant value) { return Timestamp.from(value); }
 public String encode(Object value) { try{return json.writeValueAsString(value);}catch(Exception e){throw new IllegalStateException("Serialization failed");} }
 public Map<String,Object> decode(String value) { try{return json.readValue(value,new TypeReference<Map<String,Object>>(){});}catch(Exception e){throw new IllegalStateException("Stored operation invalid");} }
 public List<Map<String,Object>> rows(String sql,Object... args) {
  return db.query(sql,(rs,n)->{
   Map<String,Object> out=new LinkedHashMap<>();var meta=rs.getMetaData();
   for(int i=1;i<=meta.getColumnCount();i++){
    String key=meta.getColumnLabel(i);StringBuilder camel=new StringBuilder();boolean upper=false;
    for(char c:key.toCharArray()){if(c=='_'){upper=true;continue;}camel.append(upper?Character.toUpperCase(c):c);upper=false;}
    Object value=rs.getObject(i);
    if(value instanceof Timestamp stamp)value=stamp.toInstant().toString();
    else if(value instanceof java.sql.Date date)value=date.toLocalDate().toString();
    else if(value instanceof java.sql.Time local)value=local.toLocalTime().toString();
    else if(value instanceof UUID uuid)value=uuid.toString();
    else if(value!=null&&("jsonb".equals(meta.getColumnTypeName(i))||"json".equals(meta.getColumnTypeName(i)))){
     try{value=json.readValue(value.toString(),Object.class);}catch(Exception ex){throw new IllegalStateException("Invalid JSON");}
    }
    out.put(camel.toString(),value);
   }return out;
  },args);
 }
 private Map<String,Object> one(String sql,Object...args){return rows(sql,args).stream().findFirst().orElseThrow(()->error(404,"Registro não encontrado."));}
 public Page<Map<String,Object>> page(String table,UUID patient,int page,int size) {
  if(!Set.of("blood_pressure_reading","activity_record","printed_diary_entry","consultation").contains(table))throw new IllegalArgumentException();
  paging(page,size);long total=db.queryForObject("SELECT count(*) FROM "+table+" WHERE patient_id=?",Long.class,patient);
  return new Page<>(rows("SELECT * FROM "+table+" WHERE patient_id=? ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?",patient,size,(long)page*size),total,page,size);
 }
 private void paging(int page,int size){if(page<0||page>100000||size<1||size>100)throw error(400,"Paginação inválida.");}
 public Page<PatientView> search(UserView actor,String query,int page,int size){
  professional(actor);paging(page,size);String q=query==null?"":query.trim();if(q.length()>120)throw error(400,"Busca muito longa.");
  String predicate="FROM patient p WHERE p.organization_id=? AND ( ?='ADMIN' OR EXISTS(SELECT 1 FROM patient_professional_assignment a WHERE a.patient_id=p.id AND a.professional_id=?)) AND lower(p.display_name) LIKE lower(?)";
  Object[] values={actor.organizationId(),actor.role().name(),actor.id(),"%"+q+"%"};
  long total=db.queryForObject("SELECT count(*) "+predicate,Long.class,values);
  List<PatientView> items=db.query("SELECT p.* "+predicate+" ORDER BY p.display_name,p.id LIMIT ? OFFSET ?",(rs,n)->new PatientView(rs.getObject("id",UUID.class),rs.getString("display_name"),rs.getString("modality"),rs.getObject("organization_id",UUID.class)),actor.organizationId(),actor.role().name(),actor.id(),"%"+q+"%",size,(long)page*size);
  foundation.audit(actor,"PATIENT_SEARCHED","patient",null);return new Page<>(items,total,page,size);
 }
 public PatientCreated createPatient(PatientCreate input,UserView actor){
  professional(actor);UUID id=UUID.randomUUID(),account=null;
  if(input.modality().equals("APP")){
   if(input.email()==null||input.email().isBlank())throw error(400,"E-mail é necessário para ativar o aplicativo.");
   account=UUID.randomUUID();
   db.update("INSERT INTO user_account(id,organization_id,email,display_name,password_hash,role,enabled) VALUES(?,?,?,?,?,'PATIENT',false)",account,actor.organizationId(),input.email().trim().toLowerCase(Locale.ROOT),input.displayName().trim(),passwords.encode(tokens.issue()));
  }
  db.update("INSERT INTO patient(id,organization_id,user_account_id,display_name,modality) VALUES(?,?,?,?,?)",id,actor.organizationId(),account,input.displayName().trim(),input.modality());
  if(actor.role()==Role.PROFESSIONAL)db.update("INSERT INTO patient_professional_assignment(patient_id,professional_id,organization_id) VALUES(?,?,?)",id,actor.id(),actor.organizationId());
  foundation.audit(actor,"PATIENT_CREATED","patient",id);
  AccessCode code=account==null?null:issueCode(account);
  return new PatientCreated(new PatientView(id,input.displayName().trim(),input.modality(),actor.organizationId()),code==null?null:code.activationToken(),code==null?null:code.expiresAt());
 }
 private AccessCode issueCode(UUID account){
  db.update("UPDATE account_activation SET used_at=now() WHERE user_account_id=? AND used_at IS NULL",account);
  String token=tokens.issue();Instant expires=Instant.now().plus(Duration.ofHours(24));
  db.update("INSERT INTO account_activation(id,user_account_id,token_hash,expires_at) VALUES(?,?,?,?)",UUID.randomUUID(),account,tokens.hash(token),ts(expires));
  return new AccessCode(token,expires);
 }
 public void activate(Activation input){
  if(input.password().getBytes(StandardCharsets.UTF_8).length>72)throw error(400,"A senha excede o tamanho permitido.");
  var found=db.queryForList("SELECT user_account_id FROM account_activation WHERE token_hash=? AND used_at IS NULL AND expires_at>now() FOR UPDATE",tokens.hash(input.token()));
  if(found.isEmpty())throw error(400,"Código inválido ou expirado.");UUID account=(UUID)found.getFirst().get("user_account_id");
  db.update("UPDATE user_account SET password_hash=?,enabled=true WHERE id=?",passwords.encode(input.password()),account);
  db.update("UPDATE account_activation SET used_at=now() WHERE token_hash=?",tokens.hash(input.token()));
  db.update("UPDATE auth_session SET revoked_at=now() WHERE user_account_id=? AND revoked_at IS NULL",account);
  var user=foundation.credentials(db.queryForObject("SELECT email FROM user_account WHERE id=?",String.class,account)).orElseThrow().user();foundation.audit(user,"ACCOUNT_ACTIVATED","user_account",account);
 }
 public AccessCode reset(UUID patient,Reauthenticate input,UserView actor){
  professional(actor);access(patient,actor);var own=foundation.credentials(actor.email()).orElseThrow();
  if(input.password().getBytes(StandardCharsets.UTF_8).length>72||!passwords.matches(input.password(),own.passwordHash()))throw error(401,"Confirme sua senha atual.");
  UUID account=db.queryForObject("SELECT user_account_id FROM patient WHERE id=?",UUID.class,patient);if(account==null)throw error(409,"A modalidade de diário não possui conta de aplicativo.");
  db.update("UPDATE auth_session SET revoked_at=now() WHERE user_account_id=? AND revoked_at IS NULL",account);foundation.audit(actor,"PATIENT_ACCESS_RESET","patient",patient);return issueCode(account);
 }
 public void assign(UUID patient,UUID professional,UserView actor){
  if(actor.role()!=Role.ADMIN)throw error(403,"Somente administrador atribui vínculos.");access(patient,actor);
  if(db.queryForObject("SELECT count(*) FROM professional WHERE id=? AND organization_id=?",Integer.class,professional,actor.organizationId())!=1)throw error(400,"Profissional não pertence à unidade.");
  db.update("INSERT INTO patient_professional_assignment(patient_id,professional_id,organization_id) VALUES(?,?,?) ON CONFLICT DO NOTHING",patient,professional,actor.organizationId());foundation.audit(actor,"PATIENT_ASSIGNED","patient",patient);
 }
 public List<Map<String,Object>> professionals(UserView actor){if(actor.role()!=Role.ADMIN)throw error(403,"Ação exclusiva da administração.");return rows("SELECT p.id,u.display_name FROM professional p JOIN user_account u ON u.id=p.id WHERE p.organization_id=? ORDER BY u.display_name",actor.organizationId());}
 public List<Map<String,Object>> assignments(UUID patient,UserView actor){if(actor.role()!=Role.ADMIN)throw error(403,"Ação exclusiva da administração.");access(patient,actor);return rows("SELECT a.professional_id,u.display_name FROM patient_professional_assignment a JOIN user_account u ON u.id=a.professional_id WHERE a.patient_id=? ORDER BY u.display_name",patient);}
 public void unassign(UUID patient,UUID professional,UserView actor){if(actor.role()!=Role.ADMIN)throw error(403,"Ação exclusiva da administração.");access(patient,actor);db.update("DELETE FROM patient_professional_assignment WHERE patient_id=? AND professional_id=? AND organization_id=?",patient,professional,actor.organizationId());foundation.audit(actor,"PATIENT_UNASSIGNED","patient",patient);}
 public Map<String,Object> idempotent(UUID id,UUID patient,UserView actor,String kind,Object input,Supplier<Map<String,Object>> write){
  access(patient,actor);db.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?,0))",Object.class,id.toString());
  String hash=tokens.hash(encode(input));var existing=rows("SELECT * FROM sync_operation WHERE id=?",id);
  if(!existing.isEmpty()){
   var row=existing.getFirst();if(!row.get("patientId").equals(patient.toString())||!row.get("actorId").equals(actor.id().toString())||!row.get("kind").equals(kind)||!row.get("payloadHash").equals(hash))throw error(409,"O identificador já foi usado com outro conteúdo.");
   @SuppressWarnings("unchecked") var response=(Map<String,Object>)row.get("response");return response;
  }
  Map<String,Object> result=write.get();db.update("INSERT INTO sync_operation(id,patient_id,actor_id,kind,payload_hash,response) VALUES(?,?,?,?,?,?::jsonb)",id,patient,actor.id(),kind,hash,encode(result));foundation.audit(actor,kind+"_CREATED",kind,id);return result;
 }
 public Page<Reading> readings(UUID patient,UserView actor,int page,int size,Instant from,Instant to){
  access(patient,actor);paging(page,size);if(from!=null&&to!=null&&from.isAfter(to))throw error(400,"Período inválido.");
  String where=" WHERE patient_id=?";List<Object> args=new ArrayList<>();args.add(patient);
  if(from!=null){where+=" AND measured_at>=?";args.add(ts(from));}if(to!=null){where+=" AND measured_at<=?";args.add(ts(to));}
  long total=db.queryForObject("SELECT count(*) FROM blood_pressure_reading"+where,Long.class,args.toArray());args.add(size);args.add((long)page*size);
  var items=rows("SELECT * FROM blood_pressure_reading"+where+" ORDER BY measured_at DESC,id DESC LIMIT ? OFFSET ?",args.toArray()).stream().map(row->json.convertValue(row,Reading.class)).toList();
  foundation.audit(actor,"READINGS_VIEWED","patient",patient);return new Page<>(items,total,page,size);
 }
 public Reading reading(UUID patient,ReadingInput input,UserView actor){
  access(patient,actor);time(input.measuredAt());
  if(actor.role()==Role.PATIENT&&!Set.of("MANUAL","OCR_CONFIRMED").contains(input.source()))throw error(403,"Origem não permitida para autorregistro.");
  if(input.source().equals("OCR_CONFIRMED")){
   if(!Boolean.TRUE.equals(input.ocrConfirmed())||input.ocrDocumentId()==null)throw error(400,"Confirme os valores reconhecidos antes de salvar.");
   // A porta OCR será conectada ao documento privado na migração de arquivos; nunca aceitar prova fictícia.
   if(!Boolean.TRUE.equals(db.queryForObject("SELECT to_regclass('pressure_ocr_document') IS NOT NULL",Boolean.class)))throw error(503,"OCR ainda indisponível. Use digitação manual.");
   if(db.queryForObject("SELECT count(*) FROM pressure_ocr_document WHERE id=? AND patient_id=? AND status='RECOGNIZED'",Integer.class,input.ocrDocumentId(),patient)!=1)throw error(400,"Documento OCR inválido.");
  }
  var result=idempotent(input.id(),patient,actor,"READING",input,()->{
   db.update("INSERT INTO blood_pressure_reading(id,patient_id,author_id,systolic,diastolic,pulse,measured_at,source,ocr_document_id) VALUES(?,?,?,?,?,?,?,?,?)",input.id(),patient,actor.id(),input.systolic(),input.diastolic(),input.pulse(),ts(input.measuredAt()),input.source(),input.ocrDocumentId());
   return one("SELECT * FROM blood_pressure_reading WHERE id=?",input.id());
  });return json.convertValue(result,Reading.class);
 }
 public List<Map<String,Object>> medications(UUID patient,UserView actor){access(patient,actor);return rows("SELECT m.*,coalesce((SELECT jsonb_agg(to_char(s.local_time,'HH24:MI') ORDER BY s.local_time) FROM medication_schedule s WHERE s.plan_id=m.id),'[]'::jsonb) schedules FROM medication_plan m WHERE patient_id=? ORDER BY created_at DESC,id",patient);}
 public Map<String,Object> medication(UUID patient,UUID plan,MedicationInput input,UserView actor){
  professional(actor);access(patient,actor);if(input.endsOn()!=null&&input.endsOn().isBefore(input.startsOn()))throw error(400,"Vigência inválida.");
  try{ZoneId.of(input.timeZone());}catch(Exception e){throw error(400,"Fuso horário inválido.");}
  if(new HashSet<>(input.schedules()).size()!=input.schedules().size())throw error(400,"Horários repetidos.");UUID id=plan==null?UUID.randomUUID():plan;
  if(plan==null)db.update("INSERT INTO medication_plan(id,patient_id,author_id,name,instruction,starts_on,ends_on,time_zone) VALUES(?,?,?,?,?,?,?,?)",id,patient,actor.id(),input.name(),input.instruction(),input.startsOn(),input.endsOn(),input.timeZone());
  else{
   var old=rows("SELECT * FROM medication_plan WHERE id=? AND patient_id=? FOR UPDATE",plan,patient);if(old.isEmpty())throw error(404,"Plano não encontrado.");
   int version=((Number)old.getFirst().get("version")).intValue();if(input.version()==null||input.version()!=version)throw error(409,"Plano alterado. Atualize os dados.");
   var snapshot=medications(patient,actor).stream().filter(m->m.get("id").equals(id.toString())).findFirst().orElseThrow();
   db.update("INSERT INTO medication_plan_history(id,plan_id,version,snapshot,changed_by) VALUES(?,?,?,?::jsonb,?)",UUID.randomUUID(),plan,version,encode(snapshot),actor.id());
   db.update("UPDATE medication_plan SET name=?,instruction=?,starts_on=?,ends_on=?,time_zone=?,version=version+1,author_id=? WHERE id=?",input.name(),input.instruction(),input.startsOn(),input.endsOn(),input.timeZone(),actor.id(),id);
   db.update("DELETE FROM medication_schedule WHERE plan_id=?",id);
  }
  for(String schedule:input.schedules())db.update("INSERT INTO medication_schedule(plan_id,local_time) VALUES(?,?::time)",id,schedule);
  foundation.audit(actor,"MEDICATION_PLAN_SAVED","medication_plan",id);return medications(patient,actor).stream().filter(m->m.get("id").equals(id.toString())).findFirst().orElseThrow();
 }
 public UUID planPatient(UUID plan,UserView actor){UUID patient=db.query("SELECT patient_id FROM medication_plan WHERE id=?",(rs,n)->rs.getObject(1,UUID.class),plan).stream().findFirst().orElseThrow(()->error(404,"Plano não encontrado."));access(patient,actor);return patient;}
 public List<Map<String,Object>> medicationHistory(UUID plan,UserView actor){planPatient(plan,actor);return rows("SELECT version,snapshot,changed_by,changed_at FROM medication_plan_history WHERE plan_id=? ORDER BY version DESC",plan);}
 public List<Map<String,Object>> medicationEvents(UUID patient,LocalDate date,UserView actor){
  List<Map<String,Object>> events=new ArrayList<>();for(var plan:medications(patient,actor)){
   LocalDate start=LocalDate.parse(plan.get("startsOn").toString());Object end=plan.get("endsOn");if(date.isBefore(start)||(end!=null&&date.isAfter(LocalDate.parse(end.toString()))))continue;
   for(Object schedule:(List<?>)plan.get("schedules")){
    Instant at=date.atTime(LocalTime.parse(schedule.toString())).atZone(ZoneId.of(plan.get("timeZone").toString())).toInstant();
    Map<String,Object> event=new LinkedHashMap<>();event.put("planId",plan.get("id"));event.put("name",plan.get("name"));event.put("instruction",plan.get("instruction"));event.put("scheduledAt",at.toString());event.put("status","NO_CONFIRMATION");
    var reports=rows("SELECT status,reported_at,author_id FROM medication_self_report WHERE plan_id=? AND scheduled_at=?",UUID.fromString(plan.get("id").toString()),ts(at));if(!reports.isEmpty())event.putAll(reports.getFirst());events.add(event);
   }
  }events.sort(Comparator.comparing(m->m.get("scheduledAt").toString()));return events;
 }
 public Map<String,Object> report(UUID patient,ReportInput input,UserView actor){
  access(patient,actor);if(!planPatient(input.planId(),actor).equals(patient))throw error(400,"Plano de outro paciente.");time(input.reportedAt());
  var plan=one("SELECT * FROM medication_plan WHERE id=?",input.planId());var zone=ZoneId.of(plan.get("timeZone").toString());var local=input.scheduledAt().atZone(zone);LocalDate day=local.toLocalDate();
  if(day.isBefore(LocalDate.parse(plan.get("startsOn").toString()))||(plan.get("endsOn")!=null&&day.isAfter(LocalDate.parse(plan.get("endsOn").toString())))||db.queryForObject("SELECT count(*) FROM medication_schedule WHERE plan_id=? AND local_time=?::time",Integer.class,input.planId(),local.toLocalTime().toString())!=1)throw error(400,"Horário não pertence ao plano vigente.");
  return idempotent(input.id(),patient,actor,"MEDICATION_REPORT",input,()->{
   db.update("INSERT INTO medication_self_report(id,patient_id,plan_id,author_id,scheduled_at,reported_at,status,source) VALUES(?,?,?,?,?,?,?,?)",input.id(),patient,input.planId(),actor.id(),ts(input.scheduledAt()),ts(input.reportedAt()),input.status(),actor.role()==Role.PATIENT?"SELF_REPORT":"PROFESSIONAL_TRANSCRIPTION");return one("SELECT * FROM medication_self_report WHERE id=?",input.id());
  });
 }
 public Map<String,Object> profile(UUID patient,UserView actor){access(patient,actor);var found=rows("SELECT * FROM physical_activity_profile WHERE patient_id=?",patient);if(found.isEmpty())return null;found.getFirst().put("personalizationStatus","BLOCKED_PENDING_CLINICAL_APPROVAL");return found.getFirst();}
 public Map<String,Object> profile(UUID patient,ActivityProfile input,UserView actor){professional(actor);access(patient,actor);db.update("INSERT INTO physical_activity_profile(patient_id,mobility,balance,restrictions,professional_guidance,author_id) VALUES(?,?,?,?,?,?) ON CONFLICT(patient_id) DO UPDATE SET mobility=excluded.mobility,balance=excluded.balance,restrictions=excluded.restrictions,professional_guidance=excluded.professional_guidance,author_id=excluded.author_id,updated_at=now()",patient,input.mobility(),input.balance(),input.restrictions(),input.professionalGuidance(),actor.id());foundation.audit(actor,"ACTIVITY_PROFILE_SAVED","patient",patient);return profile(patient,actor);}
 public Map<String,Object> activity(UUID patient,ActivityInput input,UserView actor){time(input.occurredAt());return idempotent(input.id(),patient,actor,"ACTIVITY",input,()->{db.update("INSERT INTO activity_record(id,patient_id,author_id,type,duration_minutes,occurred_at,notes,feeling) VALUES(?,?,?,?,?,?,?,?)",input.id(),patient,actor.id(),input.type(),input.durationMinutes(),ts(input.occurredAt()),Objects.toString(input.notes(),""),input.feeling());return one("SELECT * FROM activity_record WHERE id=?",input.id());});}
 public Map<String,Object> diary(UUID patient,DiaryInput input,UserView actor){
  professional(actor);time(input.occurredAt());if((input.systolic()==null)!=(input.diastolic()==null))throw error(400,"Informe os dois valores da pressão.");
  return idempotent(input.id(),patient,actor,"DIARY",input,()->{db.update("INSERT INTO printed_diary_entry(id,patient_id,author_id,occurred_at,systolic,diastolic,pulse,medication_report,notes) VALUES(?,?,?,?,?,?,?,?,?)",input.id(),patient,actor.id(),ts(input.occurredAt()),input.systolic(),input.diastolic(),input.pulse(),Objects.toString(input.medicationReport(),""),Objects.toString(input.notes(),""));
   if(input.systolic()!=null)db.update("INSERT INTO blood_pressure_reading(id,patient_id,author_id,systolic,diastolic,pulse,measured_at,source) VALUES(?,?,?,?,?,?,?,'PRINTED_DIARY')",input.id(),patient,actor.id(),input.systolic(),input.diastolic(),input.pulse(),ts(input.occurredAt()));return one("SELECT * FROM printed_diary_entry WHERE id=?",input.id());});
 }
 public Map<String,Object> consultation(UUID patient,ConsultationInput input,UserView actor){professional(actor);time(input.occurredAt());return idempotent(input.id(),patient,actor,"CONSULTATION",input,()->{db.update("INSERT INTO consultation(id,patient_id,author_id,occurred_at,notes,goals,care_plan) VALUES(?,?,?,?,?,?,?)",input.id(),patient,actor.id(),ts(input.occurredAt()),input.notes(),input.goals(),input.carePlan());return one("SELECT * FROM consultation WHERE id=?",input.id());});}
 public Map<String,Object> device(UUID patient,UserView actor){access(patient,actor);return rows("SELECT * FROM device WHERE patient_id=?",patient).stream().findFirst().orElse(null);}
 public Map<String,Object> device(UUID patient,DeviceInput input,UserView actor){professional(actor);if(!access(patient,actor).modality().equals("BRACELET_DIARY"))throw error(409,"Paciente não está na modalidade pulseira + diário.");db.update("INSERT INTO device(id,patient_id,author_id,label,serial_number) VALUES(?,?,?,?,?) ON CONFLICT(patient_id) DO UPDATE SET label=excluded.label,serial_number=excluded.serial_number,author_id=excluded.author_id",UUID.randomUUID(),patient,actor.id(),input.label(),input.serialNumber());foundation.audit(actor,"DEVICE_SAVED","patient",patient);return device(patient,actor);}
 public List<Map<String,Object>> configurations(UUID patient,UserView actor){access(patient,actor);return rows("SELECT c.* FROM device_configuration c JOIN device d ON d.id=c.device_id WHERE d.patient_id=? ORDER BY c.created_at DESC",patient);}
 public Map<String,Object> configure(UUID patient,DeviceConfigurationInput input,UserView actor){professional(actor);var device=device(patient,actor);if(device==null)throw error(409,"Cadastre a pulseira primeiro.");UUID id=UUID.randomUUID();var adapter=input.adapter().equals("SIMULATED")?BraceletAdapter.developmentSimulator():BraceletAdapter.unavailableHardware();var result=adapter.configure(input.schedules());db.update("INSERT INTO device_configuration(id,device_id,schedules,status,simulated,adapter,message,author_id) VALUES(?,?,?::jsonb,?,?,?,?,?)",id,UUID.fromString(device.get("id").toString()),encode(input.schedules()),result.status(),result.simulated(),input.adapter(),result.message(),actor.id());foundation.audit(actor,"DEVICE_CONFIGURATION_CREATED","device",UUID.fromString(device.get("id").toString()));return one("SELECT * FROM device_configuration WHERE id=?",id);}
 public Map<String,Object> summary(UUID patient,UserView actor){professional(actor);Map<String,Object> out=new LinkedHashMap<>();out.put("patient",access(patient,actor));out.put("generatedAt",Instant.now().toString());out.put("readings",readings(patient,actor,0,20,null,null).items());out.put("medications",medications(patient,actor));for(String[] pair:new String[][]{{"activities","activity_record"},{"diary","printed_diary_entry"},{"consultations","consultation"}})out.put(pair[0],page(pair[1],patient,0,20).items());out.put("functionalProfile",profile(patient,actor));out.put("medicationEvents",medicationEvents(patient,LocalDate.now(ZoneId.of("America/Sao_Paulo")),actor));out.put("meals",rows("SELECT id,occurred_at,notes,analysis_status,assessment FROM meal_photo WHERE patient_id=? ORDER BY occurred_at DESC LIMIT 20",patient));foundation.audit(actor,"CONSULTATION_SUMMARY_VIEWED","patient",patient);return out;}
 public Map<String,Object> export(UUID patient,UserView actor){var result=summary(patient,actor);foundation.audit(actor,"PATIENT_SUMMARY_EXPORTED","patient",patient);return result;}
}

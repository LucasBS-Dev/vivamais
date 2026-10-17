package br.edu.vivamais;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.*;
import java.time.*;
import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest @AutoConfigureMockMvc(print=org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint.NONE) @ActiveProfiles("bootstrap") @TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CareIT {
 static final String PASSWORD=new TokenCodec().issue(),SCHEMA="care_"+UUID.randomUUID().toString().replace("-","");
 static PostgreSQLContainer<?> container;
 @DynamicPropertySource static void db(DynamicPropertyRegistry r){
  if(System.getenv("TEST_DATABASE_URL")!=null){r.add("spring.datasource.url",()->System.getenv("TEST_DATABASE_URL"));r.add("spring.datasource.username",()->System.getenv().getOrDefault("TEST_DATABASE_USER","postgres"));r.add("spring.datasource.password",()->System.getenv().getOrDefault("TEST_DATABASE_PASSWORD","postgres"));}
  else{container=new PostgreSQLContainer<>("postgres:17.9-alpine");container.start();r.add("spring.datasource.url",container::getJdbcUrl);r.add("spring.datasource.username",container::getUsername);r.add("spring.datasource.password",container::getPassword);}
  r.add("app.bootstrap-password",()->PASSWORD);r.add("spring.flyway.default-schema",()->SCHEMA);r.add("spring.datasource.hikari.schema",()->SCHEMA);
  r.add("files.directory",()->System.getProperty("java.io.tmpdir")+"/viva-files-"+SCHEMA);
  r.add("ocr.node-script",()->System.getenv().getOrDefault("TEST_OCR_NODE_SCRIPT",""));
 }
 @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JdbcTemplate jdbc;
 String professional,other,patientToken,admin;UUID patient=DemoBootstrap.id("patient-app-a");
 @BeforeAll void setup()throws Exception{professional=login("profissional.a@demo.vivamais.invalid",PASSWORD);other=login("profissional.b@demo.vivamais.invalid",PASSWORD);patientToken=login("paciente.a@demo.vivamais.invalid",PASSWORD);admin=login("admin.a@demo.vivamais.invalid",PASSWORD);}
 @AfterAll void cleanup(){jdbc.execute("SET search_path TO public");jdbc.execute("DROP SCHEMA "+SCHEMA+" CASCADE");if(container!=null)container.stop();}
 String login(String email,String password)throws Exception{return json.readTree(mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email",email,"password",password)))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("accessToken").asText();}
 JsonNode write(String path,Object body,String token)throws Exception{return json.readTree(mvc.perform(post("/api/v1"+path).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());}
 @Test void administratorManagesAssignmentAndExportRemainsScoped()throws Exception{
  var created=write("/patients",Map.of("displayName","Pessoa vínculo sintético","modality","BRACELET_DIARY"),admin);String id=created.get("patient").get("id").asText();UUID professionalId=DemoBootstrap.id("profissional-a");
  mvc.perform(get("/api/v1/patients/"+id).header("Authorization","Bearer "+professional)).andExpect(status().isForbidden());
  mvc.perform(post("/api/v1/patients/"+id+"/assignments").header("Authorization","Bearer "+admin).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("professionalId",professionalId)))).andExpect(status().isNoContent());
  mvc.perform(get("/api/v1/patients/"+id+"/export").header("Authorization","Bearer "+professional)).andExpect(status().isOk()).andExpect(jsonPath("$.patient.id").value(id)).andExpect(jsonPath("$.meals").isArray()).andExpect(jsonPath("$.medicationEvents").isArray());
  mvc.perform(get("/api/v1/patients/"+id+"/assignments").header("Authorization","Bearer "+professional)).andExpect(status().isForbidden());
  mvc.perform(post("/api/v1/patients/"+id+"/assignments/revoke").header("Authorization","Bearer "+admin).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("professionalId",professionalId)))).andExpect(status().isNoContent());
  mvc.perform(get("/api/v1/patients/"+id+"/export").header("Authorization","Bearer "+professional)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1/patients/"+id+"/export").header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
 }
 @Test void createsPatientActivatesOnceAndProtectsAccess()throws Exception{
  String email="created-"+UUID.randomUUID()+"@demo.invalid";var created=write("/patients",Map.of("displayName","Pessoa de Teste","modality","APP","email",email),professional);String id=created.get("patient").get("id").asText(),code=created.get("activationToken").asText();
  mvc.perform(get("/api/v1/patients/"+id).header("Authorization","Bearer "+professional)).andExpect(status().isOk());
  mvc.perform(get("/api/v1/patients/"+id).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  String body=json.writeValueAsString(Map.of("token",code,"password",PASSWORD));
  mvc.perform(post("/api/v1/auth/activate").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isNoContent());
  mvc.perform(post("/api/v1/auth/activate").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
  String own=login(email,PASSWORD);mvc.perform(get("/api/v1/patients/me").header("Authorization","Bearer "+own)).andExpect(jsonPath("$.id").value(id));
  var reset=write("/patients/"+id+"/access-reset",Map.of("password",PASSWORD),professional);assertThat(reset.get("activationToken").asText()).isNotBlank();
  mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+own)).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/v1/patients").header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content("{\"displayName\":\"Denied\",\"modality\":\"BRACELET_DIARY\"}")).andExpect(status().isForbidden());
 }
 @Test void readingsArePersistentIdempotentAndIsolated()throws Exception{
  UUID id=UUID.randomUUID();String path="/patients/"+patient+"/readings";Map<String,Object> body=new LinkedHashMap<>(Map.of("id",id,"systolic",119,"diastolic",77,"pulse",70,"measuredAt",Instant.now().minusSeconds(120).toString(),"source","MANUAL"));
  var first=write(path,body,patientToken);var retry=write(path,body,patientToken);assertThat(first.get("id")).isEqualTo(retry.get("id"));assertThat(first.get("createdAt").asText()).isNotEqualTo(body.get("measuredAt"));
  mvc.perform(get("/api/v1"+path).header("Authorization","Bearer "+professional)).andExpect(jsonPath("$.items[*].id").value(org.hamcrest.Matchers.hasItem(id.toString())));
  mvc.perform(get("/api/v1"+path).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  body.put("systolic",120);mvc.perform(post("/api/v1"+path).header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isConflict());
  body.put("id",UUID.randomUUID());body.put("source","PROFESSIONAL");mvc.perform(post("/api/v1"+path).header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isForbidden());
 }
 @Test void medicationsVersionsReportsAndDiaryAreReal()throws Exception{
  String path="/patients/"+patient;String day=LocalDate.now(ZoneId.of("America/Sao_Paulo")).toString();Map<String,Object> plan=new LinkedHashMap<>(Map.of("name","Medicamento de teste","instruction","Instrução sintética cadastrada pelo profissional","startsOn",day,"timeZone","America/Sao_Paulo","schedules",List.of("08:00","20:00")));
  var medication=write(path+"/medications",plan,professional);String id=medication.get("id").asText();
  var events=json.readTree(mvc.perform(get("/api/v1"+path+"/medication-events?date="+day).header("Authorization","Bearer "+patientToken)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());assertThat(events.get(0).get("status").asText()).isEqualTo("NO_CONFIRMATION");
  Map<String,Object> report=Map.of("id",UUID.randomUUID(),"planId",id,"scheduledAt",events.get(0).get("scheduledAt").asText(),"status","TAKEN","reportedAt",Instant.now().toString());assertThat(write(path+"/medication-reports",report,patientToken).get("source").asText()).isEqualTo("SELF_REPORT");write(path+"/medication-reports",report,patientToken);
  plan.put("version",1);plan.put("instruction","Instrução sintética revisada");mvc.perform(put("/api/v1/medications/"+id).header("Authorization","Bearer "+professional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(plan))).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(2));
  mvc.perform(put("/api/v1/medications/"+id).header("Authorization","Bearer "+professional).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(plan))).andExpect(status().isConflict());
  var diary=write(path+"/diary",Map.of("id",UUID.randomUUID(),"occurredAt",Instant.now().minusSeconds(3600).toString(),"systolic",122,"diastolic",78,"medicationReport","Sem confirmação no diário","notes","Transcrição sintética"),professional);assertThat(diary.get("source").asText()).isEqualTo("PRINTED_DIARY");
 }
 @Test void consultationActivityAndBraceletSimulationDoNotPretendHardware()throws Exception{
  String path="/patients/"+patient;write(path+"/activities",Map.of("id",UUID.randomUUID(),"type","Atividade informada pela pessoa","durationMinutes",5,"occurredAt",Instant.now().toString(),"feeling","WELL","notes","Sem recomendação gerada"),patientToken);
  write(path+"/consultations",Map.of("id",UUID.randomUUID(),"occurredAt",Instant.now().toString(),"notes","Consulta sintética","goals","Objetivo informado","carePlan","Plano do profissional"),professional);
  mvc.perform(get("/api/v1"+path+"/summary").header("Authorization","Bearer "+professional)).andExpect(status().isOk()).andExpect(jsonPath("$.consultations.length()").value(1));
  String diary="/patients/"+DemoBootstrap.id("patient-diary-a");write(diary+"/device",Map.of("label","Pulseira de teste"),professional);var config=write(diary+"/device/configurations",Map.of("schedules",List.of("08:00"),"adapter","SIMULATED"),professional);assertThat(config.get("simulated").asBoolean()).isTrue();assertThat(config.get("message").asText()).contains("SIMULADO");var real=write(diary+"/device/configurations",Map.of("schedules",List.of("08:00"),"adapter","HARDWARE"),professional);assertThat(real.get("status").asText()).isEqualTo("UNSUPPORTED");
 }
 byte[] photo()throws Exception{var image=new java.awt.image.BufferedImage(760,440,java.awt.image.BufferedImage.TYPE_INT_RGB);var g=image.createGraphics();g.setColor(java.awt.Color.WHITE);g.fillRect(0,0,760,440);g.setColor(java.awt.Color.BLACK);g.setFont(new java.awt.Font("SansSerif",java.awt.Font.PLAIN,70));g.drawString("SYS 118",40,100);g.drawString("DIA 76",40,230);g.drawString("PULSE 71",40,360);g.dispose();var out=new java.io.ByteArrayOutputStream();javax.imageio.ImageIO.write(image,"png",out);return out.toByteArray();}
 JsonNode upload(String purpose,String token,byte[] data)throws Exception{return json.readTree(mvc.perform(multipart("/api/v1/patients/"+patient+"/files").file(new org.springframework.mock.web.MockMultipartFile("file","synthetic.png","image/png",data)).param("purpose",purpose).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());}
 @Test void photosAreEncryptedPrivateScopedAndLinksExpireWithSession()throws Exception{
  String token=login("paciente.a@demo.vivamais.invalid",PASSWORD);var file=upload("MEAL",token,photo());String id=file.get("id").asText();
  var stored=java.nio.file.Files.readAllBytes(java.nio.file.Path.of(System.getProperty("java.io.tmpdir"),"viva-files-"+SCHEMA,id+".bin"));assertThat(stored[0]).isNotEqualTo((byte)0x89);
  mvc.perform(post("/api/v1/files/"+id+"/link").header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
  var link=write("/files/"+id+"/link",Map.of(),token);String path=link.get("path").asText();
  mvc.perform(get(path)).andExpect(status().isOk()).andExpect(content().contentType("image/png")).andExpect(header().string("Cache-Control","private, no-store"));
  write("/patients/"+patient+"/meals",Map.of("fileId",id,"occurredAt",Instant.now().toString(),"notes","Foto sintética"),token);
  var meals=json.readTree(mvc.perform(get("/api/v1/patients/"+patient+"/meals").header("Authorization","Bearer "+professional)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
  var unavailable=write("/meals/"+meals.get("items").get(0).get("id").asText()+"/analyze",Map.of(),token);assertThat(unavailable.get("providerCalled").asBoolean()).isFalse();assertThat(unavailable.get("status").asText()).isEqualTo("UNAVAILABLE");
  mvc.perform(post("/api/v1/auth/logout").header("Authorization","Bearer "+token)).andExpect(status().isNoContent());mvc.perform(get(path)).andExpect(status().isForbidden());
  mvc.perform(multipart("/api/v1/patients/"+patient+"/files").file(new org.springframework.mock.web.MockMultipartFile("file","malicious.svg","image/svg+xml","<svg><script>bad</script></svg>".getBytes())).param("purpose","MEAL").header("Authorization","Bearer "+patientToken)).andExpect(status().isUnsupportedMediaType());
 }
 @Test void realOcrRequiresExplicitConfirmationBeforeAnyReadingIsInserted()throws Exception{
  Assumptions.assumeTrue(System.getenv("TEST_OCR_NODE_SCRIPT")!=null||"true".equals(System.getenv("TEST_NATIVE_OCR")),"Real Tesseract runtime required");
  var file=upload("PRESSURE_DISPLAY",patientToken,photo());var result=write("/files/"+file.get("id").asText()+"/ocr",Map.of(),patientToken);assertThat(result.get("status").asText()).isEqualTo("RECOGNIZED");assertThat(result.get("systolic").asInt()).isEqualTo(118);assertThat(result.get("diastolic").asInt()).isEqualTo(76);assertThat(result.get("pulse").asInt()).isEqualTo(71);
  String document=result.get("id").asText();assertThat(jdbc.queryForObject("SELECT count(*) FROM blood_pressure_reading WHERE ocr_document_id=?",Integer.class,UUID.fromString(document))).isZero();
  Map<String,Object> input=new LinkedHashMap<>(Map.of("id",UUID.randomUUID(),"systolic",118,"diastolic",76,"pulse",71,"measuredAt",Instant.now().toString(),"source","OCR_CONFIRMED","ocrDocumentId",document,"ocrConfirmed",false));
  mvc.perform(post("/api/v1/patients/"+patient+"/readings").header("Authorization","Bearer "+patientToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(input))).andExpect(status().isBadRequest());input.put("ocrConfirmed",true);write("/patients/"+patient+"/readings",input,patientToken);assertThat(jdbc.queryForObject("SELECT count(*) FROM blood_pressure_reading WHERE ocr_document_id=?",Integer.class,UUID.fromString(document))).isEqualTo(1);
 }
}

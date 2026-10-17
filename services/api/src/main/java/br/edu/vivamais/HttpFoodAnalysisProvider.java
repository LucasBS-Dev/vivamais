package br.edu.vivamais;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import com.fasterxml.jackson.databind.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Optional institution-approved image service. No provider call occurs while approval/config is absent. */
@Component
public class HttpFoodAnalysisProvider implements FoodAnalysisProvider {
 private final String endpoint,key,criteria,approval;private final boolean enabled;private final ObjectMapper json;
 private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NEVER).build();
 public HttpFoodAnalysisProvider(@Value("${food.analysis-enabled:false}")boolean enabled,@Value("${food.endpoint:}")String endpoint,@Value("${food.api-key:}")String key,@Value("${food.approved-criteria:}")String criteria,@Value("${food.approval-reference:}")String approval,ObjectMapper json){this.enabled=enabled;this.endpoint=endpoint;this.key=key;this.criteria=criteria;this.approval=approval;this.json=json;}
 @Override public boolean enabled(){return enabled&&endpoint.startsWith("https://")&&!key.isBlank()&&!criteria.isBlank()&&!approval.isBlank();}
 @Override public Map<String,Object> assess(byte[] image)throws Exception{
  if(!enabled())throw CareService.error(503,"Análise automatizada indisponível.");
  String payload=json.writeValueAsString(Map.of("imageBase64",Base64.getEncoder().encodeToString(image),"mimeType","image/png","criteria",criteria,"approvalReference",approval,"restrictions",List.of("educational-only","no-diagnosis","no-nutrient-quantity","reject-inadequate-image","explain-uncertainty")));
  var request=HttpRequest.newBuilder(URI.create(endpoint)).timeout(Duration.ofSeconds(15)).header("Authorization","Bearer "+key).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(payload)).build();
  var response=client.send(request,HttpResponse.BodyHandlers.ofInputStream());byte[] bytes;try(var body=response.body()){bytes=body.readNBytes(16385);}
  if(response.statusCode()!=200||bytes.length>16384)throw CareService.error(503,"Análise automatizada indisponível.");JsonNode data=json.readTree(bytes);
  String status=data.path("status").asText(),light=data.path("trafficLight").asText();
  if(!Set.of("ASSESSED","UNCERTAIN","REJECTED").contains(status)||!data.path("explanation").isTextual()||data.path("explanation").asText().length()>2000||!data.path("limitations").isTextual()||!data.path("identifiedFoods").isArray()||data.path("identifiedFoods").size()>30)throw CareService.error(503,"Resposta educativa inválida.");
  if(status.equals("ASSESSED")&&!Set.of("GREEN","YELLOW","RED").contains(light))throw CareService.error(503,"Resposta educativa inválida.");
  if(data.toString().matches("(?is).*\\b(?:mg|kcal|s[oó]dio\\s*[:=]\\s*[0-9])\\b.*"))throw CareService.error(503,"Resposta requer revisão profissional.");
  Map<String,Object> result=new LinkedHashMap<>();result.put("status",status);result.put("trafficLight",status.equals("ASSESSED")?light:null);result.put("explanation",data.path("explanation").asText());result.put("limitations",data.path("limitations").asText());result.put("identifiedFoods",json.convertValue(data.path("identifiedFoods"),List.class));result.put("providerCalled",true);result.put("approvalReference",approval);return result;
 }
}

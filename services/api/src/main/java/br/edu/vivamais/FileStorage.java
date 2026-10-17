package br.edu.vivamais;

import java.nio.file.*;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import javax.crypto.*;
import javax.crypto.spec.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Ciphertext only, in either a private local directory or a private Supabase bucket. */
@Component
public class FileStorage {
 private final Path directory;private final byte[] key;private final String backend,url,bucket,serviceKey;
 private final HttpClient http=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).followRedirects(HttpClient.Redirect.NEVER).build();
 public FileStorage(@Value("${files.directory:${user.dir}/.local/private-files}") String directory,@Value("${files.encryption-key:}") String keyValue,@Value("${files.backend:local}") String backend,@Value("${files.supabase-url:}") String url,@Value("${files.bucket:viva-private}") String bucket,@Value("${files.service-key:}") String serviceKey)throws Exception{
  this.directory=Path.of(directory).toAbsolutePath().normalize();this.backend=backend;this.url=url;this.bucket=bucket;this.serviceKey=serviceKey;
  if(!backend.equals("local")&&!backend.equals("supabase"))throw new IllegalStateException("Unknown private storage backend");
  if(backend.equals("supabase")&&(!url.startsWith("https://")||serviceKey.isBlank()||keyValue.isBlank()||!bucket.matches("[a-zA-Z0-9_-]+")))throw new IllegalStateException("Supabase private storage configuration incomplete");
  Files.createDirectories(this.directory);
  if(keyValue.isBlank()){
   Path secret=this.directory.resolve(".encryption-key");if(!Files.exists(secret)){byte[] generated=new byte[32];new java.security.SecureRandom().nextBytes(generated);try{Files.writeString(secret,Base64.getEncoder().encodeToString(generated),StandardOpenOption.CREATE_NEW);}catch(FileAlreadyExistsException ignored){}}
   keyValue=Files.readString(secret).trim();
  }
  key=Base64.getDecoder().decode(keyValue);if(key.length!=32)throw new IllegalStateException("File encryption key must have 32 bytes");
 }
 private byte[] encrypt(byte[] data)throws Exception{byte[] iv=new byte[12];new java.security.SecureRandom().nextBytes(iv);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));byte[] encrypted=c.doFinal(data);byte[] result=Arrays.copyOf(iv,iv.length+encrypted.length);System.arraycopy(encrypted,0,result,iv.length,encrypted.length);return result;}
 private byte[] decrypt(byte[] data)throws Exception{if(data.length<28)throw new IllegalStateException("Invalid encrypted object");Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,Arrays.copyOf(data,12)));return c.doFinal(Arrays.copyOfRange(data,12,data.length));}
 private String safe(String object){if(!object.matches("[a-f0-9-]{36}\\.bin"))throw new IllegalArgumentException("Invalid object key");return object;}
 private HttpRequest.Builder request(String object){return HttpRequest.newBuilder(URI.create(url.replaceAll("/$","")+"/storage/v1/object/"+bucket+"/"+safe(object))).timeout(Duration.ofSeconds(15)).header("Authorization","Bearer "+serviceKey).header("apikey",serviceKey);}
 public void put(String object,byte[] image)throws Exception{byte[] data=encrypt(image);if(backend.equals("local"))Files.write(directory.resolve(safe(object)),data,StandardOpenOption.CREATE_NEW);else{var r=http.send(request(object).header("Content-Type","application/octet-stream").POST(HttpRequest.BodyPublishers.ofByteArray(data)).build(),HttpResponse.BodyHandlers.discarding());if(r.statusCode()!=200&&r.statusCode()!=201)throw new IllegalStateException("Private object storage unavailable");}}
 public byte[] get(String object)throws Exception{byte[] data;if(backend.equals("local")){try(var in=Files.newInputStream(directory.resolve(safe(object)))){data=in.readNBytes(2097181);}}else{var r=http.send(request(object).GET().build(),HttpResponse.BodyHandlers.ofInputStream());try(var in=r.body()){if(r.statusCode()!=200)throw new IllegalStateException("Private object storage unavailable");data=in.readNBytes(2097181);}}if(data.length>2097180)throw new IllegalStateException("Stored object exceeds limit");return decrypt(data);}
 public void delete(String object)throws Exception{if(backend.equals("local"))Files.deleteIfExists(directory.resolve(safe(object)));else http.send(request(object).DELETE().build(),HttpResponse.BodyHandlers.discarding());}
}

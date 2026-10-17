package br.edu.vivamais;
import java.nio.file.*;
import java.util.concurrent.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class TesseractOcrProvider implements OcrProvider {
 private final String command,script,node;private final Semaphore slot=new Semaphore(1);
 public TesseractOcrProvider(@Value("${ocr.command:tesseract}") String command,@Value("${ocr.node-script:}") String script,@Value("${ocr.node:node}") String node){this.command=command;this.script=script;this.node=node;}
 @Override public String recognize(Path image)throws Exception{
  if(!slot.tryAcquire())throw CareService.error(429,"OCR ocupado. Tente novamente em instantes.");
  Path out=Files.createTempFile("viva-ocr-output-",".txt");Process process=null;
  try{
   ProcessBuilder pb=script.isBlank()?new ProcessBuilder(command,image.toString(),"stdout","-l","eng","--psm","6"):new ProcessBuilder(node,script,image.toString());
   pb.redirectOutput(out.toFile());pb.redirectError(ProcessBuilder.Redirect.DISCARD);process=pb.start();
   if(!process.waitFor(30,TimeUnit.SECONDS)){process.destroyForcibly();throw CareService.error(503,"OCR demorou demais. Digite os valores ou tente outra foto.");}
   if(process.exitValue()!=0||Files.size(out)>16384)throw CareService.error(503,"OCR indisponível neste ambiente.");return Files.readString(out);
  }finally{if(process!=null&&process.isAlive())process.destroyForcibly();Files.deleteIfExists(out);slot.release();}
 }
}

package br.edu.vivamais;
import java.util.Map;
public interface FoodAnalysisProvider {
 boolean enabled();
 Map<String,Object> assess(byte[] privateImage) throws Exception;
}

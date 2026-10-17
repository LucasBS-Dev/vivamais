package br.edu.vivamais;
import java.nio.file.Path;
public interface OcrProvider { String recognize(Path image) throws Exception; }

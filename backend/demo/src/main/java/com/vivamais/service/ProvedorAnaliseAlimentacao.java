package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;
import java.util.Map;
public interface ProvedorAnaliseAlimentacao {
 boolean enabled();
 Map<String,Object> assess(byte[] privateImage) throws Exception;
}

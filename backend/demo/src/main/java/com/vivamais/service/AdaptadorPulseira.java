package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import java.util.List;

/** Integration port. Only a tested device protocol can provide a real hardware implementation. */
public interface AdaptadorPulseira {
    record Resultado(String status,@com.fasterxml.jackson.annotation.JsonProperty("simulated")  boolean simulado, String message) { }
    Resultado configurar(List<String> horarios);

    static AdaptadorPulseira developmentSimulator() {
        return horarios -> new Resultado("SYNCED", true,
            "SIMULADO: configuração exercitada apenas no adaptador de desenvolvimento. Nenhum hardware foi sincronizado.");
    }

    static AdaptadorPulseira unavailableHardware() {
        return horarios -> new Resultado("UNSUPPORTED", false,
            "Hardware indisponível: fabricante, firmware, protocolo e teste físico pendentes.");
    }
}

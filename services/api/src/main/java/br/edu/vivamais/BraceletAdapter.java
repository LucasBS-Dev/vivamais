package br.edu.vivamais;

import java.util.List;

/** Integration port. Only a tested device protocol can provide a real hardware implementation. */
public interface BraceletAdapter {
    record Result(String status, boolean simulated, String message) { }
    Result configure(List<String> schedules);

    static BraceletAdapter developmentSimulator() {
        return schedules -> new Result("SYNCED", true,
            "SIMULADO: configuração exercitada apenas no adaptador de desenvolvimento. Nenhum hardware foi sincronizado.");
    }

    static BraceletAdapter unavailableHardware() {
        return schedules -> new Result("UNSUPPORTED", false,
            "Hardware indisponível: fabricante, firmware, protocolo e teste físico pendentes.");
    }
}

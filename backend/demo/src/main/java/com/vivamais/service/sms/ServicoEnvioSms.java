package com.vivamais.service.sms;

import java.time.Instant;
import java.util.UUID;

/** Porta de envio. Aceitação pelo provedor não comprova entrega ou identidade. */
public interface ServicoEnvioSms {
    record Mensagem(UUID idEnvio,String destino,String codigo,Instant expiraEm) {
        @Override public String toString() { return "MensagemSms[conteudo protegido]"; }
    }
    record Resultado(String estado,String referencia) {}
    String provedor();
    default boolean disponivel() { return true; }
    Resultado enviar(Mensagem mensagem);
    default Resultado consultar(String referencia) { return null; }
    final class Falha extends RuntimeException {
        private final String estado;
        public Falha(String estado) { super("Serviço SMS indisponível.");this.estado=estado; }
        public String estado() { return estado; }
    }
}

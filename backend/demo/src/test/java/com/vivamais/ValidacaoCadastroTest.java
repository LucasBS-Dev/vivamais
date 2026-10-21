package com.vivamais;

import static org.assertj.core.api.Assertions.*;
import com.vivamais.service.DadosPessoaisService;
import org.junit.jupiter.api.Test;

class ValidacaoCadastroTest {
    @Test void cpfSinteticoNormalizado(){String cpf=ApoioAcessoPaciente.gerarCpf();assertThat(DadosPessoaisService.normalizarCpf(cpf)).isEqualTo(cpf);String mascara=cpf.substring(0,3)+"."+cpf.substring(3,6)+"."+cpf.substring(6,9)+"-"+cpf.substring(9);assertThat(DadosPessoaisService.normalizarCpf(mascara)).isEqualTo(cpf);}
    @Test void cpfRejeitaSequenciasComprimentoEDigito(){for(String cpf:java.util.List.of("00000000000","11111111111","123","12345678901","123.45.6789-01"))assertThatThrownBy(()->DadosPessoaisService.normalizarCpf(cpf)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);}
    @Test void celularNormalizaE164SemConfundirDdd55(){String celular=ApoioAcessoPaciente.gerarTelefone();assertThat(DadosPessoaisService.normalizarTelefone(celular.substring(3))).isEqualTo(celular);assertThat(DadosPessoaisService.normalizarTelefone("(55) 9"+"2".repeat(8))).isEqualTo("+55559"+"2".repeat(8));}
    @Test void celularRejeitaDddInexistenteFixoEOutroPais(){for(String numero:java.util.List.of("(23) 9"+"1".repeat(8),"(11) 3"+"1".repeat(7),"+1"+"1".repeat(11),"119"+"1".repeat(7),"abc"))assertThatThrownBy(()->DadosPessoaisService.normalizarTelefone(numero)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);}
}

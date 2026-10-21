package com.vivamais.service;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.dto.ModelosCuidado.*;
import static com.vivamais.service.CuidadoService.error;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;
import java.util.UUID;
import java.util.Objects;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vivamais.repositories.InstituicaoRepository;

@Service
@Transactional
public class DadosPessoaisService {
    private final JdbcTemplate banco;
    private final CuidadoService cuidados;
    private final InstituicaoRepository instituicoes;
    private final AcessoPacienteService acesso;
    public DadosPessoaisService(JdbcTemplate banco, CuidadoService cuidados, InstituicaoRepository instituicoes,AcessoPacienteService acesso) {
        this.banco=banco; this.cuidados=cuidados; this.instituicoes=instituicoes;this.acesso=acesso;
    }
    public static String textoOpcional(String valor) { return valor==null || valor.isBlank() ? null : valor.trim(); }
    public static String normalizarCpf(String valor) {
        valor=textoOpcional(valor);
        if(valor==null) return null;
        if(!valor.matches("(?:[0-9]{11}|[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2})")) throw error(400,"Confira o CPF informado.");
        String numeros=valor.replaceAll("[^0-9]", "");
        if(numeros.length()!=11 || numeros.chars().distinct().count()==1) throw error(400,"Confira o CPF informado.");
        for(int posicao=9;posicao<11;posicao++) {
            int soma=0;
            for(int indice=0;indice<posicao;indice++) soma+=(numeros.charAt(indice)-'0')*(posicao+1-indice);
            int digito=(soma*10)%11; if(digito==10) digito=0;
            if(digito!=numeros.charAt(posicao)-'0') throw error(400,"Confira o CPF informado.");
        }
        return numeros;
    }
    public static String normalizarTelefone(String valor) {
        valor=textoOpcional(valor); if(valor==null) return null;
        if(!valor.matches("\\+?[0-9()\\- ]+") || (valor.startsWith("+") && !valor.startsWith("+55"))) throw error(400,"Informe um celular brasileiro com DDD.");
        String numeros=valor.replaceAll("[^0-9]", "");
        if(numeros.startsWith("55") && numeros.length()==13) numeros=numeros.substring(2);
        var ddds=Set.of("11","12","13","14","15","16","17","18","19","21","22","24","27","28","31","32","33","34","35","37","38","41","42","43","44","45","46","47","48","49","51","53","54","55","61","62","63","64","65","66","67","68","69","71","73","74","75","77","79","81","82","83","84","85","86","87","88","89","91","92","93","94","95","96","97","98","99");
        if(!numeros.matches("[0-9]{2}9[0-9]{8}") || !ddds.contains(numeros.substring(0,2))) throw error(400,"Informe um celular válido com DDD e nove números, começando por 9.");
        return "+55"+numeros;
    }
    public static void validarNascimento(LocalDate nascimento) {
        if(nascimento!=null && (nascimento.isBefore(LocalDate.of(1900,1,1)) || nascimento.isAfter(LocalDate.now(ZoneId.of("America/Sao_Paulo")))))
            throw error(400,"Confira a data de nascimento.");
    }
    public static String validarSexo(String sexo) {
        sexo=textoOpcional(sexo);
        if(sexo!=null && !Set.of("FEMININO","MASCULINO","INTERSEXO","NAO_INFORMADO").contains(sexo)) throw error(400,"Confira o campo sexo.");
        return sexo;
    }
    public DadosPessoaisPaciente buscar(UUID paciente, Usuario ator) {
        cuidados.autorizarPaciente(paciente,ator);
        var dados=banco.queryForObject("SELECT * FROM patient WHERE id=?", (linha,indice)->new DadosPessoaisPaciente(paciente,linha.getString("display_name"),linha.getString("cpf"),linha.getObject("data_nascimento",LocalDate.class),linha.getString("email_contato"),linha.getString("telefone"),linha.getString("sexo"),linha.getString("endereco"),linha.getInt("versao_dados")), paciente);
        instituicoes.auditar(ator,"DADOS_PESSOAIS_CONSULTADOS","patient",paciente);
        return dados;
    }
    public DadosPessoaisPaciente atualizar(UUID paciente, AtualizacaoDadosPessoais entrada, Usuario ator) {
        cuidados.exigirProfissional(ator); cuidados.autorizarPaciente(paciente,ator);
        if(entrada.nomeCompleto().trim().isBlank()) throw error(400,"Informe o nome completo.");
        validarNascimento(entrada.dataNascimento());
        var anterior=banco.queryForMap("SELECT cpf,data_nascimento,user_account_id,telefone FROM patient WHERE id=? FOR UPDATE",paciente);
        String telefoneAnterior=(String)anterior.get("telefone"),telefone=textoOpcional(entrada.telefone());
        boolean telefoneAlterado=!Objects.equals(telefoneAnterior,telefone);
        if(telefoneAlterado) {
            telefone=normalizarTelefone(telefone);
            // Não tratar a mera reformatação de um número legado como troca de titular.
            String antigoNormalizado=null;
            try { antigoNormalizado=normalizarTelefone(telefoneAnterior); } catch(org.springframework.web.server.ResponseStatusException invalido) { /* Cadastro legado preservado até regularização. */ }
            telefoneAlterado=!Objects.equals(antigoNormalizado,telefone);
        }
        if(telefoneAlterado) {
            if(telefone==null) throw error(400,"Informe um celular válido antes de alterar o telefone.");
            acesso.confirmarAlteracaoTelefone(entrada.senhaProfissional(),entrada.identidadeConferida(),ator);
        }
        int alterados=banco.update("UPDATE patient SET display_name=?,cpf=?,data_nascimento=?,email_contato=?,telefone=?,sexo=?,endereco=?,versao_dados=versao_dados+1 WHERE id=? AND versao_dados=?",
            entrada.nomeCompleto().trim(),normalizarCpf(entrada.cpf()),entrada.dataNascimento(),textoOpcional(entrada.emailContato()),telefone,validarSexo(entrada.sexo()),textoOpcional(entrada.endereco()),paciente,entrada.versao());
        if(alterados!=1) throw error(409,"Os dados foram alterados. Atualize antes de salvar novamente.");
        LocalDate nascimentoAnterior=anterior.get("data_nascimento")==null?null:((java.sql.Date)anterior.get("data_nascimento")).toLocalDate();
        if(telefoneAlterado) banco.update("UPDATE patient SET telefone_confirmado_em=NULL,versao_telefone=versao_telefone+1 WHERE id=?",paciente);
        if(telefoneAlterado || !Objects.equals(anterior.get("cpf"),normalizarCpf(entrada.cpf())) || !Objects.equals(nascimentoAnterior,entrada.dataNascimento())) {
            Object usuario=anterior.get("user_account_id");
            banco.update("UPDATE dispositivo_acesso_paciente SET revogado_em=now(),manter_sessao=false WHERE id_usuario=? AND revogado_em IS NULL",usuario);
            banco.update("UPDATE auth_session SET revoked_at=now() WHERE user_account_id=? AND revoked_at IS NULL",usuario);
            banco.update("UPDATE codigo_ativacao_paciente SET utilizado_em=now() WHERE id_paciente=? AND utilizado_em IS NULL",paciente);
            banco.update("UPDATE desafio_acesso_paciente SET utilizado_em=now() WHERE id_paciente=? AND utilizado_em IS NULL",paciente);
        }
        banco.update("UPDATE user_account SET display_name=? WHERE id=(SELECT user_account_id FROM patient WHERE id=?)",entrada.nomeCompleto().trim(),paciente);
        instituicoes.auditar(ator,"DADOS_PESSOAIS_ATUALIZADOS","patient",paciente);
        if(telefoneAlterado) instituicoes.auditar(ator,"TELEFONE_AUTENTICACAO_ALTERADO","patient",paciente);
        return buscar(paciente,ator);
    }
    public DadosPessoaisPaciente atualizarContato(UUID paciente, AtualizacaoContatoPaciente entrada, Usuario ator) {
        cuidados.autorizarPaciente(paciente,ator);
        if(ator.papel()!=Papel.PATIENT) throw error(403,"Use a edição profissional do cadastro.");
        throw error(403,"Para alterar o celular de ativação, procure sua equipe. A confirmação profissional protege seu acesso.");
    }
}

import Link from "next/link";
import { DocumentoPublico } from "@/components/DocumentoPublico";
export default function Privacidade() {
  return (
    <DocumentoPublico title="Privacidade">
      <div className="notice">
        <p>
          As informações institucionais sobre responsável pelo tratamento, bases
          legais, retenção e atendimento aos titulares aguardam revisão. Este
          texto descreve o funcionamento atual e não constitui uma política
          institucional aprovada.
        </p>
      </div>
      <h2>Informações utilizadas</h2>
      <p>
        O Viva+ utiliza dados da conta, cadastro do paciente, vínculos com
        profissionais, medições de pressão, planos e autorrelatos de
        medicamentos, refeições, atividades e consultas. CPF e outros dados
        cadastrais adicionais são opcionais. Preferências de visualização ficam
        associadas à conta.
      </p>
      <h2>Proteção e acesso</h2>
      <p>
        O acesso exige identificação e permissão para cada paciente, conforme a
        unidade e o vínculo profissional. Fotos são privadas e armazenadas com
        criptografia. Ações relevantes de acesso e alteração ficam registradas
        para auditoria.
      </p>
      <h2>Sessões e dispositivos</h2>
      <p>
        O portal utiliza um cookie protegido de sessão. No aplicativo pelo
        navegador, a sessão e os registros aguardando envio permanecem em
        memória; fechar ou recarregar a página exige novo acesso e pode perder
        envios pendentes. A versão nativa possui armazenamento protegido, cuja
        validação em aparelhos ainda está pendente.
      </p>
      <h2>Fotos e orientações</h2>
      <p>
        A leitura de foto do visor exige sua conferência antes de salvar a
        pressão. O registro de refeições funciona; a análise alimentar
        automatizada e orientações personalizadas de exercícios permanecem
        indisponíveis sem serviço, conteúdo e critérios aprovados. Não são
        produzidos diagnósticos automáticos.
      </p>
      <h2>Ambiente e serviços</h2>
      <p>
        A execução local utiliza exclusivamente informações fictícias. A
        implantação externa, os fornecedores, as regiões e os contratos de
        tratamento ainda precisam de definição institucional antes de receber
        dados reais.
      </p>
      <h2>Acesso, correção e exclusão</h2>
      <p>
        O procedimento institucional e os prazos de atendimento ainda precisam
        ser definidos. Não há exclusão automática de registros clínicos.
        Consulte <Link href="/exclusao-de-conta">exclusão de conta</Link> e{" "}
        <Link href="/suporte">ajuda e suporte</Link>.
      </p>
    </DocumentoPublico>
  );
}

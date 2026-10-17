import Link from "next/link";
import { DocumentoPublico } from "@/components/DocumentoPublico";

export default function PrivacyPage() {
  return (
    <DocumentoPublico title="Privacidade">
      <div className="notice">
        <p>
          Texto preliminar para a demonstração. A instituição responsável, as
          bases legais, os prazos de retenção e o canal de contato precisam de
          revisão e aprovação antes de uso real e publicação nas lojas.
        </p>
      </div>
      <h2>Uso acadêmico com dados sintéticos</h2>
      <p>
        Esta versão do Viva+ / Pulso em Dia deve ser utilizada exclusivamente
        com contas e informações fictícias. Não informe dados de pacientes
        reais.
      </p>
      <h2>Informações da fundação</h2>
      <p>
        A fundação utiliza identificação da conta, e-mail, organização, papel de
        acesso, vínculos profissionais e identificação sintética dos pacientes.
        A API registra eventos de acesso e mantém sessões com prazo de validade.
        O navegador recebe um cookie de sessão protegido contra leitura por
        JavaScript.
      </p>
      <h2>Quem pode acessar</h2>
      <p>
        O acesso depende de autenticação e autorização pela API, considerando
        organização e vínculo com o paciente. Credenciais de banco de dados e
        tokens da API não são disponibilizados no código enviado ao navegador.
      </p>
      <h2>Serviços e próximas fases</h2>
      <p>
        A arquitetura de demonstração prevê Vercel para web, Railway para API e
        Supabase para PostgreSQL. A implantação, as regiões, os contratos e as
        transferências de dados devem ser registrados pela instituição antes da
        publicação. Fotos, análise por IA e recomendações personalizadas não
        estão habilitadas nesta fundação.
      </p>
      <h2>Seus direitos e retenção</h2>
      <p>
        O procedimento institucional para acesso, correção, exclusão e retenção
        ainda precisa ser definido. Não há exclusão automática de registros
        clínicos. Consulte as orientações de{" "}
        <Link href="/exclusao-de-conta">exclusão de conta</Link> e{" "}
        <Link href="/suporte">suporte</Link>.
      </p>
    </DocumentoPublico>
  );
}

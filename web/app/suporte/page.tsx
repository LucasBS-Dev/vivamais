import { DocumentoPublico } from "@/components/DocumentoPublico";

export default function SupportPage() {
  return (
    <DocumentoPublico title="Ajuda e suporte">
      <h2>Acesso à demonstração</h2>
      <p>
        As contas são individuais e fornecidas pela pessoa responsável pela
        demonstração acadêmica. Não há cadastro público de profissionais nesta
        fase.
      </p>
      <h2>Esqueceu a senha?</h2>
      <p>
        Procure a equipe que forneceu sua conta, utilizando o contato
        institucional já conhecido. A recuperação automática de acesso ainda não
        está disponível. Nunca envie sua senha por mensagem.
      </p>
      <h2>Falha ao carregar informações</h2>
      <p>
        Confira sua conexão e tente novamente. A equipe técnica deve verificar a
        disponibilidade da API e do banco de demonstração, que pode pausar após
        inatividade no plano gratuito.
      </p>
      <h2>Canal institucional pendente</h2>
      <p>
        O e-mail ou endereço de atendimento precisa ser informado e validado
        pela instituição antes da divulgação pública e da submissão às lojas.
        Esta página não possui envio de mensagens.
      </p>
      <div className="notice">
        <p>
          O Viva+ apoia a organização do acompanhamento. Esta demonstração não
          oferece diagnóstico, atendimento de urgência nem monitoramento em
          tempo real.
        </p>
      </div>
    </DocumentoPublico>
  );
}

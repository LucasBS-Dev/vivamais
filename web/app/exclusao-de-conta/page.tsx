import Link from "next/link";
import { DocumentoPublico } from "@/components/DocumentoPublico";

export default function AccountDeletionPage() {
  return (
    <DocumentoPublico title="Exclusão de conta e dados">
      <div className="notice">
        <p>
          O fluxo institucional de solicitação de exclusão está pendente. Esta
          página é um rascunho e não envia nem registra solicitações.
        </p>
      </div>
      <h2>Durante a demonstração</h2>
      <p>
        Se você recebeu uma conta sintética e deseja interromper o acesso, fale
        diretamente com a pessoa responsável pela demonstração usando o contato
        já conhecido. Encerre também a sessão pelo botão “Sair”.
      </p>
      <h2>Antes da publicação</h2>
      <p>
        A instituição deverá disponibilizar um canal acessível para solicitar
        exclusão de conta e dados, definir uma verificação de identidade
        proporcional, informar categorias removidas ou retidas, os motivos da
        retenção e os prazos de resposta.
      </p>
      <h2>Retenção de informações</h2>
      <p>
        Contas, dados de acompanhamento e eventos de auditoria têm finalidades
        distintas. Regras de retenção e eventuais obrigações legais precisam de
        avaliação institucional e jurídica. A aplicação não executa apagamento
        clínico automático nesta fase.
      </p>
      <p>
        Consulte também <Link href="/privacidade">privacidade</Link> e{" "}
        <Link href="/suporte">suporte</Link>. A publicação nas lojas depende da
        definição e validação desse fluxo.
      </p>
    </DocumentoPublico>
  );
}

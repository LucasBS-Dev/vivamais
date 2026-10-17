import Link from "next/link";

export default function NotFound() {
  return (
    <main id="conteudo" className="standalone-state">
      <span className="eyebrow">RECURSO INDISPONÍVEL</span>
      <h1>Não encontramos esta página</h1>
      <p>
        O endereço pode ter mudado ou o registro não está disponível para sua
        conta.
      </p>
      <Link href="/painel" className="button button-primary">
        Ir para a visão geral
      </Link>
    </main>
  );
}

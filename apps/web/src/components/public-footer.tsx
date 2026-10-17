import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <span>Viva+ · Demonstração acadêmica</span>
      <nav aria-label="Informações públicas">
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/suporte">Suporte</Link>
        <Link href="/exclusao-de-conta">Exclusão de conta</Link>
      </nav>
    </footer>
  );
}

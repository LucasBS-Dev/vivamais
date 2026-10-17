import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./icons";
import { PublicFooter } from "./public-footer";

export function PublicDocument({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="public-header">
        <Link href="/" aria-label="Viva+, página de acesso">
          <Brand />
        </Link>
        <Link href="/" className="button button-secondary">
          Voltar ao acesso
        </Link>
      </header>
      <main id="conteudo" className="public-document">
        <span className="phase-pill">DEMONSTRAÇÃO ACADÊMICA · RASCUNHO</span>
        <h1>{title}</h1>
        <p className="document-date">Atualizado em 16 de outubro de 2026</p>
        {children}
      </main>
      <PublicFooter />
    </>
  );
}

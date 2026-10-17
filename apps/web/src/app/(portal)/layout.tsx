import type { ReactNode } from "react";
import Link from "next/link";
import { getSession } from "@/lib/api";
import { Brand, Icon } from "@/components/icons";
import { PortalNav } from "@/components/portal-nav";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await getSession();
  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <Link href="/painel" className="brand-link" aria-label="Viva+, início">
          <Brand />
        </Link>
        <div className="sidebar-label">PLATAFORMA PROFISSIONAL</div>
        <PortalNav />
        <div className="sidebar-note">
          <span className="phase-pill">FASE 1 · FUNDAÇÃO</span>
          <p>Acompanhamento com contexto, no tempo de cada atendimento.</p>
        </div>
        <div className="sidebar-bottom">
          <Link href="/suporte">
            Ajuda e suporte <Icon name="arrow" size={17} />
          </Link>
          <Link href="/privacidade">Privacidade</Link>
          <span>
            Demonstração acadêmica
            <br />
            Somente dados sintéticos
          </span>
        </div>
      </aside>
      <div className="portal-body">
        <header className="portal-header">
          <span className="workspace-label">
            <span className="live-dot teal" /> Ambiente de demonstração
          </span>
          <div className="user-area">
            <span className="user-meta">
              <strong>{user.displayName}</strong>
              <small>
                {user.role === "ADMIN"
                  ? "Administrador"
                  : "Profissional de saúde"}
              </small>
            </span>
            <form method="post" action="/api/logout">
              <button className="logout-button" type="submit">
                <Icon name="logout" size={19} /> Sair
              </button>
            </form>
          </div>
        </header>
        <main id="conteudo" className="portal-content">
          {children}
        </main>
        <footer className="portal-footer">
          Viva+ / Pulso em Dia · Uso acadêmico com dados sintéticos
        </footer>
      </div>
    </div>
  );
}

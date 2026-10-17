"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

export function PortalNav() {
  const path = usePathname();
  return (
    <nav className="portal-nav" aria-label="Menu principal">
      <Link
        href="/painel"
        aria-current={path === "/painel" ? "page" : undefined}
      >
        <Icon name="grid" /> Visão geral
      </Link>
      <Link
        href="/pacientes"
        aria-current={path.startsWith("/pacientes") ? "page" : undefined}
      >
        <Icon name="people" /> Pacientes
      </Link>
    </nav>
  );
}

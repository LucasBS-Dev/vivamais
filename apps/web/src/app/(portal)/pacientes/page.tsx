import type { PatientSummary } from "@viva/contracts";
import { authenticatedRequest } from "@/lib/api";
import { PatientList } from "@/components/patient-list";
import { Icon } from "@/components/icons";
import Link from "next/link";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; pagina?: string }>;
}) {
  const { busca = "", pagina = "0" } = await searchParams;
  const query = typeof busca === "string" ? busca.trim().slice(0, 120) : "";
  const page = /^\d{1,5}$/.test(pagina) ? Number(pagina) : 0;
  const result = await authenticatedRequest<{
    items: PatientSummary[];
    total: number;
  }>(`/patients/search?q=${encodeURIComponent(query)}&page=${page}&size=20`);
  const pageUrl = (number: number) =>
    `/pacientes?busca=${encodeURIComponent(query)}&pagina=${number}`;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACOMPANHAMENTO</span>
          <h1>Pacientes</h1>
          <p>Encontre as pessoas disponíveis no seu escopo de acesso.</p>
        </div>
        <Link href="/pacientes/novo" className="button button-primary">
          Cadastrar paciente
        </Link>
        <span className="subtle-tag">
          {result.total}{" "}
          {result.total === 1 ? "paciente disponível" : "pacientes disponíveis"}
        </span>
      </div>
      <section className="panel">
        <div className="search-block">
          <form method="get" className="search-form">
            <div className="field">
              <label htmlFor="busca">Buscar pelo nome</label>
              <input
                id="busca"
                name="busca"
                type="search"
                maxLength={120}
                defaultValue={query}
                placeholder="Digite o nome do paciente"
              />
            </div>
            <button className="button button-primary" type="submit">
              Buscar <Icon name="arrow" size={18} />
            </button>
            {query && (
              <a className="button button-secondary" href="/pacientes">
                Limpar
              </a>
            )}
          </form>
          <p className="form-hint">
            A busca considera somente os pacientes autorizados pela API.
          </p>
        </div>
        <PatientList
          patients={result.items}
          emptyText={
            query
              ? "Tente outro nome ou limpe a busca. A lista mostra somente pacientes autorizados."
              : "Cadastre um paciente ou solicite ao administrador um vínculo para sua conta."
          }
        />
        <nav aria-label="Paginação de pacientes" className="care-actions">
          {page > 0 && (
            <Link className="button button-secondary" href={pageUrl(page - 1)}>
              Página anterior
            </Link>
          )}
          <span>Página {page + 1}</span>
          {(page + 1) * 20 < result.total && (
            <Link className="button button-secondary" href={pageUrl(page + 1)}>
              Próxima página
            </Link>
          )}
        </nav>
      </section>
    </>
  );
}

import type { Paciente } from "@viva/contracts";
import { requisicaoAutenticada } from "@/services/api";
import { ListaPacientes } from "@/components/ListaPacientes";
import { Icone } from "@/components/Icones";
import Link from "next/link";

export default async function PaginaPacientes({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; pagina?: string }>;
}) {
  const { busca: buscaInformada = "", pagina: paginaInformada = "0" } =
    await searchParams;
  const busca =
    typeof buscaInformada === "string"
      ? buscaInformada.trim().slice(0, 120)
      : "";
  const pagina = /^\d{1,5}$/.test(paginaInformada)
    ? Number(paginaInformada)
    : 0;
  const resultado = await requisicaoAutenticada<{
    items: Paciente[];
    total: number;
  }>(`/patients/search?q=${encodeURIComponent(busca)}&page=${pagina}&size=20`);
  const enderecoPagina = (numero: number) =>
    `/pacientes?busca=${encodeURIComponent(busca)}&pagina=${numero}`;
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
          {resultado.total}{" "}
          {resultado.total === 1
            ? "paciente disponível"
            : "pacientes disponíveis"}
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
                defaultValue={busca}
                placeholder="Digite o nome do paciente"
              />
            </div>
            <button className="button button-primary" type="submit">
              Buscar <Icone name="arrow" size={18} />
            </button>
            {busca && (
              <a className="button button-secondary" href="/pacientes">
                Limpar
              </a>
            )}
          </form>
          <p className="form-hint">
            A busca considera somente os pacientes autorizados pela API.
          </p>
        </div>
        <ListaPacientes
          patients={resultado.items}
          emptyText={
            busca
              ? "Tente outro nome ou limpe a busca. A lista mostra somente pacientes autorizados."
              : "Cadastre um paciente ou solicite ao administrador um vínculo para sua conta."
          }
        />
        <nav aria-label="Paginação de pacientes" className="care-actions">
          {pagina > 0 && (
            <Link
              className="button button-secondary"
              href={enderecoPagina(pagina - 1)}
            >
              Página anterior
            </Link>
          )}
          <span>Página {pagina + 1}</span>
          {(pagina + 1) * 20 < resultado.total && (
            <Link
              className="button button-secondary"
              href={enderecoPagina(pagina + 1)}
            >
              Próxima página
            </Link>
          )}
        </nav>
      </section>
    </>
  );
}

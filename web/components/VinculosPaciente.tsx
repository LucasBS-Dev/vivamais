"use client";
import { useCallback, useEffect, useState } from "react";
import { consultarDominio } from "../services/dominio";
type Profissional = { id: string; displayName: string };
type Vinculo = { professionalId: string; displayName: string };
export function VinculosPaciente({
  patientId: idPaciente,
}: {
  patientId: string;
}) {
  const [profissionais, definirProfissionais] = useState<Profissional[]>([]),
    [vinculados, definirVinculados] = useState<Vinculo[]>([]),
    [erro, definirErro] = useState(""),
    [aviso, definirAviso] = useState(""),
    [ocupado, definirOcupado] = useState(false);
  const carregar = useCallback(async () => {
    try {
      const [users, links] = await Promise.all([
        consultarDominio<Profissional[]>("/professionals"),
        consultarDominio<Vinculo[]>(`/patients/${idPaciente}/assignments`),
      ]);
      definirProfissionais(users);
      definirVinculados(links);
    } catch {
      definirErro("Não foi possível consultar os vínculos.");
    }
  }, [idPaciente]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  async function alterarVinculo(idProfissional: string, revogar = false) {
    definirOcupado(true);
    definirErro("");
    definirAviso("");
    try {
      await consultarDominio(
        `/patients/${idPaciente}/assignments${revogar ? "/revoke" : ""}`,
        "POST",
        { professionalId: idProfissional },
      );
      definirAviso(
        revogar
          ? "Vínculo removido. O servidor revoga o acesso ao paciente e às fotos."
          : "Vínculo autorizado salvo.",
      );
      await carregar();
    } catch (e) {
      definirErro(
        e instanceof Error ? e.message : "Não foi possível alterar o vínculo.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <section className="panel padded spaced">
      <h2>Profissionais autorizados</h2>
      <p>
        A administração concede acesso somente a profissionais da mesma unidade.
      </p>
      {erro && <p role="alert">{erro}</p>}
      {aviso && <p role="status">{aviso}</p>}
      <ul>
        {vinculados.map((link) => (
          <li key={link.professionalId}>
            {link.displayName}{" "}
            <button
              className="button button-secondary"
              disabled={ocupado}
              onClick={() => {
                void alterarVinculo(link.professionalId, true);
              }}
            >
              Remover vínculo de {link.displayName}
            </button>
          </li>
        ))}
      </ul>
      {!vinculados.length && <p>Nenhum vínculo profissional cadastrado.</p>}
      <form
        className="care-form"
        onSubmit={(e) => {
          e.preventDefault();
          void alterarVinculo(
            String(new FormData(e.currentTarget).get("professionalId")),
          );
        }}
      >
        <label>
          Profissional da unidade
          <select required name="professionalId" defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {profissionais
              .filter(
                (pacienteConsultado) =>
                  !vinculados.some(
                    (a) => a.professionalId === pacienteConsultado.id,
                  ),
              )
              .map((pacienteConsultado) => (
                <option
                  key={pacienteConsultado.id}
                  value={pacienteConsultado.id}
                >
                  {pacienteConsultado.displayName}
                </option>
              ))}
          </select>
        </label>
        <button className="button button-primary" disabled={ocupado}>
          Autorizar vínculo
        </button>
      </form>
    </section>
  );
}

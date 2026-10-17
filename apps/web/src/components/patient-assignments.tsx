"use client";
import { useCallback, useEffect, useState } from "react";
import { domain } from "./patient-care";
type Professional = { id: string; displayName: string };
type Assignment = { professionalId: string; displayName: string };
export function PatientAssignments({ patientId }: { patientId: string }) {
  const [professionals, setProfessionals] = useState<Professional[]>([]),
    [assigned, setAssigned] = useState<Assignment[]>([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const [users, links] = await Promise.all([
        domain<Professional[]>("/professionals"),
        domain<Assignment[]>(`/patients/${patientId}/assignments`),
      ]);
      setProfessionals(users);
      setAssigned(links);
    } catch {
      setError("Não foi possível consultar os vínculos.");
    }
  }, [patientId]);
  useEffect(() => {
    void load();
  }, [load]);
  async function change(professionalId: string, revoke = false) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await domain(
        `/patients/${patientId}/assignments${revoke ? "/revoke" : ""}`,
        "POST",
        { professionalId },
      );
      setNotice(
        revoke
          ? "Vínculo removido. O servidor revoga o acesso ao paciente e às fotos."
          : "Vínculo autorizado salvo.",
      );
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível alterar o vínculo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel padded spaced">
      <h2>Profissionais autorizados</h2>
      <p>
        A administração concede acesso somente a profissionais da mesma unidade.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <ul>
        {assigned.map((link) => (
          <li key={link.professionalId}>
            {link.displayName}{" "}
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => {
                void change(link.professionalId, true);
              }}
            >
              Remover vínculo de {link.displayName}
            </button>
          </li>
        ))}
      </ul>
      {!assigned.length && <p>Nenhum vínculo profissional cadastrado.</p>}
      <form
        className="care-form"
        onSubmit={(e) => {
          e.preventDefault();
          void change(
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
            {professionals
              .filter((p) => !assigned.some((a) => a.professionalId === p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
          </select>
        </label>
        <button className="button button-primary" disabled={busy}>
          Autorizar vínculo
        </button>
      </form>
    </section>
  );
}

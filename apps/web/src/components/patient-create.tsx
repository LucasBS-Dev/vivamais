"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { PatientSummary } from "@viva/contracts";

export function PatientCreate() {
  const [modality, setModality] = useState("APP");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    patient: PatientSummary;
    activationToken?: string;
    expiresAt?: string;
  } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const r = await fetch("/api/domain/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.get("displayName"),
          modality,
          email: modality === "APP" ? form.get("email") : null,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Não foi possível cadastrar.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível cadastrar.");
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <section className="panel padded">
        <h1>Paciente cadastrado</h1>
        <p role="status">
          {result.patient.displayName} foi salvo e está disponível para a sua
          conta.
        </p>
        {result.activationToken && (
          <div className="notice">
            <div>
              <strong>Ativação do aplicativo</strong>
              <p>
                Entregue este código à pessoa de teste por canal seguro. Ele
                expira em 24 horas e é exibido somente agora. No aplicativo,
                escolha Ativar conta e defina a senha.
              </p>
              <textarea
                readOnly
                aria-label="Código de ativação"
                value={result.activationToken}
              />
              <p>Não envie o código ao chat ou a serviços públicos.</p>
            </div>
          </div>
        )}
        <Link
          className="button button-primary"
          href={`/pacientes/${result.patient.id}`}
        >
          Abrir ficha do paciente
        </Link>
      </section>
    );
  return (
    <section className="panel padded">
      <h1>Cadastrar paciente</h1>
      <p>Use somente pessoas fictícias nesta demonstração.</p>
      <form onSubmit={submit} className="care-form">
        <label>
          Nome completo
          <input name="displayName" required maxLength={160} />
        </label>
        <label>
          Modalidade
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            name="modality"
          >
            <option value="APP">Aplicativo Viva+</option>
            <option value="BRACELET_DIARY">Pulseira + diário impresso</option>
          </select>
        </label>
        {modality === "APP" && (
          <label>
            E-mail de ativação
            <input name="email" type="email" required maxLength={254} />
          </label>
        )}
        <p>
          {modality === "APP"
            ? "O cadastro cria um convite de ativação. A pessoa define sua própria senha no aplicativo."
            : "Esta modalidade funciona pelo portal e não exige conta nem smartphone do paciente."}
        </p>
        {error && <p role="alert">{error}</p>}
        <button className="button button-primary" disabled={busy}>
          {busy ? "Salvando…" : "Salvar paciente"}
        </button>
      </form>
    </section>
  );
}

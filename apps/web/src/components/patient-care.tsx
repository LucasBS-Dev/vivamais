"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { PatientSummary } from "@viva/contracts";

type Row = Record<string, unknown>;
type Page = { items: Row[]; total: number; page: number; size: number };
type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  max?: number;
};
type Tab =
  | "readings"
  | "medications"
  | "diary"
  | "activities"
  | "consultations"
  | "device";
const labels: Record<Tab, string> = {
  readings: "Pressão arterial",
  medications: "Medicamentos",
  diary: "Diário impresso",
  activities: "Atividade física",
  consultations: "Consultas",
  device: "Pulseira",
};
const localNow = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
const dateLabel = (v: unknown) =>
  typeof v === "string"
    ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : "—";
const fields: Record<Tab, Field[]> = {
  readings: [
    {
      key: "systolic",
      label: "Pressão sistólica (mmHg)",
      type: "number",
      required: true,
      max: 400,
    },
    {
      key: "diastolic",
      label: "Pressão diastólica (mmHg)",
      type: "number",
      required: true,
      max: 400,
    },
    { key: "pulse", label: "Pulso (opcional)", type: "number", max: 300 },
    {
      key: "measuredAt",
      label: "Data e hora da medição (fuso do navegador)",
      type: "datetime-local",
      required: true,
    },
  ],
  medications: [
    { key: "name", label: "Nome do medicamento", required: true, max: 160 },
    {
      key: "instruction",
      label: "Dose e instrução profissional",
      type: "textarea",
      required: true,
      max: 1000,
    },
    {
      key: "startsOn",
      label: "Início da vigência",
      type: "date",
      required: true,
    },
    { key: "endsOn", label: "Fim da vigência (opcional)", type: "date" },
    {
      key: "schedules",
      label: "Horários separados por vírgula, ex.: 08:00, 20:00",
      required: true,
      max: 80,
    },
  ],
  diary: [
    {
      key: "occurredAt",
      label: "Data e hora informadas no diário (fuso do navegador)",
      type: "datetime-local",
      required: true,
    },
    {
      key: "systolic",
      label: "Sistólica transcrita (opcional)",
      type: "number",
      max: 400,
    },
    {
      key: "diastolic",
      label: "Diastólica transcrita (opcional)",
      type: "number",
      max: 400,
    },
    { key: "pulse", label: "Pulso (opcional)", type: "number", max: 300 },
    {
      key: "medicationReport",
      label: "Relato sobre medicamentos",
      type: "textarea",
      max: 2000,
    },
    {
      key: "notes",
      label: "Observações da transcrição",
      type: "textarea",
      max: 2000,
    },
  ],
  activities: [
    { key: "type", label: "Atividade informada", required: true, max: 160 },
    {
      key: "durationMinutes",
      label: "Duração em minutos",
      type: "number",
      required: true,
      max: 1440,
    },
    {
      key: "occurredAt",
      label: "Data e hora da atividade (fuso do navegador)",
      type: "datetime-local",
      required: true,
    },
    { key: "notes", label: "Observações", type: "textarea", max: 2000 },
  ],
  consultations: [
    {
      key: "occurredAt",
      label: "Data e hora da consulta (fuso do navegador)",
      type: "datetime-local",
      required: true,
    },
    {
      key: "notes",
      label: "Anotações da consulta",
      type: "textarea",
      required: true,
      max: 4000,
    },
    {
      key: "goals",
      label: "Objetivos acordados",
      type: "textarea",
      required: true,
      max: 2000,
    },
    {
      key: "carePlan",
      label: "Plano de cuidado profissional",
      type: "textarea",
      required: true,
      max: 4000,
    },
  ],
  device: [
    {
      key: "label",
      label: "Identificação da pulseira",
      required: true,
      max: 160,
    },
    { key: "serialNumber", label: "Número de série (opcional)", max: 160 },
  ],
};
export async function domain<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const r = await fetch(`/api/domain${path}`, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 204) return undefined as T;
  const result = await r.json();
  if (!r.ok)
    throw new Error(
      result.detail || "Não foi possível concluir a solicitação.",
    );
  return result as T;
}
function PressureChart({ readings }: { readings: Row[] }) {
  if (!readings.length) return null;
  const data = [...readings].reverse(),
    max = Math.max(
      1,
      ...data.flatMap((r) => [Number(r.systolic), Number(r.diastolic)]),
    );
  const points = (key: string) =>
    data
      .map(
        (r, i) =>
          `${40 + (i * 520) / Math.max(1, data.length - 1)},${160 - (Number(r[key]) * 130) / max}`,
      )
      .join(" ");
  return (
    <figure>
      <svg
        viewBox="0 0 600 190"
        role="img"
        aria-label="Gráfico da pressão sistólica e diastólica; valores detalhados na tabela abaixo"
      >
        <line x1="40" x2="570" y1="160" y2="160" stroke="#526b78" />
        <polyline
          fill="none"
          stroke="#086b92"
          strokeWidth="3"
          points={points("systolic")}
        />
        <polyline
          fill="none"
          stroke="#087f73"
          strokeWidth="3"
          strokeDasharray="5 4"
          points={points("diastolic")}
        />
      </svg>
      <figcaption>
        Linha contínua: sistólica. Linha tracejada: diastólica. Sem
        classificação diagnóstica.
      </figcaption>
    </figure>
  );
}
function RecordList({
  rows,
  tab,
  onEdit,
}: {
  rows: Row[];
  tab: Tab;
  onEdit: (row: Row) => void;
}) {
  if (!rows.length) return <p>Nenhum registro encontrado neste período.</p>;
  if (tab === "readings")
    return (
      <>
        <PressureChart readings={rows} />
        <div style={{ overflowX: "auto" }}>
          <table className="care-table">
            <caption>
              Histórico da pressão — horários exibidos em Brasília
            </caption>
            <thead>
              <tr>
                <th>Medição</th>
                <th>Pressão</th>
                <th>Pulso</th>
                <th>Origem</th>
                <th>Registro / envio</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)}>
                  <td>{dateLabel(r.measuredAt)}</td>
                  <td>
                    {String(r.systolic)} / {String(r.diastolic)} mmHg
                  </td>
                  <td>{String(r.pulse ?? "—")}</td>
                  <td>
                    {r.source === "PRINTED_DIARY"
                      ? "Diário transcrito"
                      : r.source === "OCR_CONFIRMED"
                        ? "Foto confirmada"
                        : r.source === "MANUAL"
                          ? "Digitação do paciente"
                          : "Registro profissional"}
                  </td>
                  <td>
                    {dateLabel(r.createdAt)} / {dateLabel(r.syncedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  const show: Record<string, string> = {
    name: "Medicamento",
    instruction: "Instrução",
    startsOn: "Vigência inicial",
    endsOn: "Vigência final",
    schedules: "Horários",
    version: "Versão",
    type: "Atividade",
    durationMinutes: "Minutos",
    notes: "Observações",
    medicationReport: "Medicamentos conforme relato",
    systolic: "Sistólica",
    diastolic: "Diastólica",
    goals: "Objetivos",
    carePlan: "Plano de cuidado",
    label: "Dispositivo",
    serialNumber: "Número de série",
    message: "Estado de integração",
  };
  return (
    <div>
      {rows.map((r, i) => (
        <article className="care-record" key={String(r.id ?? i)}>
          <p>
            <strong>{dateLabel(r.occurredAt ?? r.createdAt)}</strong>
          </p>
          <dl>
            {Object.entries(show)
              .filter(
                ([k]) => r[k] !== undefined && r[k] !== null && r[k] !== "",
              )
              .map(([k, label]) => (
                <div key={k}>
                  <dt>{label}</dt>
                  <dd>
                    {Array.isArray(r[k])
                      ? (r[k] as unknown[]).join(", ")
                      : String(r[k])}
                  </dd>
                </div>
              ))}
          </dl>
          {tab === "medications" && (
            <button
              className="button button-secondary"
              onClick={() => onEdit(r)}
            >
              Editar plano e consultar versões
            </button>
          )}
          {tab === "diary" && (
            <p>
              Origem: diário impresso transcrito por profissional. Inserido em{" "}
              {dateLabel(r.createdAt)}.
            </p>
          )}
          {r.authorId !== undefined && (
            <p>
              Autoria: {String(r.authorName ?? r.authorId)}. Registro:{" "}
              {dateLabel(r.createdAt)}.
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
export function PatientCare({ patient }: { patient: PatientSummary }) {
  const [tab, setTab] = useState<Tab>("readings"),
    [data, setData] = useState<Row[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [editing, setEditing] = useState<Row | null>(null),
    [history, setHistory] = useState<Row[]>([]);
  const [events, setEvents] = useState<Row[]>([]),
    [day, setDay] = useState(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    );
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [summary, setSummary] = useState<Row | null>(null),
    [profile, setProfile] = useState<Row | null>(null),
    [code, setCode] = useState("");
  const base = `/patients/${patient.id}`;
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      let path = `${base}/${tab}`;
      if (!["medications", "device"].includes(tab))
        path += `?page=${page}&size=20${tab === "readings" && from ? `&from=${encodeURIComponent(new Date(from).toISOString())}` : ""}${tab === "readings" && to ? `&to=${encodeURIComponent(new Date(to).toISOString())}` : ""}`;
      const r = await domain<Page | Row[] | Row | null>(path);
      if (tab === "device") {
        setData(r ? [r as Row] : []);
        setTotal(r ? 1 : 0);
      } else if (Array.isArray(r)) {
        setData(r);
        setTotal(r.length);
      } else {
        const paged = r as Page;
        setData(paged.items);
        setTotal(paged.total);
      }
      if (tab === "medications")
        setEvents(await domain<Row[]>(`${base}/medication-events?date=${day}`));
      if (tab === "activities")
        setProfile(await domain<Row | null>(`${base}/activity-profile`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar.");
      setData([]);
    } finally {
      setBusy(false);
    }
  }, [base, tab, page, day, from, to]);
  useEffect(() => {
    void load();
  }, [load]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const body: Row = { ...values };
    try {
      for (const f of fields[tab]) {
        if (f.type === "number")
          body[f.key] = values[f.key] === "" ? null : Number(values[f.key]);
        if (f.type === "datetime-local")
          body[f.key] = new Date(String(values[f.key])).toISOString();
      }
      if (!["medications", "device"].includes(tab))
        body.id = crypto.randomUUID();
      if (tab === "readings") body.source = "PROFESSIONAL";
      if (tab === "medications") {
        body.schedules = String(values.schedules)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
        body.endsOn = values.endsOn || null;
        body.timeZone = "America/Sao_Paulo";
        if (editing) body.version = editing.version;
      }
      await domain(
        tab === "medications" && editing
          ? `/medications/${editing.id}`
          : `${base}/${tab}`,
        tab === "medications" && editing ? "PUT" : "POST",
        body,
      );
      setNotice("Registro salvo no banco de dados.");
      setEditing(null);
      form.reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function edit(row: Row) {
    setEditing(row);
    setHistory([]);
    try {
      setHistory(await domain<Row[]>(`/medications/${row.id}/history`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Histórico indisponível.");
    }
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await domain(
        `${base}/activity-profile`,
        "PUT",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      setNotice("Perfil funcional salvo.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }
  async function configure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    try {
      const r = await domain<Row>(`${base}/device/configurations`, "POST", {
        schedules: String(f.get("schedules"))
          .split(",")
          .map((s) => s.trim()),
        adapter: f.get("adapter"),
      });
      setNotice(String(r.message));
      setHistory(await domain<Row[]>(`${base}/device/configurations`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível configurar.");
    }
  }
  return (
    <section>
      <div
        className="care-tabs"
        role="tablist"
        aria-label="Módulos do paciente"
      >
        {(Object.keys(labels) as Tab[])
          .filter(
            (k) => patient.modality === "BRACELET_DIARY" || k !== "device",
          )
          .map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => {
                setTab(k);
                setPage(0);
                setEditing(null);
                setHistory([]);
                setNotice("");
                setSummary(null);
              }}
            >
              {labels[k]}
            </button>
          ))}
      </div>
      <section className="panel padded" role="tabpanel">
        <h2>{tab === "readings" ? "Histórico da pressão" : labels[tab]}</h2>
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {busy && <p role="status">Consultando a API…</p>}
        {tab === "readings" && (
          <div className="care-grid">
            <label>
              De
              <input
                aria-label="Medições a partir de"
                type="datetime-local"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(0);
                }}
              />
            </label>
            <label>
              Até
              <input
                aria-label="Medições até"
                type="datetime-local"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(0);
                }}
              />
            </label>
          </div>
        )}
        <RecordList
          rows={data}
          tab={tab}
          onEdit={(row) => {
            void edit(row);
          }}
        />
        {!["medications", "device"].includes(tab) && (
          <div className="care-tabs">
            <button
              disabled={page === 0 || busy}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </button>
            <span>
              Página {page + 1} · {total} registros
            </span>
            <button
              disabled={(page + 1) * 20 >= total || busy}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        )}
        {tab === "medications" && (
          <section>
            <h3>Respostas informadas pelo paciente</h3>
            <p>
              Confirmações são autorrelatos. Sem confirmação não significa
              medicamento não tomado.
            </p>
            <label>
              Dia dos horários
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </label>
            {events.map((ev, i) => (
              <p key={i}>
                {String(ev.name)} — {dateLabel(ev.scheduledAt)} —{" "}
                <strong>
                  {ev.status === "TAKEN"
                    ? "Tomei (autorrelato)"
                    : ev.status === "NOT_TAKEN"
                      ? "Não tomei (autorrelato)"
                      : "Sem confirmação"}
                </strong>
                {ev.reportedAt
                  ? ` · Resposta: ${dateLabel(ev.reportedAt)}`
                  : ""}
              </p>
            ))}
          </section>
        )}
        {tab === "activities" && (
          <>
            <p>
              Recomendação personalizada bloqueada até aprovação clínica. Este
              formulário registra informações do profissional e atividades
              relatadas, sem autorizar exercício.
            </p>
            <h3>Perfil funcional e restrições</h3>
            <form
              key={JSON.stringify(profile)}
              onSubmit={saveProfile}
              className="care-form"
            >
              {[
                ["mobility", "Mobilidade"],
                ["balance", "Equilíbrio"],
                ["restrictions", "Restrições"],
                ["professionalGuidance", "Orientações profissionais"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <textarea
                    name={key}
                    defaultValue={String(profile?.[key] ?? "")}
                    required={["mobility", "balance"].includes(key)}
                    maxLength={
                      ["mobility", "balance"].includes(key) ? 300 : 2000
                    }
                  />
                </label>
              ))}
              <button className="button button-primary">
                Salvar perfil funcional
              </button>
            </form>
          </>
        )}
        <h3>{editing ? "Atualizar plano de medicamentos" : "Novo registro"}</h3>
        <form
          key={`${tab}-${editing?.id ?? "new"}`}
          className="care-form"
          onSubmit={save}
        >
          {fields[tab].map((f) => (
            <label key={f.key}>
              {f.label}
              {f.type === "textarea" ? (
                <textarea
                  name={f.key}
                  required={f.required}
                  maxLength={f.max}
                  defaultValue={String(editing?.[f.key] ?? "")}
                />
              ) : (
                <input
                  name={f.key}
                  type={f.type || "text"}
                  required={f.required}
                  maxLength={f.type === "number" ? undefined : f.max}
                  min={f.type === "number" ? 1 : undefined}
                  max={f.type === "number" ? f.max : undefined}
                  defaultValue={
                    editing?.[f.key] !== undefined
                      ? Array.isArray(editing[f.key])
                        ? (editing[f.key] as unknown[]).join(", ")
                        : String(editing[f.key] ?? "")
                      : f.type === "datetime-local"
                        ? localNow()
                        : f.key === "startsOn"
                          ? localNow().slice(0, 10)
                          : ""
                  }
                />
              )}
            </label>
          ))}
          {tab === "activities" && (
            <label>
              Estado informado pelo paciente
              <select name="feeling" required defaultValue="">
                <option value="" disabled>
                  Selecione o relato
                </option>
                <option value="WELL">Estou bem</option>
                <option value="TIRED">Estou cansado</option>
                <option value="UNWELL">Estou me sentindo mal</option>
              </select>
            </label>
          )}
          <button className="button button-primary" disabled={busy}>
            {editing ? "Salvar nova versão" : "Salvar registro"}
          </button>
          {editing && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setEditing(null)}
            >
              Cancelar edição
            </button>
          )}
        </form>
        {tab === "device" && (
          <>
            <h3>Programar lembretes</h3>
            <p>
              A pulseira lembra medicamentos e não mede pressão. O simulador não
              comunica com dispositivo físico.
            </p>
            <form className="care-form" onSubmit={configure}>
              <label>
                Horários
                <input name="schedules" required placeholder="08:00, 20:00" />
              </label>
              <label>
                Integração
                <select name="adapter">
                  <option value="SIMULATED">
                    SIMULADO — teste de desenvolvimento
                  </option>
                  <option value="HARDWARE">Hardware real — indisponível</option>
                </select>
              </label>
              <button className="button button-primary">
                Registrar configuração
              </button>
            </form>
          </>
        )}
        {history.length > 0 && (
          <section>
            <h3>Histórico de alterações</h3>
            {history.map((h, i) => (
              <article className="care-record" key={i}>
                {h.snapshot ? (
                  <p>
                    Versão {String(h.version)} —{" "}
                    {String((h.snapshot as Row).name)}:{" "}
                    {String((h.snapshot as Row).instruction)} ·{" "}
                    {dateLabel(h.changedAt)}
                  </p>
                ) : (
                  <p>
                    {String(h.message)} · {dateLabel(h.createdAt)}
                  </p>
                )}
              </article>
            ))}
          </section>
        )}
        {tab === "consultations" && (
          <>
            <button
              className="button button-secondary"
              onClick={() => {
                domain<Row>(`${base}/summary`)
                  .then(setSummary)
                  .catch((e) => setError(e.message));
              }}
            >
              Reunir resumo para consulta
            </button>
            {summary && (
              <section>
                <h3>Resumo dos registros disponíveis</h3>
                {[
                  ["readings", "Medições"],
                  ["medications", "Planos de medicamentos"],
                  ["activities", "Atividades"],
                  ["diary", "Entradas de diário"],
                  ["consultations", "Consultas"],
                ].map(([k, label]) => (
                  <p key={k}>
                    {label}:{" "}
                    {Array.isArray(summary[k])
                      ? (summary[k] as unknown[]).length
                      : 0}{" "}
                    registros recentes. Consulte os detalhes nas abas
                    correspondentes.
                  </p>
                ))}
                <p>O resumo apoia a consulta e não produz diagnóstico.</p>
                <p>
                  Gerado em {dateLabel(summary.generatedAt)}. Até 20 registros
                  recentes por categoria.
                </p>
                <button
                  className="button button-secondary"
                  onClick={async () => {
                    try {
                      const data = await domain<Row>(`${base}/export`);
                      const url = URL.createObjectURL(
                        new Blob([JSON.stringify(data, null, 2)], {
                          type: "application/json",
                        }),
                      );
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `viva-resumo-${patient.id}.json`;
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    } catch {
                      setError("Não foi possível exportar o resumo.");
                    }
                  }}
                >
                  Exportar resumo autorizado (JSON)
                </button>
                {(
                  [
                    "readings",
                    "medications",
                    "medicationEvents",
                    "activities",
                    "diary",
                    "consultations",
                    "meals",
                  ] as const
                ).map((key) => (
                  <details key={key}>
                    <summary>
                      {
                        {
                          readings: "Medições",
                          medications: "Planos de medicamentos",
                          medicationEvents: "Autorrelatos do dia",
                          activities: "Atividades",
                          diary: "Diário",
                          consultations: "Consultas",
                          meals: "Refeições",
                        }[key]
                      }
                    </summary>
                    {(Array.isArray(summary[key])
                      ? (summary[key] as Row[])
                      : []
                    ).map((row, index) => (
                      <article className="care-record" key={index}>
                        {Object.entries({
                          name: "Nome",
                          instruction: "Instrução profissional",
                          measuredAt: "Medição",
                          systolic: "Sistólica (mmHg)",
                          diastolic: "Diastólica (mmHg)",
                          scheduledAt: "Horário previsto",
                          reportedAt: "Horário da resposta",
                          status: "Autorrelato",
                          type: "Atividade",
                          durationMinutes: "Minutos",
                          occurredAt: "Ocorrência",
                          createdAt: "Registro",
                          notes: "Anotações",
                          medicationReport: "Relato transcrito",
                          goals: "Objetivos",
                          carePlan: "Plano profissional",
                          analysisStatus: "Análise educativa",
                        })
                          .filter(([field]) => row[field] != null)
                          .map(([field, label]) => (
                            <p key={field}>
                              <strong>{label}:</strong>{" "}
                              {field === "status"
                                ? row[field] === "TAKEN"
                                  ? "Tomei"
                                  : row[field] === "NOT_TAKEN"
                                    ? "Não tomei"
                                    : "Sem confirmação"
                                : field.endsWith("At")
                                  ? dateLabel(row[field])
                                  : String(row[field])}
                            </p>
                          ))}
                      </article>
                    ))}
                  </details>
                ))}
                {summary.functionalProfile != null && (
                  <details>
                    <summary>Perfil funcional e orientações</summary>
                    {Object.entries(summary.functionalProfile as Row)
                      .filter(([key]) =>
                        [
                          "mobility",
                          "balance",
                          "restrictions",
                          "professionalGuidance",
                        ].includes(key),
                      )
                      .map(([key, value]) => (
                        <p key={key}>
                          {
                            (
                              {
                                mobility: "Mobilidade",
                                balance: "Equilíbrio",
                                restrictions: "Restrições",
                                professionalGuidance: "Orientações",
                              } as Record<string, string>
                            )[key]
                          }
                          : {String(value)}
                        </p>
                      ))}
                  </details>
                )}
              </section>
            )}
          </>
        )}
      </section>
      {patient.modality === "APP" && (
        <details className="panel padded spaced">
          <summary>Recuperar acesso do paciente</summary>
          <p>
            Confirme sua própria senha para revogar as sessões e emitir um novo
            código de ativação.
          </p>
          <form
            className="care-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const password = new FormData(form).get("password");
              form.reset();
              try {
                const r = await domain<{ activationToken: string }>(
                  `${base}/access-reset`,
                  "POST",
                  { password },
                );
                setCode(r.activationToken);
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : "Não foi possível recuperar.",
                );
              }
            }}
          >
            <label>
              Sua senha atual
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            <button className="button button-secondary">
              Emitir novo código
            </button>
          </form>
          {code && (
            <label>
              Código entregue uma vez
              <textarea readOnly value={code} />
            </label>
          )}
        </details>
      )}
    </section>
  );
}

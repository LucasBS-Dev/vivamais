"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { domain } from "./patient-care";
type Meal = {
  id: string;
  fileId: string;
  occurredAt: string;
  notes: string;
  analysisStatus: string;
  assessment?: {
    status: string;
    trafficLight?: string;
    explanation: string;
    limitations: string;
    identifiedFoods: string[];
  } | null;
};
export function PatientMeals({ patientId }: { patientId: string }) {
  const [meals, setMeals] = useState<Meal[]>([]),
    [page, setPage] = useState(0),
    [total, setTotal] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const r = await domain<{ items: Meal[]; total: number }>(
        `/patients/${patientId}/meals?page=${page}&size=10`,
      );
      setMeals(r.items);
      setTotal(r.total);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível carregar fotos.",
      );
    }
  }, [patientId, page]);
  useEffect(() => {
    void load();
  }, [load]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const values = new FormData(form),
      file = values.get("file") as File;
    if (!file || file.size > 2097152) {
      setError("Use PNG ou JPEG com até 2 MB.");
      setBusy(false);
      return;
    }
    try {
      const upload = new FormData();
      upload.set("file", file);
      upload.set("purpose", "MEAL");
      const r = await fetch(`/api/domain/patients/${patientId}/files`, {
        method: "POST",
        body: upload,
      });
      const object = await r.json();
      if (!r.ok) throw new Error(object.detail || "Foto não enviada.");
      await domain(`/patients/${patientId}/meals`, "POST", {
        fileId: object.id,
        occurredAt: new Date(String(values.get("occurredAt"))).toISOString(),
        notes: values.get("notes"),
      });
      form.reset();
      setNotice("Refeição e foto privadas salvas.");
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível salvar a refeição.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel padded spaced">
      <h2>Alimentação e fotos privadas</h2>
      <p>
        Somente fotos sintéticas nesta demo. A imagem não mede nutrientes.
        Análise por IA permanece indisponível até configurar um serviço e
        aprovar seus critérios.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <form className="care-form" onSubmit={save}>
        <label>
          Foto da refeição (PNG/JPEG, até 2 MB)
          <input
            name="file"
            type="file"
            accept="image/png,image/jpeg"
            required
          />
        </label>
        <label>
          Data e hora da refeição
          <input
            type="datetime-local"
            name="occurredAt"
            required
            defaultValue={new Date(
              Date.now() - new Date().getTimezoneOffset() * 60000,
            )
              .toISOString()
              .slice(0, 16)}
          />
        </label>
        <label>
          Observações
          <textarea name="notes" maxLength={2000} />
        </label>
        <button className="button button-primary" disabled={busy}>
          {busy ? "Enviando foto…" : "Salvar refeição e foto"}
        </button>
      </form>
      <div className="care-grid">
        {meals.map((meal) => (
          <article key={meal.id} className="care-record">
            <img
              src={`/api/photos/${meal.fileId}`}
              width={300}
              height={220}
              style={{ objectFit: "contain", maxWidth: "100%" }}
              alt="Foto privada de refeição sintética"
            />
            <p>
              {new Date(meal.occurredAt).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </p>
            <p>{meal.notes}</p>
            {meal.assessment ? (
              <>
                <p>
                  <strong>
                    {meal.assessment.trafficLight === "GREEN"
                      ? "Verde · orientação educativa"
                      : meal.assessment.trafficLight === "YELLOW"
                        ? "Amarelo · pontos para conversar"
                        : meal.assessment.trafficLight === "RED"
                          ? "Vermelho · discutir com a equipe"
                          : "Avaliação incerta ou imagem inadequada"}
                  </strong>
                </p>
                <p>{meal.assessment.explanation}</p>
                <p>{meal.assessment.limitations}</p>
              </>
            ) : (
              <p>
                Análise automatizada indisponível. Leve a foto à equipe para
                conversar sobre a refeição.
              </p>
            )}
            <button
              className="button button-secondary"
              onClick={() => {
                domain<{ message?: string; providerCalled?: boolean }>(
                  `/meals/${meal.id}/analyze`,
                  "POST",
                  {},
                )
                  .then((r) => {
                    setNotice(
                      r.message ||
                        "Resposta educativa recebida; consulte as limitações.",
                    );
                    void load();
                  })
                  .catch((e) => setError(e.message));
              }}
            >
              Consultar análise educativa
            </button>
          </article>
        ))}
      </div>
      {!meals.length && <p>Nenhuma foto registrada.</p>}
      <div className="care-tabs">
        <button disabled={!page} onClick={() => setPage((p) => p - 1)}>
          Fotos anteriores
        </button>
        <span>
          Página {page + 1} · {total} fotos
        </span>
        <button
          disabled={(page + 1) * 10 >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Próximas fotos
        </button>
      </div>
    </section>
  );
}

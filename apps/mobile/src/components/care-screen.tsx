import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Text, TextInput, View, Platform } from "react-native";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";
import { useSession } from "../auth/session";
import { Brand, Button, ErrorMessage, Loading, Screen } from "./ui";
import { styles as s } from "../theme/styles";
import { parsePressure, type PendingOperation } from "../lib/care-core";
import { writeQueue, queueStorageDescription } from "../lib/write-queue";
import { scheduleReminders } from "../lib/reminders";
import type { ReminderPlan } from "../lib/reminder-core";
import { PhotoFlow, type OcrResult } from "./photo-flow";
import { PressureChart } from "./pressure-chart";
import { rememberPatient, recalledPatient } from "../lib/patient-context";
type Row = Record<string, unknown>;
type Page = { items: Row[]; total: number; page: number; size: number };
const labelDate = (value: unknown) =>
  new Date(String(value)).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
const titles: Record<string, string> = {
  "blood-pressure": "Minha Pressão",
  medications: "Meus Medicamentos",
  activity: "Atividade Física",
  food: "Minha Alimentação",
};
export function CareScreen({
  module,
  historyOnly = false,
  children,
}: {
  module: string;
  historyOnly?: boolean;
  children?: ReactNode;
}) {
  const { session, request } = useSession();
  const [patient, setPatient] = useState(""),
    [rows, setRows] = useState<Row[]>([]),
    [plans, setPlans] = useState<ReminderPlan[]>([]),
    [profile, setProfile] = useState<Row | null>(null),
    [page, setPage] = useState(0),
    [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [pending, setPending] = useState<PendingOperation[]>([]),
    [a, setA] = useState(""),
    [b, setB] = useState(""),
    [pulse, setPulse] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [when, setWhen] = useState(new Date().toISOString()),
    [activity, setActivity] = useState(""),
    [duration, setDuration] = useState(""),
    [feeling, setFeeling] = useState(""),
    [notes, setNotes] = useState("");
  const owner = session?.user.id ?? "";
  const [ocrDocument, setOcrDocument] = useState<string | null>(null);
  const [filterFrom, setFilterFrom] = useState(""),
    [filterTo, setFilterTo] = useState(""),
    [period, setPeriod] = useState(""),
    [day, setDay] = useState(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    );
  const endpoint =
    module === "blood-pressure"
      ? "readings"
      : module === "activity"
        ? "activities"
        : module === "food"
          ? "meals"
          : "medication-events";
  const refreshQueue = useCallback(async () => {
    if (owner) setPending(await writeQueue.read(owner));
  }, [owner]);
  const sync = useCallback(
    async (force = false) => {
      if (!owner) return;
      try {
        if (force) await writeQueue.retry(owner);
        await writeQueue.sync(owner, (path, body) =>
          request(path, { method: "POST", body }),
        );
        await refreshQueue();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Fila indisponível.");
      }
    },
    [owner, request, refreshQueue],
  );
  const load = useCallback(async () => {
    if (!session) return;
    setBusy(true);
    setError("");
    try {
      const p = await request<{ id: string }>("/patients/me");
      setPatient(p.id);
      await rememberPatient(owner, p.id);
      const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const data = await request<Page | Row[]>(
        `/patients/${p.id}/${endpoint}?${module === "medications" ? `date=${day || date}` : `page=${page}&size=20${module === "blood-pressure" ? period : ""}`}`,
      );
      setRows(Array.isArray(data) ? data : data.items);
      setTotal(Array.isArray(data) ? data.length : data.total);
      if (module === "medications") {
        const medicationPlans = await request<ReminderPlan[]>(
          `/patients/${p.id}/medications`,
        );
        setPlans(medicationPlans);
        if (Platform.OS !== "web")
          setNotice(await scheduleReminders(owner, medicationPlans, false));
      }
      if (module === "activity")
        setProfile(
          await request<Row | null>(`/patients/${p.id}/activity-profile`),
        );
    } catch (e) {
      const saved = await recalledPatient(owner).catch(() => null);
      if (saved) setPatient(saved);
      setError(e instanceof Error ? e.message : "Não foi possível atualizar.");
    } finally {
      setBusy(false);
    }
  }, [request, session, owner, endpoint, module, page, period, day]);
  useEffect(() => {
    void load();
    void refreshQueue();
    const timer = setInterval(() => {
      void sync();
    }, 15000);
    return () => clearInterval(timer);
  }, [load, refreshQueue, sync]);
  async function enqueue(path: string, body: Row) {
    if (!session || !patient) return;
    setBusy(true);
    setError("");
    try {
      await writeQueue.enqueue({ id: String(body.id), owner, path, body });
      await sync(true);
      const remaining = await writeQueue.read(owner);
      setPending(remaining);
      setNotice(
        remaining.some((x) => x.id === body.id)
          ? "Registro protegido na fila. Aguardando envio para a API."
          : "Registro enviado e salvo na API.",
      );
      if (!remaining.some((x) => x.id === body.id)) await load();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível proteger o registro.",
      );
      return false;
    } finally {
      setBusy(false);
    }
    return true;
  }
  async function savePressure() {
    try {
      const pressure = parsePressure(a, b);
      if (!confirmed) {
        setError(
          `Confira ${pressure.systolic} / ${pressure.diastolic} mmHg e confirme antes de salvar.`,
        );
        return;
      }
      const at = new Date(when);
      if (!Number.isFinite(at.getTime()))
        throw new Error("Informe uma data e hora válidas no formato ISO.");
      const accepted = await enqueue(`/patients/${patient}/readings`, {
        id: Crypto.randomUUID(),
        systolic: pressure.systolic,
        diastolic: pressure.diastolic,
        pulse: pulse ? Number(pulse) : null,
        measuredAt: at.toISOString(),
        source: ocrDocument ? "OCR_CONFIRMED" : "MANUAL",
        ocrDocumentId: ocrDocument,
        ocrConfirmed: ocrDocument ? true : undefined,
      });
      if (!accepted) return;
      setA("");
      setB("");
      setPulse("");
      setConfirmed(false);
      setOcrDocument(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confira os números.");
    }
  }
  async function saveActivity() {
    if (!feeling) {
      setError("Informe como você se sente antes de registrar.");
      return;
    }
    if (
      !activity.trim() ||
      !Number.isInteger(Number(duration)) ||
      Number(duration) < 1
    ) {
      setError("Informe a atividade e a duração em minutos.");
      return;
    }
    try {
      const accepted = await enqueue(`/patients/${patient}/activities`, {
        id: Crypto.randomUUID(),
        type: activity.trim(),
        durationMinutes: Number(duration),
        occurredAt: new Date(when).toISOString(),
        notes,
        feeling,
      });
      if (!accepted) return;
      setFeeling("");
      setActivity("");
      setDuration("");
      setNotes("");
    } catch {
      setError("Confira a data e hora.");
    }
  }
  if (!session)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  return (
    <Screen>
      <Brand />
      <Text style={s.title} accessibilityRole="header">
        {historyOnly ? "Meu Histórico" : (titles[module] ?? "Histórico")}
      </Text>
      {children}
      {error && <ErrorMessage message={error} />}{" "}
      {notice && (
        <Text accessibilityLiveRegion="polite" style={s.body}>
          {notice}
        </Text>
      )}
      {busy && <Loading />}
      <View style={s.notice}>
        <Text style={s.label}>
          {pending.length} registros pendentes de sincronização
        </Text>
        <Text style={s.small}>{queueStorageDescription}</Text>
        {pending.map((item) => (
          <Text key={item.id} style={s.small}>
            {item.state === "ERROR" ? "Falha / nova tentativa" : "Pendente"} ·{" "}
            {item.message ?? "Aguardando envio"}
          </Text>
        ))}
        <Button
          secondary
          label="Sincronizar agora"
          onPress={() => {
            void sync(true).then(load);
          }}
        />
      </View>
      {!historyOnly && module === "blood-pressure" && (
        <View style={s.card}>
          <Text style={s.title} accessibilityRole="header">
            Registrar pressão
          </Text>
          <Text style={s.body}>
            Leia os números no aparelho. O celular não mede pressão pela câmera.
            Sem diagnóstico automático.
          </Text>
          {[
            ["Sistólica", a, setA],
            ["Diastólica", b, setB],
            ["Pulso (opcional)", pulse, setPulse],
          ].map(([label, value, set]) => (
            <View key={String(label)}>
              <Text style={s.label}>{String(label)}</Text>
              <TextInput
                style={s.field}
                accessibilityLabel={String(label)}
                keyboardType="numeric"
                value={String(value)}
                onChangeText={(v) => {
                  (set as (v: string) => void)(v);
                  setConfirmed(false);
                }}
              />
            </View>
          ))}
          <Text style={s.label}>Data e hora da medição (ISO com fuso)</Text>
          <TextInput
            accessibilityLabel="Data e hora da medição"
            style={s.field}
            value={when}
            onChangeText={setWhen}
          />
          {a && b && (
            <Text style={s.body}>
              {(() => {
                try {
                  const p = parsePressure(a, b);
                  return `Confira: ${p.systolic} / ${p.diastolic} mmHg${p.converted ? " (conversão de valores abreviados)" : ""}.`;
                } catch {
                  return "Confira os valores informados.";
                }
              })()}
            </Text>
          )}
          <Button
            secondary
            label={
              confirmed ? "Valores confirmados" : "Confirmar estes valores"
            }
            onPress={() => {
              try {
                parsePressure(a, b);
                setConfirmed(true);
                setError("");
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Confira os valores.",
                );
              }
            }}
          />
          <Button
            label="Salvar pressão"
            busy={busy}
            onPress={() => {
              void savePressure();
            }}
          />
        </View>
      )}
      {module === "blood-pressure" && (
        <View style={s.card}>
          <Text style={s.title}>Filtrar medições por período</Text>
          <Text style={s.label}>De (AAAA-MM-DD)</Text>
          <TextInput
            style={s.field}
            accessibilityLabel="Início do período"
            value={filterFrom}
            onChangeText={setFilterFrom}
          />
          <Text style={s.label}>Até (AAAA-MM-DD)</Text>
          <TextInput
            style={s.field}
            accessibilityLabel="Fim do período"
            value={filterTo}
            onChangeText={setFilterTo}
          />
          <Button
            secondary
            label="Aplicar período"
            onPress={() => {
              try {
                const start = filterFrom
                    ? new Date(`${filterFrom}T00:00:00-03:00`).toISOString()
                    : null,
                  end = filterTo
                    ? new Date(`${filterTo}T23:59:59.999-03:00`).toISOString()
                    : null;
                if (start && end && start > end) throw new Error();
                setPeriod(
                  `${start ? `&from=${encodeURIComponent(start)}` : ""}${end ? `&to=${encodeURIComponent(end)}` : ""}`,
                );
                setPage(0);
              } catch {
                setError("Informe um período válido.");
              }
            }}
          />
          <PressureChart
            readings={rows.map((r) => ({
              systolic: Number(r.systolic),
              diastolic: Number(r.diastolic),
              measuredAt: String(r.measuredAt),
            }))}
          />
        </View>
      )}
      {module === "medications" && (
        <>
          <View style={s.card}>
            <Text style={s.body}>
              Plano definido pelo profissional. Respostas são autorrelatos. Sem
              confirmação não significa que a dose não foi tomada. Não tome dose
              extra por orientação deste aplicativo.
            </Text>
            <Button
              secondary
              label="Autorizar e agendar lembretes locais"
              onPress={() => {
                scheduleReminders(owner, plans, true)
                  .then(setNotice)
                  .catch(() =>
                    setError(
                      "Não foi possível agendar notificações neste build.",
                    ),
                  );
              }}
            />
          </View>
          <Text style={s.title}>Planos da equipe</Text>
          {plans.map((plan) => (
            <View style={s.card} key={plan.id}>
              <Text style={s.label}>{plan.name}</Text>
              <Text style={s.body}>{plan.instruction}</Text>
              <Text style={s.body}>
                Horários: {plan.schedules.join(", ")} · {plan.timeZone}
              </Text>
              <Text style={s.small}>
                Vigência: {plan.startsOn} a {plan.endsOn || "sem data final"} ·
                versão {plan.version}
              </Text>
            </View>
          ))}
          <Text style={s.label}>Dia dos autorrelatos (AAAA-MM-DD)</Text>
          <TextInput
            style={s.field}
            accessibilityLabel="Dia dos autorrelatos"
            value={day}
            onChangeText={setDay}
          />
          {rows.length === 0 && (
            <Text style={s.body}>Nenhum horário programado para hoje.</Text>
          )}
          {rows.map((ev, i) => (
            <View style={s.card} key={i}>
              <Text style={s.title}>{String(ev.name)}</Text>
              <Text style={s.body}>{String(ev.instruction)}</Text>
              <Text style={s.body}>{labelDate(ev.scheduledAt)}</Text>
              <Text style={s.label}>
                {ev.status === "TAKEN"
                  ? "Tomei (autorrelato)"
                  : ev.status === "NOT_TAKEN"
                    ? "Não tomei (autorrelato)"
                    : "Sem confirmação"}
              </Text>
              {Boolean(ev.reportedAt) && (
                <Text style={s.small}>
                  Resposta: {labelDate(ev.reportedAt)}
                </Text>
              )}
              {ev.status === "NO_CONFIRMATION" && (
                <>
                  <Button
                    label="Tomei"
                    onPress={() => {
                      void enqueue(`/patients/${patient}/medication-reports`, {
                        id: Crypto.randomUUID(),
                        planId: ev.planId,
                        scheduledAt: ev.scheduledAt,
                        status: "TAKEN",
                        reportedAt: new Date().toISOString(),
                      });
                    }}
                  />
                  <Button
                    secondary
                    label="Não tomei"
                    onPress={() => {
                      void enqueue(`/patients/${patient}/medication-reports`, {
                        id: Crypto.randomUUID(),
                        planId: ev.planId,
                        scheduledAt: ev.scheduledAt,
                        status: "NOT_TAKEN",
                        reportedAt: new Date().toISOString(),
                      });
                    }}
                  />
                </>
              )}
            </View>
          ))}
        </>
      )}
      {!historyOnly && module === "activity" && (
        <>
          <View style={s.notice}>
            <Text style={s.title}>Recomendação personalizada indisponível</Text>
            <Text style={s.body}>
              Critérios clínicos ainda aguardam aprovação. Esta tela registra a
              atividade que você informar; não autoriza exercício.
            </Text>
            {profile && (
              <Text style={s.body}>
                Orientações da equipe: {String(profile.professionalGuidance)}
                {"\n"}Restrições: {String(profile.restrictions)}
              </Text>
            )}
          </View>
          <View style={s.card}>
            <Text style={s.label}>Como você se sente?</Text>
            {[
              ["WELL", "Estou bem"],
              ["TIRED", "Estou cansado"],
              ["UNWELL", "Estou me sentindo mal"],
            ].map(([value = "", label = ""]) => (
              <Button
                key={value}
                secondary
                label={`${feeling === value ? "✓ " : ""}${label}`}
                onPress={() => setFeeling(value)}
              />
            ))}
            {feeling === "UNWELL" && (
              <Text style={s.body}>
                Não há sugestão de exercício. Siga as orientações da sua equipe
                e procure atendimento conforme a situação.
              </Text>
            )}
            <Text style={s.label}>Atividade realizada voluntariamente</Text>
            <TextInput
              accessibilityLabel="Atividade realizada"
              style={s.field}
              value={activity}
              onChangeText={setActivity}
            />
            <Text style={s.label}>Duração em minutos</Text>
            <TextInput
              accessibilityLabel="Duração em minutos"
              style={s.field}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
            <Text style={s.label}>Data e hora (ISO com fuso)</Text>
            <TextInput
              accessibilityLabel="Data e hora da atividade"
              style={s.field}
              value={when}
              onChangeText={setWhen}
            />
            <Text style={s.label}>Observações</Text>
            <TextInput
              style={s.field}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <Button
              label="Registrar atividade realizada"
              busy={busy}
              onPress={() => {
                void saveActivity();
              }}
            />
          </View>
        </>
      )}
      {module !== "medications" && module !== "food" && (
        <View style={s.section}>
          <Text style={s.title} accessibilityRole="header">
            Histórico
          </Text>
          {rows.length === 0 && !busy && (
            <Text style={s.body}>Nenhum registro disponível.</Text>
          )}
          {rows.map((r, i) => (
            <View style={s.card} key={String(r.id ?? i)}>
              {module === "blood-pressure" ? (
                <>
                  <Text style={s.title}>
                    {String(r.systolic)} / {String(r.diastolic)} mmHg
                  </Text>
                  <Text style={s.body}>Medição: {labelDate(r.measuredAt)}</Text>
                  <Text style={s.small}>
                    Origem:{" "}
                    {r.source === "PRINTED_DIARY"
                      ? "Diário transcrito"
                      : r.source === "OCR_CONFIRMED"
                        ? "Foto confirmada"
                        : r.source === "PROFESSIONAL"
                          ? "Profissional"
                          : "Digitação manual"}
                    . Enviado: {labelDate(r.syncedAt)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={s.title}>{String(r.type ?? "Registro")}</Text>
                  <Text style={s.body}>
                    {r.durationMinutes ? `${r.durationMinutes} minutos · ` : ""}
                    {labelDate(r.occurredAt ?? r.createdAt)}
                  </Text>
                  <Text style={s.body}>{String(r.notes ?? "")}</Text>
                </>
              )}
            </View>
          ))}
          {page > 0 && (
            <Button
              secondary
              label="Página anterior"
              onPress={() => setPage((p) => p - 1)}
            />
          )}{" "}
          {(page + 1) * 20 < total && (
            <Button
              secondary
              label="Próxima página"
              onPress={() => setPage((p) => p + 1)}
            />
          )}
        </View>
      )}
      {!historyOnly && patient && module === "blood-pressure" && (
        <PhotoFlow
          patientId={patient}
          purpose="PRESSURE_DISPLAY"
          onOcr={(r: OcrResult) => {
            setA(String(r.systolic));
            setB(String(r.diastolic));
            setPulse(r.pulse ? String(r.pulse) : "");
            setOcrDocument(r.id);
            setConfirmed(false);
            setNotice(
              "OCR concluído. Confira os números no formulário e confirme antes de salvar.",
            );
          }}
        />
      )}
      {patient && module === "food" && (
        <PhotoFlow patientId={patient} purpose="MEAL" />
      )}
      <Button
        secondary
        label="Atualizar histórico"
        onPress={() => {
          void load();
        }}
      />
      <Button
        label="Voltar ao início"
        onPress={() => router.dismissTo("/home")}
      />
    </Screen>
  );
}

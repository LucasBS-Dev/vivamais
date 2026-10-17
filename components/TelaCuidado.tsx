import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Text, TextInput, View, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Crypto from "expo-crypto";
import { useAutenticacao } from "../hooks/useAutenticacao";
import {
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
  Tela,
} from "./ElementosInterface";
import { estilos as s } from "./estilos";
import {
  interpretarPressao,
  type OperacaoPendente,
} from "../services/sincronizacao/regrasSincronizacao";
import {
  filaRegistros,
  queueStorageDescription,
} from "../services/sincronizacao/filaRegistros";
import { agendarLembretes } from "../services/lembretes/lembretes";
import type { PlanoLembretes } from "../services/lembretes/calculoLembretes";
import { FluxoFotografia, type ResultadoOcr } from "./FluxoFotografia";
import { GraficoPressao } from "./GraficoPressao";
import {
  memorizarPaciente,
  recuperarPaciente,
} from "../services/pacientes/identificacaoPaciente";
type LinhaDados = Record<string, unknown>;
type Pagina = {
  items: LinhaDados[];
  total: number;
  page: number;
  size: number;
};
const formatarData = (valor: unknown) =>
  new Date(String(valor)).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
const titulos: Record<string, string> = {
  "blood-pressure": "Minha Pressão",
  medications: "Meus Medicamentos",
  activity: "Atividade Física",
  food: "Minha Alimentação",
};
export function TelaCuidado({
  modulo: modulo,
  somenteHistorico: somenteHistorico = false,
  children,
}: {
  modulo: string;
  somenteHistorico?: boolean;
  children?: ReactNode;
}) {
  const parametros = useLocalSearchParams<{
    documento?: string;
    sistolica?: string;
    diastolica?: string;
    pulso?: string;
  }>();
  const { sessao: sessao, requisicao: requisicao } = useAutenticacao();
  const [paciente, definirPaciente] = useState(""),
    [linhas, definirLinhas] = useState<LinhaDados[]>([]),
    [planos, definirPlanos] = useState<PlanoLembretes[]>([]),
    [perfil, definirPerfil] = useState<LinhaDados | null>(null),
    [pagina, definirPagina] = useState(0),
    [total, definirTotal] = useState(0);
  const [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState(""),
    [aviso, definirAviso] = useState(""),
    [pendentes, definirPendentes] = useState<OperacaoPendente[]>([]),
    [a, setA] = useState(parametros.sistolica ?? ""),
    [b, setB] = useState(parametros.diastolica ?? ""),
    [pulso, definirPulso] = useState(parametros.pulso ?? ""),
    [confirmado, definirConfirmado] = useState(false),
    [dataHora, definirDataHora] = useState(new Date().toISOString()),
    [atividade, definirAtividade] = useState(""),
    [duracao, definirDuracao] = useState(""),
    [estadoInformado, definirEstadoInformado] = useState(""),
    [observacoes, definirObservacoes] = useState("");
  const idTitular = sessao?.usuario.id ?? "";
  const [documentoOcr, definirDocumentoOcr] = useState<string | null>(
    parametros.documento ?? null,
  );
  const [filtroInicial, definirFiltroInicial] = useState(""),
    [filtroFinal, definirFiltroFinal] = useState(""),
    [periodo, definirPeriodo] = useState(""),
    [diaAutorrelatos, definirDia] = useState(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    );
  const rota =
    modulo === "blood-pressure"
      ? "readings"
      : modulo === "activity"
        ? "activities"
        : modulo === "food"
          ? "meals"
          : "medication-events";
  const atualizarFila = useCallback(async () => {
    if (idTitular) definirPendentes(await filaRegistros.read(idTitular));
  }, [idTitular]);
  const sincronizar = useCallback(
    async (force = false) => {
      if (!idTitular) return;
      try {
        if (force) await filaRegistros.retry(idTitular);
        await filaRegistros.sync(idTitular, (caminho, corpo) =>
          requisicao(caminho, { method: "POST", body: corpo }),
        );
        await atualizarFila();
      } catch (e) {
        definirErro(e instanceof Error ? e.message : "Fila indisponível.");
      }
    },
    [idTitular, requisicao, atualizarFila],
  );
  const carregar = useCallback(async () => {
    if (!sessao) return;
    definirOcupado(true);
    definirErro("");
    try {
      const pacienteConsultado = await requisicao<{ id: string }>(
        "/patients/me",
      );
      definirPaciente(pacienteConsultado.id);
      await memorizarPaciente(idTitular, pacienteConsultado.id);
      const diaAtual = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const dados = await requisicao<Pagina | LinhaDados[]>(
        `/patients/${pacienteConsultado.id}/${rota}?${modulo === "medications" ? `date=${diaAutorrelatos || diaAtual}` : `page=${pagina}&size=20${modulo === "blood-pressure" ? periodo : ""}`}`,
      );
      definirLinhas(Array.isArray(dados) ? dados : dados.items);
      definirTotal(Array.isArray(dados) ? dados.length : dados.total);
      if (modulo === "medications") {
        const planosMedicamentos = await requisicao<PlanoLembretes[]>(
          `/patients/${pacienteConsultado.id}/medications`,
        );
        definirPlanos(planosMedicamentos);
        if (Platform.OS !== "web")
          definirAviso(
            await agendarLembretes(idTitular, planosMedicamentos, false),
          );
      }
      if (modulo === "activity")
        definirPerfil(
          await requisicao<LinhaDados | null>(
            `/patients/${pacienteConsultado.id}/activity-profile`,
          ),
        );
    } catch (e) {
      const saved = await recuperarPaciente(idTitular).catch(() => null);
      if (saved) definirPaciente(saved);
      definirErro(
        e instanceof Error ? e.message : "Não foi possível atualizar.",
      );
    } finally {
      definirOcupado(false);
    }
  }, [
    requisicao,
    sessao,
    idTitular,
    rota,
    modulo,
    pagina,
    periodo,
    diaAutorrelatos,
  ]);
  useEffect(() => {
    void carregar();
    void atualizarFila();
    const timer = setInterval(() => {
      void sincronizar();
    }, 15000);
    return () => clearInterval(timer);
  }, [carregar, atualizarFila, sincronizar]);
  async function enfileirar(caminho: string, corpo: LinhaDados) {
    if (!sessao || !paciente) return;
    definirOcupado(true);
    definirErro("");
    try {
      await filaRegistros.enqueue({
        id: String(corpo.id),
        owner: idTitular,
        path: caminho,
        body: corpo,
      });
      await sincronizar(true);
      const restantes = await filaRegistros.read(idTitular);
      definirPendentes(restantes);
      definirAviso(
        restantes.some((x) => x.id === corpo.id)
          ? "Registro protegido na fila. Aguardando envio para a API."
          : "Registro enviado e salvo na API.",
      );
      if (!restantes.some((x) => x.id === corpo.id)) await carregar();
    } catch (e) {
      definirErro(
        e instanceof Error
          ? e.message
          : "Não foi possível proteger o registro.",
      );
      return false;
    } finally {
      definirOcupado(false);
    }
    return true;
  }
  async function salvarPressao() {
    try {
      const pressao = interpretarPressao(a, b);
      if (!confirmado) {
        definirErro(
          `Confira ${pressao.systolic} / ${pressao.diastolic} mmHg e confirme antes de salvar.`,
        );
        return;
      }
      const instanteEvento = new Date(dataHora);
      if (!Number.isFinite(instanteEvento.getTime()))
        throw new Error("Informe uma data e hora válidas no formato ISO.");
      const aceito = await enfileirar(`/patients/${paciente}/readings`, {
        id: Crypto.randomUUID(),
        systolic: pressao.systolic,
        diastolic: pressao.diastolic,
        pulse: pulso ? Number(pulso) : null,
        measuredAt: instanteEvento.toISOString(),
        source: documentoOcr ? "OCR_CONFIRMED" : "MANUAL",
        ocrDocumentId: documentoOcr,
        ocrConfirmed: documentoOcr ? true : undefined,
      });
      if (!aceito) return;
      setA("");
      setB("");
      definirPulso("");
      definirConfirmado(false);
      definirDocumentoOcr(null);
    } catch (e) {
      definirErro(e instanceof Error ? e.message : "Confira os números.");
    }
  }
  async function salvarAtividade() {
    if (!estadoInformado) {
      definirErro("Informe como você se sente antes de registrar.");
      return;
    }
    if (
      !atividade.trim() ||
      !Number.isInteger(Number(duracao)) ||
      Number(duracao) < 1
    ) {
      definirErro("Informe a atividade e a duração em minutos.");
      return;
    }
    try {
      const aceito = await enfileirar(`/patients/${paciente}/activities`, {
        id: Crypto.randomUUID(),
        type: atividade.trim(),
        durationMinutes: Number(duracao),
        occurredAt: new Date(dataHora).toISOString(),
        notes: observacoes,
        feeling: estadoInformado,
      });
      if (!aceito) return;
      definirEstadoInformado("");
      definirAtividade("");
      definirDuracao("");
      definirObservacoes("");
    } catch {
      definirErro("Confira a data e hora.");
    }
  }
  if (!sessao)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  return (
    <Tela>
      <MarcaViva />
      <Text style={s.title} accessibilityRole="header">
        {somenteHistorico ? "Meu Histórico" : (titulos[modulo] ?? "Histórico")}
      </Text>
      {children}
      {erro && <MensagemErro mensagem={erro} />}{" "}
      {aviso && (
        <Text accessibilityLiveRegion="polite" style={s.body}>
          {aviso}
        </Text>
      )}
      {ocupado && <Carregando />}
      <View style={s.notice}>
        <Text style={s.label}>
          {pendentes.length} registros pendentes de sincronização
        </Text>
        <Text style={s.small}>{queueStorageDescription}</Text>
        {pendentes.map((item) => (
          <Text key={item.id} style={s.small}>
            {item.state === "ERROR" ? "Falha / nova tentativa" : "Pendente"} ·{" "}
            {item.message ?? "Aguardando envio"}
          </Text>
        ))}
        <Botao
          secundario
          rotulo="Sincronizar agora"
          onPress={() => {
            void sincronizar(true).then(carregar);
          }}
        />
      </View>
      {!somenteHistorico && modulo === "blood-pressure" && (
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
            ["Pulso (opcional)", pulso, definirPulso],
          ].map(([label, valor, set]) => (
            <View key={String(label)}>
              <Text style={s.label}>{String(label)}</Text>
              <TextInput
                style={s.field}
                accessibilityLabel={String(label)}
                keyboardType="numeric"
                value={String(valor)}
                onChangeText={(v) => {
                  (set as (v: string) => void)(v);
                  definirConfirmado(false);
                }}
              />
            </View>
          ))}
          <Text style={s.label}>Data e hora da medição (ISO com fuso)</Text>
          <TextInput
            accessibilityLabel="Data e hora da medição"
            style={s.field}
            value={dataHora}
            onChangeText={definirDataHora}
          />
          {a && b && (
            <Text style={s.body}>
              {(() => {
                try {
                  const pacienteConsultado = interpretarPressao(a, b);
                  return `Confira: ${pacienteConsultado.systolic} / ${pacienteConsultado.diastolic} mmHg${pacienteConsultado.converted ? " (conversão de valores abreviados)" : ""}.`;
                } catch {
                  return "Confira os valores informados.";
                }
              })()}
            </Text>
          )}
          <Botao
            secundario
            rotulo={
              confirmado ? "Valores confirmados" : "Confirmar estes valores"
            }
            onPress={() => {
              try {
                interpretarPressao(a, b);
                definirConfirmado(true);
                definirErro("");
              } catch (e) {
                definirErro(
                  e instanceof Error ? e.message : "Confira os valores.",
                );
              }
            }}
          />
          <Botao
            rotulo="Salvar pressão"
            ocupado={ocupado}
            onPress={() => {
              void salvarPressao();
            }}
          />
        </View>
      )}
      {modulo === "blood-pressure" && (
        <View style={s.card}>
          <Text style={s.title}>Filtrar medições por período</Text>
          <Text style={s.label}>De (AAAA-MM-DD)</Text>
          <TextInput
            style={s.field}
            accessibilityLabel="Início do período"
            value={filtroInicial}
            onChangeText={definirFiltroInicial}
          />
          <Text style={s.label}>Até (AAAA-MM-DD)</Text>
          <TextInput
            style={s.field}
            accessibilityLabel="Fim do período"
            value={filtroFinal}
            onChangeText={definirFiltroFinal}
          />
          <Botao
            secundario
            rotulo="Aplicar período"
            onPress={() => {
              try {
                const start = filtroInicial
                    ? new Date(`${filtroInicial}T00:00:00-03:00`).toISOString()
                    : null,
                  end = filtroFinal
                    ? new Date(
                        `${filtroFinal}T23:59:59.999-03:00`,
                      ).toISOString()
                    : null;
                if (start && end && start > end) throw new Error();
                definirPeriodo(
                  `${start ? `&from=${encodeURIComponent(start)}` : ""}${end ? `&to=${encodeURIComponent(end)}` : ""}`,
                );
                definirPagina(0);
              } catch {
                definirErro("Informe um período válido.");
              }
            }}
          />
          <GraficoPressao
            readings={linhas.map((resposta) => ({
              systolic: Number(resposta.systolic),
              diastolic: Number(resposta.diastolic),
              measuredAt: String(resposta.measuredAt),
            }))}
          />
        </View>
      )}
      {modulo === "medications" && (
        <>
          <View style={s.card}>
            <Text style={s.body}>
              Plano definido pelo profissional. Respostas são autorrelatos. Sem
              confirmação não significa que a dose não foi tomada. Não tome dose
              extra por orientação deste aplicativo.
            </Text>
            <Botao
              secundario
              rotulo="Autorizar e agendar lembretes locais"
              onPress={() => {
                agendarLembretes(idTitular, planos, true)
                  .then(definirAviso)
                  .catch(() =>
                    definirErro(
                      "Não foi possível agendar notificações neste build.",
                    ),
                  );
              }}
            />
          </View>
          <Text style={s.title}>Planos da equipe</Text>
          {planos.map((plano) => (
            <View style={s.card} key={plano.id}>
              <Text style={s.label}>{plano.name}</Text>
              <Text style={s.body}>{plano.instruction}</Text>
              <Text style={s.body}>
                Horários: {plano.schedules.join(", ")} · {plano.timeZone}
              </Text>
              <Text style={s.small}>
                Vigência: {plano.startsOn} a {plano.endsOn || "sem data final"}{" "}
                · versão {plano.version}
              </Text>
            </View>
          ))}
          <Text style={s.label}>Dia dos autorrelatos (AAAA-MM-DD)</Text>
          <TextInput
            style={s.field}
            accessibilityLabel="Dia dos autorrelatos"
            value={diaAutorrelatos}
            onChangeText={definirDia}
          />
          {linhas.length === 0 && (
            <Text style={s.body}>Nenhum horário programado para hoje.</Text>
          )}
          {linhas.map((ev, i) => (
            <View style={s.card} key={i}>
              <Text style={s.title}>{String(ev.name)}</Text>
              <Text style={s.body}>{String(ev.instruction)}</Text>
              <Text style={s.body}>{formatarData(ev.scheduledAt)}</Text>
              <Text style={s.label}>
                {ev.status === "TAKEN"
                  ? "Tomei (autorrelato)"
                  : ev.status === "NOT_TAKEN"
                    ? "Não tomei (autorrelato)"
                    : "Sem confirmação"}
              </Text>
              {Boolean(ev.reportedAt) && (
                <Text style={s.small}>
                  Resposta: {formatarData(ev.reportedAt)}
                </Text>
              )}
              {ev.status === "NO_CONFIRMATION" && (
                <>
                  <Botao
                    rotulo="Tomei"
                    onPress={() => {
                      void enfileirar(
                        `/patients/${paciente}/medication-reports`,
                        {
                          id: Crypto.randomUUID(),
                          planId: ev.planId,
                          scheduledAt: ev.scheduledAt,
                          status: "TAKEN",
                          reportedAt: new Date().toISOString(),
                        },
                      );
                    }}
                  />
                  <Botao
                    secundario
                    rotulo="Não tomei"
                    onPress={() => {
                      void enfileirar(
                        `/patients/${paciente}/medication-reports`,
                        {
                          id: Crypto.randomUUID(),
                          planId: ev.planId,
                          scheduledAt: ev.scheduledAt,
                          status: "NOT_TAKEN",
                          reportedAt: new Date().toISOString(),
                        },
                      );
                    }}
                  />
                </>
              )}
            </View>
          ))}
        </>
      )}
      {!somenteHistorico && modulo === "activity" && (
        <>
          <View style={s.notice}>
            <Text style={s.title}>Recomendação personalizada indisponível</Text>
            <Text style={s.body}>
              Critérios clínicos ainda aguardam aprovação. Esta tela registra a
              atividade que você informar; não autoriza exercício.
            </Text>
            {perfil && (
              <Text style={s.body}>
                Orientações da equipe: {String(perfil.professionalGuidance)}
                {"\n"}Restrições: {String(perfil.restrictions)}
              </Text>
            )}
          </View>
          <View style={s.card}>
            <Text style={s.label}>Como você se sente?</Text>
            {[
              ["WELL", "Estou bem"],
              ["TIRED", "Estou cansado"],
              ["UNWELL", "Estou me sentindo mal"],
            ].map(([valor = "", label = ""]) => (
              <Botao
                key={valor}
                secundario
                rotulo={`${estadoInformado === valor ? "✓ " : ""}${label}`}
                onPress={() => definirEstadoInformado(valor)}
              />
            ))}
            {estadoInformado === "UNWELL" && (
              <Text style={s.body}>
                Não há sugestão de exercício. Siga as orientações da sua equipe
                e procure atendimento conforme a situação.
              </Text>
            )}
            <Text style={s.label}>Atividade realizada voluntariamente</Text>
            <TextInput
              accessibilityLabel="Atividade realizada"
              style={s.field}
              value={atividade}
              onChangeText={definirAtividade}
            />
            <Text style={s.label}>Duração em minutos</Text>
            <TextInput
              accessibilityLabel="Duração em minutos"
              style={s.field}
              keyboardType="numeric"
              value={duracao}
              onChangeText={definirDuracao}
            />
            <Text style={s.label}>Data e hora (ISO com fuso)</Text>
            <TextInput
              accessibilityLabel="Data e hora da atividade"
              style={s.field}
              value={dataHora}
              onChangeText={definirDataHora}
            />
            <Text style={s.label}>Observações</Text>
            <TextInput
              style={s.field}
              value={observacoes}
              onChangeText={definirObservacoes}
              multiline
            />
            <Botao
              rotulo="Registrar atividade realizada"
              ocupado={ocupado}
              onPress={() => {
                void salvarAtividade();
              }}
            />
          </View>
        </>
      )}
      {modulo !== "medications" && modulo !== "food" && (
        <View style={s.section}>
          <Text style={s.title} accessibilityRole="header">
            Histórico
          </Text>
          {linhas.length === 0 && !ocupado && (
            <Text style={s.body}>Nenhum registro disponível.</Text>
          )}
          {linhas.map((resposta, i) => (
            <View style={s.card} key={String(resposta.id ?? i)}>
              {modulo === "blood-pressure" ? (
                <>
                  <Text style={s.title}>
                    {String(resposta.systolic)} / {String(resposta.diastolic)}{" "}
                    mmHg
                  </Text>
                  <Text style={s.body}>
                    Medição: {formatarData(resposta.measuredAt)}
                  </Text>
                  <Text style={s.small}>
                    Origem:{" "}
                    {resposta.source === "PRINTED_DIARY"
                      ? "Diário transcrito"
                      : resposta.source === "OCR_CONFIRMED"
                        ? "Foto confirmada"
                        : resposta.source === "PROFESSIONAL"
                          ? "Profissional"
                          : "Digitação manual"}
                    . Enviado: {formatarData(resposta.syncedAt)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={s.title}>
                    {String(resposta.type ?? "Registro")}
                  </Text>
                  <Text style={s.body}>
                    {resposta.durationMinutes
                      ? `${resposta.durationMinutes} minutos · `
                      : ""}
                    {formatarData(resposta.occurredAt ?? resposta.createdAt)}
                  </Text>
                  <Text style={s.body}>{String(resposta.notes ?? "")}</Text>
                </>
              )}
            </View>
          ))}
          {pagina > 0 && (
            <Botao
              secundario
              rotulo="Página anterior"
              onPress={() =>
                definirPagina((pacienteConsultado) => pacienteConsultado - 1)
              }
            />
          )}{" "}
          {(pagina + 1) * 20 < total && (
            <Botao
              secundario
              rotulo="Próxima página"
              onPress={() =>
                definirPagina((pacienteConsultado) => pacienteConsultado + 1)
              }
            />
          )}
        </View>
      )}
      {!somenteHistorico && paciente && modulo === "blood-pressure" && (
        <FluxoFotografia
          idPaciente={paciente}
          finalidade="PRESSURE_DISPLAY"
          aoReconhecer={(resposta: ResultadoOcr) => {
            setA(String(resposta.systolic));
            setB(String(resposta.diastolic));
            definirPulso(resposta.pulse ? String(resposta.pulse) : "");
            definirDocumentoOcr(resposta.id);
            definirConfirmado(false);
            definirAviso(
              "OCR concluído. Confira os números no formulário e confirme antes de salvar.",
            );
          }}
        />
      )}
      {paciente && modulo === "food" && (
        <FluxoFotografia idPaciente={paciente} finalidade="MEAL" />
      )}
      <Botao
        secundario
        rotulo="Atualizar histórico"
        onPress={() => {
          void carregar();
        }}
      />
      <Botao
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
    </Tela>
  );
}

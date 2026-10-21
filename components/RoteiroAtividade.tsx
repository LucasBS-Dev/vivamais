import { Text } from "./TextoAcessivel";
import { Redirect, router } from "expo-router";
import { Pressable, View } from "react-native";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useRoteiroAtividade } from "../hooks/useRoteiroAtividade";
import { useDadosAtividade } from "../hooks/useDadosAtividade";
import { Tela, Botao, Carregando, MensagemErro } from "./ElementosInterface";
import { BarraNavegacao } from "./BarraNavegacao";
import { estilos as e } from "./estilos";
import { IlustracaoViva } from "./IlustracoesViva";
type Etapa =
  | "sentimento"
  | "pressao"
  | "informacoes"
  | "atividade"
  | "passos"
  | "video"
  | "alternativa";
export function RoteiroAtividade({ etapa }: { etapa: Etapa }) {
  const { sessao: sessao, restaurando: restaurando } = useAutenticacao(),
    roteiro = useRoteiroAtividade(),
    dados = useDadosAtividade();
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  const titulos = {
    sentimento: "Como você está se sentindo hoje?",
    pressao: "Você já verificou sua pressão hoje?",
    informacoes: "Apenas para confirmar:",
    atividade: "Sua atividade de hoje",
    passos: "Passo a passo da atividade",
    video: "Vídeo demonstrativo",
    alternativa: "Precisa de algo mais leve hoje?",
  };
  const selecao = (
    selecionado: boolean,
    rotulo: string,
    aoSelecionar: () => void,
    icone: string,
  ) => (
    <Pressable
      key={rotulo}
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionado }}
      accessibilityLabel={rotulo}
      onPress={aoSelecionar}
      style={{
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selecionado ? "#0079d8" : "#d7e6f5",
        backgroundColor: selecionado ? "#e5f3ff" : "#fff",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        minHeight: 70,
      }}
    >
      {etapa === "sentimento" ? (
        <IlustracaoViva
          nome={
            rotulo === "Estou bem"
              ? "bem"
              : rotulo === "Estou um pouco cansado"
                ? "cansado"
                : "mal"
          }
          tamanho={40}
        />
      ) : (
        <Text style={{ fontSize: 30, color: "#008d53" }}>{icone}</Text>
      )}
      <Text style={[e.body, { flex: 1 }]}>{rotulo}</Text>
    </Pressable>
  );
  return (
    <Tela rodape={<BarraNavegacao />}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar à atividade física"
        onPress={() => router.dismissTo("/atividade-fisica")}
      >
        <Text style={e.title}>‹　Atividade Física</Text>
      </Pressable>
      {["sentimento", "pressao", "informacoes"].includes(etapa) && (
        <Text
          style={{
            color: "#006dca",
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: "#e8f5ff",
            borderWidth: 1,
            borderColor: "#b5dcfb",
          }}
        >
          {etapa === "sentimento" ? "1" : etapa === "pressao" ? "2" : "3"} de 3
        </Text>
      )}
      <Text style={[e.title, { fontSize: 23 }]} accessibilityRole="header">
        {titulos[etapa]}
      </Text>
      {etapa === "sentimento" && (
        <>
          {selecao(
            roteiro.estadoInformado === "WELL",
            "Estou bem",
            () => roteiro.definirEstadoInformado("WELL"),
            "☺",
          )}
          {selecao(
            roteiro.estadoInformado === "TIRED",
            "Estou um pouco cansado",
            () => roteiro.definirEstadoInformado("TIRED"),
            "◉",
          )}
          {selecao(
            roteiro.estadoInformado === "UNWELL",
            "Estou com tontura ou me sentindo mal",
            () => roteiro.definirEstadoInformado("UNWELL"),
            "☹",
          )}
          <View style={[e.notice, { backgroundColor: "#ffeded" }]}>
            <Text style={e.body}>
              Esta resposta não autoriza exercício. Procure a orientação da sua
              equipe para avaliar sua situação.
            </Text>
          </View>
          <Botao
            rotulo="Continuar"
            desabilitado={!roteiro.estadoInformado}
            onPress={() => {
              if (roteiro.estadoInformado)
                router.push("/atividade-fisica/verificacao-pressao");
            }}
          />
        </>
      )}
      {etapa === "pressao" && (
        <>
          {selecao(
            roteiro.pressaoVerificada === true,
            "Sim, já verifiquei",
            () => roteiro.definirPressaoVerificada(true),
            "✓",
          )}
          {selecao(
            roteiro.pressaoVerificada === false,
            "Ainda não verifiquei",
            () => roteiro.definirPressaoVerificada(false),
            "○",
          )}
          <View style={e.card}>
            <Text style={e.label}>Sua última medição</Text>
            {dados.isPending ? (
              <Carregando />
            ) : dados.data?.ultimaMedicao ? (
              <>
                <Text style={e.title}>
                  {dados.data.ultimaMedicao.sistolica} /{" "}
                  {dados.data.ultimaMedicao.diastolica} mmHg
                </Text>
                <Text style={e.small}>
                  {new Date(
                    dados.data.ultimaMedicao.dataMedicao || "",
                  ).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </Text>
              </>
            ) : (
              <Text style={e.body}>
                Nenhuma medição disponível nesta consulta.
              </Text>
            )}
            <Botao
              secundario
              rotulo="Registrar pressão"
              onPress={() => router.push("/pressao")}
            />
          </View>
          <Botao
            rotulo="Continuar"
            desabilitado={roteiro.pressaoVerificada === null}
            onPress={() => {
              if (roteiro.pressaoVerificada !== null)
                router.push("/atividade-fisica/suas-informacoes");
            }}
          />
          <View style={e.notice}>
            <Text style={e.body}>
              O aplicativo não usa estes valores para liberar atividade. A
              recomendação individual depende da sua equipe.
            </Text>
          </View>
        </>
      )}
      {etapa === "informacoes" && (
        <>
          {dados.isError && (
            <MensagemErro mensagem="Não foi possível consultar o perfil funcional." />
          )}
          {[
            [
              "Idade",
              dados.data?.idade == null ? null : `${dados.data.idade} anos`,
            ],
            ["Mobilidade", dados.data?.perfil?.mobilidade],
            ["Equilíbrio", dados.data?.perfil?.equilibrio],
            ["Restrições", dados.data?.perfil?.restricoes],
            ["Orientações da equipe", dados.data?.perfil?.orientacoes],
          ].map(([rotulo, valor]) => (
            <View style={e.notice} key={rotulo}>
              <Text style={e.label}>{rotulo}</Text>
              <Text style={e.body}>
                {valor || "Não registrado pela equipe."}
              </Text>
            </View>
          ))}
          <Botao
            rotulo="Ver orientações da atividade"
            onPress={() => router.push("/atividade-fisica/atividade-hoje")}
          />
          <Botao
            secundario
            rotulo="Consultar meu perfil"
            onPress={() => router.push("/perfil")}
          />
        </>
      )}
      {["atividade", "passos", "video", "alternativa"].includes(etapa) && (
        <>
          <View
            style={[
              e.card,
              {
                backgroundColor:
                  etapa === "alternativa" ? "#f2e9ff" : "#e8f7ef",
              },
            ]}
          >
            <Text style={e.label}>
              {etapa === "video"
                ? "Vídeo revisado não fornecido"
                : "Recomendação personalizada indisponível"}
            </Text>
            <Text style={e.body}>
              Critérios clínicos e materiais de atividade ainda precisam de
              aprovação profissional. Não há exercício selecionado
              automaticamente para você.
            </Text>
            {dados.data?.perfil?.orientacoes && (
              <Text style={e.body}>
                Orientação registrada pela equipe:{" "}
                {dados.data.perfil.orientacoes}
              </Text>
            )}
          </View>
          <Botao
            rotulo="Registrar atividade já realizada"
            onPress={() => router.push("/atividade-fisica/registro")}
          />
          {etapa === "atividade" && (
            <>
              <Botao
                secundario
                rotulo="Passo a passo e materiais"
                onPress={() => router.push("/atividade-fisica/passo-a-passo")}
              />
              <Botao
                secundario
                rotulo="Hoje preciso de algo mais leve"
                onPress={() => router.push("/atividade-fisica/alternativa")}
              />
            </>
          )}
          {etapa === "passos" && (
            <Botao
              secundario
              rotulo="Vídeo demonstrativo"
              onPress={() => router.push("/atividade-fisica/video")}
            />
          )}
          <Botao
            secundario
            rotulo="Ver meu histórico de atividades"
            onPress={() => router.push("/atividade-fisica/historico")}
          />
        </>
      )}
    </Tela>
  );
}

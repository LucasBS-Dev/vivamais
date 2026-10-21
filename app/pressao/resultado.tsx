import { Text } from "../../components/TextoAcessivel";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { useResultadoPressao } from "../../hooks/useResultadoPressao";
import {
  Tela,
  Botao,
  MensagemErro,
  Carregando,
} from "../../components/ElementosInterface";
import { estilos as e } from "../../components/estilos";
export default function ResultadoPressao() {
  const { sessao: sessao } = useAutenticacao(),
    parametros = useLocalSearchParams<{ id?: string; paciente?: string }>(),
    resultado = useResultadoPressao(
      parametros.paciente || "",
      parametros.id || "",
    );
  if (!sessao) return <Redirect href="/acesso" />;
  return (
    <Tela>
      <Text style={[e.title, { fontSize: 23 }]} accessibilityRole="header">
        Minha Pressão
      </Text>
      {!parametros.id || !parametros.paciente ? (
        <MensagemErro mensagem="Registre uma medição ou consulte seu histórico para ver os valores salvos." />
      ) : resultado.isPending ? (
        <Carregando />
      ) : resultado.isError ? (
        <MensagemErro mensagem="Não foi possível consultar o registro. Verifique sua conexão." />
      ) : (
        resultado.data && (
          <>
            <Text
              style={{
                alignSelf: "center",
                fontSize: 58,
                color: resultado.data.pendente ? "#0077d4" : "#008642",
              }}
            >
              {resultado.data.pendente ? "◷" : "✓"}
            </Text>
            <Text
              style={[
                e.label,
                {
                  textAlign: "center",
                  color: resultado.data.pendente ? "#005295" : "#006c3b",
                },
              ]}
            >
              {resultado.data.pendente
                ? "Registro protegido, aguardando sincronização"
                : "Pressão registrada com sucesso!"}
            </Text>
            <View
              style={[
                e.card,
                {
                  backgroundColor: "#eaf5ff",
                  alignItems: "center",
                  marginVertical: 15,
                },
              ]}
            >
              <Text style={e.body}>Pressão</Text>
              <Text style={[e.title, { fontSize: 32 }]}>
                {resultado.data.sistolica} / {resultado.data.diastolica}{" "}
                <Text style={e.body}>mmHg</Text>
              </Text>
              <Text style={e.body}>
                Data:{" "}
                {new Date(resultado.data.dataMedicao || "").toLocaleString(
                  "pt-BR",
                  { timeZone: "America/Sao_Paulo" },
                )}
              </Text>
            </View>
            {resultado.data.pendente && (
              <Text style={e.small}>
                Não feche a aba do navegador enquanto houver envio pendente. O
                resultado será atualizado após a confirmação do envio.
              </Text>
            )}
          </>
        )
      )}
      <Botao
        secundario
        rotulo="Ver meu histórico"
        onPress={() => router.replace("/pressao/historico")}
      />
      <Botao
        secundario
        rotulo="Registrar novamente"
        onPress={() => router.replace("/pressao/digitar")}
      />
      <Botao
        secundario
        rotulo="Atualizar registro"
        onPress={() => {
          void resultado.refetch();
        }}
      />
    </Tela>
  );
}

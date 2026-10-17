import { router } from "expo-router";
import { Text } from "react-native";
import {
  Tela,
  Botao,
  Carregando,
  MensagemErro,
} from "../../components/ElementosInterface";
import { FluxoFotografia } from "../../components/FluxoFotografia";
import { useResumoPaciente } from "../../hooks/useResumoPaciente";
export default function FotoPressao() {
  const resumo = useResumoPaciente();
  return (
    <Tela>
      <Text
        accessibilityRole="header"
        style={{ fontSize: 24, color: "#00376b", fontWeight: "700" }}
      >
        Minha Pressão
      </Text>
      {resumo.isPending ? (
        <Carregando />
      ) : resumo.data ? (
        <FluxoFotografia
          idPaciente={resumo.data.id}
          finalidade="PRESSURE_DISPLAY"
          aoReconhecer={(resultado) =>
            router.navigate({
              pathname: "/pressao/digitar",
              params: {
                documento: resultado.id,
                sistolica: String(resultado.systolic),
                diastolica: String(resultado.diastolic),
                pulso: resultado.pulse ? String(resultado.pulse) : "",
              },
            })
          }
        />
      ) : (
        <MensagemErro mensagem="Conecte-se à API para enviar a foto privada." />
      )}
      <Botao
        secundario
        rotulo="Digitar os valores"
        onPress={() => router.navigate("/pressao/digitar")}
      />
    </Tela>
  );
}

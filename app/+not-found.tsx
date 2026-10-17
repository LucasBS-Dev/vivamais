import { router } from "expo-router";
import { Text } from "react-native";
import { MarcaViva, Botao, Tela } from "../components/ElementosInterface";
import { estilos as s } from "../components/estilos";
export default function NotFound() {
  return (
    <Tela>
      <MarcaViva />
      <Text style={s.title} accessibilityRole="header">
        Não encontramos esta página
      </Text>
      <Botao rotulo="Voltar ao início" onPress={() => router.replace("/")} />
    </Tela>
  );
}

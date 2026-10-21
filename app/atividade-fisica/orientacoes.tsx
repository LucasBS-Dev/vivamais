import { Text } from "../../components/TextoAcessivel";
import { router } from "expo-router";
import { View } from "react-native";
import { Tela, Botao } from "../../components/ElementosInterface";
import { BarraNavegacao } from "../../components/BarraNavegacao";
import { estilos as e } from "../../components/estilos";
export default function OrientacoesAtividade() {
  return (
    <Tela rodape={<BarraNavegacao />}>
      <Text style={e.title} accessibilityRole="header">
        Mensagens e orientações
      </Text>
      <View style={e.notice}>
        <Text style={e.label}>💡 Orientações da sua equipe</Text>
        <Text style={e.body}>
          Converse com o profissional responsável sobre atividade física e suas
          necessidades.
        </Text>
      </View>
      <View style={[e.card, { backgroundColor: "#e6f9ef" }]}>
        <Text style={e.label}>Lembre-se</Text>
        <Text style={e.body}>
          O aplicativo registra suas informações. A recomendação personalizada
          ainda depende de critérios clínicos aprovados.
        </Text>
      </View>
      <View style={[e.card, { backgroundColor: "#f2e9ff" }]}>
        <Text style={e.label}>A equipe de saúde está com você</Text>
        <Text style={e.body}>
          Veja as orientações registradas no seu perfil e leve suas dúvidas à
          consulta.
        </Text>
      </View>
      <Botao rotulo="Meu Perfil" onPress={() => router.push("/perfil")} />
    </Tela>
  );
}

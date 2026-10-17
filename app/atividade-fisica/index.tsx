import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { Tela, Botao } from "../../components/ElementosInterface";
import { BarraNavegacao } from "../../components/BarraNavegacao";
import { estilos as e } from "../../components/estilos";
export default function EntradaAtividade() {
  return (
    <Tela>
      <Text style={e.title} accessibilityRole="header">
        Atividade Física
      </Text>
      <Image
        source={require("../../assets/images/idosos-atividade.png")}
        style={{
          width: "100%",
          height: 230,
          resizeMode: "cover",
          borderRadius: 12,
        }}
        accessibilityLabel="Ilustração de idosos em movimento"
      />
      <Text style={[e.title, { textAlign: "center" }]}>
        Movimentar o corpo faz parte do cuidado
      </Text>
      <Text style={[e.body, { textAlign: "center" }]}>
        Consulte as orientações da sua equipe e registre a atividade que você
        realizou.
      </Text>
      <Botao
        rotulo="Ver minhas informações"
        onPress={() => router.push("/atividade-fisica/como-esta-hoje")}
      />
      <View style={e.notice}>
        <Text style={e.body}>
          ✓ Perfil informado pela equipe{"\n"}✓ Histórico compartilhado{"\n"}✓
          Recomendações personalizadas aguardam revisão clínica
        </Text>
      </View>
      <Botao
        secundario
        rotulo="Registrar atividade realizada"
        onPress={() => router.push("/atividade-fisica/registro")}
      />
      <BarraNavegacao />
    </Tela>
  );
}

import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Tela } from "../../components/ElementosInterface";
import { estilos as e } from "../../components/estilos";
export default function EntradaPressao() {
  return (
    <Tela>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      >
        <Text style={e.title}>‹　Minha Pressão</Text>
      </Pressable>
      <View style={e.section}>
        <Text style={e.body}>
          Registre sua pressão de hoje. Você pode digitar os valores ou tirar
          uma foto do aparelho.
        </Text>
      </View>
      {[
        {
          titulo: "Digitar os valores",
          icone: "▦",
          cor: "#ffedf0",
          texto: "#c91f3c",
          rota: "/pressao/digitar",
        },
        {
          titulo: "Tirar foto do aparelho",
          icone: "▣",
          cor: "#e3f2ff",
          texto: "#0063ba",
          rota: "/pressao/foto",
        },
        {
          titulo: "Ver meu histórico",
          icone: "▥",
          cor: "#e6f9ef",
          texto: "#006f55",
          rota: "/pressao/historico",
        },
      ].map((item) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.titulo}
          key={item.rota}
          onPress={() => router.push(item.rota)}
          style={{
            backgroundColor: item.cor,
            padding: 20,
            borderRadius: 15,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            minHeight: 78,
          }}
        >
          <Text style={{ fontSize: 30, color: item.texto }}>{item.icone}</Text>
          <Text style={{ fontSize: 19, color: item.texto, flex: 1 }}>
            {item.titulo}
          </Text>
          <Text style={{ fontSize: 26, color: item.texto }}>›</Text>
        </Pressable>
      ))}
      <View style={e.notice}>
        <Text style={e.label}>💡 Dica</Text>
        <Text style={e.body}>
          Confira os valores no aparelho e as orientações da sua equipe. A
          câmera do celular não mede pressão.
        </Text>
      </View>
    </Tela>
  );
}

import { Image, View } from "react-native";
import { router } from "expo-router";
import { Tela, Botao } from "../../components/ElementosInterface";
import { Text } from "../../components/TextoAcessivel";
import { estilos as e } from "../../components/estilos";
const imagens = [
  {
    nome: "Movimentos de braços sentado",
    imagem: require("../../assets/images/individuais/03_exercicios/bracos_sentado.png"),
  },
  {
    nome: "Movimentos de ombros",
    imagem: require("../../assets/images/individuais/03_exercicios/ombros.png"),
  },
  {
    nome: "Movimentos dos pés sentado",
    imagem: require("../../assets/images/individuais/03_exercicios/pes_sentado.png"),
  },
  {
    nome: "Caminhada leve",
    imagem: require("../../assets/images/individuais/03_exercicios/caminhada_leve.png"),
  },
  {
    nome: "Alongamento leve",
    imagem: require("../../assets/images/individuais/03_exercicios/alongamento_leve.png"),
  },
];
export default function IlustracoesAtividades() {
  return (
    <Tela>
      <Text style={e.title} accessibilityRole="header">
        Ilustrações das atividades
      </Text>
      <Text style={e.body}>
        Ilustrações para reconhecer as atividades. Sua equipe define as
        atividades adequadas ao seu acompanhamento. Os passos, a duração
        recomendada e o vídeo ainda aguardam material aprovado.
      </Text>
      {imagens.map((item) => (
        <View style={e.card} key={item.nome}>
          <Image
            source={item.imagem}
            style={{ width: "100%", height: 160, resizeMode: "contain" }}
            accessibilityLabel={`Ilustração: ${item.nome}`}
          />
          <Text style={e.label}>{item.nome}</Text>
          <Botao
            secundario
            rotulo={`Registrar ${item.nome.toLocaleLowerCase("pt-BR")} que já realizei`}
            onPress={() =>
              router.push({
                pathname: "/atividade-fisica/registro",
                params: { atividade: item.nome },
              })
            }
          />
        </View>
      ))}
      <Botao
        rotulo="Registrar atividade que já realizei"
        onPress={() => router.push("/atividade-fisica/registro")}
      />
      <Botao
        secundario
        rotulo="Voltar à atividade física"
        onPress={() => router.dismissTo("/atividade-fisica")}
      />
    </Tela>
  );
}

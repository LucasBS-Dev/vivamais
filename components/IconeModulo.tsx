import { Image } from "react-native";
const imagens = {
  pressao: require("../assets/images/icone-pressao.png"),
  medicamentos: require("../assets/images/icone-medicamentos.png"),
  alimentacao: require("../assets/images/icone-alimentacao.png"),
  atividade: require("../assets/images/icone-atividade.png"),
};
export function IconeModulo({
  nome,
  tamanho = 48,
}: {
  nome: keyof typeof imagens;
  tamanho?: number;
}) {
  return (
    <Image
      source={imagens[nome]}
      style={{ width: tamanho, height: tamanho, resizeMode: "contain" }}
      accessible={false}
    />
  );
}

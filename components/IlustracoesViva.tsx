import { Image } from "react-native";

export const ilustracoes = {
  logo: require("../assets/images/individuais/01_logos/logo_viva_mais_sem_slogan.png"),
  slogan: require("../assets/images/individuais/01_logos/logo_viva_mais_com_slogan.png"),
  idosos: require("../assets/images/individuais/02_personagens/idosos_atividade_fisica.png"),
  idosa: require("../assets/images/individuais/02_personagens/idosa_perfil.png"),
  profissionais: require("../assets/images/individuais/02_personagens/profissionais_de_saude.png"),
  bem: require("../assets/images/individuais/06_humor/estou_bem.png"),
  cansado: require("../assets/images/individuais/06_humor/um_pouco_cansado.png"),
  mal: require("../assets/images/individuais/06_humor/tontura_ou_mal_estar.png"),
  confirmado: require("../assets/images/individuais/07_acoes/confirmado.png"),
  lembrete: require("../assets/images/individuais/07_acoes/lembrete.png"),
  calendario: require("../assets/images/individuais/07_acoes/calendario.png"),
  grafico: require("../assets/images/individuais/07_acoes/grafico.png"),
  foto: require("../assets/images/individuais/07_acoes/foto.png"),
  horario: require("../assets/images/individuais/07_acoes/horario.png"),
  movimento: require("../assets/images/individuais/08_cards/atividade_fisica.png"),
  alimentacao: require("../assets/images/individuais/08_cards/registro_alimentacao.png"),
  cuidado: require("../assets/images/individuais/08_cards/planejamento_cuidado.png"),
};
export function IlustracaoViva({
  nome,
  tamanho = 40,
  descricao,
}: {
  nome: keyof typeof ilustracoes;
  tamanho?: number;
  descricao?: string;
}) {
  return (
    <Image
      source={ilustracoes[nome]}
      style={{ width: tamanho, height: tamanho, resizeMode: "contain" }}
      accessible={!!descricao}
      accessibilityLabel={descricao}
    />
  );
}

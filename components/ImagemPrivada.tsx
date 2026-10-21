import { Text } from "./TextoAcessivel";
import { useEffect, useState } from "react";
import { Image } from "react-native";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { obterLinkFotoPrivada } from "../services/alimentacao/refeicoes";
import { enderecoApi } from "../services/api";
import { estilos as e } from "./estilos";
export function ImagemPrivada({ idArquivo }: { idArquivo: string }) {
  const { requisicao } = useAutenticacao(),
    [endereco, definirEndereco] = useState(""),
    [erro, definirErro] = useState(false);
  useEffect(() => {
    let ativo = true;
    definirEndereco("");
    definirErro(false);
    obterLinkFotoPrivada(requisicao, idArquivo)
      .then((resposta) => {
        if (ativo)
          definirEndereco(new URL(resposta.path, enderecoApi).toString());
      })
      .catch(() => {
        if (ativo) definirErro(true);
      });
    return () => {
      ativo = false;
    };
  }, [requisicao, idArquivo]);
  if (erro)
    return (
      <Text style={e.small}>
        Foto privada indisponível ou link expirado. Atualize a lista.
      </Text>
    );
  return endereco ? (
    <Image
      source={{ uri: endereco }}
      style={{
        width: "100%",
        height: 220,
        resizeMode: "contain",
        borderRadius: 12,
      }}
      accessibilityLabel="Foto privada da refeição"
      onError={() => definirErro(true)}
    />
  ) : (
    <Text style={e.small} accessibilityLiveRegion="polite">
      Carregando a foto privada…
    </Text>
  );
}

import { Redirect, router } from "expo-router";
import { View } from "react-native";
import { Text } from "../components/TextoAcessivel";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useDadosAtividade } from "../hooks/useDadosAtividade";
import {
  Tela,
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
} from "../components/ElementosInterface";
import { estilos as e } from "../components/estilos";
import { BarraNavegacao } from "../components/BarraNavegacao";
export default function Mensagens() {
  const { sessao, restaurando } = useAutenticacao(),
    dados = useDadosAtividade();
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  if (sessao.usuario.papel !== "PATIENT") return <Redirect href="/inicio" />;
  return (
    <Tela rodape={<BarraNavegacao />}>
      <MarcaViva />
      <Text style={e.title} accessibilityRole="header">
        Orientações da minha equipe
      </Text>
      {dados.isPending && <Carregando />}
      {dados.isError && (
        <MensagemErro mensagem="Não foi possível consultar as orientações." />
      )}
      {dados.data && (
        <View style={e.card}>
          <Text style={e.label}>Orientação registrada pelo profissional</Text>
          <Text style={e.body}>
            {dados.data.perfil?.orientacoes ||
              "Sua equipe ainda não registrou orientações neste perfil."}
          </Text>
        </View>
      )}
      <Text style={e.small}>
        Estas informações são consultadas no seu perfil de acompanhamento. Para
        enviar dúvidas, converse com o profissional responsável.
      </Text>
      <Botao
        secundario
        rotulo="Atualizar orientações"
        onPress={() => {
          void dados.refetch();
        }}
      />
      <Botao
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
    </Tela>
  );
}

import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { useAutenticacao } from "../hooks/useAutenticacao";
import {
  MarcaViva,
  Botao,
  Carregando,
  Tela,
} from "../components/ElementosInterface";
import { router } from "expo-router";
import { estilos as s } from "../components/estilos";

export default function BoasVindas() {
  const { sessao: sessao, restaurando: restaurando } = useAutenticacao();
  if (restaurando)
    return (
      <Tela>
        <MarcaViva />
        <Carregando rotulo="Verificando sua sessão…" />
      </Tela>
    );
  if (sessao) return <Redirect href="/inicio" />;
  return (
    <Tela>
      <MarcaViva />
      <View style={[s.accentCard, { paddingVertical: 40, marginTop: 24 }]}>
        <Text style={s.eyebrow}>SEU CUIDADO, MAIS PERTO</Text>
        <Text style={s.display} accessibilityRole="header">
          Bem-vindo ao{"\n"}Viva+
        </Text>
        <Text style={s.body}>
          Um espaço simples para acompanhar seu cuidado com a equipe de saúde.
        </Text>
      </View>
      <View style={s.section}>
        <Text style={s.title} accessibilityRole="header">
          Um passo de cada vez
        </Text>
        <Text style={s.body}>
          Entre com a conta de teste fornecida pela instituição para conhecer a
          demonstração.
        </Text>
      </View>
      <Botao
        rotulo="Começar"
        onPress={() => router.push("/acesso")}
        testID="start-button"
      />
      <Text style={s.small}>
        Demonstração acadêmica • Somente dados sintéticos. Registros
        sincronizados com sua equipe. Este aplicativo não oferece diagnóstico ou
        atendimento de emergência.
      </Text>
    </Tela>
  );
}

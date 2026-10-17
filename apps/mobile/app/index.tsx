import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { useSession } from "../src/auth/session";
import { Brand, Button, Loading, Screen } from "../src/components/ui";
import { router } from "expo-router";
import { styles as s } from "../src/theme/styles";

export default function Welcome() {
  const { session, restoring } = useSession();
  if (restoring)
    return (
      <Screen>
        <Brand />
        <Loading label="Verificando sua sessão…" />
      </Screen>
    );
  if (session) return <Redirect href="/home" />;
  return (
    <Screen>
      <Brand />
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
      <Button
        label="Começar"
        onPress={() => router.push("/login")}
        testID="start-button"
      />
      <Text style={s.small}>
        Demonstração acadêmica • Somente dados sintéticos. Registros
        sincronizados com sua equipe. Este aplicativo não oferece diagnóstico ou
        atendimento de emergência.
      </Text>
    </Screen>
  );
}

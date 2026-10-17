import { useState } from "react";
import { Redirect, router } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { useSession } from "../src/auth/session";
import {
  Brand,
  Button,
  ErrorMessage,
  Loading,
  Screen,
} from "../src/components/ui";
import { styles as s } from "../src/theme/styles";

export default function Login() {
  const { session, restoring, notice, signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !password) {
      setError("Informe seu e-mail e sua senha.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Confira o formato do seu e-mail.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      setPassword("");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (restoring)
    return (
      <Screen>
        <Brand />
        <Loading />
      </Screen>
    );
  if (session) return <Redirect href="/home" />;
  return (
    <Screen>
      <Brand />
      <View style={s.section}>
        <Text style={s.title} accessibilityRole="header">
          Vamos entrar?
        </Text>
        <Text style={s.body}>
          Use seu e-mail e sua senha. Sua conta é individual.
        </Text>
      </View>
      {notice && (
        <View style={s.notice}>
          <Text style={s.body} accessibilityLiveRegion="polite">
            {notice}
          </Text>
        </View>
      )}
      <View style={s.card}>
        <View style={s.section}>
          <Text style={s.label}>E-mail</Text>
          <TextInput
            testID="email-input"
            accessibilityLabel="E-mail"
            value={email}
            onChangeText={setEmail}
            style={s.field}
            autoComplete="email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
            textContentType="username"
            placeholder="seu.nome@exemplo.org"
            placeholderTextColor="#526b78"
          />
        </View>
        <View style={s.section}>
          <Text style={s.label}>Senha</Text>
          <TextInput
            testID="password-input"
            accessibilityLabel="Senha"
            value={password}
            onChangeText={setPassword}
            style={s.field}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={!busy}
            textContentType="password"
            onSubmitEditing={() => {
              if (!busy) void submit();
            }}
            returnKeyType="go"
          />
        </View>
        {error && <ErrorMessage message={error} />}
        <Button
          label="Entrar"
          testID="login-button"
          busy={busy}
          onPress={() => {
            void submit();
          }}
        />
      </View>
      <Button
        secondary
        label="Ativar conta ou usar código de recuperação"
        onPress={() => router.push("/activate")}
      />
      <Text style={s.muted}>
        Precisa de um código? Procure o profissional responsável pela
        demonstração. O portal emite recuperação assistida com confirmação de
        identidade pela equipe.
      </Text>
      <Text style={s.small}>
        Somente contas de teste. Não envie informações de saúde reais.
      </Text>
    </Screen>
  );
}

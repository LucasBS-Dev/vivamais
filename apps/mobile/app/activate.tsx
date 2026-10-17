import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { api } from "../src/lib/api";
import { Screen, Brand, Button, ErrorMessage } from "../src/components/ui";
import { styles as s } from "../src/theme/styles";
export default function Activate() {
  const [token, setToken] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [done, setDone] = useState(false);
  async function activate() {
    setMessage("");
    if (password.length < 12 || password !== confirm) {
      setMessage("Use pelo menos 12 caracteres e confirme a mesma senha.");
      return;
    }
    setBusy(true);
    try {
      await api("/auth/activate", {
        method: "POST",
        body: { token: token.trim(), password },
      });
      setDone(true);
      setToken("");
      setPassword("");
      setConfirm("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível ativar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Brand />
      <Text accessibilityRole="header" style={s.title}>
        Ativar ou recuperar conta
      </Text>
      {done ? (
        <View style={s.card}>
          <Text style={s.body}>
            Conta ativada. Entre com seu e-mail e a nova senha.
          </Text>
          <Button
            label="Ir para entrar"
            onPress={() => router.dismissTo("/login")}
          />
        </View>
      ) : (
        <View style={s.card}>
          <Text style={s.body}>
            Use o código de uso único entregue pelo profissional autorizado. Ele
            expira em 24 horas.
          </Text>
          {[
            ["Código de ativação", token, setToken, false],
            ["Nova senha", password, setPassword, true],
            ["Confirme a senha", confirm, setConfirm, true],
          ].map(([label, value, set, secure]) => (
            <View key={String(label)}>
              <Text style={s.label}>{String(label)}</Text>
              <TextInput
                style={s.field}
                accessibilityLabel={String(label)}
                value={String(value)}
                onChangeText={set as (v: string) => void}
                secureTextEntry={Boolean(secure)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}
          {message && <ErrorMessage message={message} />}
          <Button
            label="Ativar conta"
            busy={busy}
            onPress={() => {
              void activate();
            }}
          />
        </View>
      )}
      <Button
        secondary
        label="Voltar ao acesso"
        onPress={() => router.dismissTo("/login")}
      />
    </Screen>
  );
}

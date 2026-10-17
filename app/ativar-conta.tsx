import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { api } from "../services/api";
import {
  Tela,
  MarcaViva,
  Botao,
  MensagemErro,
} from "../components/ElementosInterface";
import { estilos as s } from "../components/estilos";
export default function AtivarConta() {
  const [token, definirToken] = useState(""),
    [senha, definirSenha] = useState(""),
    [confirmacao, definirConfirmacao] = useState(""),
    [ocupado, definirOcupado] = useState(false),
    [mensagem, definirMensagem] = useState(""),
    [concluido, definirConcluido] = useState(false);
  async function ativarConta() {
    definirMensagem("");
    if (senha.length < 12 || senha !== confirmacao) {
      definirMensagem("Use pelo menos 12 caracteres e confirme a mesma senha.");
      return;
    }
    definirOcupado(true);
    try {
      await api("/auth/activate", {
        method: "POST",
        body: { token: token.trim(), password: senha },
      });
      definirConcluido(true);
      definirToken("");
      definirSenha("");
      definirConfirmacao("");
    } catch (e) {
      definirMensagem(
        e instanceof Error ? e.message : "Não foi possível ativar.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <Tela>
      <MarcaViva />
      <Text accessibilityRole="header" style={s.title}>
        Ativar ou recuperar conta
      </Text>
      {concluido ? (
        <View style={s.card}>
          <Text style={s.body}>
            Conta ativada. Entre com seu e-mail e a nova senha.
          </Text>
          <Botao
            rotulo="Ir para entrar"
            onPress={() => router.dismissTo("/acesso")}
          />
        </View>
      ) : (
        <View style={s.card}>
          <Text style={s.body}>
            Use o código de uso único entregue pelo profissional autorizado. Ele
            expira em 24 horas.
          </Text>
          {[
            ["Código de ativação", token, definirToken, false],
            ["Nova senha", senha, definirSenha, true],
            ["Confirme a senha", confirmacao, definirConfirmacao, true],
          ].map(([label, valor, set, secure]) => (
            <View key={String(label)}>
              <Text style={s.label}>{String(label)}</Text>
              <TextInput
                style={s.field}
                accessibilityLabel={String(label)}
                value={String(valor)}
                onChangeText={set as (v: string) => void}
                secureTextEntry={Boolean(secure)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}
          {mensagem && <MensagemErro mensagem={mensagem} />}
          <Botao
            rotulo="Ativar conta"
            ocupado={ocupado}
            onPress={() => {
              void ativarConta();
            }}
          />
        </View>
      )}
      <Botao
        secundario
        rotulo="Voltar ao acesso"
        onPress={() => router.dismissTo("/acesso")}
      />
    </Tela>
  );
}

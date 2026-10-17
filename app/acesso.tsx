import { useState } from "react";
import { Redirect, router } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { useAutenticacao } from "../hooks/useAutenticacao";
import {
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
  Tela,
} from "../components/ElementosInterface";
import { estilos as s } from "../components/estilos";

export default function Acesso() {
  const {
    sessao: sessao,
    restaurando: restaurando,
    aviso: aviso,
    entrar: entrar,
  } = useAutenticacao();
  const [email, setEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !senha) {
      definirErro("Informe seu e-mail e sua senha.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      definirErro("Confira o formato do seu e-mail.");
      return;
    }
    definirOcupado(true);
    definirErro(null);
    try {
      await entrar(email, senha);
      definirSenha("");
    } catch (failure) {
      definirErro(
        failure instanceof Error
          ? failure.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      definirOcupado(false);
    }
  }

  if (restaurando)
    return (
      <Tela>
        <MarcaViva />
        <Carregando />
      </Tela>
    );
  if (sessao) return <Redirect href="/inicio" />;
  return (
    <Tela>
      <MarcaViva />
      <View style={s.section}>
        <Text style={s.title} accessibilityRole="header">
          Vamos entrar?
        </Text>
        <Text style={s.body}>
          Use seu e-mail e sua senha. Sua conta é individual.
        </Text>
      </View>
      {aviso && (
        <View style={s.notice}>
          <Text style={s.body} accessibilityLiveRegion="polite">
            {aviso}
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
            editable={!ocupado}
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
            value={senha}
            onChangeText={definirSenha}
            style={s.field}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            editable={!ocupado}
            textContentType="password"
            onSubmitEditing={() => {
              if (!ocupado) void submit();
            }}
            returnKeyType="go"
          />
        </View>
        {erro && <MensagemErro mensagem={erro} />}
        <Botao
          rotulo="Entrar"
          testID="login-button"
          ocupado={ocupado}
          onPress={() => {
            void submit();
          }}
        />
      </View>
      <Botao
        secundario
        rotulo="Ativar conta ou usar código de recuperação"
        onPress={() => router.push("/ativar-conta")}
      />
      <Text style={s.muted}>
        Precisa de um código? Procure o profissional responsável pela
        demonstração. O portal emite recuperação assistida com confirmação de
        identidade pela equipe.
      </Text>
      <Text style={s.small}>
        Somente contas de teste. Não envie informações de saúde reais.
      </Text>
    </Tela>
  );
}

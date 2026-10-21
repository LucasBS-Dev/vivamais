import { Text } from "./TextoAcessivel";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { estilos as s } from "./estilos";
import { ilustracoes } from "./IlustracoesViva";
import { ambienteDemonstracao } from "../services/ambiente";

export function Tela({
  children,
  rodape,
  compacta = false,
}: {
  children: ReactNode;
  rodape?: ReactNode;
  compacta?: boolean;
}) {
  return (
    <SafeAreaView style={s.safe}>
      {ambienteDemonstracao && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 5,
            backgroundColor: "#e6f1f7",
          }}
          testID="indicador-demonstracao"
        >
          <Text style={{ color: "#34556b", fontSize: 12, textAlign: "center" }}>
            Demonstração · somente dados fictícios
          </Text>
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        testID="conteudo-rolavel"
        contentContainerStyle={[s.scroll, compacta && { paddingVertical: 12 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[s.content, compacta && { gap: 12 }]}>{children}</View>
      </ScrollView>
      {rodape && (
        <View
          testID="rodape-navegacao"
          style={{
            flexShrink: 0,
            width: "100%",
            maxWidth: 470,
            alignSelf: "center",
            paddingHorizontal: 20,
            backgroundColor: "white",
          }}
        >
          {rodape}
        </View>
      )}
    </SafeAreaView>
  );
}

export function MarcaViva({
  grande = false,
  largura,
}: {
  variante?: "azul" | "verde";
  grande?: boolean;
  largura?: number;
}) {
  return (
    <View
      style={s.brandRow}
      accessibilityLabel="Viva mais, aplicativo do paciente"
      accessible
    >
      <Image
        source={ilustracoes.logo}
        style={{
          width: largura ?? (grande ? 164 : 128),
          height: ((largura ?? (grande ? 164 : 128)) * 1230) / 1278,
          resizeMode: "contain",
        }}
        accessibilityLabel="Viva+"
      />
    </View>
  );
}

export function Botao({
  rotulo,
  onPress,
  ocupado: ocupado = false,
  secundario = false,
  desabilitado = false,
  compacto = false,
  testID,
}: {
  rotulo: string;
  onPress: () => void;
  ocupado?: boolean;
  secundario?: boolean;
  desabilitado?: boolean;
  compacto?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: ocupado || desabilitado, busy: ocupado }}
      disabled={ocupado || desabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        secundario ? s.secondaryButton : s.button,
        compacto && {
          minHeight: 48,
          paddingVertical: 10,
          paddingHorizontal: 10,
          borderRadius: 10,
        },
        pressed && s.pressed,
        (ocupado || desabilitado) && s.disabled,
      ]}
    >
      {ocupado ? (
        <ActivityIndicator
          color={secundario ? "#086b92" : "#ffffff"}
          accessibilityLabel="Aguarde"
        />
      ) : (
        <Text
          style={[
            secundario ? s.secondaryButtonText : s.buttonText,
            compacto && { fontSize: 16 },
          ]}
        >
          {rotulo}
        </Text>
      )}
    </Pressable>
  );
}

export function MensagemErro({ mensagem: mensagem }: { mensagem: string }) {
  return (
    <View
      style={s.error}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={s.errorText}>{mensagem}</Text>
    </View>
  );
}

export function Carregando({
  rotulo = "Carregando seus dados…",
}: {
  rotulo?: string;
}) {
  return (
    <View style={s.card} accessibilityLiveRegion="polite">
      <ActivityIndicator color="#086b92" />
      <Text style={s.body}>{rotulo}</Text>
    </View>
  );
}

import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { estilos as s } from "./estilos";

export function Tela({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function MarcaViva({
  variante = "azul",
}: {
  variante?: "azul" | "verde";
}) {
  return (
    <View
      style={s.brandRow}
      accessibilityLabel="Viva mais, aplicativo do paciente"
      accessible
    >
      <Image
        source={
          variante === "verde"
            ? require("../assets/images/logo-viva-verde.png")
            : require("../assets/images/logo-viva.png")
        }
        style={{ width: 140, height: 49, resizeMode: "contain" }}
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
  testID,
}: {
  rotulo: string;
  onPress: () => void;
  ocupado?: boolean;
  secundario?: boolean;
  desabilitado?: boolean;
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
        <Text style={secundario ? s.secondaryButtonText : s.buttonText}>
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
  rotulo: label = "Carregando seus dados…",
}: {
  rotulo?: string;
}) {
  return (
    <View style={s.card} accessibilityLiveRegion="polite">
      <ActivityIndicator color="#086b92" />
      <Text style={s.body}>{label}</Text>
    </View>
  );
}

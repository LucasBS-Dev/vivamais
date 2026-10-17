import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles as s } from "../theme/styles";

export function Screen({ children }: { children: ReactNode }) {
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

export function Brand() {
  return (
    <View
      style={s.brandRow}
      accessibilityLabel="Viva mais, aplicativo do paciente"
      accessible
    >
      <View style={s.brandMark}>
        <Text style={s.brandMarkText}>V+</Text>
      </View>
      <View>
        <Text style={s.brand}>Viva+</Text>
        <Text style={s.small}>Perto de você, no seu tempo.</Text>
      </View>
    </View>
  );
}

export function Button({
  label,
  onPress,
  busy = false,
  secondary = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  secondary?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: busy, busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        secondary ? s.secondaryButton : s.button,
        pressed && s.pressed,
        busy && s.disabled,
      ]}
    >
      {busy ? (
        <ActivityIndicator
          color={secondary ? "#086b92" : "#ffffff"}
          accessibilityLabel="Aguarde"
        />
      ) : (
        <Text style={secondary ? s.secondaryButtonText : s.buttonText}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <View
      style={s.error}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Text style={s.errorText}>{message}</Text>
    </View>
  );
}

export function Loading({
  label = "Carregando seus dados…",
}: {
  label?: string;
}) {
  return (
    <View style={s.card} accessibilityLiveRegion="polite">
      <ActivityIndicator color="#086b92" />
      <Text style={s.body}>{label}</Text>
    </View>
  );
}

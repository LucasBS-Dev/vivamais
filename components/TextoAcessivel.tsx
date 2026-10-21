import { Text as TextoNativo, StyleSheet, type TextProps } from "react-native";
import { usePreferencias } from "../contexts/ContextoPreferencias";
export function Text({ style, ...propriedades }: TextProps) {
  const { textoAmpliado } = usePreferencias();
  const original = StyleSheet.flatten(style);
  return (
    <TextoNativo
      {...propriedades}
      style={[
        style,
        textoAmpliado && {
          fontSize: (original?.fontSize ?? 16) * 1.2,
          lineHeight:
            (original?.lineHeight ?? (original?.fontSize ?? 16) * 1.45) * 1.2,
        },
      ]}
    />
  );
}

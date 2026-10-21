import { View, Image } from "react-native";
/** Formas nativas mantêm a nitidez sem acrescentar biblioteca de ícones ao aplicativo. */
export function IconeNavegacao({
  nome,
  cor = "#006cba",
}: {
  nome: "inicio" | "lembretes" | "mensagens" | "perfil";
  cor?: string;
}) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessible={false}
    >
      {nome === "inicio" && (
        <>
          <View
            style={{
              position: "absolute",
              top: 4,
              width: 17,
              height: 17,
              borderTopWidth: 3,
              borderLeftWidth: 3,
              borderColor: cor,
              transform: [{ rotate: "45deg" }],
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 12,
              width: 18,
              height: 14,
              borderWidth: 3,
              borderTopWidth: 0,
              borderColor: cor,
              backgroundColor: "white",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 19,
              width: 5,
              height: 7,
              backgroundColor: cor,
            }}
          />
        </>
      )}
      {nome === "lembretes" && (
        <Image
          source={require("../assets/images/individuais/07_acoes/lembrete.png")}
          style={{
            width: 26,
            height: 26,
            resizeMode: "contain",
            tintColor: cor,
          }}
          accessible={false}
        />
      )}
      {nome === "mensagens" && (
        <>
          <View
            style={{
              width: 24,
              height: 18,
              borderWidth: 2,
              borderColor: cor,
              borderRadius: 3,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 11,
              left: 3,
              width: 13,
              height: 2,
              backgroundColor: cor,
              transform: [{ rotate: "30deg" }],
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 11,
              right: 3,
              width: 13,
              height: 2,
              backgroundColor: cor,
              transform: [{ rotate: "-30deg" }],
            }}
          />
        </>
      )}
      {nome === "perfil" && (
        <>
          <View
            style={{
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: cor,
            }}
          />
          <View
            style={{
              width: 20,
              height: 11,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
              backgroundColor: cor,
              marginTop: 3,
            }}
          />
        </>
      )}
    </View>
  );
}

import { Text } from "./TextoAcessivel";
import { router, usePathname } from "expo-router";
import { Pressable, View } from "react-native";
import { IconeNavegacao } from "./IconeNavegacao";
export function BarraNavegacao() {
  const caminho = usePathname();
  return (
    <View
      testID="barra-navegacao"
      accessibilityLabel="Navegação principal"
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        borderTopWidth: 1,
        borderColor: "#dceaf6",
        backgroundColor: "#fff",
        paddingVertical: 12,
      }}
    >
      {[
        { rota: "/inicio", icone: "inicio" as const, rotulo: "Início" },
        {
          rota: "/lembretes",
          icone: "lembretes" as const,
          rotulo: "Lembretes",
        },
        {
          rota: "/mensagens",
          icone: "mensagens" as const,
          rotulo: "Mensagens",
        },
        { rota: "/perfil", icone: "perfil" as const, rotulo: "Perfil" },
      ].map((item) => (
        <Pressable
          key={item.rota}
          accessibilityRole="button"
          accessibilityLabel={item.rotulo}
          accessibilityState={{ selected: caminho === item.rota }}
          onPress={() => router.navigate(item.rota)}
          style={{ alignItems: "center", minWidth: 64, minHeight: 48 }}
        >
          <IconeNavegacao
            nome={item.icone}
            cor={caminho === item.rota ? "#006cba" : "#607b95"}
          />
          <Text style={{ fontSize: 12, color: "#003366" }}>{item.rotulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}

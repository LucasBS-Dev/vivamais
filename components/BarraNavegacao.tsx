import { router, usePathname } from "expo-router";
import { Pressable, Text, View, Image } from "react-native";
const imagens = {inicio:require('../assets/images/navegacao-inicio.png'),lembretes:require('../assets/images/navegacao-lembretes.png'),mensagens:require('../assets/images/navegacao-mensagens.png'),perfil:require('../assets/images/navegacao-perfil.png')};
export function BarraNavegacao() {
  const caminho = usePathname();
  return (
    <View
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
        { rota: "/inicio", icone: imagens.inicio, rotulo: "Início" },
        { rota: "/medicamentos", icone: imagens.lembretes, rotulo: "Lembretes" },
        {
          rota: "/atividade-fisica/orientacoes",
          icone: imagens.mensagens,
          rotulo: "Mensagens",
        },
        { rota: "/perfil", icone: imagens.perfil, rotulo: "Perfil" },
      ].map((item) => (
        <Pressable
          key={item.rota}
          accessibilityRole="button"
          accessibilityLabel={item.rotulo}
          accessibilityState={{selected:caminho===item.rota}}
          onPress={() => router.navigate(item.rota)}
          style={{ alignItems: "center", minWidth: 64, minHeight: 48 }}
        >
          <Image source={item.icone} style={{width:26,height:26,resizeMode:'contain'}} accessible={false}/>
          <Text style={{ fontSize: 12, color: "#003366" }}>{item.rotulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}

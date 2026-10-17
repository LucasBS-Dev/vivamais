import { router } from "expo-router";
import { Text } from "react-native";
import { Brand, Button, Screen } from "../src/components/ui";
import { styles as s } from "../src/theme/styles";
export default function NotFound() {
  return (
    <Screen>
      <Brand />
      <Text style={s.title} accessibilityRole="header">
        Não encontramos esta página
      </Text>
      <Button label="Voltar ao início" onPress={() => router.replace("/")} />
    </Screen>
  );
}

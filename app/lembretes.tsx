import { TelaCuidado } from "../components/TelaCuidado";
import { Text } from "../components/TextoAcessivel";
import { estilos as e } from "../components/estilos";
export default function Lembretes() {
  return (
    <TelaCuidado modulo="medications">
      <Text style={e.title} accessibilityRole="header">
        Meus Lembretes
      </Text>
      <Text style={e.body}>
        Confira os horários do seu plano e suas respostas. Nas opções abaixo
        você pode autorizar os lembretes no Android/iOS.
      </Text>
    </TelaCuidado>
  );
}

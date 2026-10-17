import { useState } from "react";
import { Text, View } from "react-native";
import { estilos as s } from "./estilos";
type PontoGrafico = { systolic: number; diastolic: number; measuredAt: string };

export function GraficoPressao({ readings }: { readings: PontoGrafico[] }) {
  const [largura, definirLargura] = useState(280);
  const valores = [...readings].sort(
    (a, b) => Date.parse(a.measuredAt) - Date.parse(b.measuredAt),
  );
  if (!valores.length) return null;
  const minimo =
    Math.min(
      ...valores.map((pacienteConsultado) => pacienteConsultado.diastolic),
      ...valores.map((pacienteConsultado) => pacienteConsultado.systolic),
    ) - 10;
  const maximo =
    Math.max(
      ...valores.map((pacienteConsultado) => pacienteConsultado.diastolic),
      ...valores.map((pacienteConsultado) => pacienteConsultado.systolic),
    ) + 10;
  const primeiro = Date.parse(valores[0]!.measuredAt),
    ultimo = Date.parse(valores.at(-1)!.measuredAt);
  const x = (pacienteConsultado: PontoGrafico) =>
    12 +
    ((Date.parse(pacienteConsultado.measuredAt) - primeiro) /
      Math.max(1, ultimo - primeiro)) *
      (largura - 24);
  const y = (v: number) => 12 + ((maximo - v) / (maximo - minimo)) * 140;
  return (
    <View style={s.card}>
      <Text style={s.title} accessibilityRole="header">
        Gráfico da pressão
      </Text>
      <Text style={s.small}>
        Azul: sistólica · Verde: diastólica · mmHg. Valores desta página;
        detalhes no histórico abaixo.
      </Text>
      <View
        onLayout={(event) => definirLargura(event.nativeEvent.layout.width)}
        style={{
          height: 166,
          borderLeftWidth: 1,
          borderBottomWidth: 1,
          borderColor: "#7696a5",
        }}
        accessible
        accessibilityLabel={`Gráfico com ${valores.length} medições, de ${new Date(primeiro).toLocaleDateString("pt-BR")} a ${new Date(ultimo).toLocaleDateString("pt-BR")}. Valores de ${minimo + 10} a ${maximo - 10} mmHg. Os números estão listados abaixo.`}
      >
        {(["systolic", "diastolic"] as const).map((chave, serie) =>
          valores.map((pacienteConsultado, i) => {
            const esquerda = x(pacienteConsultado),
              topo = y(pacienteConsultado[chave]),
              cor = serie ? "#087866" : "#086b92";
            const proximo = valores[i + 1];
            const dx = proximo ? x(proximo) - esquerda : 0,
              dy = proximo ? y(proximo[chave]) - topo : 0;
            return (
              <View key={`${chave}-${i}`} accessible={false}>
                {proximo && (
                  <View
                    style={{
                      position: "absolute",
                      left:
                        (esquerda + x(proximo)) / 2 - Math.hypot(dx, dy) / 2,
                      top: (topo + y(proximo[chave])) / 2,
                      width: Math.hypot(dx, dy),
                      height: 2,
                      backgroundColor: cor,
                      transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
                    }}
                  />
                )}
                <View
                  style={{
                    position: "absolute",
                    left: esquerda - 4,
                    top: topo - 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: cor,
                  }}
                />
              </View>
            );
          }),
        )}
      </View>
      <Text style={s.small}>
        Escala vertical: {minimo}–{maximo} mmHg. O gráfico não interpreta
        resultados.
      </Text>
    </View>
  );
}

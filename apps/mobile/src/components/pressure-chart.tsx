import { useState } from "react";
import { Text, View } from "react-native";
import { styles as s } from "../theme/styles";
type Point = { systolic: number; diastolic: number; measuredAt: string };

export function PressureChart({ readings }: { readings: Point[] }) {
  const [width, setWidth] = useState(280);
  const values = [...readings].sort(
    (a, b) => Date.parse(a.measuredAt) - Date.parse(b.measuredAt),
  );
  if (!values.length) return null;
  const low =
    Math.min(
      ...values.map((p) => p.diastolic),
      ...values.map((p) => p.systolic),
    ) - 10;
  const high =
    Math.max(
      ...values.map((p) => p.diastolic),
      ...values.map((p) => p.systolic),
    ) + 10;
  const first = Date.parse(values[0]!.measuredAt),
    last = Date.parse(values.at(-1)!.measuredAt);
  const x = (p: Point) =>
    12 +
    ((Date.parse(p.measuredAt) - first) / Math.max(1, last - first)) *
      (width - 24);
  const y = (v: number) => 12 + ((high - v) / (high - low)) * 140;
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
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{
          height: 166,
          borderLeftWidth: 1,
          borderBottomWidth: 1,
          borderColor: "#7696a5",
        }}
        accessible
        accessibilityLabel={`Gráfico com ${values.length} medições, de ${new Date(first).toLocaleDateString("pt-BR")} a ${new Date(last).toLocaleDateString("pt-BR")}. Valores de ${low + 10} a ${high - 10} mmHg. Os números estão listados abaixo.`}
      >
        {(["systolic", "diastolic"] as const).map((key, line) =>
          values.map((p, i) => {
            const left = x(p),
              top = y(p[key]),
              color = line ? "#087866" : "#086b92";
            const next = values[i + 1];
            const dx = next ? x(next) - left : 0,
              dy = next ? y(next[key]) - top : 0;
            return (
              <View key={`${key}-${i}`} accessible={false}>
                {next && (
                  <View
                    style={{
                      position: "absolute",
                      left: (left + x(next)) / 2 - Math.hypot(dx, dy) / 2,
                      top: (top + y(next[key])) / 2,
                      width: Math.hypot(dx, dy),
                      height: 2,
                      backgroundColor: color,
                      transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
                    }}
                  />
                )}
                <View
                  style={{
                    position: "absolute",
                    left: left - 4,
                    top: top - 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: color,
                  }}
                />
              </View>
            );
          }),
        )}
      </View>
      <Text style={s.small}>
        Escala vertical: {low}–{high} mmHg. O gráfico não interpreta resultados.
      </Text>
    </View>
  );
}

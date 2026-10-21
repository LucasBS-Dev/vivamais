import { Text } from "./TextoAcessivel";
import { useState } from "react";
import { View } from "react-native";
import { estilos as e } from "./estilos";
type PontoGrafico = {
  sistolica: number;
  diastolica: number;
  dataMedicao: string;
};
export function GraficoPressao({ registros }: { registros: PontoGrafico[] }) {
  const [largura, definirLargura] = useState(320);
  const valores = [...registros].sort(
    (a, b) => Date.parse(a.dataMedicao) - Date.parse(b.dataMedicao),
  );
  if (!valores.length) return null;
  const minimo =
    Math.floor(
      (Math.min(
        ...valores.flatMap((registro) => [
          registro.sistolica,
          registro.diastolica,
        ]),
      ) -
        10) /
        20,
    ) * 20;
  const maximo =
    Math.ceil(
      (Math.max(
        ...valores.flatMap((registro) => [
          registro.sistolica,
          registro.diastolica,
        ]),
      ) +
        10) /
        20,
    ) * 20;
  const primeiro = Date.parse(valores[0]!.dataMedicao),
    ultimo = Date.parse(valores.at(-1)!.dataMedicao);
  const coordenadaX = (registro: PontoGrafico) =>
    valores.length === 1
      ? largura / 2
      : 36 +
        ((Date.parse(registro.dataMedicao) - primeiro) /
          Math.max(1, ultimo - primeiro)) *
          (largura - 48);
  const coordenadaY = (valor: number) =>
    12 + ((maximo - valor) / (maximo - minimo)) * 140;
  const indicesDatas = [
    ...new Set([
      0,
      Math.floor((valores.length - 1) / 3),
      Math.floor(((valores.length - 1) * 2) / 3),
      valores.length - 1,
    ]),
  ];
  return (
    <View style={e.section}>
      <Text style={[e.label, { fontSize: 16 }]} accessibilityRole="header">
        Gráfico da pressão
      </Text>
      <Text style={[e.small, { color: "#e62f49" }]}>
        ● Pressão alta (sistólica)
      </Text>
      <Text style={[e.small, { color: "#007ad7" }]}>
        ● Pressão baixa (diastólica)
      </Text>
      <View
        onLayout={(evento) => definirLargura(evento.nativeEvent.layout.width)}
        style={{ height: 185 }}
        accessible
        accessibilityLabel={`Gráfico com ${valores.length} medições. Escala de ${minimo} a ${maximo} mmHg. Valores completos no histórico abaixo.`}
      >
        {[0, 1, 2, 3, 4].map((indice) => {
          const valor = maximo - ((maximo - minimo) * indice) / 4;
          return (
            <View key={indice} accessible={false}>
              <Text
                style={{
                  position: "absolute",
                  top: coordenadaY(valor) - 7,
                  left: 0,
                  fontSize: 11,
                  color: "#00376b",
                }}
              >
                {Math.round(valor)}
              </Text>
              <View
                style={{
                  position: "absolute",
                  top: coordenadaY(valor),
                  left: 34,
                  right: 8,
                  height: 1,
                  backgroundColor: "#dce7f3",
                }}
              />
            </View>
          );
        })}
        {indicesDatas.map((indice) => {
          const registro = valores[indice]!;
          return (
            <View key={indice} accessible={false}>
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  bottom: 33,
                  left: coordenadaX(registro),
                  width: 1,
                  backgroundColor: "#e7eef7",
                }}
              />
              <Text
                style={{
                  position: "absolute",
                  left: coordenadaX(registro) - 22,
                  top: 161,
                  width: 44,
                  textAlign: "center",
                  fontSize: 10,
                  color: "#00376b",
                }}
              >
                {new Date(registro.dataMedicao).toLocaleDateString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </Text>
            </View>
          );
        })}
        {(["sistolica", "diastolica"] as const).map((chave, serie) =>
          valores.map((registro, indice) => {
            const esquerda = coordenadaX(registro),
              topo = coordenadaY(registro[chave]),
              cor = serie ? "#0785e9" : "#ff3f55",
              proximo = valores[indice + 1];
            const distanciaX = proximo ? coordenadaX(proximo) - esquerda : 0,
              distanciaY = proximo ? coordenadaY(proximo[chave]) - topo : 0;
            return (
              <View key={`${chave}-${indice}`} accessible={false}>
                {proximo && (
                  <View
                    style={{
                      position: "absolute",
                      left:
                        (esquerda + coordenadaX(proximo)) / 2 -
                        Math.hypot(distanciaX, distanciaY) / 2,
                      top: (topo + coordenadaY(proximo[chave])) / 2,
                      width: Math.hypot(distanciaX, distanciaY),
                      height: 2,
                      backgroundColor: cor,
                      transform: [
                        { rotate: `${Math.atan2(distanciaY, distanciaX)}rad` },
                      ],
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
      <Text style={e.small}>
        mmHg · Valores desta página, sem interpretação diagnóstica.
      </Text>
    </View>
  );
}

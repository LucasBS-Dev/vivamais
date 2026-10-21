type LinhaDados = Record<string, unknown>;
export function GraficoPressao({ registros }: { registros: LinhaDados[] }) {
  if (!registros.length) return null;
  const valores = [...registros].sort(
    (a, b) =>
      Date.parse(String(a.measuredAt)) - Date.parse(String(b.measuredAt)),
  );
  const minimo =
    Math.floor(
      (Math.min(
        ...valores.flatMap((registro) => [
          Number(registro.systolic),
          Number(registro.diastolic),
        ]),
      ) -
        10) /
        20,
    ) * 20;
  const maximo =
    Math.ceil(
      (Math.max(
        ...valores.flatMap((registro) => [
          Number(registro.systolic),
          Number(registro.diastolic),
        ]),
      ) +
        10) /
        20,
    ) * 20;
  const inicio = Date.parse(String(valores[0]!.measuredAt)),
    fim = Date.parse(String(valores.at(-1)!.measuredAt));
  const coordenadaX = (registro: LinhaDados) =>
    valores.length === 1
      ? 310
      : 50 +
        ((Date.parse(String(registro.measuredAt)) - inicio) /
          Math.max(1, fim - inicio)) *
          520;
  const coordenadaY = (valor: number) =>
    180 - ((valor - minimo) / (maximo - minimo)) * 150;
  const pontos = (chave: string) =>
    valores
      .map(
        (registro) =>
          `${coordenadaX(registro)},${coordenadaY(Number(registro[chave]))}`,
      )
      .join(" ");
  const indices = [
    ...new Set([
      0,
      Math.floor((valores.length - 1) / 3),
      Math.floor(((valores.length - 1) * 2) / 3),
      valores.length - 1,
    ]),
  ];
  return (
    <figure className="grafico-pressao">
      <figcaption>
        <span className="legenda-sistolica">● Pressão sistólica (mmHg)</span>　
        <span className="legenda-diastolica">● Pressão diastólica (mmHg)</span>
      </figcaption>
      <svg
        viewBox="0 0 600 215"
        role="img"
        aria-label="Gráfico da pressão sistólica e diastólica; valores detalhados na tabela abaixo"
      >
        {[0, 1, 2, 3, 4].map((indice) => {
          const valor = minimo + ((maximo - minimo) * indice) / 4;
          return (
            <g key={indice}>
              <line
                x1="50"
                x2="575"
                y1={coordenadaY(valor)}
                y2={coordenadaY(valor)}
                stroke="#dce7f3"
              />
              <text
                x="40"
                y={coordenadaY(valor) + 4}
                fontSize="12"
                textAnchor="end"
                fill="#17456d"
              >
                {Math.round(valor)}
              </text>
            </g>
          );
        })}
        {indices.map((indice) => {
          const registro = valores[indice]!;
          return (
            <g key={indice}>
              <line
                x1={coordenadaX(registro)}
                x2={coordenadaX(registro)}
                y1="30"
                y2="180"
                stroke="#e6eef6"
              />
              <text
                x={coordenadaX(registro)}
                y="202"
                fontSize="11"
                textAnchor="middle"
                fill="#17456d"
              >
                {new Date(String(registro.measuredAt)).toLocaleDateString(
                  "pt-BR",
                  {
                    timeZone: "America/Sao_Paulo",
                    day: "2-digit",
                    month: "2-digit",
                  },
                )}
              </text>
            </g>
          );
        })}
        <polyline
          fill="none"
          stroke="#ff3f55"
          strokeWidth="3"
          points={pontos("systolic")}
        />
        <polyline
          fill="none"
          stroke="#0785e9"
          strokeWidth="3"
          points={pontos("diastolic")}
        />
        {valores.flatMap((registro, indice) =>
          (["systolic", "diastolic"] as const).map((chave, serie) => (
            <circle
              key={`${indice}-${chave}`}
              cx={coordenadaX(registro)}
              cy={coordenadaY(Number(registro[chave]))}
              r="4"
              fill={serie ? "#0785e9" : "#ff3f55"}
            />
          )),
        )}
      </svg>
      <small>
        Escala calculada a partir dos registros. Sem classificação diagnóstica.
      </small>
    </figure>
  );
}

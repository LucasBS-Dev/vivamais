type LinhaDados = Record<string, unknown>;
type TipoTabela = "medications" | "activities" | "diary" | "consultations";
const formatarData = (valor: unknown) =>
  valor
    ? new Date(String(valor)).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      })
    : "—";
const rotulos: Record<string, string> = {
  name: "Medicamento",
  instruction: "Instrução profissional",
  startsOn: "Vigência inicial",
  endsOn: "Vigência final",
  schedules: "Horários",
  version: "Versão",
  type: "Atividade",
  durationMinutes: "Minutos",
  notes: "Observações",
  medicationReport: "Relato transcrito",
  systolic: "Sistólica",
  diastolic: "Diastólica",
  pulse: "Pulso",
  goals: "Objetivos",
  carePlan: "Plano de cuidado",
  authorName: "Registrado por",
  createdAt: "Data do registro",
};
export function TabelaCuidado({
  registros,
  tipo,
  eventos,
  aoEditar,
  periodoMedicamentos = "dia",
}: {
  registros: LinhaDados[];
  tipo: TipoTabela;
  eventos: LinhaDados[];
  aoEditar: (registro: LinhaDados) => void;
  periodoMedicamentos?: string;
}) {
  const cabecalhos =
    tipo === "medications"
      ? [
          "Medicamento",
          "Dose e instrução",
          "Horários",
          `Autorrelatos do ${periodoMedicamentos}`,
          "Ações",
        ]
      : tipo === "activities"
        ? ["Data", "Atividade", "Duração", "Observações", "Ações"]
        : tipo === "diary"
          ? [
              "Medição / ocorrência",
              "Pressão",
              "Pulso",
              "Relato transcrito",
              "Ações",
            ]
          : ["Data", "Profissional", "Resumo", "Ações"];
  return (
    <div className="tabela-responsiva">
      <table className="care-table tabela-cuidado">
        <thead>
          <tr>
            {cabecalhos.map((cabecalho) => (
              <th key={cabecalho} scope="col">
                {cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {registros.map((registro, indice) => {
            const horarios = eventos.filter(
                (evento) => evento.planId === registro.id,
              ),
              respostas = horarios.filter((evento) => evento.reportedAt).length;
            const celulas =
              tipo === "medications"
                ? [
                    String(registro.name),
                    String(registro.instruction),
                    ((registro.schedules as string[]) || []).join(", "),
                    <span key="autorrelatos">
                      {horarios.length ? (
                        <>
                          <progress
                            aria-label={`Autorrelatos de ${registro.name}`}
                            value={respostas}
                            max={horarios.length}
                          />
                          <small>
                            {respostas} / {horarios.length} respostas
                          </small>
                        </>
                      ) : (
                        "Sem horários nesse período"
                      )}
                    </span>,
                  ]
                : tipo === "activities"
                  ? [
                      formatarData(registro.occurredAt),
                      String(registro.type),
                      `${registro.durationMinutes} min`,
                      String(registro.notes || "—"),
                    ]
                  : tipo === "diary"
                    ? [
                        formatarData(registro.occurredAt),
                        registro.systolic
                          ? `${registro.systolic} / ${registro.diastolic} mmHg`
                          : "—",
                        String(registro.pulse || "—"),
                        String(registro.medicationReport || "—"),
                      ]
                    : [
                        formatarData(registro.occurredAt),
                        String(registro.authorName || "Nome indisponível"),
                        String(registro.notes || "—"),
                      ];
            return (
              <tr key={String(registro.id || indice)}>
                {celulas.map((celula, numero) => (
                  <td key={numero}>{celula}</td>
                ))}
                <td>
                  {tipo === "medications" && (
                    <button
                      className="acao-tabela"
                      aria-label="Editar plano e consultar versões"
                      onClick={() => aoEditar(registro)}
                    >
                      Editar
                    </button>
                  )}
                  <details>
                    <summary>Ver detalhes</summary>
                    <dl>
                      {Object.entries(rotulos)
                        .filter(
                          ([chave]) =>
                            registro[chave] !== null &&
                            registro[chave] !== undefined &&
                            registro[chave] !== "",
                        )
                        .map(([chave, rotulo]) => (
                          <div key={chave}>
                            <dt>{rotulo}</dt>
                            <dd>
                              {chave === "createdAt"
                                ? formatarData(registro[chave])
                                : Array.isArray(registro[chave])
                                  ? (registro[chave] as unknown[]).join(", ")
                                  : String(registro[chave])}
                            </dd>
                          </div>
                        ))}
                    </dl>
                    {tipo === "diary" && (
                      <p>
                        Origem: diário impresso transcrito por profissional.
                      </p>
                    )}
                  </details>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";
import { useResumoCuidados } from "../hooks/useResumoCuidados";
export function VisaoGeralPaciente({ idPaciente }: { idPaciente: string }) {
  const { resumo, erro } = useResumoCuidados(idPaciente);
  if (erro) return <p role="alert">{erro}</p>;
  if (!resumo)
    return <p role="status">Consultando os registros do paciente…</p>;
  const indicadores = [
    {
      titulo: "Pressão arterial",
      valor: resumo.ultimaPressao || "Sem registro",
      detalhe: resumo.dataUltimaPressao
        ? new Date(resumo.dataUltimaPressao).toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          })
        : "Última medição",
      cor: "resumo-pressao",
    },
    {
      titulo: "Medicamentos",
      valor: `${resumo.autorrelatosHoje} de ${resumo.horariosHoje}`,
      detalhe: "Horários de hoje com autorrelato",
      cor: "resumo-medicamentos",
    },
    {
      titulo: "Alimentação",
      valor: `${resumo.fotosRecentes} fotos`,
      detalhe: "Total de fotos registradas",
      cor: "resumo-alimentacao",
    },
    {
      titulo: "Atividade física",
      valor: `${resumo.atividadesRecentes} registros`,
      detalhe: "Total de atividades registradas",
      cor: "resumo-atividade",
    },
  ];
  return (
    <section aria-label="Visão geral dos cuidados">
      <div className="resumo-cuidados">
        {indicadores.map((indicador) => (
          <article key={indicador.titulo} className={indicador.cor}>
            <h2>{indicador.titulo}</h2>
            <strong>{indicador.valor}</strong>
            <small>{indicador.detalhe}</small>
          </article>
        ))}
      </div>
      <section className="pacientes-painel">
        <h2>Últimos registros</h2>
        <div className="tabela-responsiva">
          <table className="care-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Informação</th>
                <th>Origem</th>
              </tr>
            </thead>
            <tbody>
              {resumo.registros.map((registro) => (
                <tr key={registro.id}>
                  <td>
                    {new Date(registro.data).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}
                  </td>
                  <td>{registro.tipo}</td>
                  <td>{registro.informacao}</td>
                  <td>{registro.origem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!resumo.registros.length && (
          <p>Nenhum registro disponível para este paciente.</p>
        )}
      </section>
    </section>
  );
}

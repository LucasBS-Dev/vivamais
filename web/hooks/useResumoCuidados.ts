import { useEffect, useState } from "react";
import {
  buscarResumoCuidados,
  type ResumoCuidados,
} from "../services/resumoPaciente";
export function useResumoCuidados(idPaciente: string) {
  const [resumo, definirResumo] = useState<ResumoCuidados | null>(null),
    [erro, definirErro] = useState("");
  useEffect(() => {
    let ativo = true;
    definirResumo(null);
    definirErro("");
    buscarResumoCuidados(idPaciente)
      .then((valor) => {
        if (ativo) definirResumo(valor);
      })
      .catch(() => {
        if (ativo)
          definirErro("Não foi possível consultar o resumo do paciente.");
      });
    return () => {
      ativo = false;
    };
  }, [idPaciente]);
  return { resumo, erro };
}

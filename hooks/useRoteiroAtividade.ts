import { useContext } from "react";
import { ContextoAtividade } from "../contexts/ContextoAtividade";
export function useRoteiroAtividade() {
  const contexto = useContext(ContextoAtividade);
  if (!contexto) throw new Error("Provedor de atividade ausente.");
  return contexto;
}

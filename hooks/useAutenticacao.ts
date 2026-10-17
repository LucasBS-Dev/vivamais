import { useContext } from "react";
import {
  ContextoAutenticacao,
  type ValorContextoAutenticacao,
} from "../contexts/ContextoAutenticacao";
export function useAutenticacao(): ValorContextoAutenticacao {
  const valor = useContext(ContextoAutenticacao);
  if (!valor) throw new Error("Provedor de autenticação ausente.");
  return valor;
}

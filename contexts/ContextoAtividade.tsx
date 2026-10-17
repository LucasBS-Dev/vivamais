import { createContext, useEffect, useState, type ReactNode } from "react";
import { useAutenticacao } from "../hooks/useAutenticacao";
export type EstadoInformado = "WELL" | "TIRED" | "UNWELL";
export const ContextoAtividade = createContext<{
  estadoInformado: EstadoInformado | null;
  definirEstadoInformado: (estado: EstadoInformado) => void;
  pressaoVerificada: boolean | null;
  definirPressaoVerificada: (verificada: boolean) => void;
} | null>(null);
export function ProvedorAtividade({ children }: { children: ReactNode }) {
  const { sessao: sessao } = useAutenticacao();
  const [estadoInformado, definirEstadoInformado] =
      useState<EstadoInformado | null>(null),
    [pressaoVerificada, definirPressaoVerificada] = useState<boolean | null>(
      null,
    );
  useEffect(() => {
    definirEstadoInformado(null);
    definirPressaoVerificada(null);
  }, [sessao?.usuario.id]);
  return (
    <ContextoAtividade.Provider
      value={{
        estadoInformado,
        definirEstadoInformado,
        pressaoVerificada,
        definirPressaoVerificada,
      }}
    >
      {children}
    </ContextoAtividade.Provider>
  );
}

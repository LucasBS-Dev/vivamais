import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAutenticacao } from "../hooks/useAutenticacao";

type Preferencias = {
  textoAmpliado: boolean;
  tamanhoPagina: number;
  versao: number;
};
const padrao: Preferencias = {
  textoAmpliado: false,
  tamanhoPagina: 20,
  versao: 0,
};
const ContextoPreferencias = createContext({
  textoAmpliado: false,
  carregando: true,
  salvando: false,
  erroPreferencias: "",
  definirTextoAmpliado: async (_valor: boolean) => {},
  recarregar: () => {},
});
export function ProvedorPreferencias({ children }: { children: ReactNode }) {
  const { sessao, requisicao } = useAutenticacao();
  const [estado, definirEstado] = useState({ conta: "", preferencias: padrao });
  const [carregando, definirCarregando] = useState(true);
  const [salvando, definirSalvando] = useState(false);
  const [erroPreferencias, definirErro] = useState("");
  const [tentativa, definirTentativa] = useState(0);
  const geracao = useRef(0);
  const conta = sessao?.usuario.id ?? "";
  const preferencias = estado.conta === conta ? estado.preferencias : padrao;
  useEffect(() => {
    const atual = ++geracao.current;
    definirEstado({ conta, preferencias: padrao });
    definirErro("");
    definirSalvando(false);
    definirCarregando(!!conta);
    if (conta)
      void requisicao<Preferencias>("/conta/preferencias")
        .then((valor) => {
          if (atual === geracao.current)
            definirEstado({ conta, preferencias: valor });
        })
        .catch(() => {
          if (atual === geracao.current)
            definirErro(
              "Não foi possível carregar suas preferências. Tente novamente.",
            );
        })
        .finally(() => {
          if (atual === geracao.current) definirCarregando(false);
        });
    return () => {
      geracao.current++;
    };
  }, [conta, requisicao, tentativa]);
  async function definirTextoAmpliado(valor: boolean) {
    if (!conta || carregando || salvando || erroPreferencias) return;
    const atual = geracao.current;
    definirSalvando(true);
    definirErro("");
    try {
      const resposta = await requisicao<Preferencias>("/conta/preferencias", {
        method: "PUT",
        body: { ...preferencias, textoAmpliado: valor },
      });
      if (atual === geracao.current)
        definirEstado({ conta, preferencias: resposta });
    } catch {
      if (atual === geracao.current)
        definirErro(
          "Não foi possível salvar. Atualize suas preferências e tente novamente.",
        );
    } finally {
      if (atual === geracao.current) definirSalvando(false);
    }
  }
  return (
    <ContextoPreferencias.Provider
      value={{
        textoAmpliado: preferencias.textoAmpliado,
        carregando,
        salvando,
        erroPreferencias,
        definirTextoAmpliado,
        recarregar: () => definirTentativa((valor) => valor + 1),
      }}
    >
      {children}
    </ContextoPreferencias.Provider>
  );
}
export function usePreferencias() {
  return useContext(ContextoPreferencias);
}

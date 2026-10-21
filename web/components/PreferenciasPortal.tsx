"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { consultarDominio } from "../services/dominio";

export type Preferencias = {
  textoAmpliado: boolean;
  tamanhoPagina: number;
  versao: number;
};
const padrao: Preferencias = {
  textoAmpliado: false,
  tamanhoPagina: 20,
  versao: 0,
};
const Contexto = createContext({
  preferencias: padrao,
  salvando: false,
  erro: "",
  salvo: false,
  salvar: async (_valor: Preferencias) => {},
  atualizar: async () => {},
});
export function PreferenciasPortal({
  iniciais,
  children,
}: {
  iniciais: Preferencias | null;
  children: ReactNode;
}) {
  const [preferencias, definirPreferencias] = useState(iniciais ?? padrao);
  const [salvando, definirSalvando] = useState(false);
  const [salvo, definirSalvo] = useState(false);
  const envioAtivo = useRef(false);
  const [erro, definirErro] = useState(
    iniciais ? "" : "Não foi possível carregar suas preferências.",
  );
  async function atualizar() {
    definirSalvando(true);
    try {
      definirPreferencias(
        await consultarDominio<Preferencias>("/conta/preferencias"),
      );
      definirErro("");
    } catch {
      definirErro(
        "Não foi possível carregar suas preferências. Tente novamente.",
      );
    } finally {
      definirSalvando(false);
    }
  }
  async function salvar(valor: Preferencias) {
    if (envioAtivo.current || salvando || erro) return;
    envioAtivo.current = true;
    definirSalvo(false);
    definirSalvando(true);
    try {
      definirPreferencias(
        await consultarDominio<Preferencias>(
          "/conta/preferencias",
          "PUT",
          valor,
        ),
      );
      definirErro("");
      definirSalvo(true);
    } catch (falha) {
      definirErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível salvar suas preferências.",
      );
    } finally {
      envioAtivo.current = false;
      definirSalvando(false);
    }
  }
  return (
    <Contexto.Provider
      value={{ preferencias, salvando, erro, salvo, salvar, atualizar }}
    >
      <div
        className={
          preferencias.textoAmpliado
            ? "preferencias-portal texto-ampliado"
            : "preferencias-portal"
        }
      >
        {children}
      </div>
    </Contexto.Provider>
  );
}
export function usePreferenciasPortal() {
  return useContext(Contexto);
}
export function FormularioPreferencias() {
  const { preferencias, salvando, erro, salvo, salvar, atualizar } =
    usePreferenciasPortal();
  return (
    <section
      className="panel padded configuracoes-preferencias"
      aria-labelledby="titulo-preferencias"
    >
      <h2 id="titulo-preferencias">Preferências de visualização</h2>
      <p>Os ajustes ficam salvos na sua conta para os próximos acessos.</p>
      <div className="care-form preferencias-controles">
        <label className="preferencia-texto">
          <input
            type="checkbox"
            checked={preferencias.textoAmpliado}
            disabled={salvando || !!erro}
            onChange={(evento) =>
              void salvar({
                ...preferencias,
                textoAmpliado: evento.target.checked,
              })
            }
          />{" "}
          <span>Ampliar os textos do portal</span>
        </label>
        <label>
          Registros por página na ficha
          <select
            value={preferencias.tamanhoPagina}
            disabled={salvando || !!erro}
            onChange={(evento) =>
              void salvar({
                ...preferencias,
                tamanhoPagina: Number(evento.target.value),
              })
            }
          >
            {[10, 20, 50].map((quantidade) => (
              <option key={quantidade} value={quantidade}>
                {quantidade}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="estado-preferencias" role="status" aria-live="polite">
        {salvando
          ? "Salvando preferências…"
          : salvo && !erro
            ? "Preferências salvas."
            : "As alterações são salvas automaticamente."}
      </div>
      {erro && (
        <div role="alert">
          <p>{erro}</p>
          <button
            className="button"
            disabled={salvando}
            onClick={() => void atualizar()}
          >
            Atualizar preferências
          </button>
        </div>
      )}
    </section>
  );
}

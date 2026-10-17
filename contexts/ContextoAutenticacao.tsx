import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import type { RespostaAutenticacao, UsuarioSessao } from "@viva/contracts";
import { api } from "../services/api";
import { ErroApi, sessaoExpirada } from "../services/transporteApi";
import {
  excluirSessaoProtegida,
  lerSessaoProtegida,
  salvarSessaoProtegida,
} from "../services/autenticacao/armazenamentoSessao";
import { cancelarLembretes } from "../services/lembretes/lembretes";
import {converterRespostaAutenticacao,type SessaoAplicativo} from "../services/autenticacao/tiposAutenticacao";
import type { SessaoProtegida } from "../services/autenticacao/contratoSessao";

export interface ValorContextoAutenticacao {
  sessao: SessaoAplicativo | null;
  restaurando: boolean;
  aviso: string | null;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  requisicao: <T>(
    caminho: string,
    opcoes?: { method?: "GET" | "POST" | "PUT"; body?: unknown },
  ) => Promise<T>;
}

export const ContextoAutenticacao =
  createContext<ValorContextoAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [sessao, definirSessao] = useState<SessaoAplicativo | null>(null);
  const [restaurando, definirRestaurando] = useState(true);
  const [aviso, definirAviso] = useState<string | null>(null);
  const clienteConsultas = useQueryClient();

  const limparSessao = useCallback(
    async (mensagem?: string) => {
      definirSessao(null);
      clienteConsultas.clear();
      definirAviso(mensagem ?? null);
      await excluirSessaoProtegida();
    },
    [clienteConsultas],
  );

  useEffect(() => {
    let ativo = true;
    async function restore() {
      let armazenado: SessaoProtegida | null = null;
      try {
        armazenado = await lerSessaoProtegida();
        if (!armazenado) return;
        const user = await api<UsuarioSessao>("/auth/me", {
          token: armazenado.accessToken,
        });
        if (ativo) definirSessao(converterRespostaAutenticacao({ ...armazenado, user }));
      } catch (erro) {
        if (
          armazenado?.user &&
          !sessaoExpirada(armazenado.expiresAt) &&
          erro instanceof ErroApi &&
          erro.estadoResposta === 0
        ) {
          if (ativo) {
            definirSessao(converterRespostaAutenticacao({ ...armazenado, user: armazenado.user }));
            definirAviso(
              "Sem conexão. Sessão local ainda válida; registros novos aguardam verificação da API.",
            );
          }
          return;
        }
        await excluirSessaoProtegida().catch(() => undefined);
        if (ativo)
          definirAviso(
            "Não foi possível verificar a sessão anterior. Entre novamente.",
          );
      } finally {
        if (ativo) definirRestaurando(false);
      }
    }
    void restore();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!sessao) return;
    const checkExpiry = () => {
      if (sessaoExpirada(sessao.expiraEm))
        void limparSessao("Sua sessão terminou. Entre novamente.").catch(
          () => undefined,
        );
    };
    const delay = Math.max(
      0,
      Math.min(Date.parse(sessao.expiraEm) - Date.now(), 2147483647),
    );
    const temporizador = setTimeout(checkExpiry, delay);
    const inscricao = AppState.addEventListener("change", (estado) => {
      if (estado === "active") checkExpiry();
    });
    return () => {
      clearTimeout(temporizador);
      inscricao.remove();
    };
  }, [sessao, limparSessao]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const resposta = await api<RespostaAutenticacao>("/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password: senha },
      });
      if (sessaoExpirada(resposta.expiresAt))
        throw new ErroApi(
          "Não foi possível abrir uma sessão válida. Tente novamente.",
          0,
        );
      try {
        await salvarSessaoProtegida(resposta);
      } catch {
        await api<void>("/auth/logout", {
          token: resposta.accessToken,
          method: "POST",
        }).catch(() => undefined);
        throw new ErroApi(
          "Não foi possível proteger sua sessão neste aparelho. Tente novamente.",
          0,
        );
      }
      clienteConsultas.clear();
      definirAviso(null);
      definirSessao(converterRespostaAutenticacao(resposta));
    },
    [clienteConsultas],
  );

  const sair = useCallback(async () => {
    if (!sessao) return;
    try {
      await api<void>("/auth/logout", {
        token: sessao.tokenAcesso,
        method: "POST",
      });
    } catch (erro) {
      // A 401 already means this token cannot access the API. Network failure needs a retry.
      if (!(erro instanceof ErroApi && erro.estadoResposta === 401)) throw erro;
    }
    await cancelarLembretes(sessao.usuario.id).catch(() => undefined);
    await limparSessao("Sessão encerrada.");
  }, [sessao, limparSessao]);

  const requisicao = useCallback(
    async <T,>(
      caminho: string,
      opcoes: { method?: "GET" | "POST" | "PUT"; body?: unknown } = {},
    ): Promise<T> => {
      if (!sessao || sessaoExpirada(sessao.expiraEm)) {
        await limparSessao("Sua sessão terminou. Entre novamente.");
        throw new ErroApi("Entre novamente para continuar.", 401);
      }
      try {
        return await api<T>(caminho, { ...opcoes, token: sessao.tokenAcesso });
      } catch (erro) {
        if (erro instanceof ErroApi && erro.estadoResposta === 401)
          await limparSessao("Sua sessão terminou. Entre novamente.");
        throw erro;
      }
    },
    [sessao, limparSessao],
  );

  return (
    <ContextoAutenticacao.Provider
      value={{
        sessao: sessao,
        restaurando: restaurando,
        aviso: aviso,
        entrar: entrar,
        sair: sair,
        requisicao: requisicao,
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
}

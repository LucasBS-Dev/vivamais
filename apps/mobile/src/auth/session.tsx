import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthResponse, SessionUser } from "@viva/contracts";
import { api } from "../lib/api";
import { ApiError, isSessionExpired } from "../lib/api-core";
import {
  deleteStoredSession,
  readStoredSession,
  writeStoredSession,
} from "./session-storage";
import { cancelReminders } from "../lib/reminders";
import type { StoredSession } from "./session-codec";

interface SessionContextValue {
  session: AuthResponse | null;
  restoring: boolean;
  notice: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  request: <T>(
    path: string,
    options?: { method?: "GET" | "POST" | "PUT"; body?: unknown },
  ) => Promise<T>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const clearSession = useCallback(
    async (message?: string) => {
      setSession(null);
      queryClient.clear();
      setNotice(message ?? null);
      await deleteStoredSession();
    },
    [queryClient],
  );

  useEffect(() => {
    let active = true;
    async function restore() {
      let stored: StoredSession | null = null;
      try {
        stored = await readStoredSession();
        if (!stored) return;
        const user = await api<SessionUser>("/auth/me", {
          token: stored.accessToken,
        });
        if (active) setSession({ ...stored, user });
      } catch (error) {
        if (
          stored?.user &&
          !isSessionExpired(stored.expiresAt) &&
          error instanceof ApiError &&
          error.status === 0
        ) {
          if (active) {
            setSession({ ...stored, user: stored.user });
            setNotice(
              "Sem conexão. Sessão local ainda válida; registros novos aguardam verificação da API.",
            );
          }
          return;
        }
        await deleteStoredSession().catch(() => undefined);
        if (active)
          setNotice(
            "Não foi possível verificar a sessão anterior. Entre novamente.",
          );
      } finally {
        if (active) setRestoring(false);
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const checkExpiry = () => {
      if (isSessionExpired(session.expiresAt))
        void clearSession("Sua sessão terminou. Entre novamente.").catch(
          () => undefined,
        );
    };
    const delay = Math.max(
      0,
      Math.min(Date.parse(session.expiresAt) - Date.now(), 2147483647),
    );
    const timeout = setTimeout(checkExpiry, delay);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") checkExpiry();
    });
    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [session, clearSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });
      if (isSessionExpired(response.expiresAt))
        throw new ApiError(
          "Não foi possível abrir uma sessão válida. Tente novamente.",
          0,
        );
      try {
        await writeStoredSession(response);
      } catch {
        await api<void>("/auth/logout", {
          token: response.accessToken,
          method: "POST",
        }).catch(() => undefined);
        throw new ApiError(
          "Não foi possível proteger sua sessão neste aparelho. Tente novamente.",
          0,
        );
      }
      queryClient.clear();
      setNotice(null);
      setSession(response);
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    if (!session) return;
    try {
      await api<void>("/auth/logout", {
        token: session.accessToken,
        method: "POST",
      });
    } catch (error) {
      // A 401 already means this token cannot access the API. Network failure needs a retry.
      if (!(error instanceof ApiError && error.status === 401)) throw error;
    }
    await cancelReminders(session.user.id).catch(() => undefined);
    await clearSession("Sessão encerrada.");
  }, [session, clearSession]);

  const request = useCallback(
    async <T,>(
      path: string,
      options: { method?: "GET" | "POST" | "PUT"; body?: unknown } = {},
    ): Promise<T> => {
      if (!session || isSessionExpired(session.expiresAt)) {
        await clearSession("Sua sessão terminou. Entre novamente.");
        throw new ApiError("Entre novamente para continuar.", 401);
      }
      try {
        return await api<T>(path, { ...options, token: session.accessToken });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401)
          await clearSession("Sua sessão terminou. Entre novamente.");
        throw error;
      }
    },
    [session, clearSession],
  );

  return (
    <SessionContext.Provider
      value={{ session, restoring, notice, signIn, signOut, request }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("SessionProvider ausente.");
  return value;
}

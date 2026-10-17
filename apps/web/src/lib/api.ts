import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser } from "@viva/contracts";
import { canAccessPortal } from "./validation";

export const SESSION_COOKIE = "viva_session";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

export function apiBaseUrl(): string {
  const url = new URL(process.env.API_BASE_URL || "http://127.0.0.1:8080");
  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  ) {
    throw new Error("API_BASE_URL exige HTTPS no ambiente de demonstração.");
  }
  return url.origin;
}

export async function apiRequest<T>(
  path: string,
  options: {
    token?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
  } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}/api/v1${path}`, {
      method: options.method || "GET",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ApiError(
      503,
      "Não foi possível conectar à API. Verifique a conexão e tente novamente.",
    );
  }
  if (!response.ok) {
    const details: Record<number, string> = {
      400: "Confira as informações enviadas.",
      401: "A sessão expirou. Entre novamente.",
      403: "Sua conta não tem permissão para acessar este recurso.",
      404: "Este registro não foi encontrado ou não está disponível para sua conta.",
      409: "Este registro já existe ou foi alterado. Atualize a página e confira os dados.",
      413: "O arquivo ou formulário ultrapassa o tamanho permitido.",
      415: "O formato enviado não é permitido.",
      429: "Muitas tentativas. Aguarde um pouco antes de tentar novamente.",
    };
    // Não retransmitir mensagens internas, SQL ou conteúdo sensível de uma falha do backend.
    throw new ApiError(
      response.status,
      details[response.status] ||
        "A API não pôde concluir esta solicitação. Tente novamente.",
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const getSession = cache(
  async (): Promise<{ user: SessionUser; token: string }> => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) redirect("/?sessao=necessaria");
    try {
      const user = await apiRequest<SessionUser>("/auth/me", { token });
      if (!canAccessPortal(user.role)) redirect("/?perfil=paciente");
      return { user, token };
    } catch (error) {
      if (error instanceof ApiError && error.status === 401)
        redirect("/?sessao=expirada");
      throw error;
    }
  },
);

export async function authenticatedRequest<T>(path: string): Promise<T> {
  const { token } = await getSession();
  try {
    return await apiRequest<T>(path, { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      redirect("/?sessao=expirada");
    throw error;
  }
}

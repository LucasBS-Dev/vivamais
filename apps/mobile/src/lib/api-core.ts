/** Pure transport helpers: no React Native globals, suitable for security tests. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function isLocalHostname(hostname: string): boolean {
  const host = hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "::1" ||
    host === "::"
  )
    return true;
  if (
    (host.startsWith("fc") && host.includes(":")) ||
    (host.startsWith("fd") && host.includes(":")) ||
    host.startsWith("fe80:")
  )
    return true;
  const parts = host.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  )
    return false;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b !== undefined && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

export function resolveApiBaseUrl(raw: string, development: boolean): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("O endereço da API é inválido.");
  }
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !["https:", "http:"].includes(url.protocol)
  ) {
    throw new Error(
      "O endereço da API não pode conter credenciais, consulta ou fragmento.",
    );
  }
  if (!development && url.protocol !== "https:")
    throw new Error("A API deve usar HTTPS fora de desenvolvimento.");
  if (!development && isLocalHostname(url.hostname)) {
    throw new Error(
      "A distribuição deve usar uma API pública, fora da rede local.",
    );
  }
  return url.toString().replace(/\/$/, "");
}

export function isSessionExpired(expiresAt: string, now = Date.now()): boolean {
  const timestamp = Date.parse(expiresAt);
  return !Number.isFinite(timestamp) || timestamp <= now;
}

export function createTransport(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
  timeoutMs = 15000,
) {
  return async function request<T>(
    path: string,
    options: {
      token?: string;
      body?: unknown;
      method?: "GET" | "POST" | "PUT";
    } = {},
  ): Promise<T> {
    // Relative API paths only. Prevent accidental forwarding of a bearer token to another origin.
    const parsed = new URL(path, baseUrl);
    if (
      !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(parsed.pathname) ||
      parsed.origin !== new URL(baseUrl).origin ||
      !path.startsWith("/") ||
      path.startsWith("//") ||
      parsed.hash
    )
      throw new ApiError("Caminho de API inválido.", 0);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(`${baseUrl}/api/v1${path}`, {
        method: options.method ?? "GET",
        headers: {
          Accept: "application/json",
          ...(options.body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
          ...(options.token
            ? { Authorization: `Bearer ${options.token}` }
            : {}),
        },
        ...(options.body !== undefined
          ? { body: JSON.stringify(options.body) }
          : {}),
        signal: controller.signal,
        redirect: "error",
        credentials: "omit",
        cache: "no-store",
      });
      if (!response.ok) {
        // Do not surface arbitrary provider text, account existence or clinical payloads in errors.
        const message =
          response.status === 401
            ? "Acesso não autorizado. Confira suas credenciais ou entre novamente."
            : response.status === 403
              ? "Sua conta não tem permissão para esta ação."
              : response.status === 429
                ? "Muitas tentativas. Aguarde um pouco antes de tentar novamente."
                : "O serviço não conseguiu concluir a solicitação. Tente novamente.";
        throw new ApiError(message, response.status);
      }
      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        controller.signal.aborted
          ? "A conexão demorou demais. Tente novamente."
          : "Não foi possível conectar à API. Verifique sua conexão e tente novamente.",
        0,
      );
    } finally {
      clearTimeout(timeout);
    }
  };
}

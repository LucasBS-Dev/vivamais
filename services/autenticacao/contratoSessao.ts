import { sessaoExpirada } from "../transporteApi";
import type { UsuarioSessao } from "@viva/contracts";

export interface SessaoProtegida {
  accessToken: string;
  expiresAt: string;
  user?: UsuarioSessao;
}

export function interpretarSessaoProtegida(
  valor: string | null,
): SessaoProtegida | null {
  if (!valor) return null;
  try {
    const candidato: unknown = JSON.parse(valor);
    if (typeof candidato !== "object" || !candidato) return null;
    const sessao = candidato as Partial<SessaoProtegida>;
    if (
      typeof sessao.accessToken !== "string" ||
      !sessao.accessToken ||
      typeof sessao.expiresAt !== "string" ||
      sessaoExpirada(sessao.expiresAt)
    )
      return null;
    const identity = sessao.user;
    const validIdentity =
      identity &&
      typeof identity.id === "string" &&
      /^[a-f0-9-]{36}$/.test(identity.id) &&
      typeof identity.organizationId === "string" &&
      /^[a-f0-9-]{36}$/.test(identity.organizationId) &&
      typeof identity.displayName === "string" &&
      identity.displayName.length <= 160 &&
      typeof identity.email === "string" &&
      identity.email.length <= 254 &&
      ["PATIENT", "PROFESSIONAL", "ADMIN"].includes(identity.role);
    return {
      accessToken: sessao.accessToken,
      expiresAt: sessao.expiresAt,
      ...(validIdentity
        ? {
            user: {
              id: identity.id,
              organizationId: identity.organizationId,
              displayName: identity.displayName,
              email: identity.email,
              role: identity.role,
            },
          }
        : {}),
    };
  } catch {
    return null;
  }
}

export type LoginInput = { email: string; password: string };

export function parseLogin(input: {
  email: unknown;
  password: unknown;
}): LoginInput | null {
  if (typeof input.email !== "string" || typeof input.password !== "string")
    return null;
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return null;
  // Login aceita senhas existentes; política de criação pertence ao backend.
  if (input.password.length < 1 || input.password.length > 128) return null;
  return { email, password: input.password };
}

export function isTrustedOrigin(
  origin: string | null,
  requestUrl: string,
  configuredOrigin?: string,
): boolean {
  if (!origin || origin === "null") return false;
  try {
    const expected = new URL(configuredOrigin || requestUrl).origin;
    return new URL(origin).origin === expected && origin === expected;
  } catch {
    return false;
  }
}

export function publicOrigin(
  requestUrl: string,
  host: string | null,
  configuredOrigin?: string,
): string {
  if (configuredOrigin) return new URL(configuredOrigin).origin;
  const url = new URL(requestUrl);
  // NextRequest normaliza 127.0.0.1 para localhost; preserve Host local para o cookie não mudar de domínio no redirect.
  if (
    url.protocol === "http:" &&
    host &&
    /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)
  ) {
    return `http://${host}`;
  }
  return url.origin;
}

export function canAccessPortal(role: string): boolean {
  return role === "PROFESSIONAL" || role === "ADMIN";
}

export function safePatientId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

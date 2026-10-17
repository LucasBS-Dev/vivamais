import { isSessionExpired } from "../lib/api-core";
import type { SessionUser } from "@viva/contracts";

export interface StoredSession {
  accessToken: string;
  expiresAt: string;
  user?: SessionUser;
}

export function parseStoredSession(value: string | null): StoredSession | null {
  if (!value) return null;
  try {
    const candidate: unknown = JSON.parse(value);
    if (typeof candidate !== "object" || !candidate) return null;
    const session = candidate as Partial<StoredSession>;
    if (
      typeof session.accessToken !== "string" ||
      !session.accessToken ||
      typeof session.expiresAt !== "string" ||
      isSessionExpired(session.expiresAt)
    )
      return null;
    const identity = session.user;
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
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
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

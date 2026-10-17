import { NextRequest, NextResponse } from "next/server";
import type { AuthResponse } from "@viva/contracts";
import { ApiError, apiRequest, SESSION_COOKIE } from "@/lib/api";
import {
  canAccessPortal,
  isTrustedOrigin,
  parseLogin,
  publicOrigin,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

function loginRedirect(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(
    new URL(
      `/?erro=${reason}`,
      publicOrigin(
        request.url,
        request.headers.get("host"),
        process.env.APP_ORIGIN,
      ),
    ),
    303,
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: NextRequest) {
  const origin = publicOrigin(
    request.url,
    request.headers.get("host"),
    process.env.APP_ORIGIN,
  );
  if (!isTrustedOrigin(request.headers.get("origin"), origin)) {
    return NextResponse.json(
      { detail: "Origem da solicitação não permitida." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return NextResponse.json(
      { detail: "Formato de formulário não permitido." },
      { status: 415 },
    );
  }
  if (Number(request.headers.get("content-length") || "0") > 4096) {
    return NextResponse.json(
      { detail: "Solicitação muito grande." },
      { status: 413 },
    );
  }
  let form: URLSearchParams;
  try {
    // Limite também no stream: Content-Length não é confiável e pode estar ausente.
    const reader = request.body?.getReader();
    if (!reader) return loginRedirect(request, "dados");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        return NextResponse.json(
          { detail: "Solicitação muito grande." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    form = new URLSearchParams(new TextDecoder().decode(bytes));
  } catch {
    return loginRedirect(request, "dados");
  }
  if (form.getAll("email").length !== 1 || form.getAll("password").length !== 1)
    return loginRedirect(request, "dados");
  const input = parseLogin({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!input) return loginRedirect(request, "dados");
  try {
    const auth = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: input,
    });
    if (!canAccessPortal(auth.user.role)) {
      await apiRequest<void>("/auth/logout", {
        method: "POST",
        token: auth.accessToken,
      });
      return loginRedirect(request, "perfil");
    }
    const response = NextResponse.redirect(new URL("/painel", origin), 303);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(SESSION_COOKIE, auth.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(auth.expiresAt),
    });
    return response;
  } catch (error) {
    const reason =
      error instanceof ApiError
        ? error.status === 401
          ? "credenciais"
          : error.status === 429
            ? "limite"
            : "conexao"
        : "conexao";
    return loginRedirect(request, reason);
  }
}

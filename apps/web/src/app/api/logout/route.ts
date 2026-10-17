import { NextRequest, NextResponse } from "next/server";
import { ApiError, apiRequest, SESSION_COOKIE } from "@/lib/api";
import { isTrustedOrigin, publicOrigin } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const origin = publicOrigin(
    request.url,
    request.headers.get("host"),
    process.env.APP_ORIGIN,
  );
  if (!isTrustedOrigin(request.headers.get("origin"), origin)) {
    return NextResponse.json(
      { detail: "Origem da solicitação não permitida." },
      { status: 403 },
    );
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let confirmed = true;
  if (token) {
    try {
      await apiRequest<void>("/auth/logout", { method: "POST", token });
    } catch (error) {
      confirmed = error instanceof ApiError && error.status === 401;
    }
  }
  const response = NextResponse.redirect(
    new URL(confirmed ? "/?saida=confirmada" : "/?saida=local", origin),
    303,
  );
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

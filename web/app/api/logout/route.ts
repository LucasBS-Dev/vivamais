import { NextRequest, NextResponse } from "next/server";
import { ErroApi, requisicaoApi, SESSION_COOKIE } from "@/services/api";
import { origemPermitida, origemPublica } from "@/services/validacoes";

export async function POST(requisicao: NextRequest) {
  const origin = origemPublica(
    requisicao.url,
    requisicao.headers.get("host"),
    process.env.APP_ORIGIN,
  );
  if (!origemPermitida(requisicao.headers.get("origin"), origin)) {
    return NextResponse.json(
      { detail: "Origem da solicitação não permitida." },
      { status: 403 },
    );
  }
  const token = requisicao.cookies.get(SESSION_COOKIE)?.value;
  let confirmado = true;
  if (token) {
    try {
      await requisicaoApi<void>("/auth/logout", {
        method: "POST",
        token: token,
      });
    } catch (erro) {
      confirmado = erro instanceof ErroApi && erro.estadoResposta === 401;
    }
  }
  const resposta = NextResponse.redirect(
    new URL(confirmado ? "/?saida=confirmada" : "/?saida=local", origin),
    303,
  );
  resposta.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}

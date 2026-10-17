import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  requisicaoApi,
  enderecoApi,
  SESSION_COOKIE,
  ErroApi,
} from "@/services/api";
import { idPacienteValido } from "@/services/validacoes";
export const dynamic = "force-dynamic";
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!idPacienteValido(id)) return new NextResponse(null, { status: 404 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return new NextResponse(null, { status: 401 });
  try {
    const grant = await requisicaoApi<{ path: string }>(`/files/${id}/link`, {
      token: token,
      method: "POST",
    });
    if (!grant.path.startsWith(`/api/v1/files/${id}/content?access=`))
      return new NextResponse(null, { status: 503 });
    const resposta = await fetch(`${enderecoApi()}${grant.path}`, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!resposta.ok)
      return new NextResponse(null, { status: resposta.status });
    return new NextResponse(await resposta.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (erro) {
    return new NextResponse(null, {
      status: erro instanceof ErroApi ? erro.estadoResposta : 503,
    });
  }
}

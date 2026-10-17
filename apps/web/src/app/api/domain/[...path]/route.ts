import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ApiError, apiRequest, apiBaseUrl, SESSION_COOKIE } from "@/lib/api";
import { isTrustedOrigin, publicOrigin } from "@/lib/validation";

export const dynamic = "force-dynamic";
const uuid = "[0-9a-fA-F-]{36}";
const allowed = new RegExp(
  `^(?:patients(?:/search|/${uuid}(?:/(?:readings|medications|medication-events|medication-reports|diary|activities|activity-profile|consultations|summary|export|access-reset|assignments(?:/revoke)?|device(?:/configurations)?|meals|files))?)?|medications/${uuid}(?:/history)?|files/${uuid}/(?:link|ocr)|meals/${uuid}/analyze|professionals)$`,
);

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const path = (await context.params).path.join("/");
  if (!allowed.test(path))
    return NextResponse.json(
      { detail: "Rota não permitida." },
      { status: 404 },
    );
  if (
    request.method !== "GET" &&
    !isTrustedOrigin(
      request.headers.get("origin"),
      publicOrigin(
        request.url,
        request.headers.get("host"),
        process.env.APP_ORIGIN,
      ),
    )
  )
    return NextResponse.json(
      { detail: "Origem não permitida." },
      { status: 403 },
    );
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token)
    return NextResponse.json({ detail: "Entre novamente." }, { status: 401 });
  try {
    if (
      request.method === "POST" &&
      /^patients\/[a-fA-F0-9-]{36}\/files$/.test(path)
    ) {
      if (
        !request.headers.get("content-type")?.startsWith("multipart/form-data")
      )
        return NextResponse.json(
          { detail: "Selecione uma imagem." },
          { status: 415 },
        );
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      if (reader)
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          bytes += part.value.length;
          if (bytes > 3145728) {
            await reader.cancel();
            return NextResponse.json(
              { detail: "Use foto com até 2 MB." },
              { status: 413 },
            );
          }
          chunks.push(part.value);
        }
      const payload = new Uint8Array(bytes);
      let offset = 0;
      for (const part of chunks) {
        payload.set(part, offset);
        offset += part.length;
      }
      const r = await fetch(`${apiBaseUrl()}/api/v1/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": request.headers.get("content-type")!,
        },
        body: payload,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(20000),
      });
      if (!r.ok)
        return NextResponse.json(
          {
            detail:
              r.status === 413
                ? "Use foto com até 2 MB."
                : r.status === 415
                  ? "Selecione PNG ou JPEG válido."
                  : "Não foi possível enviar a foto.",
          },
          { status: r.status },
        );
      return NextResponse.json(await r.json(), {
        headers: { "Cache-Control": "no-store" },
      });
    }
    let body: unknown;
    if (request.method !== "GET") {
      if (!request.headers.get("content-type")?.startsWith("application/json"))
        return NextResponse.json({ detail: "Use JSON." }, { status: 415 });
      const reader = request.body?.getReader();
      let bytes = 0;
      const chunks: Uint8Array[] = [];
      if (reader)
        while (true) {
          const item = await reader.read();
          if (item.done) break;
          bytes += item.value.length;
          if (bytes > 32768) {
            await reader.cancel();
            return NextResponse.json(
              { detail: "Formulário muito grande." },
              { status: 413 },
            );
          }
          chunks.push(item.value);
        }
      const all = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        all.set(chunk, offset);
        offset += chunk.length;
      }
      try {
        body = JSON.parse(new TextDecoder().decode(all));
      } catch {
        return NextResponse.json({ detail: "JSON inválido." }, { status: 400 });
      }
    }
    const response = await apiRequest<unknown>(
      `/${path}${request.nextUrl.search}`,
      { token, method: request.method as "GET" | "POST" | "PUT", body },
    );
    if (response === undefined) return new NextResponse(null, { status: 204 });
    return NextResponse.json(response, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return NextResponse.json(
      {
        detail:
          error instanceof ApiError ? error.detail : "Serviço indisponível.",
      },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PUT };

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest, apiBaseUrl, SESSION_COOKIE, ApiError } from "@/lib/api";
import { safePatientId } from "@/lib/validation";
export const dynamic = "force-dynamic";
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!safePatientId(id)) return new NextResponse(null, { status: 404 });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return new NextResponse(null, { status: 401 });
  try {
    const grant = await apiRequest<{ path: string }>(`/files/${id}/link`, {
      token,
      method: "POST",
    });
    if (!grant.path.startsWith(`/api/v1/files/${id}/content?access=`))
      return new NextResponse(null, { status: 503 });
    const r = await fetch(`${apiBaseUrl()}${grant.path}`, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return new NextResponse(null, { status: r.status });
    return new NextResponse(await r.arrayBuffer(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: error instanceof ApiError ? error.status : 503,
    });
  }
}

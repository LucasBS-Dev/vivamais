// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requestApi } = vi.hoisted(() => ({ requestApi: vi.fn() }));
vi.mock("@/services/api", () => ({
  requisicaoApi: requestApi,
  SESSION_COOKIE: "viva_session",
  ErroApi: class extends Error {
    constructor(public estadoResposta: number) {
      super("API error");
    }
  },
}));
import { POST } from "./route";

const origin = "http://127.0.0.1:3000";
function requisicao(source = origin) {
  return new NextRequest(`${origin}/api/logout`, {
    method: "POST",
    headers: { origin: source, cookie: "viva_session=synthetic-test-token" },
  });
}

describe("BFF de encerramento de sessão", () => {
  beforeEach(() => {
    requestApi.mockReset();
    vi.stubEnv("APP_ORIGIN", origin);
  });
  afterEach(() => vi.unstubAllEnvs());
  it("bloqueia saída forçada por outra origem", async () => {
    const resposta = await POST(requisicao("https://foreign.example.org"));
    expect(resposta.status).toBe(403);
    expect(requestApi).not.toHaveBeenCalled();
  });
  it("revoga na API e remove o cookie", async () => {
    requestApi.mockResolvedValueOnce(undefined);
    const resposta = await POST(requisicao());
    expect(requestApi).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
      token: "synthetic-test-token",
    });
    expect(resposta.headers.get("location")).toBe(
      `${origin}/?saida=confirmada`,
    );
    expect(resposta.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
    expect(resposta.headers.get("set-cookie")).toMatch(/HttpOnly/i);
  });
  it("remove a sessão local e informa quando não houve confirmação da API", async () => {
    requestApi.mockRejectedValueOnce(new Error("offline"));
    const resposta = await POST(requisicao());
    expect(resposta.headers.get("location")).toBe(`${origin}/?saida=local`);
    expect(resposta.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
  });
});

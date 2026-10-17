// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requestApi } = vi.hoisted(() => ({ requestApi: vi.fn() }));
vi.mock("@/lib/api", () => ({
  apiRequest: requestApi,
  SESSION_COOKIE: "viva_session",
  ApiError: class extends Error {
    constructor(public status: number) {
      super("API error");
    }
  },
}));
import { POST } from "./route";

const origin = "http://127.0.0.1:3000";
function request(source = origin) {
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
    const response = await POST(request("https://foreign.example.org"));
    expect(response.status).toBe(403);
    expect(requestApi).not.toHaveBeenCalled();
  });
  it("revoga na API e remove o cookie", async () => {
    requestApi.mockResolvedValueOnce(undefined);
    const response = await POST(request());
    expect(requestApi).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
      token: "synthetic-test-token",
    });
    expect(response.headers.get("location")).toBe(
      `${origin}/?saida=confirmada`,
    );
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/i);
  });
  it("remove a sessão local e informa quando não houve confirmação da API", async () => {
    requestApi.mockRejectedValueOnce(new Error("offline"));
    const response = await POST(request());
    expect(response.headers.get("location")).toBe(`${origin}/?saida=local`);
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
  });
});

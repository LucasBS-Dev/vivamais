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
function request(data: Record<string, string>, source: string | null = origin) {
  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
  };
  if (source) headers.origin = source;
  return new NextRequest(`${origin}/api/session`, {
    method: "POST",
    headers,
    body: new URLSearchParams(data),
  });
}

describe("BFF de login", () => {
  beforeEach(() => {
    requestApi.mockReset();
    vi.stubEnv("APP_ORIGIN", origin);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("recusa CSRF antes de encaminhar credenciais", async () => {
    const response = await POST(
      request(
        { email: "test@example.org", password: "test-only" },
        "https://foreign.example.org",
      ),
    );
    expect(response.status).toBe(403);
    expect(requestApi).not.toHaveBeenCalled();
  });

  it("não chama a API com formulário inválido", async () => {
    const response = await POST(request({ email: "wrong", password: "" }));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${origin}/?erro=dados`);
    expect(requestApi).not.toHaveBeenCalled();
  });

  it("emite cookie HttpOnly e não devolve o token no corpo nem no redirect", async () => {
    requestApi.mockResolvedValueOnce({
      accessToken: "synthetic-token-for-unit-test",
      expiresAt: "2030-01-01T00:00:00Z",
      user: { id: "unit-test-user", role: "PROFESSIONAL" },
    });
    const response = await POST(
      request({ email: " Test@Example.org ", password: " keep-exact " }),
    );
    expect(requestApi).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "test@example.org", password: " keep-exact " },
    });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${origin}/painel`);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    expect(response.headers.get("set-cookie")).toMatch(/SameSite=strict/i);
    expect(await response.text()).not.toContain(
      "synthetic-token-for-unit-test",
    );
  });

  it("revoga sessão de paciente e não emite cookie para o portal", async () => {
    requestApi.mockResolvedValueOnce({
      accessToken: "patient-test-token",
      user: { role: "PATIENT" },
    });
    requestApi.mockResolvedValueOnce(undefined);
    const response = await POST(
      request({ email: "patient@example.org", password: "test-only" }),
    );
    expect(requestApi).toHaveBeenLastCalledWith("/auth/logout", {
      method: "POST",
      token: "patient-test-token",
    });
    expect(response.headers.get("location")).toBe(`${origin}/?erro=perfil`);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("aplica limite real de corpo sem depender de Content-Length", async () => {
    const response = await POST(
      request({ email: "test@example.org", password: "a".repeat(5000) }),
    );
    expect(response.status).toBe(413);
    expect(requestApi).not.toHaveBeenCalled();
  });
});

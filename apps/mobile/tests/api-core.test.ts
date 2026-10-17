import { describe, expect, it, vi } from "vitest";
import {
  ApiError,
  createTransport,
  isSessionExpired,
  resolveApiBaseUrl,
} from "../src/lib/api-core";
import { parseStoredSession } from "../src/auth/session-codec";

describe("API boundary", () => {
  it("requires HTTPS and non-localhost outside development", () => {
    expect(resolveApiBaseUrl("http://10.0.2.2:8080/", true)).toBe(
      "http://10.0.2.2:8080",
    );
    expect(resolveApiBaseUrl("https://api.example.org", false)).toBe(
      "https://api.example.org",
    );
    expect(() => resolveApiBaseUrl("http://api.example.org", false)).toThrow(
      "HTTPS",
    );
    expect(() => resolveApiBaseUrl("https://localhost", false)).toThrow(
      "pública",
    );
    expect(() => resolveApiBaseUrl("https://10.0.2.2:8080", false)).toThrow(
      "pública",
    );
    expect(() => resolveApiBaseUrl("https://192.168.1.20", false)).toThrow(
      "pública",
    );
    expect(() => resolveApiBaseUrl("https://[::1]", false)).toThrow("pública");
    expect(() =>
      resolveApiBaseUrl("https://user:secret@api.example.org", false),
    ).toThrow("credenciais");
    expect(() =>
      resolveApiBaseUrl("https://api.example.org?token=secret", false),
    ).toThrow();
  });

  it("scopes bearer tokens to configured API paths and requests redirect rejection", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ id: "patient" }), { status: 200 }),
      );
    const request = createTransport("https://api.example.org", fetcher);
    await expect(request("/patients/me", { token: "opaque" })).resolves.toEqual(
      { id: "patient" },
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.org/api/v1/patients/me",
      expect.objectContaining({
        headers: { Accept: "application/json", Authorization: "Bearer opaque" },
        redirect: "error",
        credentials: "omit",
        cache: "no-store",
      }),
    );
    await expect(
      request("https://another.example.org", { token: "opaque" }),
    ).rejects.toThrow("Caminho");
    await expect(
      request("//another.example.org", { token: "opaque" }),
    ).rejects.toThrow("Caminho");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("sends login and logout to real endpoints and handles 204", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: "opaque" }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const request = createTransport("https://api.example.org", fetcher);
    await request("/auth/login", {
      method: "POST",
      body: { email: "test@example.org", password: "not-logged" },
    });
    await expect(
      request("/auth/logout", { method: "POST", token: "opaque" }),
    ).resolves.toBeUndefined();
    expect(fetcher.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ email: "test@example.org", password: "not-logged" }),
    );
    expect(fetcher.mock.calls[1]?.[1]?.method).toBe("POST");
  });

  it("does not expose account existence or arbitrary provider text", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ detail: "Patient secret and email exists" }),
          { status: 401 },
        ),
      );
    await expect(
      createTransport("https://api.example.org", fetcher)("/auth/login"),
    ).rejects.toEqual(expect.objectContaining({ status: 401 }));
    try {
      await createTransport("https://api.example.org", fetcher)("/auth/login");
    } catch (error) {
      expect((error as ApiError).message).not.toContain("secret");
    }
  });

  it("aborts slow connections and makes failure retryable", async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          );
        }),
    );
    await expect(
      createTransport("https://api.example.org", fetcher, 5)("/auth/me"),
    ).rejects.toThrow("demorou demais");
  });
});

describe("session lifetime", () => {
  it("treats invalid or past expiration as expired", () => {
    expect(isSessionExpired("invalid")).toBe(true);
    expect(
      isSessionExpired(
        "2026-10-16T12:00:00Z",
        Date.parse("2026-10-16T12:00:00Z"),
      ),
    ).toBe(true);
    expect(
      isSessionExpired(
        "2026-10-16T12:00:01Z",
        Date.parse("2026-10-16T12:00:00Z"),
      ),
    ).toBe(false);
  });
  it("restores only token and validity, rejecting malformed and expired data", () => {
    const expiresAt = new Date(Date.now() + 60000).toISOString();
    expect(
      parseStoredSession(
        JSON.stringify({
          accessToken: "opaque",
          expiresAt,
          password: "must-be-ignored",
          user: {},
        }),
      ),
    ).toEqual({ accessToken: "opaque", expiresAt });
    expect(parseStoredSession("broken")).toBeNull();
    expect(
      parseStoredSession(JSON.stringify({ accessToken: "", expiresAt })),
    ).toBeNull();
    expect(
      parseStoredSession(
        JSON.stringify({ accessToken: "opaque", expiresAt: "2020-01-01" }),
      ),
    ).toBeNull();
  });
});

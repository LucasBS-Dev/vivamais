import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("distribution configuration", () => {
  it("rejects a preview build pointing at a local API before bundling", async () => {
    vi.stubEnv("APP_ENV", "preview");
    for (const nomeServidor of [
      "localhost",
      "127.0.0.1",
      "10.0.2.2",
      "192.168.1.20",
      "[::1]",
    ]) {
      vi.resetModules();
      vi.stubEnv("EXPO_PUBLIC_API_BASE_URL", `https://${nomeServidor}`);
      await expect(import("../../app.config")).rejects.toThrow("API pública");
    }
  });

  it("accepts a public HTTPS API and removes native cleartext allowances", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("EXPO_PUBLIC_API_BASE_URL", "https://api.example.org");
    const { default: config } = await import("../../app.config");
    expect(config.ios?.infoPlist?.NSAppTransportSecurity).toBeUndefined();
    expect(config.plugins).toContainEqual([
      "expo-build-properties",
      { android: { usesCleartextTraffic: false } },
    ]);
  });
});

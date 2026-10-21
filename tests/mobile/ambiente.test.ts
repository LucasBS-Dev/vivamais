import { afterEach, expect, it, vi } from "vitest";
const configuracao = vi.hoisted(() => ({ modo: "development" }));
vi.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        get appEnvironment() {
          return configuracao.modo;
        },
      },
    },
  },
}));
afterEach(() => vi.resetModules());
for (const modo of ["development", "test", "preview"]) {
  it(`identifica dados de demonstração em ${modo}`, async () => {
    configuracao.modo = modo;
    expect((await import("../../services/ambiente")).ambienteDemonstracao).toBe(
      true,
    );
  });
}
it("não rotula um build de produção como demonstração por inferência de conta", async () => {
  configuracao.modo = "production";
  expect((await import("../../services/ambiente")).ambienteDemonstracao).toBe(
    false,
  );
});

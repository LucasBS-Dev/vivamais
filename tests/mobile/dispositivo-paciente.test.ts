import { beforeEach, it, expect, vi } from "vitest";
const apoio = vi.hoisted(() => ({
  plataforma: { OS: "web" },
  ler: vi.fn(),
  salvar: vi.fn(),
  excluir: vi.fn(),
  api: vi.fn(),
}));
vi.mock("react-native", () => ({ Platform: apoio.plataforma }));
vi.mock("expo-secure-store", () => ({
  getItemAsync: apoio.ler,
  setItemAsync: apoio.salvar,
  deleteItemAsync: apoio.excluir,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "SOMENTE_ESTE_APARELHO_DESBLOQUEADO",
}));
vi.mock("../../services/api", () => ({ api: apoio.api }));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  apoio.plataforma.OS = "web";
});
it("navegador não lê nem grava a credencial de aparelho por JavaScript", async () => {
  const modulo = await import(
    "../../services/autenticacao/dispositivoPaciente"
  );
  expect(await modulo.lerCredencialDispositivo()).toBeUndefined();
  await modulo.protegerDispositivo({
    estado: "AUTENTICADO",
    credencialDispositivo: "x".repeat(43),
  });
  await modulo.excluirDispositivoProtegido();
  expect(apoio.ler).not.toHaveBeenCalled();
  expect(apoio.salvar).not.toHaveBeenCalled();
  expect(apoio.excluir).not.toHaveBeenCalled();
});
it.each([
  ["x".repeat(43), "x".repeat(43)],
  ["valor-invalido", undefined],
])("nativo valida a credencial lida do cofre", async (valor, esperado) => {
  apoio.plataforma.OS = "android";
  apoio.ler.mockResolvedValue(valor);
  const modulo = await import(
    "../../services/autenticacao/dispositivoPaciente"
  );
  expect(await modulo.lerCredencialDispositivo()).toBe(esperado);
});
it("nativo protege o segredo somente no aparelho desbloqueado", async () => {
  apoio.plataforma.OS = "ios";
  apoio.salvar.mockResolvedValue(undefined);
  const modulo = await import(
    "../../services/autenticacao/dispositivoPaciente"
  );
  await modulo.protegerDispositivo({
    estado: "AUTENTICADO",
    credencialDispositivo: "x".repeat(43),
  });
  expect(apoio.salvar).toHaveBeenCalledWith(
    "viva.dispositivo.paciente.v1",
    "x".repeat(43),
    { keychainAccessible: "SOMENTE_ESTE_APARELHO_DESBLOQUEADO" },
  );
});
it("falha do cofre é propagada sem armazenamento inseguro de fallback", async () => {
  apoio.plataforma.OS = "android";
  apoio.salvar.mockRejectedValue(new Error("Cofre indisponivel"));
  const modulo = await import(
    "../../services/autenticacao/dispositivoPaciente"
  );
  await expect(
    modulo.protegerDispositivo({
      estado: "AUTENTICADO",
      credencialDispositivo: "x".repeat(43),
    }),
  ).rejects.toThrow("Cofre");
});

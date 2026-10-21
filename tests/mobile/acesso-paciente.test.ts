import { describe, it, expect, vi } from "vitest";
import {
  formatarCpf,
  formatarNascimento,
  interpretarNascimento,
  validarCpf,
} from "../../packages/contracts/src/index";
import { criarTransporte } from "../../services/transporteApi";

describe("acesso sem senha", () => {
  it("aplica máscaras progressivas sem perder zeros", () => {
    expect(formatarCpf("01234567890")).toBe("012.345.678-90");
    expect(formatarNascimento("01011950")).toBe("01/01/1950");
    expect(formatarCpf("01")).toBe("01");
  });
  it.each([
    "31/02/1950",
    "29/02/1951",
    "00/01/1950",
    "01/13/1950",
    "01/01/1899",
    "1/1/1950",
    "01/01/3000",
  ])("rejeita data inválida %s", (valor) => {
    expect(
      interpretarNascimento(valor, new Date("2026-10-20T12:00:00Z")),
    ).toBeNull();
  });
  it("aceita calendário real e converte sem inverter dia e mês", () => {
    expect(interpretarNascimento("29/02/1952")).toBe("1952-02-29");
    expect(interpretarNascimento("03/04/1950")).toBe("1950-04-03");
    expect(validarCpf("000.000.000-00")).toBe(false);
  });
  it("só inclui cookies nas rotas específicas de autorização do aparelho", async () => {
    const buscar = vi
      .fn<typeof fetch>()
      .mockImplementation(async () =>
        Response.json({ estado: "VERIFICACAO_NECESSARIA" }),
      );
    const enviar = criarTransporte("https://api.example.org", buscar);
    await enviar("/auth/paciente/iniciar", {
      method: "POST",
      body: { tipo: "WEB" },
    });
    expect(buscar.mock.calls[0]?.[1]?.credentials).toBe("include");
    await enviar("/patients/me", { token: "token-sintetico" });
    expect(buscar.mock.calls[1]?.[1]?.credentials).toBe("omit");
  });
});

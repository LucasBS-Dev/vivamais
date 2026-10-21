import { describe, expect, it } from "vitest";
import {
  normalizarCelularBrasileiro,
  mascararCelularBrasileiro,
  formatarCelularBrasileiro,
  validarCpf,
} from "../../packages/contracts/src/cadastro";

describe("validação cadastral estrutural", () => {
  it("exige DDD brasileiro existente e nove dígitos de celular", () => {
    for (const numero of [
      "",
      "(23) 91111-1111",
      "(11) 3111-1111",
      "+111911111111",
      "1191111111",
      "abc",
    ])
      expect(normalizarCelularBrasileiro(numero)).toBeNull();
  });
  it("normaliza máscara e formato internacional sem duplicar o país", () => {
    expect(normalizarCelularBrasileiro("(11) 91111-1111")).toBe(
      "+5511911111111",
    );
    expect(normalizarCelularBrasileiro("+5511911111111")).toBe(
      "+5511911111111",
    );
  });
  it("preserva DDD 55 ao normalizar número nacional", () => {
    expect(normalizarCelularBrasileiro("55911111111")).toBe("+5555911111111");
  });
  it("aplica máscara no preenchimento e na exibição", () => {
    expect(mascararCelularBrasileiro("11911111111")).toBe("(11) 91111-1111");
    expect(formatarCelularBrasileiro("+5511911111111")).toBe("(11) 91111-1111");
    expect(formatarCelularBrasileiro(null)).toBe("Não informado");
  });
  it("preserva contato legado na exibição sem afirmar que é válido", () => {
    expect(formatarCelularBrasileiro("123")).toBe("123");
  });
  it("CPF rejeita sequências, pontuação indevida e dígitos incorretos", () => {
    for (const cpf of [
      "00000000000",
      "11111111111",
      "12345678901",
      "123",
      "12..345678901",
    ])
      expect(validarCpf(cpf)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { calcularIdade } from "../../services/atividades/idade";

describe("idade cadastral em data de Brasília", () => {
  it("respeita o aniversário sem converter nascimento para o fuso do navegador", () => {
    expect(calcularIdade("1954-10-20", "2026-10-19")).toBe(71);
    expect(calcularIdade("1954-10-20", "2026-10-20")).toBe(72);
    expect(calcularIdade("2026-10-19", "2026-10-19")).toBe(0);
  });
  it("não inventa idade para cadastro ausente, futuro ou inválido", () => {
    for (const data of [null, "", "2030-01-01", "1954-02-30", "31/12/1954"])
      expect(calcularIdade(data, "2026-10-19")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  podeAcessarPortal,
  origemPermitida,
  parseLogin,
  origemPublica,
  idPacienteValido,
} from "./validacoes";

describe("entrada e fronteira da sessão", () => {
  it("normaliza e-mail e preserva a senha exatamente", () => {
    expect(
      parseLogin({ email: " PROF@EXAMPLE.ORG ", password: " senha " }),
    ).toEqual({ email: "prof@example.org", password: " senha " });
  });
  it.each([
    { email: "errado", password: "senha" },
    { email: "x@example.org", password: "" },
    { email: "x@example.org", password: "a".repeat(129) },
    { email: null, password: "senha" },
  ])("rejeita dados inválidos sem chamar a API", (entrada) =>
    expect(parseLogin(entrada)).toBeNull(),
  );
  it("rejeita CSRF, origem ausente e prefixos enganosos", () => {
    const destination = "https://demo.example.org/api/session";
    expect(origemPermitida("https://demo.example.org", destination)).toBe(true);
    expect(origemPermitida("https://malicious.example", destination)).toBe(
      false,
    );
    expect(origemPermitida(null, destination)).toBe(false);
    expect(origemPermitida("null", destination)).toBe(false);
    expect(
      origemPermitida("https://demo.example.org.evil.example", destination),
    ).toBe(false);
    expect(origemPermitida("https://demo.example.org/path", destination)).toBe(
      false,
    );
  });
  it("usa origem pública configurada atrás do proxy", () => {
    expect(
      origemPermitida(
        "https://demo.example.org",
        "http://internal:3000/api/session",
        "https://demo.example.org",
      ),
    ).toBe(true);
    expect(
      origemPermitida(
        "http://internal:3000",
        "http://internal:3000/api/session",
        "https://demo.example.org",
      ),
    ).toBe(false);
  });
  it("preserva domínio local no redirect e usa origem explícita no deploy", () => {
    expect(
      origemPublica("http://localhost:3000/api/session", "127.0.0.1:3000"),
    ).toBe("http://127.0.0.1:3000");
    expect(
      origemPublica(
        "http://internal:3000/api/session",
        "foreign.example",
        "https://demo.example.org",
      ),
    ).toBe("https://demo.example.org");
    expect(
      origemPublica("https://demo.example.org/api/session", "foreign.example"),
    ).toBe("https://demo.example.org");
  });
  it("permite somente profissionais e administradores no portal", () => {
    expect(podeAcessarPortal("ADMIN")).toBe(true);
    expect(podeAcessarPortal("PROFESSIONAL")).toBe(true);
    expect(podeAcessarPortal("PATIENT")).toBe(false);
    expect(podeAcessarPortal("anything")).toBe(false);
  });
  it("restringe identificadores antes da montagem da URL de recurso", () => {
    expect(idPacienteValido("00000000-0000-4000-8000-000000000001")).toBe(true);
    expect(idPacienteValido("../auth/me")).toBe(false);
  });
});

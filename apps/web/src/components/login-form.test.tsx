import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginForm } from "./login-form";

describe("acesso profissional", () => {
  it("possui rótulos acessíveis e permite mostrar e ocultar a senha", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("E-mail institucional")).toHaveAttribute(
      "autocomplete",
      "username",
    );
    const password = screen.getByLabelText("Senha");
    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(password).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Ocultar senha" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(password).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Entrar na plataforma" }),
    ).toHaveAttribute("type", "submit");
  });
});

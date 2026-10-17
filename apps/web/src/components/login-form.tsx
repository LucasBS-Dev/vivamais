"use client";

import { useState } from "react";
import { Icon } from "./icons";

export function LoginForm() {
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <form
      action="/api/session"
      method="post"
      onSubmit={() => setPending(true)}
      className="login-form"
    >
      <div className="field">
        <label htmlFor="email">E-mail institucional</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          required
          maxLength={254}
          placeholder="seu.nome@instituicao.edu.br"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <div className="password-field">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={128}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={visible}
          >
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>
      <p className="form-hint">
        Use a conta individual fornecida pela equipe do projeto.
      </p>
      <button
        className="button button-primary login-submit"
        type="submit"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Entrando…" : "Entrar na plataforma"}
        <Icon name="arrow" size={20} />
      </button>
      <p className="secure-caption">
        <Icon name="lock" size={16} /> Acesso exclusivo para profissionais
        autorizados
      </p>
    </form>
  );
}

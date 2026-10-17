"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { Paciente } from "@viva/contracts";

export function CadastroPaciente() {
  const [modality, definirModalidadePaciente] = useState("APP");
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState("");
  const [resultado, definirResultado] = useState<{
    patient: Paciente;
    activationToken?: string;
    expiresAt?: string;
  } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    definirOcupado(true);
    definirErro("");
    const formulario = new FormData(event.currentTarget);
    try {
      const resposta = await fetch("/api/domain/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formulario.get("displayName"),
          modality,
          email: modality === "APP" ? formulario.get("email") : null,
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.detail || "Não foi possível cadastrar.");
      definirResultado(dados);
    } catch (e) {
      definirErro(
        e instanceof Error ? e.message : "Não foi possível cadastrar.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  if (resultado)
    return (
      <section className="panel padded">
        <h1>Paciente cadastrado</h1>
        <p role="status">
          {resultado.patient.displayName} foi salvo e está disponível para a sua
          conta.
        </p>
        {resultado.activationToken && (
          <div className="notice">
            <div>
              <strong>Ativação do aplicativo</strong>
              <p>
                Entregue este código à pessoa de teste por canal seguro. Ele
                expira em 24 horas e é exibido somente agora. No aplicativo,
                escolha Ativar conta e defina a senha.
              </p>
              <textarea
                readOnly
                aria-label="Código de ativação"
                value={resultado.activationToken}
              />
              <p>Não envie o código ao chat ou a serviços públicos.</p>
            </div>
          </div>
        )}
        <Link
          className="button button-primary"
          href={`/pacientes/${resultado.patient.id}`}
        >
          Abrir ficha do paciente
        </Link>
      </section>
    );
  return (
    <section className="panel padded">
      <h1>Cadastrar novo paciente</h1>
      <p className="form-hint">
        Use somente pessoas fictícias nesta demonstração.
      </p>
      <form onSubmit={submit}>
        <div className="cadastro-paciente">
          <div className="dados-pessoais">
            <h2>Dados pessoais</h2>
            <label>
              Nome completo *
              <input
                name="displayName"
                required
                maxLength={160}
                placeholder="Digite o nome completo"
                aria-label="Nome completo"
              />
            </label>
            {modality === "APP" && (
              <label>
                E-mail de ativação
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder="nome@exemplo.org"
                />
              </label>
            )}
            <p className="form-hint">
              Identificação por e-mail e código de ativação. Não coletamos CPF,
              telefone ou endereço nesta demo sem necessidade institucional
              definida.
            </p>
          </div>
          <div className="cartao-modalidade">
            <h2>Modalidade de acompanhamento</h2>
            <label className="opcao-modalidade">
              <input
                type="radio"
                name="modality"
                value="APP"
                checked={modality === "APP"}
                onChange={() => definirModalidadePaciente("APP")}
              />
              <span>
                <strong>▣ Aplicativo Viva+</strong>
                <small>
                  Paciente utilizará o aplicativo para registrar pressão,
                  alimentação, medicamentos e atividades físicas.
                </small>
              </span>
            </label>
            <label className="opcao-modalidade">
              <input
                type="radio"
                name="modality"
                value="BRACELET_DIARY"
                checked={modality === "BRACELET_DIARY"}
                onChange={() => definirModalidadePaciente("BRACELET_DIARY")}
              />
              <span>
                <strong>▤ Pulseira Pulso em Dia</strong>
                <small>
                  Horários de lembretes e registros em diário impresso,
                  transcritos pela equipe. Não exige smartphone. Hardware real
                  ainda indisponível.
                </small>
              </span>
            </label>
          </div>
        </div>
        {erro && <p role="alert">{erro}</p>}
        <div className="cadastro-acoes">
          <button className="button button-primary" disabled={ocupado}>
            {ocupado ? "Salvando…" : "Salvar paciente"}
          </button>
        </div>
      </form>
    </section>
  );
}

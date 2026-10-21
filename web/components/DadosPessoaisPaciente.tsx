"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  validarCpf,
  normalizarCelularBrasileiro,
  formatarCelularBrasileiro,
  type DadosPessoaisPaciente as DadosPaciente,
} from "@viva/contracts";
import { CamposDadosPessoais } from "./CamposDadosPessoais";
import { useClientePronto } from "../hooks/useClientePronto";

export function DadosPessoaisPaciente({ inicial }: { inicial: DadosPaciente }) {
  const pronto = useClientePronto(),
    navegador = useRouter();
  const [dados, definirDados] = useState(inicial),
    [editando, definirEditando] = useState(false),
    [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState(""),
    [mensagem, definirMensagem] = useState("");
  const [telefoneAlterado, definirTelefoneAlterado] = useState(false);
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = new FormData(evento.currentTarget);
    definirErro("");
    definirMensagem("");
    if (!validarCpf(String(formulario.get("cpf") ?? ""))) {
      definirErro("Confira o CPF informado.");
      return;
    }
    const telefoneInformado = String(formulario.get("telefone") ?? "");
    const telefone = normalizarCelularBrasileiro(telefoneInformado);
    if (telefoneAlterado && !telefone) {
      definirErro(
        "Informe um celular válido com DDD e nove números, começando por 9.",
      );
      return;
    }
    definirOcupado(true);
    try {
      const resposta = await fetch(
        `/api/domain/pacientes/${dados.idPaciente}/dados-pessoais`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomeCompleto: formulario.get("displayName"),
            cpf: formulario.get("cpf"),
            dataNascimento: formulario.get("dataNascimento") || null,
            emailContato: formulario.get("emailContato"),
            telefone: telefone ?? telefoneInformado,
            senhaProfissional: formulario.get("senhaProfissional") || null,
            identidadeConferida: formulario.get("identidadeConferida") === "on",
            sexo: formulario.get("sexo"),
            endereco: formulario.get("endereco"),
            versao: dados.versao,
          }),
        },
      );
      if (!resposta.ok)
        throw new Error(
          resposta.status === 409
            ? "Cadastro alterado por outra pessoa ou CPF já vinculado nesta unidade. Atualize a ficha antes de tentar novamente."
            : "Não foi possível salvar. Confira os dados e a conexão.",
        );
      definirDados(await resposta.json());
      definirEditando(false);
      definirMensagem("Cadastro atualizado.");
      navegador.refresh();
    } catch (falha) {
      definirErro(
        falha instanceof Error ? falha.message : "Não foi possível salvar.",
      );
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <section
      className="panel dados-cadastro"
      aria-label="Dados pessoais do paciente"
    >
      <div className="section-heading">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            definirEditando(!editando);
            definirTelefoneAlterado(false);
            definirErro("");
          }}
          disabled={ocupado}
        >
          {editando ? "Cancelar edição" : "Editar cadastro"}
        </button>
      </div>
      {mensagem && <p role="status">{mensagem}</p>}
      {erro && <p role="alert">{erro}</p>}
      {editando ? (
        <form
          method="post"
          onSubmit={salvar}
          onChange={(evento) => {
            const campo = evento.target as HTMLInputElement;
            if (campo.name === "telefone")
              definirTelefoneAlterado(
                normalizarCelularBrasileiro(campo.value) !==
                  normalizarCelularBrasileiro(dados.telefone ?? ""),
              );
          }}
        >
          <fieldset disabled={!pronto || ocupado}>
            <CamposDadosPessoais dados={dados} />
            {telefoneAlterado && (
              <div className="grupo-ativacao">
                <p>
                  A troca do celular revoga aparelhos e códigos antigos. O
                  paciente precisará ativar novamente pelo novo número.
                </p>
                <label className="confirmacao-identidade">
                  <input type="checkbox" name="identidadeConferida" required />{" "}
                  Conferi a identidade e o novo celular com o paciente.
                </label>
                <label>
                  Sua senha profissional para confirmar a troca
                  <input
                    type="password"
                    name="senhaProfissional"
                    autoComplete="current-password"
                    required
                    maxLength={72}
                  />
                </label>
              </div>
            )}
            <button
              className="button button-primary"
              disabled={!pronto || ocupado}
            >
              {ocupado ? "Salvando…" : "Salvar alterações do cadastro"}
            </button>
          </fieldset>
        </form>
      ) : (
        <>
          <dl className="resumo-demografico">
            <div>
              <dt>Nascimento</dt>
              <dd>
                {dados.dataNascimento
                  ? dados.dataNascimento.split("-").reverse().join("/")
                  : "Não informado"}
              </dd>
            </div>
            <div>
              <dt>CPF</dt>
              <dd>
                {dados.cpf
                  ? `***.***.${dados.cpf.slice(6, 9)}-${dados.cpf.slice(9)}`
                  : "Não informado"}
              </dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{formatarCelularBrasileiro(dados.telefone)}</dd>
            </div>
            <div>
              <dt>E-mail de contato</dt>
              <dd>{dados.emailContato || "Não informado"}</dd>
            </div>
          </dl>
          <details className="dados-adicionais">
            <summary>Sexo e endereço</summary>
            <p>
              Sexo:{" "}
              {(
                {
                  FEMININO: "Feminino",
                  MASCULINO: "Masculino",
                  INTERSEXO: "Intersexo",
                  NAO_INFORMADO: "Prefere não informar",
                } as Record<string, string>
              )[dados.sexo ?? ""] || "Não informado"}
            </p>
            <p>Endereço: {dados.endereco || "Não informado"}</p>
          </details>
        </>
      )}
    </section>
  );
}

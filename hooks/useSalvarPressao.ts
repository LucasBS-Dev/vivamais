import { useEffect, useRef, useState } from "react";
import * as Crypto from "expo-crypto";
import { useAutenticacao } from "./useAutenticacao";
import { useResumoPaciente } from "./useResumoPaciente";
import {
  memorizarPaciente,
  recuperarPaciente,
} from "../services/pacientes/identificacaoPaciente";
import { filaRegistros } from "../services/sincronizacao/filaRegistros";
import {
  criarCorpoRegistro,
  type FormularioPressao,
} from "../services/pressao/registrosPressao";
export function useSalvarPressao() {
  const { sessao: sessao, requisicao: requisicao } = useAutenticacao(),
    resumo = useResumoPaciente();
  const [idPaciente, definirIdPaciente] = useState(""),
    [salvando, definirSalvando] = useState(false),
    [erro, definirErro] = useState("");
  const envioAtual = useRef(false);
  useEffect(() => {
    if (!sessao) return;
    const id = resumo.data?.id;
    if (id) {
      definirIdPaciente(id);
      void memorizarPaciente(sessao.usuario.id, id).catch(() => undefined);
    } else
      void recuperarPaciente(sessao.usuario.id)
        .then((id) => {
          if (id) definirIdPaciente(id);
        })
        .catch(() => undefined);
  }, [sessao, resumo.data]);
  async function salvarPressao(
    entrada: FormularioPressao,
    confirmado: boolean,
  ) {
    if (!sessao || !idPaciente)
      throw new Error("Consulte sua identificação na API antes de registrar.");
    if (!confirmado)
      throw new Error("Confira e confirme os valores antes de salvar.");
    if (envioAtual.current) throw new Error("Aguarde o envio atual.");
    const data = new Date(entrada.dataMedicao);
    if (!Number.isFinite(data.getTime()))
      throw new Error("Informe uma data e hora válidas.");
    if (
      entrada.pulso !== null &&
      (!Number.isInteger(entrada.pulso) ||
        entrada.pulso < 1 ||
        entrada.pulso > 300)
    )
      throw new Error("Confira o pulso informado.");
    envioAtual.current = true;
    definirSalvando(true);
    definirErro("");
    try {
      const id = Crypto.randomUUID(),
        corpo = criarCorpoRegistro(id, {
          ...entrada,
          dataMedicao: data.toISOString(),
        });
      await filaRegistros.enqueue({
        id,
        owner: sessao.usuario.id,
        path: `/patients/${idPaciente}/readings`,
        body: corpo,
      });
      await filaRegistros.sync(sessao.usuario.id, (caminho, body) =>
        requisicao(caminho, { method: "POST", body }),
      );
      return {
        id,
        idPaciente,
        pendente: (await filaRegistros.read(sessao.usuario.id)).some(
          (item) => item.id === id,
        ),
      };
    } catch (e) {
      const mensagem =
        e instanceof Error
          ? e.message
          : "Não foi possível proteger o registro.";
      definirErro(mensagem);
      throw e;
    } finally {
      envioAtual.current = false;
      definirSalvando(false);
    }
  }
  return { salvarPressao, salvando, erro };
}

import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  formatarCelularBrasileiro,
  type DadosPessoaisPaciente,
} from "@viva/contracts";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { Text } from "./TextoAcessivel";
import { Carregando, MensagemErro } from "./ElementosInterface";
import { estilos as e } from "./estilos";
export function ContatoPaciente({ idPaciente }: { idPaciente: string }) {
  const { requisicao } = useAutenticacao();
  const [dados, definirDados] = useState<DadosPessoaisPaciente | null>(null);
  const [erro, definirErro] = useState("");
  useEffect(() => {
    let ativo = true;
    requisicao<DadosPessoaisPaciente>(`/pacientes/${idPaciente}/dados-pessoais`)
      .then((resultado) => {
        if (ativo) {
          definirDados(resultado);
        }
      })
      .catch(() => {
        if (ativo)
          definirErro("Não foi possível consultar seus dados pessoais.");
      });
    return () => {
      ativo = false;
    };
  }, [idPaciente, requisicao]);
  return (
    <View style={e.card}>
      <Text style={e.title}>Meus dados pessoais</Text>
      {!dados && !erro && <Carregando />}
      {erro && <MensagemErro mensagem={erro} />}{" "}
      {dados && (
        <>
          <Text style={e.body}>Nome: {dados.nomeCompleto}</Text>
          <Text style={e.body}>
            Nascimento:{" "}
            {dados.dataNascimento
              ? dados.dataNascimento.split("-").reverse().join("/")
              : "Não informado"}
          </Text>
          <Text style={e.body}>
            CPF:{" "}
            {dados.cpf
              ? `***.***.${dados.cpf.slice(6, 9)}-${dados.cpf.slice(9)}`
              : "Não informado"}
          </Text>
          <Text style={e.body}>
            Contato: {dados.emailContato || "Não informado"}
          </Text>
          <Text style={e.body}>
            Celular: {formatarCelularBrasileiro(dados.telefone)}
          </Text>
          <Text style={e.small}>
            Para alterar o celular de ativação ou corrigir seus dados, procure
            sua equipe. A confirmação profissional protege seu acesso.
          </Text>
        </>
      )}
    </View>
  );
}

import { useState } from "react";
import { Redirect } from "expo-router";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import { Botao, Carregando, Tela } from "../../components/ElementosInterface";
import { TelaCuidado } from "../../components/TelaCuidado";

export default function Historico() {
  const { sessao: sessao, restaurando: restaurando } = useAutenticacao();
  const [modulo, definirModulo] = useState("blood-pressure");
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  if (sessao.usuario.papel !== "PATIENT") return <Redirect href="/inicio" />;
  return (
    <TelaCuidado key={modulo} modulo={modulo} somenteHistorico>
      <Botao
        secundario
        rotulo="Histórico da pressão"
        onPress={() => definirModulo("blood-pressure")}
      />
      <Botao
        secundario
        rotulo="Histórico de atividades"
        onPress={() => definirModulo("activity")}
      />
      <Botao
        secundario
        rotulo="Histórico de medicamentos"
        onPress={() => definirModulo("medications")}
      />
      <Botao
        secundario
        rotulo="Histórico de refeições"
        onPress={() => definirModulo("food")}
      />
    </TelaCuidado>
  );
}

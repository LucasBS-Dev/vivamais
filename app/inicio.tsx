import { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useResumoPaciente } from "../hooks/useResumoPaciente";
import {
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
  Tela,
} from "../components/ElementosInterface";
import { BarraNavegacao } from "../components/BarraNavegacao";
import { IconeModulo } from "../components/IconeModulo";
import {
  filaRegistros,
  queueStorageDescription as descricaoFila,
} from "../services/sincronizacao/filaRegistros";
const acoes = [
  {
    chave: "blood-pressure",
    nome: "Minha Pressão",
    rota: "/pressao",
    icone: "pressao",
    cor: "#ff555d",
  },
  {
    chave: "medications",
    nome: "Meus Medicamentos",
    rota: "/medicamentos",
    icone: "medicamentos",
    cor: "#2db75f",
  },
  {
    chave: "food",
    nome: "Minha Alimentação",
    rota: "/alimentacao",
    icone: "alimentacao",
    cor: "#ff8e22",
  },
  {
    chave: "activity",
    nome: "Atividade Física",
    rota: "/atividade-fisica",
    icone: "atividade",
    cor: "#1598f5",
  },
] as const;
export default function Inicio() {
  const {
    sessao: sessao,
    restaurando: restaurando,
    sair: sair,
  } = useAutenticacao();
  const resumo = useResumoPaciente();
  const [pendentes, definirPendentes] = useState(0),
    [erro, definirErro] = useState(""),
    [saindo, definirSaindo] = useState(false);
  useEffect(() => {
    if (sessao)
      filaRegistros
        .read(sessao.usuario.id)
        .then((itens) => definirPendentes(itens.length))
        .catch(() => undefined);
  }, [sessao]);
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  return (
    <Tela>
      <View style={e.cabecalho}>
        <MarcaViva variante="verde" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Meu Perfil"
          onPress={() => router.push("/perfil")}
          style={e.perfil}
        >
          <Text style={e.pessoa}>●</Text>
        </Pressable>
      </View>
      <View style={e.saudacao}>
        <Text style={e.titulo} accessibilityRole="header">
          Olá, {sessao.usuario.nomeExibicao.split(" ")[0]}!
        </Text>
        <Text style={e.texto}>
          Que bom ter você por aqui!{"\n"}Vamos cuidar da sua saúde hoje?
        </Text>
      </View>
      {sessao.usuario.papel !== "PATIENT" ? (
        <MensagemErro mensagem="A equipe profissional deve acessar o portal pelo navegador." />
      ) : (
        <>
          {resumo.isPending && (
            <Carregando rotulo="Consultando sua identificação na API…" />
          )}
          {resumo.isError && (
            <MensagemErro mensagem="Sem conexão com a API. Registros novos aguardam sincronização." />
          )}
          <View style={e.grade}>
            {acoes.map((acao) => (
              <Pressable
                key={acao.chave}
                accessibilityRole="button"
                accessibilityLabel={`${acao.nome}. Abrir módulo.`}
                testID={`module-${acao.chave}`}
                onPress={() => router.push(acao.rota)}
                style={({ pressed }) => [
                  e.cartao,
                  { backgroundColor: acao.cor },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <IconeModulo nome={acao.icone} />
                <Text style={e.nomeCartao}>{acao.nome}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            testID="history-button"
            accessibilityRole="button"
            accessibilityLabel="Meu Histórico"
            onPress={() => router.push("/historico")}
            style={e.historico}
          >
            <Text style={e.grafico}>▥</Text>
            <Text style={e.rotuloHistorico}>Meu Histórico</Text>
            <Text style={e.seta}>›</Text>
          </Pressable>
          <BarraNavegacao />
          {pendentes > 0 && (
            <Text style={e.nota}>
              {pendentes} registros pendentes. {descricaoFila}
            </Text>
          )}
          {resumo.data && (
            <Text style={e.nota}>
              ✓ Conexão com a API confirmada ·{" "}
              {resumo.data.modality === "APP"
                ? "Aplicativo Viva+"
                : "Pulseira + diário"}
            </Text>
          )}
        </>
      )}
      {erro && <MensagemErro mensagem={erro} />}
      <Text style={e.nota}>
        Demonstração acadêmica · Somente dados sintéticos.
      </Text>
      <Botao
        secundario
        rotulo="Sair da minha conta"
        testID="logout-button"
        ocupado={saindo}
        onPress={() => {
          definirSaindo(true);
          sair()
            .catch(() =>
              definirErro(
                "Não foi possível encerrar a sessão. Verifique a conexão.",
              ),
            )
            .finally(() => definirSaindo(false));
        }}
      />
    </Tela>
  );
}
const e = StyleSheet.create({
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  perfil: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#edf6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  pessoa: { color: "#004782", fontSize: 28 },
  saudacao: { gap: 8, marginBottom: 8 },
  titulo: { fontSize: 26, fontWeight: "800", color: "#061a38" },
  texto: { fontSize: 18, lineHeight: 25, color: "#00396c" },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cartao: {
    flexGrow: 1,
    flexBasis: "45%",
    minHeight: 158,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  nomeCartao: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "700",
    textAlign: "center",
    color: "#ffffff",
    maxWidth: 155,
  },
  historico: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dce8f5",
    backgroundColor: "#fff",
  },
  grafico: { fontSize: 31, color: "#0075cc" },
  rotuloHistorico: { fontSize: 19, fontWeight: "700", color: "#003b74" },
  seta: { marginLeft: "auto", fontSize: 30, color: "#004b86" },
  nota: { fontSize: 12, lineHeight: 18, color: "#61778f" },
});

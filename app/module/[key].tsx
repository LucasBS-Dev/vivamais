import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { ChaveModulo, EstadoModulo } from "@viva/contracts";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import {
  MarcaViva,
  Botao,
  MensagemErro,
  Carregando,
  Tela,
} from "../../components/ElementosInterface";
import { nomesModulos, nomeEstadoModulo } from "../../services/modulos";
import { estilos as s } from "../../components/estilos";
import { TelaCuidado } from "../../components/TelaCuidado";

export default function ModuleScreen() {
  const { key: chave } = useLocalSearchParams<{ key: string }>();
  const {
    sessao: sessao,
    restaurando: restaurando,
    requisicao: requisicao,
  } = useAutenticacao();
  const busca = useQuery({
    queryKey: ["modules", sessao?.usuario.id],
    enabled: !!sessao,
    queryFn: () => requisicao<EstadoModulo[]>("/system/modules"),
  });
  if (restaurando)
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  if (sessao.usuario.papel !== "PATIENT") return <Redirect href="/inicio" />;
  if (
    typeof chave === "string" &&
    ["blood-pressure", "medications", "activity", "food"].includes(chave)
  )
    return <TelaCuidado key={chave} modulo={chave} />;
  const selecionado = busca.data?.find((modulo) => modulo.key === chave);
  const knownKey =
    typeof chave === "string" &&
    Object.prototype.hasOwnProperty.call(nomesModulos, chave);
  return (
    <Tela>
      <MarcaViva />
      <Text style={s.title} accessibilityRole="header">
        {knownKey
          ? nomesModulos[chave as ChaveModulo]
          : "Recurso não encontrado"}
      </Text>
      {busca.isPending ? (
        <Carregando rotulo="Verificando disponibilidade…" />
      ) : busca.isError ? (
        <View style={s.section}>
          <MensagemErro
            mensagem={
              busca.error instanceof Error
                ? busca.error.message
                : "Não foi possível consultar o recurso."
            }
          />
          <Botao
            rotulo="Tentar novamente"
            secundario
            ocupado={busca.isFetching}
            onPress={() => {
              void busca.refetch();
            }}
          />
        </View>
      ) : selecionado ? (
        <View style={s.card}>
          <Text style={s.eyebrow}>FASE {selecionado.phase}</Text>
          <Text style={s.title} accessibilityRole="header">
            {nomeEstadoModulo(selecionado.status)}
          </Text>
          <Text style={s.body}>{selecionado.reason}</Text>
          <Text style={s.small}>
            Nenhum dado clínico é criado nesta tela. A disponibilidade foi
            consultada na API do projeto.
          </Text>
        </View>
      ) : (
        <MensagemErro mensagem="Este recurso não foi encontrado na API. Volte ao início e tente atualizar a conexão." />
      )}
      {chave === "blood-pressure" && (
        <Text style={s.muted}>
          O celular não mede pressão pela câmera. A futura leitura de foto será
          apenas do visor de um aparelho e exigirá confirmação.
        </Text>
      )}
      {chave === "medications" && (
        <Text style={s.muted}>
          Os lembretes e o plano de medicamentos ainda não estão ativos. Siga as
          instruções recebidas da sua equipe de saúde.
        </Text>
      )}
      {chave === "food" && (
        <Text style={s.muted}>
          A análise educativa de fotos depende de validação clínica e de
          privacidade. Uma fotografia não mede nutrientes com precisão.
        </Text>
      )}
      {chave === "activity" && (
        <Text style={s.muted}>
          Orientações personalizadas dependem da avaliação e aprovação da equipe
          responsável.
        </Text>
      )}
      <Botao
        rotulo="Voltar ao início"
        onPress={() => router.dismissTo("/inicio")}
      />
    </Tela>
  );
}

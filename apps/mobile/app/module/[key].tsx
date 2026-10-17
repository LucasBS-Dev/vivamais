import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { ModuleKey, ModuleStatus } from "@viva/contracts";
import { useSession } from "../../src/auth/session";
import {
  Brand,
  Button,
  ErrorMessage,
  Loading,
  Screen,
} from "../../src/components/ui";
import { moduleLabels, moduleStatusLabel } from "../../src/lib/modules";
import { styles as s } from "../../src/theme/styles";
import { CareScreen } from "../../src/components/care-screen";

export default function ModuleScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { session, restoring, request } = useSession();
  const query = useQuery({
    queryKey: ["modules", session?.user.id],
    enabled: !!session,
    queryFn: () => request<ModuleStatus[]>("/system/modules"),
  });
  if (restoring)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (!session) return <Redirect href="/login" />;
  if (session.user.role !== "PATIENT") return <Redirect href="/home" />;
  if (
    typeof key === "string" &&
    ["blood-pressure", "medications", "activity", "food"].includes(key)
  )
    return <CareScreen key={key} module={key} />;
  const selected = query.data?.find((module) => module.key === key);
  const knownKey =
    typeof key === "string" &&
    Object.prototype.hasOwnProperty.call(moduleLabels, key);
  return (
    <Screen>
      <Brand />
      <Text style={s.title} accessibilityRole="header">
        {knownKey ? moduleLabels[key as ModuleKey] : "Recurso não encontrado"}
      </Text>
      {query.isPending ? (
        <Loading label="Verificando disponibilidade…" />
      ) : query.isError ? (
        <View style={s.section}>
          <ErrorMessage
            message={
              query.error instanceof Error
                ? query.error.message
                : "Não foi possível consultar o recurso."
            }
          />
          <Button
            label="Tentar novamente"
            secondary
            busy={query.isFetching}
            onPress={() => {
              void query.refetch();
            }}
          />
        </View>
      ) : selected ? (
        <View style={s.card}>
          <Text style={s.eyebrow}>FASE {selected.phase}</Text>
          <Text style={s.title} accessibilityRole="header">
            {moduleStatusLabel(selected.status)}
          </Text>
          <Text style={s.body}>{selected.reason}</Text>
          <Text style={s.small}>
            Nenhum dado clínico é criado nesta tela. A disponibilidade foi
            consultada na API do projeto.
          </Text>
        </View>
      ) : (
        <ErrorMessage message="Este recurso não foi encontrado na API. Volte ao início e tente atualizar a conexão." />
      )}
      {key === "blood-pressure" && (
        <Text style={s.muted}>
          O celular não mede pressão pela câmera. A futura leitura de foto será
          apenas do visor de um aparelho e exigirá confirmação.
        </Text>
      )}
      {key === "medications" && (
        <Text style={s.muted}>
          Os lembretes e o plano de medicamentos ainda não estão ativos. Siga as
          instruções recebidas da sua equipe de saúde.
        </Text>
      )}
      {key === "food" && (
        <Text style={s.muted}>
          A análise educativa de fotos depende de validação clínica e de
          privacidade. Uma fotografia não mede nutrientes com precisão.
        </Text>
      )}
      {key === "activity" && (
        <Text style={s.muted}>
          Orientações personalizadas dependem da avaliação e aprovação da equipe
          responsável.
        </Text>
      )}
      <Button
        label="Voltar ao início"
        onPress={() => router.dismissTo("/home")}
      />
    </Screen>
  );
}

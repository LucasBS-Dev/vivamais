import { useState, useEffect } from "react";
import { Redirect, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { ModuleStatus, PatientSummary } from "@viva/contracts";
import { useSession } from "../src/auth/session";
import {
  Brand,
  Button,
  ErrorMessage,
  Loading,
  Screen,
} from "../src/components/ui";
import { mainActions } from "../src/lib/modules";
import { styles as s } from "../src/theme/styles";

import { writeQueue, queueStorageDescription } from "../src/lib/write-queue";
export default function Home() {
  const { session, restoring, request, signOut } = useSession();
  const [pending, setPending] = useState(0);
  useEffect(() => {
    if (session)
      writeQueue
        .read(session.user.id)
        .then((items) => setPending(items.length))
        .catch(() => undefined);
  }, [session]);
  const [leaving, setLeaving] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const summary = useQuery({
    queryKey: ["patient-home", session?.user.id],
    enabled: session?.user.role === "PATIENT",
    queryFn: async () => {
      const [patient, modules] = await Promise.all([
        request<PatientSummary>("/patients/me"),
        request<ModuleStatus[]>("/system/modules"),
      ]);
      return { patient, modules };
    },
  });

  async function leave() {
    setLeaving(true);
    setLogoutError(null);
    try {
      await signOut();
    } catch {
      setLogoutError(
        "Não foi possível encerrar a sessão na API. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setLeaving(false);
    }
  }

  if (restoring)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (!session) return <Redirect href="/login" />;
  const isPatient = session.user.role === "PATIENT";
  return (
    <Screen>
      <Brand />
      <View style={s.section}>
        <Text style={s.eyebrow}>APLICATIVO DO PACIENTE</Text>
        <Text style={s.title} accessibilityRole="header">
          Olá, {session.user.displayName}.
        </Text>
        <Text style={s.body}>
          {isPatient
            ? "Vamos acompanhar seu cuidado, no seu tempo."
            : "Esta área é destinada a pacientes."}
        </Text>
      </View>
      {!isPatient ? (
        <View style={s.card}>
          <Text style={s.body}>
            Sua conta de profissional ou administrador deve acessar o portal
            profissional Viva+ pelo navegador.
          </Text>
        </View>
      ) : summary.isPending ? (
        <Loading label="Consultando sua identificação na API…" />
      ) : summary.isError ? (
        <View style={s.section}>
          <ErrorMessage
            message={
              summary.error instanceof Error
                ? summary.error.message
                : "Não foi possível consultar seus dados."
            }
          />
          <Text style={s.muted}>
            Conexão com a API não confirmada. Registros novos aguardam envio e
            verificação no servidor.
          </Text>
          <Button
            secondary
            label="Tentar novamente"
            onPress={() => {
              void summary.refetch();
            }}
            busy={summary.isFetching}
          />
          <Button
            secondary
            label="Registrar pressão na fila"
            onPress={() => router.push("/module/blood-pressure")}
          />
          <Button
            secondary
            label="Registrar atividade na fila"
            onPress={() => router.push("/module/activity")}
          />
        </View>
      ) : (
        <>
          <View style={s.accentCard}>
            <Text style={s.label}>✓ Conexão com a API confirmada</Text>
            <Text style={s.muted}>
              Última consulta:{" "}
              {new Date(summary.dataUpdatedAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo",
              })}{" "}
              (Brasília).
            </Text>
            <Text style={s.body}>
              Modalidade:{" "}
              {summary.data.patient.modality === "APP"
                ? "Aplicativo Viva+"
                : "Pulseira + diário impresso"}
            </Text>
            <Text style={s.small}>
              {pending} registros pendentes. {queueStorageDescription}
            </Text>
          </View>
          <View style={s.section}>
            <Text style={s.title} accessibilityRole="header">
              Como podemos ajudar?
            </Text>
            <Text style={s.muted}>Veja a disponibilidade de cada recurso.</Text>
          </View>
          <View style={s.grid}>
            {mainActions.map((action) => (
              <Pressable
                key={action.key}
                accessibilityRole="button"
                accessibilityLabel={`${action.title}. Abrir módulo.`}
                testID={`module-${action.key}`}
                onPress={() => router.push(`/module/${action.key}`)}
                style={({ pressed }) => [s.action, pressed && s.pressed]}
              >
                <Text style={s.actionIcon} accessible={false}>
                  {action.icon}
                </Text>
                <Text style={s.actionTitle}>{action.title}</Text>
                <Text style={s.muted}>{action.description}</Text>
              </Pressable>
            ))}
          </View>
          <Button
            secondary
            label="Meu Histórico"
            testID="history-button"
            onPress={() => router.push("/history")}
          />
          <Button
            secondary
            label="Meu Perfil"
            onPress={() => router.push("/profile")}
          />
          <Button
            secondary
            label="Atualizar conexão"
            onPress={() => {
              void summary.refetch();
            }}
            busy={summary.isFetching}
          />
        </>
      )}
      <View style={s.notice}>
        <Text style={s.small}>
          Demonstração com dados sintéticos. A API preserva a origem e os
          horários dos registros. Recursos clínicos personalizados aguardam
          revisão.
        </Text>
      </View>
      {pending > 0 && (
        <Text style={s.small}>
          Antes de sair: há {pending} registros pendentes.{" "}
          {queueStorageDescription}
        </Text>
      )}
      {logoutError && <ErrorMessage message={logoutError} />}
      <Button
        label="Sair da minha conta"
        testID="logout-button"
        secondary
        busy={leaving}
        onPress={() => {
          void leave();
        }}
      />
    </Screen>
  );
}

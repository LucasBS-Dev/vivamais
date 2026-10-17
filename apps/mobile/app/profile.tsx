import { useEffect, useState } from "react";
import { Redirect, router } from "expo-router";
import { Text, View } from "react-native";
import type { PatientSummary } from "@viva/contracts";
import { useSession } from "../src/auth/session";
import {
  Brand,
  Button,
  ErrorMessage,
  Loading,
  Screen,
} from "../src/components/ui";
import { styles as s } from "../src/theme/styles";
export default function Profile() {
  const { session, restoring, request } = useSession();
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [profile, setProfile] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (session?.user.role === "PATIENT")
      request<PatientSummary>("/patients/me")
        .then(async (p) => {
          setPatient(p);
          setProfile(await request(`/patients/${p.id}/activity-profile`));
        })
        .catch(() =>
          setError(
            "Não foi possível atualizar seu perfil. Verifique sua conexão.",
          ),
        );
  }, [session, request]);
  if (restoring)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (!session) return <Redirect href="/login" />;
  return (
    <Screen>
      <Brand />
      <Text style={s.title} accessibilityRole="header">
        Meu Perfil
      </Text>
      {error && <ErrorMessage message={error} />}
      <View style={s.card}>
        <Text style={s.title}>{session.user.displayName}</Text>
        <Text style={s.body}>{session.user.email}</Text>
        <Text style={s.body}>
          Modalidade:{" "}
          {patient
            ? patient.modality === "APP"
              ? "Aplicativo Viva+"
              : "Pulseira + diário"
            : "Não consultada"}
        </Text>
      </View>
      <View style={s.card}>
        <Text style={s.title}>Perfil informado pela equipe</Text>
        {profile ? (
          <>
            <Text style={s.body}>Mobilidade: {profile.mobility}</Text>
            <Text style={s.body}>Equilíbrio: {profile.balance}</Text>
            <Text style={s.body}>
              Restrições:{" "}
              {profile.restrictions || "Nenhuma informação registrada"}
            </Text>
            <Text style={s.body}>
              Orientações profissionais:{" "}
              {profile.professionalGuidance || "Nenhuma informação registrada"}
            </Text>
          </>
        ) : (
          <Text style={s.body}>
            Nenhum perfil funcional disponível nesta consulta.
          </Text>
        )}
        <Text style={s.small}>
          Peça à sua equipe para corrigir informações. Recomendações automáticas
          personalizadas aguardam aprovação clínica.
        </Text>
      </View>
      <Button
        label="Voltar ao início"
        onPress={() => router.dismissTo("/home")}
      />
    </Screen>
  );
}

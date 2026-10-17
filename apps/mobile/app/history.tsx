import { useState } from "react";
import { Redirect } from "expo-router";
import { useSession } from "../src/auth/session";
import { Button, Loading, Screen } from "../src/components/ui";
import { CareScreen } from "../src/components/care-screen";

export default function History() {
  const { session, restoring } = useSession();
  const [module, setModule] = useState("blood-pressure");
  if (restoring)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (!session) return <Redirect href="/login" />;
  if (session.user.role !== "PATIENT") return <Redirect href="/home" />;
  return (
    <CareScreen key={module} module={module} historyOnly>
      <Button
        secondary
        label="Histórico da pressão"
        onPress={() => setModule("blood-pressure")}
      />
      <Button
        secondary
        label="Histórico de atividades"
        onPress={() => setModule("activity")}
      />
      <Button
        secondary
        label="Histórico de medicamentos"
        onPress={() => setModule("medications")}
      />
      <Button
        secondary
        label="Histórico de refeições"
        onPress={() => setModule("food")}
      />
    </CareScreen>
  );
}

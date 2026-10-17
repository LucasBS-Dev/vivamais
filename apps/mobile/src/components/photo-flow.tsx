import { useEffect, useState } from "react";
import { Image, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSession } from "../auth/session";
import { apiBaseUrl } from "../lib/api";
import { Button, ErrorMessage } from "./ui";
import { styles as s } from "../theme/styles";
export type OcrResult = {
  id: string;
  status: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  message: string;
};
type Meal = {
  id: string;
  fileId: string;
  occurredAt: string;
  notes: string;
  assessment?: {
    trafficLight?: string;
    explanation: string;
    limitations: string;
  } | null;
};
function PrivateImage({ fileId }: { fileId: string }) {
  const { request } = useSession();
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    request<{ path: string }>(`/files/${fileId}/link`, {
      method: "POST",
      body: {},
    })
      .then((r) => {
        if (active) setUrl(new URL(r.path, apiBaseUrl).toString());
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [request, fileId]);
  return url ? (
    <Image
      source={{ uri: url }}
      style={{ width: "100%", height: 220, resizeMode: "contain" }}
      accessibilityLabel="Foto privada da refeição"
    />
  ) : (
    <Text style={s.small}>
      Foto privada indisponível ou link expirado. Atualize a lista.
    </Text>
  );
}
export function PhotoFlow({
  patientId,
  purpose,
  onOcr,
}: {
  patientId: string;
  purpose: "MEAL" | "PRESSURE_DISPLAY";
  onOcr?: (value: OcrResult) => void;
}) {
  const { session, request } = useSession();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [notes, setNotes] = useState(""),
    [meals, setMeals] = useState<Meal[]>([]),
    [page, setPage] = useState(0),
    [total, setTotal] = useState(0);
  async function load() {
    if (purpose === "MEAL" && patientId) {
      try {
        const result = await request<{ items: Meal[]; total: number }>(
          `/patients/${patientId}/meals?page=${page}&size=10`,
        );
        setMeals(result.items);
        setTotal(result.total);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Não foi possível carregar fotos.",
        );
      }
    }
  }
  useEffect(() => {
    void load();
  }, [patientId, page, purpose]);
  async function choose(camera: boolean) {
    setError("");
    try {
      if (camera) {
        const p = await ImagePicker.requestCameraPermissionsAsync();
        if (!p.granted) {
          setError(
            "A câmera não foi autorizada. Você pode selecionar uma foto ou digitar os valores.",
          );
          return;
        }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          });
      if (!result.canceled) {
        const selected = result.assets[0];
        if (selected && (selected.fileSize ?? 0) <= 2097152) setAsset(selected);
        else setError("Use uma imagem com até 2 MB.");
      }
    } catch {
      setError("Não foi possível abrir a câmera ou galeria neste ambiente.");
    }
  }
  async function send() {
    if (!asset || !session || !patientId) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("purpose", purpose);
      if (asset.file) form.append("file", asset.file);
      else
        form.append("file", {
          uri: asset.uri,
          name: asset.fileName || "foto.jpg",
          type: asset.mimeType || "image/jpeg",
        } as unknown as Blob);
      const response = await fetch(
        `${apiBaseUrl}/api/v1/patients/${patientId}/files`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body: form,
          signal: AbortSignal.timeout(20000),
          redirect: "error",
        },
      );
      if (!response.ok)
        throw new Error(
          response.status === 413
            ? "Use foto com até 2 MB."
            : response.status === 415
              ? "Use uma foto PNG ou JPEG válida."
              : "Não foi possível enviar a foto privada.",
        );
      const file = await response.json();
      if (purpose === "PRESSURE_DISPLAY") {
        const result = await request<OcrResult>(`/files/${file.id}/ocr`, {
          method: "POST",
          body: {},
        });
        setMessage(result.message);
        if (result.status === "RECOGNIZED" && onOcr) onOcr(result);
      } else {
        await request(`/patients/${patientId}/meals`, {
          method: "POST",
          body: {
            fileId: file.id,
            occurredAt: new Date().toISOString(),
            notes,
          },
        });
        setMessage(
          "Foto privada e refeição salvas. Análise automatizada indisponível até configuração e revisão clínica.",
        );
        setNotes("");
        await load();
      }
      setAsset(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Falha no envio. Mantenha conexão e tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={s.section}>
      <View style={s.card}>
        <Text style={s.title} accessibilityRole="header">
          {purpose === "MEAL" ? "Foto da refeição" : "Ler foto do visor"}
        </Text>
        <Text style={s.body}>
          Use apenas imagens sintéticas nesta demo. PNG ou JPEG, até 2 MB. Fotos
          exigem conexão e ficam privadas; não entram na fila offline.
        </Text>
        {purpose === "PRESSURE_DISPLAY" && (
          <Text style={s.body}>
            O celular não mede pressão. O OCR lê apenas o visor e os valores
            exigem confirmação antes de salvar.
          </Text>
        )}
        <Button
          secondary
          label="Tirar foto"
          onPress={() => {
            void choose(true);
          }}
        />
        <Button
          secondary
          label="Escolher foto da galeria"
          onPress={() => {
            void choose(false);
          }}
        />
        {asset && (
          <Image
            source={{ uri: asset.uri }}
            style={{ width: "100%", height: 220, resizeMode: "contain" }}
            accessibilityLabel="Foto selecionada para envio"
          />
        )}
        {purpose === "MEAL" && (
          <>
            <Text style={s.label}>Observação sobre a refeição</Text>
            <TextInput
              style={s.field}
              value={notes}
              onChangeText={setNotes}
              maxLength={2000}
              multiline
            />
          </>
        )}
        <Button
          label={
            purpose === "MEAL"
              ? "Enviar refeição e foto"
              : "Enviar foto para OCR"
          }
          busy={busy || !asset}
          onPress={() => {
            void send();
          }}
        />
        {message && (
          <Text accessibilityLiveRegion="polite" style={s.body}>
            {message}
          </Text>
        )}
        {error && <ErrorMessage message={error} />}
      </View>
      {purpose === "MEAL" && (
        <>
          <Text style={s.title} accessibilityRole="header">
            Minhas refeições
          </Text>
          <Text style={s.body}>
            A foto não permite medir sódio, gordura ou nutrientes. Leve os
            registros à sua equipe para conversar sobre alimentação.
          </Text>
          {meals.map((meal) => (
            <View style={s.card} key={meal.id}>
              <PrivateImage fileId={meal.fileId} />
              <Text style={s.body}>
                {new Date(meal.occurredAt).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </Text>
              <Text style={s.body}>{meal.notes}</Text>
              {meal.assessment ? (
                <>
                  <Text style={s.label}>
                    {meal.assessment.trafficLight === "GREEN"
                      ? "Verde · orientação educativa"
                      : meal.assessment.trafficLight === "YELLOW"
                        ? "Amarelo · pontos para conversar"
                        : meal.assessment.trafficLight === "RED"
                          ? "Vermelho · discutir com a equipe"
                          : "Avaliação incerta"}
                  </Text>
                  <Text style={s.body}>{meal.assessment.explanation}</Text>
                  <Text style={s.small}>{meal.assessment.limitations}</Text>
                </>
              ) : (
                <Text style={s.body}>Análise automatizada indisponível.</Text>
              )}
              <Button
                secondary
                label="Consultar análise educativa"
                onPress={() => {
                  request<{ message?: string }>(`/meals/${meal.id}/analyze`, {
                    method: "POST",
                    body: {},
                  })
                    .then((r) => {
                      setMessage(
                        r.message ||
                          "Avaliação educativa recebida. Confira as limitações.",
                      );
                      void load();
                    })
                    .catch(() =>
                      setError("Análise automatizada indisponível."),
                    );
                }}
              />
            </View>
          ))}
          {!meals.length && (
            <Text style={s.body}>Nenhuma refeição registrada.</Text>
          )}
          {page > 0 && (
            <Button
              secondary
              label="Fotos anteriores"
              onPress={() => setPage((p) => p - 1)}
            />
          )}{" "}
          {(page + 1) * 10 < total && (
            <Button
              secondary
              label="Próximas fotos"
              onPress={() => setPage((p) => p + 1)}
            />
          )}
          <Button
            secondary
            label="Atualizar refeições"
            onPress={() => {
              void load();
            }}
          />
        </>
      )}
    </View>
  );
}

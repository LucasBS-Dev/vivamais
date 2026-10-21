import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type {
  RespostaAcessoPaciente,
  TipoDispositivoPaciente,
} from "@viva/contracts";
import { api } from "../api";

const chave = "viva.dispositivo.paciente.v1";
export const tipoDispositivo: TipoDispositivoPaciente =
  Platform.OS === "web" ? "WEB" : "NATIVO";
export async function lerCredencialDispositivo(): Promise<string | undefined> {
  if (tipoDispositivo === "WEB") return undefined;
  const credencial = await SecureStore.getItemAsync(chave);
  return credencial && /^[A-Za-z0-9_-]{43}$/.test(credencial)
    ? credencial
    : undefined;
}
export async function protegerDispositivo(resposta: RespostaAcessoPaciente) {
  if (tipoDispositivo === "NATIVO" && resposta.credencialDispositivo) {
    await SecureStore.setItemAsync(chave, resposta.credencialDispositivo, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
}
export async function excluirDispositivoProtegido() {
  if (tipoDispositivo === "NATIVO") await SecureStore.deleteItemAsync(chave);
}
export async function renovarAcessoPaciente(): Promise<RespostaAcessoPaciente> {
  return api("/auth/paciente/renovar", {
    method: "POST",
    body: {
      tipo: tipoDispositivo,
      credencialDispositivo: await lerCredencialDispositivo(),
    },
  });
}

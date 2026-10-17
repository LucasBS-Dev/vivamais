import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  interpretarSessaoProtegida,
  type SessaoProtegida,
} from "./contratoSessao";

const chave = "viva.session.v1";

// Browser token is memory-only. Never use localStorage, sessionStorage or IndexedDB for authentication.
export async function lerSessaoProtegida(): Promise<SessaoProtegida | null> {
  if (Platform.OS === "web") return null;
  const valor = await SecureStore.getItemAsync(chave);
  const sessao = interpretarSessaoProtegida(valor);
  if (!sessao && valor) await SecureStore.deleteItemAsync(chave);
  return sessao;
}

export async function salvarSessaoProtegida(
  sessao: SessaoProtegida,
): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(
    chave,
    JSON.stringify({
      accessToken: sessao.accessToken,
      expiresAt: sessao.expiresAt,
      ...(sessao.user ? { user: sessao.user } : {}),
    }),
    {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    },
  );
}

export async function excluirSessaoProtegida(): Promise<void> {
  if (Platform.OS !== "web") await SecureStore.deleteItemAsync(chave);
}

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { parseStoredSession, type StoredSession } from "./session-codec";

const key = "viva.session.v1";

// Browser token is memory-only. Never use localStorage, sessionStorage or IndexedDB for authentication.
export async function readStoredSession(): Promise<StoredSession | null> {
  if (Platform.OS === "web") return null;
  const value = await SecureStore.getItemAsync(key);
  const session = parseStoredSession(value);
  if (!session && value) await SecureStore.deleteItemAsync(key);
  return session;
}

export async function writeStoredSession(
  session: StoredSession,
): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(
    key,
    JSON.stringify({
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      ...(session.user ? { user: session.user } : {}),
    }),
    {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    },
  );
}

export async function deleteStoredSession(): Promise<void> {
  if (Platform.OS !== "web") await SecureStore.deleteItemAsync(key);
}

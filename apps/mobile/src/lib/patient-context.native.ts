import * as SecureStore from "expo-secure-store";
const key = (owner: string) => `viva.patient.${owner}`;
export async function rememberPatient(owner: string, id: string) {
  await SecureStore.setItemAsync(key(owner), id, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}
export async function recalledPatient(owner: string) {
  return SecureStore.getItemAsync(key(owner));
}

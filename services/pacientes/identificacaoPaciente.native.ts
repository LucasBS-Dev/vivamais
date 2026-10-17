import * as SecureStore from "expo-secure-store";
const chave = (idTitular: string) => `viva.patient.${idTitular}`;
export async function memorizarPaciente(idTitular: string, id: string) {
  await SecureStore.setItemAsync(chave(idTitular), id, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}
export async function recuperarPaciente(idTitular: string) {
  return SecureStore.getItemAsync(chave(idTitular));
}

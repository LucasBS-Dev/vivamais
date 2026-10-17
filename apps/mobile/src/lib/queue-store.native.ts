import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import type { PendingOperation, QueueStore } from "./care-core";
let database: Promise<SQLite.SQLiteDatabase> | null = null;
async function open() {
  if (!database)
    database = (async () => {
      let key = await SecureStore.getItemAsync("viva.queue.key");
      if (!key) {
        key = Array.from(Crypto.getRandomBytes(32), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        await SecureStore.setItemAsync("viva.queue.key", key, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
      if (!/^[a-f0-9]{64}$/.test(key)) throw new Error("Chave local inválida.");
      const db = await SQLite.openDatabaseAsync("viva-queue.db");
      await db.execAsync(`PRAGMA key = "x'${key}'"`);
      const cipher = await db.getFirstAsync<Record<string, unknown>>(
        "PRAGMA cipher_version",
      );
      if (!cipher || !Object.values(cipher).some(Boolean)) {
        await db.closeAsync();
        throw new Error(
          "Este build não possui armazenamento criptografado. Use o build de desenvolvimento com SQLCipher.",
        );
      }
      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS pending_operation(id TEXT PRIMARY KEY,owner TEXT NOT NULL,payload TEXT NOT NULL)",
      );
      return db;
    })().catch((e) => {
      database = null;
      throw e;
    });
  return database;
}
export const queueStore: QueueStore = {
  async read(owner) {
    return (
      await (
        await open()
      ).getAllAsync<{ payload: string }>(
        "SELECT payload FROM pending_operation WHERE owner=?",
        owner,
      )
    ).map((x) => JSON.parse(x.payload) as PendingOperation);
  },
  async put(x) {
    await (
      await open()
    ).runAsync(
      "INSERT INTO pending_operation(id,owner,payload) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload WHERE pending_operation.owner=excluded.owner",
      x.id,
      x.owner,
      JSON.stringify(x),
    );
  },
  async remove(id) {
    await (
      await open()
    ).runAsync("DELETE FROM pending_operation WHERE id=?", id);
  },
};
export const queueStorageDescription =
  "Fila local criptografada neste aparelho. Registros pendentes ficam disponíveis para esta mesma conta após entrar novamente.";

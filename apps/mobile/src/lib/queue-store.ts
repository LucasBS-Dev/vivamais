import type { PendingOperation, QueueStore } from "./care-core";
const memory = new Map<string, PendingOperation>();
// Browser demo: explicit memory-only queue. Native build resolves queue-store.native.ts.
export const queueStore: QueueStore = {
  async read(owner) {
    return [...memory.values()].filter((x) => x.owner === owner);
  },
  async put(x) {
    memory.set(x.id, x);
  },
  async remove(id) {
    memory.delete(id);
  },
};
export const queueStorageDescription =
  "No navegador, a fila existe somente nesta aba. Não feche nem recarregue enquanto houver registros pendentes.";

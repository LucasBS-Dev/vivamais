export function parsePressure(systolic: string, diastolic: string) {
  const a = Number(systolic.trim().replace(",", ".")),
    b = Number(diastolic.trim().replace(",", "."));
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0)
    throw new Error("Informe os dois números da pressão.");
  const converted = a < 30 && b < 30;
  const sys = converted ? a * 10 : a,
    dia = converted ? b * 10 : b;
  if (
    !Number.isInteger(sys) ||
    !Number.isInteger(dia) ||
    sys > 400 ||
    dia > 400 ||
    (!converted && (a < 30 || b < 30))
  )
    throw new Error(
      "Formato ambíguo. Digite os valores em mmHg mostrados no aparelho.",
    );
  return { systolic: sys, diastolic: dia, converted };
}
export type PendingOperation = {
  id: string;
  owner: string;
  path: string;
  body: unknown;
  state: "PENDING" | "ERROR";
  attempts: number;
  nextAttemptAt: number;
  message?: string;
};
export interface QueueStore {
  read(owner: string): Promise<PendingOperation[]>;
  put(operation: PendingOperation): Promise<void>;
  remove(id: string): Promise<void>;
}
export function createSyncQueue(store: QueueStore, now = Date.now) {
  let inFlight: Promise<void> | null = null;
  return {
    enqueue: async (
      operation: Omit<PendingOperation, "state" | "attempts" | "nextAttemptAt">,
    ) => {
      const items = await store.read(operation.owner);
      if (items.length >= 100)
        throw new Error(
          "A fila local está cheia. Sincronize os registros antes de continuar.",
        );
      await store.put({
        ...operation,
        state: "PENDING",
        attempts: 0,
        nextAttemptAt: 0,
      });
    },
    sync(
      owner: string,
      send: (path: string, body: unknown) => Promise<unknown>,
    ) {
      if (inFlight) return inFlight;
      inFlight = (async () => {
        for (const item of await store.read(owner)) {
          if (item.nextAttemptAt > now()) continue;
          try {
            await send(item.path, item.body);
            await store.remove(item.id);
          } catch (e) {
            const status =
              typeof e === "object" && e && "status" in e
                ? Number(e.status)
                : 0;
            const permanent =
              status >= 400 && status < 500 && status !== 408 && status !== 429;
            await store.put({
              ...item,
              state: "ERROR",
              attempts: item.attempts + 1,
              nextAttemptAt: permanent
                ? Number.MAX_SAFE_INTEGER
                : now() +
                  Math.min(300000, 1000 * 2 ** Math.min(item.attempts, 8)),
              message: permanent
                ? "O registro precisa ser revisado. Entre em contato com a equipe."
                : "Aguardando conexão. Tente sincronizar novamente.",
            });
            if (status === 401 || status === 403) break;
          }
        }
      })().finally(() => {
        inFlight = null;
      });
      return inFlight;
    },
    read: (owner: string) => store.read(owner),
    async retry(owner: string) {
      for (const item of await store.read(owner))
        await store.put({ ...item, nextAttemptAt: 0 });
    },
  };
}

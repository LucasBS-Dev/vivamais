export function interpretarPressao(sistolica: string, diastolica: string) {
  const a = Number(sistolica.trim().replace(",", ".")),
    b = Number(diastolica.trim().replace(",", "."));
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0)
    throw new Error("Informe os dois números da pressão.");
  const convertido = a < 30 && b < 30;
  const sistolicaEmMmhg = convertido ? a * 10 : a,
    diastolicaEmMmhg = convertido ? b * 10 : b;
  if (
    !Number.isInteger(sistolicaEmMmhg) ||
    !Number.isInteger(diastolicaEmMmhg) ||
    sistolicaEmMmhg > 400 ||
    diastolicaEmMmhg > 400 ||
    (!convertido && (a < 30 || b < 30))
  )
    throw new Error(
      "Formato ambíguo. Digite os valores em mmHg mostrados no aparelho.",
    );
  return {
    systolic: sistolicaEmMmhg,
    diastolic: diastolicaEmMmhg,
    converted: convertido,
  };
}
export type OperacaoPendente = {
  id: string;
  owner: string;
  path: string;
  body: unknown;
  state: "PENDING" | "ERROR";
  attempts: number;
  nextAttemptAt: number;
  message?: string;
};
export interface ArmazenamentoFila {
  read(idTitular: string): Promise<OperacaoPendente[]>;
  put(operacao: OperacaoPendente): Promise<void>;
  remove(id: string): Promise<void>;
}
export function criarFilaSincronizacao(
  store: ArmazenamentoFila,
  agora = Date.now,
) {
  let envioAtual: Promise<void> | null = null;
  return {
    enqueue: async (
      operacao: Omit<OperacaoPendente, "state" | "attempts" | "nextAttemptAt">,
    ) => {
      const itens = await store.read(operacao.owner);
      if (itens.length >= 100)
        throw new Error(
          "A fila local está cheia. Sincronize os registros antes de continuar.",
        );
      await store.put({
        ...operacao,
        state: "PENDING",
        attempts: 0,
        nextAttemptAt: 0,
      });
    },
    sync(
      idTitular: string,
      enviar: (caminho: string, corpo: unknown) => Promise<unknown>,
    ) {
      if (envioAtual) return envioAtual;
      envioAtual = (async () => {
        for (const item of await store.read(idTitular)) {
          if (item.nextAttemptAt > agora()) continue;
          try {
            await enviar(item.path, item.body);
            await store.remove(item.id);
          } catch (e) {
            const estadoResposta =
              typeof e === "object" && e && "status" in e
                ? Number(e.status)
                : 0;
            const definitivo =
              estadoResposta >= 400 &&
              estadoResposta < 500 &&
              estadoResposta !== 408 &&
              estadoResposta !== 429;
            await store.put({
              ...item,
              state: "ERROR",
              attempts: item.attempts + 1,
              nextAttemptAt: definitivo
                ? Number.MAX_SAFE_INTEGER
                : agora() +
                  Math.min(300000, 1000 * 2 ** Math.min(item.attempts, 8)),
              message: definitivo
                ? "O registro precisa ser revisado. Entre em contato com a equipe."
                : "Aguardando conexão. Tente sincronizar novamente.",
            });
            if (estadoResposta === 401 || estadoResposta === 403) break;
          }
        }
      })().finally(() => {
        envioAtual = null;
      });
      return envioAtual;
    },
    read: (idTitular: string) => store.read(idTitular),
    async retry(idTitular: string) {
      for (const item of await store.read(idTitular))
        await store.put({ ...item, nextAttemptAt: 0 });
    },
  };
}

import type {
  OperacaoPendente,
  ArmazenamentoFila,
} from "./regrasSincronizacao";
const memoria = new Map<string, OperacaoPendente>();
// Browser demo: explicit memory-only queue. Native build resolves queue-store.native.ts.
export const armazenamentoFila: ArmazenamentoFila = {
  async read(idTitular) {
    return [...memoria.values()].filter((x) => x.owner === idTitular);
  },
  async put(x) {
    memoria.set(x.id, x);
  },
  async remove(id) {
    memoria.delete(id);
  },
};
export const descricaoArmazenamentoFila =
  "No navegador, a fila existe somente nesta aba. Não feche nem recarregue enquanto houver registros pendentes.";

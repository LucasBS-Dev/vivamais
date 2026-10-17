import { criarFilaSincronizacao } from "./regrasSincronizacao";
import { armazenamentoFila } from "./armazenamentoFila";
export { descricaoArmazenamentoFila as queueStorageDescription } from "./armazenamentoFila";
export const filaRegistros = criarFilaSincronizacao(armazenamentoFila);

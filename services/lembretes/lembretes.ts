import type { PlanoLembretes } from "./calculoLembretes";
export async function agendarLembretes(
  _owner: string,
  _plans: PlanoLembretes[],
  _ask: boolean,
) {
  return "Lembretes locais não são suportados neste navegador. Use um build Android/iOS e autorize as notificações.";
}
export async function cancelarLembretes(_owner: string) {}

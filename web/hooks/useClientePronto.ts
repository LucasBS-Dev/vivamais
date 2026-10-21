import { useEffect, useState } from "react";
/** Evita interação antes de os eventos do formulário/controle estarem conectados. */
export function useClientePronto() {
  const [pronto, definirPronto] = useState(false);
  useEffect(() => {
    definirPronto(true);
  }, []);
  return pronto;
}

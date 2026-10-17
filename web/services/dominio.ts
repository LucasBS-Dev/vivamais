export async function consultarDominio<T>(
  caminho: string,
  method = "GET",
  corpo?: unknown,
): Promise<T> {
  const resposta = await fetch(`/api/domain${caminho}`, {
    method,
    cache: "no-store",
    headers: corpo ? { "Content-Type": "application/json" } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (resposta.status === 204) return undefined as T;
  const resultado = await resposta.json();
  if (!resposta.ok)
    throw new Error(
      resultado.detail || "Não foi possível concluir a solicitação.",
    );
  return resultado as T;
}

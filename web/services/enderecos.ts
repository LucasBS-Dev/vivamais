export function enderecoAplicativo() {
  const endereco = process.env.NEXT_PUBLIC_APLICATIVO_URL;
  if (endereco) return endereco;
  const api = new URL(process.env.API_BASE_URL || "http://127.0.0.1:8080");
  return ["localhost", "127.0.0.1"].includes(api.hostname)
    ? "http://127.0.0.1:8081"
    : null;
}

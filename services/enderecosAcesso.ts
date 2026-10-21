export function enderecoPortal() {
  const configurado = process.env.EXPO_PUBLIC_PORTAL_URL;
  if (configurado) return configurado;
  const api = new URL(
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080",
  );
  if (["localhost", "127.0.0.1"].includes(api.hostname))
    return "http://127.0.0.1:3000";
  return null;
}

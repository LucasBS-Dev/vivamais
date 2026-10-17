import type { ExpoConfig } from "expo/config";

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
const appEnvironment = process.env.APP_ENV ?? "development";

// Expo evaluates this config in Node without recursively transpiling TypeScript imports.
function isLocalHostname(hostname: string): boolean {
  const host = hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "::1" ||
    host === "::"
  )
    return true;
  if (
    host.includes(":") &&
    (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:"))
  )
    return true;
  const parts = host.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  )
    return false;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b !== undefined && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

const apiUrl = new URL(apiBaseUrl);
if (
  apiUrl.username ||
  apiUrl.password ||
  apiUrl.search ||
  apiUrl.hash ||
  !["https:", "http:"].includes(apiUrl.protocol)
) {
  throw new Error(
    "Defina um endereço de API sem credenciais, consulta ou fragmento.",
  );
}
if (appEnvironment !== "development" && apiUrl.protocol !== "https:") {
  throw new Error(
    "Defina EXPO_PUBLIC_API_BASE_URL com HTTPS para preview/produção.",
  );
}
if (appEnvironment !== "development" && isLocalHostname(apiUrl.hostname)) {
  throw new Error(
    "Preview/produção exigem uma API pública, fora da rede local.",
  );
}

const config: ExpoConfig = {
  name: "Viva+",
  slug: "viva-mais",
  scheme: "vivamais",
  version: "0.1.0",
  orientation: "default",
  userInterfaceStyle: "light",
  // Provisórios: substituir pelos identificadores da instituição antes do primeiro build de loja.
  ios: {
    bundleIdentifier: "org.vivamais.academicdemo",
    supportsTablet: true,
    ...(appEnvironment === "development"
      ? {
          infoPlist: {
            NSAppTransportSecurity: { NSAllowsArbitraryLoads: true },
          },
        }
      : {}),
  },
  android: { package: "org.vivamais.academicdemo" },
  web: {
    bundler: "metro",
    output: "single",
    name: "Viva+ — paciente",
    lang: "pt-BR",
  },
  plugins: [
    "expo-router",
    ["expo-sqlite", { useSQLCipher: true }],
    ["expo-notifications", { defaultChannel: "medication-reminders" }],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Selecione uma foto sintética para registrar a refeição ou o visor do aparelho.",
        cameraPermission:
          "Fotografe o visor de um aparelho ou uma refeição sintética.",
        microphonePermission: false,
      },
    ],
    ["expo-secure-store", { configureAndroidBackup: true }],
    [
      "expo-build-properties",
      { android: { usesCleartextTraffic: appEnvironment === "development" } },
    ],
  ],
  experiments: { typedRoutes: false },
  extra: { appEnvironment },
};

export default config;

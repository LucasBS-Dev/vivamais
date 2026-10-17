import Constants from "expo-constants";
import { createTransport, resolveApiBaseUrl } from "./api-core";

const development =
  Constants.expoConfig?.extra?.appEnvironment === "development";
export const apiBaseUrl = resolveApiBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080",
  development,
);
export const api = createTransport(apiBaseUrl);

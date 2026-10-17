import Constants from "expo-constants";
import { criarTransporte, resolverEnderecoApi } from "./transporteApi";

const desenvolvimento =
  Constants.expoConfig?.extra?.appEnvironment === "development";
export const enderecoApi = resolverEnderecoApi(
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080",
  desenvolvimento,
);
export const api = criarTransporte(enderecoApi);

import Constants from "expo-constants";

// O modo é definido no build, nunca pela presença de uma conta ou por dados clínicos.
export const ambienteDesenvolvimento =
  Constants.expoConfig?.extra?.appEnvironment === "development";

export const ambienteDemonstracao = ["development", "test", "preview"].includes(
  Constants.expoConfig?.extra?.appEnvironment ?? "development",
);

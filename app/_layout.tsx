import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProvedorAutenticacao } from "../contexts/ContextoAutenticacao";
import { ProvedorAtividade } from "../contexts/ContextoAtividade";

export default function LayoutPrincipal() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, staleTime: 0, gcTime: 0 } },
      }),
  );
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <ProvedorAutenticacao>
          <ProvedorAtividade>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#f3f7f8" },
              }}
            />
          </ProvedorAtividade>
        </ProvedorAutenticacao>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

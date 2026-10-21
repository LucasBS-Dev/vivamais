import { Redirect, Stack } from "expo-router";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { Tela, Carregando } from "./ElementosInterface";
/** Aguarda a restauração protegida antes de decidir sobre uma rota interna. */
export function LayoutProtegido() {
  const { sessao, restaurando } = useAutenticacao();
  if (restaurando)
    return (
      <Tela>
        <Carregando rotulo="Verificando sua sessão…" />
      </Tela>
    );
  if (!sessao) return <Redirect href="/acesso" />;
  if (sessao.usuario.papel !== "PATIENT") return <Redirect href="/inicio" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

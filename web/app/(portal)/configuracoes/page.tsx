import Link from "next/link";
import { buscarSessao, requisicaoAutenticada } from "@/services/api";
export default async function Configuracoes() {
  const [{ user: usuario }, unidade] = await Promise.all([
    buscarSessao(),
    requisicaoAutenticada<{ name: string }>("/organization"),
  ]);
  return (
    <>
      <div className="page-heading">
        <h1>Configurações</h1>
      </div>
      <section className="panel padded">
        <h2>Conta e unidade</h2>
        <p>
          {usuario.displayName} ·{" "}
          {usuario.role === "ADMIN"
            ? "Administração"
            : "Profissional autorizado"}
        </p>
        <p>{unidade.name}</p>
        <p>
          Vínculos são administrados na ficha de cada paciente. Recuperação de
          acesso exige reautenticação.
        </p>
        <Link className="button button-primary" href="/pacientes">
          Gerenciar pacientes e vínculos
        </Link>
      </section>
      <section className="panel padded spaced">
        <h2>Privacidade e suporte</h2>
        <Link href="/privacidade">Política de privacidade para revisão</Link>
        <br />
        <Link href="/suporte">Suporte</Link>
        <br />
        <Link href="/exclusao-de-conta">Solicitação de exclusão</Link>
      </section>
    </>
  );
}

import { MarcaViva } from "@/components/Icones";
import { FormularioAcesso } from "@/components/FormularioAcesso";
import { RodapePublico } from "@/components/RodapePublico";

const erros: Record<string, string> = {
  dados: "Confira seu e-mail e preencha a senha para continuar.",
  credenciais:
    "Não foi possível entrar com estas credenciais. Confira o e-mail e a senha.",
  perfil:
    "Esta plataforma é destinada à equipe profissional. Pacientes devem usar o aplicativo Viva+.",
  limite: "Muitas tentativas de acesso. Aguarde um pouco e tente novamente.",
  conexao:
    "Não foi possível conectar à API do projeto. Verifique a conexão e tente novamente.",
};

export default async function PaginaAcesso({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const busca = await searchParams;
  const erro = typeof busca.erro === "string" ? erros[busca.erro] : undefined;
  const mensagemSessao =
    busca.sessao === "expirada"
      ? "Sua sessão expirou. Entre novamente para continuar."
      : busca.sessao === "necessaria"
        ? "Entre para acessar a plataforma."
        : busca.perfil === "paciente"
          ? erros.perfil
          : undefined;
  return (
    <>
      <main id="conteudo" className="acesso-viva">
        <section className="apresentacao-acesso" aria-label="Sobre o Viva+">
          <MarcaViva />
          <p className="subtitulo-marca">Plataforma Profissional</p>
          <p className="chamada-acesso">
            Acompanhamento do cuidado
            <br />
            para uma vida mais saudável.
          </p>
          <img
            className="ilustracao-profissionais"
            src="/images/profissionais.png"
            alt="Ilustração de dois profissionais de saúde"
            width={414}
            height={296}
          />
        </section>
        <section className="formulario-acesso" aria-labelledby="titulo-acesso">
          <h1 id="titulo-acesso">Acesso do Profissional</h1>
          {erro && (
            <p role="alert" className="aviso-acesso">
              {erro}
            </p>
          )}
          {mensagemSessao && (
            <p role="status" className="aviso-acesso">
              {mensagemSessao}
            </p>
          )}
          {busca.saida === "confirmada" && (
            <p role="status" className="aviso-acesso">
              Sessão encerrada com segurança.
            </p>
          )}
          {busca.saida === "local" && (
            <p role="status" className="aviso-acesso">
              Sessão removida do navegador. A revogação remota aguarda
              confirmação da API.
            </p>
          )}
          <FormularioAcesso />
          <a className="recuperar-senha" href="/suporte">
            Esqueci minha senha
          </a>
          <p className="nota-demonstracao">
            Demonstração acadêmica · Use somente contas sintéticas.
          </p>
        </section>
      </main>
      <RodapePublico />
    </>
  );
}

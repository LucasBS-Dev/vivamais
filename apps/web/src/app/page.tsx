import { Brand, Icon } from "@/components/icons";
import { LoginForm } from "@/components/login-form";
import { PublicFooter } from "@/components/public-footer";

const errors: Record<string, string> = {
  dados: "Confira seu e-mail e preencha a senha para continuar.",
  credenciais:
    "Não foi possível entrar com estas credenciais. Confira o e-mail e a senha.",
  perfil:
    "Esta plataforma é destinada à equipe profissional. Pacientes devem usar o aplicativo Viva+.",
  limite: "Muitas tentativas de acesso. Aguarde um pouco e tente novamente.",
  conexao:
    "Não foi possível conectar à API do projeto. Verifique a conexão e tente novamente.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const error = typeof query.erro === "string" ? errors[query.erro] : undefined;
  const sessionMessage =
    query.sessao === "expirada"
      ? "Sua sessão expirou. Entre novamente para continuar."
      : query.sessao === "necessaria"
        ? "Entre para acessar a plataforma."
        : query.perfil === "paciente"
          ? errors.perfil
          : undefined;
  return (
    <>
      <main className="login-page" id="conteudo">
        <section className="login-story" aria-label="Sobre o projeto">
          <Brand inverse />
          <div className="story-content">
            <span className="eyebrow light">CUIDADO QUE CONECTA</span>
            <h1>
              Mais proximidade.
              <br />
              Mais cuidado.
              <br />
              <span>Mais vida.</span>
            </h1>
            <p>
              Um espaço para organizar o acompanhamento e apoiar o encontro
              entre pessoas e equipes de saúde.
            </p>
            <div className="story-points">
              <span>
                <Icon name="people" /> Cuidado centrado na pessoa
              </span>
              <span>
                <Icon name="shield" /> Acesso individual e autorizado
              </span>
              <span>
                <Icon name="phone" /> Aplicativo ou diário impresso
              </span>
            </div>
          </div>
          <div className="story-bottom">
            <span className="live-dot" /> Viva+ / Pulso em Dia
            <span className="story-line" />
          </div>
        </section>
        <section className="login-panel" aria-labelledby="login-heading">
          <div className="login-card">
            <span className="phase-pill">DEMONSTRAÇÃO ACADÊMICA · FASE 1</span>
            <h2 id="login-heading">Bem-vindo de volta</h2>
            <p className="lead">Entre na sua plataforma profissional.</p>
            {error && (
              <div role="alert" className="notice notice-error">
                {error}
              </div>
            )}
            {sessionMessage && (
              <div role="status" className="notice">
                {sessionMessage}
              </div>
            )}
            {query.saida === "confirmada" && (
              <div role="status" className="notice notice-success">
                Sessão encerrada com segurança.
              </div>
            )}
            {query.saida === "local" && (
              <div role="status" className="notice">
                A sessão foi removida deste navegador. A API não confirmou a
                revogação; a sessão remota permanece sujeita ao prazo de
                validade.
              </div>
            )}
            <LoginForm />
            <div className="demo-note">
              <strong>Ambiente de aprendizagem</strong>
              <p>
                Utilize somente contas e informações sintéticas. Os módulos
                clínicos serão entregues nas próximas fases.
              </p>
            </div>
            <p className="help-text">
              Precisa de acesso ou esqueceu a senha?{" "}
              <a href="/suporte">Veja como pedir suporte</a>.
            </p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}

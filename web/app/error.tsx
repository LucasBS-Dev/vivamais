"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="conteudo" className="standalone-state">
      <h1>Não foi possível carregar</h1>
      <p>
        A API pode estar indisponível ou sua conexão foi interrompida. Tente
        novamente.
      </p>
      <div className="state-actions">
        <button className="button button-primary" onClick={reset}>
          Tentar novamente
        </button>
        <a className="button button-secondary" href="/">
          Voltar ao acesso
        </a>
      </div>
    </main>
  );
}

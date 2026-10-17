# Portal profissional Viva+

Next.js App Router, TypeScript e Tailwind. Interface pt-BR com login, visão geral, busca na lista autorizada e ficha de identificação. Contagens, identidade, pacientes e estados dos módulos vêm da API Java; não há dados clínicos simulados pelo frontend. O cadastro e os módulos clínicos pertencem às próximas fases.

Os scripts usam o compilador Webpack suportado pelo Next.js 16. O Turbopack encontrou falha de comunicação com subprocesso PostCSS no ambiente Windows restrito desta entrega.

Da raiz do monorepo, após instalar as dependências:

```powershell
pnpm dev:web
pnpm --filter @viva/web typecheck
pnpm --filter @viva/web test
pnpm build:web
```

Abra `http://127.0.0.1:3000`. Use uma conta profissional criada pelo bootstrap local. A API precisa estar disponível para os fluxos autenticados. Rotas públicas e tela de acesso não dependem de resposta da API.

Variáveis de servidor em `.env.local` nesta pasta (ou no ambiente do provedor):

```dotenv
API_BASE_URL=http://127.0.0.1:8080
APP_ORIGIN=http://127.0.0.1:3000
```

No Vercel, configure a origem pública HTTPS exata e o endereço público HTTPS da API Railway. Essas variáveis não usam prefixo `NEXT_PUBLIC_`. Não inclua credenciais nem tokens no arquivo versionado. O modo `next start` ativa cookies Secure e deve ser usado em HTTPS; para desenvolvimento local HTTP, use `next dev`.

O servidor Next guarda a sessão em cookie HttpOnly, SameSite Strict, Secure no modo de produção. O token nunca é enviado a componentes de cliente nem armazenado em localStorage. Login e saída exigem Origin correspondente à origem pública. O login limita tamanho do corpo, valida formato e encaminha somente e-mail/senha para a API. Requisições têm timeout de 10 segundos, não são cacheadas e não seguem redirects da API. A revogação de sessão é feita pela API; se ela estiver indisponível na saída, a sessão local é removida e a interface avisa que a revogação remota não foi confirmada.

`Referrer-Policy: same-origin` preserva o Origin dos formulários enviados ao próprio portal e não envia Referer a sites externos. Não trocar por `no-referrer`: navegadores podem transformar o Origin de navegações POST em `null`, invalidando corretamente o controle CSRF. Esse comportamento é documentado no [efeito de Referrer-Policy sobre Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy#effect_on_the_origin_header).

A renderização é dinâmica e privada. A política de scripts usa nonce por requisição, seguindo a [documentação oficial de CSP do Next.js](https://nextjs.org/docs/app/guides/content-security-policy). `unsafe-eval` é habilitado somente no desenvolvimento. Metadados são genéricos, não incluem identificação do paciente e desabilitam indexação.

As páginas públicas `/privacidade`, `/suporte` e `/exclusao-de-conta` são rascunhos explícitos. O responsável institucional deve definir canais e procedimentos reais antes da publicação. Nenhum formulário simula envio de suporte ou exclusão.

Os testes Vitest verificam validação de login, preservação de senha, autorização de perfil, bloqueio de origens CSRF e controles acessíveis do formulário. A validação com leitores de tela e pessoas representativas ainda precisa ser realizada em dispositivos e navegadores reais.

Na raiz, `pnpm exec playwright test` verifica guardas de acesso, páginas públicas e CSRF no navegador. O fluxo autenticado exige a API real, bootstrap sintético e `E2E_PASSWORD` no ambiente; sem essa variável ele fica explicitamente ignorado. `E2E_PROFESSIONAL_EMAIL` permite escolher a conta fornecida pelo bootstrap. Não salve essas credenciais no repositório. Capturas de tela, vídeo e traces dos testes ficam desligados para não persistir credenciais ou dados da sessão.

# Viva+ e Pulso em Dia

Fundação de uma demonstração acadêmica com **dados exclusivamente sintéticos**. A especificação original e os anexos foram lidos integralmente. Esta entrega executa a Fase 0 e a fundação da Fase 1; cadastro clínico, medições, medicamentos, offline, fotos, alimentação, atividade, consultas e pulseira permanecem no backlog das fases seguintes. Não há diagnóstico nem prescrição por IA.

Web e aplicativo autenticam na mesma API Java e recuperam identidade, clínica, vínculos e escopo do PostgreSQL. O portal lista somente pacientes autorizados e exibe contagens persistidas. Fases futuras aparecem como indisponíveis, com motivo explícito. Não há API simulada no frontend.

## Estrutura e versões

`apps/web`: Next.js 16.4.2, React 19.2.3, TypeScript 5.9.3, Tailwind 4.1.14. `apps/mobile`: Expo SDK 57.0.21, React Native 0.86.3, Expo Router 57.0.28, TanStack Query, SecureStore. `services/api`: Java 21, Spring Boot 3.5.16, Spring Security/JDBC, Flyway, Maven Wrapper 3.9.11. PostgreSQL 17.9. Node 24 e pnpm 10.28.2. Versões exatas e dependências transitivas estão no pnpm-lock.yaml e pom.xml.

Documentos: [requisitos](docs/REQUISITOS.md), [MVP](docs/MVP.md), [decisões pendentes](docs/DECISOES_PENDENTES.md), [arquitetura](docs/architecture/ADR-001.md), [backlog](docs/BACKLOG.md), [custos](docs/CUSTOS.md) e [estado verificado](docs/STATUS.md). O DOCX e três anexos originais estão em docs/product.

Os pacotes locais usam cópias injetadas do pnpm para funcionar também em Windows com restrição de symlinks. `pnpm shared:sync` atualiza as cópias após editar contracts/design-tokens; o postinstall e a geração de contratos já executam essa sincronização.

## Iniciar localmente com Docker

Pré-requisitos: Node 24, pnpm 10.28.2 e Docker Compose v2. Java 21 também é necessário para executar Maven fora do container. Na raiz:

```powershell
Copy-Item .env.example .env
# Edite .env localmente: DATABASE_PASSWORD aleatória e DEMO_BOOTSTRAP_PASSWORD >=12 caracteres.
# Não envie esses valores ao chat nem ao Git.
npm exec --yes --package=pnpm@10.28.2 -- pnpm install --frozen-lockfile
$env:SPRING_PROFILES_ACTIVE='bootstrap'
docker compose up --build -d
```

O perfil bootstrap provisiona duas clínicas com contas e vínculos sintéticos. Após o primeiro início saudável, retire o perfil e a senha do ambiente do serviço:

```powershell
Remove-Item Env:SPRING_PROFILES_ACTIVE
# Remova DEMO_BOOTSTRAP_PASSWORD do .env, guardando a senha no seu gerenciador local.
docker compose up -d --force-recreate api
```

Não há senha padrão. Contas: `profissional.a@demo.vivamais.invalid` (portal), `paciente.a@demo.vivamais.invalid` (app), `admin.a@demo.vivamais.invalid`, mais equivalentes `.b`. A senha é a que você definiu localmente no bootstrap. Reexecutar bootstrap não redefine senhas existentes. Diário não exige conta de app. Health: http://127.0.0.1:8080/actuator/health. OpenAPI autenticado: `/v3/api-docs`; snapshot rastreável em services/api/openapi.json.

Em outro terminal, iniciar o portal:

```powershell
$env:API_BASE_URL='http://127.0.0.1:8080'
$env:APP_ORIGIN='http://127.0.0.1:3000'
npm exec --yes --package=pnpm@10.28.2 -- pnpm dev:web
```

Abra http://127.0.0.1:3000. Alternativamente copie os valores públicos/server adequados para apps/web/.env.local. O BFF usa cookie HttpOnly, e o token não fica no localStorage. Não acessar uma origem diferente da APP_ORIGIN configurada.

## Executar API com Java instalado

Suba somente o banco: `docker compose up -d postgres`. Garanta JAVA_HOME apontando para JDK 21 e bin no PATH; não basta JRE 8. O Spring não carrega .env automaticamente:

```powershell
. .\infra\load-env.ps1
$env:SPRING_PROFILES_ACTIVE='bootstrap' # somente no primeiro provisionamento explícito
.\services\api\mvnw.cmd -f services/api/pom.xml spring-boot:run
```

Linux/macOS: exportar variáveis pelo ambiente seguro e executar `bash services/api/mvnw -f services/api/pom.xml spring-boot:run`. Após provisionar, reinicie sem bootstrap. Porta padrão8080; DATABASE_URL é JDBC, não URL do SDK Supabase.

## Aplicativo

```powershell
$env:EXPO_PUBLIC_API_BASE_URL='http://127.0.0.1:8080'
npm exec --yes --package=pnpm@10.28.2 -- pnpm --filter @viva/mobile web
# Ou pnpm dev:mobile para Metro e desenvolvimento Android/iOS.
```

Emulador Android usa `http://10.0.2.2:8080`. Aparelho físico usa endereço LAN do computador, rede/firewall compatíveis e uma API acessível: a porta do Compose padrão está restrita a loopback. Para esse ensaio, execute Java no host ou use override explícito de bind local; não exponha banco. Builds preview/production exigem API pública HTTPS. Sessão nativa usa SecureStore; no navegador, somente memória. [Detalhes mobile e EAS](apps/mobile/README.md). Android/iOS assinados e submissão ainda não foram executados.

## Verificação

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build:web
pnpm --filter @viva/mobile export:web
pnpm contracts:generate
.\services\api\mvnw.cmd -f services/api/pom.xml --batch-mode --no-transfer-progress verify
```

`verify` usa PostgreSQL real por Testcontainers/Docker. Sem Docker, configurar TEST_DATABASE_URL, TEST_DATABASE_USER e TEST_DATABASE_PASSWORD para banco **exclusivo de teste**; o teste cria schema UUID isolado e remove ao terminar. E2E no navegador: API provisionada/saudável, `E2E_PASSWORD` no ambiente, `pnpm --filter @viva/mobile export:web`, `pnpm exec playwright install chromium` e `pnpm test:e2e`. Playwright inicia o portal e o preview Expo em 3000/8081 e verifica ambos contra a API real. A suíte não grava screenshots/traces com credenciais. Testes nativos Maestro estão em apps/mobile/.maestro e exigem build/dispositivo.

CI GitHub Actions inclui typecheck, ESLint, testes, builds, contratos, integração PostgreSQL, Playwright, auditoria de dependências e secret scan. A existência do workflow não comprova execução no GitHub; evidência local e eventuais bloqueios estão em STATUS.md. Alertas de dependências sem correção não são suprimidos para tornar a CI verde.

## Hospedagem e continuidade

Vercel Hobby + Railway Hobby + Supabase Free + EAS, conforme [plano original](docs/operations/HOSPEDAGEM_DEMO.md) e [runbook de deploy](docs/operations/DEPLOY.md). Reservar preliminarmente US$10–25/mês para demo pequena e verificar consumo real. Supabase gratuito pode pausar por inatividade: checar/restaurar antes de avaliações. Nenhuma conta paga, publicação, hardware ou integração IA foi ativada.

Próxima entrega: Fase 2, cadastro/ativação e pressão manual ponta a ponta com histórico e testes de autorização. Recuperação, conteúdo clínico, retenção/bases legais, hardware e publicação dependem das decisões listadas; não impedem desenvolver a fundação sintética autorizada.

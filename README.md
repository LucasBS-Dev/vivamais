# Viva+ / Pulso em Dia

Demonstração acadêmica com Java 21/Spring Boot, PostgreSQL, Next.js e React Native/Expo. Usa exclusivamente pessoas, imagens e registros sintéticos. O projeto está em refatoração de estrutura, nomenclatura e fidelidade aos 36 protótipos; não está concluído nem liberado para pacientes reais ou lojas.

O cadastro profissional, ativação do paciente, pressão com confirmação, medicamentos/autorrelatos, diário, atividades, consultas e fotos usam a API e o PostgreSQL. OCR utiliza Tesseract real; não salva valores sem conferência. Alimentação sem serviço/critérios aprovados informa indisponibilidade. Pulseira real, recomendações personalizadas e publicação dependem das pendências documentadas.

## Organização atual

- `app/`, `components/`, `contexts/`, `hooks/`, `services/`, `assets/images/`: aplicativo Expo na raiz, como a referência AgendAqui.
- `web/app/`, `web/components/`, `web/hooks/`, `web/services/`: Next.js profissional, independente das rotas Expo.
- `backend/demo/`: Maven/Java em `com.vivamais`, com config, controller, dto, model, repositories, security e service.
- `packages/`: contratos OpenAPI gerados e tokens compartilhados.
- `referencias_codex/`: materiais de referência; excluídos do EAS e dos recursos publicados.

Rotas do app: `/acesso`, `/inicio`, `/perfil`, `/historico`, `/pressao`, `/medicamentos`, `/alimentacao`, `/atividade-fisica`. Rotas antigas redirecionam por compatibilidade. Migrations aplicadas não são reescritas. Campos JSON/SQL existentes e valores de enum persistidos conservam o contrato anterior; mapeadores e aliases mantêm compatibilidade com o domínio em português.

## Instalar e iniciar

Pré-requisitos: Node 24, pnpm 10.28.2, Java 21 e PostgreSQL 17 (ou Docker Compose). Dependências exatas no lockfile e pom.xml.

```powershell
npm exec --yes --package=pnpm@10.28.2 -- pnpm install --frozen-lockfile
Copy-Item .env.example .env
# Defina DATABASE_PASSWORD aleatória e, no primeiro bootstrap, DEMO_BOOTSTRAP_PASSWORD >=12 caracteres.
# Não envie senhas ao chat/Git. Maven não lê .env sozinho.
docker compose up --build -d
```

O Compose sobe PostgreSQL/API em loopback e preserva banco e arquivos privados em volumes. Para provisionar as contas sintéticas, ative `SPRING_PROFILES_ACTIVE=bootstrap` e forneça a senha de bootstrap. Depois do primeiro início saudável, retire perfil e senha e recrie apenas o serviço API, preservando volumes. Reexecutar o seed não redefine senhas existentes.

Alternativa com Java no host e PostgreSQL já iniciado:

```powershell
. .\infra\load-env.ps1
$env:FILES_DIRECTORY = Join-Path (Get-Location) '.local\private-files'
# JAVA_HOME deve apontar ao JDK 21. Configure DATABASE_URL JDBC, DATABASE_USER e DATABASE_PASSWORD.
.\backend\demo\mvnw.cmd -f backend/demo/pom.xml spring-boot:run
```

Para OCR local, instalar Tesseract com modelo inglês e configurar TESSERACT_COMMAND. Alternativamente, `OCR_NODE_SCRIPT` pode apontar ao caminho absoluto de `infra/ocr-worker.mjs`, com `OCR_DATA_DIRECTORY` e `OCR_CACHE_DIRECTORY`. Não confundir reconhecimento com medição de pressão. O Dockerfile prepara o executável/modelo; build Docker ainda precisa de verificação em ambiente com Docker.

Em outro terminal:

```powershell
$env:API_BASE_URL='http://127.0.0.1:8080'
$env:APP_ORIGIN='http://127.0.0.1:3000'
npm exec --yes --package=pnpm@10.28.2 -- pnpm dev:web
```

Portal: http://127.0.0.1:3000. Use `profissional.a@demo.vivamais.invalid` ou `admin.a@demo.vivamais.invalid`, com sua senha local de bootstrap. Paciente: `paciente.a@demo.vivamais.invalid`; existem equivalentes `.b` para verificar isolamento. Nenhuma senha padrão é distribuída. Para novos pacientes, o profissional gera código de uso único e o paciente define a senha no app.

```powershell
$env:EXPO_PUBLIC_API_BASE_URL='http://127.0.0.1:8080'
npm exec --yes --package=pnpm@10.28.2 -- pnpm dev:mobile
# Prévia verificável no navegador:
npm exec --yes --package=pnpm@10.28.2 -- pnpm export:mobile
node infra/serve-mobile-preview.mjs
```

Preview Expo exportado: http://127.0.0.1:8081. Emulador Android usa 10.0.2.2 para o host. Dispositivo físico exige endereço LAN/API acessível e permissões. Preview/production EAS exige API pública HTTPS. Fila nativa usa SQLCipher e SecureStore, requer build com os plugins; Expo Go não comprova essa capacidade. No navegador, sessão e fila são somente em memória; não recarregar/fechar com registros pendentes. Notificações reais exigem Android/iOS e permissão do SO, com teste físico ainda pendente.

## Verificar

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build:web
pnpm export:mobile
pnpm contracts:generate
.\backend\demo\mvnw.cmd -f backend/demo/pom.xml verify
```

Java usa PostgreSQL real via Testcontainers ou TEST_DATABASE_URL/USER/PASSWORD para banco exclusivo de testes e schema UUID isolado. Configure TEST_OCR_NODE_SCRIPT (ou TEST_NATIVE_OCR=true com Tesseract instalado) para executar o teste OCR real. E2E: API provisionada, export Expo, Chromium Playwright instalado e E2E_PASSWORD no ambiente; execute `pnpm test:e2e`. Algumas expectativas dos testes anteriores estão sendo atualizadas para as novas rotas/layouts; consulte os resultados efetivos em STATUS.md. Nunca tratar apenas compilação como teste de aparelho.

Capturas reais: `node infra/capturar-telas.mjs`, com a credencial de teste no ambiente. As imagens em docs/evidencias/visual são capturas do navegador; a matriz em docs/FIDELIDADE_VISUAL.md distingue comparação realizada e pendente.

## Hospedagem e continuidade

Mantidos Vercel Hobby, Railway Hobby, Supabase Free e EAS, conforme docs/operations/HOSPEDAGEM_DEMO.md. Nenhuma conta, gasto ou publicação externa foi feita. Banco e storage são acessados pelo backend; não fornecer chave de serviço aos clientes. Antes de publicar, revisar custos atuais, limites, TLS, segredos, permissões, conteúdo clínico, privacidade, lojas e testes físicos.

Leia PROGRESSO.md, docs/STATUS.md, docs/PROXIMA_EXECUCAO.md, docs/REFATORACAO_VISUAL_E_ESTRUTURAL.md e docs/FIDELIDADE_VISUAL.md para continuar sem recomeçar. O checkpoint anterior à reorganização é 99c7295.

# Estado da entrega em 16 de outubro de 2026

Somente Fase 0 e fundação da Fase 1 autorizadas nesta iteração. Código em apps/web, apps/mobile, services/api e packages; documentos originais preservados. Nenhum recurso pago/externo, publicação em lojas ou hardware real criado.

| Item | Estado | Evidência ou pendência |
|---|---|---|
| Fase 0 descoberta e decisões | DONE | DOCX inteiro, 13 seções e 3 anexos; requisitos, MVP, ADR, backlog, decisões e custos |
| Fundação executável F1 | DONE | Java 21 + PostgreSQL 17.9 real, web e Expo conectados à API; sem mocks de domínio |
| Autenticação e isolamento | DONE | Senha BCrypt 12, sessão opaca/hash, revogação/expiração, clínica/vínculo e auditoria |
| Migrations/contratos | DONE | V1 aplicada em banco vazio e schemas de testes; OpenAPI obtido por endpoint autenticado; TS gerado |
| CI/configuração da hospedagem | IN_PROGRESS | Workflows e configs preparados; não executados em GitHub/Vercel/Railway/Supabase/EAS |
| Segurança de dependências | BLOCKED | Sem críticos após atualização; 2 altos e 2 moderados transitivos, auditoria exit 1; ver DEPENDENCIAS_SEGURANCA |
| F2 pressão ponta a ponta e cadastro | NOT_STARTED | Próxima prioridade; UI não oferece fluxo fictício |
| F3 medicamentos/diário | NOT_STARTED | Inclui vigência, autorrelato e notificações locais futuras |
| F4 offline/OCR/fotos privadas | NOT_STARTED | Fila, retry e armazenamento/OCR ainda indisponíveis |
| F5 alimentação/atividade | BLOCKED | Conteúdo e critérios dependem validação clínica, além da implementação futura |
| F6 consultas/pulseira | NOT_STARTED | Integração real BLOCKED por especificação hardware; simulador futuro será identificado |
| F7 operação e lojas | NOT_STARTED | Contas, links finais, privacidade, build nativo, restore e revisão pendentes |
| Dados reais e recomendação clínica personalizada | BLOCKED | Revisões institucional, clínica, jurídica e de privacidade |

## Verificações executadas

- `pnpm install`: concluído com pnpm 10.28.2. Windows sandbox inicialmente negou symlinks; pacotes locais usam injeção/cópia com dedupeInjectedDeps=false e sync-shared, sem exigir mudança de privilégio do usuário. Resolução do lockfile também executada.
- `pnpm typecheck`: quatro projetos TypeScript passaram. Após gerar tipos OpenAPI, tsc foi repetido nos consumidores afetados e passou.
- `pnpm lint`: ESLint passou. Uma instalação interrompida deixou balanced-match de major incorreta em node_modules; a cópia local esperada foi restaurada sem alterar fonte/lockfile. Não confundir isso com vulnerabilidade corrigida.
- Web: Vitest 4.1.11, **19 testes em 4 arquivos passaram**. Mobile: Vitest 4.1.11, **9 testes em 2 arquivos passaram**. O comando geral `pnpm test` também passou. Pool threads evita rename de arquivo temporário proibido nesta sandbox.
- Backend: Maven Wrapper/Java 21, `verify` com **5 unitários + 10 de integração PostgreSQL reais passaram**, sem falhas, erros ou skips. Usa banco externo exclusivo de testes na porta 55432, role viva, schema UUID isolado; Testcontainers/Docker não foi executado.
- Next: build de produção com `next build --webpack` passou. Turbopack encontrou falha de IPC/PostCSS neste ambiente; foi adotado Webpack suportado, sem substituir Next.
- Expo: export web final passou, 839 módulos, bundle aproximado de 1,2 MB e idioma pt-BR. Nenhum build Android/iOS assinado nem Maestro/dispositivo físico executado.
- Playwright Chromium: **4 E2E profissionais passaram**, com API Java/PostgreSQL reais: acesso anônimo, rotas públicas, CSRF e login → painel → lista → ficha → logoff. Teste real encontrou Origin=null em formulário devido a Referrer-Policy=no-referrer; corrigido para same-origin, mantendo rejeição CSRF.
- Dois testes adicionais do Expo web passaram: servidor estático seguro e paciente com a API real, incluindo login, identidade, quatro ações, módulo planejado, logout 204 e token revogado retornando 401. **A execução final conjunta teve 6 E2E aprovados em 11,0 s, sem skips.** Isso não representa teste Android/iOS nativo.
- `node infra/check-demo.mjs http://127.0.0.1:8080 http://127.0.0.1:3000`: health e 4 rotas web retornaram HTTP 200.
- Runtime API fora de bootstrap: health UP, login, contagens de 2 pacientes (1 app + 1 diário) e logout 204 verificados. Startup medido de 4,121 s com Java 21/Xmx384m em Windows local; isso não prevê RSS nem custo Railway. RSS/CPU faturados ainda não medidos.
- `pnpm audit --audit-level high`: **exit 1**, 0 críticos/2 altos/2 moderados. OWASP Java e gitleaks preparados, não executados; não declarar CI integralmente verde.

## Como repetir e continuar

Comandos exatos e env em README.md/.env.example e READMEs dos apps/API. Docker Compose preparado mas não executado, pois Docker não está instalado. As migrações foram verificadas em PostgreSQL 17.9 portátil real, acessível somente por loopback e com dados sintéticos. Banco portátil, logs, credenciais efêmeras e ferramentas usados nos ensaios ficam fora do pacote de fonte.

Antes de publicação: fornecer contas/segredos pelos painéis seguros dos fornecedores, escolher identificadores definitivos e contato institucional, revisar alertas transitivos, política, base legal, retenção e termos, testar backup/restauração e dispositivos. Suporte/exclusão públicos são rascunhos, ainda sem recebimento de pedidos reais. Nenhuma senha/token deve ser enviado no chat.

Próximo passo priorizado: Fase 2, ativação e cadastro autorizado → pressão manual → histórico/gráfico, persistidos na mesma API, com testes de acesso cruzado e auditoria. Os demais requisitos continuam no backlog.

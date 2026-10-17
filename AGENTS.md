# Viva+ instruções de continuidade

Leia README.md, PROGRESSO.md, docs/STATUS.md, docs/REQUISITOS.md e docs/architecture/ADR-001.md antes de alterar código. O usuário autorizou continuar as Fases 1 a 7 sem confirmação entre módulos. Preserve o código existente; não recrie a Fase 0. Registre cada módulo verificado e a próxima tarefa em PROGRESSO.md. Publicação, pagamentos e decisões clínicas/jurídicas indispensáveis continuam dependendo do usuário.

Atualização autorizada: ler PROMPT_CODEX_PADRONIZACAO_E_FIDELIDADE_VIVA_MAIS.md e referências AgendAqui/36 telas. Refatorar gradualmente para Expo na raiz, backend/demo em camadas e web/ Next independente. Nomes próprios em português brasileiro sem acentos nos identificadores. Preservar contratos/dados por compatibilidade e nunca alterar checksum de migrations aplicadas. Documentar exceções. Capturar screenshots reais e comparar cada referência em docs/FIDELIDADE_VISUAL.md; não declarar igualdade visual sem comprovação. Estado inicial em docs/REFATORACAO_VISUAL_E_ESTRUTURAL.md.

- Stack: pnpm workspaces; Next/TS em web; Expo/RN/TS na raiz; Java 21/Spring Boot/Maven Wrapper em backend/demo; PostgreSQL/Flyway. API é única autoridade clínica.
- UI e negócio pt-BR, instantes UTC e apresentação America/Sao_Paulo. Dados somente sintéticos. Nenhuma senha fixa, token, CPF ou foto em logs/Git.
- Sessões revogáveis; autorização por organização e vínculo, inclusive em novas rotas. Não expor tabelas diretamente ao cliente. Não usar localStorage para token.
- Cada nova tabela clínica precisa de RLS habilitada e privilégios de anon/authenticated/PUBLIC revogados na mesma migration. JDBC usa credencial privada de proprietário; a API aplica o escopo por recurso. Não abrir políticas diretas para clientes.
- Sem protocolo aprovado: BLOCKED_PENDING_CLINICAL_APPROVAL. Hardware não ensaiado: BLOCKED_PENDING_HARDWARE_SPEC. Não afirmar diagnóstico, ingestão, OCR confirmado ou sincronização real sem evidência.
- Comandos: pnpm install --frozen-lockfile; pnpm typecheck; pnpm test; pnpm build:web; backend/demo/mvnw verify. PostgreSQL via docker compose. Ver README para bootstrap explícito e env.
- Atualizar CHANGELOG.md, docs/STATUS.md e evidências reais após entrega. Sem publicação externa, serviços pagos ou envio às lojas automaticamente.

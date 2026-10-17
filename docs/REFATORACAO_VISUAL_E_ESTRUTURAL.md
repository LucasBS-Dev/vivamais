# Refatoração do Viva+ — estrutura, português e referências visuais

## Estado preservado antes da mudança

Inspeção em 16/10/2026: repositório Git existente, branch main, sem commits; código ainda não rastreado. Nenhum reset ou descarte. Referências recebidas extraídas com validação de caminho e sem sobrescrever arquivos. Prompt de padronização lido integralmente. ZIP AgendAqui inspecionado de fato, incluindo package.json, tsconfig, layout Expo, hook de autenticação, pom e controller. Seu H2, credenciais e CORS permissivo não serão copiados.

| Módulo | Estado verificável antes da refatoração |
|---|---|
| Login, organização e vínculos | API PostgreSQL, sessões revogáveis e portal funcionando; alterações administrativas mais recentes aguardam repetição dos testes |
| Cadastro e pressão | E2E portal passou; E2E Expo passou com ativação, registro, fila, reenvio idempotente e leitura no portal |
| Medicamentos | Plano da equipe e autorrelato no mesmo E2E; agendamento nativo implementado, teste físico pendente |
| Fotos e OCR | Tesseract real, revisão obrigatória e foto privada passaram em integração e no Expo web |
| Alimentação | Upload e autorização passaram; serviço externo de análise sem credencial/critérios aprovados |
| Atividade, diário e consultas | APIs e formulários implementados; integrações Java passaram; fluxo guiado de 12 telas ainda incompleto |
| Pulseira | Porta e simulador explícito; hardware real bloqueado por ausência de protocolo/aparelho |
| Operação/release | Configuração econômica preservada; nenhuma publicação externa; backup/restore em preparação |

Últimas evidências: Maven verify com 5 unitários + 16 integrações, zero falhas/erros/skips; 19 testes web e 13 mobile aprovados; typecheck atual passou. E2E amplo Expo/portal passou em 12,4 s (execução total). Export Expo passou (860 módulos). Isso não representa teste Android/iOS físico.

## Equivalência de organização

| Atual | Destino da refatoração |
|---|---|
| apps/mobile/app | app na raiz, rotas agrupadas por domínio |
| apps/mobile/src/components | components, com componentes em português |
| apps/mobile/src/auth | contexts e services/autenticacao; hook em hooks |
| apps/mobile/src/lib | services, por domínio |
| apps/mobile/src/theme | components/estilos e tokens compartilhados |
| services/api | backend/demo |
| br.edu.vivamais sem camadas | com.vivamais com config, controller, dto, repositories, security, service e model |
| apps/web/src | web/app, web/components, web/hooks e web/services |
| packages | Preservados como contratos gerados e tokens compartilhados; extensão necessária do exemplo |

Migrações V1–V4 e dados existentes são preservados. Contratos JSON/SQL antigos terão compatibilidade documentada; renomear um arquivo de migration já aplicado invalidaria seu checksum. Referências não entram em assets publicados, EAS ou imagem Java.

## Auditoria visual inicial

Três montagens abertas e inspecionadas. Login web, painel, cadastro e início mobile abertos também em recortes individuais. Diferenças atuais: composição genérica, cores dos cards ausentes, logo aproximado, telas mobile concentradas num componente e ausência da navegação guiada. A comparação e correções são registradas por tela em FIDELIDADE_VISUAL.md. Não há comprovação de identidade visual completa neste ponto.

As exceções obrigatórias são autenticação com senha/código, ausência de dados inventados, sem classificação clínica automática e sem simulação de hardware real. Campos pessoais adicionais da referência exigem necessidade e tratamento autorizado; nenhum CPF real será coletado nesta demo.

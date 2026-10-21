# Próxima execução — após cadastro/SMS/interface validado

Publicação confirmada em 2026-10-21T00:25:40.4871877-03:00, main, conteúdo 54c92a34bf0c5054a428e6d56277d2257124e30d. Componentes/manuais/privados conferidos no remoto; detalhes em RELATORIO_TRANSFERENCIA_E_PUBLICACAO. Git fonte publicado; implantação/lojas/produção e CI verde não presumidos.

## Histórico anterior à confirmação da publicação


## Consolidação e transferência técnica — 20/10/2026

Pedido atual autoriza commit/push de fonte em origin/main após segurança/integridade, sem deployment,visibilidade,force push ou reescrita. Criados manual técnico,inventário32grupos,rastreio,ambiente do zero,testes,banco/API,padrões/índice e plano canônico;40pendências ampliadas. Testes novos:74Java,69frontend,17E2E,tipagem/lint,Next/Expoall e contratos aprovados;2altos mantidos. Gitleaks/segredos e privilégios JDBC auditados; role local superusuária/BYPASSRLS registrada em P01/G01,sem alterar banco. Estado de commit/push/CI e provas em [RELATORIO_TRANSFERENCIA_E_PUBLICACAO](RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md). Exercícios/IA continuam com outro dev.

## Histórico anterior à consolidação

Ler [relatório final](evidencias/CORRECOES_CADASTRO_SMS_INTERFACE_2026-10-20.md), [guia SMS](CADASTRO_E_ATIVACAO_SMS.md), [40 pendências](LEVANTAMENTO_COMPLETO_PENDENCIAS.md) e [plano técnico](PLANO_IMPLEMENTACAO_PENDENCIAS.md). V9 aplicada, V1–V9 imutáveis; código não retorna na API profissional. Não refazer autenticação/layout, não voltar ao código manual exposto e não alterar funções delegadas de exercícios/IA.

74 Java/69 frontend/17 E2E, tipagem/lint, Next/Expo e preservação local aprovados. Iniciar com Iniciar-VivaMais.cmd -Producao -SmsLocal para o ensaio sem operadora; configuração normal sem flag mantém SMS desabilitado por padrão. Credenciais/caixa privadas nunca no chat/Git. Não limpar limites, dados, stage ou arquivos existentes para facilitar teste.

Próximas frentes gerais: P02/P21 (altos/CI/scanners), decisões institucionais P01/P06/P23–P25, aparelhos P07–P16 e hospedagem autorizada P17–P20. SMS real P03 e CPF oficial P04 dependem de habilitação/contrato/credenciais e autorização; não enviar mensagens reais implicitamente. Outro desenvolvedor recebe P27–P30 e contratos/matriz atualizados. Ver critérios concretos por ID antes de iniciar uma tarefa diferente. Sem commit/push/publicação sem autorização.

## Histórico de continuidade anterior à V9

# Prioridade vigente — acesso sem senha validado — 20/10/2026

Ler [o guia de acesso](ACESSO_PACIENTE_SEM_SENHA.md) e [evidências](evidencias/ACESSO_PACIENTE_2026-10-20.md). Não reimplementar login por senha de paciente nem /auth/activate. V1–V8 aplicadas são imutáveis. Contas/dados preservados; complementar CPF/nascimento pelo profissional, código de quatro números com conferência de identidade e reautenticação, sem fallback por dados pessoais.

48 Java, 58 frontend e 14 E2E finais passaram; Next/Expo e backup/restore V8 também. Próximas pendências gerais: ensaios físicos de SecureStore/câmera/leitores, política institucional de identidade/retenção, dois altos/CI e implantação HTTPS/proxy quando autorizada. CPF/nascimento ambíguos entre unidades permanecem sem seleção automática. Credencial HMAC precisa ser estável/privada; não reiniciar chaves ou limites para facilitar testes.

Exercícios e IA continuam com o outro desenvolvedor, coordenando contratos e a próxima numeração Flyway. Conferir saúde dos serviços e git status; não descartar arquivos/stage, criar repositório, publicar ou executar commit/push sem autorização. O histórico abaixo descreve etapas anteriores e não substitui esta prioridade.

## Histórico de continuidade

# Prioridade vigente — transferência de 20/10/2026

O usuário reservou desenvolvimento específico de exercícios e IA ao outro desenvolvedor. Não avançar novos exercícios, prescrição, vídeos, modelos, prompts clínicos ou fornecedores nesta frente Codex. Preservar código/testes/contratos e usar os quatro manuais de transferência. A etapa de capturas/documentação está fechada: ver evidencias/RETOMADA_E_TRANSFERENCIA_2026-10-20.md. Próximos ajustes Codex são gerais, respeitando a matriz; outro dev começa pelo MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md.

# Continuidade — profissionalização (20/10/2026)

Leia AGENTS, README, PROGRESSO, STATUS e [relatório atual](evidencias/PROFISSIONALIZACAO_VIVAMAIS_2026-10-20.md). Não reimplementar fundação, cadastro, Home, semana, períodos, execução local, autoria/totais ou preferências já entregues. Não descartar alterações, fazer stage/commit/push ou publicar sem autorização.

## Estado preservado

- Expo na raiz; web/ Next independente; backend/demo Java 21/Spring Boot/JDBC/PostgreSQL. Nenhuma estrutura apps/mobile/apps/web/services/api recriada. Git base b460643, stage vazio, alterações anteriores preservadas.
- Cluster17.9/55432/viva/vivamais, SCRAM. Senhas privadas distintas em ../../work/postgres-local-credentials.json e demo-credentials.json, nunca imprimir. JDK 21 local é selecionado pelos scripts porque PATH encontra Java 8. pnpm 10.28.2 fixado; não usar pnpm 11 ou npm install no monorepo.
- V7 aditiva aplicada para preferências por conta, RLS e versão concorrente. V1–V6 intactas nesta etapa; agora preservar V1–V7. GET/PUT /conta/preferencias não aceitam outra identidade. App e portal persistem texto ampliado; portal 10/20/50 nas tabelas da ficha. Nenhum token/dado clínico em localStorage.
- Autoria nominativa, ordenação por ocorrência e totais completos de refeições/atividades implementados. Resumo detalhado continua seleção recente; gráfico/tabelas declaram paginação, sem inferir diagnóstico/ingestão.
- Linguagem revista e aviso sintético concentrado no ambiente local. Contas/dados de testes continuam identificados, não reais. Suporte/privacidade/exclusão honestos sobre revisões/canais ausentes. CSP estrita preservada: usar classes CSS, não atributos style no portal.
- APP_ENV=production e perfis Spring production/prod recusam modelo sintético/bootstrap antes do seed. Não contornar esse bloqueio: CHECK(demo_only) e definições institucionais exigem revisão/migração própria. -Producao nos scripts é build otimizado local com APP_ENV=development.
- Dois moderados JS corrigidos: override xcode>uuid11.1.1 e query-string>decode-uri-component0.5.0, patch CJS/ESM versionado. Frozen/offline passou; não apagar patches. Auditoria ainda2 altos (forge/braces), exit1, sem suppression. Ver DEPENDENCIAS_SEGURANCA.md.
- Backup/restoreV1–V7 aprovado em banco exclusivo,28 tabelas/27 RLS,52 objetos/chave recuperados, login/403/foto/cifra/autenticidade e principal/arquivos/chave preservados. Ver operations/BACKUP_RESTORE.md. Banco restaurado e backups/chaves somente em work privado; não sobrescrever/drop/reutilizar main.
- Java 31 (8+23), frontend40 (15+25), TS/lint, Next e Expo all passaram. Export nativo não equivale a dispositivo/APK/IPA. Conferir o fechamento E2E/capturas no relatório atual antes de reutilizar contagens históricas.

## Ambiente local

Iniciar-VivaMais.cmd mantém controlador vivo; Enter no modo normal ou infra/encerrar-local.ps1 de outro terminal solicita encerramento seguro. Na sandbox não depender de WMI/taskkill. Verificar saúde das portas8080/3000/8081/55432 antes de iniciar outro processo. FILES_DIRECTORY deve ser absoluto e preservar .encryption-key. GET de perfil/pulseira ausentes continua204. Sessão/fila do app web são somente em memória; preferências confirmadas ficam no banco. E2E/capturas pelo helper validar-interface-local.ps1 com filtro/sanitização/TEMP gravável.

## Pendências que permanecem

Acompanhar correções upstream dos dois altos; ensaiar CI/OWASP/secret scanner e provedores externos; refinar diferenças por tela da matriz FIDELIDADE_VISUAL sem afirmar36 telas idênticas. Notificação nativa não tem captura de navegador equivalente. Validar câmera, SQLCipher/SecureStore, notificações e leitores em Android/iOS físicos.

Conteúdo/critérios clínicos e vídeo, fornecedor alimentar, protocolo/aparelho real, revisão jurídica/institucional, canais de suporte/direitos/retenção, modelo produtivo e credenciais/lojas são dependências reais. Hospedagem econômica Vercel/Railway/Supabase/EAS mantida, sem deploy/custo. Não inventar aprovação ou substituir por mocks.

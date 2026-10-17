# Auditoria de dependências

Auditoria pnpm executada localmente em 16/10/2026. A primeira execução encontrou alertas críticos em Vitest/Tinypool. A atualização para Vitest 4.1.11 e override Tinypool 2.1.2 removeu todos os alertas críticos; testes foram reexecutados nas versões finais. Dependências Expo foram alinhadas ao SDK57, incluindo React Native0.86.3, Metro0.86.3, Reanimated4.5.1 e Worklets0.10.1.

Resultado final do registro consultado: **0 críticos, 2 altos e 2 moderados**; `pnpm audit --audit-level high` retorna exit1. Não foram usados ignores/suppressions para simular sucesso. A CI de auditoria deve permanecer bloqueada até correção upstream, substituição validada ou decisão formal de risco; esta fundação não está liberada para produção.

| Dependência/caminho | Severidade | Contexto da fundação | Acompanhamento |
|---|---|---|---|
| node-forge1.4.0 via Expo CLI | Alta | Ferramenta de desenvolvimento/build; não é o servidor Java nem segredo embutido no app | [Advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv); registro não indicava versão corrigida |
| braces3.0.3 via typescript-eslint/fast-glob/micromatch | Alta | Lint com padrões locais; não processa requisições públicas da API | [Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm); registro não indicava versão corrigida |
| uuid7.0.3 via Expo config-plugins/xcode | Moderada | Geração de projeto/build | [Advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq); avaliar atualização do plugin, sem forçar major sem teste |
| decode-uri-component0.2.2 via Expo Router/query-string | Moderada | Dependência potencialmente incluída no cliente; avaliar entradas de URL e atualização compatível | [Advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr); liberação exige avaliação |

Não expor servidores de teste/CLI à internet. Versões corrigidas em outra major não autorizam substituir dependências Expo sem validar compatibilidade nativa. Esta classificação descreve o caminho observado, não prova ausência de exploração.

Scan Java OWASP e secret scan estão configurados no workflow; ainda não executados remotamente. OWASP pode precisar NVD_API_KEY em secret do repositório para evitar limitações de acesso; chave não deve ir para a linha de comando ou logs. Maven Wrapper tem checksum da distribuição. Pacotes JS têm integridade no lockfile. As imagens Docker não foram construídas nesta máquina, onde Docker não está disponível.

# Relatório de transferência e publicação do Viva+

Consolidação autorizada pelo proprietário em [pedido integral](product/PEDIDO_PUBLICACAO_TRANSFERENCIA_2026-10-20.md). Execução iniciada em20/10/2026. Este documento diferencia publicação de fonte, resultado local e liberação produtiva. Provas sanitizadas em [validação técnica](evidencias/consolidacao-publicacao/validacao-tecnica.json).

## Publicação

<!-- PUBLICACAO_INICIO -->
Fonte e documentação publicados em **main** de [joaosoares03/vivamais](https://github.com/joaosoares03/vivamais). Commit de conteúdo revisado: [54c92a34bf0c5054a428e6d56277d2257124e30d](https://github.com/joaosoares03/vivamais/commit/54c92a34bf0c5054a428e6d56277d2257124e30d), confirmado por ls-remote e árvore completa da API GitHub em 2026-10-21T00:25:40.4871877-03:00. Push sem force; visibilidade preservada. Componentes, arquivos internos de web, nove migrações, testes, contratos, assets, scripts e manuais conferidos; nenhum caminho privado ou submódulo inesperado. Um commit adicional contém este fechamento documental; identificá-lo por git log -1 -- docs/RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md. O identificador final fica também no comprovante privado .local/publicacao/resultado.json. Publicação de fonte não libera produção. Estado do CI deve ser conferido por SHA; testes locais não provam jobs remotos aprovados.
<!-- PUBLICACAO_FIM -->

## O que foi consolidado

Todo o fonte existente apropriado para versionamento: app/components/contexts/hooks/services/assets; portal web com páginas/componentes/BFF/serviços/assets/testes; backend Java/Wrapper/DTOs/segurança/serviços/JDBC/migraçõesV1–V9/OpenAPI; packages/contratos/tokens; infra/scripts; testes; referências e evidências sanitizadas. As alterações anteriores foram preservadas, sem reset/clean,novo Git em subpasta ou reescrita. A exclusão preexistente do arquivo gerado expo-env.d.ts e os demais diffs foram revisados junto ao conjunto, sem descartar trabalho.

Não incluídos: work fora da raiz,.local,credenciais de banco/aplicativo/SMS,caixaSMS,chaves,dumps,pg-data,objetos privados,logs brutos,node_modules,.next,dist,target,caches e relatórios de ferramentas com variáveis. .gitignore reforçado para dumps,chaves/envelopes/credenciais acidentalmente copiados. Referências e capturas são sintéticas; não se publicou banco/backup nem dados clínicos reais. Maior arquivo candidato é o documento original de especificação,aproximadamente5,22MB,abaixo de100MiB. O manifesto sanitizado registra paths/tamanhos do conjunto revisado; o commit é a referência final da árvore.

## Documentação criada

| Documento | Entrega específica |
| --- | --- |
| [Manual técnico](MANUAL_TECNICO_COMPLETO_VIVAMAIS.md) | Produto,versões,arquitetura/Mermaid,estrutura,segurança,operação e responsabilidades |
| [Inventário](INVENTARIO_COMPLETO_FUNCIONALIDADES.md) |32 grupos com objetivo,funcionamento,arquivos,endpoint,tabelas,fluxo,estado,testes e limite |
| [Implementação](COMO_FORAM_IMPLEMENTADAS_AS_FUNCIONALIDADES.md) |15pontos por módulo principal,exemplos reais,Controllers/Services/JDBC e retorno à UI |
| [Ambiente](GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md) | Clone novo,Java21,Node/pnpm,PG17/55432 versus18/5432,credenciais próprias,bootstrap,modo conjunto/manual e shutdown |
| [Testes](MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md) | Comandos reais,isolamento,JUnit/Vitest/Playwright,autenticação,roteiros manuais,evidências e diagnóstico |
| [Banco](ARQUITETURA_BANCO_DADOS.md) |33 tabelas/colunas/tipos/nulos/defaults/FKs/checks/índices,RLS,V1–V9,backup/restore e privilégios |
| [API e rotas](CATALOGO_API_E_ROTAS.md) |58 operações,37 arquivos de rotaExpo,11páginasNext,classes e suítes com links |
| [Plano de continuidade](PLANO_TECNICO_CONTINUIDADE_DESENVOLVIMENTO.md) |21 pacotes/40IDs,contratos/arquivos/segurança/ordem e execução/testes por pacote |
| [Padrões](PADROES_DESENVOLVIMENTO_VIVAMAIS.md) | Português,compatibilidade,UI/transporte,Java/JDBC,Flyway,permissões,contribuição ponta a ponta |
| [Índice](INDICE_DOCUMENTACAO.md) | Toda documentação Markdown por assunto,ordem de leitura e referências não Markdown |
| [Contribuir](../CONTRIBUTING.md) | Processo de branch/revisão/testes,coordenação e proteção de segredos |

README foi refeito como entrada técnica. AGENTS,PROGRESSO,STATUS,PROXIMA_EXECUCAO e manuais de continuidade/exercícios/IA/matriz foram atualizados; exercício/IA continuam com outro responsável. Levantamento ampliado preserva40IDs e acrescenta complexidade,APIs,banco,problema atual/comportamento esperado. O plano antigo virou referência para o canônico,sem manter duas versões divergentes. Guia Windows antigo teve corrigida a indicação obsoleta de login por senha do paciente.

## Estado do desenvolvimento e arquitetura

Backend Java21/Spring Boot3.5.16/JDBC,PG17.9/FlywayV1–V9; Next16.4.2/React19.2.3/TS5.9.3; Expo57.0.21/RN0.86.3; pnpm10.28.2/Node24. API aplica escopo institucional/vínculo/titular. BFF guarda bearer no servidor/cookie; paciente usa CPF+nascimento apenas para identificar,prova de aparelho/código para autenticar. Objetos locais AES-GCM,Tesseract real,porta Twilio/Supabase preparada.

Concluído e testado no limite local: cadastro/demografia/CPFestrutural/celular/troca assistida; acesso/sessão/aparelho no navegador; emissão/ativaçãoSMSLOCAL; pressão manual/histórico; medicamentos/autorrelatos; foto/histórico alimentar; perfil/registro/semana de atividade; transcrição/consultas; vínculos/busca/preferências e correção estrutural de barra/logo/configurações. OCR real passa fixture e exige revisão,mas avaliação representativa permanece parcial.

Parcial ou bloqueado: notificações/SecureStore/SQLCipher/câmera físicos,cache clínico persistente offline,catálogo/prescrição/vídeo de exercícios,análise alimentar com critérios,hardware,consulta oficial deCPF,SMS externo,relatório integral/retificação,ciclo profissional,políticas/canais/direitos,revisão36 referências,hospedagem/HTTPS/monitoramento/CI integralmente aprovado/lojas. Fonte publicado não torna esses recursos concluídos. [40pendências](LEVANTAMENTO_COMPLETO_PENDENCIAS.md).

## Testes executados nesta consolidação

| Verificação | Resultado e limite |
| --- | --- |
| Instalação pnpm10.28.2 --frozen-lockfile | Aprovada,lock preservado |
| Java Maven verify |74 testes,22unidades+52integrações,zero falhas/erros/skips; banco novo exclusivo,PG17real,OCRNode real |
| Frontend |69 testes:40app/29portal,aprovados; doubles restritos a unidades/componentes |
| TypeScript e ESLint | Aprovados com scripts reais |
| Contratos | contracts:generate/sync executado; snapshot/tipos revisados |
| Next build | Aprovado16 rotas; contorno mkdir da sandbox documentado |
| Expo export web/all | Aprovado,Android/iOSHermes; não APK/IPA nem aparelho |
| E2E Playwright |17aprovados,API/PG reais,SMSLOCAL;11 arquivos,1worker;1,4min |
| Inicializador e saúde | Script conjunto executado de novo;API8080/portal3000/app8081 responderam200 |
| pnpm audit |922dependências,0críticos/2 altos/0moderados;exit1 mantido |
| Gitleaks8.30.1 | Histórico e candidato examinados,sem achados; revisão final registrada no JSON |
| Segredos conhecidos |5valores privados comparados em memória,sem ocorrência no conteúdo revisado; valores nunca no relatório |

Logs completos ficam privadamente em work/transferencia-*.log; não enviados. As contagens/status extraídos sem corpos estão no JSON público. Falhas intermediárias corrigidas: links com parênteses, separador de tabela e resolução do parser YAML. A revisão do stage retirou somente a saída temporária de ajuda do terminal, preservada localmente e ignorada. Espaços de contexto do patch pnpm são preservados com atributo whitespace específico em patches/*.patch; não se alterou seu hash nem se suprimiu auditoria. Nenhum teste funcional foi removido para passar. O CI foi ajustado para gerar senhas efêmeras mascaradas de banco/contas em vez de literal de senha de banco; execução Docker/Linux é verificação remota separada dos testes Windows. O novo publicador PowerShell recebeu validação de sintaxe e pré-verificação local; seu push real continua bloqueado nesta sandbox.

## Evidência anterior e verificações não executadas

Os74/69/17 testes da entrega anterior foram repetidos agora,não apenas citados. Preservação de30 tabelas/66objetos naV9 e restoreV8 são evidências anteriores datadas; **não se executou novo restore completoV9** para escrever a documentação. Não houve teste de operadora,Supabase externo,CPFoficial,aparelho físico,APK/AAB/IPA,loja ou deployment. Instalação do zero em outra máquina Windows e Docker local não foram alegados: comandos foram conferidos contra scripts/fontes e ambiente instalado.

## Segurança e bloqueios produtivos

Dois altos reavaliados: node-forge1.4.0 viaExpoCLI([aviso](https://github.com/advisories/GHSA-86w9-cpqp-85rv)) e braces3.0.3 viaMetro([aviso](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)); fontes oficiais ainda sem versão corrigida na consulta. Nenhuma suppression/ignore/upgrade incompatível. Contexto de ferramenta não elimina risco; manter CLI/Metro locais e corrigir cadeia suportada antes de produção.

Consulta pg_roles mostrou role local superusuária/BYPASSRLS/criação de roles/bancos. P01/G01 exigem separar migrador e runtime limitado antes de hospedagem. As32RLS habilitadas/0políticas diretas não protegem dessa credencial administrativa. Nenhuma role/schema do principal foi alterada por esta auditoria. Segredos não foram encontrados; não surgiu credencial comprometida que exigisse reescrita do histórico. Scanners não substituem revisão universal,privacidade ou avaliação independente.

OWASP/NVD local completo não foi executado; job existente requer base/chave quando exigida. Estado remoto deve ser lido na seção de publicação,sem dizer que testes locais significam CI verde. Direitos/políticaLGPD,identidade,SMS/hardware e revisão clínica continuam dependências externas. Não alterar APP_ENV production ou demo_only isoladamente.

## Transferência e primeiros passos do novo responsável

Ler README → manual técnico → ambiente → cadastro/SMS → inventário/implementação/API/banco → testes/padrões → levantamento/plano → manuais especializados. Criar suas próprias senhas por entrada protegida e banco de testes,sem pedir work do autor. Executar baseline,ativar paciente fictício via caixa LOCAL e conferir persistência/escopo. EscolherIDPxx e registrar dependências/aceite antes de editar.

Prioridade geral:P02/P21(grafo/CI),P01/P06(instituição/mínimo privilégio/identidade),P07–P16(ensaios nativos/offline),P03/P04somente após autorizações externas. Outro dev recebeP27–P30(exercícios/IA),com componentes,contratos,tabelas e critérios nos manuais. Não substituir implementações por mocks nem reiniciar fundação. Próxima numeração Flyway deve ser coordenada;V1–V9imutáveis.

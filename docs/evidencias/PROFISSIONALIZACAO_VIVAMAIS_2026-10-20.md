# Viva+ — profissionalização e validação — 20/10/2026

Estado: rodada técnica concluída e verificada; produção permanece bloqueada. A execução anterior foi preservada; não houve recriação de arquitetura, commit, push, descarte, alteração remota ou publicação. Pedido integral em [documento de origem](../product/PEDIDO_PROFISSIONALIZACAO_2026-10-20.md).

## Implementação

- Acesso, boas-vindas, cadastro/ativação, Home, registros, fotografia, mensagens de carregamento/erro/confirmação, alimentação e disponibilidade receberam linguagem pt-BR mais direta. “API” foi substituída por termos de acompanhamento/serviço nos fluxos comuns. Não foram renomeados contratos, enumerações persistidas, contas ou rotas por estética.
- O aviso de dados fictícios ficou concentrado no ambiente de desenvolvimento. Nomes sintéticos das contas/dados de teste continuam identificados: não são pacientes reais. Conteúdos clínicos/serviços não disponíveis continuam explicitados.
- Suporte, privacidade e exclusão descrevem o funcionamento atual. Corrigida a afirmação antiga de que fotos não funcionavam. Sem contatos inventados, canal de envio fictício, política aprovada, prazo legal ou promessa de exclusão automática. Termos de uso não existiam e não foram inventados.
- Preferências persistentes por conta: texto ampliado no aplicativo/portal e 10/20/50registros por página na ficha profissional. V7 aditiva; GET/PUT autenticados sem identificador de outra conta; RLS/revogação de privilégios diretos; controle de versão com 409 em concorrência. Aplicativo descarta respostas de uma sessão anterior; portal remonta por usuário. Armazenamento no PostgreSQL, sem token/registro clínico em localStorage. Falha não confirma salvamento, oferece releitura; portal apresenta confirmação e impede envios simultâneos.
- Autoria nominativa: consultas, diário, medicamentos/versões, perfil funcional, atividade e pressão consultam nomes no banco após a autorização existente. IDs internos permanecem nos contratos/auditoria, sem usá-los como substituto normal do nome nas tabelas.
- Resumo: totais completos de refeições/atividades calculados no PostgreSQL, separados da seleção de até 20registros recentes. Integração cobre23registros para impedir contagem truncada. Consultas/diário ordenados pela ocorrência e desempate por ID. Pressão mantém filtros e gráfico da página explicitamente identificados; autorrelatos de sete datas mantêm sem confirmação distinto de “Não tomei”.
- Interface: foco visível, tamanho ampliado coerente, alvos de detalhes de 44 px, checkbox maior, quebra de tabelas/formulários em tela estreita, cabeçalhos de coluna, proporção de logos e imagens preservada. Os52recursos fornecidos não foram substituídos ou reamostrados. Ícones vetoriais e alternativas acessíveis existentes preservados.
- Ambiente: API recusa APP_ENV=production com bootstrap/modo sintético e também o modelo vigente pendente de revisão. O CHECK(demo_only) existente continua preservado. Portal exige URLs HTTPS explícitas/sem credenciais e rejeita configuração de bootstrap; Expo valida ambiente e endereço. Simulador fica restrito a desenvolvimento/teste. -Producao nos scripts locais indica build otimizado, com APP_ENV=development; não libera operação real.

## Segurança e recuperação

Auditoria pnpm antes:0 críticos/2 altos/2 moderados; depois: **0 críticos/2 altos/0 moderados, exit1**. Corrigidos uuid e decode-uri-component em caminhos restritos, com patch de interoperabilidade CJS/ESM reproduzível. Não houve atualização em massa ou suppression. Os dois altos (node-forge e braces) não têm correção indicada pelos advisories consultados. [Detalhes e fontes](../DEPENDENCIAS_SEGURANCA.md).

Backup/restore V1–V7 **aprovado** em banco isolado exclusivo:28 tabelas,27 RLS, migrações/checksums e contagens iguais; principal preservado.52 objetos cifrados, chave correspondente recuperada, foto antiga decifrada, login e acesso cruzado403. Envelope AES-256-GCM verificado e adulteração recusada; chave separada e ACL privada de backup. [Resultado estruturado](backup-restauracao-2026-10-20.json) e [procedimento reproduzível](../operations/BACKUP_RESTORE.md). Não representa ensaio em Supabase/Docker.

## Testes

| Verificação | Resultado |
|---|---|
| Java 21/Maven verify |8 unitários+23 integrações PostgreSQL=31; zero falhas/erros/skips. Inclui OCR real, preferências/isolamento/conflito, autoria e totais completos |
| Frontend |15 app+25 web=40 aprovados; salvamento confirmado, falha/conflito/releitura de preferências |
| TypeScript/ESLint |Aprovados; app, web, contratos e tokens |
| Next 16.4.2/Webpack |Build otimizado aprovado;16 entradas |
| Expo57/RN0.86 |Export web/Android/iOS aprovado, Hermes nativo. Não é APK/IPA nem ensaio de aparelho |
| Dependências |Importação CJS/ESM, Unicode, parâmetros repetidos, entrada malformada e 100UUIDs Xcode aprovados; auditoria mantém 2 altos |
| Produção |Teste impede combinações de bootstrap/dados sintéticos e configuração desconhecida; portal rejeita URL insegura/local |
| Backup/restauração |Aprovado com banco/objetos/chave/contagens/isolamento/cifra/autenticidade |
| E2E/visual |13 E2E aprovados;52 capturas/35 pares/3 painéis e 2 cenas de portal 390 px; ver fechamento abaixo |

Logs privados em work/*profissionalizacao*.log; as credenciais não integram estes documentos. Primeira tentativa Maven encontrou JAR em uso; os serviços foram encerrados pelo controlador e o verify repetido passou. Ensaios iniciais falharam por textos antigos e sincronização do teste de preferências; corrigidos antes da repetição, sem contar falhas como aprovação. Um erro de escopo na confirmação da preferência foi corrigido e a suíte frontend repetida passou.

## Arquivos principais

- API: PreferenciasController.java, ConfiguracaoAmbiente.java, CuidadoService.java, ModelosCuidado.java, application.yml, V7__preferencias_conta.sql e contrato OpenAPI/tipos gerados.
- Testes: CuidadoIT.java, ConfiguracaoAmbienteTest.java, PreferenciasPortal.test.tsx e E2E de preferências/acesso/fluxos/páginas públicas.
- Aplicativo: ContextoPreferencias, ElementosInterface, TelaCuidado, FluxoFotografia, HistoricoAtividades, acesso/cadastro/início/configurações/mensagens/pressão/atividade e serviços de ambiente/módulos/transporte/fila.
- Portal: PreferenciasPortal, CuidadoPaciente, TabelaCuidado, VisaoGeralPaciente, resumoPaciente, componentes de cadastro/foto/módulos/documento/rodapé, layout/login/configurações/páginas institucionais, BFF allowlist, globals.css e next.config.ts.
- Operação: ensaiar-backup-local.ps1, cifrar-backup.mjs, verificar-dependencias.mjs, capturar-telas.mjs e validar-interface-local.ps1; pnpm-workspace.yaml/lock e patches/query-string@7.1.3.patch. Fontes TSX também passaram pelo formatador, sem remoção de lógica.
- Documentação: PROGRESSO, STATUS, PROXIMA_EXECUCAO, README/AGENTS, guias de execução/teste, segurança, backup, fidelidade e este relatório/capturas.

## Limites para produção

Permanecem os dois alertas altos, ensaios físicos Android/iOS (câmera, SQLCipher/SecureStore, notificações, leitores de tela), critérios/conteúdo clínico/vídeo aprovados, fornecedor alimentar, protocolo/aparelho real de pulseira, revisão institucional/jurídica, canais de suporte/direitos e retenção, migração do modelo produtivo e credenciais/ensaios dos fornecedores/lojas. Não há monitoramento de urgência nem diagnóstico automático. Vercel Hobby/Railway Hobby/Supabase Free/EAS permanecem como decisão de hospedagem econômica, sem implantação ou custo nesta execução.

## Correções da validação final

O bloqueio produtivo também reconhece perfis Spring production/prod, mesmo se APP_ENV estiver incorretamente em development. Teste adicional passou:8 unitários+23 integrações. Estilos inline bloqueados pela CSP foram removidos de indicadores, resumo, gráfico e foto; política mantida sem unsafe-inline. O ensaio isolado de preferências passou em 6,1 s (4,5 s de fluxo), com dois acessos independentes ao aplicativo e nova sessão profissional. Corrigidos também seletores diferentes entre Home e Perfil; ações continuam com seus nomes acessíveis reais. Última restauração:52 objetos/4.044.028bytes; hashes dos objetos/chave originais iguais e leitura pública da chave ausente.

## Fechamento visual e transferência

As13verificações E2E passaram juntas antes da retomada documental. Foram concluídas52 capturas em profissionalizacao,35 pares e 3 painéis, preservando evidências anteriores. A revisão final corrigiu alinhamento do checkbox de texto ampliado e espaçamento da paginação;2 capturas adicionais verificam portal 390 px, inclusive preferência ampliada. [Comparação por tela](profissionalizacao/COMPARACAO_VISUAL.md). Permanecem diferenças de fontes/escala/composição, logo horizontal legado e estados clínicos/integrações indisponíveis; não afirmar identidade integral.

Nesta retomada documental:5 E2E direcionados após reiniciar o ambiente,1 E2E após ajuste final,2 testes de configuração Expo e 2de preferências passaram. Next foi recompilado e capturas refeitas após CSS. O perfil Expo preview foi preservado/validado; não foram repetidas todas as suítes Java/Expo sem alteração relevante. [Relatório desta retomada](RETOMADA_E_TRANSFERENCIA_2026-10-20.md) distingue validações herdadas e novas.

![Configurações alinhadas](profissionalizacao/extra_web_configuracoes.png)

![Consultas com autoria e paginação espaçada](profissionalizacao/web_12_historico_consultas.png)

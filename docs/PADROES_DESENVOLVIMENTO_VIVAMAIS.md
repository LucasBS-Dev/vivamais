# Padrões de desenvolvimento do Viva+

Regras baseadas no código existente em 20/10/2026. Leia primeiro o [manual técnico](MANUAL_TECNICO_COMPLETO_VIVAMAIS.md), AGENTS da raiz e, para Next, `web/AGENTS.md`. Não é autorização para novas integrações pagas, decisões clínicas ou publicação da aplicação.

## Organização e nomes

Expo fica na raiz; Next em web; Java em backend/demo. Novos identificadores próprios de domínio devem usar português brasileiro sem acentos: `Paciente`, `RegistroPressao`, `buscarPaciente`, `carregando`. Componentes PascalCase, hooks `use...`, funções/variáveis camelCase, constantes conforme as convenções da plataforma. `page.tsx`, `layout.tsx`, `route.ts`, `GET`, imports, APIs de bibliotecas e propriedades obrigatórias não são traduzidos.

Paths e campos JSON/SQL em inglês são contratos existentes. Exemplo: a URL `/patients` continua assim; `EntradaPaciente` pode mapear `displayName` com `@JsonProperty`. Não traduzir coluna ou enum persistido por busca/substituição, nem editar V1–V9. Há legado em inglês explicitamente listado em P36; refatorar por símbolo, mantendo clientes e testes.

Uma tela usa `Tela`, `TextoAcessivel` e os componentes do módulo; a barra vai na prop `rodape`, fora do ScrollView. Hooks coordenam consultas; services executam transporte/regra de cliente. `TelaCuidado` reúne estados comuns dos módulos; não adicionar fetch solto em cada botão. No portal separar Server Components e componentes cliente; `web/services/api.ts` é server-only.

## Frontend e estado

Reutilizar `services/transporteApi.ts`, `ErroApi` e contratos. Token nunca vai em localStorage, query string ou log. Não encaminhar bearer para URL externa; os transports recusam caminhos/redirecionamentos inadequados. Usar cancelamento/controle de resposta atrasada para que consulta anterior não substitua nova aba/titular, como nos testes da ficha.

Sempre representar carregando, vazio, indisponível e falha. Falha de persistência mantém formulário; nenhum toast de sucesso antes da confirmação da API. UUID de uma operação permanece o mesmo nas repetições. A fila web é memória, não prometer sobrevivência a fechamento. `.native.ts` contém implementação específica sem fallback inseguro.

Exemplo real de composição: `web/components/CamposDadosPessoais.tsx` é reutilizado no cadastro e edição; `packages/contracts/src/cadastro.ts` normaliza CPF/celular; backend repete validação por ser a autoridade. `AtivacaoPaciente.tsx` recebe metadados de SMS e não contém campo que revele o código. Não recolocar o segredo para facilitar uma demonstração; usar a caixa privada LOCAL.

Portal usa CSS em `web/app/globals.css` devido à CSP, sem estilos inline arbitrários. `Icones.tsx` omite o style que `getImageProps` gera; preservar esse detalhe. Imagens originais têm proporção preservada. Responsividade verificada deve incluir1366,1440,1920,768,390 e app320,375,430; não tratar screenshot desktop como aceite universal.

## Backend: Controller, Service e persistência

`InstituicaoController` usa `@AuthenticationPrincipal SessaoAutenticada`; `CuidadoController` delega negócio a `CuidadoService`. DTOs estão em `dto/ModelosApi`, `ModelosCuidado`, `ModelosAcessoPaciente`. Bean Validation não substitui validação contextual (telefone exigido, conflito de versão, vínculo, disponibilidade de fornecedor).

`InstituicaoRepository` e `JdbcTemplate` são a persistência real. `CuidadoService`, `DadosPessoaisService` e `AcessoPacienteService` usam SQL parametrizado, não JPA. Nunca montar SQL com entrada do usuário. Nomes de tabela dinâmicos devem vir de lista fechada do servidor. Exigir paciente autorizado antes de SELECT/INSERT/UPDATE e reaplicar papel para ações exclusivas do profissional/admin.

Escopo mínimo: organization da sessão → paciente dessa unidade → vínculo quando profissional → titular quando paciente. Possuir UUID, passar tela de login ou ter RLS habilitada não basta. Não confiar em patient_id, organization_id ou author_id fornecido pelo cliente para determinar autoridade. Audit_Event registra ator/ação/recurso, sem corpo clínico ou código.

Usar transação para negócio atômico, como versão demográfica/revogação. Contadores de tentativas precisam sobreviver à resposta de erro: a reautenticação de troca telefônica usa transação independente no serviço de acesso. **Não copiar `noRollbackFor` indiscriminadamente** para serviços externos; uma falha causada por transação marcada rollback-only já foi corrigida. Testar status esperado e persistência do contador após falhas.

Falhas públicas usam `TratadorExcecoesApi` e códigos HTTP coerentes. 400 validação,401 autenticação,403 autorização,409 conflito/regularização,413 tamanho,415 formato,429 limite,503 serviço indisponível. Não devolver SQL, stacktrace, corpo do fornecedor ou indicação de existência de conta. Na API atual perfil/pulseira ausentes podem retornar204; cliente não deve tentar parsear JSON nessa resposta.

## Banco e contratos

Adotar o [processo Flyway](ARQUITETURA_BANCO_DADOS.md): verificar remoto, coordenar próxima versão, criar migração aditiva e testar banco limpo + legado isolado. V1–V9 aplicadas são imutáveis; não usar repair/clean para disfarçar incompatibilidade. Toda nova tabela clínica exige RLS e revogações diretas apropriadas, além da autorização Java. Avaliar FK composta por unidade e índices dos filtros.

Não editar `packages/contracts/src/generated.ts` à mão. Atualizar endpoint/DTO, executar API de teste, obter `/v3/api-docs` autenticado, sanitizar apenas metadado de host quando necessário, revisar `backend/demo/openapi.json`, rodar `pnpm contracts:generate`, verificar diff e consumidores. Snapshot não deve conter exemplos com segredos/dados pessoais. `infra/sync-shared.mjs` mantém cópias locais file:; executado no postinstall.

## Segurança dos arquivos e integrações

Upload passa por `ArquivoPrivadoService`, nunca escrita pública direta; reencodar imagem, limitar tamanho e não confiar em extensão/MIME isolados. Manter cifra, titular, concessão e autorização cruzada. Chaves, envelopes SMS, dumps e logs ficam em `.local` ou work privado. Backup precisa de banco+objetos+chaves, com chaves separadas.

Integração nova deve ter porta com implementação indisponível/real explícitas. `ServicoEnvioSms` é exemplo: sem configuração não produz sucesso; LOCAL só em teste/desenvolvimento, TWILIO com autorização e credenciais no backend. Não seguir redirect para destino arbitrário com segredo. Timeout/erro ambíguo não deve repetir cobrança/envio automaticamente. Mock só em teste e estado demonstrativo claramente identificado.

## Acessibilidade e qualidade

Texto em pt-BR, rótulos acessíveis, foco e mensagem ligada ao campo; controles precisam permitir teclado/leitor/tamanho de fonte. Toast não deve ser a única informação. Manter área segura e alvos tocáveis. Validar contraste e fluxo com erro/vazio/offline. Fonte ampliada é preferência por conta; não fixar altura que corte rótulos.

Testar comportamento e persistência, evitando teste que apenas replica a implementação. Para permissão, incluir usuário sem sessão, outro paciente e outra instituição; para atualização, 409 e preservação do original; para idempotência, retry com mesmo UUID. Teste de componente pode usar double de transporte; E2E usa API/PG reais. Teste físico não se substitui por export.

## Passo a passo de uma mudança

1. Escolher ID Pxx no levantamento, verificar dependências/decisões e responsável; não assumir exercícios/IA de outro dev.
2. Criar branch local a partir da main atualizada sem descartar alterações: `git switch -c feat/descricao-da-tarefa`. Se há alterações de outro responsável, separar escopo antes.
3. Localizar telas, contratos, tabelas e testes no inventário; reproduzir o comportamento atual.
4. Definir entrada/saída/erros e compatibilidade; desenhar migração somente se necessária.
5. Implementar persistência e Service com autorização/transação; Controller fino e DTO validado.
6. Atualizar OpenAPI/tipos; integrar pelos services/BFF e componentes existentes.
7. Exercitar sucesso, falha de rede,403,409 e repetição; verificar linha persistida pela API autorizada.
8. Rodar testes adequados e as regressões afetadas, tipagem/lint/build. Sem modificação nova, não repetir uma suíte sem finalidade.
9. Registrar resultados e limitações em PROGRESSO/STATUS; atualizar manuais e evidência sanitizada.
10. Revisar `git diff`, `git status`, segredos e arquivos grandes; stage seletivo, diff cached check, commit descritivo e PR conforme política do mantenedor. Não fazer force push.

## Trabalho simultâneo

Combinar dono de arquivo compartilhado e reserva de versão Flyway antes de editar. Exercícios e IA usam `TRANSFERENCIA_DEV_*` e a matriz. Atualizar o contrato junto dos consumidores; evitar refatoração global concorrente. Não criar repositório dentro de web/backend. Conflito deve ser resolvido preservando ambos os requisitos e repetindo testes; histórico incompatível/remoto inesperado exige mantenedor, não reset/force push.

Contribuições externas seguem [CONTRIBUTING](../CONTRIBUTING.md). Nunca incluir senha de bootstrap, telefone/CPF de pessoa, chaves, `.env`, banco, node_modules ou logs brutos em commit/issue/PR.

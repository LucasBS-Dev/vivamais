# CODEX — CORRIGIR E FINALIZAR O VIVA+ SEM RECOMEÇAR: ESTRUTURA IGUAL À REFERÊNCIA + CÓDIGO EM PORTUGUÊS + TELAS FIÉIS AOS PROTÓTIPOS

Você está no repositório EXISTENTE **Viva+ / Pulso em Dia**. Este pedido complementa as instruções de implementação já recebidas. **Não crie um novo projeto, não recomece a Fase 0 e não descarte funcionalidades implementadas.** Sua missão é corrigir três aspectos do código atual — **estrutura de pastas, nomenclatura em português e fidelidade visual** — e depois continuar até entregar os fluxos funcionais e testados.

## 0. FONTES DE VERDADE E MATERIAIS ANEXADOS

Examine os arquivos que coloquei neste repositório antes de editar:

1. `referencias_codex/AgendAqui-main.zip`: **referência de estrutura e organização do código**, NÃO de funcionalidades, dados ou regras de segurança. Inspecione o ZIP e seus arquivos de fato; não presuma sua estrutura a partir deste texto.
2. `referencias_codex/prototipos/01_app_paciente.png`: **referência visual obrigatória** das 12 telas gerais do aplicativo.
3. `referencias_codex/prototipos/02_plataforma_profissional.png`: **referência visual obrigatória** das 12 telas do painel web profissional.
4. `referencias_codex/prototipos/03_atividade_fisica.png`: **referência visual obrigatória** das 12 telas do fluxo de atividade física.
5. `referencias_codex/telas/`: recortes individuais de cada uma dessas 36 referências, para abrir/inspecionar e comparar com cada tela implementada.
6. `referencias_codex/MAPA_TELAS.md` e `referencias_codex/ESTRUTURA_ALVO.md`: inventário dos nomes e diretórios esperados.
7. A especificação funcional Viva+ já existente em `docs/product/` e os documentos `AGENTS.md`, `README.md`, `docs/STATUS.md`, `docs/PROXIMA_EXECUCAO.md`, `PROMPT_CODEX_VIVA_MAIS.md` e outros que existirem.

**Prioridade:** os mockups controlam a aparência, a especificação controla o comportamento e a segurança, e o ZIP AgendAqui controla o padrão de ORGANIZAÇÃO. Em caso de conflito entre imitação visual e segurança/acessibilidade, preserve segurança e documente a diferença mínima necessária.

Se não localizar as referências na pasta indicada, procure os arquivos reais no repositório. Se estiverem realmente ausentes, diga exatamente quais faltam; **não invente que os visualizou nem alegue fidelidade sem vê-los**. Não trave as tarefas independentes.

## 1. NÃO PERDER O PROGRESSO ATUAL

Antes de refatorar:

- Inspecione a árvore atual (`git status`, arquivos de configuração, rotas, código, migrações, testes e dependências). Não execute `git reset --hard`, nem sobrescreva arquivos indiscriminadamente.
- Faça um inventário curto por módulo: funcionando, incompleto, não iniciado, bloqueado.
- Verifique como executar backend, web e aplicativo. Registre o estado atual em `docs/REFATORACAO_VISUAL_E_ESTRUTURAL.md`.
- Se a pasta estiver versionada, crie checkpoint/commit local com alterações existentes apenas de forma segura e sem incluir segredos, builds ou arquivos temporários; NÃO publique nem force push. Se não houver Git, não invente commits.
- Mude os diretórios gradualmente, atualizando imports, aliases, scripts, configurações, testes, APIs, migrações e referências. Execute builds e testes após cada lote. Nunca troque a arquitetura funcional por páginas estáticas.

## 2. ESTRUTURA DE PASTAS: SEGUIR O AgendAqui-main.zip

A referência possui:

- Na **raiz do aplicativo Expo**: `app/` (telas e rotas Expo Router, `_layout.tsx` e `index.tsx`), `assets/images/`, `components/`, `contexts/`, `hooks/`, `services/api.ts`, `app.json`, `package.json`, `tsconfig.json` e arquivos de configuração.
- No **Java**: `backend/demo/pom.xml`, `backend/demo/src/main/java/.../config/`, `controller/`, `model/`, `repositories/`, `backend/demo/src/main/resources/` e `backend/demo/src/test/`.
- Telas relacionadas ficam agrupadas nas subpastas de rotas de `app/`; chamadas à API e tipos de domínio não devem ser espalhados dentro dos componentes.

**Reorganize o Viva+ para espelhar esse desenho o mais literalmente possível**, preservando os arquivos técnicos de funcionamento do framework. Estrutura-alvo preferida (adapte nomes de classes ao domínio Viva+):

```text
viva-mais/
├── app/                           # React Native + Expo Router: app do PACIENTE
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── boas-vindas.tsx
│   ├── acesso.tsx
│   ├── inicio.tsx
│   ├── pressao/
│   ├── medicamentos/
│   ├── alimentacao/
│   ├── atividade-fisica/
│   └── historico/
├── assets/
│   └── images/
├── components/                    # componentes reutilizáveis mobile
├── contexts/                      # contexto de autenticação, tema etc.
├── hooks/                         # useAutenticacao, usePressao etc.
├── services/
│   └── api.ts                      # cliente central da API com configuração por ambiente
├── backend/
│   └── demo/                       # projeto Maven/Spring Boot; como no ZIP
│       ├── pom.xml
│       └── src/
│           ├── main/
│           │   ├── java/com/vivamais/
│           │   │   ├── config/
│           │   │   ├── controller/
│           │   │   ├── model/
│           │   │   ├── repositories/
│           │   │   ├── service/     # camada adicional NECESSÁRIA para regras reais
│           │   │   ├── dto/
│           │   │   └── security/
│           │   └── resources/
│           │       ├── application.properties
│           │       └── db/migration/
│           └── test/
├── web/                           # ADIÇÃO NECESSÁRIA: Next.js do PROFISSIONAL
│   ├── app/                       # convenção obrigatória do Next.js
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── ...
├── docs/
├── referencias_codex/            # APENAS referências: não entra na publicação
├── README.md
├── app.json
├── package.json
└── tsconfig.json
```

**Atenção ao conflito técnico:** o AgendAqui usa apenas Expo + Spring Boot; o Viva+ também exige **Next.js para profissionais**. Portanto, mantenha `app/` da raiz para o Expo e acrescente `web/` separadamente. Não tente misturar as rotas Expo e Next.js na mesma pasta `app/`. Se houver motivo técnico comprovado para não mover algum diretório, descreva a exceção e preserve a organização equivalente (não crie uma reestruturação que quebre todo o projeto só para imitar nomes).

**Não copie os bugs e riscos do exemplo.** No AgendAqui há uso de H2, URL/IP local fixo, implementação de senha em texto puro em partes do código e CORS permissivo. **NÃO reproduza isso no Viva+.** Continue com PostgreSQL, senhas com hash, login seguro, autorização no servidor, variáveis de ambiente, uploads privados, validação e migrations. O ZIP é somente uma referência estrutural.

## 3. PADRÃO OBRIGATÓRIO: PORTUGUÊS EM TODO CÓDIGO DE AUTORIA PRÓPRIA

Nomes novos de funções, variáveis, parâmetros, tipos/interfaces, classes de domínio, métodos, estados, mensagens, tabelas, colunas, comentários e arquivos de telas/componentes devem estar em **português brasileiro**, de maneira legível e consistente. Em identificadores, **não utilize acentos, cedilha nem espaços**; preserve os acentos no texto exibido ao usuário.

Exemplos:

| Evitar no código do domínio | Usar |
|---|---|
| `Patient`, `patientId`, `getPatients` | `Paciente`, `idPaciente`, `buscarPacientes` |
| `BloodPressure`, `savePressure` | `RegistroPressao`, `salvarPressao` |
| `medications`, `isLoading` | `medicamentos`, `carregando` |
| `handleSubmit`, `handleLogin` | `enviarFormulario`, `realizarLogin` |
| `FoodAnalysis`, `exerciseHistory` | `AnaliseAlimentacao`, `historicoAtividades` |
| `Appointment`, `onSuccess` | `Consulta`, `aoConcluir` |
| `UserProfile`, `authContext` | `PerfilUsuario`, `contextoAutenticacao` |

Exemplo TypeScript desejado:

```ts
interface RegistroPressao {
  id: string;
  pressaoSistolica: number;
  pressaoDiastolica: number;
  dataMedicao: string;
  origemRegistro: 'digitacao' | 'foto' | 'diario';
}

async function salvarRegistroPressao(registro: RegistroPressao): Promise<void> {
  await api.registrarPressao(registro);
}
```

Exemplo Java desejado: `PacienteController`, `PacienteRepository`, `PacienteService`, `RegistroPressao`, `Medicamento`, `ConsultaEnfermagem`, `buscarPorCpf`, `registrarPressao`, `listarMedicamentos`, `dataHoraMedicao`. Preserve o nome das anotações, classes e métodos herdados do Java/Spring.

**Exceções mandatórias:** palavras-chave das linguagens; contratos de bibliotecas (`useState`, `useEffect`, `StyleSheet`, `ResponseEntity`, `@RestController`, `findById`, `getServerSideProps` se usado); convenções obrigatórias do Expo/Next (`_layout.tsx`, `index.tsx`, `page.tsx`, `layout.tsx`, `app.json`, `package.json`); diretórios do ZIP (`app`, `hooks`, `components`, `contexts`, `services`, `controller`, `model`, `repositories`) e nomes padronizados de arquivos externos (`Dockerfile`, `.env.example`). Não traduza nomes de bibliotecas nem cabeçalhos/protocolos HTTP. Tipos técnicos genéricos e métodos exigidos por interfaces externas podem manter seus nomes originais.

Renomeie código já escrito em inglês de forma segura, com refatorações rastreáveis, sem alterar à força campos de contratos externos ou tabelas com dados existentes. Se uma API mudar de nome, altere cliente, servidor, testes e documentação juntos ou use mapeadores temporários para não quebrar chamadas. Padronize rotas e entidades próprias do domínio para português quando não houver incompatibilidade.

## 4. TELAS: REPRODUÇÃO VISUAL FIEL DOS 36 PROTÓTIPOS

**É uma exigência de aceite, não uma inspiração vaga.** As imagens em `referencias_codex/prototipos/` são a referência canônica. Não invente um novo design system, não redesenhe a composição, não faça um layout genérico e não substitua por dashboards alternativos que apenas tenham as mesmas funções.

Para **CADA tela**, examine e replique, tanto quanto tecnicamente viável:

- Hierarquia, posições e dimensões relativas de todos os blocos.
- Paleta, gradientes, bordas, sombras, raio dos cartões e proporções dos espaços.
- Logotipo Viva+, alinhamento, títulos, subtítulos, textos, ícones e ilustrações.
- Tamanho/peso de fontes, paddings, espaçamentos, botões, inputs, barras e gráficos.
- Menu lateral, cabeçalho, abas, cards, tabelas, estados, botão selecionado e navegação.
- No app, respeite status bar, safe area, cabeçalho, barra inferior e teclado. Em diferentes aparelhos, preserve proporções e legibilidade; NÃO use um único layout fixo que corte conteúdo.
- No web profissional, mantenha a barra lateral azul escura, header superior, indicadores e disposição dos módulos exatamente como o quadro visual. Faça layout desktop como referência e ajuste responsivamente para telas menores sem esconder funções.
- Não represente telas inteiras como imagem de fundo, não insira screenshot recortada como substituto de campos ou botões. **Tudo deve ser interface real e clicável, acessível e integrada aos dados.**

### 4A. Aplicativo do paciente — 12 telas do painel `01_app_paciente.png`

1. Boas-vindas: logo grande, subtítulo, ilustração de dois idosos, cartão de chamada à ação e botão azul.
2. Acesso com CPF: logotipo central, campo e botão de entrada, cartão informativo. **CPF isolado NÃO autentica:** mantenha a aparência do passo inicial e inclua verificação segura em etapa complementar.
3. Página inicial: saudação; quatro cards coloridos (vermelho pressão, verde medicamentos, laranja alimentação, azul atividade); atalho histórico.
4. Minha Pressão — entrada: descrição, três cartões coloridos com digitação, foto e histórico, dica inferior.
5. Minha Pressão — digitação: campos sistólica/diastólica, botão salvar e caixa de confirmação da conversão de formato informal.
6. Minha Pressão — foto: câmera/galeria, região central com exemplo do aparelho e ações azuis.
7. Minha Pressão — resultado: sucesso, valor em card, data, botão histórico e novo registro.
8. Minha Pressão — histórico: abas de período, legenda, gráfico de duas séries e lista de medições.
9. Meus Medicamentos: linhas de medicamentos, dose, horários, botões de confirmação e rodapé.
10. Notificação de medicamento: representação do estilo mostrado; **o alerta real deve usar notificações nativas do SO**.
11. Minha Alimentação — foto: cabeçalho, imagem de refeição, câmera, galeria e histórico de avaliações.
12. Resultado da alimentação: bloco verde ilustrativo, classificação, itens identificados e orientação; **não exiba análise inventada como IA**.

### 4B. Atividade Física — 12 telas do painel `03_atividade_fisica.png`

1. Página inicial com acesso à Atividade Física; 2. Entrada com ilustração de idosos; 3. Como você está hoje?; 4. Verificação da pressão; 5. Suas informações; 6. Sua atividade de hoje; 7. Passo a passo do exercício; 8. Vídeo demonstrativo; 9. Alternativa mais leve; 10. Registro da atividade; 11. Histórico de atividades; 12. Mensagens e orientações.

Preserve o fluxo em etapas, as seleções, o card azul de informação, a chamada visual para cuidados, os botões e a barra de navegação. A atividade NÃO deve usar regras clínicas inventadas: se ainda não houver validação da equipe, apresente o fluxo visual fiel com conteúdo educacional adequado e registre a recomendação personalizada como dependente de validação profissional.

### 4C. Plataforma web — 12 telas do painel `02_plataforma_profissional.png`

1. Login profissional com metade esquerda ilustrada e formulário à direita.
2. Painel inicial com menu lateral, cards de indicadores, pacientes recentes, pesquisa e cabeçalho.
3. Cadastro de paciente com campos à esquerda e escolha aplicativo/pulseira à direita.
4. Perfil do paciente com cabeçalho, foto, abas, cartões de resumo e registros recentes.
5. Histórico da pressão com filtros, gráfico de duas linhas e tabela.
6. Medicamentos com tabela, barras de confirmação e últimas confirmações.
7. Alimentação com galeria de fotos, etiquetas e legendas.
8. Atividade Física com tabela de registros.
9. Configuração da Pulseira Pulso em Dia com status verdadeiro e tabela de lembretes.
10. Registro do Diário (pulseira) com linhas de medições transcritas e ações.
11. Resumo da Consulta de Enfermagem com campos e objetivos/orientações.
12. Histórico de Consultas com tabela e botão nova consulta.

### 4D. Estratégia verificável para atingir fidelidade visual

1. Abra **cada recorte individual** de `referencias_codex/telas/` e liste os elementos existentes, começando pela tela de login web, início mobile e cadastro do paciente.
2. Crie uma identidade visual reutilizável baseada nas imagens: tokens para cores, tipografia, radius, sombras, spacing, ícones, estados e componentes. Não use números arbitrários diferentes entre telas equivalentes.
3. Implemente cada tela real (sem screenshot de fundo) reproduzindo a referência o mais exatamente possível.
4. Rode o projeto e capture screenshots: web via navegador/Playwright; mobile via emulador Expo/Android/iOS disponível ou captura real quando houver dispositivo. Se o ambiente não tiver emulador, descreva a limitação e prepare os comandos para o usuário capturar em um dispositivo; não afirme que comparou screenshots inexistentes.
5. Compare visualmente **referência vs. implementação**, lado a lado, na mesma proporção de tela. Ajuste margens, tamanhos, cores, fontes, ícones, larguras e posicionamento; repita até não haver diferenças relevantes. Use comparação automatizada de imagem onde aplicável, mas examine manualmente textos e fluxo.
6. Registre em `docs/FIDELIDADE_VISUAL.md` uma tabela de 36 telas com: arquivo implementado, referência, status, screenshot capturada, diferenças encontradas e correções aplicadas.
7. Quando um elemento gráfico exato (ex.: ilustração de idosos, fotografia da refeição ou fonte original) não estiver disponível como recurso isolado, **não finja que copiou exatamente**. Extraia/prepare recurso legítimo quando adequado, ou use recurso substituto apenas marcando a pendência e identifique claramente a diferença visual. Os painéis PNG são referências compostas, não arquivos editáveis de Figma.

**Dados da demo:** números, nomes, gráficos, fotos e textos presentes nos mockups são exemplificativos. Preserve a apresentação visual, mas conecte componentes a registros reais de teste/sintéticos que o backend forneça. Não deixe informações fixas na tela fingindo ser dado de um paciente autenticado. Telas de carregamento, vazio, erro e sucesso devem seguir o mesmo padrão visual.

## 5. FUNCIONALIDADE REAL E REGRAS DA APLICAÇÃO PERMANECEM

Não remova escopo nem degrade funcionalidades para ganhar fidelidade visual. Ainda são exigidos:

- Backend Java 21 + Spring Boot, banco PostgreSQL, migrations e endpoints protegidos.
- Web Next.js + TypeScript para profissionais, Mobile Expo + TypeScript para pacientes.
- Autenticação e autorização reais; senha com hash; CPF nunca é prova de identidade.
- Cadastro e vínculo paciente-profissional; modalidades aplicativo ou pulseira/diário.
- Pressão manual e foto com OCR, confirmação antes de salvar, histórico e gráficos.
- Medicamentos prescritos/cadastrados por profissional, lembretes locais e autorrelatos.
- Alimentação com foto e análise educativa apenas se serviço realmente configurado; se faltar IA, sinalize indisponibilidade sem resultado inventado.
- Atividade Física guiada e registros respeitando regras clínicas aprovadas; nunca inventar contraindicações ou tratamentos.
- Consultas, resumo de enfermagem e transcrição do diário com autor/origem/hora.
- Offline e sincronização idempotente; armazenamento adequado de dados sensíveis.
- Pulseira com módulo e integração preparada, **sem declarar hardware real integrado enquanto não houver protocolo e teste**.
- Testes de autorização, unidades, integração, builds e fluxos ponta a ponta, com evidências.

**Infraestrutura inalterada:** Railway Hobby (Java), Vercel Hobby (web), Supabase Free (PostgreSQL/storage privado) e Expo/EAS Free (builds), com limites e políticas existentes. Não faça deploy ou gere custos sem autorização.

## 6. ORDEM DE EXECUÇÃO: NÃO RESPONDER APENAS COM PLANO

Execute em pequenos lotes, mas **comece alterando arquivos imediatamente**:

**Lote 1 — Auditoria e estrutura:** identificar estrutura real do ZIP e do Viva+, criar tabela de equivalências, preparar backup/checkpoint seguro, migrar gradualmente pastas para o modelo-alvo, ajustar imports e garantir build/lint/testes.

**Lote 2 — Português consistente:** traduzir nomes internos de domínio e telas, classes e métodos próprios, DTOs/contratos sob nosso controle, mantendo compatibilidade e testes.

**Lote 3 — Fidelidade visual das telas já existentes:** corrigir primeiro as telas mais diferentes dos protótipos; começar com login web, painel inicial web e início mobile; capturar e comparar screenshots.

**Lote 4 — Implementar as telas restantes e conectar:** percorrer todas as 36 referências, reproduzir os layouts com componentes reais e conectar aos fluxos persistidos.

**Lote 5 — Validação final:** rodar backend, web e mobile; executar testes, revisar segurança, acessibilidade, navegação e comparação visual; atualizar documentação e registrar bloqueios reais.

A cada lote, atualize `docs/STATUS.md`, `docs/PROXIMA_EXECUCAO.md` e `docs/FIDELIDADE_VISUAL.md`. Não pare entre lotes para pedir minha confirmação, exceto para credenciais, custo, publicação externa, decisões clínicas/jurídicas, perda irreversível de dados ou mudança estrutural impossível sem quebrar a aplicação.

### Critérios de conclusão que devem ser demonstrados

- A estrutura de pastas do Viva+ segue o padrão do ZIP AgendAqui nos componentes comuns, com `web/` adicional para Next.js.
- Identificadores criados pela equipe estão em português, respeitadas as exceções técnicas documentadas.
- As 36 telas correspondem às referências e têm checklist de comparação visual — sem prints falsos.
- As telas são responsivas, clicáveis, acessíveis e integradas ao backend, não imagens estáticas.
- Fluxo validado: profissional cadastra paciente sintético → paciente entra pelo celular → profissional agenda medicamento → paciente vê lembrete → paciente registra pressão → profissional vê no painel; garantir restrições de acesso.
- Builds e testes realmente executados; pendências de hardware, IA, contas de loja, validação clínica e aprovações externas honestamente indicadas.
- **Não anuncie “idêntico”, “100% funcional” ou “pronto para produção” sem comprovação e sem declarar as diferenças remanescentes.**

## AGORA

Leia imediatamente as referências do repositório. Faça uma auditoria objetiva, **inicie a refatoração do código existente em vez de criar novo projeto**, e prossiga com a execução. Sua primeira resposta pode resumir o que encontrou, mas **não encerre só com um planejamento**: modifique arquivos, rode verificações e continue até a conclusão ou até um bloqueio real do ambiente.

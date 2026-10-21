# VIVA+ — CONTINUAR DESENVOLVIMENTO, CONFIGURAR EXECUÇÃO LOCAL E CRIAR GUIA COMPLETO DE TESTES

Quero que você continue o desenvolvimento do projeto **Viva+** exatamente de onde a última execução parou.

Nesta nova etapa, tenho uma prioridade fundamental: **QUERO CONSEGUIR RODAR O PROJETO COMPLETO NA MINHA PRÓPRIA MÁQUINA, DO ZERO, E TESTAR PESSOALMENTE TODAS AS TELAS E FUNCIONALIDADES IMPLEMENTADAS ATÉ AGORA.**

Considere que estou aprendendo desenvolvimento e preciso de explicações claras, comandos prontos para copiar e instruções detalhadas.

Não quero apenas um relatório técnico. Quero o projeto funcionando localmente, um guia completo de utilização e a continuação das funcionalidades que ainda estão pendentes.

---

## 1. RECUPERAR O CONTEXTO DA ÚLTIMA EXECUÇÃO

A última execução informou que foram implementados e testados:

- Cadastro e ativação de contas.
- Login.
- Home do paciente.
- Navegação pelos módulos.
- Perfil e histórico.
- Cadastro demográfico e edição de dados.
- Telefone e configurações.
- Recursos de acessibilidade.
- Visão semanal de atividades físicas.
- Integração com a API e PostgreSQL.
- Organização das 52 imagens individuais.
- Registro de 42 capturas reais das telas.

Também foram informados os seguintes resultados:

- 25 testes Java aprovados.
- 32 testes frontend aprovados.
- 11 testes E2E aprovados.
- Build Next.js aprovado.
- Exportações Expo Android/iOS/web aprovadas.

Antes de começar, consulte os documentos:

- `AGENTS.md`
- `README.md`
- `PROGRESSO.md`
- `docs/COMO_NAVEGAR.md`
- `docs/evidencias/TELAS_NAVEGAVEIS_2026-10-17.md`
- `docs/evidencias/RETOMADA_2026-10-17.md`

Verifique o estado real do projeto e não presuma que serviços ou processos iniciados anteriormente continuam em execução.

O projeto está localizado em:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais`

---

# PARTE 1 — FAZER O VIVA+ FUNCIONAR NA MINHA MÁQUINA

## 2. VERIFICAR E PREPARAR O AMBIENTE LOCAL

Meu computador utiliza Windows 11.

As principais tecnologias do projeto são:

**Backend**
- Java 21.
- Spring Boot 3.5.
- Maven Wrapper.
- PostgreSQL 18.
- Flyway.

**Frontend web**
- Next.js.
- React.
- TypeScript.

**Aplicativo**
- React Native.
- Expo.
- TypeScript.

Analise os arquivos reais do projeto e identifique todas as dependências e versões necessárias.

Verifique:

1. Instalação e versão do Java.
2. Configuração do JAVA_HOME.
3. Versão do Maven utilizada pelo projeto.
4. Instalação e versão do Node.js.
5. Gerenciador de pacotes utilizado em cada parte do projeto.
6. Instalação e funcionamento do PostgreSQL.
7. Existência do banco de dados necessário.
8. Configuração das variáveis de ambiente.
9. Existência de migrações pendentes.
10. Possíveis conflitos de portas.
11. Dependências necessárias ao Expo.
12. Configurações para executar o frontend e o backend simultaneamente.

**Importante:** anteriormente tive problemas porque o Windows utilizava Java 8 em vez de Java 21.

O JDK 21 está instalado em:

`C:\Users\joaos\.jdks\ms-21.0.10`

Verifique essa configuração e documente como corrigir a prioridade do Java no Windows e no PowerShell.

Não reinstale ferramentas que já estão funcionando sem necessidade.

## 3. CRIAR UM GUIA DE INSTALAÇÃO COMPLETO, COMEÇANDO DO ZERO

Crie o documento:

`docs/GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md`

Esse documento deve ensinar uma pessoa iniciante a iniciar o projeto inteiro.

Quero instruções detalhadas, incluindo:

### Etapa A — Abrir o projeto

- Como localizar a pasta do Viva+.
- Como abrir a pasta no VS Code.
- Como abrir o terminal correto.
- Diferença entre PowerShell e Git Bash.
- Como navegar até as pastas do backend, aplicativo e portal.
- Quais comandos devem ser executados em cada terminal.

### Etapa B — Verificar os programas instalados

Forneça os comandos para verificar:

- Java.
- Maven.
- Node.js.
- npm/pnpm, conforme utilizado.
- PostgreSQL.
- Git.
- Expo.

Explique qual resultado devo esperar e o que fazer caso alguma verificação falhe.

### Etapa C — Configurar o PostgreSQL

Explique:

- Como verificar se o PostgreSQL está em execução.
- Como acessar o banco pelo pgAdmin ou terminal.
- Como conferir o banco `vivamais`.
- Como verificar o usuário `vivamais`.
- Como configurar as credenciais de forma segura.
- Como verificar a conexão.
- Como executar as migrações Flyway existentes sem apagar dados.

Não recrie o banco nem apague tabelas existentes automaticamente.

Não inclua senhas reais no manual.

### Etapa D — Configurar o backend

Forneça os comandos PowerShell exatos, prontos para copiar, considerando o caminho real do projeto.

Explique como:

1. Entrar na pasta correta.
2. Selecionar o Java 21.
3. Configurar as variáveis de ambiente necessárias.
4. Informar a senha do PostgreSQL com segurança.
5. Executar o Maven Wrapper.
6. Inicializar o Spring Boot.
7. Verificar se a API está funcionando.
8. Identificar erros no terminal.

A API deve ser validada no endereço configurado pelo projeto.

Anteriormente foi utilizada a porta 8080.

Verifique se ela continua correta.

### Etapa E — Iniciar o portal web

Ensine como:

1. Abrir um segundo terminal.
2. Entrar na pasta correta do frontend.
3. Instalar as dependências quando necessário.
4. Configurar o endereço da API.
5. Executar o comando correto para iniciar o Next.js.
6. Abrir o portal no navegador.
7. Verificar erros de compilação ou integração.

O endereço anteriormente utilizado foi:

`http://127.0.0.1:3000/`

Confirme se ele continua correto.

### Etapa F — Iniciar o aplicativo

Ensine como:

1. Abrir um terceiro terminal.
2. Entrar na pasta correta do aplicativo Expo.
3. Verificar as dependências.
4. Inicializar o aplicativo.
5. Abrir a prévia no navegador.
6. Utilizar o Expo Go, caso o projeto seja compatível.
7. Testar no Android.
8. Entender as limitações de testes no iOS utilizando Windows.

A prévia anteriormente utilizada foi:

`http://127.0.0.1:8081/`

Confirme como iniciá-la corretamente.

Diferencie a prévia Expo Web da execução nativa em Android ou iOS.

### Etapa G — Iniciar tudo simultaneamente

Quero um exemplo prático de execução com três terminais:

TERMINAL 1 — Backend Java.

TERMINAL 2 — Portal Next.js.

TERMINAL 3 — Aplicativo Expo.

Explique:

- Qual iniciar primeiro.
- Qual comando executar em cada um.
- Quais mensagens indicam inicialização correta.
- Quais endereços abrir.
- Como verificar se todos os serviços estão conectados.
- Como encerrar os processos corretamente.

Caso seja viável, crie também um script PowerShell de inicialização local que abra os serviços necessários e faça verificações básicas, sem armazenar senhas no script.

---

# PARTE 2 — GUIA PARA TESTAR TODAS AS TELAS

## 4. CRIAR UM MANUAL COMPLETO DE NAVEGAÇÃO

Crie o arquivo:

`docs/GUIA_TESTES_TODAS_AS_TELAS.md`

Esse documento deve permitir que eu teste manualmente todas as funcionalidades existentes.

Não quero apenas uma lista dos nomes das páginas.

Quero instruções práticas explicando:

- Como chegar à tela.
- Em qual botão clicar.
- O que preencher.
- Qual ação executar.
- O que deve acontecer.
- Como identificar que a funcionalidade está correta.
- Como voltar à tela anterior.
- Como verificar a persistência no backend quando aplicável.

Identifique todas as telas existentes diretamente pelo código, pelas rotas e pelas capturas anteriores.

Não invente telas ou rotas que ainda não foram implementadas.

## 5. COMO FAZER LOGIN E CADASTRO

Existem contas de demonstração anteriormente utilizadas:

Paciente:
`paciente.a@demo.vivamais.invalid`

Profissional:
`profissional.a@demo.vivamais.invalid`

O arquivo privado com as credenciais está em:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\work\demo-credentials.json`

**Não copie as senhas para documentação versionada, logs, capturas, respostas ou arquivos públicos.**

Explique como consultar as credenciais localmente, sem divulgá-las, e como testar o acesso.

Quero instruções para testar:

- Login válido.
- Login inválido.
- Cadastro ou ativação de paciente.
- Validação de campos.
- Confirmação de cadastro.
- Redirecionamento para a Home.
- Persistência da sessão.
- Logout.
- Acesso a rotas protegidas.

Se houver cadastro por convite ou pelo profissional, respeite esse fluxo.

Utilize somente dados fictícios em testes.

## 6. TESTAR O APLICATIVO DO PACIENTE

Crie um roteiro detalhado para cada módulo realmente disponível.

### Home

Ensine como:

- Entrar na Home.
- Verificar as informações do usuário.
- Navegar pelos cards.
- Abrir cada módulo.
- Acessar a barra inferior.
- Visualizar lembretes.
- Acessar perfil e configurações.

### Minha Pressão

Testar:

- Acesso ao módulo.
- Registro manual.
- Validação dos valores.
- Registro por fotografia.
- Confirmação.
- Resultado.
- Histórico.
- Gráficos.
- Persistência.

### Meus Medicamentos

Testar:

- Listagem.
- Horários.
- Lembretes.
- Confirmação de uso.
- Histórico.
- Registros e alterações permitidas.

### Minha Alimentação

Testar:

- Acesso ao módulo.
- Registro de refeição.
- Seleção de fotografia.
- Envio para análise.
- Visualização do resultado.
- Histórico.
- Recuperação de registros anteriores.

### Atividade Física

Testar:

- Tela inicial.
- Orientações.
- Seleção de atividades.
- Como o paciente está se sentindo.
- Exercícios ilustrados.
- Passo a passo.
- Registro de realização.
- Visão semanal.
- Histórico.

### Meu Histórico

Testar:

- Acesso aos registros.
- Filtros.
- Visualização de dados anteriores.
- Indicadores de evolução.
- Navegação entre categorias.

### Perfil e configurações

Testar:

- Visualização de dados.
- Edição do perfil.
- Telefone.
- Validação de CPF.
- Configurações.
- Recursos de acessibilidade.
- Salvamento.
- Persistência após atualizar ou reabrir a aplicação.
- Logout.

Para cada tela, informe o caminho exato dentro da interface.

## 7. TESTAR O PORTAL PROFISSIONAL

Crie um roteiro específico para o portal web.

Quero testar:

- Login profissional.
- Painel inicial.
- Listagem de pacientes.
- Busca e filtros.
- Cadastro de paciente.
- Visualização do perfil.
- Edição de dados.
- Consultas.
- Histórico de saúde.
- Registros de pressão arterial.
- Medicamentos.
- Alimentação.
- Atividades físicas.
- Relatórios.
- Configurações.

Descreva apenas as funcionalidades realmente implementadas e acessíveis.

Explique como verificar se alterações feitas pelo profissional aparecem corretamente no aplicativo do paciente, quando essa integração estiver prevista.

## 8. CRIAR CHECKLIST DE VALIDAÇÃO

Crie também:

`docs/CHECKLIST_TESTES_MANUAIS.md`

Quero uma tabela com:

- Nome da tela.
- Aplicação: paciente ou profissional.
- Caminho para acessar.
- Funcionalidade testada.
- Resultado esperado.
- Campo para marcar aprovado ou reprovado.
- Campo para observações.

Organize as telas em ordem de navegação.

Inclua todas as telas identificadas no projeto.

Utilize as 42 capturas anteriormente registradas como referência, mas verifique quais representam telas distintas e quais representam estados diferentes da mesma tela.

O checklist deve permitir acompanhar o que já testei e o que ainda falta testar.

---

# PARTE 3 — GARANTIR QUE CONSIGO NAVEGAR

## 9. VALIDAR A EXECUÇÃO COMPLETA

Antes de finalizar, execute as verificações disponíveis no ambiente.

Confirme:

1. O backend inicia corretamente.
2. O PostgreSQL aceita as conexões.
3. O Flyway executa ou valida as migrações existentes.
4. O frontend inicia sem erros bloqueantes.
5. O Expo Web inicia.
6. O login do paciente funciona.
7. O paciente acessa a Home.
8. Os módulos são navegáveis.
9. O perfil pode ser acessado.
10. O login profissional funciona.
11. O portal profissional pode ser acessado.
12. Os registros persistem quando aplicável.

Teste o fluxo:

CADASTRO/ATIVAÇÃO → LOGIN → HOME → MÓDULOS → PERFIL/HISTÓRICO → LOGOUT

E, separadamente:

LOGIN PROFISSIONAL → PAINEL → PACIENTES → CADASTRO/EDIÇÃO → CONSULTAS/RELATÓRIOS

Corrija erros de navegação encontrados.

Não enfraqueça a autenticação para facilitar os testes.

Se houver uma funcionalidade indisponível por depender de integração externa, explique claramente essa limitação.

## 10. IDENTIFICAR TODAS AS TELAS IMPLEMENTADAS

Gere um inventário a partir das rotas reais do código.

Para cada tela, identifique:

- Nome.
- Rota.
- Aplicação correspondente.
- Perfil autorizado.
- Estado da implementação.
- Dependências.
- Forma de acesso.
- Captura de tela disponível.

Classifique cada tela como:

- Funcional e validada.
- Implementada, mas ainda não validada.
- Parcialmente funcional.
- Pendente de implementação.

Não confunda uma rota existente com uma tela concluída.

Caso alguma das telas anteriormente declaradas como funcionais não possa ser acessada, investigue e corrija.

## 11. CAPTURAR AS TELAS

Organize as capturas em:

`docs/evidencias/testes-manuais/`

Registre as principais telas do paciente e do profissional, quando o ambiente permitir.

Não inclua dados pessoais reais, senhas ou tokens nas capturas.

Compare as telas com os protótipos originais e documente as diferenças relevantes.

---

# PARTE 4 — CONTINUAR O DESENVOLVIMENTO

## 12. AVANÇAR NAS FUNCIONALIDADES PENDENTES

Depois de garantir que o projeto pode ser executado e testado localmente, continue o desenvolvimento a partir das pendências reais.

Priorize:

1. Telas com navegação incompleta ou funcionalidades quebradas.
2. Fluxos que ainda não persistem corretamente.
3. Melhorias de cadastro, perfil e acompanhamento.
4. Refinamentos visuais em relação aos protótipos.
5. Correções de imagens de baixa qualidade.
6. Acessibilidade para pessoas idosas.
7. Melhorias nos módulos de pressão, medicamentos, alimentação e atividade física.
8. Melhorias no portal profissional.
9. Alertas técnicos e de segurança ainda abertos.
10. Preparação para testes nativos Android e iOS.

Preserve as implementações já validadas.

Não altere a arquitetura sem necessidade.

Não execute `git reset --hard`, `git clean` ou comandos destrutivos.

Não execute commit nem push sem autorização.

Não utilize credenciais reais em arquivos versionados.

## 13. RELATÓRIO FINAL

Ao terminar, quero que você entregue:

**A. Projeto executável**
- Backend funcionando.
- Portal funcionando.
- Aplicativo Expo Web funcionando.
- Comandos exatos de inicialização.

**B. Guia para iniciantes**
- `GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md`

**C. Guia de testes**
- `GUIA_TESTES_TODAS_AS_TELAS.md`

**D. Checklist**
- `CHECKLIST_TESTES_MANUAIS.md`

**E. Inventário**
- Relação de todas as telas identificadas e seus respectivos estados.

**F. Melhorias**
- Funcionalidades corrigidas ou implementadas nesta execução.
- Arquivos alterados.
- Testes executados.
- Problemas encontrados.
- Pendências restantes.

Atualize também o `PROGRESSO.md`.

---

# INSTRUÇÃO FINAL — MUITO IMPORTANTE

Minha prioridade é conseguir abrir o Viva+ na minha máquina e testar tudo pessoalmente.

Sou iniciante e preciso de um guia que não pule etapas.

Não escreva somente comandos genéricos. Verifique os scripts e configurações reais do projeto e informe exatamente quais comandos devo copiar para cada terminal PowerShell.

Quero saber desde o momento em que ligo o computador até o momento em que consigo:

1. Iniciar o PostgreSQL.
2. Iniciar o backend.
3. Iniciar o portal web.
4. Iniciar o aplicativo.
5. Fazer login.
6. Acessar a Home.
7. Navegar por todas as telas existentes.
8. Registrar e consultar informações.
9. Testar o painel profissional.
10. Encerrar tudo corretamente.

**PRIMEIRO GARANTA QUE EU CONSIGA RODAR E TESTAR O QUE JÁ ESTÁ PRONTO. DEPOIS CONTINUE O DESENVOLVIMENTO DAS FUNCIONALIDADES PENDENTES.**

Execute as verificações possíveis, produza os três documentos solicitados e apresente um resumo simples para que eu possa começar os testes imediatamente.
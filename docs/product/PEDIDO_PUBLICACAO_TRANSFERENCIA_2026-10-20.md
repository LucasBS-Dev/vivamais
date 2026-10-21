# VIVA+ — PUBLICAÇÃO COMPLETA NO GITHUB E DOCUMENTAÇÃO TÉCNICA PARA TRANSFERÊNCIA DE DESENVOLVIMENTO

Quero que você execute uma etapa completa de consolidação, versionamento e transferência de conhecimento do projeto Viva+.

Esta tarefa possui **DOIS OBJETIVOS OBRIGATÓRIOS**:

**OBJETIVO 1 — Publicar TODO o projeto atualizado no GitHub**, incluindo aplicativo, portal profissional, backend, documentação, testes, assets e todas as alterações implementadas até o momento.

**OBJETIVO 2 — Criar uma documentação técnica extremamente completa**, permitindo que outro desenvolvedor, que nunca trabalhou neste projeto, consiga compreender tudo o que já foi implementado, configurar o ambiente, executar o sistema, realizar testes e continuar desenvolvendo todas as funcionalidades pendentes.

Não quero apenas um relatório resumido.

Quero uma documentação real, estruturada, detalhada e baseada no código existente, com procedimentos reproduzíveis.

**AUTORIZO A CRIAÇÃO DO COMMIT E O PUSH PARA O REPOSITÓRIO ESPECIFICADO NESTE PEDIDO, DESDE QUE TODAS AS VERIFICAÇÕES DE SEGURANÇA E INTEGRIDADE SEJAM REALIZADAS ANTES.**

Não autorizo alterações destrutivas no histórico, sobrescrita de trabalho de terceiros ou publicação de credenciais e dados sensíveis.

---

# PARTE 1 — IDENTIFICAR O ESTADO ATUAL DO VIVA+

## 1. Localização e repositório

Diretório do projeto:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais`

Repositório GitHub:

`https://github.com/joaosoares03/vivamais.git`

Branch principal:

`main`

Antes de começar:

1. Leia o histórico relevante da conversa.
2. Consulte `AGENTS.md`, `README.md`, `PROGRESSO.md`, `STATUS.md` e `PROXIMA_EXECUCAO.md`.
3. Leia os documentos técnicos e os relatórios das entregas anteriores.
4. Examine toda a estrutura do repositório.
5. Confira as alterações existentes no Git.
6. Identifique funcionalidades implementadas, parciais, pendentes e bloqueadas.
7. Identifique o estado das migrações, testes e integrações.
8. Verifique as alterações mais recentes realizadas após a documentação anterior.

Não utilize exclusivamente relatórios antigos. O estado atual deve ser determinado pelo código, configurações, migrações e testes realmente existentes.

Preserve todo o trabalho realizado.

---

# PARTE 2 — PUBLICAR TODO O PROJETO NO GITHUB

## 2. Verificar e organizar o Git

Execute as verificações necessárias:

- `git status`
- `git branch -a`
- `git remote -v`
- `git fetch origin`
- Comparação entre histórico local e remoto.
- Verificação dos arquivos staged e unstaged.
- Verificação de arquivos não rastreados.
- Verificação de repositórios Git aninhados.

Anteriormente, havia um repositório Git separado em `web/`, posteriormente corrigido.

Confirme que o problema não voltou.

O Viva+ deve possuir um único repositório principal contendo todos os componentes do sistema.

Não inicialize novos repositórios desnecessariamente.

Não transforme pastas em submódulos acidentalmente.

Não execute `git reset --hard`, `git clean`, `git push --force` ou qualquer operação que possa apagar ou sobrescrever trabalho.

## 3. Incluir todos os componentes

Verifique que o repositório contenha os arquivos necessários das seguintes áreas:

**Aplicativo mobile**
- `app/`
- `components/`
- `contexts/`
- `services/`
- `hooks/`
- `assets/`
- Configurações Expo.
- Recursos visuais e navegação.

**Portal profissional**
- `web/`
- Páginas.
- Componentes.
- Serviços.
- Autenticação.
- Configurações Next.js.
- Assets.
- Testes.

**Backend**
- `backend/`
- Código Java.
- Controllers.
- Services.
- Repositories.
- Entidades.
- DTOs.
- Configurações.
- Segurança.
- Migrações Flyway.
- Documentação OpenAPI.
- Maven Wrapper.

**Estrutura compartilhada**
- `packages/`
- Contratos.
- Tipagens.
- Infraestrutura.
- Testes automatizados.
- Scripts de execução.
- Configurações do projeto.

**Documentação**
- `docs/`
- README.
- Guias de execução.
- Manuais técnicos.
- Inventário de telas.
- Pendências.
- Evidências apropriadas para versionamento.
- Instruções de contribuição.

Inclua tudo que for necessário para outra pessoa clonar e trabalhar no Viva+.

Não adicione arquivos gerados, dependências instaladas ou caches desnecessários.

## 4. Verificação rigorosa de segurança

Antes do commit, revise todo o conteúdo que será enviado.

Não publique:

- Senhas.
- Tokens de autenticação.
- Chaves privadas.
- Credenciais PostgreSQL.
- Credenciais SMS.
- Credenciais de IA.
- Arquivos `.env` com valores reais.
- Dados clínicos reais.
- Informações pessoais sensíveis.
- Backups privados.
- Bancos locais.
- Arquivos criptográficos privados.
- Logs sensíveis.
- Credenciais de contas de teste.
- Arquivos temporários.
- Pastas de dependências e compilação.

Existe um diretório privado de trabalho fora do repositório:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\work`

Não incorpore esse diretório ao GitHub.

Revise o `.gitignore` e faça os ajustes necessários.

Verifique também arquivos já rastreados e o histórico Git, pois o `.gitignore` não protege automaticamente arquivos versionados anteriormente.

Se encontrar credenciais comprometidas, interrompa o push até que o problema seja tratado e documente a necessidade de rotação.

Não reescreva histórico Git sem minha autorização específica.

Não exponha segredos no relatório de execução.

---

# PARTE 3 — DOCUMENTAÇÃO GERAL DE TODO O PROJETO

## 5. Criar um manual técnico principal

Crie ou atualize:

`docs/MANUAL_TECNICO_COMPLETO_VIVAMAIS.md`

Esse será o documento principal de transferência de conhecimento.

**Quero um manual que ensine tudo o que um novo desenvolvedor precisa saber para trabalhar no sistema.**

Ele deve conter:

### 5.1. Apresentação do Viva+

Explique:

- O que é o Viva+.
- Objetivo do sistema.
- Público-alvo.
- Fluxo de acompanhamento dos pacientes.
- Papel dos profissionais de saúde.
- Finalidade do portal profissional.
- Finalidade do aplicativo mobile.
- Como as diferentes partes se comunicam.

### 5.2. Tecnologias utilizadas

Documente as tecnologias e versões verificadas no projeto:

- React Native.
- Expo.
- React.
- Next.js.
- TypeScript.
- Java 21.
- Spring Boot.
- Maven.
- PostgreSQL.
- Flyway.
- Bibliotecas de autenticação.
- Bibliotecas de imagens.
- Recursos de OCR.
- Dependências de serviços externos.
- Ferramentas de testes.

Explique a finalidade de cada tecnologia dentro do Viva+.

### 5.3. Arquitetura do sistema

Descreva a arquitetura completa.

Inclua:

- Aplicativo mobile.
- Portal web.
- Backend.
- Banco de dados.
- Serviços.
- Autenticação.
- Armazenamento de arquivos.
- Processamento de imagens.
- Integrações externas.
- Comunicação entre componentes.

Crie diagramas de arquitetura e fluxos de dados, preferencialmente usando Mermaid quando apropriado.

### 5.4. Estrutura de pastas

Apresente a estrutura real do projeto.

Para cada pasta importante, explique:

- Para que serve.
- Quais arquivos contém.
- Qual funcionalidade implementa.
- Como se relaciona com outras pastas.
- Onde criar novos arquivos.
- Onde alterar funcionalidades existentes.

Não quero apenas uma árvore de diretórios.

Quero a explicação técnica da organização do código.

---

# PARTE 4 — DOCUMENTAR TUDO O QUE JÁ FOI DESENVOLVIDO

## 6. Criar inventário completo das funcionalidades

Crie:

`docs/INVENTARIO_COMPLETO_FUNCIONALIDADES.md`

Examine todo o código e documente as funcionalidades existentes.

Inclua:

### Aplicativo do paciente

- Acesso com CPF e data de nascimento.
- Ativação com código de quatro dígitos.
- Autorização de dispositivos.
- Home.
- Perfil.
- Configurações.
- Pressão arterial.
- Medicamentos.
- Alimentação.
- Atividades físicas.
- Histórico.
- Lembretes.
- Mensagens.
- Acessibilidade.
- Funcionamento offline.
- Sincronização.
- Notificações.

### Portal profissional

- Login.
- Painel inicial.
- Cadastro de pacientes.
- Validação de CPF.
- Telefone.
- Ativação do paciente.
- Envio de SMS, conforme implementação real.
- Listagem de pacientes.
- Busca.
- Filtros.
- Edição de dados.
- Ficha do paciente.
- Consultas.
- Relatórios.
- Histórico.
- Preferências.
- Configurações.
- Gestão de vínculos.

### Backend

- Autenticação.
- Autorização.
- Sessões.
- Controle de dispositivos.
- Cadastro.
- Validações.
- Persistência.
- APIs.
- Segurança.
- Serviços.
- Integrações.
- Processamento de arquivos.
- Migrações.
- Backup.

Para cada funcionalidade, informe:

1. Nome.
2. Objetivo.
3. Como funciona.
4. Arquivos responsáveis.
5. Endpoints utilizados.
6. Tabelas envolvidas.
7. Fluxo de execução.
8. Estado atual.
9. Testes existentes.
10. Limitações conhecidas.

Classifique:

- Concluída e testada.
- Implementada parcialmente.
- Implementada sem validação suficiente.
- Pendente.
- Bloqueada por dependência externa.

**Não considere concluída uma funcionalidade apenas porque uma tela ou endpoint existe.**

---

# PARTE 5 — DOCUMENTAR COMO CADA FUNCIONALIDADE FOI IMPLEMENTADA

## 7. Criar um guia técnico de implementação

Crie:

`docs/COMO_FORAM_IMPLEMENTADAS_AS_FUNCIONALIDADES.md`

Este documento é muito importante.

O outro desenvolvedor precisa compreender como o sistema foi construído para seguir os mesmos padrões.

Para cada módulo principal, apresente um passo a passo técnico explicando:

1. Onde a implementação começa.
2. Qual tela ou componente é utilizado.
3. Qual serviço frontend recebe a ação.
4. Qual requisição HTTP é realizada.
5. Qual endpoint backend recebe a requisição.
6. Qual Controller processa a solicitação.
7. Qual Service executa a lógica.
8. Qual Repository acessa o banco.
9. Quais tabelas armazenam os dados.
10. Qual resposta retorna ao frontend.
11. Como o resultado é exibido ao usuário.
12. Quais validações são realizadas.
13. Quais permissões são verificadas.
14. Quais erros podem acontecer.
15. Como testar a funcionalidade.

Inclua exemplos reais, pequenos trechos relevantes de código e referências aos arquivos existentes.

Não reescreva arquivos inteiros desnecessariamente dentro da documentação.

Demonstre os padrões existentes usando funcionalidades reais.

Quero que outro desenvolvedor consiga seguir esses exemplos para implementar novos módulos sem comprometer a arquitetura.

---

# PARTE 6 — GUIA COMPLETO DE INSTALAÇÃO E EXECUÇÃO

## 8. Criar manual de configuração do ambiente

Crie ou atualize:

`docs/GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md`

Considere Windows 11.

Explique desde o início:

### Ferramentas

- Como instalar ou verificar Java 21.
- Como configurar JAVA_HOME.
- Como verificar Maven.
- Como instalar ou verificar Node.js.
- Como configurar o gerenciador de pacotes utilizado.
- Como instalar ou verificar PostgreSQL.
- Como utilizar VS Code ou IntelliJ.
- Como utilizar Git.
- Como trabalhar com Expo.

### Banco de dados

Explique:

- Qual PostgreSQL o projeto utiliza atualmente.
- Usuário e nome do banco.
- Porta.
- Como iniciar o serviço.
- Como configurar credenciais.
- Como verificar conexão.
- Como executar migrações Flyway.
- Como consultar tabelas.
- Como realizar backup.
- Como restaurar em banco isolado.

Verifique a configuração real. O projeto já utilizou PostgreSQL portátil 17.9 na porta 55432 e outra instalação PostgreSQL 18 na porta 5432.

Não confunda os dois ambientes.

Não inclua senhas reais na documentação.

### Backend

Inclua comandos exatos para:

- Abrir a pasta.
- Selecionar Java 21.
- Configurar variáveis.
- Instalar dependências quando necessário.
- Compilar.
- Executar Spring Boot.
- Verificar a API.
- Identificar erros.

### Frontend web

Inclua:

- Pasta correta.
- Comandos de instalação.
- Configurações necessárias.
- Inicialização.
- Build.
- Testes.
- Endereço de acesso.

### Aplicativo

Inclua:

- Pasta correta.
- Expo.
- Instalação de dependências.
- Inicialização.
- Expo Web.
- Android.
- iOS.
- Limitações de execução nativa no Windows.

### Inicialização completa

Explique como executar todos os serviços simultaneamente.

Verifique o funcionamento do script:

`Iniciar-VivaMais.cmd`

Inclua também os comandos manuais para iniciar separadamente:

- PostgreSQL.
- Backend.
- Portal.
- Aplicativo.

Documente os endereços reais, portas e verificações de saúde.

Explique como encerrar os processos corretamente.

---

# PARTE 7 — GUIA COMPLETO DE TESTES PARA O NOVO DEV

## 9. Criar manual de testes

Crie:

`docs/MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md`

Quero uma documentação ensinando exatamente como testar o Viva+.

Não utilize apenas comandos genéricos.

Inspecione os scripts reais do projeto e registre os comandos efetivamente executáveis.

### Testes Java

Explique:

- Onde estão os testes.
- Como executar.
- Quais dependem do PostgreSQL.
- Como utilizar banco de testes separado.
- Como interpretar os resultados.
- Como analisar uma falha.

### Testes frontend

Explique:

- Testes unitários.
- Testes de componentes.
- Testes de serviços.
- Vitest.
- Verificação TypeScript.
- ESLint.
- Build Next.js.
- Export Expo.

### Testes E2E

Explique:

- Como iniciar o ambiente.
- Como preparar dados sintéticos.
- Como executar os testes.
- Como utilizar Playwright.
- Como gerar capturas.
- Como analisar falhas.
- Como repetir testes após correções.

### Testes de integração

Documente:

- API e PostgreSQL.
- Cadastro e login.
- Ativação.
- Autorização de dispositivos.
- Persistência de registros.
- Isolamento entre usuários.
- Consulta de dados.
- Armazenamento de imagens.
- Integrações externas.

### Testes específicos de autenticação

Inclua:

- CPF válido e inválido.
- Data de nascimento.
- Código de quatro números.
- Código expirado.
- Limites de tentativas.
- Reenvio.
- SMS, se implementado.
- Dispositivo autorizado.
- Dispositivo desconhecido.
- Revogação de sessão.
- Acesso profissional.
- Acesso não autorizado.

Diferencie testes com provedor simulado dos testes com serviço externo real.

### Testes manuais

Crie roteiros para:

- Aplicativo do paciente.
- Portal profissional.
- Todos os módulos existentes.
- Cadastro.
- Configurações.
- Histórico.
- Consultas.
- Relatórios.
- Navegação.
- Responsividade.
- Acessibilidade.

Para cada teste manual, documente:

1. Pré-requisitos.
2. Como acessar.
3. O que preencher.
4. Qual botão utilizar.
5. Resultado esperado.
6. Como verificar persistência.
7. Como registrar uma falha.

### Evidências

Explique como gerar:

- Capturas de tela.
- Logs sanitizados.
- Relatórios de testes.
- Comparações visuais.
- Evidências de regressão.

Não inclua senhas ou dados reais nos arquivos de evidência.

---

# PARTE 8 — BANCO DE DADOS E MIGRAÇÕES

## 10. Criar documentação do PostgreSQL

Crie:

`docs/ARQUITETURA_BANCO_DADOS.md`

Documente:

- Bancos e schemas utilizados.
- Tabelas principais.
- Campos relevantes.
- Chaves.
- Relacionamentos.
- Índices.
- Restrições.
- Políticas RLS, quando existentes.
- Separação entre pacientes e instituições.
- Armazenamento de arquivos.
- Criptografia.
- Autenticação.
- Registros de saúde.
- Preferências.
- Dispositivos.
- Ativação.

Documente todas as migrações Flyway encontradas.

A última implantação conhecida chegou à V8, mas verifique se existem migrações posteriores.

Explique:

- O que cada migração implementou.
- Quais tabelas foram criadas ou modificadas.
- Como criar uma nova migração.
- Como testar.
- Como evitar conflitos.
- Como realizar backup.
- Como executar restauração segura.
- O que nunca modificar em uma migração já aplicada.

Não altere dados ou schemas do banco principal somente para criar a documentação.

---

# PARTE 9 — LEVANTAMENTO DE TODAS AS PENDÊNCIAS

## 11. Auditar tudo o que ainda precisa ser desenvolvido

Crie ou atualize:

`docs/LEVANTAMENTO_COMPLETO_PENDENCIAS.md`

Compare:

- Requisitos originais.
- Protótipos.
- Código.
- API.
- Banco.
- Testes.
- Documentação.
- Relatórios anteriores.

Identifique tudo o que ainda não está implementado, não está validado ou depende de terceiros.

Inclua pendências de:

**Aplicativo**
- Telas.
- Navegação.
- Funcionalidades.
- Acessibilidade.
- Offline.
- Sincronização.
- Notificações.
- Android e iOS.

**Portal**
- Páginas.
- Cadastro.
- Gestão de pacientes.
- Consultas.
- Relatórios.
- Configurações.
- Permissões.

**Backend**
- APIs.
- Regras de negócio.
- Validações.
- Integrações.
- Segurança.
- Persistência.
- Auditoria.

**Infraestrutura**
- Hospedagem.
- HTTPS.
- Monitoramento.
- Backup.
- CI/CD.
- Builds de produção.
- Publicação.

**Segurança**
- Vulnerabilidades.
- Controle de acesso.
- Proteção de dados.
- Conformidade LGPD.
- Gestão de credenciais.
- Segurança de dispositivos.

**Integrações**
- SMS.
- Consulta oficial de CPF, quando autorizada.
- IA.
- OCR.
- Pulseiras e dispositivos.
- Fornecedores externos.

Não considere a existência matemática de um CPF equivalente à confirmação oficial da identidade do paciente.

Documente claramente tudo que depender de autorização, contrato ou serviço externo.

### Formato obrigatório do levantamento

Para cada pendência, informe:

- Identificador.
- Módulo.
- Descrição.
- Problema atual.
- Comportamento esperado.
- Prioridade.
- Complexidade estimada.
- Dependências.
- Arquivos envolvidos.
- APIs envolvidas.
- Banco de dados envolvido.
- Responsável sugerido.
- Critérios de aceite.
- Testes necessários.

Não quero pendências genéricas como "melhorar módulo de medicamentos".

Quero tarefas suficientemente detalhadas para um desenvolvedor executar.

---

# PARTE 10 — MANUAL PASSO A PASSO DAS IMPLEMENTAÇÕES PENDENTES

## 12. Criar um roteiro técnico de continuidade

Crie:

`docs/PLANO_TECNICO_CONTINUIDADE_DESENVOLVIMENTO.md`

Este será o principal documento de trabalho do outro desenvolvedor.

Para cada pendência importante:

1. Explique o objetivo.
2. Mostre como a funcionalidade está atualmente.
3. Identifique os arquivos que precisarão ser modificados.
4. Indique os componentes que deverão ser reutilizados.
5. Explique quais novos componentes poderão ser necessários.
6. Documente alterações no backend.
7. Descreva os endpoints envolvidos.
8. Indique alterações no banco.
9. Explique como integrar com os serviços existentes.
10. Inclua as regras de validação.
11. Identifique os riscos de segurança.
12. Descreva testes que deverão ser criados.
13. Explique como executar os testes.
14. Defina critérios objetivos de conclusão.

Organize tudo em uma sequência de implementação recomendada.

Identifique dependências entre tarefas para evitar desenvolver recursos fora de ordem.

**Quero um manual tão claro que o outro DEV consiga escolher uma pendência, localizar os arquivos e começar a implementação seguindo as instruções.**

Quando uma decisão técnica ainda não tiver sido tomada, apresente opções e identifique a decisão pendente, sem inventar uma arquitetura definitiva.

---

# PARTE 11 — TRANSFERÊNCIA DOS MÓDULOS DE EXERCÍCIOS E IA

## 13. Documentação específica para os responsáveis

Os módulos de exercícios físicos e inteligência artificial ficarão sob responsabilidade de outro desenvolvedor.

Revise e atualize:

`docs/TRANSFERENCIA_DEV_EXERCICIOS.md`

`docs/TRANSFERENCIA_DEV_INTELIGENCIA_ARTIFICIAL.md`

### Exercícios físicos

Documente:

- Telas existentes.
- Catálogo de exercícios.
- Planejamento semanal.
- Registro das atividades.
- Orientações.
- Vídeos.
- Histórico.
- Integração com profissionais.
- Regras clínicas pendentes.
- APIs.
- Tabelas.
- Arquivos.
- Componentes.
- Testes.

### Inteligência Artificial e OCR

Documente:

- Tecnologias existentes.
- Reconhecimento de imagens.
- OCR de pressão arterial.
- Análise alimentar.
- Upload.
- Armazenamento.
- Processamento.
- Provedores.
- Contratos.
- Respostas.
- Tratamento de erros.
- Segurança e privacidade.
- Limitações.
- Testes.

Para ambos, detalhe tudo o que já está implementado, o que falta, como continuar e como validar a entrega.

Não implemente novas funcionalidades específicas desses módulos nesta execução.

O objetivo é preparar sua transferência.

---

# PARTE 12 — PADRÕES DE DESENVOLVIMENTO

## 14. Criar guia de boas práticas do projeto

Crie:

`docs/PADROES_DESENVOLVIMENTO_VIVAMAIS.md`

Explique os padrões efetivamente utilizados:

- Organização de arquivos.
- Nomenclatura em português.
- Componentização.
- Reutilização de código.
- Criação de telas.
- Serviços frontend.
- Controllers Java.
- Services Java.
- Repositories.
- DTOs.
- Contratos TypeScript.
- Validação.
- Tratamento de erros.
- Autenticação.
- Autorização.
- Acessibilidade.
- Responsividade.
- Testes.
- Migrações.
- Versionamento.

Inclua exemplos concretos baseados em implementações existentes.

Explique o procedimento recomendado para adicionar uma nova funcionalidade de ponta a ponta.

### Exemplo de fluxo de trabalho

1. Ler o requisito.
2. Identificar componentes existentes.
3. Definir contrato de API.
4. Implementar persistência quando necessária.
5. Implementar backend.
6. Implementar frontend.
7. Integrar autenticação e permissões.
8. Criar testes.
9. Validar manualmente.
10. Atualizar documentação.
11. Revisar código.
12. Preparar commit em branch apropriada.

Explique como evitar conflitos entre desenvolvedores trabalhando simultaneamente.

---

# PARTE 13 — README E NAVEGAÇÃO DA DOCUMENTAÇÃO

## 15. Atualizar o README principal

Atualize `README.md` para funcionar como porta de entrada do projeto.

Ele deverá apresentar:

- Nome e descrição.
- Tecnologias.
- Arquitetura resumida.
- Requisitos de ambiente.
- Como iniciar localmente.
- Como executar testes.
- Estrutura principal.
- Estado atual do desenvolvimento.
- Pendências relevantes.
- Links para os manuais técnicos.
- Orientações para novos desenvolvedores.

Crie também:

`docs/INDICE_DOCUMENTACAO.md`

Esse índice deverá apresentar todos os documentos disponíveis, organizados por assunto.

Não crie documentos duplicados desnecessariamente. Se já existir um manual com o mesmo propósito, prefira atualizá-lo e referenciá-lo.

Verifique se os links relativos funcionam corretamente no GitHub.

---

# PARTE 14 — TESTES ANTES DA PUBLICAÇÃO

## 16. Verificação técnica final

Depois de gerar e atualizar a documentação:

1. Verifique se os caminhos citados realmente existem.
2. Confira os comandos apresentados.
3. Verifique links internos.
4. Confira endpoints e tabelas documentados.
5. Execute os testes viáveis.
6. Verifique TypeScript.
7. Execute lint.
8. Verifique build Next.js.
9. Verifique export Expo.
10. Execute testes Java e integração quando o ambiente estiver disponível.
11. Execute testes E2E aplicáveis.
12. Faça auditoria de segurança e segredos.
13. Verifique o `.gitignore`.
14. Confira arquivos grandes e binários.
15. Verifique se a documentação contém informações sensíveis.

Diferencie:

- Testes executados nesta tarefa.
- Testes executados em entregas anteriores.
- Testes não executados.
- Testes com falha.
- Funcionalidades bloqueadas.

Não declare testes aprovados sem execução ou evidência correspondente.

Os dois alertas altos de dependências registrados anteriormente devem ser reavaliados e documentados. Não esconda vulnerabilidades apenas para permitir o push.

O repositório poderá ser versionado como código em desenvolvimento, mas isso não significa autorização para uso produtivo.

---

# PARTE 15 — COMMIT E PUSH

## 17. Publicar no GitHub

Depois que a revisão estiver concluída e não existirem bloqueios de segurança relacionados ao conteúdo do repositório:

1. Confirme o remoto correto.
2. Confirme a branch de destino.
3. Confira o histórico remoto.
4. Adicione os arquivos necessários ao stage.
5. Revise inclusões, exclusões e renomeações.
6. Verifique segredos.
7. Execute `git diff --cached --check`.
8. Crie um commit descritivo.
9. Envie para o GitHub.
10. Confirme a publicação.

Mensagem sugerida:

`docs: consolida projeto Viva Mais e transferencia tecnica`

Caso existam modificações de código ainda não versionadas, utilize uma mensagem de commit que represente adequadamente o conjunto de alterações.

**Não faça force push.**

Caso a branch remota contenha alterações incompatíveis ou trabalho de terceiros que impeçam um envio seguro, interrompa e solicite minha orientação.

## 18. Verificar a publicação

Após o push:

- Confirme que o commit está disponível no GitHub.
- Confirme que `app/` está publicado.
- Confirme que `web/` contém seus arquivos internos.
- Confirme que `backend/` está publicado.
- Confirme que as migrações estão presentes.
- Confirme que os contratos e testes estão presentes.
- Confirme que os assets necessários estão presentes.
- Confirme que os scripts estão presentes.
- Confirme que toda a documentação está disponível.
- Confirme que arquivos privados ficaram excluídos.

Apresente a URL final do repositório e o identificador do commit publicado.

Não altere a visibilidade do repositório.

Não publique a aplicação em servidores, lojas ou serviços externos. O objetivo é publicar o código-fonte no GitHub.

---

# PARTE 16 — RELATÓRIO FINAL DE ENTREGA

## 19. Criar relatório de consolidação

Crie:

`docs/RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md`

Inclua:

### Publicação
- Branch.
- Repositório.
- Commit.
- Data.
- Arquivos incluídos.
- Arquivos excluídos por segurança.
- Resultado do push.
- Estado final do Git.

### Desenvolvimento
- Estado geral do Viva+.
- Funcionalidades concluídas.
- Funcionalidades parciais.
- Funcionalidades pendentes.
- Principais limitações.

### Arquitetura
- Tecnologias.
- Componentes.
- Banco.
- APIs.
- Integrações.

### Testes
- Testes executados.
- Resultados.
- Falhas.
- Limitações.

### Segurança
- Auditoria.
- Pendências.
- Riscos.
- Bloqueios para produção.

### Transferência
- Documentos criados.
- Documentos atualizados.
- Ordem recomendada de leitura.
- Primeiras tarefas recomendadas para o outro desenvolvedor.

---

# RESULTADO FINAL OBRIGATÓRIO

Quero encerrar esta tarefa com:

**1. TODO O PROJETO VIVA+ PUBLICADO NO GITHUB.**

**2. README PRINCIPAL ATUALIZADO.**

**3. MANUAL TÉCNICO COMPLETO DO SISTEMA.**

**4. INVENTÁRIO DE TUDO O QUE JÁ FOI DESENVOLVIDO.**

**5. EXPLICAÇÃO DE COMO AS FUNCIONALIDADES FORAM IMPLEMENTADAS.**

**6. GUIA DO ZERO PARA CONFIGURAR O AMBIENTE.**

**7. MANUAL COMPLETO PARA EXECUTAR OS TESTES.**

**8. DOCUMENTAÇÃO DA ARQUITETURA E DO BANCO DE DADOS.**

**9. LEVANTAMENTO DE TODAS AS PENDÊNCIAS.**

**10. PLANO PASSO A PASSO PARA IMPLEMENTAR AS PENDÊNCIAS.**

**11. MANUAIS DE TRANSFERÊNCIA DE EXERCÍCIOS E IA.**

**12. GUIA DE PADRÕES DE DESENVOLVIMENTO.**

**13. ÍNDICE ORGANIZADO DA DOCUMENTAÇÃO.**

**14. RELATÓRIO FINAL DE PUBLICAÇÃO E TRANSFERÊNCIA.**

## INSTRUÇÃO FINAL

Quero que você execute a tarefa completa, e não apenas diga o que deveria ser feito.

Primeiro analise o projeto real.

Depois organize e atualize a documentação.

Em seguida, execute as verificações de integridade e segurança.

Por último, publique todo o conteúdo apropriado no GitHub e confirme o resultado.

**A DOCUMENTAÇÃO PRECISA SER ESPECÍFICA DO VIVA+, NÃO UM MANUAL GENÉRICO.**

O outro desenvolvedor precisa conseguir:

- Clonar o repositório.
- Entender a arquitetura.
- Instalar as dependências.
- Configurar o PostgreSQL.
- Executar backend, portal e aplicativo.
- Fazer login no ambiente local.
- Navegar por todas as telas existentes.
- Executar testes.
- Identificar problemas.
- Entender como o código foi construído.
- Localizar os componentes.
- Identificar as pendências.
- Escolher uma tarefa.
- Implementar uma nova funcionalidade seguindo os padrões existentes.
- Validar a implementação.
- Contribuir com o projeto sem comprometer o que já funciona.

**NÃO CONSIDERE A TAREFA CONCLUÍDA APENAS COM O PUSH.**

A entrega só estará completa quando o código estiver publicado, a documentação estiver disponível no GitHub e outro desenvolvedor tiver instruções suficientes para continuar o Viva+ de forma independente.

Se encontrar um bloqueio real de publicação, preserve o trabalho, explique o impedimento e informe exatamente como solucioná-lo.

COMECE AGORA.
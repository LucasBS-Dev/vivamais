# VIVA+ — PRIORIDADE MÁXIMA: DESENVOLVER AS TELAS DO APLICATIVO E PORTAL WEB

Quero que você dê continuidade ao desenvolvimento do projeto Viva+, mas agora com uma mudança importante de prioridade.

**ATUALMENTE, NA MINHA EXPERIÊNCIA DE USO, SÓ CONSIGO ACESSAR A TELA DE LOGIN. PRECISAMOS AVANÇAR URGENTEMENTE NA CONSTRUÇÃO DAS OUTRAS TELAS.**

Não quero que o desenvolvimento fique concentrado apenas no login, backend, testes e ajustes técnicos.

**MINHA PRIORIDADE AGORA É TER UM APLICATIVO E UM PORTAL WEB COM AS PRINCIPAIS TELAS IMPLEMENTADAS, VISÍVEIS, NAVEGÁVEIS E FUNCIONAIS.**

Estou anexando também o arquivo `Viva_Mais_Imagens_Individuais.zip`, com 52 imagens individuais para utilização na interface.

## 1. ANALISAR O QUE JÁ EXISTE

Antes de implementar:

- Consulte o histórico anterior do projeto.
- Leia `AGENTS.md`, `README.md` e `PROGRESSO.md`.
- Analise as referências visuais das 36 telas.
- Verifique as rotas já criadas no React Native/Expo e no Next.js.
- Identifique quais telas realmente estão implementadas e acessíveis.
- Verifique por que atualmente só consigo utilizar a tela de login.
- Identifique possíveis problemas de navegação, autenticação ou redirecionamento que estejam impedindo o acesso às outras páginas.

**Não presuma que uma tela está pronta apenas porque o arquivo existe.**

A tela precisa ser acessível, apresentar os elementos corretos e executar suas funcionalidades.

Preserve os códigos e integrações existentes.

## 2. PRIORIDADE 1 — TELAS DE ACESSO E CADASTRO

Desenvolva e finalize o fluxo de acesso ao Viva+.

### Tela de boas-vindas
- Logo oficial do Viva+.
- Mensagem de apresentação.
- Imagem ilustrativa correspondente ao protótipo.
- Botão para entrar.
- Opção de cadastro ou ativação de conta, conforme as regras do sistema.
- Navegação funcional.

### Tela de login
- Entrada de e-mail e senha.
- Validação dos campos.
- Exibição e ocultação da senha.
- Mensagens de erro.
- Indicador de carregamento.
- Redirecionamento após autenticação.

### Tela de cadastro
- Nome completo.
- CPF.
- Data de nascimento.
- E-mail.
- Telefone.
- Dados pessoais necessários ao acompanhamento.
- Validação dos campos.
- Integração com a API.
- Persistência no PostgreSQL.
- Confirmação de cadastro.

**Importante:** preserve as regras de criação e ativação de contas já definidas no projeto. Se o cadastro de pacientes depender de convite ou de um profissional, implemente o fluxo correspondente, sem criar uma rota pública insegura que permita cadastros não autorizados.

### Recuperação de acesso
Implemente o fluxo de recuperação ou redefinição de senha, caso esteja previsto na arquitetura e nas referências.

Não crie fluxos fictícios que apenas exibam mensagens de sucesso sem executar as operações necessárias.

## 3. PRIORIDADE 2 — HOME DO PACIENTE

**ESTA É UMA DAS TELAS MAIS IMPORTANTES.**

Após o login, o paciente deve conseguir acessar a tela inicial completa do Viva+.

Implemente a Home de acordo com os protótipos originais, utilizando as novas imagens.

### Elementos da Home

- Logo e identidade visual do Viva+.
- Saudação personalizada ao paciente.
- Nome do usuário autenticado.
- Mensagem de boas-vindas.
- Ilustração correspondente à tela.
- Cards ou botões dos módulos.
- Informações resumidas do acompanhamento, quando disponíveis.
- Lembretes e registros recentes.
- Barra inferior de navegação.
- Acesso ao perfil.
- Navegação funcional entre os módulos.

### Módulos que devem aparecer

1. Minha Pressão.
2. Meus Medicamentos.
3. Minha Alimentação.
4. Atividade Física.
5. Meu Histórico.
6. Área do Profissional, quando aplicável ao perfil e às permissões.
7. Lembretes.
8. Configurações.

Utilize os ícones e imagens do novo ZIP.

A Home não pode ser apenas uma imagem estática.

**Todos os botões precisam direcionar para telas reais e acessíveis.**

## 4. PRIORIDADE 3 — CONSTRUIR AS TELAS DOS MÓDULOS

Depois de finalizar a Home, avance na implementação dos módulos.

### A. Minha Pressão

Criar ou finalizar:

- Tela inicial de pressão arterial.
- Registro manual de pressão.
- Registro por fotografia do aparelho.
- Confirmação dos valores.
- Resultado do registro.
- Histórico de medições.
- Gráfico de acompanhamento.

O registro precisa salvar e recuperar os dados corretamente.

### B. Meus Medicamentos

Criar ou finalizar:

- Tela inicial de medicamentos.
- Listagem de medicamentos.
- Cadastro ou gerenciamento, conforme as permissões.
- Horários de administração.
- Lembretes.
- Confirmação de medicamento tomado.
- Histórico de utilização.

### C. Minha Alimentação

Criar ou finalizar:

- Tela inicial de alimentação.
- Registro de refeições.
- Captura e seleção de fotografias.
- Envio para análise alimentar.
- Tela de resultado da análise.
- Histórico de refeições.

Preserve a integração com a API já implementada.

### D. Atividade Física

Criar ou finalizar:

- Tela inicial de atividades físicas.
- Como está se sentindo hoje.
- Escolha de exercícios.
- Orientações.
- Passo a passo das atividades.
- Telas individuais dos exercícios.
- Registro de atividade realizada.
- Visão semanal.
- Histórico de atividades.

Utilize principalmente as novas ilustrações de idosos realizando exercícios.

### E. Meu Histórico

Implementar:

- Tela de histórico geral.
- Registros de pressão arterial.
- Medicamentos.
- Alimentação.
- Atividades físicas.
- Indicadores de evolução.
- Gráficos quando previstos.
- Navegação e filtros.

### F. Perfil e configurações

Implementar:

- Visualização de dados pessoais.
- Edição das informações permitidas.
- Atualização dos dados.
- Configurações do usuário.
- Preferências e acessibilidade.
- Sair da conta.

## 5. PRIORIDADE 4 — PORTAL WEB PROFISSIONAL

Não quero que o portal Next.js permaneça limitado ao login.

Após autenticar, o profissional deverá acessar uma área inicial funcional.

Implemente ou finalize:

### Home/Painel profissional
- Menu de navegação.
- Visão geral dos pacientes.
- Indicadores de acompanhamento.
- Informações resumidas.
- Acesso às funcionalidades do portal.

### Cadastro de pacientes
- Formulário completo.
- CPF e demais informações necessárias.
- Validações.
- Integração com a API.
- Persistência no banco.

### Gerenciamento de pacientes
- Listagem.
- Busca.
- Filtros.
- Visualização de detalhes.
- Edição de informações.
- Histórico de acompanhamento.

### Outras páginas
- Consultas.
- Registros de saúde.
- Relatórios.
- Acompanhamento e evolução.
- Configurações do profissional.

Respeite as permissões de acesso e a separação entre paciente e profissional.

## 6. UTILIZAR AS 52 NOVAS IMAGENS DO ZIP

Estou fornecendo o arquivo:

`Viva_Mais_Imagens_Individuais.zip`

Quero que você:

1. Extraia e organize as imagens no projeto.
2. Substitua os assets antigos que perderam qualidade.
3. Atualize o aplicativo e o portal quando apropriado.
4. Utilize os personagens, exercícios, logos e ilustrações nas telas correspondentes.
5. Preserve as proporções.
6. Evite esticar, distorcer ou cortar indevidamente as imagens.
7. Utilize componentes responsivos.
8. Prefira ícones vetoriais quando os ícones do ZIP não tiverem nitidez suficiente.

Os logos devem manter a melhor resolução disponível.

Alguns arquivos do ZIP foram ampliados a partir de imagens menores, portanto avalie a nitidez antes de utilizá-los em grandes dimensões.

Não use imagens pixeladas em destaque.

## 7. SEGUIR AS 36 REFERÊNCIAS VISUAIS ORIGINAIS

As telas não devem ter um design genérico.

Quero que sejam implementadas respeitando os protótipos anteriores, especialmente:

- Distribuição dos elementos.
- Tipografia.
- Cores.
- Imagens.
- Botões.
- Ícones.
- Navegação.
- Espaçamentos.
- Componentes visuais.
- Identidade do Viva+.

Adapte corretamente as telas para diferentes resoluções.

Considere que o aplicativo será utilizado principalmente por pacientes, incluindo pessoas idosas.

Priorize legibilidade, acessibilidade e facilidade de navegação.

## 8. IMPLEMENTAR NAVEGAÇÃO REAL

Este ponto é obrigatório.

Atualmente, meu principal problema é conseguir visualizar apenas a tela de login.

Portanto:

- Verifique o funcionamento das rotas.
- Corrija redirecionamentos incorretos.
- Implemente as telas que ainda não existem.
- Garanta o acesso à Home após autenticação.
- Garanta que a Home permita abrir os módulos.
- Implemente corretamente o retorno entre telas.
- Mantenha a sessão autenticada conforme as regras existentes.
- Não permita acesso indevido a rotas protegidas.
- Diferencie corretamente os fluxos de paciente e profissional.

Se houver bloqueios na criação de contas, utilize um fluxo de demonstração autorizado e documentado para testar a navegação, sem enfraquecer a autenticação.

**Não quero botões decorativos que não executam nenhuma ação.**

## 9. NÃO IMPLEMENTAR APENAS TELAS DE APARÊNCIA

Todas as telas deverão ter o máximo possível de funcionalidade real.

Integre os fluxos à estrutura existente:

- React Native e Expo.
- Next.js.
- TypeScript.
- Java 21.
- Spring Boot.
- PostgreSQL.
- Flyway.

Se alguma funcionalidade ainda depender de uma integração externa não aprovada, apresente um estado informativo apropriado e registre essa limitação.

Não finja que integrações indisponíveis estão funcionando.

## 10. ORDEM OBRIGATÓRIA DE EXECUÇÃO

Quero que você avance na seguinte ordem:

**ETAPA 1 — ACESSO**
- Verificar login existente.
- Implementar boas-vindas.
- Implementar cadastro/ativação.
- Validar navegação e autenticação.

**ETAPA 2 — HOME**
- Implementar a Home do paciente.
- Implementar o painel principal do profissional.
- Garantir navegação real após autenticação.

**ETAPA 3 — MÓDULOS**
- Pressão arterial.
- Medicamentos.
- Alimentação.
- Atividade física.
- Histórico.
- Perfil e configurações.

**ETAPA 4 — REFINAMENTO VISUAL**
- Integrar as novas imagens.
- Comparar com os protótipos.
- Corrigir diferenças.
- Verificar responsividade e acessibilidade.

**ETAPA 5 — VALIDAÇÃO**
- Executar testes.
- Validar os fluxos completos.
- Capturar imagens das telas.
- Corrigir erros encontrados.
- Atualizar o progresso.

Trabalhe progressivamente e conclua conjuntos funcionais completos.

Não encerre a execução somente porque uma tela foi criada.

## 11. DEMONSTRAÇÃO DAS TELAS

Ao finalizar, quero conseguir abrir o projeto e navegar por todas as principais telas.

Disponibilize os endereços locais utilizados no ambiente de desenvolvimento.

Quando possível, capture e organize evidências das telas:

- Boas-vindas.
- Cadastro.
- Login.
- Home.
- Pressão arterial.
- Medicamentos.
- Alimentação.
- Atividade física.
- Histórico.
- Perfil.
- Painel profissional.
- Cadastro e listagem de pacientes.

Quero conseguir verificar visualmente a evolução do projeto.

Se uma página não estiver acessível, corrija o problema ou informe exatamente o bloqueio.

## 12. PRESERVAÇÃO DO PROJETO

Não reinicie o projeto.

Não descarte alterações locais.

Não execute comandos Git destrutivos.

Não faça commit nem push sem minha autorização.

Preserve as migrações do banco e os dados existentes.

Não exponha senhas ou informações pessoais.

Mantenha os nomes da interface em português brasileiro.

Atualize o `PROGRESSO.md` com o trabalho realizado.

## INSTRUÇÃO FINAL — PRIORIDADE ABSOLUTA

**QUERO VER O VIVA+ EVOLUINDO VISUALMENTE E FUNCIONALMENTE.**

Atualmente só consigo utilizar a tela de login. Preciso que você desenvolva as outras telas para que seja possível navegar pelo aplicativo e pelo portal.

Sua primeira grande entrega deve ser:

**LOGIN → CADASTRO/ATIVAÇÃO → HOME → MÓDULOS PRINCIPAIS → PERFIL/HISTÓRICO.**

Não gaste a maior parte desta execução apenas com relatórios, refatorações internas ou melhorias técnicas que não desbloqueiem as telas.

Implemente primeiro os fluxos visíveis essenciais, mantendo a segurança e a estabilidade.

Depois avance nas demais funcionalidades e melhorias visuais.

**COMECE AGORA PELA IMPLEMENTAÇÃO DAS TELAS DE CADASTRO E HOME E CONTINUE PELOS MÓDULOS SEGUINTES.**
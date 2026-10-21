# VIVA+ — RETOMAR EXECUÇÃO INTERROMPIDA, FINALIZAR ENTREGA E PREPARAR DOCUMENTAÇÃO PARA OUTRO DESENVOLVEDOR

Quero que você retome a execução anterior exatamente de onde parou, preservando todo o trabalho realizado antes de atingir o limite de utilização.

**ATENÇÃO: NÃO REINICIE O PROJETO, NÃO REFAÇA O QUE JÁ FOI CONCLUÍDO E NÃO COMECE UMA IMPLEMENTAÇÃO COMPLETAMENTE NOVA.**

Além de finalizar a execução interrompida, estou estabelecendo uma nova divisão de responsabilidades:

**Os módulos de EXERCÍCIOS FÍSICOS e INTELIGÊNCIA ARTIFICIAL serão desenvolvidos e finalizados por outro desenvolvedor.**

Portanto, quero que você mantenha essas partes organizadas e documentadas, mas não continue desenvolvendo suas funcionalidades específicas nesta execução.

Sua responsabilidade agora é:

1. Retomar e concluir o trabalho interrompido.
2. Finalizar a profissionalização do restante do sistema.
3. Preservar o funcionamento dos recursos existentes.
4. Identificar e documentar as pendências.
5. Preparar um manual técnico completo para o desenvolvedor responsável por exercícios e IA.
6. Garantir que o Viva+ continue executando corretamente.
7. Entregar um relatório final com instruções claras para continuidade.

---

## 1. RECUPERAR A EXECUÇÃO ANTERIOR

Antes de alterar qualquer arquivo, consulte o histórico desta conversa, o estado atual do projeto e a documentação de progresso.

A execução foi interrompida depois de diversas melhorias.

### Trabalho já realizado

Segundo as últimas mensagens da execução:

- Preferências de usuário passaram a ser persistidas no PostgreSQL.
- Foi implementada proteção contra conflitos de edição.
- Foram revisados os textos de acesso, cadastro, registros e páginas institucionais.
- A visão geral passou a consultar totais completos.
- Consultas e diários passaram a apresentar informações de autoria.
- Foram corrigidos dois alertas moderados de dependências.
- Permaneceram dois alertas altos sem correção disponível identificada.
- A compilação Java passou.
- Foram aprovados 31 testes Java na validação final.
- Foram aprovados 40 testes de frontend.
- O build Next.js foi concluído.
- As exportações Expo web, Android e iOS passaram.
- Os 12 percursos E2E de regressão passaram.
- A persistência das preferências entre sessões foi validada.
- Foram corrigidos estilos inline incompatíveis com a política de segurança do portal.
- Foi validado backup e restauração em banco isolado.
- As migrações V1–V7 foram verificadas no ensaio de restauração.
- Foram preservados dados, chaves e arquivos cifrados.
- Os 52 recursos visuais foram mantidos sem alterações.

### Ponto exato da interrupção

A última atualização informou que faltavam principalmente:

- Finalizar as capturas de tela.
- Conferir as diferenças visuais.
- Atualizar os documentos de progresso.
- Produzir o relatório final da execução.
- Consolidar as pendências restantes.

**Retome a partir dessas atividades, verificando antes quais delas já foram concluídas nos arquivos locais.**

Não execute novamente todas as suítes de testes sem necessidade. Repita somente as validações necessárias para confirmar o estado atual ou verificar alterações posteriores.

---

# PARTE 1 — FINALIZAR A EXECUÇÃO INTERROMPIDA

## 2. CONCLUIR A PROFISSIONALIZAÇÃO DO VIVA+

Finalize os ajustes pendentes nas telas já implementadas, exceto nas partes reservadas ao outro desenvolvedor.

Verifique:

- Textos apresentados aos usuários.
- Nomenclaturas profissionais.
- Consistência entre aplicativo e portal.
- Identidade visual.
- Responsividade.
- Acessibilidade.
- Formulários.
- Feedback de operações.
- Navegação.
- Estados sem registros.
- Mensagens de erro.
- Configurações.
- Persistência de preferências.
- Autoria de registros.
- Relatórios e totais.

O sistema deve transmitir uma experiência profissional e consistente.

Evite expressões genéricas e referências desnecessárias a ambientes de demonstração na interface normal.

Porém, não apresente funcionalidades incompletas como disponíveis, nem dados sintéticos como registros clínicos reais.

**Não declare o Viva+ pronto para produção enquanto existirem bloqueios relevantes de segurança, validação clínica ou integrações externas.**

## 3. FINALIZAR AS EVIDÊNCIAS VISUAIS

Continue a geração e a inspeção das capturas previstas na última execução.

Quero:

- Capturas das principais telas do paciente.
- Capturas do portal profissional.
- Evidências das telas modificadas.
- Verificação visual dos novos textos.
- Comparação com os protótipos originais.
- Identificação de diferenças ainda existentes.

Não sobrescreva evidências antigas sem necessidade.

Não exponha credenciais, tokens ou dados pessoais nas capturas.

## 4. FINALIZAR OS RELATÓRIOS

Atualize os documentos de progresso existentes.

Registre:

- Melhorias concluídas.
- Arquivos alterados.
- Migrações aplicadas.
- Testes executados.
- Resultados de segurança.
- Limitações identificadas.
- Problemas visuais.
- Pendências funcionais.
- Próximas etapas recomendadas.

Preserve os resultados da execução anterior, distinguindo testes efetivamente executados de verificações herdadas de relatórios anteriores.

---

# PARTE 2 — SEPARAR AS RESPONSABILIDADES DE DESENVOLVIMENTO

## 5. EXERCÍCIOS FÍSICOS — RESERVADO PARA OUTRO DEV

O desenvolvimento específico do módulo de exercícios físicos ficará sob responsabilidade de outro desenvolvedor.

**Não avance na implementação de novos exercícios, recomendações clínicas, vídeos, protocolos de atividade ou lógica de prescrição.**

Quero que você:

1. Identifique o que já foi implementado no módulo.
2. Preserve as telas, componentes e APIs existentes.
3. Identifique funcionalidades incompletas.
4. Documente quais recursos ainda precisam ser desenvolvidos.
5. Registre dependências técnicas e clínicas.
6. Identifique quais arquivos serão relevantes para o novo desenvolvedor.
7. Documente as integrações necessárias com o restante do Viva+.
8. Garanta que o módulo não comprometa o funcionamento do aplicativo.

Não exclua funcionalidades existentes apenas por estarem pendentes.

Não substitua orientações clínicas ausentes por instruções inventadas.

Mantenha a navegação existente, apresentando estados informativos apropriados quando determinado recurso ainda não estiver disponível.

### Funcionalidades que deverão ficar documentadas

Verifique no código o estado real de:

- Avaliação inicial de atividade.
- Registro de como o paciente está se sentindo.
- Catálogo de exercícios.
- Orientações dos exercícios.
- Vídeos demonstrativos.
- Passo a passo.
- Registro de execução.
- Histórico de atividades.
- Planejamento semanal.
- Integração com o profissional.
- Regras clínicas.
- Restrições e contraindicações.
- Integração com dispositivos, quando prevista.

Classifique cada item como implementado, parcial, pendente ou dependente de aprovação.

---

## 6. INTELIGÊNCIA ARTIFICIAL — RESERVADA PARA OUTRO DEV

Toda implementação específica de Inteligência Artificial também será responsabilidade de outro desenvolvedor.

**Não implemente novos modelos, prompts clínicos, serviços de inferência, classificadores ou mecanismos de análise automatizada nesta execução.**

Analise o projeto e identifique todas as funcionalidades relacionadas à IA.

Considere especialmente, quando aplicável:

- Análise de fotografias de alimentos.
- Identificação de alimentos.
- Interpretação de imagens.
- Reconhecimento óptico de caracteres (OCR).
- Interpretação de valores de pressão por imagem.
- Processamento de fotografias.
- Serviços externos de IA.
- Tratamento de respostas automatizadas.
- Histórico de análises.
- Validações e limitações dos resultados.

**Importante:** nem todo OCR é necessariamente uma implementação de IA generativa. Identifique a tecnologia real utilizada e documente corretamente cada integração.

Quero que você:

1. Identifique as funcionalidades já implementadas.
2. Preserve os contratos e serviços existentes.
3. Documente o funcionamento atual.
4. Identifique o que ainda falta desenvolver.
5. Liste provedores, bibliotecas e dependências.
6. Registre as variáveis de ambiente necessárias, sem divulgar credenciais.
7. Documente o fluxo completo de entrada e saída dos dados.
8. Identifique limites de segurança, privacidade e validação.
9. Registre pontos de integração com frontend, backend e banco.
10. Prepare a estrutura para que outro desenvolvedor possa assumir o trabalho sem precisar reconstruir o projeto.

Não substitua respostas reais por resultados falsos.

Não modifique implementações existentes que já foram testadas, salvo se houver necessidade de corrigir alguma falha de segurança que afete todo o sistema.

---

# PARTE 3 — CRIAR MANUAIS TÉCNICOS PARA O NOVO DESENVOLVEDOR

## 7. MANUAL TÉCNICO DE EXERCÍCIOS FÍSICOS

Crie o arquivo:

`docs/TRANSFERENCIA_DEV_EXERCICIOS.md`

Esse documento será entregue ao desenvolvedor responsável pelo módulo de atividades físicas.

Ele precisa conter:

### A. Visão geral

- Objetivo do módulo.
- Público-alvo.
- Funcionalidades previstas.
- Integração com o acompanhamento do paciente.
- Integração com o portal profissional.

### B. Arquitetura atual

- Pastas.
- Arquivos principais.
- Componentes React Native.
- Serviços TypeScript.
- Controllers Java.
- Services Java.
- Repositories.
- Entidades.
- Tabelas PostgreSQL.
- Migrações relevantes.
- Contratos de API.

Identifique os caminhos reais no repositório. Não invente nomes de classes ou arquivos.

### C. O que já funciona

Descreva exatamente as funcionalidades existentes e como utilizá-las.

### D. O que falta implementar

Organize as pendências por prioridade.

Para cada pendência, informe:

- Objetivo.
- Comportamento esperado.
- Arquivos envolvidos.
- Dependências.
- Alterações previstas no frontend.
- Alterações previstas no backend.
- Persistência necessária.
- Testes recomendados.
- Critérios de aceite.

### E. Integrações

Documente a comunicação com os módulos de:

- Pacientes.
- Autenticação.
- Perfil.
- Histórico.
- Portal profissional.

### F. Cuidados clínicos

Identifique tudo que depende de aprovação de profissionais de saúde.

Não invente protocolos clínicos.

### G. Como testar

Explique como iniciar o projeto e testar cada recurso existente.

Inclua exemplos de requisições quando aplicável, utilizando exclusivamente dados sintéticos.

---

## 8. MANUAL TÉCNICO DE INTELIGÊNCIA ARTIFICIAL

Crie o arquivo:

`docs/TRANSFERENCIA_DEV_INTELIGENCIA_ARTIFICIAL.md`

Esse documento deve permitir que um novo desenvolvedor assuma todas as integrações de IA e processamento inteligente.

### A. Visão geral

Explique onde a IA está prevista no Viva+ e quais problemas deve resolver.

### B. Arquitetura

Documente:

- Fluxo das imagens.
- Captura de fotografias.
- Upload.
- Armazenamento.
- Processamento.
- Serviços de OCR.
- Provedores de IA.
- Endpoints.
- Contratos de entrada e saída.
- Tratamento de erros.
- Exibição dos resultados.
- Persistência dos registros.

### C. Tecnologias existentes

Identifique as bibliotecas e serviços que já estão implementados.

Não presuma que determinado provedor de IA está configurado se isso não for comprovado pelo código.

### D. Pendências de desenvolvimento

Para cada funcionalidade pendente, descreva:

- O que precisa ser criado.
- Onde implementar.
- Como integrar.
- Quais dados serão recebidos.
- Quais dados deverão ser retornados.
- Quais validações são necessárias.
- Quais testes deverão ser realizados.
- Quais critérios demonstrarão que está pronta.

### E. Segurança e privacidade

Documente:

- Proteção de dados pessoais.
- Armazenamento de imagens.
- Autorização de acesso.
- Proteção das credenciais.
- Limites de requisição.
- Tratamento de erros.
- Registro de auditoria.
- Retenção e exclusão, conforme as regras aprovadas.
- Prevenção de exposição de imagens e informações dos pacientes.

### F. Limites clínicos

Registre claramente que resultados de IA não substituem avaliação profissional.

Documente quais regras ainda dependem de validação clínica.

### G. Como desenvolver e testar

Explique:

- Como iniciar os serviços.
- Como executar as integrações locais.
- Como configurar provedores externos de forma segura.
- Como realizar testes automatizados.
- Como testar fotografias.
- Como validar respostas.
- Como tratar resultados incorretos.
- Como integrar novas implementações sem quebrar o projeto.

---

# PARTE 4 — CRIAR UM DOCUMENTO GERAL DE TRANSFERÊNCIA

## 9. MANUAL DE CONTINUIDADE PARA DESENVOLVEDORES

Crie também:

`docs/MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md`

Esse será o documento principal que entregarei ao outro desenvolvedor.

Quero que ele consiga entender o Viva+ mesmo sem ter participado das etapas anteriores.

Inclua:

### 1. Apresentação do projeto

- O que é o Viva+.
- Qual é seu objetivo.
- Quem utilizará o sistema.
- Quais são seus módulos.

### 2. Tecnologias utilizadas

- React Native.
- Expo.
- Next.js.
- TypeScript.
- Java 21.
- Spring Boot.
- Maven.
- PostgreSQL.
- Flyway.
- Outras dependências relevantes identificadas no código.

### 3. Estrutura de pastas

Explique a finalidade das principais pastas e arquivos.

### 4. Como configurar o ambiente

Inclua os requisitos de instalação e links para os guias existentes.

### 5. Como executar localmente

Explique:

- Como iniciar o PostgreSQL.
- Como iniciar a API.
- Como iniciar o portal.
- Como iniciar o aplicativo.
- Como verificar a saúde dos serviços.
- Como executar os testes.
- Como encerrar o ambiente.

Reaproveite os scripts existentes, incluindo `Iniciar-VivaMais.cmd`, após verificar seu funcionamento atual.

### 6. Banco de dados

Documente:

- Estrutura.
- Migrações V1–V7.
- Principais entidades.
- Relacionamentos.
- Políticas de acesso.
- Procedimentos de backup.
- Procedimentos de restauração.

### 7. Autenticação e segurança

Explique:

- Perfis de acesso.
- Cadastro.
- Ativação.
- Sessões.
- Permissões.
- Proteção das informações.
- Cuidados com credenciais.

### 8. APIs e integrações

Liste os endpoints relevantes e a documentação OpenAPI existente, sem duplicar desnecessariamente especificações que já estejam atualizadas.

### 9. Estado de implementação

Identifique:

- Funcionalidades concluídas.
- Funcionalidades parcialmente implementadas.
- Funcionalidades pendentes.
- Funcionalidades dependentes de aprovação externa.

### 10. Como contribuir

Explique:

- Como criar novas funcionalidades.
- Convenções de código.
- Padrões de nomenclatura.
- Organização dos componentes.
- Uso dos serviços.
- Migrações Flyway.
- Testes obrigatórios.
- Cuidados com o Git.
- Como evitar regressões.

### 11. Plano de continuidade

Crie um roteiro técnico para as próximas implementações, especialmente exercícios físicos e IA.

Organize por prioridade e dependências, com critérios verificáveis de conclusão.

Não apresente estimativas como compromissos firmes quando não houver informações suficientes.

### 12. Checklist de entrega do novo desenvolvedor

Inclua um checklist para revisão das futuras funcionalidades:

- Código implementado.
- Integração concluída.
- Banco atualizado, quando necessário.
- Testes realizados.
- Segurança verificada.
- Interface validada.
- Documentação atualizada.
- Funcionalidade testada em conjunto com o restante do sistema.

---

# PARTE 5 — ORGANIZAR PENDÊNCIAS E RESPONSABILIDADES

## 10. CRIAR UMA MATRIZ DE RESPONSABILIDADES

Crie:

`docs/MATRIZ_RESPONSABILIDADES_DESENVOLVIMENTO.md`

Organize as atividades por responsável:

**Desenvolvedor atual / Codex**
- Profissionalização geral.
- Cadastro e autenticação.
- Home.
- Perfil.
- Portal profissional.
- Persistência de preferências.
- Segurança geral.
- Documentação.
- Correções de navegação.
- Testes de integração.

**Outro desenvolvedor — Exercícios**
- Funcionalidades específicas de exercícios.
- Conteúdo e orientações de atividade física.
- Vídeos.
- Regras e protocolos.
- Evolução funcional do módulo.
- Testes específicos.

**Outro desenvolvedor — Inteligência Artificial**
- Análise automatizada de imagens.
- IA aplicada à alimentação.
- OCR e processamento inteligente, conforme delimitação confirmada no código.
- Integrações externas.
- Validação de resultados automatizados.
- Testes específicos.

**Dependências externas**
- Validação clínica.
- Aprovação de conteúdo.
- Revisão institucional/jurídica.
- Protocolos de dispositivos.
- Fornecedores.
- Publicação em lojas.
- Credenciais de serviços externos.

Para cada atividade, inclua:

- Responsável.
- Estado atual.
- Prioridade.
- Dependências.
- Critério de conclusão.

O objetivo é evitar que dois desenvolvedores modifiquem o mesmo módulo sem coordenação.

---

# PARTE 6 — CONTINUAR APENAS O ESCOPO NÃO DELEGADO

## 11. FINALIZAR AS DEMAIS PENDÊNCIAS

Depois de concluir o trabalho interrompido e preparar a documentação, continue corrigindo pendências gerais que não pertençam aos módulos de exercícios ou IA.

Priorize:

- Problemas visuais das telas existentes.
- Textos profissionais.
- Configurações.
- Preferências persistentes.
- Perfil.
- Navegação.
- Formulários.
- Histórico geral.
- Portal profissional.
- Relatórios.
- Segurança de autenticação e autorização.
- Qualidade de código.
- Acessibilidade.
- Testes.

Os dois alertas altos de dependências permanecem pendentes segundo a execução anterior.

Reavalie seu estado, registre o risco e identifique alternativas viáveis.

Não oculte alertas de segurança, não force versões incompatíveis e não declare produção liberada enquanto houver bloqueios relevantes.

Não realize mudanças nos componentes de exercícios e IA apenas para eliminar pendências de funcionalidade.

Se uma correção de segurança geral exigir alterações nesses módulos, preserve os contratos e documente a necessidade de coordenação com o desenvolvedor responsável.

---

# PARTE 7 — VALIDAÇÃO FINAL

## 12. VERIFICAR QUE O SISTEMA CONTINUA FUNCIONANDO

Ao finalizar, execute as validações necessárias para confirmar:

- Inicialização da API.
- Conexão com PostgreSQL.
- Migrações Flyway.
- Login.
- Cadastro.
- Home.
- Navegação.
- Perfil.
- Configurações.
- Preferências.
- Portal profissional.
- Consultas.
- Relatórios.
- Histórico.
- Permissões de acesso.

Preserve os testes já existentes para exercícios e IA, mesmo que essas áreas fiquem reservadas para outro desenvolvedor.

Não remova testes apenas porque uma funcionalidade ainda está incompleta.

Não declare que exercícios e IA estão totalmente concluídos.

Mantenha os contratos estáveis para permitir a continuidade posterior.

---

# PARTE 8 — PRESERVAÇÃO DO PROJETO

## 13. REGRAS OBRIGATÓRIAS

- Não reinicie o projeto do zero.
- Não apague o código existente.
- Não descarte alterações do Git.
- Não execute `git reset --hard` nem `git clean`.
- Não recrie o banco de dados principal.
- Não altere migrações aplicadas.
- Não remova os dados existentes.
- Não exponha credenciais.
- Não faça commit ou push sem autorização.
- Não publique a aplicação.
- Não implemente funcionalidades clínicas sem aprovação.
- Não invente integrações externas.
- Não remova as telas de exercícios ou IA já existentes.
- Não trate funcionalidades parciais como funcionalidades concluídas.

As funcionalidades delegadas devem permanecer integráveis ao sistema e com suas pendências documentadas.

---

# PARTE 9 — RESULTADO FINAL ESPERADO

Ao concluir, quero receber:

1. Confirmação de onde a execução anterior foi interrompida.
2. Lista do que já estava concluído.
3. Lista do que foi finalizado nesta retomada.
4. Capturas e evidências visuais atualizadas.
5. Resultado dos testes.
6. Estado dos alertas de segurança.
7. Lista das pendências gerais.
8. Lista separada das pendências de exercícios.
9. Lista separada das pendências de IA.
10. Manual técnico de exercícios.
11. Manual técnico de IA.
12. Manual geral de continuidade.
13. Matriz de responsabilidades.
14. Documentação de progresso atualizada.

Os documentos obrigatórios são:

- `docs/TRANSFERENCIA_DEV_EXERCICIOS.md`
- `docs/TRANSFERENCIA_DEV_INTELIGENCIA_ARTIFICIAL.md`
- `docs/MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md`
- `docs/MATRIZ_RESPONSABILIDADES_DESENVOLVIMENTO.md`

Todos deverão conter informações verificadas no código e instruções realmente utilizáveis.

Não produza documentação genérica que poderia servir para qualquer sistema.

Quero documentação específica do Viva+, incluindo caminhos de arquivos, arquitetura real, endpoints existentes, integrações, contratos e pendências concretas.

## INSTRUÇÃO FINAL

**RETOME EXATAMENTE DE ONDE VOCÊ PAROU.**

Finalize as capturas, a revisão visual, os testes que ainda forem necessários e o relatório da execução anterior.

Em seguida, organize a documentação e a transferência de conhecimento.

**NÃO CONTINUE DESENVOLVENDO AS FUNCIONALIDADES ESPECÍFICAS DE EXERCÍCIOS FÍSICOS E INTELIGÊNCIA ARTIFICIAL. ESSAS PARTES SERÃO ASSUMIDAS POR OUTRO DESENVOLVEDOR.**

Preserve seus componentes existentes, documente o estado real e prepare instruções técnicas detalhadas para que o novo desenvolvedor possa começar a trabalhar.

Continue corrigindo e profissionalizando as demais áreas do sistema.

Quero encerrar esta etapa com o Viva+ estável, organizado, documentado e preparado para receber o trabalho do outro desenvolvedor, sem perda das funcionalidades já implementadas.
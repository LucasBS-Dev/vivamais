# VIVA+ — CORREÇÃO DE INTERFACE, ATIVAÇÃO POR SMS, VALIDAÇÃO CADASTRAL E LEVANTAMENTO COMPLETO DAS PENDÊNCIAS

Quero que você continue o desenvolvimento do Viva+ a partir da última implementação, preservando tudo o que já funciona.

Nesta execução, preciso que você realize correções visuais, implemente melhorias no cadastro e na ativação dos pacientes e produza uma documentação técnica completa com tudo o que ainda falta desenvolver.

**Não quero apenas um relatório ou sugestões. Quero que você implemente as correções possíveis, teste o resultado e documente as pendências restantes.**

Estou anexando duas capturas de tela que mostram problemas reais na interface. Utilize essas imagens como referência para identificar e corrigir os defeitos.

## 1. CONTEXTO DA ÚLTIMA EXECUÇÃO

A última implementação concluiu:

- Login do paciente com CPF e data de nascimento.
- Acesso do paciente sem senha convencional.
- Código de ativação numérico com 4 dígitos.
- Autorização de dispositivo.
- Limitação de tentativas.
- Renovação e revogação de sessões.
- Emissão de código pelo portal profissional.
- Migração Flyway V8.
- Integração com PostgreSQL.
- Preservação da autenticação profissional.

Foram informados 48 testes Java, 58 testes frontend e 14 testes E2E aprovados.

Preserve essa implementação.

Consulte o histórico, `AGENTS.md`, `PROGRESSO.md`, `STATUS.md`, `PROXIMA_EXECUCAO.md`, os documentos de requisitos e os relatórios da última entrega.

O projeto está em:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais`

---

# ETAPA 1 — CORRIGIR OS PROBLEMAS VISUAIS DOS PRINTS

## 2. PRINT 1 — CORRIGIR O RODAPÉ E A NAVEGAÇÃO DO APLICATIVO

Na primeira captura, identifiquei um problema na tela de atividades físicas do paciente.

A barra de navegação inferior, contendo:

- Início.
- Lembretes.
- Mensagens.
- Perfil.

Está aparecendo no meio do conteúdo da página.

Abaixo dela ainda aparecem botões como:

- Ver minha semana de atividades.
- Ilustrações das atividades.
- Mensagens e orientações da atividade.

Isso prejudica a organização da interface.

### Correção obrigatória

Quero que você:

1. Identifique o componente responsável pela barra inferior.
2. Corrija a hierarquia do layout.
3. Posicione a navegação inferior no local correto, conforme o padrão visual do aplicativo.
4. Garanta que ela não apareça entre os conteúdos da tela.
5. Organize os botões e cards dentro da área principal de conteúdo.
6. Corrija espaçamentos e margens.
7. Respeite a área segura de navegação do dispositivo (safe area).
8. Evite sobreposição entre conteúdo, barra de navegação e botões do sistema.
9. Garanta rolagem adequada quando o conteúdo ultrapassar a altura da tela.
10. Verifique o mesmo componente em todas as telas que utilizam a navegação inferior.

Não corrija apenas a tela da captura. Corrija o componente compartilhado ou a estrutura responsável pelo defeito.

### Texto de desenvolvimento no rodapé

Na captura também aparece:

"Ambiente de desenvolvimento · Use somente dados fictícios."

Quero uma interface profissional e visualmente limpa.

Separe os indicadores do ambiente de desenvolvimento da apresentação normal do aplicativo, sem ocultar informações necessárias para que usuários de teste não confundam dados sintéticos com dados reais.

Não apresente dados demonstrativos como informações clínicas verdadeiras.

### Validação

Teste a tela em diferentes dimensões de dispositivos móveis e gere novas capturas.

Verifique especialmente telas pequenas, rolagem e orientação vertical.

---

## 3. PRINT 2 — CORRIGIR A LOGO E O LAYOUT DE CONFIGURAÇÕES

Na segunda captura, referente ao portal profissional, identifiquei dois problemas importantes.

### A. Logotipo do Viva+ com baixa qualidade

O logotipo exibido na lateral superior esquerda está com aparência desfocada e pouca definição.

Quero que você:

1. Identifique qual arquivo de imagem está sendo utilizado.
2. Compare com os assets de maior resolução já fornecidos.
3. Substitua a imagem de baixa qualidade pela versão mais nítida disponível.
4. Preserve a proporção original.
5. Ajuste corretamente largura e altura.
6. Evite ampliação excessiva.
7. Configure o componente Next.js para renderização adequada.
8. Verifique a qualidade em telas de alta densidade de pixels.
9. Corrija também outras ocorrências da logo que apresentem perda de qualidade.

Não recrie a identidade visual nem utilize um logotipo diferente.

### B. Formatação da página Configurações

A área destacada em vermelho apresenta problemas de organização visual.

Os elementos parecem desalinhados, algumas informações estão concentradas na parte esquerda e existe distribuição inadequada dos espaços.

Quero que você revise a página inteira.

Corrija:

- Largura do conteúdo principal.
- Alinhamento horizontal.
- Distribuição dos cards.
- Espaçamentos internos.
- Margens.
- Títulos.
- Textos.
- Botões.
- Campos.
- Checkbox.
- Seletores.
- Quebras de linha.
- Organização das informações.
- Responsividade.

### Seção Conta e unidade

Organize adequadamente:

- Identificação do profissional.
- Unidade vinculada.
- Informações da conta.
- Gerenciamento de pacientes e vínculos.

### Seção Preferências de visualização

Organize corretamente:

- Ampliar os textos do portal.
- Registros por página.
- Controles de preferência.
- Mensagens de confirmação.

Os elementos devem ficar alinhados e não podem se sobrepor.

Preserve a persistência das preferências já implementada no PostgreSQL.

### Seção Privacidade e suporte

Padronize os links e a organização da seção.

Não apresente políticas ou canais institucionais como oficialmente aprovados quando ainda estiverem pendentes de revisão.

### Validação visual

Teste a página nas larguras:

- 1366 px.
- 1440 px.
- 1920 px.
- Tablet.
- Mobile.

Capture novamente a interface e compare com a imagem enviada.

Verifique também outras páginas que compartilhem os mesmos componentes de layout.

---

# ETAPA 2 — IMPLEMENTAR ENVIO DO CÓDIGO DE ATIVAÇÃO POR SMS

## 4. O CÓDIGO DE ATIVAÇÃO DEVE SER ENVIADO AO CELULAR DO PACIENTE

Atualmente, o profissional consegue gerar um código de ativação com quatro dígitos.

Quero aprimorar esse fluxo.

**O código de ativação deverá ser enviado por SMS para o número de telefone cadastrado do paciente.**

### Fluxo esperado

1. O profissional cadastra o paciente no portal.
2. Informa obrigatoriamente o telefone celular.
3. Confirma os dados cadastrais.
4. Solicita a ativação da conta.
5. O sistema gera um código numérico de quatro dígitos.
6. O backend solicita o envio do código por SMS.
7. O paciente recebe o código no celular cadastrado.
8. O paciente abre o aplicativo Viva+.
9. Informa CPF e data de nascimento.
10. Digita o código recebido por SMS.
11. O sistema valida o código e autoriza o dispositivo.
12. O paciente acessa a Home.

O paciente não deverá precisar criar senha.

### Implementação técnica

Analise a arquitetura atual e implemente um serviço de envio de SMS desacoplado do restante do backend.

Quero uma solução que permita utilizar um provedor externo posteriormente sem precisar reescrever a autenticação.

Pode avaliar fornecedores como Twilio, Zenvia ou outro provedor confiável, mas não presuma que já existe contrato ou credencial disponível.

Crie:

- Interface para o serviço de envio.
- Implementação de integração com o provedor configurado.
- Configurações por variáveis de ambiente.
- Tratamento de falhas.
- Registro de status de envio sem registrar o código.
- Controle de tentativas e reenvios.
- Mensagens adequadas ao profissional e ao paciente.
- Testes automatizados.

O envio real deve ocorrer somente com um provedor configurado e autorizado.

### Ambiente local

Como ainda estamos desenvolvendo e testando o sistema, disponibilize um mecanismo isolado de teste de SMS, sem enviar mensagens reais.

Esse mecanismo deve funcionar somente no ambiente de desenvolvimento.

Não apresente um SMS simulado como mensagem realmente entregue.

Não exponha códigos de ativação em logs públicos, frontend, respostas normais da API ou documentação versionada.

### Regras de segurança

Mantenha:

- Código com exatamente 4 números.
- Geração criptograficamente segura.
- Validade de 10 minutos.
- Uso único.
- Limite rigoroso de tentativas.
- Limite de reenvio.
- Invalidação do código anterior.
- Proteção contra força bruta.
- Armazenamento protegido.
- Revogação e autorização de dispositivos.

Também implemente controles contra abuso no envio de SMS e mensagens de erro que não permitam descobrir se determinada pessoa possui cadastro.

Não marque o código como enviado antes de obter confirmação adequada do provedor.

---

# ETAPA 3 — VALIDAÇÃO CADASTRAL

## 5. VALIDAR O CPF CORRETAMENTE

Quero que o cadastro de pacientes tenha validações mais rigorosas.

### Verificações obrigatórias

- CPF com exatamente 11 dígitos.
- Máscara adequada.
- Verificação dos dígitos verificadores.
- Rejeição de sequências inválidas.
- Rejeição de CPF já cadastrado quando a regra de negócio impedir duplicidade.
- Normalização antes de salvar no banco.
- Tratamento de erros.
- Validação tanto no frontend quanto no backend.
- Proteção contra cadastros indevidos.

### Verificação de existência do CPF

Quero saber se existe alguma forma oficial e autorizada de verificar a situação cadastral do CPF.

**Atenção: validar os dígitos verificadores não comprova que um CPF foi efetivamente emitido pela Receita Federal nem que pertence à pessoa cadastrada.**

Portanto:

1. Investigue as alternativas oficiais e legalmente autorizadas.
2. Verifique se existe integração disponível para o projeto.
3. Documente requisitos, custos, autorizações e limitações.
4. Não utilize scraping de páginas governamentais.
5. Não integre serviços não autorizados.
6. Não afirme que um CPF existe oficialmente apenas porque passou na validação matemática.
7. Se a consulta oficial depender de contrato ou aprovação, deixe essa verificação como pendência documentada.

Enquanto não existir uma integração oficial aprovada, mantenha a validação estrutural e as verificações internas, sem afirmar que a identidade foi confirmada pela Receita Federal.

O recebimento de um SMS também não comprova, isoladamente, que o CPF pertence à pessoa que recebeu o código.

Preserve um processo adequado de verificação de identidade na ativação.

---

## 6. TORNAR O TELEFONE OBRIGATÓRIO NO CADASTRO

Atualmente, preciso que o telefone celular seja obrigatório para novos pacientes.

### Requisitos

- Campo obrigatório no portal profissional.
- Máscara de telefone brasileiro.
- DDD obrigatório.
- Validação de comprimento e formato.
- Normalização para padrão internacional E.164.
- Mensagem de erro clara.
- Validação frontend e backend.
- Persistência no PostgreSQL.
- Exibição adequada na ficha do paciente.
- Possibilidade de atualização por profissional autorizado.
- Confirmação segura quando o número utilizado para autenticação for alterado.

Como o SMS será utilizado na ativação, o sistema não deve permitir iniciar esse processo sem um celular válido.

Não confunda número com formato válido com número efetivamente ativo ou pertencente ao paciente.

### Pacientes já cadastrados

Não apague nem invalide automaticamente cadastros existentes que não tenham telefone.

Implemente uma transição segura:

1. Identifique registros sem telefone.
2. Preserve os dados existentes.
3. Exija o preenchimento antes de novas ativações ou envios de SMS.
4. Permita que o profissional autorizado regularize o cadastro.
5. Utilize uma nova migração Flyway somente se necessário.
6. Não altere migrações V1–V8 já aplicadas.

---

# ETAPA 4 — REVISAR O FLUXO COMPLETO DE CADASTRO E ATIVAÇÃO

## 7. VALIDAR A EXPERIÊNCIA DO PACIENTE

Quero que o fluxo fique simples para idosos.

### Cadastro

O cadastro deverá ser realizado conforme as permissões previstas no portal profissional.

CPF, nascimento e telefone celular precisam ser verificados de acordo com as regras definidas.

### Ativação

O paciente deverá receber o código por SMS e informar os quatro números no aplicativo.

A interface precisa ter:

- Campos grandes.
- Teclado numérico.
- Bom contraste.
- Mensagens simples.
- Botões claros.
- Orientação para código expirado.
- Solicitação controlada de novo código.

### Login

Após ativação e autorização do dispositivo, manter o acesso sem senha convencional, com CPF e data de nascimento, conforme a arquitetura segura já implementada.

### Recuperação de acesso

Analise o fluxo atual de recuperação.

Quando for necessária uma nova verificação, utilize o canal telefônico validado e preserve as regras de autorização.

Não enfraqueça o sistema de autenticação para facilitar a implementação.

---

# ETAPA 5 — LEVANTAMENTO COMPLETO DO QUE AINDA FALTA DESENVOLVER

## 8. CRIAR UMA AUDITORIA GERAL DO PROJETO VIVA+

Além das correções, quero que você examine TODO o projeto para identificar o que ainda falta implementar.

Não se limite às pendências já registradas em `PROGRESSO.md`.

Compare:

- Documento original de requisitos.
- Referências visuais das 36 telas.
- Código existente.
- Rotas do aplicativo.
- Rotas do portal.
- APIs.
- Banco PostgreSQL.
- Migrações Flyway.
- Serviços externos.
- Testes.
- Documentação anterior.
- Relatórios de auditoria.
- Funcionalidades declaradas como concluídas.

Identifique divergências entre os requisitos e o que realmente está implementado.

Classifique cada funcionalidade como:

- Concluída e validada.
- Implementada parcialmente.
- Implementada, mas não testada.
- Pendente.
- Bloqueada por dependência externa.

### Áreas que devem ser analisadas

**Aplicativo do paciente**
- Cadastro e ativação.
- Login.
- Home.
- Pressão arterial.
- Medicamentos.
- Alimentação.
- Atividade física.
- Histórico.
- Perfil.
- Configurações.
- Lembretes.
- Mensagens.
- Acessibilidade.
- Funcionamento offline.
- Sincronização.
- Notificações.

**Portal profissional**
- Login.
- Painel.
- Cadastro de pacientes.
- Validação cadastral.
- Listagem.
- Busca.
- Edição.
- Consultas.
- Histórico.
- Relatórios.
- Configurações.
- Gestão de vínculos.
- Permissões.

**Backend e infraestrutura**
- Autenticação.
- Segurança.
- PostgreSQL.
- Migrações.
- Backups.
- Recuperação.
- Logs.
- Auditoria.
- Tratamento de erros.
- Integrações externas.
- SMS.
- Hospedagem.
- HTTPS.
- Deploy.
- Monitoramento.
- CI/CD.

**Mobile nativo**
- Android.
- iOS.
- Câmera.
- Permissões.
- Notificações.
- Armazenamento seguro.
- Funcionamento offline.
- Builds instaláveis.
- Publicação em lojas.

**Privacidade e segurança**
- Controle de acesso.
- LGPD.
- Tratamento de dados de saúde.
- Consentimentos, quando aplicáveis.
- Exclusão de dados.
- Proteção de arquivos.
- Vulnerabilidades de dependências.
- Segurança de sessões.
- Segurança de autenticação.

---

# ETAPA 6 — DOCUMENTAÇÃO PARA O OUTRO DESENVOLVEDOR

## 9. CRIAR UM INVENTÁRIO GERAL DE PENDÊNCIAS

Crie:

`docs/LEVANTAMENTO_COMPLETO_PENDENCIAS.md`

Esse documento deverá apresentar uma tabela com:

- ID da pendência.
- Módulo.
- Funcionalidade.
- Descrição.
- Estado atual.
- O que falta implementar.
- Prioridade.
- Dependências.
- Arquivos envolvidos.
- Responsável sugerido.
- Critério de aceite.
- Testes necessários.

Organize as pendências por prioridade e dependência técnica.

Não quero descrições genéricas.

Cada item deve permitir que outro desenvolvedor compreenda o que precisa fazer e onde começar.

## 10. CRIAR UM PLANO DE IMPLEMENTAÇÃO TÉCNICA

Crie:

`docs/PLANO_IMPLEMENTACAO_PENDENCIAS.md`

Para cada funcionalidade pendente relevante, documente:

1. Objetivo.
2. Comportamento esperado.
3. Situação atual.
4. Arquivos existentes.
5. Arquivos que deverão ser criados ou alterados.
6. Endpoints relacionados.
7. Tabelas do banco envolvidas.
8. Contratos de integração.
9. Dependências externas.
10. Etapas de implementação.
11. Regras de segurança.
12. Testes recomendados.
13. Critérios de conclusão.

Inclua uma ordem sugerida de desenvolvimento, considerando dependências entre funcionalidades.

## 11. ATUALIZAR OS MANUAIS DE TRANSFERÊNCIA

Revise:

- `docs/MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md`
- `docs/TRANSFERENCIA_DEV_EXERCICIOS.md`
- `docs/TRANSFERENCIA_DEV_INTELIGENCIA_ARTIFICIAL.md`
- `docs/MATRIZ_RESPONSABILIDADES_DESENVOLVIMENTO.md`

Os módulos específicos de exercícios e IA continuam reservados ao outro desenvolvedor.

Não avance na criação de novas funcionalidades desses módulos nesta execução.

Entretanto, documente todas as pendências, contratos, dependências e necessidades de integração.

A integração de SMS, as validações cadastrais e as correções gerais da interface são de sua responsabilidade nesta execução.

### Separação de responsabilidades

**Codex nesta execução**
- Correção visual.
- Cadastro.
- Validação de CPF.
- Telefone obrigatório.
- Infraestrutura de SMS.
- Fluxos de autenticação e ativação.
- Testes.
- Levantamento técnico.
- Documentação.

**Outro desenvolvedor**
- Exercícios físicos.
- Catálogo de atividades.
- Vídeos.
- Protocolos clínicos.
- Inteligência Artificial.
- Análise automatizada de alimentação.
- Evolução do OCR.
- Integrações específicas desses módulos.

**Dependências externas**
- Aprovação clínica.
- Consulta oficial de CPF, se necessária e autorizada.
- Contratação/configuração de provedor SMS.
- Revisão institucional.
- Segurança e privacidade.
- Hospedagem e publicação.

---

# ETAPA 7 — TESTES E VALIDAÇÃO

## 12. EXECUTAR TESTES APÓS AS ALTERAÇÕES

Execute:

- Testes Java.
- Testes de integração PostgreSQL.
- Testes frontend.
- TypeScript.
- Lint.
- Build Next.
- Export Expo.
- Testes E2E.
- Testes responsivos.
- Auditoria de dependências.

### Casos obrigatórios

- CPF inválido.
- CPF estruturalmente válido.
- CPF duplicado.
- Data de nascimento inválida.
- Telefone ausente.
- Telefone com DDD inválido.
- Telefone corretamente formatado.
- Cadastro existente sem telefone.
- Código SMS com quatro dígitos.
- Código expirado.
- Código incorreto.
- Código utilizado.
- Limite de tentativas.
- Reenvio.
- Falha no provedor SMS.
- Autorização de dispositivo.
- Login após ativação.
- Segurança entre pacientes.
- Autenticação profissional preservada.

Teste também as páginas apresentadas nos dois prints e gere novas capturas.

Não declare que o envio real de SMS foi validado se somente o adaptador de desenvolvimento foi testado.

Não declare que a existência oficial do CPF foi validada sem consulta a uma fonte autorizada.

---

# ETAPA 8 — RELATÓRIO FINAL E ENTREGA

## 13. DOCUMENTAR TUDO QUE FOI EXECUTADO

Crie:

`docs/evidencias/CORRECOES_CADASTRO_SMS_INTERFACE_2026-10-20.md`

O relatório deverá apresentar:

- Problemas visuais identificados.
- Correção do rodapé.
- Correção do logotipo.
- Correção do layout de configurações.
- Arquivos alterados.
- Validações de CPF implementadas.
- Regras de telefone obrigatório.
- Funcionamento do serviço de SMS.
- Provedor integrado ou pendente.
- Funcionamento da ativação.
- Migrações novas, se houver.
- Testes realizados.
- Evidências visuais.
- Pendências.
- Limitações.

Atualize também:

- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`

## 14. REGRAS DE PRESERVAÇÃO

- Não reinicie o projeto.
- Não descarte alterações locais.
- Não execute `git reset --hard` nem `git clean`.
- Não apague dados existentes.
- Não altere migrações aplicadas.
- Não execute commit ou push sem minha autorização.
- Não publique o projeto.
- Não exponha credenciais.
- Não envie SMS reais sem provedor autorizado e configuração apropriada.
- Não enfraqueça a autenticação.
- Não invente validação oficial de CPF.
- Não modifique funcionalidades específicas de exercícios ou IA que foram atribuídas ao outro desenvolvedor.

---

# PRIORIDADE E ORDEM DE EXECUÇÃO

Quero que você execute nesta ordem:

**1.** Corrigir o bug de navegação e rodapé do aplicativo.

**2.** Corrigir a qualidade da logo e a formatação da página de configurações do portal.

**3.** Implementar obrigatoriedade e validação do telefone.

**4.** Aprimorar a validação cadastral do CPF.

**5.** Implementar a estrutura e os fluxos de envio de código por SMS.

**6.** Validar o fluxo completo de cadastro, ativação e login.

**7.** Executar os testes e corrigir regressões.

**8.** Auditar todas as funcionalidades do projeto.

**9.** Criar o levantamento completo de pendências e o plano técnico de implementação.

**10.** Atualizar os documentos de transferência para o outro desenvolvedor.

## INSTRUÇÃO FINAL

Quero que o Viva+ fique visualmente mais profissional, com um fluxo de cadastro seguro e preparado para ativação por SMS.

Ao mesmo tempo, preciso de uma visão completa do que ainda falta desenvolver.

**Não finalize esta execução entregando apenas melhorias visuais ou relatórios. Implemente as correções e as funcionalidades que não dependem de aprovações externas.**

Para o que depender de fornecedor, aprovação, credencial ou validação institucional, deixe a arquitetura preparada e documente o bloqueio claramente.

**O resultado final deve ser um Viva+ mais estável, com cadastro aprimorado, ativação preparada para SMS e documentação detalhada para que outro desenvolvedor consiga assumir todas as funcionalidades restantes.**
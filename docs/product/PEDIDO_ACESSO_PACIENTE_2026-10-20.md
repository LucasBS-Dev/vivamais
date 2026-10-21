# VIVA+ — ALTERAÇÃO OBRIGATÓRIA DO ACESSO DO PACIENTE: CPF, DATA DE NASCIMENTO E CÓDIGO DE ATIVAÇÃO COM 4 DÍGITOS

Quero que você continue o desenvolvimento do Viva+ a partir do estado atual, realizando uma alteração importante no fluxo de autenticação dos pacientes.

**ESTE REQUISITO JÁ HAVIA SIDO DEFINIDO NO DOCUMENTO ORIGINAL DO PROJETO E PRECISA SER IMPLEMENTADO CORRETAMENTE.**

O Viva+ será utilizado principalmente por pacientes idosos. Por esse motivo, não quero que o paciente precise criar, memorizar ou digitar uma senha convencional.

## 1. NOVA REGRA DE ACESSO DO PACIENTE

Substitua o login atual do paciente por uma interface com apenas dois campos:

**CPF**
- Campo com máscara `000.000.000-00`.
- Teclado numérico.
- Validação do CPF.
- Mensagens de erro simples.

**Data de nascimento**
- Campo no formato `DD/MM/AAAA`.
- Teclado numérico ou seletor acessível.
- Validação da data.
- Linguagem simples e adequada ao público idoso.

Botão principal:

**ENTRAR**

Não quero que a tela de login do paciente solicite e-mail ou senha.

O acesso deve continuar integrado à API Spring Boot e ao PostgreSQL.

### Segurança obrigatória

Como CPF e nascimento são informações pessoais que podem ser conhecidas por terceiros, não considero seguro permitir acesso irrestrito a dados de saúde apenas com esses dois dados.

Implemente uma autenticação sem senha com validação segura de dispositivo:

- O paciente informa CPF e data de nascimento na interface.
- O dispositivo utilizado deve ter sido previamente autorizado.
- Na ativação inicial, o paciente utiliza um código de verificação.
- Em um novo dispositivo ou após a perda da autorização, deve ocorrer uma nova verificação.
- Após a validação, o aplicativo pode manter uma sessão segura para evitar autenticações repetitivas.
- Utilize armazenamento seguro para credenciais de sessão e autorização do dispositivo.
- Não utilize CPF e nascimento como substitutos de um token criptográfico de autenticação.
- Não conceda acesso aos dados de saúde apenas pela correspondência desses dois campos em dispositivos não autorizados.

A experiência deve permanecer simples e sem senha para o paciente.

Caso a arquitetura atual não permita implementar essas garantias, registre o impedimento e proponha a adaptação necessária. Não disponibilize um acesso inseguro apenas para atender visualmente ao requisito.

## 2. CÓDIGO DE ATIVAÇÃO COM EXATAMENTE 4 NÚMEROS

Atualmente, o código de ativação do paciente é muito extenso.

Quero substituí-lo por um código numérico de quatro dígitos.

Exemplo de formato:

`4827`

O exemplo é ilustrativo; os códigos reais devem ser gerados aleatoriamente por mecanismo criptograficamente seguro.

### Requisitos

- Código com exatamente 4 números.
- Permitir zeros à esquerda.
- Gerado pelo backend.
- Associado a um único paciente.
- Uso único.
- Validade curta, preferencialmente de até 10 minutos.
- Limite rigoroso de tentativas.
- Bloqueio temporário após tentativas incorretas.
- Geração de novo código invalida o anterior.
- Não armazenar o código em texto puro.
- Não registrar códigos em logs.
- Não permitir descoberta de contas por mensagens de erro.
- Não usar esse código como senha permanente.

Como quatro dígitos possuem somente 10.000 combinações, implemente proteção efetiva contra tentativas automatizadas, reenvio abusivo e utilização indevida.

A emissão e entrega do código devem seguir um fluxo com verificação de identidade apropriada, conforme as permissões dos profissionais e os requisitos de segurança.

## 3. SIMPLIFICAR A TELA DE ATIVAÇÃO

Quero uma tela de ativação adequada para pessoas idosas.

A tela deverá apresentar:

**Título:** Ativar minha conta

**Descrição:** Informe o código de 4 números recebido para ativar seu acesso ao Viva+.

**Campo:** Código de ativação

**Botão:** ATIVAR CONTA

Melhorias esperadas:

- Quatro espaços visuais para os números.
- Teclado numérico.
- Fonte grande.
- Alto contraste.
- Mensagens fáceis de compreender.
- Confirmação clara quando a ativação for concluída.
- Orientação apropriada para código inválido ou expirado.
- Fluxo de solicitação de novo código, conforme regras de autorização.

Não exigir a criação de senha durante a ativação.

Após ativar, o paciente deve conseguir acessar a Home do Viva+ sem passar por formulários desnecessários.

## 4. CADASTRO DE PACIENTES NO PORTAL PROFISSIONAL

O cadastro realizado pelo profissional deverá continuar funcionando.

Verifique se o paciente possui:

- Nome completo.
- CPF.
- Data de nascimento.
- Telefone, quando necessário.
- Demais dados cadastrais previstos.
- Identificação do profissional ou instituição responsável.

O profissional autorizado deverá conseguir realizar o cadastro e iniciar o processo de ativação do paciente.

O sistema deverá gerar um código de ativação de quatro dígitos, seguindo os requisitos de segurança anteriores.

A interface do profissional deve apresentar mensagens claras sobre o status da ativação, sem expor códigos expirados ou utilizados.

Não altere a autenticação dos profissionais. Eles devem continuar utilizando o método de acesso seguro já existente.

## 5. MODIFICAR FRONTEND, BACKEND E BANCO DE DADOS

Não quero uma alteração apenas visual.

Analise e adapte todos os componentes envolvidos.

### Aplicativo React Native/Expo

- Tela de login.
- Tela de ativação.
- Formulários.
- Contexto de autenticação.
- Persistência da sessão.
- Navegação protegida.
- Redirecionamento para a Home.
- Tratamento de erros.
- Acessibilidade.

### Backend Spring Boot

- Endpoints de autenticação do paciente.
- Validação de CPF.
- Verificação de data de nascimento.
- Validação do código de ativação.
- Emissão e renovação de códigos.
- Proteção contra força bruta.
- Autorização de dispositivos.
- Emissão e revogação de sessões.
- Regras de cadastro e ativação.
- Isolamento dos dados de cada paciente.

### PostgreSQL

Revise a estrutura existente e implemente as alterações necessárias por meio de uma nova migração Flyway.

**Não altere as migrações V1–V7 já aplicadas.**

Preserve os dados dos pacientes cadastrados.

Se houver contas antigas com senha, implemente uma transição segura para o novo modelo, sem apagar usuários ou enfraquecer a autenticação dos profissionais.

Atualize também os contratos OpenAPI e os tipos TypeScript correspondentes.

## 6. GARANTIR A NAVEGAÇÃO COMPLETA

O novo fluxo deve funcionar assim:

**Primeira utilização:**

Cadastro pelo profissional → Recebimento do código de 4 números → Ativação da conta → Acesso à Home.

**Próximos acessos em dispositivo autorizado:**

CPF → Data de nascimento → ENTRAR → Home.

**Acesso por dispositivo novo ou não autorizado:**

CPF → Data de nascimento → Nova verificação segura → Home.

Não exigir senha convencional do paciente em nenhum desses fluxos.

Não permita que uma pessoa acesse registros de outro paciente.

Não modifique o funcionamento dos módulos de pressão, medicamentos, alimentação, histórico, perfil e consultas, exceto quando necessário para adaptar a autenticação.

## 7. TESTES OBRIGATÓRIOS

Implemente e execute testes para:

1. Login do paciente com CPF e nascimento.
2. Rejeição de CPF inválido.
3. Rejeição de nascimento incorreto.
4. Código de ativação com exatamente 4 dígitos.
5. Códigos iniciados em zero.
6. Código expirado.
7. Código já utilizado.
8. Código incorreto.
9. Excesso de tentativas.
10. Bloqueio temporário.
11. Novo código invalidando o anterior.
12. Acesso em dispositivo autorizado.
13. Tentativa em dispositivo desconhecido.
14. Renovação e revogação de sessão.
15. Isolamento entre pacientes.
16. Cadastro e ativação pelo profissional.
17. Preservação da autenticação profissional.
18. Persistência dos dados existentes.
19. Acesso à Home após autenticação.
20. Navegação pelos módulos com a nova sessão.

Execute testes Java, frontend, integração e E2E pertinentes.

Não declare o fluxo seguro ou concluído somente porque a interface está funcionando.

## 8. DOCUMENTAÇÃO

Atualize:

- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- `docs/COMO_NAVEGAR.md`
- `docs/GUIA_TESTES_TODAS_AS_TELAS.md`
- `docs/MANUAL_CONTINUIDADE_DESENVOLVIMENTO.md`

Documente:

- Novo fluxo de autenticação.
- Ativação com quatro números.
- Autorização de dispositivos.
- Regras de expiração e tentativas.
- Alterações na API.
- Alterações no banco de dados.
- Procedimento de migração de contas existentes.
- Orientações de teste para desenvolvedores.

Não inclua CPFs reais, datas de nascimento reais, códigos ativos ou credenciais nos documentos versionados.

## 9. PRESERVAÇÃO DO PROJETO

- Não reiniciar o Viva+ do zero.
- Não apagar os dados existentes.
- Não modificar migrações aplicadas.
- Não descartar alterações no Git.
- Não executar commit ou push sem autorização.
- Não publicar o sistema.
- Não enfraquecer a autenticação profissional.
- Não implementar funcionalidades novas de exercícios ou IA, pois estão reservadas para outro desenvolvedor.

Mantenha o restante do sistema funcionando.

## INSTRUÇÃO FINAL

**A NOVA EXPERIÊNCIA DO PACIENTE NÃO DEVE EXIGIR SENHA.**

Quero que o paciente utilize CPF e data de nascimento como os dois campos visíveis de login, com uma verificação segura do dispositivo para proteger suas informações.

O código de ativação deve ter exatamente quatro números.

Implemente as alterações reais no aplicativo, backend e banco de dados, mantendo acessibilidade para idosos e preservando todas as funcionalidades já existentes.

Ao concluir, apresente as telas atualizadas, as alterações realizadas, os testes executados e as instruções para eu testar o novo fluxo localmente.
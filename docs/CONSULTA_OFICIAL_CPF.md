# CPF: validação estrutural e alternativas oficiais

Pesquisa em fontes primárias em 20/10/2026. Não foi consultado CPF de pessoa real, celebrado contrato, solicitado acesso ou implementado scraping. O Viva+ valida estrutura e duplicidade interna; não possui credenciais/autorizações para verificar emissão ou situação oficial.

## O que o código faz

`packages/contracts/src/cadastro.ts` e `backend/demo/src/main/java/com/vivamais/service/DadosPessoaisService.java` aceitam onze dígitos ou máscara brasileira correta, rejeitam sequências repetidas e verificam os dois dígitos finais. O backend normaliza para onze dígitos. Índice `paciente_cpf_por_unidade`, de V6, impede duplicidade na mesma unidade; erros são tratados pela API. As telas não dizem “CPF confirmado pela Receita”.

CPF estruturalmente válido não comprova emissão, situação cadastral, correspondência ao nome/nascimento ou posse legítima do documento. SMS comprova no máximo conhecimento do código enviado, sem estabelecer titularidade do CPF. A conferência profissional permanece necessária.

## Alternativas encontradas

| Alternativa | Disponibilidade e autorização | Custo/requisitos | Limite e decisão para o Viva+ |
| --- | --- | --- | --- |
| Consulta CPF do Serpro | API oficial contratável por pessoa jurídica/órgãos conforme processo do serviço | Contratação, identificação da contratante, e-CNPJ conforme o fluxo ou atendimento comercial nas hipóteses indicadas; Consumer Key/Secret. Cobrança mensal por faixa de consumo | Possível integração futura após autorização institucional e contrato. Nenhuma credencial disponível neste projeto |
| CPF / Cadastro Base do Cidadão, Conecta gov.br | Catálogo voltado aos órgãos públicos habilitados; adesão e aprovação de acesso | Responsáveis institucionais, autenticação/certificado e termo de responsabilidade conforme catálogo. Não presumir elegibilidade, gratuidade ou condição contratual para uma demonstração acadêmica | A instituição precisa verificar se é elegível e obter acesso formal; não utilizar chave de terceiro |
| Consulta/comprovante da Receita para o cidadão | Serviço oficial de consulta pelo canal da Receita | Gratuito para o cidadão; exige dados solicitados pelo próprio serviço | Pode apoiar procedimento humano autorizado. Não é autorização para automação, scraping ou API pública embutida no Viva+ |

O [serviço oficial de contratação do Serpro](https://www.gov.br/pt-br/servicos/obter-solucao-de-consulta-de-dados-de-cadastro-de-pessoa-fisica-cpf) descreve público, etapas, certificado/chaves e cobrança por consumo. A tabela comercial não pôde ser confirmada nesta pesquisa: a página da Loja Serpro retornou 403 à ferramenta. Não foi fixado preço unitário nem usada tabela antiga de outro contrato.

A versão vigente deve ser confirmada antes da implementação. O Serpro [anunciou a versão 3](https://centraldeajuda.serpro.gov.br/duvidas/pt/avisos/avisoconsultacpfv3/) com CPF **e nascimento** na entrada e encerramento das versões anteriores em 02/10/2026. A [notícia oficial de 14/10/2026](https://www.serpro.gov.br/menu/noticias/noticias-2026/nova-versao-da-consulta-cpf) confirma a conclusão da migração. Portanto, não copiar exemplos antigos que consultam apenas CPF nem inferir disponibilidade a partir deles.

O [catálogo CPF/CBC do Conecta](https://www.gov.br/conecta/catalogo/apis/cadastro-base-do-cidadao-cbc-cpf) descreve chave, responsáveis, certificado e termo. A [adesão às APIs](https://www.gov.br/governodigital/pt-br/infraestrutura-nacional-de-dados/interoperabilidade/conecta-gov.br/quero-acessar-as-apis-do-conecta/) precisa ser feita pela instituição competente; presença no catálogo não concede acesso ao projeto.

O [serviço de consulta da Receita](https://www.gov.br/pt-br/servicos/consultar-cadastro-de-pessoas-fisicas) oferece consulta e comprovante ao cidadão. Nenhuma página com CAPTCHA/formulário foi automatizada. Situação cadastral também não equivale a conclusão sobre condições clínicas, econômicas ou identidade de quem opera o aplicativo.

## Condições para uma integração futura

1. A instituição define a necessidade, finalidade, fundamento e pessoas autorizadas; revisão jurídica/institucional indispensável, sem decisão automática do aplicativo.
2. Escolher o canal para o qual a instituição seja elegível; confirmar contrato, versão, campos mínimos, custos, quotas e ambiente de homologação.
3. Criar uma porta backend de consulta oficial, sem chamada direta do navegador e sem dados/segredos em URL ou log. Manter DESABILITADO como padrão até configuração autorizada.
4. Definir resposta explícita: não consultado, confirmado pela fonte para aqueles campos/instante, divergente ou indisponível. Não converter indisponibilidade em CPF oficial válido/inválido.
5. Definir minimização, auditoria, acesso, retenção e comportamento diante de divergência; não apagar prontuários ou negar cuidado com base em regra inventada.
6. Testar contrato autorizado, timeout, limite, divergência, indisponibilidade, ausência de credenciais e isolamento. Usar dados de homologação aprovados, nunca CPFs reais incluídos no repositório.

Estado: **bloqueada por dependência externa** para consulta oficial. Validação estrutural e unicidade por unidade continuam funcionando sem dependência desse fornecedor.

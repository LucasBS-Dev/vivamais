# Checklist dos seus testes manuais

Nome do avaliador: __________  Data: __________  Navegador/build: __________

Inicie os serviços pelo [guia Windows](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md). Siga o [roteiro detalhado](GUIA_TESTES_TODAS_AS_TELAS.md). Use somente pessoas fictícias. Não anote senha, código, CPF ou token.

Preencha Resultado com **Aprovado / Reprovado / Não executado / Bloqueado**. As linhas começam vazias para registrar o seu ensaio, independentemente dos testes automatizados. Registre a falha sem marcar integrações indisponíveis como aprovadas. Rotas com dados exigem sessão e identificador obtidos pela interface.

| ID / tela | Aplicação | Caminho para acessar | Funcionalidade / resultado esperado | Resultado | Observações |
|---|---|---|---|---|---|
| T01 Boas-vindas | Paciente | Começar ou Cadastrar ou ativar minha conta · `/` | Acesso abre; marca/ilustração legíveis | ☐ | |
| T02 Entrar | Paciente | Boas-vindas → Começar · `/acesso` | Login válido abre Home; inválido mantém acesso | ☐ | |
| T03 Cadastro orientado | Paciente | Boas-vindas → Cadastrar ou ativar minha conta · `/cadastro` | Explica convite e abre ativação/acesso | ☐ | |
| T04 Ativar conta | Paciente | Cadastro → Já tenho código: ativar conta · `/ativar-conta` | CPF/nascimento e código de 4 números autorizam aparelho; não pede senha | ☐ | |
| T05 Home paciente | Paciente | Entrar com paciente · `/inicio` | Nome, resumo API, quatro módulos e rodapé acessíveis | ☐ | |
| T06 Minha Pressão | Paciente | Home → Minha Pressão · `/pressao` | Entrada abre digitação, foto e histórico | ☐ | |
| T07 Digitar e conferir pressão | Paciente | Minha Pressão → Digitar os valores · `/pressao/digitar` | Valida valores; exige conferência antes de enviar | ☐ | |
| T08 Foto do visor e OCR | Paciente | Minha Pressão → Tirar foto do aparelho · `/pressao/foto` | Upload privado e OCR real exigem revisão; câmera nativa sem ensaio | ☐ | |
| T09 Resultado da pressão | Paciente | Digitar → Salvar → Sim, está correto · `/pressao/resultado` | Distingue confirmação API e fila; exige id e paciente | ☐ | |
| T10 Histórico da pressão | Paciente | Minha Pressão → Ver meu histórico · `/pressao/historico` | Gráfico, filtros, páginas e reconsulta de dados salvos | ☐ | |
| T11 Meus Medicamentos | Paciente | Home → Meus Medicamentos · `/medicamentos` | Horários reais e autorrelatos persistidos; sem alterar plano | ☐ | |
| T12 Lembretes | Paciente | Home → Meus Lembretes ou barra → Lembretes · `/lembretes` | Horários persistidos; notificação do SO indisponível no navegador | ☐ | |
| T13 Foto e histórico alimentar | Paciente | Home → Minha Alimentação · `/alimentacao` | Foto/observação privadas persistem e reabrem; análise não configurada | ☐ | |
| T14 Resultado alimentar | Paciente | Alimentação → Ver resultado da refeição · `/alimentacao/resultado` | Mostra foto/dados e indisponibilidade; não inventa classificação | ☐ | |
| T15 Entrada da atividade | Paciente | Home → Atividade Física · `/atividade-fisica` | Abre roteiro, registro, semana, galeria e orientações | ☐ | |
| T16 Estado atual informado | Paciente | Atividade → Ver minhas informações · `/atividade-fisica/como-esta-hoje` | Três respostas; Continuar exige escolha e não libera exercício | ☐ | |
| T17 Verificação da pressão | Paciente | Estado atual → Continuar · `/atividade-fisica/verificacao-pressao` | Última medição real e escolha obrigatória | ☐ | |
| T18 Informações da atividade | Paciente | Verificação da pressão → Continuar · `/atividade-fisica/suas-informacoes` | Idade derivada do cadastro e perfil real; ausência explícita | ☐ | |
| T19 Atividade de hoje | Paciente | Informações → Ver orientações da atividade · `/atividade-fisica/atividade-hoje` | Navega e mostra bloqueio de recomendação personalizada | ☐ | |
| T20 Passo a passo | Paciente | Atividade de hoje → Passo a passo e materiais · `/atividade-fisica/passo-a-passo` | Bloqueio explícito, sem sequência clínica inventada | ☐ | |
| T21 Vídeo | Paciente | Passo a passo → Vídeo demonstrativo · `/atividade-fisica/video` | Indica vídeo revisado não fornecido | ☐ | |
| T22 Alternativa de atividade | Paciente | Atividade de hoje → Hoje preciso de algo mais leve · `/atividade-fisica/alternativa` | Bloqueio honesto e acesso ao registro voluntário | ☐ | |
| T23 Galeria de atividades | Paciente | Atividade → Ilustrações das atividades · `/atividade-fisica/ilustracoes` | Cinco imagens; escolha preenche tipo de atividade já realizada | ☐ | |
| T24 Registro e conclusão da atividade | Paciente | Atividade → Registrar atividade realizada · `/atividade-fisica/registro` | Valida relato/minutos/data; salva ou mantém fila idempotente | ☐ | |
| T25 Semana e histórico de atividade | Paciente | Atividade → Ver minha semana de atividades · `/atividade-fisica/historico` | Totais completos da semana, mês/todos e paginação reais | ☐ | |
| T26 Orientações gerais da atividade | Paciente | Atividade → Mensagens e orientações da atividade · `/atividade-fisica/orientacoes` | Explicações gerais e retorno pelo Perfil/Início | ☐ | |
| T27 Meu Histórico | Paciente | Home → Meu Histórico · `/historico` | Quatro categorias; filtros e persistência conforme categoria | ☐ | |
| T28 Orientações da equipe | Paciente | Barra inferior → Mensagens · `/mensagens` | Consulta/atualiza orientação do perfil; sem envio de chat | ☐ | |
| T29 Meu Perfil | Paciente | Home → Meu Perfil ou barra → Perfil · `/perfil` | Dados reais; telefone editável reflete no portal após nova sessão | ☐ | |
| T30 Configurações do paciente | Paciente | Home ou Perfil → Configurações e acessibilidade · `/configuracoes` | Texto aumenta; sessão/saída reais; preferência persistente por conta | ☐ | |
| T31 Acesso profissional | Profissional | Entrar na plataforma · `/` | Login/BFF seguro e retorno ao painel | ☐ | |
| T32 Painel | Profissional | Menu → Início · `/painel` | Contagens e lista no escopo autorizado | ☐ | |
| T33 Lista/busca de pacientes | Profissional | Menu → Pacientes · `/pacientes` | Busca por nome, estado vazio e paginação da API | ☐ | |
| T34 Cadastrar paciente | Profissional | Menu → Cadastrar paciente · `/pacientes/novo` | Demografia/modalidade/vínculo e código único para APP | ☐ | |
| T35 Ficha do paciente | Profissional | Pacientes → nome · `/pacientes/{id}` | Dados, edição e abas autorizadas; id não amplia permissão | ☐ | |
| T36 Selecionar paciente para consulta | Profissional | Menu → Consultas · `/consultas` | Seleção abre ficha na aba Consultas; não é agenda | ☐ | |
| T37 Selecionar paciente para relatório | Profissional | Menu → Relatórios · `/relatorios` | Seleção leva ao resumo/JSON autorizado, sem PDF/analytics fictício | ☐ | |
| T38 Configurações do portal | Profissional | Menu → Configurações · `/configuracoes` | Conta/unidade, gestão de vínculos e links públicos | ☐ | |
| T39 Privacidade | Profissional | Rodapé/login → Privacidade · `/privacidade` | Rascunho declarado, revisão institucional pendente | ☐ | |
| T40 Suporte | Profissional | Menu/rodapé → Ajuda e suporte · `/suporte` | Rascunho; não envia mensagens nem possui canal final | ☐ | |
| T41 Exclusão de conta | Profissional | Configurações → Solicitação de exclusão · `/exclusao-de-conta` | Rascunho; não envia solicitação fictícia | ☐ | |
| T42 Compatibilidade: /activate | Paciente | Endereço antigo /activate · `/activate` | /ativar-conta | ☐ | |
| T43 Compatibilidade: /login | Paciente | Endereço antigo /login · `/login` | /acesso | ☐ | |
| T44 Compatibilidade: /home | Paciente | Endereço antigo /home · `/home` | /inicio | ☐ | |
| T45 Compatibilidade: /history | Paciente | Endereço antigo /history · `/history` | /historico | ☐ | |
| T46 Compatibilidade: /profile | Paciente | Endereço antigo /profile · `/profile` | /perfil | ☐ | |
| T47 Compatibilidade: /module/{key} | Paciente | Endereço antigo /module/{key} · `/module/{key}` | Componente de cuidado para quatro chaves; disponibilidade para outras | ☐ | |
| T48 Rota não encontrada | Paciente | Digitar caminho inexistente · `Endereço inexistente` | Mensagem de página não encontrada e retorno | ☐ | |
| T49 Rota não encontrada | Profissional | Digitar caminho inexistente · `Endereço inexistente` | Mensagem de página não encontrada e retorno | ☐ | |
| T50 Pressão arterial | Profissional | Ficha → Pressão arterial · `/pacientes/{id}?aba=readings` | Registro, filtros rápidos/manuais, gráfico/páginas | ☐ | |
| T51 Medicamentos | Profissional | Ficha → Medicamentos · `/pacientes/{id}?aba=medications` | Plano, edição/versionamento e autorrelatos | ☐ | |
| T52 Sete dias de autorrelatos | Profissional | Ficha → Sete dias de autorrelatos · `/pacientes/{id}?aba=medications` | Período de sete datas com totais reais | ☐ | |
| T53 Alimentação | Profissional | Ficha → Alimentação · `/pacientes/{id}?aba=meals` | Fotos/histórico privados; análise externa indisponível | ☐ | |
| T54 Atividade física | Profissional | Ficha → Atividade física · `/pacientes/{id}?aba=activities` | Registros e perfil funcional; sem prescrição automática | ☐ | |
| T55 Pulseira | Profissional | Ficha → Pulseira · `/pacientes/{id}?aba=device` | Modalidade diário, configuração/simulador; hardware bloqueado | ☐ | |
| T56 Diário impresso | Profissional | Ficha → Diário impresso · `/pacientes/{id}?aba=diary` | Transcrição persistida e origem/autoria distintas | ☐ | |
| T57 Formulário de consulta | Profissional | Ficha → Formulário de consulta · `/pacientes/{id}?aba=consultations` | Nova consulta real, campos validados | ☐ | |
| T58 Histórico/resumo de consultas | Profissional | Ficha → Histórico/resumo de consultas · `/pacientes/{id}?aba=consultations` | Consulta, resumo de registros recentes e export JSON | ☐ | |
| T59 Editar cadastro | Profissional | Ficha → Editar cadastro · `/pacientes/{id}?aba=overview` | Demografia validada e edição versionada | ☐ | |
| T60 Notificação nativa de medicamento | Paciente | Lembretes → Autorizar e agendar lembretes locais em aparelho · `—` | Navegador explica limite; entrega/aparência do SO exigem ensaio físico | ☐ | |

## Ensaios transversais (além de abrir a tela)

| Ensaio | Ação / resultado esperado | Resultado | Observações |
|---|---|---|---|
| Login inválido | Uma tentativa com senha incorreta: erro genérico, sem sessão/dados | ☐ | |
| Ativação inválida e confirmação | Senhas diferentes/código inválido rejeitados; código válido usado apenas uma vez | ☐ | |
| Validação demográfica | Nome obrigatório; telefone/nascimento/CPF inválidos recusados; CPF opcional | ☐ | |
| Edição concorrente | Duas edições com mesma versão: segunda retorna conflito, sem sobrescrita silenciosa | ☐ | |
| Persistência após nova sessão | Confirmar envio, sair/entrar e reler pressão, telefone, atividade, refeição e autorrelato | ☐ | |
| Integração profissional → paciente | Plano/perfil funcional editados aparecem ao atualizar no app | ☐ | |
| Integração paciente → profissional | Telefone, pressão, foto, atividade e autorrelato aparecem na ficha da mesma pessoa | ☐ | |
| Sete dias de medicamentos | Escolher período completo; somar Tomei, Não tomei e Sem confirmação sem inferir ingestão | ☐ | |
| Fila com falha de rede | Abortar envio, restaurar rede e reenviar mesmo UUID: uma única ocorrência persistida | ☐ | |
| Sessão web do app | Navegação preserva sessão; F5 pede login; dados confirmados permanecem | ☐ | |
| Logout e rotas protegidas | Sair, abrir Perfil/Pressão/Painel sem sessão: acesso negado/redirecionado | ☐ | |
| Isolamento | Conta B não abre dados/foto da clínica A; profissional sem vínculo recebe 403 | ☐ | |
| Acessibilidade | Texto ampliado/zoom/foco: ações continuam legíveis e utilizáveis; preferência persistente por conta | ☐ | |
| Encerramento/reinício | Encerrar serviços/banco corretamente, reiniciar e reencontrar registros confirmados | ☐ | |
| Dependências externas | Registrar análise alimentar, exercício/vídeo e hardware como bloqueados, sem resultados simulados | ☐ | |
| Android/iOS | Marcar Não executado até ensaio físico de câmera, SQLCipher, sessão e notificações | ☐ | |

## Acesso sem senha — complemento de 20/10

Marcas anteriores não substituem este novo ensaio. Preserve os resultados já anotados; use apenas pessoas fictícias. Guia em ACESSO_PACIENTE_SEM_SENHA.md.

| Caso novo | Esperado | Resultado | Observação |
|---|---|---|---|
| CPF/nascimento | Só dois campos; dados pessoais sozinhos não abrem registros | ☐ | |
| Código | Quatro números, inclusive zero inicial; dez minutos/uso único | ☐ | |
| Aparelho | Ativação, recarga e login após saída persistem corretamente | ☐ | |
| Outro aparelho | Exige nova verificação; código usado não funciona | ☐ | |
| Esquecer/recuperar | Revoga aparelho/sessões; reemissão invalida código anterior | ☐ | |
| Contas antigas | Dados preservados; complemento autorizado de CPF/nascimento | ☐ | |

## Revisão de cadastro/SMS/interface — 20/10/2026

- [x] API/PostgreSQL: celular obrigatório novo, DDD/E.164, CPF estrutural/duplicado, transição de legado e troca profissional com revogação.
- [x] Caixa SMS LOCAL cifrada, falhas e bloqueios testados; nenhum SMS real enviado.
- [x] Barra fora da rolagem nas 12 rotas consumidoras; larguras 320/375/430 px verificadas em navegador.
- [x] Configurações/logo verificadas em 1366/1440/1920/768/390 px e densidade 2.
- [ ] Entrega real por operadora, aparelhos físicos/leitores e publicação autorizada.

Esta seção é evidência automatizada local; não preenche os demais itens manuais. Guia: [SMS](CADASTRO_E_ATIVACAO_SMS.md).

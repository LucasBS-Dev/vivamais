# Viva+ — testar as telas e os dados de verdade

**Atualização de cadastro/SMS:** seguir [o guia SMS](CADASTRO_E_ATIVACAO_SMS.md), com `-SmsLocal` explícito. Nenhum código aparece no portal/resposta normal da API; teste local não comprova entrega real.

Roteiro atualizado em 20/10/2026 para o [acesso sem senha](ACESSO_PACIENTE_SEM_SENHA.md). Comece pelo [guia Windows](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md), mantenha os quatro serviços ativos e abra o [checklist](CHECKLIST_TESTES_MANUAIS.md). O [inventário](INVENTARIO_TELAS.md) distingue rotas, abas e estados. As capturas antigas permanecem históricas; as telas de acesso atuais estão no [relatório](evidencias/ACESSO_PACIENTE_2026-10-20.md).

## Preparar um ensaio sem dados pessoais reais

Use duas abas: portal em http://127.0.0.1:3000 e aplicativo em http://127.0.0.1:8081. Use o mesmo host 127.0.0.1 nos dois. Navegue pelos botões; não recarregue enquanto houver registros pendentes na fila em memória. Com aparelho autorizado, recarregar recupera a sessão pelo cookie protegido. Para testar persistência dos dados, espere a confirmação e depois saia/entre novamente.

Abra localmente `C:\Users\joaos\Documents\Codex\2026-10-16\p\work\demo-credentials.json` com o Bloco de Notas e copie `password` somente para o formulário de login. Não cole esse valor em documentação, capturas ou chat. A senha PostgreSQL, em outro arquivo privado, não serve no login Viva+.

Use nome **Pessoa Sintética Ensaio**, CPF estruturalmente válido gerado para o teste, nascimento e telefone fictícios. CPF e nascimento são obrigatórios na modalidade Aplicativo; e-mail é contato opcional. O profissional cadastra e solicita SMS após conferir identidade/celular e confirmar a própria senha. O paciente nunca cria senha; não existe autoinscrição pública de profissionais.

Ao testar formulários, não repita cliques enquanto aparecer carregamento. Antes de tirar uma captura, limpe senha/código e oculte dados desnecessários. Não fotografar pessoa ou documento real.

## 1. Portal: entrar, localizar e cadastrar

### 1.1 Login válido e inválido — `/`

1. Na aba do portal, abra a raiz. Deve aparecer **Acesso do Profissional**.
2. Preencha **E-mail institucional** com `profissional.a@demo.vivamais.invalid` e **Senha** com o valor privado; clique **Entrar na plataforma**.
3. Deve abrir `/painel`, exibindo conta/unidade e pacientes autorizados. O cabeçalho tem **Sair**.
4. Clique Sair. Teste uma única tentativa com senha incorreta, sem usar a senha real. Deve aparecer erro genérico, sem abrir dados ou criar sessão. Depois entre corretamente.
5. Muitas tentativas, inclusive ensaios automatizados, podem consumir a janela de 15 minutos. Espere se receber 429; não desative o limitador.

O cookie do portal é HttpOnly, SameSite e protegido; um cookie ainda válido pode retomar o painel ao abrir `/`. Fechar a aba não equivale a revogar a sessão. O botão Sair revoga-a.

### 1.2 Painel, busca e paginação — `/painel` e `/pacientes`

1. Menu lateral **Início** abre o painel. As contagens vêm da API; dados sintéticos anteriores podem aumentar os números.
2. Clique **Pacientes** no menu. Em **Buscar pelo nome**, procure um nome visível e clique **Buscar**. Apenas pessoas autorizadas devem aparecer.
3. Digite um termo inexistente: deve mostrar estado vazio, sem erro ou resultados de outra clínica. Use **Limpar**.
4. Se houver mais de 20 resultados, use **Próxima página** e **Página anterior**. A busca acompanha a paginação.
5. Clique na linha de um paciente para abrir sua ficha. Volte à lista pelo menu Pacientes. A busca do cabeçalho também leva à lista.

Não existe filtro de modalidade na interface atual. Não confundir a modalidade exibida ao lado do nome com um filtro implementado.

### 1.3 Cadastro completo — `/pacientes/novo`

1. Clique **Cadastrar paciente**. Selecione **Aplicativo Viva+** para testar o paciente no navegador. A modalidade Pulseira + diário é testada no item 9.
2. Informe nome completo, CPF sintético válido e nascimento fictício. Celular com DDD é obrigatório em novo cadastro. E-mail de contato, sexo e endereço continuam opcionais.
3. Antes de salvar, teste Nome vazio; o formulário não deve enviar cadastro válido. Teste telefone curto e nascimento futuro: devem ser rejeitados. Não marque como aprovado apenas porque existe uma caixa de texto.
4. CPF com 11 dígitos iguais é inválido. Gere exclusivamente um identificador sintético; não copie documento real. CPF/nascimento identificam, mas não autorizam acesso sozinhos. Duplicação na mesma clínica deve ser recusada.
5. Clique **Salvar paciente**. Em **Ativar ou recuperar acesso**, marque **Conferi pessoalmente a identidade e o celular cadastrado**, informe **Sua senha profissional** e clique **Solicitar código por SMS**. O portal mostra estado/referência, nunca o código. Em LOCAL, consulte a caixa cifrada pelo utilitário privado; o código vale dez minutos.
6. Use **Abrir ficha do paciente**. Deve aparecer a pessoa cadastrada. **Editar cadastro** permite corrigir seus campos. Altere o nome para **Pessoa Sintética Ensaio Atualizada** e clique **Salvar alterações do cadastro**.
7. Atualize a ficha: nome/telefone devem continuar salvos. E-mail de contato não é login de paciente. Mudança de CPF/nascimento/celular revoga aparelhos e códigos; a troca de celular exige confirmação e senha profissional; faça nova ativação após conferir a identidade.

### 1.4 Ativação e Home — aplicativo `/cadastro` → `/acesso` → `/ativar-conta` → `/inicio`

1. Na aba do app, clique **Começar**, ou leia **Cadastrar ou ativar minha conta** e depois **Já tenho código: ativar conta**.
2. A tela **Seu cadastro no Viva+** explica a criação pela equipe. Clique **Já tenho código: ativar conta**.
3. Em **Entrar no Viva+**, informe CPF e nascimento em DD/MM/AAAA e clique **ENTRAR**. Em aparelho novo, deve abrir **Ativar minha conta**.
4. Digite os quatro números em **Código de ativação**, preservando zeros iniciais. Clique **ATIVAR CONTA**. Espere **Acesso ativado!** e clique **Ir para o início**. Não deve existir formulário de senha/e-mail.
5. Recarregue: a Home deve reaparecer pelo cookie protegido. Depois saia, informe CPF/nascimento e entre no mesmo aparelho: não deve pedir outro código.
6. Outro perfil de navegador/dispositivo exige novo código emitido pela equipe; o código utilizado não pode funcionar novamente. Código incorreto/expirado e cinco tentativas seguidas não abrem dados. Não consumir os limites da conta principal: use uma pessoa sintética própria para esse teste.

Contas antigas continuam cadastradas, mas a senha antiga de paciente não autentica. Complete CPF/nascimento/celular ausentes no portal e emita código. Não invente dados para completar um cadastro real.

## 2. Aplicativo: boas-vindas, acesso e Home

### 2.1 Boas-vindas e acesso

`/` tem **Começar** e cadastro orientado. O acesso tem somente **CPF**, **Data de nascimento** e **ENTRAR**. Teste CPF inválido, data inexistente e ausência de campos; devem mostrar erros simples. Nascimento incorreto não libera dados e não revela existência da conta. Aparelho desconhecido segue para verificação, nunca diretamente para módulos.

Sessão curta fica em memória; cookie HttpOnly do aparelho permite renová-la enquanto autorizado. **Sair da minha conta** desliga a retomada automática, mantendo autorização para CPF/nascimento. **Desautorizar este aparelho → Confirmar desautorização** revoga-a. Após isso deve pedir nova verificação. Sem cookies aceitos, a ativação informa o problema e não simula persistência.

### 2.2 Home — `/inicio`

1. Confira a saudação e o nome. Para a nova pessoa, o nome deve refletir o cadastro atualizado.
2. Veja **Meu acompanhamento**: último registro de pressão, horários com resposta, refeições e atividades consultados na API. Estado vazio é correto para cadastro recém-criado.
3. Abra, um a um, os cards **Minha Pressão**, **Meus Medicamentos**, **Minha Alimentação** e **Atividade Física**; confira o título e volte pelo botão da tela ou **Início** na barra inferior, conforme disponível.
4. Teste **Meu Histórico**, **Meu Perfil**, **Meus Lembretes** e **Configurações e acessibilidade**. A barra inferior abre **Início**, **Lembretes**, **Mensagens** e **Perfil**; na Home ela permanece visível no rodapé.
5. A conexão confirmada não significa que toda integração externa esteja habilitada. O roteiro de atividade e a alimentação mostram limites reais.

Profissionais usam o portal com seu e-mail e senha. O aplicativo oferece somente o acesso do paciente por CPF/nascimento e aparelho autorizado.

## 3. Minha Pressão

### 3.1 Entrada e digitação — `/pressao` e `/pressao/digitar`

Home → **Minha Pressão** → **Digitar os valores**. Informe Sistólica `110` e Diastólica `70`, valores exclusivamente sintéticos. Clique **Salvar**: esta primeira ação abre a conferência, sem dispensar confirmação. Clique **Corrigir** para alterar. Depois clique **Sim, está correto** para enviar.

Teste campos vazios, texto, valores negativos e formato misturado (`11` na sistólica e `70` na diastólica): devem ser rejeitados. O formato abreviado `11` por `7` converte para `110 / 70`, mostra a conversão e exige confirmação. Isso é validação técnica, não diagnóstico.

**Pulso e data da medição** abre campos opcionais/detalhes. O instante deve estar em ISO com fuso. Para obter um exemplo atual no PowerShell, use `(Get-Date).ToUniversalTime().ToString('o')`. Não usar uma data futura. **Voltar à pressão** retorna à entrada.

### 3.2 Resultado — `/pressao/resultado?id=...&paciente=...`

Após confirmar, espere **Pressão registrada com sucesso!**. Confira os mesmos valores e data. **Ver meu histórico** abre o histórico; **Registrar novamente** abre nova digitação; **Atualizar registro** relê o resultado autorizado. Abrir a rota sem identificadores deve mostrar orientação, sem carregamento infinito.

Se houver falha de rede, a tela informa que aguarda sincronização. Não trate como registro salvo no servidor. Volte ao histórico e use os controles de sincronização; aguarde confirmação antes de fechar a aba. O UUID é preservado no reenvio para evitar duplicação.

### 3.3 Foto/OCR — `/pressao/foto`

1. Entrada da pressão → **Tirar foto do aparelho**. O exemplo inicial diz que é ilustrativo; não conta como foto enviada.
2. No navegador, use **Escolher foto da galeria**. Selecione um PNG/JPEG sintético de visor, até 2 MB. Há um recurso de teste em `docs/evidencias/testes-manuais/recursos/visor-sintetico.png`.
3. Confira a prévia. Clique **Enviar foto para OCR**. O motor Tesseract real deve retornar reconhecimento ou informar que não conseguiu ler.
4. Se reconhecer, revise os campos preenchidos e confirme como no fluxo manual. Não pode salvar automaticamente a medição a partir da foto.
5. Uma imagem ilegível deve informar o problema, permitindo digitação. Arquivo inválido/grande deve ser recusado. **Digitar os valores** leva ao fluxo manual.

Câmera nativa exige aparelho/permissão. O celular lê uma foto do visor; não mede pressão.

### 3.4 Histórico e gráfico — `/pressao/historico`

Entrada → **Ver meu histórico** ou resultado → **Ver meu histórico**. Confira o registro, a data, origem e gráfico de duas séries. **Semana**, **Mês** e **Todos** consultam períodos; **Escolher outro período** permite informar início/fim `AAAA-MM-DD` e **Aplicar período**. Um intervalo invertido deve gerar erro.

Use **Atualizar histórico**. Se houver páginas, **Página anterior/Próxima página**; o gráfico representa os registros carregados, não todos os registros do banco de uma vez. Expanda os detalhes de uma medição para conferir inserção/sincronização. Volte por **Voltar ao início**.

Prova de persistência: sair/entrar e reler; no portal, abrir a **mesma pessoa** → **Pressão arterial**. Os números e horários devem coincidir. A apresentação usa Brasília; inputs `datetime-local` do portal indicam explicitamente o fuso do navegador.

## 4. Meus Medicamentos e lembretes

### 4.1 Preparar o plano pelo profissional

Portal → Pacientes → ficha da pessoa do ensaio → **Medicamentos** → **Adicionar medicamento**. Informe **Nome do medicamento** como `Medicamento fictício do ensaio`, **Dose e instrução profissional** como texto exclusivamente sintético, **Início da vigência**, fim opcional e horários `HH:mm` separados por vírgula. Use um horário já passado para testar o autorrelato. Não criar prescrição real a partir deste roteiro. Clique **Salvar registro** e espere confirmação.

### 4.2 App — `/medicamentos`

1. Home → Meus Medicamentos. Os horários programados para o dia aparecem com nome, instrução e estado.
2. Nos horários já ocorridos, selecione **Tomei** em um e, se houver outro, **Não tomei**. A API distingue essas respostas de **Sem confirmação**; não inferir ingestão real.
3. Aguarde o envio, use **Atualizar histórico**, saia/entre e confira que a resposta permanece. Horários futuros não devem aceitar resposta antecipada indevida.
4. Expanda **Detalhes da sincronização** para consultar planos, vigência, versão e **Dia dos autorrelatos**. Mude a data para recuperar respostas anteriores. Sem plano/horário, estado vazio é correto.
5. O paciente não altera dose/nome/horários. No portal, **Editar** permite alterar o plano com versão e consultar o histórico de versões. Após salvar, atualize os medicamentos no app para conferir a integração.

### 4.3 Lembretes — `/lembretes`

Home → Meus Lembretes ou barra → Lembretes. A tela reutiliza os horários reais e os autorrelatos. Em **Detalhes da sincronização**, **Autorizar e agendar lembretes locais** no navegador informa a necessidade de build nativo. Não marcar notificação entregue apenas porque esse botão foi pressionado. A imagem de notificação do protótipo representa um estado do SO; não é uma rota web separada. Volte pelo botão Voltar ao início.

### 4.4 Acompanhamento no portal

Na aba Medicamentos, **Dia dos horários** escolhe a data. **Período dos autorrelatos** permite o dia ou **Sete dias até o dia selecionado**. Confira contagens de Tomei, Não tomei e Sem confirmação, total de horários e detalhes de cada resposta. A tabela agrega as sete datas completas, inclusive dias sem resposta. Não apresenta percentual de ingestão nem converte falta de resposta em falha do paciente. Uma falha em qualquer data deve informar erro, sem fingir um total completo.

## 5. Minha Alimentação

### 5.1 Foto e registro — `/alimentacao`

1. Home → Minha Alimentação. Clique **Escolher foto da galeria** e selecione uma imagem sintética PNG/JPEG de até 2 MB, por exemplo `assets/images/refeicao-exemplo.png`.
2. Confira a prévia. Informe **Observação sobre a refeição**, com texto como `Foto sintética do ensaio`, e clique **Enviar refeição e foto**.
3. Espere a mensagem de foto/refeição salvas. Em **Minhas refeições**, deve aparecer a foto privada, data e observação. **Atualizar refeições** relê a API. Use **Próximas fotos/Fotos anteriores** se houver paginação.
4. Saia/entre novamente e consulte o registro; no portal da mesma pessoa → **Alimentação**, confira a mesma foto/observação. Uma outra clínica não pode acessá-la.

### 5.2 Resultado e análise — `/alimentacao/resultado?id=...`

No cartão salvo, clique **Ver resultado da refeição**. A tela deve mostrar a foto e o estado verdadeiro da avaliação. Nesta configuração, **Análise educativa indisponível** é o resultado esperado: armazenamento é funcional, o provedor/critérios de classificação não estão aprovados/configurados. **Consultar análise educativa** não deve inventar alimentos/nutrientes/cores. **Ver minhas refeições** retorna à listagem. Abrir sem id pede escolher uma refeição.

Não há CRUD textual independente de refeição sem foto nessa interface. Não tratar o exemplo ilustrativo ou o painel verde do protótipo como análise executada.

## 6. Atividade Física — todas as etapas

### 6.1 Entrada, estado atual e pressão

Home → **Atividade Física** (`/atividade-fisica`). **Ver minhas informações** abre **Como você está se sentindo hoje?** (`/como-esta-hoje`). Escolha uma das três respostas; **Continuar** deve ficar indisponível antes da escolha. A resposta não libera exercício.

Continuar → **Você já verificou sua pressão hoje?** (`/verificacao-pressao`). Confira a última medição real/data ou ausência de registro. Escolha **Sim, já verifiquei** ou **Ainda não verifiquei**; só então Continue. **Registrar pressão** permite registrar uma medição, sem decidir automaticamente se atividade é segura.

### 6.2 Informações do paciente — `/atividade-fisica/suas-informacoes`

Confira Idade, Mobilidade, Equilíbrio, Restrições e Orientações da equipe. A idade deriva do nascimento cadastrado, usando a data de Brasília; não é persistida como número fixo. Nascimento ausente não deve gerar idade inventada.

Para preencher perfil funcional: no portal, ficha → Atividade física → **Perfil funcional e restrições**, informe valores sintéticos e **Salvar perfil funcional**. No app, volte e reabra as informações ou use Atualizar orientações em Mensagens. As informações devem vir da API. **Consultar meu perfil** abre `/perfil`. **Ver orientações da atividade** avança.

### 6.3 Atividade de hoje, passos, vídeo e alternativa

As rotas existem e são navegáveis, mas o conteúdo clínico personalizado está **parcialmente funcional**:

| Caminho pelo botão | Rota | Resultado verdadeiro esperado |
|---|---|---|
| Ver orientações da atividade | `/atividade-fisica/atividade-hoje` | Recomendação personalizada indisponível e orientação registrada pela equipe, se houver |
| Passo a passo e materiais | `/atividade-fisica/passo-a-passo` | Ausência de material aprovado explicitada; não inventa sequência clínica |
| Vídeo demonstrativo | `/atividade-fisica/video` | Vídeo revisado não fornecido; não simula reprodução |
| Na atividade de hoje: Hoje preciso de algo mais leve | `/atividade-fisica/alternativa` | Alternativa personalizada indisponível |

Em cada etapa, **Voltar à atividade física** retorna à entrada. Também há acesso a registro já realizado e histórico. O teste aprovado aqui é navegação e bloqueio honesto; prescrição/vídeo permanecem pendentes, mesmo com a página abrindo corretamente.

### 6.4 Ilustrações — `/atividade-fisica/ilustracoes`

Entrada → **Ilustrações das atividades**. Confira as cinco imagens e textos: braços sentado, ombros, pés sentado, caminhada e alongamento. São ilustrações da demo, sem passos/duração recomendada. Um botão **Registrar ... que já realizei** abre o registro com o tipo preenchido. **Voltar à atividade física** retorna à entrada.

### 6.5 Registro e conclusão — `/atividade-fisica/registro`

Entrada → **Registrar atividade realizada**. Selecione estado informado, preencha **Atividade realizada** com `Movimento sintético do ensaio`, **Duração em minutos** com `12` e data/hora válida da ocorrência. Clique **Registrar atividade realizada**. Duração vazia, zero ou maior que 1440 deve falhar.

Espere **Registro salvo.** A conclusão é um estado da mesma rota, não outra tela independente. **Ver minha semana de atividades** abre a semana. **Registrar outra atividade** inicia outro registro. Se a rede falhar, deve aparecer **Atividade aguardando envio**; **Reenviar atividade** mantém o UUID. Após resolver a rede, reenvie e confirme que só existe uma ocorrência no portal/semana.

### 6.6 Semana e histórico — `/atividade-fisica/historico`

Entrada ou conclusão → **Ver minha semana de atividades**. Confira os sete dias, total de minutos, registros e itens. **Semana anterior/Próxima semana** deslocam sete dias. Uma semana sem dados deve mostrar zero, sem números de exemplo. **Semana/Mês/Todos** mudam a lista; a indicação semanal continua descrevendo a semana selecionada. Paginação recupera demais registros. Volte por Voltar ao início. Faça logout/login e confira o mesmo registro; no portal, ficha → Atividade física, verifique tipo/minutos/horário.

### 6.7 Orientações — duas telas distintas

Entrada da atividade → **Mensagens e orientações da atividade** abre `/atividade-fisica/orientacoes`, com explicação geral e botão Meu Perfil. Essa ligação foi acrescentada nesta retomada.

Na Home/barra → **Mensagens**, abre `/mensagens`: consulta a orientação escrita pela equipe no perfil funcional. **Atualizar orientações** relê a API. Não é chat e não envia mensagens. O arquivo de captura antigo `atividade_12_orientacoes.png` mostrava esta tela de mensagens, não a rota `/atividade-fisica/orientacoes`; as novas capturas distinguem as duas.

## 7. Meu Histórico, perfil e configurações

### 7.1 Histórico geral — `/historico`

Home → **Meu Histórico**. Selecione **Histórico da pressão**, **Histórico de medicamentos**, **Histórico de refeições** e **Histórico de atividades**. São quatro estados da mesma rota. Pressão tem gráfico/filtros; medicamentos mostram autorrelatos; alimentação lista fotos privadas; atividades mostram tipo, minutos e data. **Ver minha semana de atividades** aparece na categoria de atividade. Use Atualizar histórico e paginação; filtros não disponíveis numa categoria não devem ser presumidos. Voltar ao início retorna à Home.

### 7.2 Perfil — `/perfil`

Home → **Meu Perfil** ou barra → Perfil. Confira nome, modalidade, dados pessoais, celular formatado e perfil funcional. Não deve haver botão para trocar sozinho o celular de ativação; a tela orienta procurar a equipe. O e-mail de contato não é login do paciente.

Nome, nascimento, CPF, contato e demais campos são corrigidos pelo profissional em **Editar cadastro**. Para trocar o celular, informe o novo número válido, marque a conferência de identidade/número e confirme a senha profissional. A troca revoga os aparelhos/códigos antigos; faça nova ativação por SMS após o prazo de reenvio. CPF tem validação estrutural no cadastro; não existe edição livre de CPF pelo paciente. Se houver conflito de versões entre duas edições, a API recusa a sobrescrita; recarregue a ficha para revisar.

Para persistência: após confirmação, saia, entre novamente e abra Perfil. O telefone continua no banco. **Configurações e acessibilidade** abre `/configuracoes`.

### 7.3 Configurações e acessibilidade — `/configuracoes`

Ative **Ampliar os textos do aplicativo**: título/textos devem aumentar efetivamente e continuar legíveis sem sobreposição. Navegue de volta à Home para conferir. Essa preferência é salva na sua conta. Aguarde o salvamento, saia e entre novamente para conferir que foi mantida. Também teste zoom/leitor do navegador, foco de teclado e rótulos dos botões. Ensaio com idosos/leitores de tela nativos continua pendente.

**Meus dados pessoais** abre Perfil. **Sair da minha conta** revoga a sessão e leva ao acesso. A Home também oferece sair. Depois tente abrir uma rota protegida em aba nova, como `/perfil` ou `/pressao`: deve retornar ao acesso sem mostrar dados. Entrar novamente restaura o acesso aos dados já persistidos.

## 8. Portal: ficha, consultas e relatórios

### 8.1 Ficha e pressão — `/pacientes/{id}`

Pacientes → escolha pessoa. **Visão geral** reúne últimos registros reais e indicadores; os limites de até 20 registros recentes são informados, sem equivaler a todo o histórico. **Editar cadastro** corrige os dados com versão. CPF aparece minimizado quando aplicável.

**Pressão arterial** mostra gráfico/tabela/paginação. **Últimos 7 dias**, **Últimos 30 dias** e **Todos os registros** preenchem/limpam o filtro; datas De/Até permitem ajuste. O intervalo rápido é corrido e inclui o minuto atual; o gráfico considera a página atual de até 20 itens. **Registrar pressão manualmente** abre o formulário autorizado; depois **Salvar registro**. **Voltar aos registros** fecha o formulário. Leia de novo para confirmar persistência. Alterne rapidamente para Medicamentos durante um carregamento: pressão atrasada não pode aparecer na aba errada.

### 8.2 Medicamentos, alimentação e atividade

Medicamentos: seguir item 4, incluindo edição/versionamento e período de sete dias. Alimentação: abrir a aba e foto privada, consultar resultado/indisponibilidade, confirmar mesma observação do app. Atividade física: tabela de ocorrências e **Perfil funcional e restrições**; **Registrar atividade** registra o relato do paciente, com estado, duração e data, sem prescrição automática. Atualize no app para conferir integração.

### 8.3 Consultas — `/consultas` e aba Consultas

1. Menu **Consultas** → escolha paciente: abre a ficha já na aba Consultas. É um seletor de pacientes autorizados, não uma agenda de horários.
2. **Nova consulta** → informe data/hora, **Anotações da consulta**, **Objetivos acordados** e **Plano de cuidado profissional**, todos com textos sintéticos. Clique **Salvar registro**.
3. A consulta deve aparecer na tabela. Expanda **Ver detalhes**; confira conteúdos e instante de inserção. Recarregue a ficha e volte à aba para comprovar persistência. Não há edição/exclusão da consulta nesta interface.
4. **Reunir resumo para consulta** consulta as categorias recentes do paciente. Expanda Medições, Planos, Autorrelatos, Atividades, Diário, Consultas, Refeições e Perfil funcional quando disponíveis.
5. **Exportar resumo autorizado (JSON)** baixa um arquivo real. Abra localmente e confira os textos sintéticos; o resumo é limitado aos registros recentes informados na tela. Não há geração de PDF ou diagnóstico automático.

### 8.4 Relatórios e configurações — `/relatorios` e `/configuracoes`

Menu **Relatórios** → escolha paciente → aba Consultas → Reunir resumo → Exportar JSON. A rota de relatórios funciona como seleção, não um painel analítico agregado completo.

Menu **Configurações** mostra conta/unidade e links reais para gerenciar pacientes/vínculos, Privacidade, Suporte e Exclusão. Não possui formulário para mudar senha ou dados da instituição. Volte pelo menu Início.

### 8.5 Recuperação de acesso e vínculos administrativos

Na ficha APP, use **Ativar ou recuperar acesso**. Confira identidade e celular, marque a declaração, informe **Sua senha profissional** e clique **Solicitar código por SMS**. Em LOCAL, consulte a referência pela caixa cifrada, sem SMS real nem código exibido no portal. Um novo código invalida o anterior; solicitação aceita revoga aparelhos, mas falha de envio preserva os que já funcionavam. Respeite cooldown/limites do guia SMS. Ative sem senha em uma pessoa fictícia própria.

Administração: use `admin.a@demo.vivamais.invalid`, com a senha privada. Na ficha, os controles de vínculos permitem conceder/revogar profissional da própria clínica. Profissional comum não deve ganhar esse controle. Ao revogar o vínculo da pessoa do ensaio, o profissional perde acesso à ficha; restaure-o pelo administrador para continuar. Não modifique vínculos das contas principais sem necessidade. Clínica B não pode abrir recursos da A mesmo conhecendo o id.

## 9. Modalidade Pulseira + diário

Crie outra pessoa fictícia como **Pulseira + diário**, sem login/ativação do paciente. Na ficha:

1. **Diário impresso** → **Registrar diário**. Informe data/hora do relato, pressão/pulso opcionais, **Relato sobre medicamentos** e **Observações da transcrição**. Salvar registro deve persistir a entrada com autoria/ocorrência/inserção. Se houver pressão, ela aparece na aba Pressão com origem Diário transcrito. Nada deve ser apresentado como medição automática da pulseira.
2. **Pulseira** → **Cadastrar pulseira**. Informe identificação fictícia e série opcional. Salve, depois configure horários.
3. Escolha explicitamente o adaptador **Simulado** para ensaiar persistência/estados da integração local. Essa confirmação é somente do simulador. O adaptador de hardware real deve permanecer indisponível enquanto protocolo/aparelho não forem fornecidos.
4. Recarregue a ficha: cadastro/configurações devem permanecer. O histórico deve distinguir simulador e bloqueio de hardware. APP não mostra essa aba como recurso disponível.

## 10. Páginas públicas, aliases e estados especiais

Portal sem login: `/privacidade`, `/suporte` e `/exclusao-de-conta` abrem rascunhos declarados. Não há canal institucional final nem formulário de exclusão enviando solicitações. Os links retornam ao acesso. Não marcar o processo jurídico de exclusão como entregue.

Aliases antigos do app `/login`, `/home`, `/profile`, `/history`, `/activate` e `/module/{key}` existem para compatibilidade. Os cinco aliases fixos redirecionam às rotas atuais; `/module/{key}` reutiliza o componente de cuidado para os quatro módulos e consulta disponibilidade para outras chaves. Não representam seis novas telas de produto. As páginas de rota não encontrada mostram mensagem/retorno; layouts e endpoints `/api/...` não são telas.

As 42 capturas anteriores incluem estados repetidos: Home também aparece como início da sequência de atividade; formulário de consulta e sua listagem pertencem à mesma ficha; confirmação de pressão e conclusão de atividade são estados das rotas existentes. A notificação do SO nunca foi capturada no navegador. O inventário registra essas distinções.

## 11. Resultado do seu ensaio

Marque cada linha do checklist com **Aprovado**, **Reprovado** ou **Não executado**. Em funções externas, registre **Bloqueado pela dependência**, sem substituir por aprovado. Anote data, navegador/build, pessoa sintética usada, ação, erro e se persistiu após nova sessão. Não anote senhas/códigos.

Para relatar problema, descreva o caminho e o texto do erro. Não envie o arquivo de credenciais ou exportação com dados reais. Se algo não aparece, confirme primeiro perfil, paciente selecionado, data/filtro e saúde dos serviços.


## Atualização de 20/10 — preferências, autoria e totais

Nas Configurações do aplicativo, Ampliar os textos do aplicativo agora salva na conta. Aguarde a confirmação do envio, saia e entre novamente: a opção deve permanecer. Fechar a aba continua exigindo login, mas não apaga a preferência salva. Falha de leitura/salvamento oferece Atualizar preferências e não confirma uma alteração perdida.

No portal, Configurações possui Preferências de visualização: texto ampliado e10/20/50registros por página na ficha. Aguarde Preferências salvas antes de sair. Saia/entre ou recarregue para conferir persistência; outra conta deve conservar seus próprios ajustes. Duas sessões concorrentes não devem sobrescrever silenciosamente: a desatualizada recebe conflito e pode reler.

Consultas e detalhes de diário/medicamentos/atividade mostram Registrado por com nome autorizado; pressão informa a autoria junto da origem. Datas de consultas/diário são ordenadas pela ocorrência, com desempate por identificador. A visão geral mostra totais completos de fotos/atividades, enquanto Últimos registros continua uma seleção recente e gráfico/tabela de pressão declaram a página.

Textos de acesso, cadastro, confirmação, carregamento e ajuda foram revistos. Páginas institucionais informam configurações/revisões pendentes sem prometer envio de solicitações ou canais oficiais. O aviso de dados fictícios pertence ao ambiente de desenvolvimento. Não usar dados reais.

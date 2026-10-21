# VIVA+ — PROFISSIONALIZAÇÃO COMPLETA DO SISTEMA, PADRONIZAÇÃO DA LINGUAGEM E RESOLUÇÃO DAS PENDÊNCIAS

Quero que você continue o desenvolvimento do projeto **Viva+** exatamente de onde a última execução parou, mas agora com uma nova prioridade:

**TRANSFORMAR O SISTEMA EM UMA APLICAÇÃO COM PADRÃO PROFISSIONAL, COM LINGUAGEM ADEQUADA, TELAS CONSISTENTES, FUNCIONALIDADES REAIS E PREPARAÇÃO TÉCNICA PARA UMA FUTURA IMPLANTAÇÃO EM PRODUÇÃO.**

Atualmente, algumas partes ainda utilizam palavras genéricas, nomenclaturas provisórias, referências a demonstrações e textos que passam a impressão de que o sistema é apenas um protótipo acadêmico.

Quero corrigir isso.

O Viva+ deve transmitir a identidade de uma plataforma séria de acompanhamento de saúde, voltada a pacientes, profissionais de saúde e instituições.

Não quero apenas alterações cosméticas: também preciso que você avance nas pendências técnicas, funcionais, de segurança e de usabilidade documentadas na execução anterior.

**IMPORTANTE: quero uma experiência profissional de produção, mas não quero que você declare funcionalidades, integrações ou aprovações inexistentes como se estivessem concluídas.**

---

## 1. RECUPERAR O CONTEXTO E PRESERVAR O QUE JÁ EXISTE

O projeto está localizado em:

`C:\Users\joaos\Documents\Codex\2026-10-16\p\outputs\viva-mais`

Antes de iniciar, consulte:

- `AGENTS.md`
- `README.md`
- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- `docs/GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md`
- `docs/GUIA_TESTES_TODAS_AS_TELAS.md`
- `docs/INVENTARIO_TELAS.md`
- `docs/evidencias/`
- Relatórios de segurança, fidelidade visual e execução local.

A última entrega já possui:

- Cadastro e ativação de contas.
- Login e autenticação.
- Home do paciente.
- Módulos de acompanhamento.
- Perfil e configurações.
- Área profissional.
- Cadastro de pacientes.
- Registros persistidos.
- Relatórios e consultas.
- Visão semanal de atividades.
- API Spring Boot.
- Banco PostgreSQL.
- Migrações Flyway V1–V6.
- Scripts de inicialização local.
- Guias de navegação e testes.

Não recrie esses recursos sem necessidade.

Preserve a arquitetura, as integrações, os dados existentes e as funcionalidades já validadas.

---

# ETAPA 1 — PROFISSIONALIZAR TODA A LINGUAGEM DO VIVA+

## 2. ELIMINAR TEXTOS GENÉRICOS E REFERÊNCIAS DESNECESSÁRIAS A DEMONSTRAÇÃO

Quero que você revise TODOS os textos exibidos ao usuário final no aplicativo do paciente e no portal profissional.

Identifique expressões como:

- Ambiente de demonstração.
- Sistema demonstrativo.
- Dados fictícios.
- Dados simulados.
- Exemplo de paciente.
- Usuário demo.
- Funcionalidade de exemplo.
- Tela demonstrativa.
- Módulo em desenvolvimento.
- Placeholder.
- Lorem ipsum.
- Textos genéricos de apresentação.
- Mensagens provisórias utilizadas durante o desenvolvimento.

Substitua esses textos por nomenclaturas profissionais, claras e adequadas à finalidade real de cada funcionalidade.

### Exemplos de padronização

| Texto inadequado | Sugestão profissional |
|---|---|
| Bem-vindo à demonstração | Bem-vindo ao Viva+ |
| Home Demo | Início |
| Paciente de exemplo | Nome do paciente autenticado |
| Demo de pressão | Acompanhamento da pressão arterial |
| Testar alimentação | Registro alimentar |
| Simulação de medicamentos | Acompanhamento de medicamentos |
| Dados mockados | Dados reais obtidos da API, quando disponíveis |
| Dashboard genérico | Painel de acompanhamento |
| Gerenciar coisas | Gerenciar informações |
| Clique aqui para testar | Acessar acompanhamento |
| Sua saúde demo | Seu acompanhamento de saúde |

Esses são exemplos. Utilize o contexto de cada tela para escolher a terminologia mais adequada.

### Regras obrigatórias

1. Toda a interface deve utilizar português brasileiro.
2. Elimine textos provisórios e nomenclaturas genéricas.
3. Utilize termos profissionais, mas compreensíveis para pacientes idosos.
4. Evite excesso de terminologia técnica nos fluxos do paciente.
5. Adote linguagem institucional adequada no portal profissional.
6. Padronize títulos, botões, mensagens, alertas, descrições e menus.
7. Garanta consistência entre termos utilizados no mobile e no web.
8. Corrija erros ortográficos, acentuação, concordância e capitalização.
9. Evite misturar inglês e português na interface.
10. Não altere nomes internos de APIs, rotas ou campos do banco apenas por motivos estéticos.

**Atenção: não quero esconder informações verdadeiras sobre limitações técnicas.**

Caso alguma funcionalidade ainda utilize dados de demonstração, substitua-os por integração real quando possível.

Se ainda depender de implementação ou aprovação, mantenha uma indicação honesta e profissional de indisponibilidade.

Não apresente dados fictícios como dados clínicos reais.

As contas de desenvolvimento e os mecanismos de teste podem continuar existindo em ambiente local, desde que isolados da experiência de produção.

---

# ETAPA 2 — PADRONIZAÇÃO PROFISSIONAL DA INTERFACE

## 3. MELHORAR A IDENTIDADE VISUAL DO VIVA+

Quero que todas as telas tenham aparência de uma plataforma profissional de acompanhamento de saúde.

Utilize as referências visuais originais e os 52 assets individuais integrados anteriormente.

Revise:

- Logotipos.
- Identidade visual.
- Paleta de cores.
- Tipografia.
- Tamanhos dos títulos.
- Espaçamento entre componentes.
- Alinhamento de botões.
- Ícones.
- Cards.
- Formulários.
- Gráficos.
- Tabelas.
- Cabeçalhos.
- Menus.
- Barras de navegação.
- Mensagens de confirmação.
- Estados de carregamento.
- Mensagens de erro.
- Telas sem dados.
- Responsividade.
- Acessibilidade.

Quero que as diferentes áreas do sistema pareçam fazer parte do mesmo produto.

Não quero uma tela com estilo profissional e outra com aparência improvisada.

### Qualidade das imagens

Revise as imagens utilizadas no aplicativo e no portal.

- Preserve os logotipos de maior resolução.
- Corrija proporções incorretas.
- Evite imagens pixeladas.
- Evite esticar fotografias ou ilustrações.
- Utilize imagens individuais nos módulos correspondentes.
- Prefira ícones vetoriais quando forem mais adequados.
- Não utilize textos embutidos em imagens quando isso comprometer acessibilidade.
- Não substitua imagens corretas apenas por preferência estética.

Compare os resultados com as referências originais.

Não declare fidelidade visual completa sem realizar essa comparação.

---

# ETAPA 3 — PROFISSIONALIZAR A EXPERIÊNCIA DO PACIENTE

## 4. REVISAR TODAS AS TELAS DO APLICATIVO

Quero que você percorra e revise todas as rotas existentes do aplicativo React Native/Expo.

### Boas-vindas e autenticação

- Apresentação institucional do Viva+.
- Login profissionalmente estruturado.
- Cadastro e ativação.
- Validação de formulários.
- Mensagens claras.
- Recuperação de acesso, conforme a implementação existente.
- Tratamento de erros.
- Navegação correta.

### Home do paciente

A tela inicial deve apresentar:

- Saudação personalizada.
- Identificação correta do paciente.
- Resumo do acompanhamento.
- Acesso aos módulos.
- Lembretes relevantes.
- Informações objetivas.
- Ícones adequados.
- Navegação intuitiva.

Não exiba números fictícios apenas para preencher cards.

Quando não existirem registros, apresente estados vazios profissionais, como:

"Nenhuma medição registrada até o momento."

### Pressão arterial

- Melhorar apresentação das medições.
- Padronizar nomenclatura.
- Revisar resultados.
- Melhorar gráficos e histórico.
- Corrigir filtros e períodos.
- Validar persistência.
- Garantir apresentação clara dos dados.

Não gerar diagnósticos automáticos sem critérios clínicos aprovados.

### Medicamentos

- Melhorar listagem e horários.
- Padronizar mensagens.
- Revisar confirmações de uso.
- Melhorar histórico.
- Garantir clareza sobre registros realizados e pendentes.
- Manter integração com a API.

### Alimentação

- Melhorar registro de refeições.
- Revisar seleção de imagens.
- Padronizar apresentação dos resultados.
- Melhorar histórico.
- Corrigir textos genéricos.

Não tratar resultados de análise automatizada como avaliação clínica definitiva.

### Atividade física

- Melhorar a visão semanal.
- Revisar telas de exercícios.
- Padronizar orientações e botões.
- Melhorar ilustrações e navegação.
- Revisar estados de atividade realizada, pendente e programada.

Não criar recomendações clínicas específicas sem conteúdo aprovado.

### Histórico

- Melhorar organização dos registros.
- Revisar filtros.
- Melhorar apresentação das informações.
- Corrigir mensagens vazias.
- Garantir consistência com os registros persistidos.

### Perfil e configurações

- Melhorar a apresentação dos dados.
- Finalizar preferências persistentes.
- Padronizar campos e botões.
- Melhorar acessibilidade.
- Validar edição e salvamento.
- Garantir consistência após fechar e reabrir o aplicativo.

---

# ETAPA 4 — PROFISSIONALIZAR O PORTAL DOS PROFISSIONAIS

## 5. APRIMORAR O PORTAL NEXT.JS

Quero que o portal seja apresentado como uma verdadeira plataforma de acompanhamento profissional.

Revise:

### Painel principal

- Títulos profissionais.
- Indicadores coerentes.
- Informações provenientes da API.
- Cards organizados.
- Estados vazios adequados.
- Navegação consistente.

### Pacientes

- Cadastro.
- Edição.
- Busca.
- Filtros.
- Perfil do paciente.
- Histórico.
- Informações demográficas.
- Validação dos dados.

### Acompanhamento

- Pressão arterial.
- Medicamentos.
- Alimentação.
- Atividade física.
- Consultas.
- Evolução do paciente.
- Indicadores e gráficos.

### Relatórios

- Padronizar os títulos.
- Corrigir informações incompletas.
- Melhorar filtros.
- Melhorar visualização.
- Garantir que os números apresentados correspondam aos dados consultados.
- Identificar limitações de paginação ou agregação.

Não apresente indicadores parciais como totais completos.

### Configurações

- Dados do profissional.
- Preferências persistentes.
- Controles de acesso.
- Logout.
- Mensagens adequadas de confirmação.

**Quero eliminar a sensação de que o portal é um protótipo, sem ocultar limitações reais.**

---

# ETAPA 5 — RESOLVER AS PENDÊNCIAS TÉCNICAS

## 6. CORRIGIR OS ALERTAS DE SEGURANÇA

O último relatório identificou:

**2 alertas de severidade alta e 2 alertas de severidade moderada nas dependências JavaScript.**

Quero que você:

1. Execute novamente a auditoria.
2. Identifique os pacotes afetados.
3. Analise os caminhos de dependências.
4. Verifique versões corrigidas disponíveis.
5. Avalie compatibilidade com Expo, React Native, Next.js e demais bibliotecas.
6. Corrija os alertas quando houver atualização segura.
7. Execute testes de regressão.
8. Documente alertas que não puderem ser resolvidos.
9. Não utilize supressões apenas para ocultar vulnerabilidades.
10. Não faça atualizações em massa sem avaliar impacto.

Dê prioridade aos problemas de maior severidade e maior possibilidade real de exploração.

Não considere o sistema pronto para produção caso permaneçam riscos relevantes sem tratamento ou decisão formal.

## 7. VALIDAR BACKUP E RESTAURAÇÃO DO POSTGRESQL

O projeto já utiliza migrações Flyway V1–V6.

Quero que você:

- Verifique o estado atual das migrações.
- Prepare um procedimento atualizado de backup.
- Teste a restauração em um banco isolado.
- Confira a integridade dos dados restaurados.
- Preserve arquivos cifrados e permissões.
- Documente os comandos necessários.
- Garanta que o processo não afete o banco principal.

Não apague ou sobrescreva o banco existente.

A última execução utilizou PostgreSQL portátil 17.9, na porta 55432, com usuário `viva` e banco `vivamais`.

Verifique a configuração real antes de executar comandos. Não presuma que o ambiente utiliza PostgreSQL 18 na porta 5432.

## 8. FINALIZAR PREFERÊNCIAS E CONFIGURAÇÕES

O relatório anterior informou que a preferência de texto ainda é temporária.

Quero que você:

- Identifique exatamente quais preferências ainda não persistem.
- Implemente persistência adequada.
- Garanta recuperação após reiniciar a aplicação.
- Respeite as permissões do usuário.
- Valide o comportamento em sessões diferentes.
- Corrija inconsistências entre web e mobile quando aplicável.

Não utilize armazenamento inseguro para informações sensíveis.

## 9. APRIMORAR GRÁFICOS, TABELAS E FILTROS

Revise os componentes de acompanhamento.

O relatório anterior identificou limitações de paginação e quantidade de registros exibidos.

Quero que você:

- Identifique os limites existentes.
- Corrija problemas de navegação.
- Melhore os filtros por período.
- Revise paginação e ordenação.
- Implemente agregações completas quando necessárias e tecnicamente viáveis.
- Diferencie indicadores completos de visualizações parciais.
- Garanta consistência entre gráficos e tabelas.
- Trate carregamento, falha e ausência de registros.

Evite números incompletos apresentados como resultados definitivos.

---

# ETAPA 6 — CONTINUAR AS FUNCIONALIDADES PENDENTES

## 10. ANALISAR O INVENTÁRIO E IMPLEMENTAR O QUE AINDA FALTA

Consulte `PROGRESSO.md`, `STATUS.md`, `PROXIMA_EXECUCAO.md` e `INVENTARIO_TELAS.md`.

Identifique as funcionalidades ainda incompletas.

Priorize:

1. Navegação e funcionalidades interrompidas.
2. Formulários e ações sem persistência.
3. Telas com estados vazios incorretos.
4. Configurações e preferências.
5. Funcionalidades do portal profissional.
6. Histórico e relatórios.
7. Correções de inconsistência visual.
8. Melhorias de acessibilidade.
9. Testes e validações de integração.
10. Preparação para a próxima etapa de disponibilização do produto.

Não recrie funcionalidades já concluídas.

### Integrações externas e aprovações

Existem dependências relacionadas a:

- Conteúdo e critérios clínicos aprovados.
- Análise alimentar.
- Protocolos de atividades.
- Vídeos de orientação.
- Fornecedores externos.
- Integração com pulseiras/dispositivos.
- Revisão jurídica e institucional.
- Hospedagem.
- Publicação nas lojas.

Não invente aprovações nem implemente comportamentos clínicos sem requisitos validados.

Avance nas partes técnicas independentes dessas aprovações, como interfaces, contratos de integração, tratamento de erros, validações e configurações.

Quando houver bloqueio externo, registre claramente a dependência.

## 11. REVISAR PÁGINAS INSTITUCIONAIS

Analise as páginas de:

- Suporte.
- Privacidade.
- Exclusão de conta.
- Termos de uso, caso existam.
- Informações institucionais.

Quero linguagem profissional, porém não invente:

- E-mails de suporte.
- Telefones.
- Endereços institucionais.
- Responsáveis pelo tratamento de dados.
- Prazos legais.
- Aprovações clínicas.
- Certificações.
- Convênios.
- Políticas oficialmente aprovadas.

Se os dados institucionais ainda não estiverem definidos, mantenha a funcionalidade honestamente sinalizada como pendente de configuração ou revisão, sem apresentar canais fictícios como oficiais.

---

# ETAPA 7 — GARANTIR EXPERIÊNCIA PRÓXIMA DE PRODUÇÃO

## 12. SEPARAR CORRETAMENTE DESENVOLVIMENTO E PRODUÇÃO

Quero que o Viva+ tenha uma estrutura adequada para uma futura implantação real.

Configure e revise a separação entre:

**Ambiente de desenvolvimento**
- Contas de desenvolvimento.
- Dados sintéticos.
- Ferramentas de teste.
- Logs locais.
- Serviços locais.
- Diagnósticos.

**Ambiente de produção**
- Configurações seguras.
- Autenticação e autorização.
- Dados persistentes reais.
- Proteção de credenciais.
- Tratamento de erros sem exposição de informações internas.
- Logs controlados.
- Ausência de contas automáticas de desenvolvimento.
- Ausência de dados fictícios apresentados como reais.

Não quero palavras como "demo", "mock" ou "protótipo" aparecendo desnecessariamente na interface normal.

Entretanto, preserve os identificadores, configurações e ferramentas de teste que forem necessários para o desenvolvimento, mantendo-os isolados da execução produtiva.

Não altere diretamente as contas de desenvolvimento ou os mecanismos de autenticação sem garantir a continuidade dos testes locais.

Crie verificações de configuração que impeçam a ativação acidental de recursos exclusivos de desenvolvimento em produção.

**Não faça implantação em produção nesta execução.**

O objetivo é elevar a qualidade técnica e visual para futura disponibilização.

---

# ETAPA 8 — TESTES E VALIDAÇÃO

## 13. EXECUTAR UMA NOVA RODADA COMPLETA DE TESTES

Depois de implementar as melhorias, execute:

- Testes unitários Java.
- Testes de integração PostgreSQL.
- Testes de autenticação e autorização.
- Testes de API.
- Testes frontend.
- Verificação TypeScript.
- ESLint.
- Build Next.js.
- Export Expo.
- Testes E2E.
- Verificações de segurança.
- Verificações de acessibilidade disponíveis.
- Comparação visual com os protótipos.

Valide os fluxos:

**Paciente:**

Cadastro/Ativação → Login → Home → Pressão → Medicamentos → Alimentação → Atividade Física → Histórico → Perfil → Configurações → Logout.

**Profissional:**

Login → Painel → Pacientes → Cadastro/Edição → Acompanhamento → Consultas → Relatórios → Configurações → Logout.

Confirme que as alterações de nomenclatura não quebraram os testes, identificadores de acessibilidade ou navegação.

Não declare testes nativos Android/iOS como aprovados se somente as exportações tiverem sido executadas.

---

# ETAPA 9 — DOCUMENTAÇÃO E ENTREGA

## 14. ATUALIZAR O PROGRESSO E CRIAR RELATÓRIO

Atualize:

- `PROGRESSO.md`
- `STATUS.md`
- `PROXIMA_EXECUCAO.md`
- Documentos de fidelidade visual.
- Relatório de dependências e segurança.
- Guias de execução e testes, quando os fluxos mudarem.

Crie também:

`docs/evidencias/PROFISSIONALIZACAO_VIVAMAIS_2026-10-20.md`

O relatório deve informar:

1. Quais textos foram profissionalizados.
2. Quais telas foram modificadas.
3. Quais imagens e componentes foram aprimorados.
4. Quais funcionalidades pendentes foram concluídas.
5. Quais problemas técnicos foram corrigidos.
6. Qual foi o resultado dos alertas de segurança.
7. Se o backup e a restauração passaram.
8. Quais testes foram executados.
9. Quais diferenças visuais permanecem.
10. Quais dependências externas ainda impedem a conclusão de funcionalidades.

Inclua capturas das telas atualizadas.

## 15. PRESERVAÇÃO E SEGURANÇA

- Não reinicie o projeto.
- Não descarte alterações locais.
- Não execute `git reset --hard` nem `git clean`.
- Não apague tabelas ou registros do banco principal.
- Não modifique as migrações já aplicadas.
- Não execute commit ou push sem autorização.
- Não publique o sistema.
- Não utilize credenciais reais em código ou documentação versionada.
- Não introduza contas de acesso sem autorização.
- Não comprometa a autenticação para facilitar testes.
- Não apresente funcionalidades incompletas como concluídas.

---

# INSTRUÇÃO FINAL — EXECUTAR O TRABALHO

Quero que o Viva+ evolua para uma **plataforma profissional de acompanhamento de saúde**, com linguagem adequada, interface consistente e funcionalidades reais.

Minha prioridade nesta execução é:

**1. Profissionalizar todos os textos visíveis ao usuário.**

**2. Corrigir nomenclaturas genéricas e referências desnecessárias a demonstrações.**

**3. Melhorar o visual das telas existentes.**

**4. Resolver as pendências técnicas documentadas, especialmente segurança, persistência, backup/restauração e inconsistências funcionais.**

**5. Continuar implementando funcionalidades pendentes que não dependam de aprovações externas.**

**6. Testar tudo novamente e preservar o funcionamento do projeto.**

Não encerre a execução após apenas substituir algumas palavras.

Quero alterações reais no código, nas interfaces, nas funcionalidades e na documentação.

Ao finalizar, apresente um resumo objetivo do que foi concluído e do que ainda falta para o Viva+ estar tecnicamente e institucionalmente preparado para produção.

**COMECE AGORA PELA AUDITORIA DOS TEXTOS VISÍVEIS E PELAS PENDÊNCIAS PRIORITÁRIAS, IMPLEMENTANDO AS CORREÇÕES EM SEGUIDA.**
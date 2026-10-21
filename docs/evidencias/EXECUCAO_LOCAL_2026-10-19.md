# Execução local e testes do Viva+ — 19–20/10/2026

Entrega do pedido iniciado em 19/10 e validado durante a madrugada de 20/10 (Brasília). O nome do arquivo conserva a data do pedido. Esta entrega prepara a execução e o ensaio pessoal do que existe, corrige defeitos encontrados e avança o acompanhamento; não declara concluídas todas as fases, recomendações clínicas ou publicação nas lojas.

## Ponto de retomada e preservação

O módulo anterior de acesso/cadastro/ativação → Home → módulos → perfil/histórico, demografia, telefone e semana já estava implementado. Foram lidos o novo pedido integral, AGENTS, README, PROGRESSO, STATUS, REQUISITOS, ADR001, COMO_NAVEGAR, TELAS_NAVEGAVEIS e RETOMADA. O Git foi examinado na raiz correta; a pasta `p` não é o repositório, o Git do projeto está em `outputs/viva-mais`. Havia alterações anteriores, sem arquivos no stage; foram preservadas. Snapshot inicial de nomes em work/git-antes-20261019.txt, fora do Git.

Os processos anteriores estavam parados. A primeira pendência desta etapa era iniciar/verificar os serviços reais e oferecer instruções reproduzíveis. Não foram recriados cadastro, banco ou arquitetura. Expo raiz, Next em web e Spring Boot em backend/demo permanecem. V1–V6 não foram editadas nesta execução. Nenhum commit, push, reset, clean, repositório aninhado ou publicação foi feito.

## Começar os testes

1. [Guia completo Windows](../GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md): abrir projeto, verificar versões, selecionar Java, banco, três terminais, execução automática, testes, encerramento e problemas comuns.
2. [Guia de todas as telas](../GUIA_TESTES_TODAS_AS_TELAS.md): ações, campos, resultados e persistência por fluxo real.
3. [Checklist para preencher](../CHECKLIST_TESTES_MANUAIS.md): 60 itens classificados e ensaios transversais, sem aprovações preenchidas pelo agente em nome do usuário.
4. [Inventário](../INVENTARIO_TELAS.md): 49 arquivos de tela, 30 rotas canônicas Expo, 11 páginas Next, seis compatibilidades e dois estados técnicos. Abas/estados não são tratados como novas páginas.
5. [Capturas](testes-manuais/LEIA-ME.md): manifesto de 52 PNG reais, 35 pares de referência e três painéis.

No PowerShell da raiz, `Iniciar-VivaMais.cmd` encontra o PowerShell 7.6.5 local e chama o controlador. O modo padrão mantém o terminal aguardando Enter; o modo `-AguardarSinal` recebe o pedido de `infra/encerrar-local.ps1`. Serviços são iniciados em sequência e só são anunciados prontos após HTTP/saúde. Há também comandos independentes e expandidos para três terminais.

Paciente: http://127.0.0.1:8081/acesso. Profissional: http://127.0.0.1:3000. API: http://127.0.0.1:8080/actuator/health. Contas `.a` de paciente/profissional e senha privada em work/demo-credentials.json; os guias explicam consulta local sem exibir a senha. Para nova pessoa, cadastro profissional → código único → ativação → login. A sessão do Expo Web é em memória; F5 exige novo acesso.

## Ambiente efetivamente encontrado

| Item | Estado |
|---|---|
| Java | JDK Microsoft21.0.10 em C:/Users/joaos/.jdks/ms-21.0.10; JAVA_HOME correto, PATH ainda encontrava Java8 primeiro; seleção corrigida por processo nos scripts |
| Maven | Wrapper3.9.11, cache existente preservado; não reinstalado |
| Node/npm/pnpm | 24.15.0 / 11.12.1 / 10.28.2; chamada do pnpm fixado verificada; lock preservado |
| Frameworks | Spring Boot3.5.16, Next16.4.2, React19.2.3, TS5.9.3, Expo57.0.21/RN0.86.3 |
| PostgreSQL | Portátil17.9, usuário viva, banco vivamais,55432; viva_test separado para testes. Não é18 nem usuário vivamais |
| Migrações | API validou seis migrações e schema público v6 atualizado; schemas vazios dos testes receberam V1–V6 |
| OCR | Worker Node/Tesseract.js e modelo local existentes; teste real passou |
| Docker/Android/iOS | Docker não localizado; SDK/dispositivos nativos não usados; sem APK/AAB/IPA ou Xcode no Windows |

O cluster PostgreSQL foi iniciado a partir do diretório existente, recuperando o encerramento anterior sem apagar dados. Encontrado HBA TCP trust e papel local sem senha: substituídos por SCRAM e credencial aleatória privada em work/postgres-local-credentials.json. Com senha, conexão passou; sem senha, foi negada. Banco/usuário/porta, dados e chave foram preservados. Backup da configuração HBA anterior fica somente em work/pg-data; não restaurar trust como solução de login. Detalhes de erro/SQL do servidor foram minimizados para impedir impressão de identificadores sintéticos em falhas de constraints. Nenhum valor de senha é distribuído com o código.

Atualizar um cluster17 para18 não fazia parte da preparação segura: não foi trocado executável nem diretório de dados. O guia explica o cenário existente e a instalação alternativa em5432/usuário vivamais. Hospedagem econômica anterior preservada; nenhum recurso externo criado.

## Correções e continuação do desenvolvimento

| Problema / melhoria | Resultado |
|---|---|
| Iniciar tudo exigia comandos internos dispersos | Atalho CMD e scripts de diagnóstico/banco/API/portal/Expo, controle de portas, espera de saúde, logs privados e encerramento restrito à árvore registrada |
| Java8 no PATH | JDK21 selecionado explicitamente, sem editar o Windows; guia ensina conferir/corrigir prioridade |
| Expo localhost atendia só IPv6 | Resolução IPv4 priorizada; 127.0.0.1:8081 funciona |
| Perfil funcional novo e pulseira ausente devolviam200 vazio | GET passa a204, sem tentar interpretar JSON vazio. Perfil/idade de novo cadastro deixam de falhar; autorização e200 quando presente preservados; contrato atualizado |
| Resultado de pressão aberto sem ids | Orientação para registro/histórico, sem carregamento infinito |
| Orientações gerais da atividade sem ligação pela entrada | Botão real abre a rota existente, distinta de Mensagens |
| Idade ausente na etapa de informações | Cálculo a partir do nascimento e data de Brasília, com aniversário/ausência/data inválida testados; não inventa perfil ou autorização clínica |
| Pressão no portal só tinha campos de data | Atalhos7/30dias/todos sobre as APIs existentes; período corrido inclui o minuto atual; limite de20 por página/gráfico declarado |
| Medicamentos só reuniam um dia | Seletor1/7datas, agregação completa pela API, contagens Tomei/Não tomei/Sem confirmação e tabela por período; falha em qualquer dia oculta total em vez de apresentar número parcial |
| Rótulo da observação alimentar | Campo recebe nome acessível real |
| Diagnósticos de falha poderiam expor inputs | Helper filtra saída e sanitiza snapshots textuais; trace/vídeo/foto automática desativados; capturas explícitas mascaram senhas/códigos visíveis |

Na inspeção visual foi encontrado o seletor de datas/autorrelatos sem separação dos rótulos. Ele foi ajustado aos componentes/estilos de formulário existentes, sem trocar o design. Faixas magenta nas capturas de acesso são máscaras de privacidade; não fazem parte da interface.

## Testes e evidências

| Verificação | Resultado e limites |
|---|---|
| Java21/Maven verify final | **5 unitários +21 integrações =26**, zero falhas/erros/skips, PostgreSQL real, OCR real; novo teste de200/204/isolation dos recursos opcionais. work/java-local-final-20261019.log |
| Vitest final | **15 app +23 web =38**, aprovados. Idade/aniversário, datas que atravessam ano/mês, período completo e falha de um dos dias cobertos |
| TypeScript/lint | App, web, contratos e tokens aprovados; ESLint aprovado; sintaxe PowerShell conferida e arquivos com BOM para compatibilidade de leitura no Windows |
| Next produção | Build/Webpack aprovado,16 entradas incluindo endpoints e fallback; preparador de diretórios gerados contorna EPERM da sandbox, sem apagar fontes. work/next-local-entrega-20261020.log |
| Expo | Export web e export all Android/iOS/web aprovados, incluindo Hermes.hbc nativos. Não são binários assinados nem ensaio físico. work/expo-local-plataformas-20261019.log |
| E2E completo | **12 aprovados**, sem skips, em produção local; cadastro/ativação/pressão/OCR/filas/medicamentos/fotos/perfil/atividade/consulta/autorizações e novo período/idade. work/e2e-local-completo-20261020.log |
| Regressão final de períodos/idade após o ajuste visual | **1 E2E aprovado**,11,2s, sem alteração das regras clínicas/autorização |
| Após encerrar/reiniciar pelo atalho | **7 E2E aprovados**,14,6s: paciente/profissional, páginas públicas, revogação, CSRF, rotas protegidas e preview; servidor/banco reais |
| Persistência no reinício | [reinicio.json](testes-manuais/reinicio.json): API/portal/app encerrados, três portas livres, reinício pelo CMD, mesmas contagens em oito tabelas clínicas e mesmo hash conjunto de objetos/chave. PostgreSQL existente reutilizado, não alegar desligamento dele nesse ensaio |
| Capturas/visual | **52 capturas**,35 pares e3painéis; originais anteriores preservados. Panéis e telas adicionais inspecionados. Fonte/escala/alguns espaçamentos e conteúdo dependente de aprovação ainda diferem |
| Auditoria JS | **0 críticos,2 altos,2 moderados**, exit1,922 dependências; alerta mantido, sem ignore/upgrade oportunista. Não declarar CI remota verde |

As primeiras tentativas de automação falharam em seletores que também encontravam cenas Expo ocultas, na leitura JSON do perfil ausente e na identificação exata de labels/alertas do Next. Foram corrigidos o defeito da API e os seletores, e as suítes foram repetidas. Na sandbox, WMI/taskkill/console de progresso não funcionaram de forma confiável: o controlador usa PowerShell7/.NET, progresso de download desativado e um sinal em arquivo privado para receber encerramento de outra execução. Falhas anteriores não foram contadas como aprovação.

As 42 capturas anteriores não eram42rotas: Home repetida na sequência de atividade, ficha com várias abas, formulários/conclusões da mesma rota e orientação com nome herdado da referência. O inventário confere49arquivos, classifica60itens e não inventa uma rota para a notificação do SO. Rota não encontrada e notificação nativa permanecem explicitamente sem ensaio próprio; análise alimentar, exercícios/vídeo, hardware e documentos institucionais têm classificação parcial.

## Arquivos desta entrega

| Grupo | Fontes novas/alteradas |
|---|---|
| Inicialização | Iniciar-VivaMais.cmd; infra/ambiente-local.ps1; executar-local.ps1; iniciar-local.ps1; encerrar-local.ps1; preparar-build-web.mjs; validar-interface-local.ps1; sanitizar-diagnosticos.mjs |
| App | app/atividade-fisica/index.tsx; app/pressao/resultado.tsx; components/FluxoFotografia.tsx; RoteiroAtividade.tsx; services/atividades/atividades.ts e idade.ts; tsconfig.json (Expo removeu include de expo-env desnecessário com typedRoutes desativado) |
| Portal | web/components/CuidadoPaciente.tsx; TabelaCuidado.tsx; web/services/periodosCuidados.ts |
| Backend/contrato | CuidadoController.java; CuidadoIT.java; backend/demo/openapi.json; packages/contracts/src/generated.ts. Sem migration nova |
| Testes | tests/mobile/idade.test.ts; web/services/periodosCuidados.test.ts; tests/e2e/execucao-local.spec.ts; foundation.spec.ts; mobile-web.spec.ts |
| Documentação/evidência | Os três guias/checklist solicitados, INVENTARIO_TELAS.md, infra/inventariar-telas.mjs, README, PROGRESSO, STATUS, PROXIMA_EXECUCAO, FIDELIDADE_VISUAL, DEPENDENCIAS_SEGURANCA, CHANGELOG, AGENTS, backend/demo/README; este relatório e testes-manuais (PNG, manifesto, inventário, reinício, recurso OCR e comparações) |
| Reprodução de capturas | infra/capturar-telas.mjs e comparar-telas.py aceitam diretório de evidência sem sobrescrever as capturas anteriores |

A relação detalhada fica em [arquivos desta execução](ARQUIVOS_EXECUCAO_LOCAL_2026-10-20.txt). Ela não representa stage/commit nem atribui a esta execução as centenas de alterações anteriores.

## Pendências e próximo passo

Continuar autoria nominativa e nomenclatura auxiliar, refino de fonte/escala/ícones e diferenças da matriz visual; backup/restore atualizado após V6; solução dos quatro alertas de dependências com validação de compatibilidade. A preferência de texto ainda é temporária. A tabela/gráfico usa paginação declarada; não afirmar análises agregadas completas onde não existem.

Dependências reais: conteúdo/critério clínico aprovado para atividade e alimentação, vídeo, fornecedor externo, protocolo/aparelho de pulseira, revisão jurídica/institucional e credenciais de hospedagem/lojas. Ensaiar câmera, SecureStore/SQLCipher, notificações, leitores de tela e acessibilidade em Android/iOS físicos. Não apresentar os rascunhos de suporte/exclusão como canais institucionais funcionais. Nenhum pagamento, mensagem a terceiros ou publicação foi realizado.

Os serviços locais são deixados ativos, mas podem encerrar ao sair do ambiente; use o atalho e os guias após reiniciar o computador. Não refazer cadastro/semana/controle de acesso já validados nem recriar a fundação.

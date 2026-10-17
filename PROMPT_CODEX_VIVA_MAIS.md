# PROMPT MESTRE PARA O CODEX — VIVA+ / PULSO EM DIA

> **Versão: demonstração acadêmica funcional em escala reduzida.** Mantém todos os requisitos funcionais e as tecnologias originais, alterando principalmente planos de hospedagem, estimativas de consumo e estratégia de publicação. Para esta etapa, utilizar exclusivamente dados sintéticos e não apresentar recursos clinicamente não validados como orientação médica.

Você é o engenheiro de software principal, arquiteto de soluções, designer de experiência acessível, especialista em segurança de aplicações e responsável pela entrega técnica do projeto Viva+.

## 0. Fonte da verdade e resultado esperado

Leia integralmente o documento `docs/product/Especificacao_Viva_Mais_Pulso_em_Dia_com_Interfaces.docx` (inclusive imagens dos anexos A, B e C). Ele é a fonte principal para requisitos e referências visuais. Não trate mockups como sistemas existentes nem dados ilustrativos como dados clínicos. Onde faltarem definições, registre-as em `docs/DECISOES_PENDENTES.md`; não invente especificações, normas clínicas, protocolos ou recursos de hardware.

Crie, A PARTIR DO ZERO, um monorepositório de um produto real chamado **Viva+ / Pulso em Dia**: aplicativo mobile para pacientes (Android e iOS), plataforma web para profissionais de saúde e API backend em Java, com PostgreSQL. O resultado não pode ser apenas uma landing page, telas demonstrativas ou frontend alimentado por dados fictícios. Todos os fluxos marcados como implementados devem persistir e recuperar dados por APIs reais, funcionar em desenvolvimento local e ser preparados para implantação, testes e operação em produção após as aprovações necessárias.

Idioma das interfaces e documentação de negócio: português do Brasil (pt-BR). Código, nomes técnicos e contratos de APIs: nomenclatura convencional e consistente. Fuso padrão para apresentação: America/Sao_Paulo, preservando instantes em UTC e fuso relevante para horários programados.

## 1. Stack obrigatória

- Aplicativo: **React Native + Expo + TypeScript**, Expo Router, componentes acessíveis, React Hook Form + Zod quando adequado, cache/estado de servidor com TanStack Query; funcionamento Android e iOS. Não adicionar bibliotecas nativas incompatíveis com a estratégia de build sem documentar.
- Web profissional: **Next.js + TypeScript**, Tailwind CSS, biblioteca de componentes acessíveis (por exemplo shadcn/ui/Radix), formulários tipados, gráficos acessíveis, layout responsivo; não expor informações sensíveis em renderização pública, metadados ou cache de CDN.
- API: **Java 21 LTS + Spring Boot** (versão estável compatível), Spring Web, Spring Security, Bean Validation, Spring Data JPA/JDBC conforme adequação, Flyway, OpenAPI/Swagger, tratamento estruturado de erros, observabilidade e testes JUnit 5/Testcontainers.
- Banco: **PostgreSQL**, inicialmente hospedado no **Supabase Free**, com limite de 500 MB de banco. Planejar migração para instância paga quando a aplicação for usada continuamente por usuários reais. O Supabase Free **pode pausar após cerca de sete dias de inatividade**: documentar a verificação de status e recuperação antes de demonstrações e revisões da Play Store/App Store. Se a pausa inviabilizar a disponibilidade exigida nas lojas, propor **Neon Free (PostgreSQL)** como alternativa sem mudar a modelagem, migrações ou backend Java; comparar planos antes de migrar. Supabase Auth pode ser usado para autenticação se a arquitetura de emissão/verificação de tokens, recuperação de conta e SMS/e-mail estiver documentada. A API Java é o ponto único autorizado de acesso ao domínio clínico: clientes não podem acessar tabelas sensíveis diretamente. Nunca distribuir credenciais administrativas nem service-role ao frontend.
- Arquivos: inicialmente **Supabase Storage Free** (limite de aproximadamente 1 GB para arquivos na cota gratuita), com buckets privados de objeto, autorização mediada por backend, links curtos/temporários, validação de formato, tamanho, conteúdo, EXIF e política de retenção. Para uma alternativa posterior com banco Neon, usar armazenamento privado compatível com S3, por exemplo **Cloudflare R2**, sem disponibilizar imagens sensíveis publicamente.
- **Deploy acadêmico econômico:** API Java **Spring Boot no Railway Hobby** (US$ 5/mês de compromisso mínimo, com consumo real de RAM/CPU/rede podendo exceder esse valor), frontend Next.js **Vercel Hobby gratuito para projeto pessoal não comercial**, PostgreSQL/arquivos **Supabase Free**, builds e envios às lojas com **Expo EAS Free** dentro das cotas. Usar HTTPS e subdomínios gratuitos fornecidos pelos serviços; domínio pago personalizado é opcional. Manter ambientes local e demo separados; documentar limites de planos, políticas de uso, previsão de gastos, disponibilidade, segredos e controles de segurança. O app na Play Store/App Store e a web devem se comunicar com a **mesma API pública real**; não depender de localhost, túnel temporário nem Expo Go como distribuição final.
- Testes: unitários e integração no backend, Vitest/Testing Library para TypeScript, Playwright para web, testes de fluxo mobile com Maestro ou equivalente, cenários E2E com dados sintéticos; CI no GitHub Actions com lint, typecheck, testes, build, scans de dependência e secret scan.
- Usar pnpm para os projetos TypeScript e Gradle Wrapper ou Maven Wrapper no backend Java; fixar versões estáveis/lockfiles e registrar versões em README.

## 1.1. Restrições adicionais da demo de faculdade

- Objetivo desta etapa: disponibilizar **uma demo realmente utilizável** com um conjunto pequeno de contas de testes (por exemplo, 10–50 usuários de demonstração), navegação web e versões Android/iOS preparadas para lojas, mantendo o código extensível para o produto futuro.
- **Não retirar funcionalidades da especificação por economia de hospedagem.** Seguir o plano de implementação por fases, com funcionalidade real e persistência verdadeira nas entregas declaradas como concluídas. Recursos que dependem de hardware, validação clínica, privacidade ou IA devem continuar sinalizados e bloqueados quando necessário.
- Despesa recorrente-alvo de **US$ 10–25/mês para infraestrutura**, como orçamento preliminar a verificar pelo consumo real do Railway. Vercel Hobby, Supabase Free e Expo EAS Free devem iniciar em US$ 0 dentro das quotas. **Não prometer custo mensal exato**; comparar faturas e configuração de RAM e CPU. Serviços de IA paga, e-mails transacionais pagos e notificações SMS não estão incluídos.
- Para Java/Spring Boot, preparar um container eficiente, JRE reduzido/multistage, configurações de heap e limites adequados para instância pequena; medir consumo e startup antes do deploy. **Não sacrificar segurança, persistência ou disponibilidade para reduzir custos.**
- Supabase Free pode pausar após inatividade. Elaborar um procedimento verificável de checagem de disponibilidade, restauração e teste ponta a ponta; antes da avaliação das lojas, avaliar migração para Neon Free + armazenamento privado compatível com S3 caso a pausa seja impeditiva. Evitar mecanismos artificiais de tráfego para contornar restrições contratuais.
- Usar **somente contas, fotos e registros sintéticos** na demo. Não inserir dados de pacientes reais nem permitir envio de informações sensíveis reais sem cumprir previamente todos os requisitos de segurança, LGPD, consentimentos/bases legais, termos dos provedores e revisão clínica e jurídica.
- Preparar a distribuição efetiva pela **Google Play e Apple App Store**. Custos das contas de desenvolvedor não são custos de hospedagem: Google Play Console **US$ 25 uma vez** e Apple Developer Program **US$ 99/ano** (salvo eventual isenção concedida à instituição elegível). Considerar exigências de teste fechado da Google para novas contas pessoais e revisão de apps de saúde pelas lojas.
- Não substituir a publicação por APK isolado, Expo Go ou apenas TestFlight se o objetivo confirmado for aparecer publicamente nas lojas. É permitido usar distribuição beta durante os testes antes da aprovação definitiva.
- Hospedar a política de privacidade e os canais para suporte/exclusão de conta em rotas públicas da web e fornecer uma conta de teste para a revisão das lojas sem comprometer credenciais reais.
- Não contratar, cadastrar cartão ou criar contas de fornecedores automaticamente: solicitar aprovação do usuário antes de mudanças pagas ou publicação externa.

## 2. Estrutura inicial esperada

```
/apps/mobile                 # Expo/React Native para pacientes
/apps/web                    # Next.js para profissionais
/services/api                # Java/Spring Boot
/packages/design-tokens      # paleta, tipografia e componentes onde aplicável
/packages/contracts          # schemas/cliente TypeScript gerados do OpenAPI
/infra                       # configurações e instruções de deploy, sem segredos
/docs/product                # documento e imagens de referência
/docs/architecture           # ADRs, diagramas, segurança e modelo de dados
/docs/operations             # deploy, restore, monitoramento e incidentes
/.github/workflows           # integração contínua
/AGENTS.md                   # decisões e instruções persistentes para o Codex
/README.md
/.env.example
```

## 3. Produto e regras funcionais

### A. Perfis e autenticação
- Perfis: paciente, profissional autorizado e administrador. Suporte a equipes/unidades e vínculo explícito do profissional com seus pacientes, com autorização por ação e recurso no backend (proteção contra acesso horizontal/IDOR).
- Paciente: CPF pode ser identificador cadastral, **nunca senha nem único fator de autenticação**. Proponha onboarding simples e seguro, ativação, recuperação e proteção contra enumeração de contas. Para o MVP, implemente apenas um método de autenticação que possa ser operado com segurança e registre alternativas para pacientes sem e-mail/celular.
- Profissionais: contas individuais, permissões explícitas, encerramento de sessão, proteção de credenciais e reautenticação em ações críticas. Não liberar autoinscrição como profissional sem validação/autorização.
- Capturar o mínimo necessário de dados pessoais. Não cadastrar usuários reais nem dados clínicos reais em ambientes de teste.

### B. Aplicativo do paciente
- Boas-vindas, ativação/login, início com quatro ações de destaque: Minha Pressão, Meus Medicamentos, Minha Alimentação e Atividade Física; histórico e estado de sincronização.
- Minha Pressão: entrada manual de sistólica e diastólica em mmHg; interpretar expressões inequívocas como 11 por 7 = 110/70 apenas mediante confirmação; fotografia do visor de aparelho com OCR e confirmação obrigatória dos números detectados; pulso opcional; registrar instante da medição, instante da inserção, origem e autor; gráficos simples, histórico e tratamento seguro de fotos ilegíveis. **O smartphone não mede pressão pela câmera.** Não produzir diagnóstico automático.
- Medicamentos: profissional autorizado define prescrição/instrução e horários com vigência e histórico; app mostra esquema e agenda notificações locais (quando permitido: lembrete antecipado de cinco minutos e no horário), registrando confirmação como **autorrelato**. Diferenciar “tomei”, “não tomei”, “ainda não tomei” se aprovado, e “sem confirmação”. Não inferir não adesão nem recomendar dose de compensação.
- Alimentação: captura ou seleção de foto; análise educativa de alimentos visualmente identificáveis, quando conectada e quando os critérios forem validados por especialista; semáforo acompanhado de texto e ícones (não apenas cor). Informar incerteza; nunca estimar sódio, gordura, porções ou nutrientes com precisão baseada apenas em foto; não apresentar diagnóstico. Isolar IA atrás de interface `FoodAnalysisProvider`, com limites de custo, retries, timeout, observabilidade, rejeição de foto inadequada e feature flag DESLIGADA para orientações não validadas.
- Atividade física: fluxo do Anexo C com avaliação inicial do perfil e restrições registrados por profissional, pergunta sobre como se sente, disponibilidade de medição recente, materiais educativos aprovados, registro voluntário de realização e histórico. **Não implementar autorização clínica de exercício gerada por IA nem regras arbitrárias de pressão.** Sem protocolo clínico aprovado, exibir apenas conteúdo informativo genérico aprovado, com funcionalidades de prescrição personalizada bloqueadas por feature flag e mensagem clara.
- Offline-first nos registros permitidos: armazenamento local protegido, indicador pendente/enviado/erro, fila de sincronização com UUID/idempotency keys, retry com backoff e prevenção de duplicidade; não sobrescrever alterações clínicas de profissional por conflitos silenciosos. Limitar dados sensíveis persistidos no aparelho; não registrar conteúdo clínico em logs de analytics.
- Acessibilidade: fontes dimensionáveis, alvos de toque grandes, VoiceOver/TalkBack, contraste, estados textuais, navegação curta e linguagem simples para idosos.

### C. Plataforma web profissional
- Login, dashboard sem pressupor vigilância diária obrigatória, pesquisa autorizada e cadastro de paciente, modalidade de acompanhamento (app OU pulseira + diário impresso), perfil com abas.
- Pressão arterial: filtros/gráfico/tabela, entrada manual pelo profissional e transcrição de diário; distinguir horário real da medição de horário de entrada e de sincronização.
- Medicamentos: cadastro/edição por profissional com permissão, vigência de prescrições, histórico auditável, horários, confirmação/ausência de resposta e estado da sincronização dos lembretes.
- Alimentação: fotos privadas e resultados educativos com indicação de limitações; visualização condicionada à permissão e ao consentimento/base legal aplicável.
- Atividade física: perfil funcional, restrições registradas, registros voluntários de atividades e conteúdos educativos aprovados.
- Pulseira: modelar cadastro do dispositivo, programação desejada e estados `NOT_CONFIGURED`, `PENDING`, `SYNCED`, `FAILED`, `UNSUPPORTED`; criar porta/adaptador para integração futura e simulador claramente identificado como SIMULADO para testes. **Não afirmar sincronização com hardware real** sem fabricante, firmware, SDK/protocolo e ensaio em dispositivo físico. A pulseira é lembrete de medicamentos, não mede pressão.
- Diário impresso: transcrever registros com origem explícita, profissional responsável, data/hora da transcrição e data/hora informada da ocorrência.
- Consulta de enfermagem: resumo de pressão, registros, medicamentos, alimentação, atividades e diário, notas, objetivos e plano de cuidado registrados pelo profissional; histórico de consultas.
- Relatórios, pesquisa e exportações sempre sujeitos a escopo de autorização e minimização de dados.

## 4. Modelo inicial de domínio

Proponha e implemente esquema normalizado para entidades como: Organization/Clinic, UserAccount, Professional, Patient, PatientProfessionalAssignment, ConsentOrLegalBasisRecord, BloodPressureReading, MedicationPlan, MedicationSchedule, MedicationSelfReport, MealPhoto, MealEducationalAssessment, PhysicalActivityProfile, ActivityRecord, Consultation, PrintedDiaryEntry, Device, DeviceConfiguration, SyncOperation, AuditEvent, FileObject e ApprovedEducationalContent. Ajuste nomes/relacionamentos após ler a especificação e documente decisões. Chaves UUID, timestamps com timezone e constraints adequadas, dados sensíveis minimizados, indices de consulta e migrações versionadas; CPF em formato normalizado, com restrições e controle de visibilidade. Não pressupor que consentimento é a única base legal possível.

## 5. Segurança, privacidade e conformidade — bloqueadores reais

- A solução processa dados pessoais sensíveis de saúde: incluir privacy-by-design, RBAC/ABAC ou autorização por recurso, isolamento por clínica/equipe, criptografia em trânsito e em repouso onde suportada, trilha de auditoria não editável por usuários comuns, logging sem CPF/medidas/fotos/tokens, rate limiting, antifraude, CSRF/CORS adequados à arquitetura, upload seguro, back-ups e teste de restauração, retenção parametrizável.
- Documentar fluxo de dados, prestadores e suboperadores, tratamento de transferência internacional, política de privacidade e termos para revisão jurídica. Criar inventário dos dados; não assumir que a escolha de região brasileira garante conformidade total à LGPD.
- Incluir requisitos de exclusão, acesso e correção de dados sujeitos a bases legais e retenção, sem executar apagamento de registros clínicos sem aprovação jurídico-institucional.
- Não usar imagens ou dados de saúde para treinar modelos por padrão; escolher fornecedores e contratos apenas após aprovação de privacidade e segurança. Chaves de API SOMENTE no backend.
- Definir checklist de revisão por profissional de saúde, avaliação regulatória ANVISA (SaMD quando aplicável), política de apps de saúde Google Play e Apple App Review antes de qualquer produção real.
- Nunca gerar instruções terapêuticas, diagnóstico, recomendação personalizada de medicamentos ou limiares de exercício/pressão não aprovados; nessas situações, oferecer conteúdo neutro, avisos claros e marcar `BLOCKED_PENDING_CLINICAL_APPROVAL`.

## 6. UX e sistema visual

Extrair direção visual dos anexos A, B e C da especificação: azul, verde/azul-petróleo, fundos claros, cartões arredondados, botões amplos, ícones com rótulos e tipografia legível. Reproduzir arquitetura de informação e intenção, NÃO copiar nomes, valores fictícios nem erros visuais dos mockups. Criar tokens de cores/espacamento/tipografia, componentes reutilizáveis, estados loading/empty/error/offline e wireframes navegáveis como primeira entrega para validação.

## 7. Qualidade e critérios de aceite

Devem existir e ser demonstráveis, com dados fictícios e testes:
1. Profissional autorizado loga, cadastra paciente, vincula modalidade e visualiza apenas pacientes autorizados.
2. Paciente acessa a conta com método seguro, cria medição manual, vê histórico e confirma previamente qualquer valor lido por OCR.
3. Medicamento cadastrado pelo profissional aparece no app e notificações locais são agendadas conforme permissão do SO; confirmação permanece autorrelato.
4. Diário impresso é transcrito com autoria/origem e horário do evento separado da transcrição.
5. Registros offline são sincronizados sem duplicidade, inclusive após falha e reenvio.
6. Fotos ficam em armazenamento privado e autorização impede leitura cruzada.
7. Rotas não autorizadas retornam 401/403 e testes tentam acesso cruzado entre dois pacientes e dois profissionais.
8. Funcionalidades com regras clínicas ou hardware pendentes não são simuladas como plenamente operacionais.
9. Navegação principal é acessível com leitor de tela e textos ampliados.
10. Testes/CI passam, migrações executam, `.env.example` está completo e há instruções reproduzíveis para executar localmente.

## 8. Implementação gradual obrigatória

Trabalhe por entregas verticais pequenas, sempre deixando o projeto executável. Antes de criar muito código, leia a especificação, apresente um mapa de requisitos (MVP / fase 2 / bloqueado), riscos, decisões de arquitetura e backlog com dependências, esforço e critérios de aceite.

**Fase 0 — Descoberta e decisões:** ler DOCX e anexos; `docs/REQUISITOS.md`, `docs/MVP.md`, `docs/DECISOES_PENDENTES.md`, `docs/architecture/ADR-001.md`, diagrama de componentes/fluxo de dados, backlog. Apontar blockers clínicos, de privacidade e hardware. Não inventá-los.

**Fase 1 — Fundação executável:** inicializar monorepo, projetos Next/Expo/Spring, Docker Compose local para Postgres e dependências locais de desenvolvimento, migrations iniciais, OpenAPI, autenticação básica segura, organização, CI e README. Exibir comandos e resultado real dos testes.

**Fase 2 — Fluxo ponta a ponta:** profissional cadastra paciente e registra leitura manual; paciente autenticado visualiza e registra leitura; histórico/gráfico; permissão por paciente; auditar; testes E2E.

**Fase 3 — Medicamentos e diário:** gestão por profissional, vigências, lembretes locais e confirmações autorrelatadas; transcrição de diário.

**Fase 4 — Offline e fotos:** sincronização idempotente, fotografar visor, OCR com confirmação, uploads privados e controle de falhas/custo.

**Fase 5 — Alimentação e atividade:** interface + conteúdo validado; IA educativa apenas após validação de critérios, segurança e termos; histórico de atividades.

**Fase 6 — Consultas e pulseira:** notas e resumo; módulo de pulseira com interface/estado e simulador; hardware real SOMENTE com especificação validada.

**Fase 7 — Preparação da demo publicada e futura produção:** testes de segurança, backup/restore, verificação da disponibilidade da API e do banco gratuito, observabilidade econômica, performance, acessibilidade, distribuição beta, textos de privacidade aprovados, documentos de Play/App Store, conta de teste para revisão, runbook de incidentes, matriz final de riscos e checklist de liberação. Não publicar um app que dependa de backend indisponível ou simule diagnóstico clínico não validado.

**Não implemente todas as fases de uma única vez.** Após a Fase 0, comece a Fase 1, execute os testes e entregue um relatório preciso; aguarde confirmação para mudanças de escopo ou decisões de alto risco, mas não pare por decisões cosméticas menores.

## 9. Entregáveis por iteração

Sempre entregue: (a) arquivos criados/modificados; (b) comandos exatos para iniciar o backend/web/mobile; (c) `.env.example` com explicação e sem valores secretos; (d) migrations/contratos; (e) testes executados e seus resultados verificados; (f) riscos, pendências e dependências; (g) próximo passo priorizado. Nunca diga “testes passaram”, “publicado”, “sincronizado com pulseira” ou “pronto para produção” sem evidência correspondente.

Crie um `AGENTS.md` curto que preserve arquitetura, padrões, decisões, comandos e regras de segurança para as próximas sessões. Mantenha `CHANGELOG.md` e `docs/STATUS.md` com estados `DONE`, `IN_PROGRESS`, `BLOCKED`, `NOT_STARTED`.

## 10. Requisitos operacionais e financeiros

Criar `docs/CUSTOS.md` com cenário **principal de demo de faculdade (10–50 contas sintéticas)**, orçamento preliminar de **US$ 10–25/mês**, e cenários futuros de 200 e 1.000 pacientes ativos por mês. Explicitar assinatura mínima, RAM/CPU efetivamente usados no Railway, limites gratuitos de Vercel/Supabase/Expo, pausar/restaurar projetos, mensagens, IA, fotos, armazenamento, e-mails, builds, logs, backups e autenticação. Separar custos únicos/anuais das lojas (Google US$ 25 uma vez; Apple US$ 99/ano), custos de desenvolvimento e custos mensais. Implementar alertas e tetos de consumo quando os provedores permitirem, não ativar serviços pagos sem autorização humana, limitar número/tamanho das fotos e documentar backup/restauração. Não coletar métricas com dados de saúde identificáveis.

## 11. Primeira execução — faça agora

1. Confirme que conseguiu abrir o DOCX e ver os anexos. Se ele não existir na pasta, solicite sua inclusão e ainda assim prepare a estrutura técnica sem inventar conteúdo.
2. Resuma os requisitos efetivamente encontrados, incluindo claramente os que dependem de validação.
3. Apresente arquitetura, esquema inicial de dados, riscos, escopo MVP e backlog ordenado com estimativa de trabalho.
4. Inicialize a estrutura e a fundação mínima executável (Fase 1), em pequenas alterações testáveis.
5. Execute os comandos disponíveis, relate os resultados reais e apresente como iniciar localmente.
6. Mostre os itens que dependem de credenciais ou decisões humanas. **Não solicite senhas, tokens ou dados de pacientes diretamente no chat e não faça publicação automática nas lojas.**

Prioridade central: software funcional, seguro, acessível e auditável, não apenas aparência. Seja rigoroso com os limites da especificação clínica e com o que realmente está implementado.

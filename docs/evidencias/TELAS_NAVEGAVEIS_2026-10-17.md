# Entrega de acesso e telas navegáveis — 17/10/2026

O ponto pendente registrado na retomada anterior era cadastro demográfico/edição, composição de conclusão e semana de atividades. O novo pedido priorizou o percurso visível e forneceu 52 imagens. Esses módulos foram implementados sobre o código existente, preservando autenticação, pressão/OCR, fila, medicamentos, fotos, diário, consultas, autorização e a estrutura Expo raiz + web/ + backend/demo/.

## Abrir a demonstração

- Aplicativo do paciente: http://127.0.0.1:8081.
- Portal profissional: http://127.0.0.1:3000.
- API: http://127.0.0.1:8080/actuator/health; PostgreSQL local na porta 55432.
- Contas, ativação, recuperação e percurso: [Como navegar](../COMO_NAVEGAR.md). A senha está no arquivo privado local, fora do repositório.

A porta 3000 é profissional; a 8081 apresenta o aplicativo. O acesso recebeu indicação visível de cadastro/ativação, e um cookie profissional válido retoma o painel na raiz. Os ensaios confirmam o percurso com credenciais válidas; a distinção dos acessos, o cadastro demográfico e a baixa visibilidade da ativação foram tratados. Na prévia Expo web, recarregar exige novo login conforme a política de sessão em memória, explicitada no guia/configurações.

## Código entregue

| Área | Arquivos e comportamento |
|---|---|
| Persistência | V6__dados_pessoais_paciente.sql, ModelosCuidado, DadosPessoaisService/Controller e CuidadoService: CPF opcional/dígitos/unicidade por clínica, nascimento, telefone, contato, sexo/endereço e versão. Autorização por recurso e RLS existentes preservadas. |
| Cadastro profissional | CadastroPaciente.tsx, CamposDadosPessoais.tsx e DadosPessoaisPaciente.tsx: cadastro completo, vínculo, código de uso único, CPF mascarado, edição com versão e confirmação real. E-mail de contato não troca o login. |
| Acesso | app/cadastro.tsx, acesso.tsx, ativar-conta.tsx, index.tsx e web/app/page.tsx: ativação/cadastro pela equipe, senha visível/oculta, validação, carregamento e retorno real. Sem inscrição pública insegura. |
| Home | app/inicio.tsx, usePainelPaciente.ts, BarraNavegacao.tsx e IconeNavegacao.tsx: módulos, histórico/perfil/lembretes/configurações, resumo da API e barra fora da rolagem. Ícones nítidos com formas nativas/recurso fornecido. |
| Perfil e preferências | ContatoPaciente.tsx, perfil.tsx, configuracoes.tsx, mensagens.tsx e lembretes.tsx: consulta/edição do telefone, orientação da equipe, planos existentes e saída. ContextoPreferencias/TextoAcessivel ampliam textos; preferência dura enquanto app aberto. |
| Atividade | HistoricoAtividades.tsx, services/atividades/periodos.ts, ilustracoes.tsx e TelaCuidado.tsx: escolha ilustrativa para registrar o que já foi realizado, validações, confirmação remota, fila/reenvio, calendário/minutos completos, mês/todos e paginação. |
| Contrato e ensaios | OpenAPI atualizado da API real e generated.ts regenerado; tipos de cadastro/BFF protegido; CuidadoIT, acesso-navegacao.spec.ts e proteção de rotas ampliados. Scripts de captura/comparação distinguem estados reais e pendências. |
| Recursos | 52 PNG preservados em referencias_codex/imagens_individuais, assets/images/individuais e web/public/images/individuais. [Dimensões e hashes](RECURSOS_52_2026-10-17.json) comprovam cópias idênticas, sem nova ampliação. |

Documentação atualizada: README, AGENTS, PROGRESSO, STATUS, COMO_NAVEGAR, PROXIMA_EXECUCAO, requisitos, ADR, matriz visual e CHANGELOG. [Inventário cumulativo do Git](ARQUIVOS_TELAS_2026-10-17.txt) inclui alterações anteriores recebidas. Nenhum stage, commit, push, reset, clean ou repositório aninhado foi criado.

## Testes

| Verificação | Resultado |
|---|---|
| Java 21/Maven verify | 5 unitários + 20 integrações PostgreSQL, zero falhas/erros/skips. Cadastro completo, CPF duplicado/inválido, nascimento futuro, versão concorrente, contato próprio restrito/isolamento, fronteiras de semana e regressões de cuidado/OCR/arquivos. |
| Semana | Domingo/segunda em America/Sao_Paulo, fim exclusivo, minutos completos e isolamento passaram. |
| Frontend | 13 testes mobile + 19 web; TypeScript app/web/contratos/tokens e ESLint passaram. Repetição final após ajustes visuais passou. |
| E2E completo | 11 testes no Next de produção local com Java/PostgreSQL e Expo web reais passaram sem skips em 57,9 s. Cookie Secure/HttpOnly, CSRF, isolamento, consulta, pressão/fila/OCR e alimentação privada preservados. |
| E2E final | Após ícones e export definitivo, 4 testes passaram em 10,8 s: novo percurso, sessão real, servidor de preview e 12 rotas anônimas protegidas. |
| Percurso novo | Cadastro completo → edição → ativação pela UI → login → Home/módulos → atividade/semana anterior/atual → escolha ilustrativa → falha de rede/reenvio sem duplicação → históricos → telefone persistido no portal → texto ampliado → lembretes → logout. |
| Next | Build Webpack passou com CLI de web e 16 rotas dinâmicas. A sandbox Windows exigiu pré-criar diretórios e VIVA_BUILD_DIRETORIOS_PREPARADOS=1; limpeza normal segue padrão fora desse modo. |
| Expo | Export web, Android e iOS passou; Hermes gerou .hbc dos dois alvos nativos. TEMP/TMP em work/tmp resolveu a restrição de escrita da sandbox sem desabilitar bytecode. Preview servido do export final; não equivale a APK/IPA nem ensaio físico. |
| Integridade | 52 PNG conferidos por dimensões/SHA-256, referências preservadas; git diff --check, marcadores de conflito e saúde das rotas conferidos. |

Logs privados em work: java-telas-verify.log, next-telas-build.log, expo-plataformas-export.log, e2e-telas-completo.log, e2e-telas-final.log e capturas-telas.log. Indisponibilidade inicial do PostgreSQL, mkdir do Next e TEMP do Hermes foram corrigidos antes das execuções aprovadas.

A asserção inicial de senha visível verificava atributo HTML ausente, embora a propriedade do input fosse text. Foi corrigida para a propriedade real e passou. O diagnóstico exibiu a senha sintética: valor removido dos logs, credencial renovada atomicamente nas seis contas principais com BCrypt e sessões anteriores revogadas. Login/logout das seis passou com o novo valor privado; nenhum dado clínico ou conexão foi substituído.

## Capturas e comparação

42 capturas: 35 associadas às referências e sete adicionais. As 35 foram comparadas nos três painéis, com diferenças por tela em [FIDELIDADE_VISUAL](../FIDELIDADE_VISUAL.md). Imagens principais também foram abertas individualmente. Não há aceite de 36 telas idênticas.

- [Home](visual/app_03_pagina_inicial.png), [acesso/cadastro visível](visual/app_02_acesso_cpf.png), [boas-vindas](visual/app_01_boas_vindas.png).
- [Cadastro completo](visual/web_03_cadastro_paciente.png), [ficha/edição](visual/web_04_perfil_paciente.png), [painel](visual/web_02_painel_inicial.png).
- [Cadastro app](visual/extra_cadastro_aplicativo.png), [ativação vazia](visual/extra_ativacao_aplicativo.png), [perfil](visual/extra_perfil_paciente.png), [configurações](visual/extra_configuracoes_aplicativo.png), [lembretes](visual/extra_lembretes_aplicativo.png), [ilustrações](visual/extra_ilustracoes_atividades.png), [lista profissional](visual/extra_web_lista_pacientes.png).
- [Conclusão de atividade](visual/atividade_10_registro_atividade.png), [semana](visual/atividade_11_historico_atividades.png).
- Comparações: [app](visual/comparacoes/painel_app.png), [portal](visual/comparacoes/painel_web.png), [atividade](visual/comparacoes/painel_atividade.png), [manifesto](visual/capturas.json).

Novos logos/ilustrações substituem destaques de menor qualidade. Vários arquivos do ZIP já eram ampliações 3×; não foram ampliados novamente. Logo maior fornecido é vertical e retratos são separados; os protótipos usavam outra composição. Cabeçalhos compactos conservam o logo horizontal anterior. Ícones de navegação pouco nítidos foram substituídos por formas nativas/sino fornecido. Fontes, escalas e composições restantes estão na matriz.

## Pendências reais

Vídeo/passos/prescrição individual e classificação alimentar dependem de conteúdo/critérios/provedor aprovados. A galeria é ilustrativa. Pulseira real depende de protocolo/aparelho. Notificação, SQLCipher/SecureStore, câmera e acessibilidade precisam de ensaio Android/iOS; nenhuma imagem do SO foi fabricada. Supabase externo, builds de loja, contas e publicação continuam sem credenciais/autorização; nenhum gasto/deploy ocorreu.

Trabalho local restante: diferenças visuais, idade na etapa de atividade, agregação de sete dias/atalhos de período no portal e nomenclatura/autoria auxiliares. Auditoria anterior: 2 altos/2 moderados; sem nova auditoria neste lote sem mudança de dependências. CI remota/OWASP/gitleaks não executados. O restore anterior não é novo ensaio de backup V6. Todas as fases/projeto inteiro não estão declarados concluídos.

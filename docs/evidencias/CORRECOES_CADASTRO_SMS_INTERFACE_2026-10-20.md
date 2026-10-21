# Correções de cadastro, SMS e interface — 20/10/2026

Estado: **implementação e validação local concluídas para esta solicitação**, com envio real de SMS e demais dependências externas explicitamente pendentes. Não representa conclusão de todo o Viva+, liberação clínica, produção ou publicação. [Pedido integral](../product/PEDIDO_CADASTRO_SMS_INTERFACE_2026-10-20.md).

## Problemas dos prints e correções

| Problema observado | Causa identificada | Correção verificada |
| --- | --- | --- |
| Barra inferior entre botões da atividade | Cinco consumidores inseriam BarraNavegacao dentro dos filhos do ScrollView | Usam agora o rodapé de Tela, irmão da área rolável. Home já usava esse contrato. Doze rotas consumidoras verificadas, inclusive após rolar até o fim |
| Texto técnico no fim da página | Aviso de desenvolvimento era um item do conteúdo | Indicador compacto separado no topo: “Demonstração · somente dados fictícios”, nos modos development/test/preview; preserva a identificação sintética |
| Logo sem definição | Portal usava bitmap de 148x45; outro bitmap do app tinha 167x58 | Logo original fornecida em 1278x1230, sem redesenho/recorte; proporção preservada e renderização responsiva preparada por getImageProps do Next, com srcset/sizes e sem style inline que viole CSP |
| Logo sumia no tablet durante o ensaio | Menu lateral em flex comprimindo a área da marca | Grade responsiva com coluna própria para a logo; imagem não colapsa |
| Configurações dispersas/desalinhadas | Cards muito largos e formulário genérico sem composição específica | Conteúdo central com limite 1120px, conta/unidade em lista de dados, preferências alinhadas e links de privacidade em grade; empilhamento responsivo |

A SafeAreaView permanece como contêiner, protegendo a estrutura nativa; a barra não usa sobreposição absoluta ao conteúdo. Rolagem e posição foram verificadas no navegador. Safe area física, teclado do SO e leitores nativos ainda exigem aparelho. O formulário de registro de atividade não usa essa barra e mantém sua navegação existente; não foram criadas funções específicas de exercício/IA.

O asset de alta resolução encontrado possui composição vertical. Foi preservado integralmente, com fundo/proporção originais; não foi fabricada uma versão horizontal/vetorial nem declarada igualdade com todos os protótipos. As diferenças globais das 36 referências continuam na [matriz visual](../FIDELIDADE_VISUAL.md).

## Evidências visuais reais

- Prints recebidos: [aplicativo](cadastro-sms-interface/referencia_print_app.png), [portal](cadastro-sms-interface/referencia_print_portal.png).
- Aplicativo após rolagem: [320px](cadastro-sms-interface/app_atividade_320.png), [375px](cadastro-sms-interface/app_atividade_375.png), [430px](cadastro-sms-interface/app_atividade_430.png).
- Configurações em densidade 2: [1366px](cadastro-sms-interface/portal_configuracoes_1366.png), [1440px](cadastro-sms-interface/portal_configuracoes_1440.png), [1920px](cadastro-sms-interface/portal_configuracoes_1920.png), [tablet 768px](cadastro-sms-interface/portal_configuracoes_768.png), [mobile 390px](cadastro-sms-interface/portal_configuracoes_390.png).
- Novo acesso: [cadastro](cadastro-sms-interface/acesso/cadastro_profissional.png), [solicitação SMS](cadastro-sms-interface/acesso/emissao_profissional.png), [CPF/nascimento](cadastro-sms-interface/acesso/acesso_paciente.png), [ativação](cadastro-sms-interface/acesso/ativacao_paciente.png), [Home](cadastro-sms-interface/acesso/inicio_paciente.png), [estado ativado](cadastro-sms-interface/acesso/estado_ativado_portal.png), [configurações do app](cadastro-sms-interface/acesso/configuracoes_paciente.png).

Comparação: os botões que estavam depois da barra no print original ficam na área rolável, acima da barra estável. A logo deixa de usar o bitmap pequeno e mantém sua composição original. Conta/preferências ocupam colunas equilibradas no desktop e uma coluna no mobile; checkbox/seletor não se sobrepõem. Os links não afirmam aprovação institucional. Capturas de dados e preferências variam porque são consultados na API; não copiaram números/nomes dos protótipos.

Não houve rolagem horizontal nas larguras ensaiadas. [Medições do portal](cadastro-sms-interface/portal-responsivo.json), [hierarquia/rolagem das doze rotas](cadastro-sms-interface/navegacao-responsiva.json), [manifesto do acesso](cadastro-sms-interface/acesso/capturas.json). Imagens em magenta são máscaras de proteção da captura, não aparência do produto. Capturas antigas foram preservadas. Não há evidência física fabricada.

## Cadastro e telefone

Frontend/backend validam CPF estrutural, onze dígitos/máscara, dígitos verificadores, sequências inválidas, data e duplicidade na mesma unidade. Celular brasileiro obrigatório em novos cadastros, DDD existente e nove dígitos iniciados em 9, normalização E.164 e exibição formatada. E-mail continua contato opcional. CPF/nascimento são necessários para APP; modalidade diário não ganha obrigação de usar smartphone.

Telefone antigo ausente/fora do formato não apaga nem invalida automaticamente o paciente/aparelho. Impede nova emissão até regularização autorizada. Mudança do número exige identidade conferida e senha profissional, incrementa sua versão, limpa confirmação e revoga códigos/desafios/aparelhos/sessões. O paciente recebe orientação para procurar a equipe, sem trocar sozinho o autenticador. Erro de senha/concorrência não altera cadastro; tentativas de reautenticação são persistidas separadamente.

Nenhuma consulta oficial de CPF foi executada. A [pesquisa de alternativas oficiais](../CONSULTA_OFICIAL_CPF.md) registra Serpro, Conecta e consulta do cidadão, requisitos, custos/limitações verificáveis e bloqueios. Dígitos corretos e recebimento de SMS não comprovam identidade civil.

## SMS e ativação

`ServicoEnvioSms` desacopla autenticação do fornecedor. Twilio REST implementado com URL HTTPS fixa, autenticação privada, prazos/resposta limitada e conferência de conta/destino/referência. Aceitação não é entrega: estados distintos incluem TESTE_LOCAL, ACEITO_PROVEDOR, ENTREGUE, FALHA, NAO_ENTREGUE, INDETERMINADO e NAO_CONFIGURADO. Status do fornecedor é consultado com intervalo mínimo quando a ficha é consultada; não existe webhook/trabalhador contínuo nesta versão.

**Somente LOCAL foi utilizado no percurso ponta a ponta. Nenhum SMS real foi enviado.** A caixa cifrada usa AES-GCM e ACL privada, sem endpoint de leitura; código nunca volta ao portal/API normal ou logs de status. O utilitário de teste escreve uma consulta privada para o operador, sem imprimir segredo. Simulação local não preenche a confirmação de telefone real. O padrão do sistema é SMS desabilitado; LOCAL exige ambiente development/test e habilitação explícita, TWILIO exige autorização/configuração explícitas.

Permanecem CSPRNG, quatro números inclusive zeros, HMAC fora do banco, uso único/dez minutos, desafios e proteção do aparelho V8. Limites persistidos por paciente, telefone, profissional, unidade e instalação protegem reemissão/abuso. Novo código invalida o anterior; tentativa ambígua/falha não autoriza o código. Recuperação aceita revoga aparelhos; falha de envio não derruba autorização anterior. Não há emissão pública baseada somente em CPF.

O retorno profissional passou de código para `idEnvio/estadoEnvio/expiraEm/destinoMascarado/provedor`; consumidores e OpenAPI/TypeScript foram adaptados. Autenticação profissional preservada. [Guia técnico e teste local](../CADASTRO_E_ATIVACAO_SMS.md).

## Banco e preservação

V9 aditiva amplia telefone, adiciona versão/confirmação e cria envio_sms_ativacao com RLS/revogações. V1–V8 não foram alteradas. A conferência anterior aos novos E2E comparou conteúdo das colunas antigas de **30 tabelas** e hashes dos **66 arquivos** anteriores, sem divergência. Snapshot cifrado privado foi criado antes da V9; chave do envelope separada. Códigos manuais pendentes são invalidados intencionalmente; aparelhos/cadastros antigos ficam preservados.

Banco principal: **V9, 33 tabelas incluindo Flyway, 32 com RLS**. [Evidência da migração](cadastro-sms-interface/migracao-v9.json). Novos ensaios acrescentam registros sintéticos e eventos de auditoria/preferências esperados; a comparação da migração foi feita antes deles. O ensaio anterior de restauração V8 continua válido no seu escopo; não foi apresentado como restauração V9 em fornecedor.

## Testes executados

| Verificação | Resultado final e alcance |
| --- | --- |
| Maven verify / Java21 | **74 aprovados**: 22 unitários + 52 integrações PostgreSQL (17 acesso, 12 cadastro/SMS, 13 cuidado, 10 fundação); zero falhas/erros/skips |
| Aplicativo/contratos | **40 aprovados**, incluindo celular/CPF, indicadores de ambiente, fila, lembretes e credencial protegida por contrato |
| Portal | **29 aprovados**, incluindo emissão sem segredo, falha/serviço desligado e preferência persistida |
| E2E completo | **17 aprovados, 1,4 minuto**, API/PostgreSQL reais; cadastro/SMS local/ativação/Home, módulos, OCR real, fotos, fila web, autorrelatos, consultas, permissões e preferências |
| Responsividade | Portal 1366/1440/1920/768/390px em DPR2; app 320/375/430px e doze rotas com navegação fora da rolagem; também painel/lista compartilham layout sem overflow |
| Qualidade/builds | TypeScript app/web/contratos e lint aprovados; Next/Webpack e Expo web/Android/iOS exportados; sintaxe dos utilitários conferida |
| Dependências | pnpm10.28.2: 922 dependências, 0 críticos, 2 altos, 0 moderados/baixos; **exit 1**, não aprovado para produção |
| Preservação | Snapshot cifrado, migração em schemas exclusivos e comparação do banco/arquivos/fontes anteriores aprovados |

Casos cobertos: CPF inválido/estrutural/duplicado e calendário; telefone ausente/DDD/fixo/formato/E.164; legado sem telefone; quatro números/zero/expirado/incorreto/usado; tentativas/bloqueio/reemissão; falha/estado ambíguo do serviço; autorização/renovação/revogação; troca de celular; isolamento e método profissional preservado. Integração Twilio foi exercitada contra servidor HTTP local de testes, **sem ensaio da operadora**. Unit tests usam doubles onde necessário; não são evidência de entrega externa.

Falhas intermediárias corrigidas e reexecutadas: coluna varchar(11) não comportava E.164, ajustada na nova V9 antes de aplicá-la no principal; conflito de transações convertia negação em 500, corrigido mantendo limite de reautenticação em transação independente; leitura ESM pelo runner exigiu utilitário CJS; seletores/data do ensaio ajustados; rota de formulário sem barra retirada da lista incorreta de consumidores; logo comprimida no tablet corrigida. O empacotamento Java também exigiu encerrar o JAR local em uso no Windows antes de reempacotar. Tentativas com falha não foram contadas como aprovação.

Logs privados em `../../work`, relativos à raiz: sms-java-validado.log, sms-e2e-completo-final.log, sms-responsivo-final.log, sms-next-final.log, sms-expo-all-final.log, sms-expo-web-final.log, sms-pnpm-audit-limpo.json. Não publicar work, chaves ou caixa SMS. [Conferência final](cadastro-sms-interface/validacao-final.json) registra integridade/contratos/segredos conhecidos; não substitui scanner completo.

## Arquivos e transferência

[Lista completa dos 86 arquivos de código/documentação tratados nesta execução](cadastro-sms-interface/arquivos-desta-execucao.json). Ela não inclui como novos os demais arquivos que já estavam modificados antes desta solicitação.

- Layout app: components/ElementosInterface.tsx, BarraNavegacao.tsx, HistoricoAtividades.tsx, RoteiroAtividade.tsx, app/atividade-fisica/index.tsx, orientacoes.tsx e app/mensagens.tsx; services/ambiente.ts.
- Identidade/cadastro app: app/ativar-conta.tsx e components/ContatoPaciente.tsx; login/dispositivo V8 preservados.
- Portal: web/components/Icones.tsx, PreferenciasPortal.tsx, CadastroPaciente.tsx, CamposDadosPessoais.tsx, DadosPessoaisPaciente.tsx, AtivacaoPaciente.tsx/testes, web/app/(portal)/configuracoes/page.tsx e globals.css.
- Backend: ConfiguracaoSms, service/sms, AcessoPacienteService, DadosPessoaisService, CuidadoService/Controller, ModelosAcessoPaciente/ModelosCuidado, application.yml e V9. Caminhos Java completos estão no guia e no inventário técnico.
- Contratos/testes/infra: OpenAPI/tipos/helper cadastro, CadastroSmsIT/ConfiguracaoSmsTest/ValidacaoCadastroTest/EnvioSmsTwilioTest e regressões existentes adaptadas, testes frontend/E2E, caixa-sms-local.cjs/d.cts, capturar-telas.mjs, iniciar-local.ps1, .env.example e CI com SMS LOCAL.
- Documentação: README/AGENTS/PROGRESSO/STATUS/PROXIMA_EXECUCAO, guias/manuais/checklist/inventários e pesquisa CPF. [Levantamento de 40 pendências e 14 escopos verificados](../LEVANTAMENTO_COMPLETO_PENDENCIAS.md), [plano com 21 pacotes técnicos](../PLANO_IMPLEMENTACAO_PENDENCIAS.md), manuais de [exercícios](../TRANSFERENCIA_DEV_EXERCICIOS.md), [IA](../TRANSFERENCIA_DEV_INTELIGENCIA_ARTIFICIAL.md) e [responsabilidades](../MATRIZ_RESPONSABILIDADES_DESENVOLVIMENTO.md).

Nenhum dado/código funcional anterior descartado, nenhuma migration aplicada reescrita, nenhum stage/commit/push/publicação realizado. As alterações de interface em exercícios foram estruturais; não houve catálogo, protocolo, vídeo, modelo ou recomendação nova.

## Testar e próximos passos

Serviços locais: portal `http://127.0.0.1:3000` e app `http://127.0.0.1:8081/acesso`. Usar `Iniciar-VivaMais.cmd -Producao -SmsLocal`, credencial profissional privada e pessoa fictícia com celular válido. Solicitar SMS, consultar a referência pela caixa privada e ativar com CPF/nascimento/quatro números. O [guia](../CADASTRO_E_ATIVACAO_SMS.md) contém todos os passos e limites; não há código pronto nesta documentação.

Pendem fornecedor/credenciais/remetente e teste real de SMS, consulta oficial de CPF se aprovada, políticas institucionais, dois alertas altos, CI/scanners remotos, aparelhos físicos/instaláveis e implantação/publicação autorizadas. A infraestrutura econômica anterior foi preservada, sem custo novo. Exercícios/IA continuam com o outro desenvolvedor. Produção continua bloqueada.

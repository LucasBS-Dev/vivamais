# Como foram implementadas as funcionalidades

Este guia explica a cadeia real do Viva+, complementando o [inventário](INVENTARIO_COMPLETO_FUNCIONALIDADES.md). “Repository” significa InstituicaoRepository ou JdbcTemplate no Service/Controller, conforme o módulo; não há JPA nem repository próprio de cada tabela. Nos exemplos, paths começam em /api/v1; BFF profissional acrescenta /api/domain.

## 1. Padrão compartilhado de uma ação

1. Tela/componentes em pt-BR coletam entrada e mantêm erro/formulário.
2. Hook/service recebe a ação; web usa BFF, app usa transporte com sessão.
3. Transporte serializa contrato, define timeout/origem e não segue redirect.
4. Controller resolve SessaoAutenticada e DTO validado.
5. Service exige papel/unidade/vínculo/titular antes da consulta.
6. Transação usa JdbcTemplate/InstituicaoRepository; dado e autoria não são confiados ao cliente.
7. UUID torna retry idempotente; versão detecta edição concorrente.
8. Resposta volta pelo BFF/transporte com erro público limitado.
9. UI só confirma após persistência; consulta/histórico é recarregado.
10. Teste inclui leitura posterior, outro titular/unidade e falha, não apenas botão visível.

## 2. Exemplo real: pressão manual

Em services/pressao/registrosPressao.ts, criarCorpoRegistro faz o mapeamento explícito entre domínio em português e contrato compatível:

```typescript
return {
  id,
  systolic: entrada.sistolica,
  diastolic: entrada.diastolica,
  pulse: entrada.pulso ?? undefined,
  measuredAt: entrada.dataMedicao,
  source: entrada.idDocumentoOcr ? "OCR_CONFIRMED" : "MANUAL",
  ocrDocumentId: entrada.idDocumentoOcr,
  ocrConfirmed: entrada.idDocumentoOcr ? true : undefined,
};
```

A tela app/pressao/digitar.tsx exige revisão antes de salvar. A fila mantém id durante retry; CuidadoController recebe EntradaRegistroPressao, CuidadoService valida acesso/valores e grava blood_pressure_reading com sync_operation. Resultado/histórico vêm da API. CuidadoIT e mobile-care.spec comprovam persistência e repetição sem duplicação. Um documento OCR só vira medição após confirmação explícita, sem diagnóstico automático.

## 3. Exemplo real: consultas parametrizadas e autorização

InstituicaoController.paciente chama InstituicaoRepository.buscarPacienteAutorizado(id,usuario) e responde403 se ausente; depois audita PATIENT_VIEWED. SQL parametrizado no repository/Service recebe identificadores da sessão, não uma unidade escolhida no formulário. AutenticacaoService compara BCrypt e recusa Papel.PATIENT no login de senha. Código de sessão é opaco; inserirSessao recebe hash, não bearer puro. O método consulta e a escrita devem ser testados com profissional B mesmo quando a UI não exibe o botão.

## 4. Rastreamento por módulo (15 pontos)

Os arquivos Java ficam em backend/demo/src/main/java/com/vivamais. Nos módulos sem backend próprio, a linha registra essa ausência. Testes são localizados no catálogo e executados pelo manual de testes; um teste citado não transforma o limite indicado em entrega produtiva.

### F01 — Acesso profissional

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Formulário |
| 2.Tela/componente | web/app/page.tsx; web/app/api/session/route.ts; web/app/api/logout/route.ts |
| 3.Serviço/hook cliente | web/services/api.ts |
| 4.Requisição HTTP | POST /api/v1/auth/login; POST /api/v1/auth/logout; GET /api/v1/auth/me |
| 5.Endpoint backend | POST /api/v1/auth/login; POST /api/v1/auth/logout; GET /api/v1/auth/me |
| 6.Controller | InstituicaoController |
| 7.Service | AutenticacaoService |
| 8.Repository/persistência | InstituicaoRepository; demais SQL no Service conforme necessidade |
| 9.Tabelas | user_account,auth_session,audit_event |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Formulário → BFF session → senha BCrypt → token opaco/hash PG → cookie HttpOnly → layout autorizado; sem confirmar antes do retorno |
| 12.Validações | Conta habilitada, papel não PATIENT, senha até72bytes, limite email/IP; erro401 genérico |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Limite de login em memória por instância; gestão/recuperação produtiva pendente P32/P40;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | InstituicaoIT; foundation.spec.ts; web/services/validacoes.test.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F02 — Cadastro de paciente

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Formulário |
| 2.Tela/componente | web/components/CadastroPaciente.tsx; web/components/CamposDadosPessoais.tsx |
| 3.Serviço/hook cliente | web/app/api/domain/[...path]/route.ts; packages/contracts/src/cadastro.ts |
| 4.Requisição HTTP | POST /api/v1/patients |
| 5.Endpoint backend | POST /api/v1/patients |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | patient,user_account,patient_professional_assignment,audit_event |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Formulário → normalização → BFF → DTO EntradaPaciente → transação → paciente/vínculo → ficha; sem confirmar antes do retorno |
| 12.Validações | Profissional/admin da unidade; celular E.164 válido; CPF único na unidade; APP exige nascimento/CPF; não expor código |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | CPF estrutural não confirma identidade; ambiguidade entre unidades P05;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CadastroSmsIT; CuidadoIT; cadastro-sms.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F03 — Dados pessoais e troca telefônica

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Ficha |
| 2.Tela/componente | web/components/DadosPessoaisPaciente.tsx; components/ContatoPaciente.tsx |
| 3.Serviço/hook cliente | packages/contracts/src/cadastro.ts; web/app/api/domain/[...path]/route.ts |
| 4.Requisição HTTP | GET /api/v1/pacientes/{idPaciente}/dados-pessoais; PUT /api/v1/pacientes/{idPaciente}/dados-pessoais; PUT /api/v1/pacientes/{idPaciente}/contato |
| 5.Endpoint backend | GET /api/v1/pacientes/{idPaciente}/dados-pessoais; PUT /api/v1/pacientes/{idPaciente}/dados-pessoais; PUT /api/v1/pacientes/{idPaciente}/contato |
| 6.Controller | DadosPessoaisController |
| 7.Service | DadosPessoaisService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | patient,user_account,dispositivo_acesso_paciente,auth_session,codigo_ativacao_paciente,desafio_acesso_paciente |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Ficha → versão/novos dados → senha profissional se telefone mudou → update versão → revogação → UI recarrega; sem confirmar antes do retorno |
| 12.Validações | Vínculo/unidade, versão409, data não futura, CPF/DDD; campos legados sem alteração preservados |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Paciente recebe403 ao tentar trocar telefone sozinho; processo institucional ainda P06;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CadastroSmsIT; CuidadoIT; execucao-local.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F04 — Ativação por SMS LOCAL

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Profissional confirma identidade/senha |
| 2.Tela/componente | web/components/AtivacaoPaciente.tsx; app/ativar-conta.tsx |
| 3.Serviço/hook cliente | infra/caixa-sms-local.cjs; contexts/ContextoAutenticacao.tsx |
| 4.Requisição HTTP | POST /api/v1/patients/{id}/access-reset; GET /api/v1/patients/{id}/access-status; POST /api/v1/auth/paciente/verificar |
| 5.Endpoint backend | POST /api/v1/patients/{id}/access-reset; GET /api/v1/patients/{id}/access-status; POST /api/v1/auth/paciente/verificar |
| 6.Controller | AcessoPacienteController; CuidadoController |
| 7.Service | AcessoPacienteService; sms/SmsLocalDesenvolvimento |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | envio_sms_ativacao,codigo_ativacao_paciente,limite_acesso_paciente,desafio_acesso_paciente |
| 10.Resposta | SolicitacaoSms: referência/estado/destino mascarado/expiração/provedor; sem segredo |
| 11.Exibição | Profissional confirma identidade/senha → HMAC + envelope AES-GCM privado → metadados → operador lê caixa → paciente verifica; sem confirmar antes do retorno |
| 12.Validações | Quatro números,10min/uso único,limites persistidos,versão telefone; código nunca em portal/resposta comum/log |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Somente LOCAL habilitado em development/test; nenhum SMS externo; não confirma telefone;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CadastroSmsIT; AcessoPacienteIT; cadastro-sms.spec.ts; AtivacaoPaciente.test.tsx; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F05 — SMS Twilio

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Porta ServicoEnvioSms |
| 2.Tela/componente | web/components/AtivacaoPaciente.tsx |
| 3.Serviço/hook cliente | web/app/api/domain/[...path]/route.ts |
| 4.Requisição HTTP | POST /api/v1/patients/{id}/access-reset; GET /api/v1/patients/{id}/access-status |
| 5.Endpoint backend | POST /api/v1/patients/{id}/access-reset; GET /api/v1/patients/{id}/access-status |
| 6.Controller | AcessoPacienteController; CuidadoController |
| 7.Service | AcessoPacienteService; sms/EnvioSmsTwilio |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | envio_sms_ativacao,codigo_ativacao_paciente,limite_acesso_paciente |
| 10.Resposta | SolicitacaoSms: referência/estado/destino mascarado/expiração/provedor; sem segredo |
| 11.Exibição | Porta ServicoEnvioSms → HTTPS fixo → resposta validada → estado persistido; consulta ativa limitada30s; sem confirmar antes do retorno |
| 12.Validações | Sem redirect/retry POST ambíguo; segredo backend; ACEITO_PROVEDOR não significa ENTREGUE |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Faltam conta/credenciais/autorização/remetente/custo/ensaio real; outbox P37;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | EnvioSmsTwilioTest (HTTP local); ConfiguracaoSmsTest; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F06 — Identificação e dispositivos

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | CPF+nascimento |
| 2.Tela/componente | app/acesso.tsx; app/ativar-conta.tsx; contexts/ContextoAutenticacao.tsx |
| 3.Serviço/hook cliente | services/autenticacao/dispositivoPaciente.ts; services/autenticacao/armazenamentoSessao.ts |
| 4.Requisição HTTP | POST /api/v1/auth/paciente/iniciar; POST /api/v1/auth/paciente/verificar; POST /api/v1/auth/paciente/renovar; POST /api/v1/auth/paciente/esquecer |
| 5.Endpoint backend | POST /api/v1/auth/paciente/iniciar; POST /api/v1/auth/paciente/verificar; POST /api/v1/auth/paciente/renovar; POST /api/v1/auth/paciente/esquecer |
| 6.Controller | AcessoPacienteController |
| 7.Service | AcessoPacienteService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | patient,dispositivo_acesso_paciente,desafio_acesso_paciente,codigo_ativacao_paciente,auth_session |
| 10.Resposta | Desafio opaco e depois sessão/credencial protegida conforme cliente |
| 11.Exibição | CPF+nascimento → desafio opaco → cookie/credencial ou código → sessão curta → rotação/saída/desautorização; sem confirmar antes do retorno |
| 12.Validações | Não conceder por dados pessoais; erro genérico; credencial não exposta a JS web; revogar/expirar |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Aceite browser/Java; SecureStore e ciclo nativo dependem P07/P08/P09;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | AcessoPacienteIT; acesso-paciente.spec.ts; dispositivo-paciente.test.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F07 — Home e perfil paciente

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Identificação da sessão |
| 2.Tela/componente | app/inicio.tsx; app/perfil.tsx |
| 3.Serviço/hook cliente | hooks/usePainelPaciente.ts; hooks/useResumoPaciente.ts; services/pacientes/pacientes.ts |
| 4.Requisição HTTP | GET /api/v1/patients/me; GET /api/v1/patients/{id}/readings; GET /api/v1/patients/{id}/medication-events |
| 5.Endpoint backend | GET /api/v1/patients/me; GET /api/v1/patients/{id}/readings; GET /api/v1/patients/{id}/medication-events |
| 6.Controller | InstituicaoController; CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | patient,blood_pressure_reading,medication_plan,medication_self_report,meal_photo,activity_record |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Identificação da sessão → consultas paralelas por id → totais/última pressão → cards reais; sem confirmar antes do retorno |
| 12.Validações | Query keys incluem titular,estado vazio/erro; não manter dado do titular anterior |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | QueryClient em memória; cache persistente pós-reinício não existe P15;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | acesso-navegacao.spec.ts; mobile-web.spec.ts; CuidadoIT; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F08 — Pressão manual

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Formulário |
| 2.Tela/componente | app/pressao/digitar.tsx; app/pressao/resultado.tsx |
| 3.Serviço/hook cliente | services/pressao/registrosPressao.ts; services/sincronizacao/filaRegistros.ts |
| 4.Requisição HTTP | POST /api/v1/patients/{id}/readings; GET /api/v1/pacientes/{idPaciente}/registros-pressao/{idRegistro} |
| 5.Endpoint backend | POST /api/v1/patients/{id}/readings; GET /api/v1/pacientes/{idPaciente}/registros-pressao/{idRegistro} |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | blood_pressure_reading,sync_operation,audit_event |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Formulário → criarCorpoRegistro → UUID/fila → POST → INSERT idempotente → resultado/histórico; sem confirmar antes do retorno |
| 12.Validações | Titular/vínculo; valores e confirmação explícita; mesma operação não duplica |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Faixas técnicas/abreviação não equivalem diagnóstico ou protocolo aprovado;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; mobile-care.spec.ts; portugues-pressao.spec.ts; care-core.test.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F09 — Pressão: histórico e gráfico

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Filtro |
| 2.Tela/componente | app/pressao/historico.tsx; components/GraficoPressao.tsx; web/components/GraficoPressao.tsx |
| 3.Serviço/hook cliente | hooks/usePainelPaciente.ts; web/components/CuidadoPaciente.tsx |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/readings |
| 5.Endpoint backend | GET /api/v1/patients/{id}/readings |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | blood_pressure_reading |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Filtro → GET paginado → lista/gráfico sistólica/diastólica → vazio/erro explícito; sem confirmar antes do retorno |
| 12.Validações | from/to,ordem,escopo; datas em America/Sao_Paulo |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Sem interpretação clínica automática; totais/paginação não são relatório ilimitado;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; mobile-care.spec.ts; portugues-pressao.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F10 — Arquivos privados

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Upload multipart |
| 2.Tela/componente | components/FluxoFotografia.tsx; components/ImagemPrivada.tsx |
| 3.Serviço/hook cliente | services/api.ts; web/app/api/photos/[id]/route.ts |
| 4.Requisição HTTP | POST /api/v1/patients/{id}/files; POST /api/v1/files/{id}/link; GET /api/v1/files/{id}/content |
| 5.Endpoint backend | POST /api/v1/patients/{id}/files; POST /api/v1/files/{id}/link; GET /api/v1/files/{id}/content |
| 6.Controller | ArquivoPrivadoController |
| 7.Service | ArquivoPrivadoService; ArmazenamentoArquivos |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | file_object,file_download_grant |
| 10.Resposta | Metadados da imagem; concessão curta; bytes somente com autorização |
| 11.Exibição | Upload multipart → autorização → ImageIO reencode → objeto cifrado + metadado → grant60s → leitura autorizada; sem confirmar antes do retorno |
| 12.Validações | PNG/JPEG até2MB,20–4096px,até12M pixels,20 fotos/mês/paciente; grant depende sessão |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Local AES-GCM validado; Supabase externo não validado P18; câmera física P11;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; mobile-care.spec.ts; restore anterior; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F11 — OCR de pressão

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Imagem privada |
| 2.Tela/componente | app/pressao/foto.tsx; components/FluxoFotografia.tsx |
| 3.Serviço/hook cliente | services/pressao/registrosPressao.ts; infra/ocr-worker.mjs |
| 4.Requisição HTTP | POST /api/v1/files/{id}/ocr; POST /api/v1/patients/{id}/readings |
| 5.Endpoint backend | POST /api/v1/files/{id}/ocr; POST /api/v1/patients/{id}/readings |
| 6.Controller | ArquivoPrivadoController |
| 7.Service | ArquivoPrivadoService; ReconhecedorTesseract |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | pressure_ocr_document,file_object,blood_pressure_reading |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Imagem privada → OCR local → proposta/estado → tela confere → registro OCR_CONFIRMED explícito; sem confirmar antes do retorno |
| 12.Validações | Nunca grava medição por OCR sozinho; titular,finalidade,limites e associação documento |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Fixture funcional; precisão representativa/novos modelos pertencem outro dev P30;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT com Tesseract real; mobile-care.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F12 — Planos de medicamentos

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Formulário equipe |
| 2.Tela/componente | web/components/CuidadoPaciente.tsx; app/medicamentos/index.tsx |
| 3.Serviço/hook cliente | components/TelaCuidado.tsx; hooks/usePainelPaciente.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/medications; POST /api/v1/patients/{id}/medications; PUT /api/v1/medications/{plan}; GET /api/v1/medications/{plan}/history |
| 5.Endpoint backend | GET /api/v1/patients/{id}/medications; POST /api/v1/patients/{id}/medications; PUT /api/v1/medications/{plan}; GET /api/v1/medications/{plan}/history |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | medication_plan,medication_schedule,medication_plan_history |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Formulário equipe → DTO → transação plano+horários/histórico → GET paciente autorizado; sem confirmar antes do retorno |
| 12.Validações | Ação de escrita profissional,versão concorrente e horários válidos |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Não prescreve automaticamente; validade clínica da prescrição é responsabilidade da equipe;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; care.spec.ts; mobile-care.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F13 — Autorrelatos de medicamentos

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Plano/dia |
| 2.Tela/componente | app/medicamentos/index.tsx; components/TelaCuidado.tsx |
| 3.Serviço/hook cliente | services/lembretes/calculoLembretes.ts |
| 4.Requisição HTTP | POST /api/v1/patients/{id}/medication-reports; GET /api/v1/patients/{id}/medication-events |
| 5.Endpoint backend | POST /api/v1/patients/{id}/medication-reports; GET /api/v1/patients/{id}/medication-events |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | medication_self_report,medication_plan,medication_schedule |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Plano/dia → botão de resposta → evento idempotente → estado por horário → ficha; sem confirmar antes do retorno |
| 12.Validações | Titular,plano ativo,UUID,horário; texto verdadeiro para NO_CONFIRMATION |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Notificação e autorrelato não comprovam ingestão; comportamento nativo pendente;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; mobile-care.spec.ts; care-core.test.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F14 — Lembretes e notificações

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Consulta plano |
| 2.Tela/componente | app/lembretes.tsx |
| 3.Serviço/hook cliente | services/lembretes/lembretes.native.ts; services/lembretes/calculoLembretes.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/medication-events |
| 5.Endpoint backend | GET /api/v1/patients/{id}/medication-events |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | medication_plan,medication_schedule |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Consulta plano → cálculo → agendamento expo-notifications → cancelamento por titular; sem confirmar antes do retorno |
| 12.Validações | Permissão SO,propriedade da agenda,privacidade tela bloqueada; web não simula entrega |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Sem ensaio de SO/aparelho; agenda finita depende de reabertura P12/P13;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | care-core.test.ts (cálculo); acesso-navegacao.spec.ts (tela); comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F15 — Alimentação: foto e histórico

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Upload autorizado |
| 2.Tela/componente | app/alimentacao/index.tsx; app/alimentacao/resultado.tsx; web/components/RefeicoesPaciente.tsx |
| 3.Serviço/hook cliente | hooks/useResultadoRefeicao.ts; services/alimentacao/refeicoes.ts |
| 4.Requisição HTTP | POST /api/v1/patients/{id}/meals; GET /api/v1/patients/{id}/meals; GET /api/v1/refeicoes/{idRefeicao} |
| 5.Endpoint backend | POST /api/v1/patients/{id}/meals; GET /api/v1/patients/{id}/meals; GET /api/v1/refeicoes/{idRefeicao} |
| 6.Controller | ArquivoPrivadoController |
| 7.Service | ArquivoPrivadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | meal_photo,file_object |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Upload autorizado → metadados refeição → resultado real → histórico/ficha; sem confirmar antes do retorno |
| 12.Validações | Titular,imagem/finalidade e referência de arquivo; sem classificação inventada |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Foto/histórico funcionais; análise é outra funcionalidade F16;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; mobile-care.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F16 — Análise alimentar

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Refeição autorizada |
| 2.Tela/componente | app/alimentacao/resultado.tsx; web/components/RefeicoesPaciente.tsx |
| 3.Serviço/hook cliente | services/alimentacao/refeicoes.ts |
| 4.Requisição HTTP | POST /api/v1/meals/{id}/analyze |
| 5.Endpoint backend | POST /api/v1/meals/{id}/analyze |
| 6.Controller | ArquivoPrivadoController |
| 7.Service | ProvedorAnaliseAlimentacaoHttp; ArquivoPrivadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | food_analysis_attempt,meal_photo,file_object |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Refeição autorizada → orçamento/tentativa → porta indisponível ou HTTPS autorizado → estado verdadeiro; sem confirmar antes do retorno |
| 12.Validações | Não estimar sódio exato por foto; falha/baixa confiança sem sucesso fictício |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Outro dev IA/nutrição,contrato/credenciais/corpus/aprovação P29;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT (indisponibilidade/falhas); sem fornecedor real; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F17 — Perfil e registro de atividades

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Equipe mantém perfil |
| 2.Tela/componente | app/atividade-fisica/index.tsx; app/atividade-fisica/registro.tsx; components/RoteiroAtividade.tsx |
| 3.Serviço/hook cliente | services/atividades/atividades.ts; hooks/useRoteiroAtividade.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/activity-profile; PUT /api/v1/patients/{id}/activity-profile; POST /api/v1/patients/{id}/activities |
| 5.Endpoint backend | GET /api/v1/patients/{id}/activity-profile; PUT /api/v1/patients/{id}/activity-profile; POST /api/v1/patients/{id}/activities |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | physical_activity_profile,activity_record,sync_operation |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Equipe mantém perfil → paciente lê informação → tipo/duração/estado → registro → ficha; sem confirmar antes do retorno |
| 12.Validações | Escrita perfil profissional; registro por titular/equipe; resposta explícita e UUID |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Perfil/autorrelato não são recomendação clínica; catálogo/vídeo em P27/P28;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; execucao-local.spec.ts; acesso-navegacao.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F18 — Semana e histórico de atividade

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Data início |
| 2.Tela/componente | components/HistoricoAtividades.tsx; app/atividade-fisica/historico.tsx |
| 3.Serviço/hook cliente | services/atividades/periodos.ts; services/atividades/idade.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/activities; GET /api/v1/pacientes/{idPaciente}/atividades/semana |
| 5.Endpoint backend | GET /api/v1/patients/{id}/activities; GET /api/v1/pacientes/{idPaciente}/atividades/semana |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | activity_record |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Data início → limites America/Sao_Paulo → agregação PG → dias/total/marcadores; sem confirmar antes do retorno |
| 12.Validações | Intervalos/ordem,domingo/segunda,ocorrência UTC e titular |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Não é planejamento semanal prescritivo nem metas aprovadas;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; idade.test.ts; execucao-local.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F19 — Recomendação/vídeo de exercícios

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | UI apresenta indisponibilidade/orientação atual; não escolhe prescrição inventada |
| 2.Tela/componente | app/atividade-fisica/video.tsx; app/atividade-fisica/ilustracoes.tsx |
| 3.Serviço/hook cliente | hooks/useRoteiroAtividade.ts; services/atividades/atividades.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/activity-profile |
| 5.Endpoint backend | GET /api/v1/patients/{id}/activity-profile |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | physical_activity_profile (existente); catálogo futuro não existe |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | UI apresenta indisponibilidade/orientação atual; não escolhe prescrição inventada; sem confirmar antes do retorno |
| 12.Validações | BLOCKED_PENDING_CLINICAL_APPROVAL; ausência de conteúdo não vira sucesso |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Outro dev exercícios; protocolo,catálogo licenciado,videos/acessibilidade P27/P28;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | E2E navegação/estados; sem motor clínico validado; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F20 — Mensagens e orientações

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Perfil autorizado |
| 2.Tela/componente | app/mensagens.tsx; app/atividade-fisica/orientacoes.tsx |
| 3.Serviço/hook cliente | hooks/useDadosAtividade.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/activity-profile |
| 5.Endpoint backend | GET /api/v1/patients/{id}/activity-profile |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | physical_activity_profile |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Perfil autorizado → orientação ou estado vazio → leitura no app; sem confirmar antes do retorno |
| 12.Validações | Não prometer envio/entrega de mensagem inexistente |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Somente leitura de orientação; chat/envio bidirecional não existe P34;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | acesso-navegacao.spec.ts; interface-responsiva.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F21 — Diário transcrito

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Formulário transcrição |
| 2.Tela/componente | web/components/CuidadoPaciente.tsx; web/components/TabelaCuidado.tsx |
| 3.Serviço/hook cliente | web/app/api/domain/[...path]/route.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/diary; POST /api/v1/patients/{id}/diary |
| 5.Endpoint backend | GET /api/v1/patients/{id}/diary; POST /api/v1/patients/{id}/diary |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | printed_diary_entry,blood_pressure_reading,medication_self_report |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Formulário transcrição → DTO → ocorrência/autor/origem → listagem/resumo; sem confirmar antes do retorno |
| 12.Validações | Profissional autorizado; distinguir ocorrência/inserção; preservação original |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Retificação auditada ainda P39; não é leitura direta do paciente/dispositivo;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; care.spec.ts; execucao-local.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F22 — Consultas

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Equipe abre paciente |
| 2.Tela/componente | web/app/(portal)/consultas/page.tsx; web/components/CuidadoPaciente.tsx |
| 3.Serviço/hook cliente | web/app/api/domain/[...path]/route.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/consultations; POST /api/v1/patients/{id}/consultations |
| 5.Endpoint backend | GET /api/v1/patients/{id}/consultations; POST /api/v1/patients/{id}/consultations |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | consultation |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Equipe abre paciente → ocorrência/notas/objetivos/plano → gravação → histórico/resumo; sem confirmar antes do retorno |
| 12.Validações | Escrita/leitura profissional; autor nominal; ordenar ocorrência |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Não é agenda/teleconsulta; retificação e estrutura adicional dependem escopo P39;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; care.spec.ts; execucao-local.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F23 — Resumo e relatórios

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Seleciona paciente |
| 2.Tela/componente | web/app/(portal)/relatorios/page.tsx; web/components/VisaoGeralPaciente.tsx |
| 3.Serviço/hook cliente | web/services/resumoPaciente.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/summary; GET /api/v1/patients/{id}/export |
| 5.Endpoint backend | GET /api/v1/patients/{id}/summary; GET /api/v1/patients/{id}/export |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | patient,blood_pressure_reading,medication_plan,medication_self_report,activity_record,meal_photo,consultation |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Seleciona paciente → agregações → resumo/ficha/JSON → limites descritos; sem confirmar antes do retorno |
| 12.Validações | Escopo profissional/admin e vínculo; sem export de outra unidade |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | JSON é resumo com20 itens/coleção e totais completos; export completo/formato institucional P35;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT (>20 itens); care.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F24 — Painel,busca e vínculos

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Sessão/unidade |
| 2.Tela/componente | web/app/(portal)/painel/page.tsx; web/app/(portal)/pacientes/page.tsx; web/components/VinculosPaciente.tsx |
| 3.Serviço/hook cliente | web/services/api.ts |
| 4.Requisição HTTP | GET /api/v1/dashboard; GET /api/v1/patients/search; GET /api/v1/professionals; GET /api/v1/patients/{id}/assignments; POST /api/v1/patients/{id}/assignments; POST /api/v1/patients/{id}/assignments/revoke |
| 5.Endpoint backend | GET /api/v1/dashboard; GET /api/v1/patients/search; GET /api/v1/professionals; GET /api/v1/patients/{id}/assignments; POST /api/v1/patients/{id}/assignments; POST /api/v1/patients/{id}/assignments/revoke |
| 6.Controller | InstituicaoController; CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | InstituicaoRepository; demais SQL no Service conforme necessidade |
| 9.Tabelas | patient,patient_professional_assignment,professional,organization,consultation |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Sessão/unidade → consulta escopada/paginada → lista/ficha → admin altera vínculo → acesso muda no backend; sem confirmar antes do retorno |
| 12.Validações | Admin da unidade para vínculos; profissional precisaassignment; busca não enumera outra clínica |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Ciclo de vida de profissional ainda P32; filtros correspondem à API real;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | InstituicaoIT; CuidadoIT; foundation.spec.ts; care.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F25 — Preferências e acessibilidade visual

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Conta da sessão |
| 2.Tela/componente | app/configuracoes.tsx; contexts/ContextoPreferencias.tsx; web/components/PreferenciasPortal.tsx |
| 3.Serviço/hook cliente | web/app/api/domain/[...path]/route.ts |
| 4.Requisição HTTP | GET /api/v1/conta/preferencias; PUT /api/v1/conta/preferencias |
| 5.Endpoint backend | GET /api/v1/conta/preferencias; PUT /api/v1/conta/preferencias |
| 6.Controller | PreferenciasController |
| 7.Service | JDBC no próprio controller (sem Service extra) |
| 8.Repository/persistência | JdbcTemplate no PreferenciasController; não existe PreferenciasService/Repository separado |
| 9.Tabelas | preferencia_conta |
| 10.Resposta | Preferência e versão da conta;409 se versão diverge |
| 11.Exibição | Conta da sessão → GET ou padrão → PUT versão → UI aplica → nova sessão recupera; sem confirmar antes do retorno |
| 12.Validações | Sem user_id no corpo; versão409;tamanho permitido; isolamento da conta |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Aceite browser; leitores/usuários representativos e nativo P10;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; preferencias.spec.ts; PreferenciasPortal.test.tsx; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F26 — Offline e sincronização

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Gerar UUID |
| 2.Tela/componente | components/TelaCuidado.tsx |
| 3.Serviço/hook cliente | services/sincronizacao/filaRegistros.ts; services/sincronizacao/regrasSincronizacao.ts; services/sincronizacao/armazenamentoFila.native.ts |
| 4.Requisição HTTP | POST /api/v1/patients/{id}/readings; POST /api/v1/patients/{id}/activities |
| 5.Endpoint backend | POST /api/v1/patients/{id}/readings; POST /api/v1/patients/{id}/activities |
| 6.Controller | CuidadoController |
| 7.Service | CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | sync_operation,blood_pressure_reading,activity_record |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Gerar UUID → guardar pendente → retry/backoff → autorização API → uma gravação → remover após ACK; sem confirmar antes do retorno |
| 12.Validações | Não reenviar comnovoUUID;filtrar dono;401/409/429/definitivo tratados;nenhum fallback sem cifra |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Web memória; SQLCipher/cache e queda física ainda P14/P15/P16;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | care-core.test.ts; mobile-care.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F27 — Navegação,responsividade e identidade

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Tela separa ScrollView/rodapé |
| 2.Tela/componente | components/ElementosInterface.tsx; components/BarraNavegacao.tsx; web/components/Icones.tsx; web/app/globals.css |
| 3.Serviço/hook cliente | services/ambiente.ts |
| 4.Requisição HTTP | Sem endpoint próprio |
| 5.Endpoint backend | Sem endpoint próprio |
| 6.Controller | Sem endpoint próprio |
| 7.Service | Sem Service próprio |
| 8.Repository/persistência | Nenhuma persistência própria; composição/leitura conforme fluxo |
| 9.Tabelas | Nenhuma tabela própria |
| 10.Resposta | Composição da UI,sem persistência própria |
| 11.Exibição | Tela separa ScrollView/rodapé → últimos botões visíveis → classes/CSP e logo original → menu responsivo; sem confirmar antes do retorno |
| 12.Validações | Sem rolagem horizontal;safearea estrutural; sem recriar logo;diferenças dos protótipos registradas |
| 13.Permissões | Layout público/protegido conforme rota; não substitui autorização dos dados |
| 14.Erros e limites | Larguras de browser aprovadas; fidelidade36 referências e acessibilidade física P10/P31;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | interface-responsiva.spec.ts; preferencias.spec.ts; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F28 — Pulseira

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Profissional registra dispositivo/configuração |
| 2.Tela/componente | web/components/CuidadoPaciente.tsx |
| 3.Serviço/hook cliente | web/app/api/domain/[...path]/route.ts |
| 4.Requisição HTTP | GET /api/v1/patients/{id}/device; POST /api/v1/patients/{id}/device; POST /api/v1/patients/{id}/device/configurations |
| 5.Endpoint backend | GET /api/v1/patients/{id}/device; POST /api/v1/patients/{id}/device; POST /api/v1/patients/{id}/device/configurations |
| 6.Controller | CuidadoController |
| 7.Service | AdaptadorPulseira; CuidadoService |
| 8.Repository/persistência | JdbcTemplate no Service; InstituicaoRepository para autorização/auditoria |
| 9.Tabelas | device,device_configuration |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Profissional registra dispositivo/configuração → adaptador explícito → estado persistido; sem confirmar antes do retorno |
| 12.Validações | Não afirmar sincronização real/medição/ingestão;204 sem dispositivo |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Sem BLE/protocolo/fabricante/ensaio físico P26;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | CuidadoIT; execucao-local.spec.ts (simulação/indisponibilidade); comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F29 — Auditoria e base legal

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Negócio autorizado |
| 2.Tela/componente | backend/demo/src/main/java/com/vivamais/repositories/InstituicaoRepository.java |
| 3.Serviço/hook cliente | Chamadas dos Services autorizados |
| 4.Requisição HTTP | Sem endpoint administrativo geral de consulta da trilha |
| 5.Endpoint backend | Sem endpoint administrativo geral de consulta da trilha |
| 6.Controller | InstituicaoController; CuidadoController |
| 7.Service | InstituicaoRepository.auditar |
| 8.Repository/persistência | InstituicaoRepository; demais SQL no Service conforme necessidade |
| 9.Tabelas | audit_event,consent_or_legal_basis_record |
| 10.Resposta | DTO/Map/Pagina do endpoint; esquema exato e códigos em backend/demo/openapi.json |
| 11.Exibição | Negócio autorizado → INSERT auditável sem corpo clínico → trigger recusa mutação; sem confirmar antes do retorno |
| 12.Validações | Escopo por unidade; nunca anexar segredo/OTP/foto; base legal exige definição |
| 13.Permissões | SessaoAutenticada, papel e escopo por unidade/vínculo/titular; detalhes no controller/Service |
| 14.Erros e limites | Consulta/retenção e fluxo base legal institucionais P22/P23;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | InstituicaoIT; CuidadoIT; migrações; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

### F30 — Privacidade,suporte e exclusão

| Ponto | Rastreio no código |
| --- | --- |
| 1.Início | Página pública |
| 2.Tela/componente | web/app/privacidade/page.tsx; web/app/suporte/page.tsx; web/app/exclusao-de-conta/page.tsx |
| 3.Serviço/hook cliente | web/components/DocumentoPublico.tsx |
| 4.Requisição HTTP | Sem endpoint de envio de solicitação |
| 5.Endpoint backend | Sem endpoint de envio de solicitação |
| 6.Controller | Sem endpoint de solicitação implementado |
| 7.Service | Sem Service de solicitação |
| 8.Repository/persistência | Nenhuma persistência própria; composição/leitura conforme fluxo |
| 9.Tabelas | Nenhuma tabela de pedido implementada |
| 10.Resposta | Composição da UI,sem persistência própria |
| 11.Exibição | Página pública → informação de revisão; não registra/enviapedido; sem confirmar antes do retorno |
| 12.Validações | Não alegar política aprovada ou formulário enviado; não apagar dado clínico sem regra |
| 13.Permissões | Layout público/protegido conforme rota; não substitui autorização dos dados |
| 14.Erros e limites | Políticas/canal oficial/protocolo/exclusão conforme retenção P23/P24/P25;400validação,401sessão,403escopo,409conflito,429limite,503serviço conforme operação |
| 15.Como testar | Testes de rotas públicas; não atendimento real; comandos em MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md; verificar persistência/isolamento descritos no inventário |

## 5. Alterar sem quebrar o fluxo

Escolher ID Pxx, ler contrato e teste antes de editar. Para um campo novo, passar por DTO Java → migração aditiva se persistido → consulta/mapeamento → OpenAPI snapshot → generated.ts → formulário/hook → testes negativos/persistência. Não adicionar uma resposta fictícia no frontend enquanto a API não existe. Manter estados204/vazio/indisponível reais. Para exercício/IA, seguir manuais do outro responsável e preservar portas. [Padrões detalhados](PADROES_DESENVOLVIMENTO_VIVAMAIS.md).

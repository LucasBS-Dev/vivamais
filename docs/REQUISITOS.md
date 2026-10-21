# Requisitos Viva+

Fonte: PROMPT_CODEX_VIVA_MAIS.md, especificação funcional v1.0 (13 seções e anexos A, B e C) e HOSPEDAGEM_DEMO.md, lidos em 16/10/2026. O DOCX original, o texto extraído e as três imagens estão preservados em docs/product. A autorização foi ampliada pelo usuário para Fases 1–7 e padronização estrutural/português/36 telas; publicação externa permanece dependente de autorização. O estado efetivamente testado está em STATUS.md.

| ID | Requisito encontrado | Entrega prevista | Dependência ou limite |
|---|---|---|---|
| R01 | Paciente, profissional individual e administrador; clínica e vínculo por paciente | F1 identidade, F2 cadastro | CPF não autentica; sem autoinscrição profissional |
| R02 | Dois percursos: aplicativo OU pulseira e diário | F1 modelo, F2 fluxo | O segundo não exige smartphone |
| R03 | Registro manual de pressão, pulso opcional, origem e horários separados | F2 | Sem diagnóstico; conversão 11 por 7 exige confirmação |
| R04 | OCR de foto do visor com confirmação e tratamento de ilegibilidade | F4 | Escolha e avaliação do provedor; câmera não mede pressão |
| R05 | Medicamentos, vigência, horários, histórico, notificações antecipadas e no horário | F3 | Somente profissional autorizado altera plano; permissão do SO |
| R06 | Confirmação de medicamentos como autorrelato; ausência de resposta distinta | F3 | Não inferir ingestão, não adesão ou dose de compensação |
| R07 | Fotos privadas e orientação alimentar educativa com texto e ícones | F4 armazenamento, F5 análise | BLOCKED_PENDING_CLINICAL_APPROVAL para critérios/IA |
| R08 | Perfil funcional, restrições, pergunta sobre estado atual, medição recente, materiais e registro voluntário | F5 | Anexo C não valida regras clínicas; recomendações personalizadas bloqueadas |
| R09 | Histórico, gráfico e filtros por período | F2 pressão, F3–6 demais | Datas UTC, apresentação America/Sao_Paulo |
| R10 | Offline protegido, fila com UUID, idempotência e retry/backoff | F4 | Não sobrescrever alterações clínicas silenciosamente |
| R11 | Cadastro e consulta autorizada; abas por modalidade | F2–6 | Isolamento por organização E vínculo |
| R12 | Transcrição do diário com origem, autor e instante da ocorrência e entrada | F3 | Não transformar ausência em evento clínico |
| R13 | Consulta de enfermagem, notas, barreiras, objetivos, plano e histórico | F6 | Julgamento e autoria profissionais |
| R14 | Pulseira de lembretes, programação e estados explícitos | F6 porta e simulador | Hardware real BLOCKED_PENDING_HARDWARE_SPEC; não mede pressão |
| R15 | Pesquisa, relatórios e exportação minimizados | F6–7 | Escopo por recurso e auditoria |
| R16 | Acessibilidade para idosos: texto ampliável, contraste, rótulos, alvos grandes e leitores | Todas | Teste representativo com pessoas e dispositivos pendente |
| R17 | LGPD, bases legais, auditoria, retenção, direitos e privacidade | Fundação + F7 | Dados reais bloqueados até revisão institucional |
| R18 | Mesma API Java para web e mobile, sem acesso direto às tabelas | F1 | Next/Vercel, Java/Railway, PostgreSQL e storage/Supabase, EAS |
| R19 | Testes, CI, migrações, segredos, backup/restore e observabilidade econômica | F1 e F7 | Não alegar execução sem evidência |
| R20 | Distribuição Google Play e App Store com suporte, privacidade e exclusão | Preparação F1, liberação F7 | Contas, políticas, dispositivos e aprovação humana |

## Leitura visual dos anexos

A contém boas-vindas, acesso, quatro ações principais, pressão manual/foto/histórico, medicamentos e alimentação. B contém login, painel, cadastro, perfil com abas, pressão, medicamentos, alimentação, atividade, pulseira, diário e consultas. C detalha estado atual, medição recente, perfil funcional, exercício adaptado, demonstração, alternativa e histórico. Preservar arquitetura de informação, azul e verde-petróleo, cartões claros e legibilidade; não copiar pessoas, valores ou conclusões clínicas dos mockups. O acesso ilustrado por CPF isolado é substituído por autenticação segura. Textos que prometem segurança clínica por IA não serão implementados sem validação.

Atualização de prioridade (17/10): pedido integral de telas/52 recursos em product/PEDIDO_TELAS_52_RECURSOS_2026-10-17.md. Cadastro/edição demográfica opcional e protegida, ativação visível, Home, configurações, contato e semana agora têm implementação. Dados reais, conteúdo clínico personalizado, hardware e publicação continuam bloqueados conforme o escopo já estabelecido. Evidências atuais em evidencias/TELAS_NAVEGAVEIS_2026-10-17.md.

## Atualização obrigatória de acesso — 20/10

Pedido integral em product/PEDIDO_ACESSO_PACIENTE_2026-10-20.md. Paciente sem senha: CPF/nascimento identificam; autorização criptográfica do aparelho e código numérico de quatro dígitos/uso único são obrigatórios no novo dispositivo. Cadastro APP requer CPF/nascimento; contato opcional. Não autenticar somente com dados pessoais. V8 aditiva e interfaces/contratos reais, mantendo login profissional. Critérios, testes e limites em ACESSO_PACIENTE_SEM_SENHA.md e evidencias/ACESSO_PACIENTE_2026-10-20.md.

## Atualização V9 — cadastro/SMS/interface

Pedido integral em product/PEDIDO_CADASTRO_SMS_INTERFACE_2026-10-20.md. Celular brasileiro obrigatório em novos cadastros, E.164 e troca assistida/revogação; CPF estrutural não é consulta oficial. Código de quatro números permanece protegido e não é devolvido ao portal/API normal. SMS tem porta/adaptador Twilio e caixa LOCAL cifrada explicitamente identificada; envio real depende de configuração autorizada. V9 preserva V1–V8/dados. Barra compartilhada fora da rolagem, indicador de demonstração separado e logo original/configurações responsivas. Pendências gerais e responsabilidades em LEVANTAMENTO_COMPLETO_PENDENCIAS.md e PLANO_IMPLEMENTACAO_PENDENCIAS.md.

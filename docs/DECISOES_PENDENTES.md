# Decisões e riscos pendentes

| ID | Estado | Decisão necessária | Responsável e impacto |
|---|---|---|---|
| D01 | BLOCKED | Critérios de alimentação, mensagens, exercícios e sinais de alerta aprovados | Equipe clínica/nutrição; IA e prescrição personalizada desligadas |
| D02 | BLOCKED | Fabricante, firmware, protocolo/SDK e ensaio físico da pulseira | Responsável hardware; integração real não implementada |
| D03 | BLOCKED | Controlador/operadores, bases legais, retenção, transferência internacional e contratos | Instituição/jurídico; somente dados sintéticos |
| D04 | NOT_STARTED | Provedor OCR e avaliação de erros, custos e privacidade | Engenharia e clínica; F4 |
| D05 | NOT_STARTED | Ativação/recuperação por canal verificado e alternativa para quem não tem e-mail/celular | Produto e segurança; F2, não usar CPF como segredo |
| D06 | NOT_STARTED | Quem pode prescrever, editar plano e reautenticar ações críticas | Instituição; F3 |
| D07 | NOT_STARTED | Android/iOS mínimos, fuso de lembretes e dispositivos representativos | Produto; validar antes de beta |
| D08 | NOT_STARTED | Repositório remoto privado, contas Vercel/Railway/Supabase/EAS e orçamento | Titular; nenhuma conta paga ou publicação criada |
| D09 | NOT_STARTED | ANVISA/SaMD aplicável, saúde nas lojas, textos finais e conta de revisão | Responsáveis clínico/jurídico; liberação F7 |
| D10 | NOT_STARTED | Necessidade de integração institucional/prontuário | Instituição; porta futura, sem dependência na fundação |

Autenticação de fundação: e-mail de conta provisionada + senha com hash adaptativo e token opaco curto, revogável e armazenado como hash na API. Sem autoinscrição profissional, credencial fixa, CPF obrigatório ou canal de recuperação fictício. Web usa cookie HttpOnly via BFF; app usa armazenamento seguro nativo. Recuperação assistida apenas por administrador local até a definição do canal verificado. Recursos protegidos não entram em cache público.

Riscos operacionais: Supabase Free pode pausar; pool JDBC deve usar endereço compatível com a rede do Railway; memória Java e consumo precisam ser medidos; quotas e preços exigem checagem antes de contratar; armazenamento privado, uploads, backup externo e teste de restauração são condições para fases posteriores. Conta de demo não autoriza coletar dados reais.

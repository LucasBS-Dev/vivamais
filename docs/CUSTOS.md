# Custos da demonstração

Planejamento em 16/10/2026; preços em USD, sem impostos, câmbio, suporte ou garantia contratual. Validar painel antes de contratar. Nenhum serviço pago foi ativado. Desenvolvimento é esforço separado no BACKLOG.md (45–80 dias úteis estimados para todas as fases, sem esperas externas); multiplicar pela diária negociada, não confundir com hospedagem.

## Cenário principal

10–50 contas sintéticas, poucas requisições, uma API e uma réplica. Reserva preliminar **US$10–25/mês**. Railway Hobby tem compromisso mínimo US$5 que cobre consumo até esse valor. Referência consultada: RAM US$10/GB-mês, CPU US$20/vCPU-mês e egress US$0,05/GB. O total é `max(5, RAM média × 10 + CPU média × 20 + saída GB × 0,05 + volumes)`. [Fonte Railway](https://docs.railway.com/pricing/plans).

Limite de container não equivale a RAM efetivamente consumida. Docker foi preparado para 1 GB e heap máximo de 60%; RSS, CPU, tempo de startup e consumo faturado serão registrados após execução/deploy. Não há medição de Railway nesta etapa. Exemplo próprio: 0,65 GB médios + 0,05 vCPU média + 2 GB de saída ≈ US$7,60; 1 GB + 0,25 vCPU + 5 GB ≈ US$15,25. A reserva cobre variação, mas não é teto técnico.

Vercel Hobby US$0, limitado a uso pessoal não comercial e quotas: elegibilidade institucional precisa ser verificada. [Fonte Vercel](https://vercel.com/docs/plans/hobby). Supabase Free US$0, 500 MB de banco, 1 GB de arquivos e 5 GB de saída; pausa após uma semana inativa e sem backups automáticos incluídos. Auth próprio na API: não se usa cota Supabase Auth nem envio de e-mails nesta fundação. [Fonte Supabase](https://supabase.com/pricing). Expo EAS Free tem até 15 builds Android e 15 iOS e fila de baixa prioridade; builds adicionais exigem aguardar ou aprovar mudança de plano. [Fonte Expo](https://expo.dev/pricing).

## Cenários futuros para dimensionamento

| Cenário | Hipóteses próprias para estimativa | Reserva mensal preliminar | Gatilhos de revisão |
|---|---|---|---|
| 10–50 sintéticos | 1 API, 0,5–1 GB médio; sem IA/SMS; até 100 fotos de 0,5 MB na fase de fotos | US$10–25 | RSS, CPU, pausa, saída e tamanho do banco |
| 200 ativos | 1–2 GB API, 20 fotos/pessoa/mês × 0,5 MB = 2 GB novos/mês | US$50–120 | Storage gratuito insuficiente; banco pago/backup, Vercel comercial quando aplicável |
| 1.000 ativos | 2–4 GB API inicial; 10 GB fotos novos/mês; medir retenção e saída | US$120–350 | Índices/pool, disponibilidade, storage/egress, identidade/MFA, observabilidade |

As faixas de 200/1.000 não são cotação dos provedores nem autorizam dados reais; dependem de concorrência, retenção, elegibilidade e SLA. Modelar custos de fotos multiplicando volume retido e downloads; não assumir que o número de contas prevê CPU. Neon/R2 permanecem alternativas a comparar no painel, sem migração nesta entrega.

## Custos separados e controles

Taxas de referência do kit, a confirmar na inscrição: Google Play US$25 uma vez; Apple US$99/ano, eventual isenção institucional sujeita à aprovação. Domínio próprio opcional. IA/OCR, SMS, e-mail transacional, suporte, tributos, builds excedentes, backups e logs externos ficam fora da reserva base; nenhuma chave foi configurada. Antes de fotos: limite de 2 MB por upload e 20 fotos/mês por conta como proposta financeira a validar (ainda não implementado no backend F1), bucket privado e retenção definida. Antes de IA: quota diária/global, timeout, retry limitado, observabilidade sem conteúdo e bloqueio por orçamento, além da aprovação clínica.

Configurar manualmente alertas Railway em US$10/20 e teto US$25 quando o plano permitir; teto que interrompe serviço afeta disponibilidade e deve ser revisado antes das lojas. Alertar Supabase em 70%/85% de banco e storage e revisar utilização mensal; o Free não garante cobrança de excedente nem continuidade. Manter EAS Free e não habilitar upgrade automático. Esses alertas de conta **não foram configurados** por ausência de contas autorizadas. `node infra/cost-estimate.mjs 0.65 0.05 2` calcula cenário e alerta local; não impõe teto no provedor. Monitorar somente métricas agregadas, nunca CPF/medidas/fotos/tokens. Usar backup/restore e checagem de pausa documentados, sem pings artificiais.

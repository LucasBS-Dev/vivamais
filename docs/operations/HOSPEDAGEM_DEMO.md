# Hospedagem Viva+ — Demonstração acadêmica pequena

Atualizado para planejamento em 16/10/2026. Validar preços/quotas diretamente no painel do fornecedor antes da contratação.

## Configuração principal (baixo custo, pouca mudança arquitetural)

| Camada | Provedor/plano | Valor de referência | Limite/atenção |
| --- | --- | --- | --- |
| Web Next.js | Vercel Hobby | US$ 0/mês | Somente projeto pessoal não comercial e sujeito a limites de utilização. |
| API Java Spring Boot | Railway Hobby | US$ 5/mês de compromisso mínimo; cobrança total é o maior valor entre US$ 5 e o consumo efetivo | RAM, CPU e saída de dados cobrados pelo uso. Projetar inicialmente 1GB e medir. |
| Banco PostgreSQL | Supabase Free | US$ 0/mês | 500MB de banco; pode pausar projeto gratuito após ~7 dias de inatividade. |
| Armazenamento de fotos | Supabase Storage Free | US$ 0/mês dentro da cota | 1GB gratuito; buckets privados, sem acesso direto do app aos dados clínicos. |
| Builds + submissão às lojas | Expo EAS Free | US$ 0/mês dentro da cota | Até 15 builds Android + 15 iOS por mês (verificar a cota atual). |
| Domínios | Subdomínio Vercel/Railway | US$ 0 | Adquirir domínio próprio é opcional. |

### Estimativa

Para demo com 10–50 usuários de teste com dados sintéticos e poucas requisições: separar US$ 10–25/mês (cerca de R$ 51–127 a US$ 1 = R$ 5,0752, cotação pontual de 16/10/2026) para hospedagem, predominantemente Java no Railway. Isso é uma margem estimativa, não garantia nem preço fixo. Não estão incluídos gastos com IA de fotos, SMS, suporte e taxas/impostos de pagamento. Configure limite de gasto, métricas e alertas.

### Publicação em lojas (independente de hospedagem)

- Conta Google Play Console: US$ 25 **uma vez**; para contas pessoais novas, pode ser necessário teste fechado com pelo menos 12 testadores durante 14 dias contínuos antes de solicitar produção.
- Apple Developer Program: US$ 99 **por ano**. Instituição de ensino credenciada pode ser elegível à isenção se a própria instituição fizer a inscrição e for aprovada; estudantes individuais não recebem isenção automaticamente.
- Para receber revisão das lojas, fornecer acesso demonstrativo, política de privacidade, informações de contato e link público HTTPS que aponte para API realmente funcionando.

## Plano alternativo mais resiliente à inatividade

Se a pausa do Supabase Free impedir funcionamento contínuo nas lojas:

- Migrar apenas o PostgreSQL para **Neon Free**, preservando todo o modelo de dados Flyway/JPA (limite gratuito: 1GB por projeto, conforme informação publicada em outubro de 2026).
- Usar storage privado **Cloudflare R2 Standard** para fotos, se necessário; inclui 10GB-mês e cotas de operações gratuitas, mas exige ativar serviço de cobrança e monitorar uso. O backend continua autorizado a assinar/verificar os arquivos.
- Continuar com Railway Hobby para Java e Vercel Hobby para Next.js; **o aplicativo móvel não muda de stack**.

**Alternativa US$ 0/mês para testes locais, não recomendada para review das lojas:** Render Free no Java, devido à hibernação após 15 minutos sem tráfego e reinício lento; projetos gratuitos do Supabase podem também pausar.

## Segurança e limites reais

Usar contas e fotos sintéticas. Sem regra clínica aprovada não habilitar recomendações personalizadas por IA. Para dados reais de saúde, reavaliar segurança, disponibilidade, backup, LGPD, responsabilidades e termos de cada prestador antes da coleta.

## Checklist rápido de implantação

1. `docker compose up` local com PostgreSQL; implementar migrations e testes de acesso.
2. Criar web Vercel Hobby e URL pública `/privacidade`, `/suporte` e fluxo de exclusão de conta.
3. Criar projeto Supabase Free; buckets privados; aplicar migrations pelo backend; não expor service-role.
4. Deploy da API Java no Railway Hobby, com segredo de conexão JDBC e autenticação server-side. Habilitar HTTPS, CORS restrito, rate limiting e `GET /actuator/health` com conteúdo mínimo.
5. Configurar web e mobile com URL pública da API via env de build, sem credenciais secretas.
6. Submeter builds beta via EAS e realizar testes Android/iOS em dispositivos reais; depois preparar submissão às lojas.
7. Validar antes da submissão que o banco NÃO está pausado, links estão acessíveis e o login de demonstração funciona.
8. Fazer teste periódico de backup/restauração, monitorar erros, consumo de RAM e de conta. Planejar Neon/R2 ou upgrade se a exigência de disponibilidade aumentar.

## Referências oficiais

- Vercel: https://vercel.com/pricing
- Railway: https://docs.railway.com/pricing/understanding-your-bill
- Supabase: https://supabase.com/pricing
- Supabase pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Expo EAS: https://expo.dev/pricing
- Neon: https://neon.com/blog/neon-free-plan-1-gb-per-project
- Cloudflare R2: https://developers.cloudflare.com/r2/pricing/
- Google Play Console: https://support.google.com/googleplay/android-developer/answer/6112435?hl=pt-BR
- Apple Developer: https://developer.apple.com/programs/enroll/

# Como navegar no Viva+

**Fluxo vigente V9:** [cadastro e SMS local](CADASTRO_E_ATIVACAO_SMS.md). Iniciar com `Iniciar-VivaMais.cmd -Producao -SmsLocal`; o portal não mostra o código, e a caixa LOCAL não envia SMS real.

Nesta máquina, mantenha PostgreSQL, API, portal e prévia Expo em execução. Os endereços abaixo são locais.

| Acesso                     | Endereço              | Conta principal de teste             |
| -------------------------- | --------------------- | ------------------------------------ |
| Aplicativo do paciente     | http://127.0.0.1:8081 | CPF/nascimento e aparelho autorizado |
| Portal profissional        | http://127.0.0.1:3000 | profissional.a@demo.vivamais.invalid |
| Administração da clínica A | http://127.0.0.1:3000 | admin.a@demo.vivamais.invalid        |

A senha profissional local permanece no arquivo privado `../../work/demo-credentials.json` (campo `password`, fora do repositório). Abra somente no seu computador; não envie ao chat. A senha antiga de paciente não autentica mais. Contas/dados existentes foram preservados; clínica B continua isolada da A. Veja o [guia do novo acesso](ACESSO_PACIENTE_SEM_SENHA.md).

## Aplicativo

1. Na prévia 8081, escolha Começar e informe CPF/nascimento fictícios cadastrados pela equipe. Em aparelho autorizado, ENTRAR abre a Home. Em aparelho novo, informe o código de quatro números e selecione ATIVAR CONTA → Ir para o início. Não há e-mail/senha do paciente.
2. O profissional usa Cadastrar paciente → modalidade Aplicativo, com nome/CPF/nascimento/celular fictícios; e-mail é opcional. Após salvar, em Ativar ou recuperar acesso, confere pessoalmente a identidade, marca a confirmação, informa sua senha profissional e seleciona Solicitar código por SMS. Em LOCAL, a equipe consulta a caixa cifrada pelo utilitário privado. Uso único/dez minutos, com limites de emissão e tentativas. Complete CPF/nascimento/celular ausentes de contas antigas antes de emitir; não invente dados reais.
3. Pressão: Digitar os valores → Salvar → conferir e confirmar → resultado/histórico. Foto reconhece o visor e exige conferência. A câmera não mede pressão.
4. Medicamentos: consulte o plano registrado pela equipe, os horários e informe seu autorrelato. Lembretes do sistema operacional precisam de um build Android/iOS e permissão; o navegador informa essa limitação.
5. Alimentação: selecione a foto de teste, informe observações e envie. Foto/histórico/resultado são privados. A análise fica explicitamente indisponível sem serviço/critérios aprovados.
6. Atividade: consulte perfil e orientações, ilustrações e registre uma atividade que já realizou. O envio pode ser reenviado da fila com o mesmo UUID. Semana mostra minutos e dias com registros reais. Não há prescrição automática ou vídeo aprovado.
7. Perfil: consulte seus dados. Para trocar o celular de ativação ou corrigir cadastro, procure a equipe; a alteração do número exige confirmação profissional e nova ativação. Configurações permite ampliar os textos e sair da conta.

No navegador, o token curto fica em memória e o cookie HttpOnly do aparelho permite retomar/renovar a sessão. A fila não confirmada continua em memória: não recarregue antes do envio. Sair mantém autorização, mas exige CPF/nascimento no próximo acesso. Configurações → Desautorizar este aparelho → Confirmar desautorização exige nova verificação. Novo código profissional revoga aparelhos anteriores. Android/iOS usam SecureStore, ainda sem ensaio físico. Utilize sempre o host 127.0.0.1 nos endereços locais.

## Portal

Depois do login profissional, use o menu: Início, Pacientes, Cadastrar paciente, Consultas, Relatórios e Configurações. Um cookie ainda válido retoma o painel ao abrir a raiz. Na ficha, use Editar cadastro e as abas de pressão, medicamentos, alimentação, diário, atividade e consultas. Pulseira aparece na modalidade correspondente; hardware real continua indisponível. O profissional somente vê pacientes da sua clínica e do seu vínculo.

Recuperação de paciente é assistida: na ficha, Recuperar acesso exige a senha atual do profissional e solicita novo SMS após confirmar identidade e número. Uma solicitação aceita revoga aparelhos anteriores; falha de envio não revoga um aparelho que já funcionava. LOCAL é sempre identificado como teste, sem entrega real. Contas profissionais são provisionadas pela equipe, sem autoinscrição pública.

Os links entre portal e aplicativo usam NEXT_PUBLIC_APLICATIVO_URL e EXPO_PUBLIC_PORTAL_URL; configure URLs públicas HTTPS antes de qualquer publicação. Nenhum deploy foi realizado. Para iniciar novamente, siga README.md; a infraestrutura econômica permanece a existente.

Capturas e testes: [evidências do lote](evidencias/TELAS_NAVEGAVEIS_2026-10-17.md).

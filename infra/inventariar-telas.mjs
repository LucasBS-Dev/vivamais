import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const validada = 'Funcional e validada';
const parcial = 'Parcialmente funcional';
const semEnsaio = 'Implementada, mas ainda não validada';
// Metadados revisados contra componentes/controles reais. O scanner abaixo exige cobertura de cada arquivo de tela.
const aplicativo = [
  ['index', 'Boas-vindas', 'Começar ou Cadastrar ou ativar minha conta', 'Acesso abre; marca/ilustração legíveis', 'app_01_boas_vindas'],
  ['acesso', 'Entrar', 'Boas-vindas → Começar', 'Login válido abre Home; inválido mantém acesso', 'app_02_acesso_cpf'],
  ['cadastro', 'Cadastro orientado', 'Boas-vindas → Cadastrar ou ativar minha conta', 'Explica convite e abre ativação/acesso', 'extra_cadastro_aplicativo'],
  ['ativar-conta', 'Ativar conta', 'Cadastro → Já tenho código: ativar conta', 'CPF/nascimento e código de 4 números autorizam aparelho; não pede senha', 'extra_ativacao_aplicativo'],
  ['inicio', 'Home paciente', 'Entrar com paciente', 'Nome, resumo API, quatro módulos e rodapé acessíveis', 'app_03_pagina_inicial'],
  ['pressao/index', 'Minha Pressão', 'Home → Minha Pressão', 'Entrada abre digitação, foto e histórico', 'app_04_pressao_entrada'],
  ['pressao/digitar', 'Digitar e conferir pressão', 'Minha Pressão → Digitar os valores', 'Valida valores; exige conferência antes de enviar', 'app_05_pressao_digitacao'],
  ['pressao/foto', 'Foto do visor e OCR', 'Minha Pressão → Tirar foto do aparelho', 'Upload privado e OCR real exigem revisão; câmera nativa sem ensaio', 'app_06_pressao_foto', parcial, 'API/PostgreSQL, modelo Tesseract; câmera nativa depende do SO'],
  ['pressao/resultado', 'Resultado da pressão', 'Digitar → Salvar → Sim, está correto', 'Distingue confirmação API e fila; exige id e paciente', 'app_07_pressao_resultado'],
  ['pressao/historico', 'Histórico da pressão', 'Minha Pressão → Ver meu histórico', 'Gráfico, filtros, páginas e reconsulta de dados salvos', 'app_08_pressao_historico'],
  ['medicamentos/index', 'Meus Medicamentos', 'Home → Meus Medicamentos', 'Horários reais e autorrelatos persistidos; sem alterar plano', 'app_09_medicamentos'],
  ['lembretes', 'Lembretes', 'Home → Meus Lembretes ou barra → Lembretes', 'Horários persistidos; notificação do SO indisponível no navegador', 'extra_lembretes_aplicativo', parcial, 'Plano real; build nativo/permissão para notificação'],
  ['alimentacao/index', 'Foto e histórico alimentar', 'Home → Minha Alimentação', 'Foto/observação privadas persistem e reabrem; análise não configurada', 'app_11_alimentacao_foto', parcial, 'API/PostgreSQL e storage; serviço/critérios alimentares pendentes'],
  ['alimentacao/resultado', 'Resultado alimentar', 'Alimentação → Ver resultado da refeição', 'Mostra foto/dados e indisponibilidade; não inventa classificação', 'app_12_alimentacao_resultado', parcial, 'Id de refeição autorizado; provedor/critério aprovado pendente'],
  ['atividade-fisica/index', 'Entrada da atividade', 'Home → Atividade Física', 'Abre roteiro, registro, semana, galeria e orientações', 'atividade_02_entrada'],
  ['atividade-fisica/como-esta-hoje', 'Estado atual informado', 'Atividade → Ver minhas informações', 'Três respostas; Continuar exige escolha e não libera exercício', 'atividade_03_como_esta_hoje'],
  ['atividade-fisica/verificacao-pressao', 'Verificação da pressão', 'Estado atual → Continuar', 'Última medição real e escolha obrigatória', 'atividade_04_verificacao_pressao'],
  ['atividade-fisica/suas-informacoes', 'Informações da atividade', 'Verificação da pressão → Continuar', 'Idade derivada do cadastro e perfil real; ausência explícita', 'atividade_05_suas_informacoes'],
  ['atividade-fisica/atividade-hoje', 'Atividade de hoje', 'Informações → Ver orientações da atividade', 'Navega e mostra bloqueio de recomendação personalizada', 'atividade_06_atividade_hoje', parcial, 'Critérios/conteúdo clínico aprovados pendentes'],
  ['atividade-fisica/passo-a-passo', 'Passo a passo', 'Atividade de hoje → Passo a passo e materiais', 'Bloqueio explícito, sem sequência clínica inventada', 'atividade_07_passo_a_passo', parcial, 'Material aprovado pendente'],
  ['atividade-fisica/video', 'Vídeo', 'Passo a passo → Vídeo demonstrativo', 'Indica vídeo revisado não fornecido', 'atividade_08_video_demonstrativo', parcial, 'Arquivo/autorização/material aprovados pendentes'],
  ['atividade-fisica/alternativa', 'Alternativa de atividade', 'Atividade de hoje → Hoje preciso de algo mais leve', 'Bloqueio honesto e acesso ao registro voluntário', 'atividade_09_alternativa_mais_leve', parcial, 'Critérios clínicos aprovados pendentes'],
  ['atividade-fisica/ilustracoes', 'Galeria de atividades', 'Atividade → Ilustrações das atividades', 'Cinco imagens; escolha preenche tipo de atividade já realizada', 'extra_ilustracoes_atividades'],
  ['atividade-fisica/registro', 'Registro e conclusão da atividade', 'Atividade → Registrar atividade realizada', 'Valida relato/minutos/data; salva ou mantém fila idempotente', 'atividade_10_registro_atividade'],
  ['atividade-fisica/historico', 'Semana e histórico de atividade', 'Atividade → Ver minha semana de atividades', 'Totais completos da semana, mês/todos e paginação reais', 'atividade_11_historico_atividades'],
  ['atividade-fisica/orientacoes', 'Orientações gerais da atividade', 'Atividade → Mensagens e orientações da atividade', 'Explicações gerais e retorno pelo Perfil/Início', 'extra_orientacoes_atividade'],
  ['historico/index', 'Meu Histórico', 'Home → Meu Histórico', 'Quatro categorias; filtros e persistência conforme categoria', 'extra_historico_geral'],
  ['mensagens', 'Orientações da equipe', 'Barra inferior → Mensagens', 'Consulta/atualiza orientação do perfil; sem envio de chat', 'atividade_12_orientacoes'],
  ['perfil', 'Meu Perfil', 'Home → Meu Perfil ou barra → Perfil', 'Dados reais; telefone editável reflete no portal após nova sessão', 'extra_perfil_paciente'],
  ['configuracoes', 'Configurações do paciente', 'Home ou Perfil → Configurações e acessibilidade', 'Texto aumenta; sessão/saída reais; preferência persistente por conta', 'extra_configuracoes_aplicativo'],
];
const portal = [
  ['page', 'Acesso profissional', '/', 'Público', 'Entrar na plataforma', 'Login/BFF seguro e retorno ao painel', 'web_01_login_profissional'],
  ['(portal)/painel/page', 'Painel', '/painel', 'Profissional ou administrador', 'Menu → Início', 'Contagens e lista no escopo autorizado', 'web_02_painel_inicial'],
  ['(portal)/pacientes/page', 'Lista/busca de pacientes', '/pacientes', 'Profissional ou administrador', 'Menu → Pacientes', 'Busca por nome, estado vazio e paginação da API', 'extra_web_lista_pacientes'],
  ['(portal)/pacientes/novo/page', 'Cadastrar paciente', '/pacientes/novo', 'Profissional ou administrador', 'Menu → Cadastrar paciente', 'Demografia/modalidade/vínculo e código único para APP', 'web_03_cadastro_paciente'],
  ['(portal)/pacientes/[id]/page', 'Ficha do paciente', '/pacientes/{id}', 'Profissional vinculado ou administrador da clínica', 'Pacientes → nome', 'Dados, edição e abas autorizadas; id não amplia permissão', 'web_04_perfil_paciente'],
  ['(portal)/consultas/page', 'Selecionar paciente para consulta', '/consultas', 'Profissional ou administrador', 'Menu → Consultas', 'Seleção abre ficha na aba Consultas; não é agenda', 'extra_web_consultas'],
  ['(portal)/relatorios/page', 'Selecionar paciente para relatório', '/relatorios', 'Profissional ou administrador', 'Menu → Relatórios', 'Seleção leva ao resumo/JSON autorizado, sem PDF/analytics fictício', 'extra_web_relatorios'],
  ['(portal)/configuracoes/page', 'Configurações do portal', '/configuracoes', 'Profissional ou administrador', 'Menu → Configurações', 'Conta/unidade, gestão de vínculos e links públicos', 'extra_web_configuracoes'],
  ['privacidade/page', 'Privacidade', '/privacidade', 'Público', 'Rodapé/login → Privacidade', 'Rascunho declarado, revisão institucional pendente', 'extra_web_privacidade', parcial],
  ['suporte/page', 'Suporte', '/suporte', 'Público', 'Menu/rodapé → Ajuda e suporte', 'Rascunho; não envia mensagens nem possui canal final', 'extra_web_suporte', parcial],
  ['exclusao-de-conta/page', 'Exclusão de conta', '/exclusao-de-conta', 'Público', 'Configurações → Solicitação de exclusão', 'Rascunho; não envia solicitação fictícia', 'extra_web_exclusao', parcial],
];
const aliases = [['activate','/activate','/ativar-conta'],['login','/login','/acesso'],['home','/home','/inicio'],['history','/history','/historico'],['profile','/profile','/perfil'],['module/[key]','/module/{key}','Componente de cuidado para quatro chaves; disponibilidade para outras']];
let indice = 0;
const linhas = [];
function adicionar(dados) { linhas.push({ id: `T${String(++indice).padStart(2,'0')}`, ...dados }); }
for (const [arquivo,nome,acesso,esperado,captura,estado=validada,dependencias='API/PostgreSQL e sessão do paciente'] of aplicativo) {
  const rota = '/' + arquivo.replace(/(^|\/)index$/, '').replace(/\/$/, '');
  adicionar({ nome, aplicacao:'Paciente', tipo:'Rota', fonte:`app/${arquivo}.tsx`, rota:rota || '/', perfil:['index','acesso','cadastro','ativar-conta'].includes(arquivo)?'Público':'Paciente autenticado', estado, dependencias, acesso, esperado, captura:`${captura}.png` });
}
for (const [arquivo,nome,rota,perfil,acesso,esperado,captura,estado=validada] of portal)
  adicionar({ nome, aplicacao:'Profissional', tipo:'Rota', fonte:`web/app/${arquivo}.tsx`, rota, perfil, estado, dependencias:perfil==='Público'?'Next; revisão institucional para texto final':'Next/BFF, API/PostgreSQL e sessão autorizada', acesso, esperado, captura:`${captura}.png` });
for (const [arquivo,rota,destino] of aliases)
  adicionar({ nome:`Compatibilidade: ${rota}`, aplicacao:'Paciente', tipo:'Compatibilidade', fonte:`app/${arquivo}.tsx`, rota, perfil:['activate','login'].includes(arquivo)?'Público':'Paciente', estado:['activate','login','module/[key]'].includes(arquivo)?semEnsaio:validada, dependencias:'Destino canônico/componente compartilhado; aliases públicos e módulo legado ainda sem ensaio próprio nesta etapa', acesso:`Endereço antigo ${rota}`, esperado:destino, captura:null });
for (const [aplicacao,fonte] of [['Paciente','app/+not-found.tsx'],['Profissional','web/app/not-found.tsx']])
  adicionar({ nome:'Rota não encontrada', aplicacao, tipo:'Estado técnico', fonte, rota:'Endereço inexistente', perfil:'Conforme autenticação do caminho', estado:semEnsaio, dependencias:'Roteador', acesso:'Digitar caminho inexistente', esperado:'Mensagem de página não encontrada e retorno', captura:null });
for (const [nome,aba,captura,esperado,estado=validada] of [
  ['Pressão arterial','readings','web_05_historico_pressao','Registro, filtros rápidos/manuais, gráfico/páginas'],
  ['Medicamentos','medications','web_06_medicamentos','Plano, edição/versionamento e autorrelatos'],
  ['Sete dias de autorrelatos','medications','extra_web_autorrelatos_semana','Período de sete datas com totais reais'],
  ['Alimentação','meals','web_07_alimentacao','Fotos/histórico privados; análise externa indisponível',parcial],
  ['Atividade física','activities','web_08_atividade_fisica','Registros e perfil funcional; sem prescrição automática'],
  ['Pulseira','device','web_09_configuracao_pulseira','Modalidade diário, configuração/simulador; hardware bloqueado',parcial],
  ['Diário impresso','diary','web_10_registro_diario','Transcrição persistida e origem/autoria distintas'],
  ['Formulário de consulta','consultations','web_11_resumo_consulta','Nova consulta real, campos validados'],
  ['Histórico/resumo de consultas','consultations','web_12_historico_consultas','Consulta, resumo de registros recentes e export JSON'],
  ['Editar cadastro','overview','extra_web_editar_cadastro','Demografia validada e edição versionada'],
]) adicionar({ nome, aplicacao:'Profissional', tipo:'Aba/estado da ficha', fonte:'web/components/CuidadoPaciente.tsx', rota:`/pacientes/{id}?aba=${aba}`, perfil:'Profissional vinculado/administrador; Pulseira somente BRACELET_DIARY', estado, dependencias:'API/PostgreSQL; dependências externas explicitadas quando indisponíveis', acesso:`Ficha → ${nome}`, esperado, captura:`${captura}.png` });
adicionar({ nome:'Notificação nativa de medicamento', aplicacao:'Paciente', tipo:'Estado do sistema operacional (sem rota web)', fonte:'services/lembretes/', rota:'—', perfil:'Paciente com permissão no SO', estado:semEnsaio, dependencias:'Build Android/iOS, permissão e aparelho; serviço local implementado, entrega não ensaiada', acesso:'Lembretes → Autorizar e agendar lembretes locais em aparelho', esperado:'Navegador explica limite; entrega/aparência do SO exigem ensaio físico', captura:null });

async function listar(diretorio, criterio) {
  const encontrados=[];
  for(const entrada of await readdir(join(raiz,diretorio),{withFileTypes:true})){
    const relativo=`${diretorio}/${entrada.name}`;
    if(entrada.isDirectory()) encontrados.push(...await listar(relativo,criterio));
    else if(criterio(relativo)) encontrados.push(relativo);
  }
  return encontrados;
}
const fontes=[...await listar('app',p=>p.endsWith('.tsx')&&!p.endsWith('_layout.tsx')),...await listar('web/app',p=>p.endsWith('/page.tsx')||p.endsWith('/not-found.tsx'))];
const cobertas=new Set(linhas.map(l=>l.fonte));
const faltam=fontes.filter(f=>!cobertas.has(f));
if(faltam.length)throw new Error(`Rotas sem classificação: ${faltam.join(', ')}`);
const manifesto=JSON.parse(await readFile(join(raiz,'docs/evidencias/testes-manuais/capturas.json'),'utf8'));
const capturas=new Set(manifesto.capturas.map(c=>c.arquivo));
const caminhoCaptura=l=>l.captura&&capturas.has(l.captura)?`[Imagem](evidencias/testes-manuais/${l.captura})`:'Sem captura própria';
const inicio=`# Inventário real das telas — 19–20/10/2026\n\nGerado por \`node infra/inventariar-telas.mjs\`, com leitura de cada arquivo de tela e metadados revisados contra seus controles. ${fontes.length} arquivos de tela encontrados: 30 rotas canônicas Expo, 11 páginas Next, seis compatibilidades Expo e dois estados de rota não encontrada. Layouts, loading/error boundaries e endpoints BFF não contam como novas telas de produto.\n\nClassificações: **Funcional e validada** indica o escopo de navegador/API ensaiado; **Parcialmente funcional** distingue armazenamento/navegação validados de análise, conteúdo clínico, notificações ou textos institucionais incompletos; **Implementada, mas ainda não validada** não possui evidência suficiente de interação. **Pendente de implementação** é reservado às capacidades ausentes, nunca inferido apenas pela existência de rota. Notificação tem serviço implementado e ensaio do SO pendente, conforme linha própria. Não há aceite de todos os protótipos nem testes físicos.\n\nOs resultados dos ensaios desta execução estão em [evidências locais](evidencias/EXECUCAO_LOCAL_2026-10-19.md). O checklist do usuário começa sem aprovação preenchida.\n\n`;
let inventario=inicio;
for(const tipo of ['Rota','Compatibilidade','Estado técnico','Aba/estado da ficha','Estado do sistema operacional (sem rota web)']){
  inventario+=`## ${tipo}\n\n| ID / tela | Rota / aplicação / perfil | Estado e dependências | Acesso e captura |\n|---|---|---|---|\n`;
  for(const l of linhas.filter(l=>l.tipo===tipo))inventario+=`| ${l.id} ${l.nome} | \`${l.rota}\` · ${l.aplicacao} · ${l.perfil} | ${l.estado}. ${l.dependencias}. ${l.esperado} | ${l.acesso}. ${caminhoCaptura(l)} |\n`;
  inventario+='\n';
}
inventario+='## As 42 capturas anteriores e os estados repetidos\n\nO manifesto anterior permanece em evidencias/visual/capturas.json. Seus 42 PNG não são 42 rotas: atividade_01_inicio_atividade repete a Home; atividade_12_orientacoes representa /mensagens; web_11_resumo_consulta mostra o formulário de Nova consulta; abas da ficha compartilham /pacientes/{id}; confirmação de pressão e conclusão de atividade são estados de suas rotas. O arquivo app_02_acesso_cpf conserva o nome da referência antiga, mas a tela autentica por e-mail/senha. A referência de notificação nativa não possui captura web.\n\n## Capturas desta execução\n\n| Arquivo | Tela ou estado |\n|---|---|\n';
for(const c of manifesto.capturas)inventario+=`| [${c.arquivo}](evidencias/testes-manuais/${c.arquivo}) | ${c.tela} |\n`;
inventario+='\n## Fontes conferidas\n\n'+fontes.map(f=>`- \`${f}\``).join('\n')+'\n\nO JSON correspondente permite comparar uma próxima alteração de rotas com este inventário, sem recomeçar a análise. Uma captura comprova apresentação; as asserções E2E e Java/API comprovam os fluxos indicados, sem cobrir conteúdo clínico bloqueado.\n';
await writeFile(join(raiz,'docs/INVENTARIO_TELAS.md'),inventario);
await writeFile(join(raiz,'docs/evidencias/testes-manuais/inventario.json'),JSON.stringify({ data:'2026-10-20', fontes, telas:linhas },null,2)+'\n');
let checklist='# Checklist dos seus testes manuais\n\nNome do avaliador: __________  Data: __________  Navegador/build: __________\n\nInicie os serviços pelo [guia Windows](GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md). Siga o [roteiro detalhado](GUIA_TESTES_TODAS_AS_TELAS.md). Use somente pessoas fictícias. Não anote senha, código, CPF ou token.\n\nPreencha Resultado com **Aprovado / Reprovado / Não executado / Bloqueado**. As linhas começam vazias para registrar o seu ensaio, independentemente dos testes automatizados. Registre a falha sem marcar integrações indisponíveis como aprovadas. Rotas com dados exigem sessão e identificador obtidos pela interface.\n\n| ID / tela | Aplicação | Caminho para acessar | Funcionalidade / resultado esperado | Resultado | Observações |\n|---|---|---|---|---|---|\n';
for(const l of linhas)checklist+=`| ${l.id} ${l.nome} | ${l.aplicacao} | ${l.acesso} · \`${l.rota}\` | ${l.esperado} | ☐ | |\n`;
checklist+='\n## Ensaios transversais (além de abrir a tela)\n\n| Ensaio | Ação / resultado esperado | Resultado | Observações |\n|---|---|---|---|\n';
for(const [nome,acao] of [
 ['Login inválido','Uma tentativa com senha incorreta: erro genérico, sem sessão/dados'],
 ['Ativação inválida e confirmação','Senhas diferentes/código inválido rejeitados; código válido usado apenas uma vez'],
 ['Validação demográfica','Nome obrigatório; telefone/nascimento/CPF inválidos recusados; CPF opcional'],
 ['Edição concorrente','Duas edições com mesma versão: segunda retorna conflito, sem sobrescrita silenciosa'],
 ['Persistência após nova sessão','Confirmar envio, sair/entrar e reler pressão, telefone, atividade, refeição e autorrelato'],
 ['Integração profissional → paciente','Plano/perfil funcional editados aparecem ao atualizar no app'],
 ['Integração paciente → profissional','Telefone, pressão, foto, atividade e autorrelato aparecem na ficha da mesma pessoa'],
 ['Sete dias de medicamentos','Escolher período completo; somar Tomei, Não tomei e Sem confirmação sem inferir ingestão'],
 ['Fila com falha de rede','Abortar envio, restaurar rede e reenviar mesmo UUID: uma única ocorrência persistida'],
 ['Sessão web do app','Navegação preserva sessão; F5 pede login; dados confirmados permanecem'],
 ['Logout e rotas protegidas','Sair, abrir Perfil/Pressão/Painel sem sessão: acesso negado/redirecionado'],
 ['Isolamento','Conta B não abre dados/foto da clínica A; profissional sem vínculo recebe 403'],
 ['Acessibilidade','Texto ampliado/zoom/foco: ações continuam legíveis e utilizáveis; preferência persistente por conta'],
 ['Encerramento/reinício','Encerrar serviços/banco corretamente, reiniciar e reencontrar registros confirmados'],
 ['Dependências externas','Registrar análise alimentar, exercício/vídeo e hardware como bloqueados, sem resultados simulados'],
 ['Android/iOS','Marcar Não executado até ensaio físico de câmera, SQLCipher, sessão e notificações'],
])checklist+=`| ${nome} | ${acao} | ☐ | |\n`;
await writeFile(join(raiz,'docs/CHECKLIST_TESTES_MANUAIS.md'),checklist);
console.log(`${fontes.length} arquivos de tela cobertos; ${linhas.length} itens classificados; ${manifesto.capturas.length} capturas relacionadas. Checklist sem resultados preenchidos.`);

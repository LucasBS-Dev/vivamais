[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[0-9a-f]{40}$')]
    [string]$CommitRevisado,
    [switch]$VerificarSomente
)
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'Use PowerShell 7 (pwsh) em um terminal normal do Windows.' }
$raizPublicacao = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$remotoEsperado = 'https://github.com/joaosoares03/vivamais.git'
function Executar-GitPublicacao([Parameter(ValueFromRemainingArguments = $true)][string[]]$Argumentos) {
    $saida = & git -C $raizPublicacao @Argumentos
    if ($LASTEXITCODE -ne 0) { throw "Git não concluiu a operação $($Argumentos[0]). Nenhum force push ou reescrita foi executado." }
    return (($saida | Out-String).Trim())
}
function Obter-HashRemotoPublicacao {
    $linha = Executar-GitPublicacao @('ls-remote', 'origin', 'refs/heads/main')
    $hash = ($linha -split '\s+')[0]
    if ($hash -notmatch '^[0-9a-f]{40}$') { throw 'Não foi possível conferir main no remoto.' }
    return $hash
}
function Confirmar-ArvorePublicada([string]$Hash) {
    $cabecalhos = @{ 'User-Agent' = 'VivaMais-Transferencia'; Accept = 'application/vnd.github+json' }
    $url = "https://api.github.com/repos/joaosoares03/vivamais/git/trees/$($Hash)?recursive=1"
    $arvore = Invoke-RestMethod -Uri $url -Headers $cabecalhos -TimeoutSec 45
    if ($arvore.truncated) { throw 'Resposta de árvore truncada; publicação requer conferência completa.' }
    $paths = @($arvore.tree | ForEach-Object path)
    foreach ($prefixo in @('app/', 'components/', 'contexts/', 'hooks/', 'services/', 'assets/', 'web/app/', 'web/components/', 'web/services/', 'web/public/', 'backend/demo/src/', 'backend/demo/.mvn/', 'packages/', 'tests/', 'infra/', 'docs/')) {
        if (-not ($paths | Where-Object { $_.StartsWith($prefixo) })) { throw "Componente ausente no GitHub: $prefixo" }
    }
    foreach ($documento in @('MANUAL_TECNICO_COMPLETO_VIVAMAIS.md', 'INVENTARIO_COMPLETO_FUNCIONALIDADES.md', 'COMO_FORAM_IMPLEMENTADAS_AS_FUNCIONALIDADES.md', 'GUIA_COMPLETO_AMBIENTE_DESENVOLVIMENTO.md', 'MANUAL_COMPLETO_TESTES_DESENVOLVEDOR.md', 'ARQUITETURA_BANCO_DADOS.md', 'PLANO_TECNICO_CONTINUIDADE_DESENVOLVIMENTO.md', 'PADROES_DESENVOLVIMENTO_VIVAMAIS.md', 'INDICE_DOCUMENTACAO.md', 'RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md')) {
        if ($paths -notcontains "docs/$documento") { throw "Documento ausente no GitHub: $documento" }
    }
    $migracoes = @($paths | Where-Object { $_ -match '^backend/demo/src/main/resources/db/migration/V\d+__.*\.sql$' })
    if ($migracoes.Count -ne 9) { throw 'Conferir as nove migrações publicadas antes de fechar a transferência.' }
    $privados = @($paths | Where-Object { $_ -match '(^|/)(\.local|node_modules|\.next|target|dist|pg-data|backups|work)(/|$)|(^|/)\.env$|credentials.*\.json$|\.(dump|sms|key|pfx)$' })
    if ($privados.Count -gt 0) { throw 'Árvore remota contém caminho privado inesperado. Interrompido, sem reescrita.' }
    if (@($arvore.tree | Where-Object mode -EQ '160000').Count -gt 0) { throw 'Submódulo inesperado; revisar antes do fechamento.' }
    return @{ Arquivos = @($arvore.tree | Where-Object type -EQ 'blob').Count; Migracoes = $migracoes.Count; Privados = $privados.Count }
}

$branch = Executar-GitPublicacao @('branch', '--show-current')
$origem = Executar-GitPublicacao @('remote', 'get-url', 'origin')
$envio = Executar-GitPublicacao @('remote', 'get-url', '--push', 'origin')
$head = Executar-GitPublicacao @('rev-parse', 'HEAD')
if ($branch -ne 'main' -or $origem -ne $remotoEsperado -or $envio -ne $remotoEsperado) { throw 'Branch/remoto diferentes do pedido autorizado.' }
if ($head -ne $CommitRevisado) { throw 'HEAD mudou desde a revisão. Não publicar conteúdo novo sem nova conferência.' }
if (Executar-GitPublicacao @('status', '--porcelain=v1')) { throw 'Há alterações/stage posteriores à revisão. Preserve-as e revise antes de publicar.' }
Executar-GitPublicacao @('diff', '--cached', '--check') | Out-Null
$prova = Get-Content -LiteralPath (Join-Path $raizPublicacao 'docs/evidencias/consolidacao-publicacao/validacao-tecnica.json') -Raw | ConvertFrom-Json
if ($prova.java.falhas -ne 0 -or $prova.java.erros -ne 0 -or -not $prova.e2e.aprovado -or $prova.seguranca.achadosCandidato -ne 0) { throw 'Evidência técnica não atende ao escopo revisado.' }
if ($VerificarSomente) {
    Write-Output "Pré-verificação local aprovada. HEAD=$head; remoto e branch corretos. Nenhum commit/push ou leitura de credencial foi solicitado."
    return
}

# Executar em PowerShell do usuário, fora da sandbox que negou CredEnumerate.
# Git utiliza o gerenciador normal; não recebe senha/token em argumentos.
$promptAnterior = $env:GIT_TERMINAL_PROMPT
$interacaoAnterior = $env:GCM_INTERACTIVE
try {
    $env:GIT_TERMINAL_PROMPT = '1'
    $env:GCM_INTERACTIVE = 'auto'
    Executar-GitPublicacao @('fetch', 'origin') | Out-Null
    & git -C $raizPublicacao merge-base --is-ancestor origin/main HEAD
    if ($LASTEXITCODE -ne 0) { throw 'main remota tem trabalho não integrado. Interrompido; consultar o mantenedor, sem sobrescrever histórico.' }
    Executar-GitPublicacao @('push', 'origin', 'main') | Out-Null
    if ((Obter-HashRemotoPublicacao) -ne $CommitRevisado) { throw 'O hash remoto não corresponde ao conteúdo revisado.' }
    $conferencia = Confirmar-ArvorePublicada $CommitRevisado
    $agora = [DateTimeOffset]::Now.ToString('o')
    $urlCommit = "https://github.com/joaosoares03/vivamais/commit/$CommitRevisado"
    $arquivoRelatorio = Join-Path $raizPublicacao 'docs/RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md'
    $relatorio = [IO.File]::ReadAllText($arquivoRelatorio)
    $bloco = @"
<!-- PUBLICACAO_INICIO -->
Fonte e documentação publicados em **main** de [joaosoares03/vivamais](https://github.com/joaosoares03/vivamais). Commit de conteúdo revisado: [$CommitRevisado]($urlCommit), confirmado por ls-remote e árvore completa da API GitHub em $agora. Push sem force; visibilidade preservada. Componentes, arquivos internos de web, nove migrações, testes, contratos, assets, scripts e manuais conferidos; nenhum caminho privado ou submódulo inesperado. Um commit adicional contém este fechamento documental; identificá-lo por git log -1 -- docs/RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md. O identificador final fica também no comprovante privado .local/publicacao/resultado.json. Publicação de fonte não libera produção. Estado do CI deve ser conferido por SHA; testes locais não provam jobs remotos aprovados.
<!-- PUBLICACAO_FIM -->
"@
    $relatorio = [regex]::Replace($relatorio, '(?s)<!-- PUBLICACAO_INICIO -->.*?<!-- PUBLICACAO_FIM -->', [Text.RegularExpressions.MatchEvaluator]{ param($m) $bloco })
    [IO.File]::WriteAllText($arquivoRelatorio, $relatorio)
    $arquivoPublicacao = 'docs/evidencias/consolidacao-publicacao/publicacao.json'
    @{
        publicadoEm = $agora; repositorio = $remotoEsperado; branch = 'main'; commitConteudo = $CommitRevisado
        urlCommit = $urlCommit; push = 'confirmado'; conferidoPor = 'git ls-remote e API GitHub trees recursiva'
        arvore = $conferencia; forcePush = $false; visibilidadeAlterada = $false; deploy = $false
        ci = 'Consultar Actions pelo SHA; aprovação não presumida'
        fechamento = 'Commit documental seguinte; hash exato no Git e comprovante privado .local/publicacao/resultado.json'
    } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $raizPublicacao $arquivoPublicacao) -Encoding utf8
    $arquivoProva = 'docs/evidencias/consolidacao-publicacao/validacao-tecnica.json'
    $provaAtualizada = Get-Content -LiteralPath (Join-Path $raizPublicacao $arquivoProva) -Raw | ConvertFrom-Json -AsHashtable
    $provaAtualizada['publicacao'] = @{ estado = 'Fonte publicado'; commitConteudo = $CommitRevisado; confirmadoEm = $agora; deploy = $false; ci = 'Verificar Actions; não presumir aprovação' }
    $provaAtualizada | ConvertTo-Json -Depth 14 | Set-Content -LiteralPath (Join-Path $raizPublicacao $arquivoProva) -Encoding utf8
    foreach ($arq in @('PROGRESSO.md', 'docs/STATUS.md', 'docs/PROXIMA_EXECUCAO.md')) {
        $arquivo = Join-Path $raizPublicacao $arq
        $texto = [IO.File]::ReadAllText($arquivo)
        $texto = [regex]::Replace($texto, '(?s)\n## (Publicação pendente por acesso às credenciais|Próximo passo obrigatório de publicação).*?(?=\n## |\z)', "`n")
        $nota = "`nPublicação confirmada em $agora, main, conteúdo $CommitRevisado. Componentes/manuais/privados conferidos no remoto; detalhes em RELATORIO_TRANSFERENCIA_E_PUBLICACAO. Git fonte publicado; implantação/lojas/produção e CI verde não presumidos.`n`n## Histórico anterior à confirmação da publicação`n"
        $indice = $texto.IndexOf("`n")
        [IO.File]::WriteAllText($arquivo, $texto.Insert($indice + 1, $nota))
    }
    $permitidos = @('docs/RELATORIO_TRANSFERENCIA_E_PUBLICACAO.md', $arquivoPublicacao, $arquivoProva, 'PROGRESSO.md', 'docs/STATUS.md', 'docs/PROXIMA_EXECUCAO.md')
    $mudancas = @((Executar-GitPublicacao @('diff', '--name-only')) -split '\r?\n' | Where-Object { $_ })
    foreach ($arq in $mudancas) { if ($arq -notin $permitidos) { throw 'Mudança concorrente detectada; fechamento não commitado. Preserve o trabalho e revise.' } }
    foreach ($arq in $permitidos) { Executar-GitPublicacao @('add', '--', $arq) | Out-Null }
    $preparados = @((Executar-GitPublicacao @('diff', '--cached', '--name-only')) -split '\r?\n' | Where-Object { $_ })
    foreach ($arq in $preparados) { if ($arq -notin $permitidos) { throw 'Stage concorrente detectado. Nenhum commit de fechamento foi criado; preserve e revise.' } }
    Executar-GitPublicacao @('diff', '--cached', '--check') | Out-Null
    Executar-GitPublicacao @('commit', '-m', 'docs: confirma publicacao e transferencia Viva Mais') | Out-Null
    $fechamento = Executar-GitPublicacao @('rev-parse', 'HEAD')
    Executar-GitPublicacao @('push', 'origin', 'main') | Out-Null
    if ((Obter-HashRemotoPublicacao) -ne $fechamento) { throw 'Fechamento ainda não confirmado no remoto; não afirmar conclusão.' }
    Confirmar-ArvorePublicada $fechamento | Out-Null
    $limpo = -not [bool](Executar-GitPublicacao @('status', '--porcelain=v1'))
    $pastaPrivada = Join-Path $raizPublicacao '.local/publicacao'
    New-Item -ItemType Directory -Force -Path $pastaPrivada | Out-Null
    @{ confirmadoEm = [DateTimeOffset]::Now.ToString('o'); commitConteudo = $CommitRevisado; commitFinal = $fechamento; remotoConfere = $true; gitLimpo = $limpo; repositorio = $remotoEsperado } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $pastaPrivada 'resultado.json') -Encoding utf8
    Write-Output "Publicado e conferido: https://github.com/joaosoares03/vivamais/commit/$fechamento"
    Write-Output "Git limpo: $limpo. Código publicado; produção/lojas não liberadas."
} finally {
    $env:GIT_TERMINAL_PROMPT = $promptAnterior
    $env:GCM_INTERACTIVE = $interacaoAnterior
}

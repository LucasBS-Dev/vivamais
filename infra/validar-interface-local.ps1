[CmdletBinding()]
param([switch]$Capturar, [switch]$Producao, [string[]]$ArquivosTeste = @(), [string]$DiretorioCapturas = "docs/evidencias/testes-manuais")
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ambiente-local.ps1')
$temporarioAnteriorViva = $env:TEMP; $tmpAnteriorViva = $env:TMP
$temporarioTesteViva = Join-Path $estadoViva "temporarios-testes"
New-Item -ItemType Directory -Force -Path $temporarioTesteViva | Out-Null
$env:TEMP = $temporarioTesteViva; $env:TMP = $temporarioTesteViva
Push-Location $raizViva
try {
    Verificar-ServicosViva
    $credencial = Join-Path $apoioViva 'demo-credentials.json'
    if (-not (Test-Path -LiteralPath $credencial)) { throw 'Arquivo privado de credenciais ausente. Configure uma conta sintética; não coloque a senha no repositório.' }
    $env:E2E_PASSWORD = (Get-Content -LiteralPath $credencial -Raw | ConvertFrom-Json).password
    if (-not $env:E2E_PASSWORD) { throw 'Senha de teste ausente. Testes autenticados não serão ignorados silenciosamente.' }
    if (Test-Path (Join-Path $apoioViva 'playwright-browsers')) { $env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $apoioViva 'playwright-browsers' }
    $env:E2E_PRODUCTION = $(if ($Producao) { 'true' } else { 'false' })
    $env:API_BASE_URL = 'http://127.0.0.1:8080'
    $env:CAPTURE_OUTPUT_DIRECTORY = $DiretorioCapturas
    # Clínica B reserva uma janela de login para as capturas; o escopo não é ampliado.
    $env:CAPTURE_PROFESSIONAL_EMAIL = 'profissional.b@demo.vivamais.invalid'
    $argumentos = @('node_modules\@playwright\test\cli.js', 'test') + $ArquivosTeste
    $instanteViva = Get-Date -Format 'yyyyMMdd-HHmmss'
    $nome = "e2e-local-$instanteViva.log"
    if ($Capturar) { $argumentos = @('infra\capturar-telas.mjs'); $nome = "capturas-local-$instanteViva.log" }
    New-Item -ItemType Directory -Force -Path $estadoViva | Out-Null
    & node @argumentos 2>&1 | ForEach-Object {
        $linha = [string]$_
        $linha = $linha.Replace($env:E2E_PASSWORD, '[oculto]')
        $linha = $linha -replace '(?i)value="[^"]*"', 'value="[oculto]"'
        $linha = $linha -replace '(?i)Bearer\s+\S+', 'Bearer [oculto]'
        $linha = $linha -replace '[A-Za-z0-9_-]{40,}', '[valor longo oculto]'
        $linha
    } | Tee-Object -FilePath (Join-Path $estadoViva $nome)
    $resultadoViva = $LASTEXITCODE
    & node 'infra\sanitizar-diagnosticos.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível sanitizar os diagnósticos privados. Não compartilhe test-results.' }
    if ($resultadoViva -ne 0) { throw 'Verificação da interface falhou. Consulte o log filtrado; nenhum fluxo com falha é considerado concluído.' }
} finally {
    $env:E2E_PASSWORD = $null
    $env:TEMP = $temporarioAnteriorViva; $env:TMP = $tmpAnteriorViva
    Pop-Location
}

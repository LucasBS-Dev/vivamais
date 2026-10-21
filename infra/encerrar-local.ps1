[CmdletBinding()]
param([switch]$NoTerminalControlador)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ambiente-local.ps1')
$registro = Join-Path $estadoViva 'processos.json'
if (-not (Test-Path -LiteralPath $registro)) { Write-Host 'Nenhum conjunto registrado por iniciar-local.ps1. Nos terminais manuais, use Ctrl+C.'; return }
$estado = Get-Content -LiteralPath $registro -Raw | ConvertFrom-Json
if ($estado.Raiz -ne $raizViva) { throw 'Registro pertence a outro projeto. Nenhum processo foi encerrado.' }
if (-not $NoTerminalControlador) {
    @{ Execucao = $estado.Execucao } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $estadoViva 'parada-solicitada.json') -Encoding UTF8
    Write-Output 'Pedido de encerramento enviado ao terminal controlador. Aguarde a confirmação nele; dados não foram apagados.'
    return
}
for ($numero = $estado.Processos.Count - 1; $numero -ge 0; $numero--) {
    $item = $estado.Processos[$numero]
    $processo = Get-Process -Id $item.Id -ErrorAction SilentlyContinue
    if (-not $processo) { continue }
    if ([Math]::Abs(($processo.StartTime.ToUniversalTime() - [datetime]$item.Inicio).TotalSeconds) -gt 1) { throw 'PID foi reutilizado. Nenhum processo desconhecido será encerrado; confira manualmente.' }
    # Somente o PID conferido acima e seus filhos. .NET do PowerShell 7 dispensa WMI/taskkill.
    if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'O controlador de processos requer PowerShell 7; use Ctrl+C nos terminais manuais.' }
    $processo.Kill($true)
    if (-not $processo.WaitForExit(10000)) { throw 'A árvore do serviço não confirmou encerramento. Registro preservado para investigação.' }
    Write-Host "Encerrado: $($item.Servico)."
}
if ($estado.BancoIniciado) {
    $configuracaoViva = Obter-ConfiguracaoViva
    & (Join-Path $configuracaoViva.BancoBin 'pg_ctl.exe') stop -D $configuracaoViva.BancoDiretorio -m fast -w -t 30
    if ($LASTEXITCODE -ne 0) { throw 'O banco não confirmou desligamento; verifique pg_ctl status. Registro preservado.' }
    Write-Host 'PostgreSQL confirmou desligamento com checkpoint. Banco e objetos preservados.'
}
# Arquivar apenas o registro pertencente a esta execução, sem remover logs ou dados.
$arquivoEncerrado = Join-Path $estadoViva ('processos-encerrados-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.json')
Move-Item -LiteralPath $registro -Destination $arquivoEncerrado

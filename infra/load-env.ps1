param([string]$Path = (Join-Path $PSScriptRoot '..\.env'))
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $Path)) { throw 'Copie .env.example para .env e preencha valores locais.' }
foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*([A-Z][A-Z0-9_]*)\s*=(.*)$') {
        $value = $Matches[2].Trim()
        if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) { $value = $value.Substring(1,$value.Length-2) }
        [Environment]::SetEnvironmentVariable($Matches[1], $value, 'Process')
    }
}
Write-Output 'Ambiente local carregado sem exibir valores.'

[CmdletBinding()]
param([string]$ArquivoEvidencia = 'docs/evidencias/backup-restauracao-2026-10-20.json')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ambiente-local.ps1')
$configuracao = Obter-ConfiguracaoViva
if (Testar-PortaViva 8080) { throw 'Encerre os três serviços pelo controlador antes do snapshot. O PostgreSQL deve permanecer ativo.' }
if (Testar-PortaViva 8082) { throw 'Porta auxiliar 8082 ocupada; nenhum processo será substituído.' }
Configurar-BackendViva $configuracao -NaoInterativo
Selecionar-JavaViva $configuracao
$env:PGPASSWORD = $env:DATABASE_PASSWORD
$env:PGHOST = $configuracao.BancoHost; $env:PGPORT = [string]$configuracao.BancoPorta; $env:PGUSER = $configuracao.BancoUsuario
$cliente = Join-Path $apoioViva 'pg-client'
foreach ($ferramenta in @('pg_dump.exe','pg_restore.exe','createdb.exe','psql.exe')) { if (-not (Test-Path (Join-Path $cliente $ferramenta))) { throw 'Cliente PostgreSQL 17 completo não encontrado.' } }
$nomeEnsaio = "viva_restore_$(Get-Date -Format yyyyMMdd)_$([guid]::NewGuid().ToString('N').Substring(0,8))"
$destino = Join-Path $apoioViva "backups\$nomeEnsaio"
$chaves = Join-Path $apoioViva "chaves-backup\$nomeEnsaio"
function Proteger-PastaViva([string]$Pasta) {
    New-Item -ItemType Directory -Path $Pasta -Force | Out-Null
    $permissoes = [Security.AccessControl.DirectorySecurity]::new()
    $identidade = [Security.Principal.WindowsIdentity]::GetCurrent().User
    $permissoes.SetOwner($identidade)
    $permissoes.SetAccessRuleProtection($true,$false)
    $regra = [Security.AccessControl.FileSystemAccessRule]::new($identidade,'FullControl','ContainerInherit,ObjectInherit','None','Allow')
    $permissoes.AddAccessRule($regra)
    Set-Acl -LiteralPath $Pasta -AclObject $permissoes
    if (-not (Get-Acl -LiteralPath $Pasta).AreAccessRulesProtected) { throw 'Permissões privadas não confirmadas.' }
}
function Consultar-EnsaioViva([string]$Banco,[string]$Sql) {
    $saida = & (Join-Path $cliente 'psql.exe') -X -q -t -A -v ON_ERROR_STOP=1 -d $Banco -c $Sql
    if ($LASTEXITCODE -ne 0) { throw 'Consulta de integridade falhou; nenhum dado foi apagado.' }
    return ($saida -join "`n").Trim()
}
$sqlIntegridade = @'
SELECT json_build_object(
 'migracoes',(SELECT json_agg(json_build_object('versao',version,'checksum',checksum,'sucesso',success) ORDER BY installed_rank) FROM flyway_schema_history),
 'contagens',(SELECT json_object_agg(nome,total ORDER BY nome) FROM (SELECT table_name nome,(xpath('/row/c/text()',query_to_xml(format('SELECT count(*) c FROM %I.%I',table_schema,table_name),false,true,'')))[1]::text::bigint total FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE') t),
 'tabelasProtegidas',(SELECT count(*) FROM pg_tables WHERE schemaname='public' AND rowsecurity));
'@
$apiAuxiliar = $null
try {
    Proteger-PastaViva $destino; Proteger-PastaViva $chaves
    $antes = Consultar-EnsaioViva $configuracao.BancoNome $sqlIntegridade
    $origemArquivos = $env:FILES_DIRECTORY
    $resumoArquivosAntes = (Get-ChildItem -LiteralPath $origemArquivos -File -Force | Sort-Object Name | Get-FileHash -Algorithm SHA256 | ForEach-Object Hash) -join ','
    $aclChave = Get-Acl -LiteralPath (Join-Path $origemArquivos '.encryption-key')
    $acessosPublicos = @($aclChave.Access | Where-Object { $_.AccessControlType -eq 'Allow' -and $_.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -in @('S-1-1-0','S-1-5-11','S-1-5-32-545') })
    if ($acessosPublicos.Count -gt 0) { throw 'A chave original permite leitura ampla. Corrija a ACL privada antes de continuar.' }
    $arquivoDump = Join-Path $destino 'dados.dump'
    & (Join-Path $cliente 'pg_dump.exe') -d $configuracao.BancoNome --format=custom --no-owner --no-acl "--file=$arquivoDump"
    if ($LASTEXITCODE -ne 0) { throw 'Backup falhou.' }
    & node (Join-Path $PSScriptRoot 'cifrar-backup.mjs') criar $destino $chaves $origemArquivos
    if ($LASTEXITCODE -ne 0) { throw 'Cifra/autenticidade não validada.' }
    & node (Join-Path $PSScriptRoot 'cifrar-backup.mjs') restaurar $destino $chaves
    if ($LASTEXITCODE -ne 0) { throw 'Decifração/integridade não validada.' }
    & (Join-Path $cliente 'createdb.exe') --template=template0 $nomeEnsaio
    if ($LASTEXITCODE -ne 0) { throw 'Banco isolado não criado. Nenhum banco existente será reutilizado.' }
    & (Join-Path $cliente 'pg_restore.exe') --exit-on-error --no-owner --no-acl --dbname=$nomeEnsaio (Join-Path $destino 'restauracao.dump')
    if ($LASTEXITCODE -ne 0) { throw 'Restauração falhou; cópia preservada para diagnóstico.' }
    $restaurado = Consultar-EnsaioViva $nomeEnsaio $sqlIntegridade
    if ($antes -ne $restaurado) { throw 'Contagens, migrations ou proteção diferem após restauração.' }
    Consultar-EnsaioViva $nomeEnsaio 'UPDATE auth_session SET revoked_at=now() WHERE revoked_at IS NULL; DELETE FROM account_activation; DELETE FROM file_download_grant;' | Out-Null
    Consultar-EnsaioViva $nomeEnsaio 'DO $$ BEGIN IF to_regclass(''dispositivo_acesso_paciente'') IS NOT NULL THEN UPDATE dispositivo_acesso_paciente SET revogado_em=now(),manter_sessao=false WHERE revogado_em IS NULL; UPDATE codigo_ativacao_paciente SET utilizado_em=now() WHERE utilizado_em IS NULL; UPDATE desafio_acesso_paciente SET utilizado_em=now() WHERE utilizado_em IS NULL; END IF; END $$;' | Out-Null
    $credenciaisRevogadasViva = $null
    if (($restaurado | ConvertFrom-Json).migracoes | Where-Object versao -EQ '8') {
        $credenciaisPendentesViva = Consultar-EnsaioViva $nomeEnsaio 'SELECT (SELECT count(*) FROM dispositivo_acesso_paciente WHERE revogado_em IS NULL)+(SELECT count(*) FROM codigo_ativacao_paciente WHERE utilizado_em IS NULL)+(SELECT count(*) FROM desafio_acesso_paciente WHERE utilizado_em IS NULL);'
        if ([long]$credenciaisPendentesViva -ne 0) { throw 'Credenciais antigas continuam utilizáveis no clone; não iniciar API auxiliar.' }
        $credenciaisRevogadasViva = $true
    }
    $env:DATABASE_URL = "jdbc:postgresql://$($configuracao.BancoHost):$($configuracao.BancoPorta)/$nomeEnsaio"
    $env:FILES_DIRECTORY = Join-Path $destino 'restauracao-arquivos'; $env:APP_ENV = 'development'
    $jar = Join-Path $raizViva 'backend\demo\target\viva-mais-api-0.1.0-SNAPSHOT.jar'
    $apiAuxiliar = Start-Process -FilePath (Join-Path $env:JAVA_HOME 'bin\java.exe') -ArgumentList @('-Xmx384m','-jar',$jar,'--server.address=127.0.0.1','--server.port=8082') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $destino 'api.log') -RedirectStandardError (Join-Path $destino 'api.erro.log')
    $pronta = $false
    for ($tentativa=0; $tentativa -lt 60; $tentativa++) {
        try { $saude = Invoke-RestMethod 'http://127.0.0.1:8082/actuator/health' -TimeoutSec 2; $pronta = $saude.status -eq 'UP' } catch {}
        if ($pronta) { break }; if ($apiAuxiliar.HasExited) { throw 'API auxiliar encerrou; consulte o log privado.' }; Start-Sleep -Seconds 1
    }
    if (-not $pronta) { throw 'API auxiliar não ficou saudável.' }
    $env:RESTORE_API_BASE_URL='http://127.0.0.1:8082'
    $env:E2E_PASSWORD=(Get-Content (Join-Path $apoioViva 'demo-credentials.json') -Raw | ConvertFrom-Json).password
    $resultadoApi = & node (Join-Path $PSScriptRoot 'verificar-restauracao.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Login, isolamento ou decifração da foto restaurada falhou.' }
    if ($antes -ne (Consultar-EnsaioViva $configuracao.BancoNome $sqlIntegridade)) { throw 'Banco principal sofreu alteração durante o ensaio.' }
    $resumoArquivosDepois = (Get-ChildItem -LiteralPath $origemArquivos -File -Force | Sort-Object Name | Get-FileHash -Algorithm SHA256 | ForEach-Object Hash) -join ','
    if ($resumoArquivosAntes -ne $resumoArquivosDepois) { throw 'Objetos ou chave originais foram alterados durante o ensaio.' }
    $detalhes = $antes | ConvertFrom-Json
    $relatorio = @{ dataUtc=[datetime]::UtcNow.ToString('o'); resultado='APROVADO'; bancoIsolado=$nomeEnsaio; bancoPrincipalPreservado=$true; integridade=$detalhes; cifra=(Get-Content (Join-Path $destino 'integridade.json') -Raw | ConvertFrom-Json); api=($resultadoApi | ConvertFrom-Json); permissoesRestritas=$true; chaveSeparada=$true; objetosEChaveOriginaisPreservados=$true; chaveOriginalSemLeituraPublica=$true }
    $relatorio['credenciaisPacientesRevogadasNoClone'] = $credenciaisRevogadasViva
    $relatorio | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $raizViva $ArquivoEvidencia) -Encoding utf8
    Remove-Item -LiteralPath (Join-Path $destino 'restauracao.dump')
    Write-Output 'APROVADO: backup cifrado, restauração isolada, migrations, contagens, RLS, login, isolamento e foto. Banco principal preservado.'
} finally {
    if ($apiAuxiliar -and -not $apiAuxiliar.HasExited) { $apiAuxiliar.Kill($true); $apiAuxiliar.WaitForExit(10000) | Out-Null }
    $env:PGPASSWORD=$null; $env:DATABASE_PASSWORD=$null; $env:E2E_PASSWORD=$null
}

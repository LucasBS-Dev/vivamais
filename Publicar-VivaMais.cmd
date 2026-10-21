@echo off
setlocal
chcp 65001 >nul
set "VIVA_POWERSHELL=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe"
if exist "%VIVA_POWERSHELL%" goto executar
set "VIVA_POWERSHELL=pwsh.exe"
where pwsh.exe >nul 2>nul
if errorlevel 1 (
  echo PowerShell 7 nao localizado. Instale-o conforme o guia de ambiente.
  exit /b 1
)
:executar
"%VIVA_POWERSHELL%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0infra\publicar-github-revisado.ps1" %*
exit /b %errorlevel%

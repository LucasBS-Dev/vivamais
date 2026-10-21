@echo off
setlocal
chcp 65001 >nul
set "VIVA_POWERSHELL=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe"
if exist "%VIVA_POWERSHELL%" goto executar
set "VIVA_POWERSHELL=pwsh.exe"
where pwsh.exe >nul 2>nul
if errorlevel 1 (
  echo PowerShell 7 nao localizado. Consulte docs\GUIA_COMPLETO_EXECUCAO_LOCAL_WINDOWS.md e use o modo de tres terminais.
  pause
  exit /b 1
)
:executar
"%VIVA_POWERSHELL%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0infra\iniciar-local.ps1" %*
if errorlevel 1 (
  echo A inicializacao terminou com erro. Consulte os logs privados em .local\execucao.
  pause
  exit /b 1
)
endlocal

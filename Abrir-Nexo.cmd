@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Para abrir Nexo necesitas Node.js 24 LTS. Pide a Claude Code que siga CLAUDE.md.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 goto error
)
if not exist dist\index.html (
  call npm run build
  if errorlevel 1 goto error
)
echo Abriendo Nexo. Conserva esta ventana abierta mientras lo uses.
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://127.0.0.1:4317"
call npm start
if errorlevel 1 goto error
exit /b 0
:error
echo Nexo no pudo iniciarse. Comparte este mensaje con Claude Code; no incluyas claves.
pause
exit /b 1

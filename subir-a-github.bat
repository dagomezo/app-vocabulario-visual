@echo off
chcp 65001 >nul
set ROOT=%~dp0
cd /d "%ROOT%"

where git >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] Git no esta instalado.
  echo Instala Git desde https://git-scm.com/download/win
  echo O usa GitHub Desktop: https://desktop.github.com/
  echo.
  pause
  exit /b 1
)

set REPO=https://github.com/dagomezo/app-vocabulario-visual.git

echo === Preparando repositorio en: %ROOT% ===

if not exist ".git" (
  git init
  git branch -M main
)

git remote remove origin 2>nul
git remote add origin %REPO%

echo.
echo === Agregando archivos (sin node_modules ni .env) ===
git add .gitignore README.md contexto.txt modulo-palabras shell
git add -u

echo.
echo === Estado ===
git status

echo.
set /p CONFIRM=¿Crear commit y subir a GitHub? (s/N): 
if /i not "%CONFIRM%"=="s" (
  echo Cancelado. Puedes revisar con: git status
  pause
  exit /b 0
)

git commit -m "Actualizar proyecto: frontend rediseñado, admin responsive y API mejorada"

echo.
echo === Subiendo a origin main ===
git push -u origin main --force

if errorlevel 1 (
  echo.
  echo Si falla el push, inicia sesion en GitHub y ejecuta de nuevo.
  echo Tambien puedes usar: gh auth login
  pause
  exit /b 1
)

echo.
echo Listo. Repositorio actualizado: %REPO%
pause

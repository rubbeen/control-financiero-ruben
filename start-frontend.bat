@echo off
cd /d "%~dp0frontend"
if exist "%~dp0..\work\tools\node\npm.cmd" (
  set "PATH=%~dp0..\work\tools\node;%PATH%"
)
if not exist "node_modules" (
  npm install
)
npm run dev

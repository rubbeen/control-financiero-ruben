@echo off
set "ROOT=%~dp0"
set "TOOLS=%ROOT%..\work\tools"
if exist "%TOOLS%\node\npm.cmd" set "PATH=%TOOLS%\node;%PATH%"
if exist "%TOOLS%\jdk-21\bin\java.exe" (
  set "JAVA_HOME=%TOOLS%\jdk-21"
  set "PATH=%TOOLS%\jdk-21\bin;%PATH%"
)
if exist "%TOOLS%\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat" (
  set "ANDROID_HOME=%TOOLS%\android-sdk"
  set "ANDROID_SDK_ROOT=%TOOLS%\android-sdk"
  set "PATH=%TOOLS%\android-sdk\platform-tools;%PATH%"
)
cd /d "%ROOT%frontend"
npm run build
npx cap sync android
cd /d "%ROOT%frontend\android"
gradlew.bat assembleDebug

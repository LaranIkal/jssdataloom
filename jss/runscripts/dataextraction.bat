@echo off
setlocal

REM Resolve paths relative to this script's location
set "RUNSCRIPT_DIR=%~dp0"
for %%I in ("%RUNSCRIPT_DIR%..") do set "JSS_HOME=%%~fI"

set "WORK_DIR=%JSS_HOME%\scripts\dataextraction"
set "SCRIPT_NAME=dataextraction.jss"

REM Change to the working directory
cd /d "%WORK_DIR%" || exit /b 1

REM Run the JavaScript file using JSS
C:\Apps\graalvmjdk25\bin\java --enable-native-access=ALL-UNNAMED --sun-misc-unsafe-memory-access=allow -cp "%JSS_HOME%\jss-1.2.jar;%JSS_HOME%\jarlib\*" org.jss.jss "%SCRIPT_NAME%" "%JSS_HOME%"

exit /b %ERRORLEVEL%


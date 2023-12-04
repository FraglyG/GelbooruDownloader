@REM Initiation: Make sure nodejs is installed, and npm is in the path, and then npm install and npm build
@ECHO OFF

@REM check if nodejs is installed

title Gelbooru Downloader

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo NodeJS is not installed. Attempting to install.
    call installp.bat
    echo NodeJS installed. Proceeding ...
)

@REM Run npm install and npm build

ECHO Installing Dependencies
call npm install

ECHO --------------------
ECHO Building Files
call npm run build

@REM Set initiated
type nul > initiated
attrib +h initiated

ECHO --------------------
ECHO Setup Complete!
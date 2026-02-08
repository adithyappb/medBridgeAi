@echo off
setlocal EnableDelayedExpansion

echo ========================================================
echo   MEDBRIDGE-AI: SUPABASE ENVIRONMENT RESTORE & SETUP
echo ========================================================
echo.

:: 1. Check for Supabase CLI
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Supabase CLI not found.
    echo     Please install it first: 'npm install -g supabase' or 'scoop install supabase'
    pause
    exit /b 1
)
echo [OK] Supabase CLI found.

:: 2. Login Check (Simple check if logged in, otherwise prompt)
echo.
echo [?] checking login status...
call supabase projects list >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Not logged in. Please log in now.
    call supabase login
) else (
    echo [OK] Already logged in.
)

:: 3. Link Project
echo.
echo [Step 1/3] Linking Project...
set /p PROJECT_REF="Enter your Supabase Project Reference ID (e.g., mxyzptlk...): "
if "%PROJECT_REF%"=="" (
    echo [!] Project ID is required. Exiting.
    exit /b 1
)
call supabase link --project-ref %PROJECT_REF%

:: 4. Set Secrets
echo.
echo [Step 2/3] Configuring Secrets...
echo Enter your API keys (leave blank to skip setting that key)
echo.

set /p OPENAI_KEY="Enter OPENAI_API_KEY: "
if not "%OPENAI_KEY%"=="" (
    call supabase secrets set OPENAI_API_KEY=%OPENAI_KEY%
    echo [OK] OPENAI_API_KEY set.
)

set /p GEMINI_KEY="Enter GEMINI_API_KEY: "
if not "%GEMINI_KEY%"=="" (
    call supabase secrets set GEMINI_API_KEY=%GEMINI_KEY%
    echo [OK] GEMINI_API_KEY set.
)

:: 5. Deploy Functions
echo.
echo [Step 3/3] Deploying 'analyze-facilities' with Core Logic...
call supabase functions deploy analyze-facilities

echo.
echo ========================================================
echo    SETUP COMPLETE! MEDBRIDGE-AI IS READY 🚀
echo ========================================================
echo.
pause

@echo off
title Word Crush Premium Baslatici
color 0B

echo ============================================
echo   Word Crush - API + React Native Baslatici
echo ============================================
echo.

:: ---- BACKEND ----
echo [1/2] C# Backend Oyun Motoru baslatiliyor...
where dotnet >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo HATA: .NET SDK bulunamadi!
    echo Lutfen https://dotnet.microsoft.com/download adresinden indirin.
    pause
    exit /b 1
)

start "C# API - Backend" cmd /k "cd /d "%~dp0Backend" && dotnet run && pause"
echo [OK] Backend penceresi acildi.
echo.

timeout /t 3 /nobreak >nul

:: ---- MOBILE ----
echo [2/2] React Native (Expo) baslatiliyor...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo HATA: Node.js bulunamadi!
    echo Lutfen https://nodejs.org adresinden indirin.
    pause
    exit /b 1
)

start "Expo - React Native" cmd /k "cd /d "%~dp0MobileApp" && npm install --no-audit && npx expo start --clear && pause"

echo [OK] Expo penceresi acildi.
echo.
echo ============================================
echo   OYUN HAZIR!
echo.
echo   Backend (Motor): http://localhost:5000
echo   Swagger (Test) : http://localhost:5000/swagger
echo.
echo   Mobil icin:
echo     1. Telefonunuza "Expo Go" uygulamasini indirin
echo     2. Acilan Expo penceresindeki QR kodu taratin
echo.
echo   NOT: Oyun artik veritabanina ihtiyac duymadan tamamen
echo   kendi lokal hafizasinda (%AsyncStorage%) calismaktadir!
echo ============================================
echo.
pause

@echo off
title Expo SDK 54 Guncelleyici
color 0B

echo ============================================
echo   Expo SDK 54 Dusurme Araci
echo ============================================
echo.
echo Proje son surume (SDK 55) guncellendigi icin telefonunuzdaki
echo Expo Go (SDK 54) ile uyumsuz oldu. Bu islem projeyi tam olarak
echo SDK 54 surumune sabitleyecektir.
echo.

cd /d "%~dp0MobileApp"

echo [1/3] Expo paketleri SDK 54'e ayarlaniyor...
call npm install expo@~54.0.0

echo.
echo [2/3] Uyumsuz paketler (React Native vb.) onariliyor...
call npx expo install --fix

echo.
echo [3/3] Cache temizleniyor...
if exist ".expo" rmdir /s /q ".expo"

echo.
echo ============================================
echo ISLEM TAMAMLANDI!
echo Lutfen simdi tekrar 'start.bat' dosyasini calistirin.
echo ============================================
pause

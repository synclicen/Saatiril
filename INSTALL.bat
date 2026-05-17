@echo off
title Saatiril - Setup

echo.
echo  ========================================
echo   SAATIRIL - Pengaturan Otomatis
echo   Sistem Manajemen Foto Wisuda
echo  ========================================
echo.

echo  [1/6] Memeriksa Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  *** Node.js BELUM TERINSTALL! ***
    echo.
    echo  Silakan install terlebih dahulu:
    echo  1. Buka https://nodejs.org/
    echo  2. Klik tombol hijau "LTS"
    echo  3. Download dan install
    echo  4. Jalankan INSTALL.bat ini lagi
    echo.
    pause
    exit /b 1
)
echo  OK - Node.js terdeteksi

echo.
echo  [2/6] Memeriksa npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo  *** npm tidak ditemukan! Install ulang Node.js ***
    pause
    exit /b 1
)
echo  OK - npm terdeteksi

echo.
echo  [3/6] Memeriksa folder...
if exist "Saatiril\package.json" (
    echo  Masuk ke folder Saatiril...
    cd Saatiril
)
if not exist "package.json" (
    echo.
    echo  *** File package.json tidak ditemukan! ***
    echo  Pastikan INSTALL.bat ada di dalam folder Saatiril.
    echo  Folder saat ini: %cd%
    echo.
    pause
    exit /b 1
)
echo  OK - Folder benar

echo.
echo  [4/6] Menginstall dependencies...
echo  Mohon tunggu 3-10 menit...
echo.
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo  npm install gagal, mencoba ulang...
    call npm cache clean --force
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo  *** Gagal menginstall! Coba jalankan manual: npm install ***
        pause
        exit /b 1
    )
)
echo  OK - Dependencies terinstall

echo.
echo  [5/6] Mengatur database...
call npx prisma generate
call npx prisma db push
echo  OK - Database siap

echo.
echo  [6/6] Mengatur konfigurasi...
if not exist ".env" (
    echo DATABASE_URL="file:./db/saatiril.db" > .env
    echo  OK - File .env dibuat
) else (
    echo  OK - File .env sudah ada
)

echo.
echo  ========================================
echo   SETUP SELESAI!
echo.
echo   Sekarang klik 2x file: START.bat
echo   Browser akan terbuka otomatis.
echo  ========================================
echo.
pause

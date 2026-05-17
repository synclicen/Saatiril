@echo off
title Saatiril - Menjalankan Aplikasi

echo.
echo  ========================================
echo   SAATIRIL - Memulai...
echo   Sistem Manajemen Foto Wisuda
echo  ========================================
echo.

if exist "Saatiril\package.json" (
    cd Saatiril
)

if not exist "package.json" (
    echo  *** Folder Saatiril tidak ditemukan! ***
    echo  Jalankan INSTALL.bat terlebih dahulu.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  Dependencies belum diinstall.
    echo  Menginstall otomatis...
    echo.
    call npm install --legacy-peer-deps
    call npx prisma generate
    call npx prisma db push
    echo.
    echo  Install selesai. Memulai server...
    echo.
)

if not exist "db" mkdir db
if not exist ".env" echo DATABASE_URL="file:./db/saatiril.db" > .env

echo  Memulai server Saatiril...
echo.
echo  ========================================
echo   Saatiril berjalan di:
echo.
echo   http://localhost:3000
echo.
echo   Browser akan terbuka otomatis
echo   dalam 10 detik.
echo.
echo   JANGAN TUTUP jendela ini!
echo   Tekan Ctrl+C untuk menghentikan.
echo  ========================================
echo.

start "" cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3000"

call npx next dev -p 3000

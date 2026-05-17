@echo off
chcp 65001 >nul
title Saatiril - Menjalankan Aplikasi

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║         SAATIRIL - Memulai...            ║
echo  ║   Sistem Manajemen Foto Wisuda           ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Jika belum di folder Saatiril, masuk ke folder tersebut
if exist "Saatiril\package.json" (
    cd Saatiril
)

:: Cek apakah package.json ada
if not exist "package.json" (
    echo  ❌ File package.json tidak ditemukan!
    echo  Pastikan Anda menjalankan script ini di folder Saatiril,
    echo  atau jalankan INSTALL.bat terlebih dahulu.
    echo.
    pause
    exit /b 1
)

:: Cek apakah node_modules ada
if not exist "node_modules" (
    echo  ⚠️ Dependencies belum diinstall. Menginstall...
    call npm install
    echo.
)

echo  🚀 Memulai server Saatiril...
echo.
echo  ┌──────────────────────────────────────────┐
echo  │  Saatiril berjalan di:                   │
echo  │                                          │
echo  │  👉 http://localhost:3000                │
echo  │                                          │
echo  │  Buka URL di atas di browser Anda.       │
echo  │  Tekan Ctrl+C untuk menghentikan.        │
echo  └──────────────────────────────────────────┘
echo.

:: Buka browser otomatis setelah 5 detik
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Jalankan server
call npm run dev

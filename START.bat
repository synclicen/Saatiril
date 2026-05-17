@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Saatiril - Menjalankan Aplikasi

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║          SAATIRIL - Memulai...               ║
echo  ║       Sistem Manajemen Foto Wisuda            ║
echo  ╚══════════════════════════════════════════════╝
echo.

:: ==========================================
:: Cek: sudah install belum?
:: ==========================================

:: Jika ada folder Saatiril di dalam folder ini, masuk ke sana
if exist "Saatiril\package.json" (
    cd Saatiril
)

if not exist "package.json" (
    echo  ❌ Folder Saatiril tidak ditemukan!
    echo.
    echo  Jalankan INSTALL.bat terlebih dahulu.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  ⚠️ Dependencies belum diinstall!
    echo  Menginstall otomatis...
    echo.
    call npm install --legacy-peer-deps
    call npx prisma generate
    call npx prisma db push
    echo.
    echo  ✅ Install selesai! Memulai server...
    echo.
)

:: Pastikan database sudah siap
if not exist "db" (
    mkdir db
)

if not exist ".env" (
    echo DATABASE_URL="file:./db/saatiril.db" > .env
)

:: ==========================================
:: Mulai server
:: ==========================================

echo  🚀 Memulai server Saatiril...
echo.
echo  ┌──────────────────────────────────────────────────┐
echo  │                                                  │
echo  │   Saatiril berjalan di:                          │
echo  │                                                  │
echo  │   👉 http://localhost:3000                       │
echo  │                                                  │
echo  │   Browser akan terbuka otomatis dalam 10 detik   │
echo  │                                                  │
echo  │   JANGAN TUTUP jendela ini selama digunakan!     │
echo  │   Tekan Ctrl+C hanya jika ingin menghentikan.    │
echo  │                                                  │
echo  └──────────────────────────────────────────────────┘
echo.

:: Buka browser otomatis setelah 10 detik
start "" cmd /c "timeout /t 10 /nobreak >nul && start http://localhost:3000"

:: Jalankan server Next.js
call npx next dev -p 3000

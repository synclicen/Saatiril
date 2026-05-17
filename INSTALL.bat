@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Saatiril - Setup Installer

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║       SAATIRIL - Pengaturan Otomatis         ║
echo  ║       Sistem Manajemen Foto Wisuda            ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  Script ini akan menginstall semua yang diperlukan.
echo  Mohon tunggu sampai muncul tulisan "SELESAI".
echo.
echo  ============================================================
echo.

:: ==========================================
:: LANGKAH 1: Cek Node.js
:: ==========================================
echo  [1/6] Memeriksa Node.js...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  ============================================================
    echo  ❌ Node.js BELUM TERINSTALL!
    echo  ============================================================
    echo.
    echo  Saatiril membutuhkan Node.js untuk berjalan.
    echo.
    echo  CARA INSTALL:
    echo  1. Buka browser
    echo  2. Kunjungi: https://nodejs.org/
    echo  3. Klik tombol hijau "LTS" 
    echo  4. Download dan install (klik Next sampai selesai)
    echo  5. Setelah selesai, jalankan INSTALL.bat ini lagi
    echo.
    echo  ============================================================
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  ✅ Node.js terinstall: %NODE_VER%

:: ==========================================
:: LANGKAH 2: Cek npm
:: ==========================================
echo.
echo  [2/6] Memeriksa npm...

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ npm tidak ditemukan! Install ulang Node.js dari https://nodejs.org/
    echo  Pastikan centang "npm" saat install.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('npm --version') do set NPM_VER=%%v
echo  ✅ npm terinstall: %NPM_VER%

:: ==========================================
:: LANGKAH 3: Pastikan di folder yang benar
:: ==========================================
echo.
echo  [3/6] Memeriksa folder...

:: Jika ada folder Saatiril di dalam folder ini, masuk ke sana
if exist "Saatiril\package.json" (
    echo  📁 Ditemukan folder Saatiril, masuk ke dalamnya...
    cd Saatiril
)

:: Cek apakah package.json ada di folder saat ini
if not exist "package.json" (
    echo.
    echo  ❌ File package.json tidak ditemukan!
    echo.
    echo  Pastikan Anda menjalankan INSTALL.bat di dalam folder Saatiril.
    echo.
    echo  Folder saat ini: %cd%
    echo.
    echo  Isi folder saat ini:
    dir /b
    echo.
    pause
    exit /b 1
)

echo  ✅ Folder benar: %cd%

:: ==========================================
:: LANGKAH 4: Install dependencies
:: ==========================================
echo.
echo  [4/6] Menginstall dependencies...
echo  ⏳ Ini memerlukan 3-10 menit, mohon tunggu...
echo.

call npm install --legacy-peer-deps 2>&1

if %errorlevel% neq 0 (
    echo.
    echo  ⚠️ npm install gagal. Mencoba ulang dengan cache bersih...
    call npm cache clean --force 2>nul
    call npm install --legacy-peer-deps 2>&1
    
    if %errorlevel% neq 0 (
        echo.
        echo  ❌ Gagal menginstall dependencies!
        echo  Coba jalankan secara manual: npm install --legacy-peer-deps
        echo.
        pause
        exit /b 1
    )
)

echo  ✅ Dependencies berhasil diinstall!

:: ==========================================
:: LANGKAH 5: Setup database
:: ==========================================
echo.
echo  [5/6] Mengatur database SQLite...

call npx prisma generate 2>&1
if %errorlevel% neq 0 (
    echo  ⚠️ Prisma generate gagal, mencoba ulang...
    call npx prisma generate 2>&1
)

call npx prisma db push 2>&1
if %errorlevel% neq 0 (
    echo  ⚠️ Prisma db push gagal, mencoba ulang...
    call npx prisma db push 2>&1
)

echo  ✅ Database siap!

:: ==========================================
:: LANGKAH 6: Buat file .env jika belum ada
:: ==========================================
echo.
echo  [6/6] Mengatur konfigurasi...

if not exist ".env" (
    echo DATABASE_URL="file:./db/saatiril.db" > .env
    echo  ✅ File .env dibuat
) else (
    echo  ✅ File .env sudah ada
)

:: ==========================================
:: SELESAI!
:: ==========================================
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║               ✅ SETUP SELESAI!              ║
echo  ║                                              ║
echo  ║   Sekarang klik 2x file: START.bat          ║
echo  ║   Browser akan terbuka otomatis.             ║
echo  ║                                              ║
echo  ║   Jika ada masalah, baca PANDUAN.md         ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  Tekan tombol apapun untuk menutup...
pause >nul

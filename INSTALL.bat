@echo off
chcp 65001 >nul
title Saatiril - Setup Installer

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║      SAATIRIL - Pengaturan Otomatis      ║
echo  ║   Sistem Manajemen Foto Wisuda           ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ==========================================
:: LANGKAH 1: Cek apakah Node.js sudah terinstall
:: ==========================================
echo  [1/5] Memeriksa Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  ❌ Node.js belum terinstall!
    echo.
    echo  Node.js diperlukan untuk menjalankan Saatiril.
    echo  Silakan download dan install terlebih dahulu:
    echo.
    echo  👉 https://nodejs.org/
    echo.
    echo  Pilih versi "LTS" (Recommended for Most Users)
    echo  Setelah install, jalankan script ini lagi.
    echo.
    pause
    exit /b 1
)
echo  ✅ Node.js sudah terinstall: 
node --version

:: ==========================================
:: LANGKAH 2: Cek Git
:: ==========================================
echo.
echo  [2/5] Memeriksa Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ Git belum terinstall!
    echo  Download di: https://git-scm.com/download/win
    echo  Setelah install, jalankan script ini lagi.
    echo.
    pause
    exit /b 1
)
echo  ✅ Git sudah terinstall:
git --version

:: ==========================================
:: LANGKAH 3: Clone repositori
:: ==========================================
echo.
echo  [3/5] Mengunduh kode Saatiril dari GitHub...
echo.

if exist "Saatiril" (
    echo  📁 Folder Saatiril sudah ada. Mengupdate...
    cd Saatiril
    git pull origin main
) else (
    git clone https://github.com/synclicen/Saatiril.git
    cd Saatiril
)
echo  ✅ Kode berhasil diunduh!

:: ==========================================
:: LANGKAH 4: Install dependencies
:: ==========================================
echo.
echo  [4/5] Menginstall dependencies (ini mungkin memakan waktu 2-5 menit)...
echo.

:: Cek apakah npm tersedia
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo  Menggunakan npm...
    call npm install
) else (
    echo  npm tidak ditemukan. Mencoba menggunakan bun...
    where bun >nul 2>nul
    if %errorlevel% equ 0 (
        bun install
    ) else (
        echo  ❌ Tidak ada package manager! Pastikan Node.js terinstall dengan benar.
        pause
        exit /b 1
    )
)
echo  ✅ Dependencies berhasil diinstall!

:: ==========================================
:: LANGKAH 5: Setup database
:: ==========================================
echo.
echo  [5/5] Mengatur database SQLite...
echo.

if exist "node_modules\.bin\prisma" (
    call npx prisma db push
    call npx prisma generate
) else (
    echo  ⚠️ Prisma tidak ditemukan, akan diatur saat pertama kali menjalankan.
)
echo  ✅ Database siap!

:: ==========================================
:: SELESAI!
:: ==========================================
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║          ✅ SETUP SELESAI!               ║
echo  ║                                          ║
echo  ║   Untuk menjalankan Saatiril:            ║
echo  ║   Klik dua kali file: START.bat          ║
echo  ║                                          ║
echo  ║   Atau jalankan perintah:                ║
echo  ║   cd Saatiril                            ║
echo  ║   npm run dev                            ║
echo  ║   Lalu buka: http://localhost:3000       ║
echo  ╚══════════════════════════════════════════╝
echo.
pause

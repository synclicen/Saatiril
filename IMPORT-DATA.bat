@echo off
chcp 65001 >nul
title Saatiril - Import Data Mahasiswa

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║    SAATIRIL - Import Data Mahasiswa       ║
echo  ╚══════════════════════════════════════════╝
echo.

if exist "Saatiril\package.json" (
    cd Saatiril
)

if not exist "package.json" (
    echo  ❌ Folder Saatiril tidak ditemukan!
    echo  Jalankan INSTALL.bat terlebih dahulu.
    pause
    exit /b 1
)

echo  Pastikan server Saatiril sudah berjalan (START.bat)
echo  sebelum melakukan import data.
echo.
echo  Format CSV:
echo  nim,nama,fakultas,prodi,sesi,nomorUrut
echo  2101001,Ahmad Fauzi,Teknik,Informatika,A,1
echo.
echo  Format JSON:
echo  [{"nim":"2101001","nama":"Ahmad Fauzi",...}]
echo.
echo  Anda bisa import data melalui aplikasi di browser:
echo  👉 http://localhost:3000
echo  👉 Tab "Mahasiswa" → Tombol "Import"
echo.
echo  Atau gunakan API langsung:
echo  curl -X POST http://localhost:3000/api/mahasiswa/import ^
echo    -H "Content-Type: application/json" ^
echo    -d "{\"data\": \"nim,nama,fakultas,prodi,sesi,nomorUrut\\n2101001,Ahmad Fauzi,Teknik,Informatika,A,1\", \"format\": \"csv\"}"
echo.
pause

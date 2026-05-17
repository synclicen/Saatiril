@echo off
title Saatiril - Import Data

echo.
echo  ========================================
echo   SAATIRIL - Import Data Mahasiswa
echo  ========================================
echo.

if exist "Saatiril\package.json" cd Saatiril

if not exist "package.json" (
    echo  Folder Saatiril tidak ditemukan!
    echo  Jalankan INSTALL.bat terlebih dahulu.
    pause
    exit /b 1
)

echo  Pastikan server sudah berjalan (START.bat)
echo  sebelum melakukan import data.
echo.
echo  Format CSV:
echo  nim,nama,fakultas,prodi,sesi,nomorUrut
echo  2101001,Ahmad Fauzi,Teknik,Informatika,A,1
echo.
echo  Format JSON:
echo  [{"nim":"2101001","nama":"Ahmad Fauzi",...}]
echo.
echo  Import data melalui aplikasi di browser:
echo  http://localhost:3000
echo  Tab "Mahasiswa" - Tombol "Import"
echo.
pause

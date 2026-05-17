# 🎓 Saatiril - Sistem Manajemen Foto Wisuda

Aplikasi desktop untuk mengelola pemanggilan dan foto prosesi wisuda.
**100% Offline** — Tidak memerlukan koneksi internet.

---

## 🚀 Cara Install (Super Mudah - Hanya 3 Langkah!)

### Langkah 1: Install Node.js

Jika Anda belum punya Node.js, download dan install dulu:

👉 **Download di: https://nodejs.org/**

1. Buka website tersebut
2. Klik tombol hijau **"LTS"** (Recommended for Most Users)
3. Setelah download selesai, **klik 2x file yang didownload**
4. Klik **Next → Next → Next → Install** (biarkan semua default)
5. Tunggu sampai selesai

### Langkah 2: Install Saatiril

1. Download kode Saatiril:
   - Buka: **https://github.com/synclicen/Saatiril**
   - Klik tombol hijau **"Code"**
   - Pilih **"Download ZIP"**
   - Ekstrak file ZIP ke folder yang Anda inginkan

2. ATAU jika Anda punya Git, **klik 2x file `INSTALL.bat`**

### Langkah 3: Jalankan Saatiril

**Klik 2x file `START.bat`** — Browser akan terbuka otomatis!

Itu saja! 🎉

---

## 📖 Penjelasan Detail

### Apa itu Node.js?
Node.js adalah program yang diperlukan untuk menjalankan Saatiril. 
Anggap saja seperti "mesin" yang membuat aplikasi ini bisa berjalan.

### Apa itu localhost:3000?
Itu adalah alamat aplikasi di komputer Anda sendiri.
Tidak memerlukan internet — semua berjalan di komputer lokal.

### File-file Penting

| File | Fungsi |
|------|--------|
| `INSTALL.bat` | Setup awal (install dependencies) — **Jalankan sekali saja** |
| `START.bat` | Menjalankan aplikasi — **Klik setiap kali mau pakai** |
| `IMPORT-DATA.bat` | Petunjuk import data mahasiswa |

---

## 🎯 Cara Pakai di Hari Prosesi

### 1. Persiapan (Sehari sebelum)
1. Klik `START.bat`
2. Buka browser → Tab **Mahasiswa** → Import data CSV
3. Buka Tab **Pengaturan** → Buat Sesi (A/B)
4. Buka Tab **Pengaturan** → Pilih folder penyimpanan foto

### 2. Di Hari Prosesi
Buka browser di beberapa tab:

| Tab | Tujuan | URL |
|-----|--------|-----|
| Tab 1 | MC (pemanggil) | `http://localhost:3000` → Panel MC |
| Tab 2 | Operator Kamera | `http://localhost:3000` → Panel Kamera |
| Tab 3 | Galeri (proyektor) | `http://localhost:3000?gallery=true` |

### 3. Alur Kerja
```
MC memanggil mahasiswa
    ↓
Operator Kamera mengambil Foto 1 & Foto 2
    ↓
Foto tersimpan otomatis di folder lokal
    ↓
Galeri menampilkan foto secara real-time
```

---

## ❓ Pertanyaan Umum

**Q: Apakah butuh internet?**
Tidak! Semua berjalan offline di komputer Anda.

**Q: Bisa pakai komputer lain?**
Ya, asalkan di jaringan yang sama. Ganti `localhost` dengan IP komputer server.

**Q: Foto disimpan dimana?**
Di folder yang Anda pilih di Pengaturan. Default: `Documents\Saatiril-Photos\`

**Q: Bagaimana jika komputer mati?**
Data tersimpan di database SQLite. Tidak hilang meskipun komputer restart.

---

## 🔧 Jika Ada Masalah

### "Node.js tidak ditemukan"
→ Install Node.js dari https://nodejs.org/ (pilih versi LTS)

### "Port 3000 sudah digunakan"
→ Tutup aplikasi lain yang menggunakan port 3000, atau restart komputer

### "Halaman tidak bisa dibuka"
→ Pastikan `START.bat` masih berjalan (jangan ditutup jendelanya)

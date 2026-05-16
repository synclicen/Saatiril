import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/mahasiswa/import - Import mahasiswa from CSV/JSON array
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, format } = body as { data: string; format: 'csv' | 'json' };

    if (!data) {
      return NextResponse.json(
        { error: 'Data tidak boleh kosong' },
        { status: 400 }
      );
    }

    let records: Array<Record<string, string>> = [];

    if (format === 'json') {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      records = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      // CSV parsing
      const lines = data.trim().split('\n');
      if (lines.length < 2) {
        return NextResponse.json(
          { error: 'CSV harus memiliki header dan minimal 1 baris data' },
          { status: 400 }
        );
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        if (values.length === headers.length) {
          const record: Record<string, string> = {};
          headers.forEach((header, idx) => {
            record[header] = values[idx];
          });
          records.push(record);
        }
      }
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang valid untuk diimport' },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const record of records) {
      try {
        const nim = record.nim || record.NIM || '';
        const nama = record.nama || record.NAMA || record.name || '';
        const fakultas = record.fakultas || record.FAKULTAS || record.fak || '';
        const prodi = record.prodi || record.PRODI || record.program_studi || '';
        const sesi = record.sesi || record.SESI || record.session || '';
        const nomorUrut = record.nomorurut || record.nomor_urut || record.NOMORURUT || record.no || '';

        if (!nim || !nama) {
          skipped++;
          continue;
        }

        const existing = await db.mahasiswa.findUnique({ where: { nim } });
        if (existing) {
          // Update existing
          await db.mahasiswa.update({
            where: { nim },
            data: {
              nama,
              fakultas: fakultas || null,
              prodi: prodi || null,
              sesi: sesi || null,
              nomorUrut: nomorUrut ? parseInt(nomorUrut) : null,
            },
          });
          imported++;
        } else {
          await db.mahasiswa.create({
            data: {
              nim,
              nama,
              fakultas: fakultas || null,
              prodi: prodi || null,
              sesi: sesi || null,
              nomorUrut: nomorUrut ? parseInt(nomorUrut) : null,
            },
          });
          imported++;
        }
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      message: `Import selesai: ${imported} berhasil, ${skipped} dilewati, ${errors} gagal`,
      imported,
      skipped,
      errors,
    });
  } catch (error) {
    console.error('Error importing mahasiswa:', error);
    return NextResponse.json(
      { error: 'Gagal mengimport data mahasiswa' },
      { status: 500 }
    );
  }
}

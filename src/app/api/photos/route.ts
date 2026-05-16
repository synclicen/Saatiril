import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/photos - Save a photo for a student
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mahasiswaId = formData.get('mahasiswaId') as string;
    const tipe = formData.get('tipe') as string; // 'raw1', 'raw2', 'framed'
    const file = formData.get('file') as File | null;
    const localPath = formData.get('localPath') as string | null;

    if (!mahasiswaId || !tipe) {
      return NextResponse.json(
        { error: 'mahasiswaId dan tipe wajib diisi' },
        { status: 400 }
      );
    }

    const validTypes = ['raw1', 'raw2', 'framed'];
    if (!validTypes.includes(tipe)) {
      return NextResponse.json(
        { error: `Tipe tidak valid. Harus salah satu: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const mahasiswa = await db.mahasiswa.findUnique({
      where: { id: mahasiswaId },
    });
    if (!mahasiswa) {
      return NextResponse.json(
        { error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      );
    }

    let savedPath = '';

    if (file) {
      // Save the file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const folderPath = localPath || path.join(process.cwd(), 'photos');
      const nimFolder = path.join(folderPath, mahasiswa.nim);

      // Create directory if it doesn't exist
      await mkdir(nimFolder, { recursive: true });

      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${mahasiswa.nim}_${tipe}.${ext}`;
      const filePath = path.join(nimFolder, fileName);

      await writeFile(filePath, buffer);
      savedPath = filePath;
    } else if (localPath) {
      savedPath = localPath;
    }

    // Update mahasiswa record
    const updateField = `foto${tipe.charAt(0).toUpperCase() + tipe.slice(1)}` as
      | 'fotoRaw1' | 'fotoRaw2' | 'fotoFramed';

    const updated = await db.mahasiswa.update({
      where: { id: mahasiswaId },
      data: {
        [updateField]: savedPath,
        ...(tipe === 'raw2' ? { status: 'prosesi' } : {}),
        fotoDiambilPada: new Date(),
      },
    });

    // Log the photo operation
    await db.photoLog.create({
      data: {
        mahasiswaId,
        tipe,
        sumber: 'local',
        path: savedPath,
        status: 'success',
      },
    });

    return NextResponse.json({ data: updated, path: savedPath });
  } catch (error) {
    console.error('Error saving photo:', error);

    // Try to log the error
    try {
      const formData = await request.formData();
      const mahasiswaId = formData.get('mahasiswaId') as string;
      const tipe = formData.get('tipe') as string;

      if (mahasiswaId && tipe) {
        await db.photoLog.create({
          data: {
            mahasiswaId,
            tipe,
            sumber: 'local',
            status: 'failed',
            pesan: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json(
      { error: 'Gagal menyimpan foto' },
      { status: 500 }
    );
  }
}

// GET /api/photos - List photos for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mahasiswaId = searchParams.get('mahasiswaId');

    if (!mahasiswaId) {
      return NextResponse.json(
        { error: 'mahasiswaId wajib diisi' },
        { status: 400 }
      );
    }

    const mahasiswa = await db.mahasiswa.findUnique({
      where: { id: mahasiswaId },
      select: {
        id: true,
        nim: true,
        nama: true,
        fotoRaw1: true,
        fotoRaw2: true,
        fotoFramed: true,
      },
    });

    if (!mahasiswa) {
      return NextResponse.json(
        { error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      );
    }

    const photos = [
      { tipe: 'raw1', path: mahasiswa.fotoRaw1 },
      { tipe: 'raw2', path: mahasiswa.fotoRaw2 },
      { tipe: 'framed', path: mahasiswa.fotoFramed },
    ].filter((p) => p.path !== null);

    return NextResponse.json({
      data: {
        mahasiswa: {
          id: mahasiswa.id,
          nim: mahasiswa.nim,
          nama: mahasiswa.nama,
        },
        photos,
      },
    });
  } catch (error) {
    console.error('Error listing photos:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data foto' },
      { status: 500 }
    );
  }
}

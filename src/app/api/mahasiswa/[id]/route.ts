import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/mahasiswa/[id] - Get a single mahasiswa
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mahasiswa = await db.mahasiswa.findUnique({ where: { id } });

    if (!mahasiswa) {
      return NextResponse.json(
        { error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: mahasiswa });
  } catch (error) {
    console.error('Error fetching mahasiswa:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data mahasiswa' },
      { status: 500 }
    );
  }
}

// PUT /api/mahasiswa/[id] - Update a mahasiswa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.mahasiswa.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      );
    }

    const mahasiswa = await db.mahasiswa.update({
      where: { id },
      data: {
        ...(body.nim !== undefined && { nim: body.nim }),
        ...(body.nama !== undefined && { nama: body.nama }),
        ...(body.fakultas !== undefined && { fakultas: body.fakultas || null }),
        ...(body.prodi !== undefined && { prodi: body.prodi || null }),
        ...(body.sesi !== undefined && { sesi: body.sesi || null }),
        ...(body.nomorUrut !== undefined && {
          nomorUrut: body.nomorUrut ? parseInt(String(body.nomorUrut)) : null,
        }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.fotoRaw1 !== undefined && { fotoRaw1: body.fotoRaw1 || null }),
        ...(body.fotoRaw2 !== undefined && { fotoRaw2: body.fotoRaw2 || null }),
        ...(body.fotoFramed !== undefined && {
          fotoFramed: body.fotoFramed || null,
        }),
        ...(body.gdriveFolderId !== undefined && {
          gdriveFolderId: body.gdriveFolderId || null,
        }),
        ...(body.gdriveRaw1Id !== undefined && {
          gdriveRaw1Id: body.gdriveRaw1Id || null,
        }),
        ...(body.gdriveRaw2Id !== undefined && {
          gdriveRaw2Id: body.gdriveRaw2Id || null,
        }),
        ...(body.gdriveFramedId !== undefined && {
          gdriveFramedId: body.gdriveFramedId || null,
        }),
        ...(body.dipanggilPada !== undefined && {
          dipanggilPada: body.dipanggilPada ? new Date(body.dipanggilPada) : null,
        }),
        ...(body.fotoDiambilPada !== undefined && {
          fotoDiambilPada: body.fotoDiambilPada
            ? new Date(body.fotoDiambilPada)
            : null,
        }),
      },
    });

    return NextResponse.json({ data: mahasiswa });
  } catch (error) {
    console.error('Error updating mahasiswa:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate data mahasiswa' },
      { status: 500 }
    );
  }
}

// DELETE /api/mahasiswa/[id] - Delete a mahasiswa
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.mahasiswa.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Mahasiswa tidak ditemukan' },
        { status: 404 }
      );
    }

    await db.mahasiswa.delete({ where: { id } });

    return NextResponse.json({ message: 'Mahasiswa berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting mahasiswa:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus data mahasiswa' },
      { status: 500 }
    );
  }
}

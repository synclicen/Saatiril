import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sesi/aktif - Get the active session
export async function GET() {
  try {
    const sesi = await db.sesiProsesi.findFirst({
      where: { aktif: true },
    });

    return NextResponse.json({ data: sesi });
  } catch (error) {
    console.error('Error fetching active sesi:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil sesi aktif' },
      { status: 500 }
    );
  }
}

// PUT /api/sesi/aktif - Set the active session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sesiId } = body;

    if (!sesiId) {
      return NextResponse.json(
        { error: 'Sesi ID wajib diisi' },
        { status: 400 }
      );
    }

    const sesi = await db.sesiProsesi.findUnique({ where: { id: sesiId } });
    if (!sesi) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Deactivate all sessions first
    await db.sesiProsesi.updateMany({
      where: { aktif: true },
      data: { aktif: false, mahasiswaId: null },
    });

    // Activate the selected session
    const updated = await db.sesiProsesi.update({
      where: { id: sesiId },
      data: { aktif: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error setting active sesi:', error);
    return NextResponse.json(
      { error: 'Gagal mengatur sesi aktif' },
      { status: 500 }
    );
  }
}

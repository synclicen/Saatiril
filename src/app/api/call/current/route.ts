import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/call/current - Get the currently called student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sesi = searchParams.get('sesi');

    const where: Record<string, unknown> = { status: 'dipanggil' };
    if (sesi) where.sesi = sesi;

    const current = await db.mahasiswa.findFirst({
      where,
      orderBy: { dipanggilPada: 'desc' },
    });

    return NextResponse.json({ data: current });
  } catch (error) {
    console.error('Error fetching current call:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pemanggilan saat ini' },
      { status: 500 }
    );
  }
}

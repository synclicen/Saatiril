import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sesi - List all sesi
export async function GET() {
  try {
    const sesi = await db.sesiProsesi.findMany({
      orderBy: { nama: 'asc' },
    });
    return NextResponse.json({ data: sesi });
  } catch (error) {
    console.error('Error fetching sesi:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data sesi' },
      { status: 500 }
    );
  }
}

// POST /api/sesi - Create a new sesi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, aktif } = body;

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama sesi wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await db.sesiProsesi.findUnique({ where: { nama } });
    if (existing) {
      return NextResponse.json(
        { error: `Sesi dengan nama "${nama}" sudah ada` },
        { status: 409 }
      );
    }

    const sesi = await db.sesiProsesi.create({
      data: {
        nama,
        aktif: aktif ?? false,
      },
    });

    return NextResponse.json({ data: sesi }, { status: 201 });
  } catch (error) {
    console.error('Error creating sesi:', error);
    return NextResponse.json(
      { error: 'Gagal membuat sesi' },
      { status: 500 }
    );
  }
}

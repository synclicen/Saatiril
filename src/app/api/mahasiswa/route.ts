import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/mahasiswa - List all mahasiswa with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sesi = searchParams.get('sesi');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (sesi) where.sesi = sesi;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nim: { contains: search } },
        { fakultas: { contains: search } },
        { prodi: { contains: search } },
      ];
    }

    const [mahasiswa, total] = await Promise.all([
      db.mahasiswa.findMany({
        where,
        orderBy: [{ sesi: 'asc' }, { nomorUrut: 'asc' }, { nama: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.mahasiswa.count({ where }),
    ]);

    return NextResponse.json({
      data: mahasiswa,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching mahasiswa:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data mahasiswa' },
      { status: 500 }
    );
  }
}

// POST /api/mahasiswa - Create a single mahasiswa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nim, nama, fakultas, prodi, sesi, nomorUrut } = body;

    if (!nim || !nama) {
      return NextResponse.json(
        { error: 'NIM dan Nama wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await db.mahasiswa.findUnique({ where: { nim } });
    if (existing) {
      return NextResponse.json(
        { error: `Mahasiswa dengan NIM ${nim} sudah ada` },
        { status: 409 }
      );
    }

    const mahasiswa = await db.mahasiswa.create({
      data: {
        nim,
        nama,
        fakultas: fakultas || null,
        prodi: prodi || null,
        sesi: sesi || null,
        nomorUrut: nomorUrut ? parseInt(String(nomorUrut)) : null,
      },
    });

    return NextResponse.json({ data: mahasiswa }, { status: 201 });
  } catch (error) {
    console.error('Error creating mahasiswa:', error);
    return NextResponse.json(
      { error: 'Gagal membuat data mahasiswa' },
      { status: 500 }
    );
  }
}

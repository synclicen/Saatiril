import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/call - Call next student or update status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, mahasiswaId, sesi } = body;

    if (action === 'next') {
      // Call the next student in queue
      const where: Record<string, unknown> = {
        status: 'menunggu',
      };
      if (sesi) where.sesi = sesi;

      // Mark the current "dipanggil" student as "prosesi" if any
      await db.mahasiswa.updateMany({
        where: { status: 'dipanggil', ...(sesi ? { sesi } : {}) },
        data: { status: 'prosesi' },
      });

      const nextMahasiswa = await db.mahasiswa.findFirst({
        where,
        orderBy: [{ nomorUrut: 'asc' }, { nama: 'asc' }],
      });

      if (!nextMahasiswa) {
        return NextResponse.json(
          { error: 'Tidak ada mahasiswa yang menunggu lagi' },
          { status: 404 }
        );
      }

      const updated = await db.mahasiswa.update({
        where: { id: nextMahasiswa.id },
        data: {
          status: 'dipanggil',
          dipanggilPada: new Date(),
        },
      });

      // Update the active session with current student
      await db.sesiProsesi.updateMany({
        where: { aktif: true },
        data: { mahasiswaId: nextMahasiswa.id },
      });

      return NextResponse.json({ data: updated });
    }

    if (action === 'update-status' && mahasiswaId) {
      const { status } = body;
      const validStatuses = ['menunggu', 'dipanggil', 'prosesi', 'selesai'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Status tidak valid. Harus salah satu: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      const existing = await db.mahasiswa.findUnique({
        where: { id: mahasiswaId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: 'Mahasiswa tidak ditemukan' },
          { status: 404 }
        );
      }

      const updateData: Record<string, unknown> = { status };
      if (status === 'dipanggil') updateData.dipanggilPada = new Date();
      if (status === 'selesai') updateData.fotoDiambilPada = new Date();

      const updated = await db.mahasiswa.update({
        where: { id: mahasiswaId },
        data: updateData,
      });

      return NextResponse.json({ data: updated });
    }

    if (action === 'skip' && mahasiswaId) {
      // Skip a student - move them back to end of queue or mark as skipped
      const existing = await db.mahasiswa.findUnique({
        where: { id: mahasiswaId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: 'Mahasiswa tidak ditemukan' },
          { status: 404 }
        );
      }

      const updated = await db.mahasiswa.update({
        where: { id: mahasiswaId },
        data: { status: 'menunggu' },
      });

      return NextResponse.json({ data: updated });
    }

    return NextResponse.json(
      { error: 'Aksi tidak valid' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in call action:', error);
    return NextResponse.json(
      { error: 'Gagal memproses pemanggilan' },
      { status: 500 }
    );
  }
}

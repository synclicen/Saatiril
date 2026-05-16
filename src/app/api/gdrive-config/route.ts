import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/gdrive-config - Get Google Drive configuration
export async function GET() {
  try {
    const config = await db.gDriveConfig.findFirst({
      where: { aktif: true },
    });

    if (!config) {
      return NextResponse.json({ data: null });
    }

    // Don't expose the full service account JSON
    return NextResponse.json({
      data: {
        id: config.id,
        nama: config.nama,
        rootFolderId: config.rootFolderId,
        aktif: config.aktif,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
        configured: true,
      },
    });
  } catch (error) {
    console.error('Error fetching GDrive config:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil konfigurasi Google Drive' },
      { status: 500 }
    );
  }
}

// POST /api/gdrive-config - Save Google Drive configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, serviceAccountJson, rootFolderId } = body;

    if (!serviceAccountJson || !rootFolderId) {
      return NextResponse.json(
        { error: 'Service Account JSON dan Root Folder ID wajib diisi' },
        { status: 400 }
      );
    }

    const configName = nama || 'default';

    // Deactivate existing configs
    await db.gDriveConfig.updateMany({
      where: { aktif: true },
      data: { aktif: false },
    });

    // Upsert the config
    const config = await db.gDriveConfig.upsert({
      where: { nama: configName },
      update: {
        serviceAccountJson,
        rootFolderId,
        aktif: true,
      },
      create: {
        nama: configName,
        serviceAccountJson,
        rootFolderId,
        aktif: true,
      },
    });

    return NextResponse.json({
      data: {
        id: config.id,
        nama: config.nama,
        rootFolderId: config.rootFolderId,
        aktif: config.aktif,
        configured: true,
      },
    });
  } catch (error) {
    console.error('Error saving GDrive config:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan konfigurasi Google Drive' },
      { status: 500 }
    );
  }
}

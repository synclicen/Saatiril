'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type Mahasiswa, type CameraStatus } from '@/lib/store';
import { useElectron } from '@/hooks/use-electron';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Camera,
  CameraOff,
  FolderOpen,
  Upload,
  CheckCircle2,
  AlertCircle,
  User,
  Image as ImageIcon,
  RefreshCw,
  HardDrive,
  Cloud,
  Circle,
} from 'lucide-react';

export default function CameraPanel() {
  const {
    currentMahasiswa,
    setCurrentMahasiswa,
    cameraStatus,
    setCameraStatus,
    localFolderPath,
    setLocalFolderPath,
    gdriveConfigured,
  } = useAppStore();
  const { isElectron, selectFolder, defaultStoragePath } = useElectron();
  const [photo1Saved, setPhoto1Saved] = useState(false);
  const [photo2Saved, setPhoto2Saved] = useState(false);
  const [saving1, setSaving1] = useState(false);
  const [saving2, setSaving2] = useState(false);

  // Fetch current student
  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch('/api/call/current');
      if (res.ok) {
        const json = await res.json();
        setCurrentMahasiswa(json.data);
      }
    } catch (error) {
      console.error('Error fetching current:', error);
    }
  }, [setCurrentMahasiswa]);

  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 3000);
    return () => clearInterval(interval);
  }, [fetchCurrent]);

  // Reset photo states when student changes
  useEffect(() => {
    setPhoto1Saved(!!currentMahasiswa?.fotoRaw1);
    setPhoto2Saved(!!currentMahasiswa?.fotoRaw2);
  }, [currentMahasiswa?.id, currentMahasiswa?.fotoRaw1, currentMahasiswa?.fotoRaw2]);

  // Set default storage path
  useEffect(() => {
    if (isElectron && defaultStoragePath && !localFolderPath) {
      setLocalFolderPath(defaultStoragePath);
    }
  }, [isElectron, defaultStoragePath, localFolderPath, setLocalFolderPath]);

  const handleSelectFolder = async () => {
    if (isElectron) {
      const folder = await selectFolder();
      if (folder) {
        setLocalFolderPath(folder);
      }
    } else {
      // In web mode, just use a default path
      setLocalFolderPath('./photos');
    }
  };

  const handleConnectCamera = () => {
    setCameraStatus('connecting');
    // Simulate camera connection
    setTimeout(() => {
      setCameraStatus('connected');
    }, 1500);
  };

  const handleDisconnectCamera = () => {
    setCameraStatus('disconnected');
  };

  const simulateCapture = async (tipe: 'raw1' | 'raw2') => {
    if (!currentMahasiswa) return;

    const setSaving = tipe === 'raw1' ? setSaving1 : setSaving2;
    const setSaved = tipe === 'raw1' ? setPhoto1Saved : setPhoto2Saved;

    setSaving(true);
    try {
      // Create a simulated photo (small placeholder image)
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Create a placeholder image
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 640, 480);

        // Draw a graduation cap icon area
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Foto ${tipe === 'raw1' ? '1' : '2'}`, 320, 200);
        ctx.font = '16px sans-serif';
        ctx.fillText(currentMahasiswa.nama, 320, 240);
        ctx.font = '14px monospace';
        ctx.fillText(currentMahasiswa.nim, 320, 265);
        ctx.font = '12px sans-serif';
        ctx.fillText(new Date().toLocaleString('id-ID'), 320, 300);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85);
      });

      const formData = new FormData();
      formData.append('mahasiswaId', currentMahasiswa.id);
      formData.append('tipe', tipe);
      formData.append('file', blob, `${currentMahasiswa.nim}_${tipe}.jpg`);
      if (localFolderPath) {
        formData.append('localPath', localFolderPath);
      }

      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSaved(true);
        // Refresh current student data
        fetchCurrent();
      } else {
        const json = await res.json();
        alert(json.error || 'Gagal menyimpan foto');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('Gagal menyimpan foto');
    } finally {
      setSaving(false);
    }
  };

  const cameraStatusDisplay: Record<CameraStatus, { label: string; color: string; icon: React.ReactNode }> = {
    disconnected: {
      label: 'Tidak Terhubung',
      color: 'text-red-500',
      icon: <CameraOff className="h-4 w-4" />,
    },
    connecting: {
      label: 'Menghubungkan...',
      color: 'text-amber-500',
      icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    },
    connected: {
      label: 'Terhubung',
      color: 'text-green-500',
      icon: <Camera className="h-4 w-4" />,
    },
    error: {
      label: 'Error',
      color: 'text-red-500',
      icon: <AlertCircle className="h-4 w-4" />,
    },
  };

  const camStatus = cameraStatusDisplay[cameraStatus];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold">Panel Kamera</h2>
        </div>
        <Button variant="outline" size="icon" onClick={fetchCurrent}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-3 gap-3">
        {/* Camera Status */}
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <span className={camStatus.color}>{camStatus.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground">Kamera</p>
              <p className={`text-sm font-medium ${camStatus.color}`}>
                {camStatus.label}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Folder Status */}
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Folder Lokal</p>
              <p className="text-sm font-medium truncate">
                {localFolderPath || 'Belum dipilih'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* GDrive Status */}
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Cloud className={`h-4 w-4 ${gdriveConfigured ? 'text-green-600' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-xs text-muted-foreground">Google Drive</p>
              <p className={`text-sm font-medium ${gdriveConfigured ? 'text-green-600' : 'text-muted-foreground'}`}>
                {gdriveConfigured ? 'Terkonfigurasi' : 'Belum'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left - Student Info */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Mahasiswa Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentMahasiswa ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nama</p>
                  <p className="text-lg font-bold">{currentMahasiswa.nama}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">NIM</p>
                  <p className="text-base font-mono text-emerald-600">{currentMahasiswa.nim}</p>
                </div>
                {currentMahasiswa.fakultas && (
                  <div>
                    <p className="text-xs text-muted-foreground">Fakultas</p>
                    <p className="text-sm">{currentMahasiswa.fakultas}</p>
                  </div>
                )}
                {currentMahasiswa.prodi && (
                  <div>
                    <p className="text-xs text-muted-foreground">Prodi</p>
                    <p className="text-sm">{currentMahasiswa.prodi}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="secondary" className="mt-1">
                    {currentMahasiswa.status === 'dipanggil'
                      ? 'Dipanggil'
                      : currentMahasiswa.status === 'prosesi'
                      ? 'Prosesi'
                      : currentMahasiswa.status}
                  </Badge>
                </div>

                <Separator />

                {/* Photo status */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Status Foto</p>
                  <div className="flex items-center gap-2">
                    {photo1Saved ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Foto 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {photo2Saved ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Foto 2</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Tidak ada mahasiswa dipanggil</p>
                <p className="text-xs">Tunggu MC memanggil mahasiswa</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Center - Camera Preview */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 h-full flex flex-col">
            {/* Camera Preview Area */}
            <div className="flex-1 bg-slate-900 dark:bg-slate-950 rounded-lg flex items-center justify-center relative overflow-hidden min-h-[300px]">
              {cameraStatus === 'connected' ? (
                <div className="text-center text-white space-y-4">
                  {/* Simulated camera preview */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-3 text-emerald-400" />
                      <p className="text-lg font-medium text-white">Kamera Aktif</p>
                      <p className="text-sm text-slate-400">
                        {currentMahasiswa
                          ? `Siap mengambil foto: ${currentMahasiswa.nama}`
                          : 'Menunggu mahasiswa dipanggil...'}
                      </p>
                      {/* Live indicator */}
                      <div className="flex items-center gap-1.5 justify-center mt-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-red-400">LIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <CameraOff className="h-16 w-16 mx-auto text-slate-600" />
                  <div>
                    <p className="text-slate-400 text-lg">Kamera Tidak Terhubung</p>
                    <p className="text-slate-500 text-sm">
                      Hubungkan kamera untuk mulai mengambil foto
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Capture Buttons */}
            <div className="mt-4 space-y-3">
              {/* Folder selection */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleSelectFolder}
                >
                  <FolderOpen className="h-4 w-4" />
                  {localFolderPath ? 'Ganti Folder' : 'Pilih Folder'}
                </Button>
                {localFolderPath && (
                  <span className="text-xs text-muted-foreground truncate">
                    {localFolderPath}
                  </span>
                )}
              </div>

              {/* Camera connect & capture */}
              <div className="flex items-center gap-3">
                {cameraStatus !== 'connected' ? (
                  <Button
                    className="flex-1 gap-2 h-14 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleConnectCamera}
                    disabled={cameraStatus === 'connecting'}
                  >
                    <Camera className="h-5 w-5" />
                    Hubungkan Kamera
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleDisconnectCamera}
                    >
                      <CameraOff className="h-4 w-4" />
                      Putuskan
                    </Button>
                    <Button
                      className="flex-1 gap-2 h-14 text-lg font-bold"
                      disabled={!currentMahasiswa || saving1 || photo1Saved}
                      onClick={() => simulateCapture('raw1')}
                      variant={photo1Saved ? 'secondary' : 'default'}
                    >
                      {saving1 ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : photo1Saved ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                      {photo1Saved ? 'FOTO 1 ✓' : 'FOTO 1'}
                    </Button>
                    <Button
                      className="flex-1 gap-2 h-14 text-lg font-bold"
                      disabled={!currentMahasiswa || saving2 || photo2Saved}
                      onClick={() => simulateCapture('raw2')}
                      variant={photo2Saved ? 'secondary' : 'default'}
                    >
                      {saving2 ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : photo2Saved ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                      {photo2Saved ? 'FOTO 2 ✓' : 'FOTO 2'}
                    </Button>
                  </>
                )}
              </div>

              {/* Upload to GDrive option */}
              {photo1Saved && photo2Saved && gdriveConfigured && (
                <Button variant="outline" className="w-full gap-2" disabled>
                  <Upload className="h-4 w-4" />
                  Unggah ke Google Drive (Segera)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

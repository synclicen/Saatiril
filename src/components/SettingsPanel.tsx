'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type SesiProsesi } from '@/lib/store';
import { useElectron } from '@/hooks/use-electron';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Settings,
  FolderOpen,
  Cloud,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Monitor,
  Moon,
  Sun,
  RefreshCw,
  Database,
} from 'lucide-react';

export default function SettingsPanel() {
  const {
    localFolderPath,
    setLocalFolderPath,
    gdriveConfigured,
    setGdriveConfigured,
  } = useAppStore();
  const { isElectron, selectFolder, defaultStoragePath } = useElectron();
  const [sesiList, setSesiList] = useState<SesiProsesi[]>([]);
  const [newSesiName, setNewSesiName] = useState('');
  const [gdriveConfig, setGdriveConfig] = useState({
    serviceAccountJson: '',
    rootFolderId: '',
    nama: 'default',
  });
  const [savingGdrive, setSavingGdrive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [addSesiOpen, setAddSesiOpen] = useState(false);

  // Fetch sessions
  const fetchSesi = useCallback(async () => {
    try {
      const res = await fetch('/api/sesi');
      if (res.ok) {
        const json = await res.json();
        setSesiList(json.data);
      }
    } catch (error) {
      console.error('Error fetching sesi:', error);
    }
  }, []);

  // Fetch GDrive config
  const fetchGdriveConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/gdrive-config');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.configured) {
          setGdriveConfigured(true);
          setGdriveConfig((prev) => ({
            ...prev,
            rootFolderId: json.data.rootFolderId || '',
            nama: json.data.nama || 'default',
          }));
        } else {
          setGdriveConfigured(false);
        }
      }
    } catch (error) {
      console.error('Error fetching GDrive config:', error);
    }
  }, [setGdriveConfigured]);

  useEffect(() => {
    fetchSesi();
    fetchGdriveConfig();

    // Set default path
    if (isElectron && defaultStoragePath && !localFolderPath) {
      setLocalFolderPath(defaultStoragePath);
    }

    // Check dark mode
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, [isElectron, defaultStoragePath, localFolderPath, setLocalFolderPath, fetchSesi, fetchGdriveConfig]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleSelectFolder = async () => {
    if (isElectron) {
      const folder = await selectFolder();
      if (folder) setLocalFolderPath(folder);
    } else {
      setLocalFolderPath('./photos');
    }
  };

  const handleAddSesi = async () => {
    if (!newSesiName.trim()) return;
    try {
      const res = await fetch('/api/sesi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: newSesiName.trim() }),
      });
      if (res.ok) {
        setNewSesiName('');
        setAddSesiOpen(false);
        fetchSesi();
      } else {
        const json = await res.json();
        alert(json.error || 'Gagal menambah sesi');
      }
    } catch (error) {
      console.error('Error adding sesi:', error);
    }
  };

  const handleActivateSesi = async (sesiId: string) => {
    try {
      const res = await fetch('/api/sesi/aktif', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesiId }),
      });
      if (res.ok) {
        fetchSesi();
      }
    } catch (error) {
      console.error('Error activating sesi:', error);
    }
  };

  const handleSaveGdrive = async () => {
    setSavingGdrive(true);
    try {
      const res = await fetch('/api/gdrive-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gdriveConfig),
      });
      if (res.ok) {
        setGdriveConfigured(true);
        alert('Konfigurasi Google Drive berhasil disimpan');
      } else {
        const json = await res.json();
        alert(json.error || 'Gagal menyimpan konfigurasi');
      }
    } catch (error) {
      console.error('Error saving GDrive config:', error);
      alert('Gagal menyimpan konfigurasi Google Drive');
    } finally {
      setSavingGdrive(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-emerald-600" />
        <h2 className="text-xl font-bold">Pengaturan</h2>
      </div>

      {/* App Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Monitor className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold">Saatiril v1.0.0</p>
              <p className="text-sm text-muted-foreground">
                Sistem Manajemen Foto Wisuda · {isElectron ? 'Mode Desktop (Electron)' : 'Mode Web'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tampilan</CardTitle>
          <CardDescription>Atur tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label>Mode Gelap</Label>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Local Storage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Penyimpanan Lokal
          </CardTitle>
          <CardDescription>Lokasi penyimpanan foto di komputer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={localFolderPath}
              onChange={(e) => setLocalFolderPath(e.target.value)}
              placeholder="Pilih folder penyimpanan..."
              className="flex-1"
            />
            <Button variant="outline" className="gap-2" onClick={handleSelectFolder}>
              <FolderOpen className="h-4 w-4" />
              Pilih
            </Button>
          </div>
          {localFolderPath && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Foto akan disimpan ke: {localFolderPath}
            </div>
          )}
          {!localFolderPath && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Belum memilih folder penyimpanan
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Drive */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Google Drive
          </CardTitle>
          <CardDescription>Konfigurasi sinkronisasi ke Google Drive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            {gdriveConfigured ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Terkonfigurasi
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Belum Dikonfigurasi
              </Badge>
            )}
          </div>

          <div>
            <Label className="text-sm">Service Account JSON</Label>
            <Textarea
              value={gdriveConfig.serviceAccountJson}
              onChange={(e) =>
                setGdriveConfig({ ...gdriveConfig, serviceAccountJson: e.target.value })
              }
              placeholder='{"type":"service_account","project_id":"..."}'
              className="font-mono text-xs h-32 mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Root Folder ID</Label>
            <Input
              value={gdriveConfig.rootFolderId}
              onChange={(e) =>
                setGdriveConfig({ ...gdriveConfig, rootFolderId: e.target.value })
              }
              placeholder="1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
              className="mt-1"
            />
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
            onClick={handleSaveGdrive}
            disabled={savingGdrive || !gdriveConfig.serviceAccountJson || !gdriveConfig.rootFolderId}
          >
            {savingGdrive ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            {savingGdrive ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </Button>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Sesi Prosesi
              </CardTitle>
              <CardDescription>Kelola sesi prosesi wisuda</CardDescription>
            </div>
            <Dialog open={addSesiOpen} onOpenChange={setAddSesiOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Sesi Prosesi</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Nama Sesi</Label>
                    <Input
                      value={newSesiName}
                      onChange={(e) => setNewSesiName(e.target.value)}
                      placeholder="contoh: Prosesi A"
                    />
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleAddSesi}
                    disabled={!newSesiName.trim()}
                  >
                    Tambah Sesi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sesiList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada sesi. Tambahkan sesi prosesi baru.
            </p>
          ) : (
            <div className="space-y-2">
              {sesiList.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{s.nama}</p>
                    <p className="text-xs text-muted-foreground">ID: {s.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.aktif ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Aktif
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateSesi(s.id)}
                      >
                        Aktifkan
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Manajemen Data</CardTitle>
          <CardDescription>Kelola data aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Reset Data Mahasiswa</p>
              <p className="text-xs text-muted-foreground">
                Hapus semua data mahasiswa dan foto
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    'Yakin ingin menghapus SEMUA data mahasiswa? Tindakan ini tidak dapat dibatalkan!'
                  )
                ) {
                  // Reset via API calls
                  fetch('/api/mahasiswa?limit=1000')
                    .then((r) => r.json())
                    .then((json) => {
                      Promise.all(
                        json.data.map((m: { id: string }) =>
                          fetch(`/api/mahasiswa/${m.id}`, { method: 'DELETE' })
                        )
                      ).then(() => {
                        alert('Data mahasiswa berhasil direset');
                      });
                    });
                }
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

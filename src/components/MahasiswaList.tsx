'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type Mahasiswa } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  menunggu: {
    label: 'Menunggu',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    icon: <Clock className="h-3 w-3" />,
  },
  dipanggil: {
    label: 'Dipanggil',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <UserCheck className="h-3 w-3" />,
  },
  prosesi: {
    label: 'Prosesi',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: <UserCheck className="h-3 w-3" />,
  },
  selesai: {
    label: 'Selesai',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

export default function MahasiswaList() {
  const { setTotalMahasiswa, setSelesaiCount, setDipanggilCount } = useAppStore();
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sesiFilter, setSesiFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importing, setImporting] = useState(false);
  const [newMhs, setNewMhs] = useState({
    nim: '',
    nama: '',
    fakultas: '',
    prodi: '',
    sesi: '',
    nomorUrut: '',
  });

  const fetchMahasiswa = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sesiFilter !== 'all') params.set('sesi', sesiFilter);

      const res = await fetch(`/api/mahasiswa?${params}`);
      if (res.ok) {
        const json = await res.json();
        setMahasiswa(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
        setTotalMahasiswa(json.pagination.total);

        // Fetch stats
        const [selesaiRes, dipanggilRes] = await Promise.all([
          fetch('/api/mahasiswa?status=selesai&limit=1'),
          fetch('/api/mahasiswa?status=dipanggil&limit=1'),
        ]);
        if (selesaiRes.ok) setSelesaiCount((await selesaiRes.json()).pagination.total);
        if (dipanggilRes.ok) setDipanggilCount((await dipanggilRes.json()).pagination.total);
      }
    } catch (error) {
      console.error('Error fetching mahasiswa:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, sesiFilter, setTotalMahasiswa, setSelesaiCount, setDipanggilCount]);

  useEffect(() => {
    fetchMahasiswa();
  }, [fetchMahasiswa]);

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    try {
      const res = await fetch('/api/mahasiswa/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: importText, format: importFormat }),
      });

      if (res.ok) {
        const json = await res.json();
        alert(json.message);
        setImportOpen(false);
        setImportText('');
        fetchMahasiswa();
      } else {
        const json = await res.json();
        alert(json.error || 'Gagal mengimport data');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Gagal mengimport data');
    } finally {
      setImporting(false);
    }
  };

  const handleAdd = async () => {
    if (!newMhs.nim || !newMhs.nama) return;
    try {
      const res = await fetch('/api/mahasiswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMhs),
      });

      if (res.ok) {
        setAddOpen(false);
        setNewMhs({ nim: '', nama: '', fakultas: '', prodi: '', sesi: '', nomorUrut: '' });
        fetchMahasiswa();
      } else {
        const json = await res.json();
        alert(json.error || 'Gagal menambah mahasiswa');
      }
    } catch (error) {
      console.error('Add error:', error);
      alert('Gagal menambah mahasiswa');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus mahasiswa ini?')) return;
    try {
      const res = await fetch(`/api/mahasiswa/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMahasiswa();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Data Mahasiswa</CardTitle>
            <p className="text-sm text-muted-foreground">
              {total} mahasiswa terdaftar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Import Data Mahasiswa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Format</Label>
                    <Select
                      value={importFormat}
                      onValueChange={(v) => setImportFormat(v as 'csv' | 'json')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>
                      Data {importFormat === 'csv' ? 'CSV' : 'JSON Array'}
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      {importFormat === 'csv'
                        ? 'Format: nim, nama, fakultas, prodi, sesi, nomorUrut'
                        : 'Format: [{nim, nama, fakultas, prodi, sesi, nomorUrut}]'}
                    </p>
                    <textarea
                      className="w-full h-48 p-3 text-sm border rounded-md font-mono"
                      placeholder={
                        importFormat === 'csv'
                          ? 'nim,nama,fakultas,prodi,sesi,nomorUrut\n123456,John Doe,Fakultas Teknik,Informatika,A,1'
                          : '[{"nim":"123456","nama":"John Doe","fakultas":"Teknik","prodi":"Informatika","sesi":"A","nomorUrut":"1"}]'
                      }
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleImport}
                    disabled={importing}
                  >
                    {importing ? 'Mengimport...' : 'Import Data'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Mahasiswa</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>NIM *</Label>
                    <Input
                      value={newMhs.nim}
                      onChange={(e) => setNewMhs({ ...newMhs, nim: e.target.value })}
                      placeholder="Nomor Induk Mahasiswa"
                    />
                  </div>
                  <div>
                    <Label>Nama *</Label>
                    <Input
                      value={newMhs.nama}
                      onChange={(e) => setNewMhs({ ...newMhs, nama: e.target.value })}
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Fakultas</Label>
                      <Input
                        value={newMhs.fakultas}
                        onChange={(e) => setNewMhs({ ...newMhs, fakultas: e.target.value })}
                        placeholder="Fakultas"
                      />
                    </div>
                    <div>
                      <Label>Prodi</Label>
                      <Input
                        value={newMhs.prodi}
                        onChange={(e) => setNewMhs({ ...newMhs, prodi: e.target.value })}
                        placeholder="Program Studi"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Sesi</Label>
                      <Select
                        value={newMhs.sesi || '_none'}
                        onValueChange={(v) =>
                          setNewMhs({ ...newMhs, sesi: v === '_none' ? '' : v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sesi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Tanpa sesi</SelectItem>
                          <SelectItem value="A">Sesi A</SelectItem>
                          <SelectItem value="B">Sesi B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nomor Urut</Label>
                      <Input
                        type="number"
                        value={newMhs.nomorUrut}
                        onChange={(e) => setNewMhs({ ...newMhs, nomorUrut: e.target.value })}
                        placeholder="No. urut"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleAdd}
                    disabled={!newMhs.nim || !newMhs.nama}
                  >
                    Tambah Mahasiswa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      {/* Filters */}
      <div className="px-6 pb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari nama, NIM, fakultas, prodi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="menunggu">Menunggu</SelectItem>
            <SelectItem value="dipanggil">Dipanggil</SelectItem>
            <SelectItem value="prosesi">Prosesi</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sesiFilter} onValueChange={(v) => { setSesiFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sesi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Sesi</SelectItem>
            <SelectItem value="A">Sesi A</SelectItem>
            <SelectItem value="B">Sesi B</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchMahasiswa} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Table */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">No</TableHead>
                <TableHead>NIM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Fakultas</TableHead>
                <TableHead>Prodi</TableHead>
                <TableHead className="w-[70px]">Sesi</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead className="w-[60px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : mahasiswa.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Belum ada data mahasiswa. Gunakan Import atau Tambah untuk menambahkan data.
                  </TableCell>
                </TableRow>
              ) : (
                mahasiswa.map((m, idx) => {
                  const statusCfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.menunggu;
                  const hasPhotos = !!(m.fotoRaw1 || m.fotoRaw2);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-muted-foreground text-xs">
                        {(page - 1) * 50 + idx + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{m.nim}</TableCell>
                      <TableCell className="font-medium">{m.nama}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.fakultas || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.prodi || '-'}
                      </TableCell>
                      <TableCell>
                        {m.sesi ? (
                          <Badge variant="outline" className="text-xs">
                            {m.sesi}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`gap-1 text-xs ${statusCfg.color}`}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {hasPhotos ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <UserX className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} data)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

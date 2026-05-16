'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Mahasiswa } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  RefreshCw,
  User,
  CheckCircle2,
  Camera,
  LayoutGrid,
  List,
} from 'lucide-react';

export default function Gallery() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [search, setSearch] = useState('');
  const [sesiFilter, setSesiFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '200');
      if (search) params.set('search', search);
      if (sesiFilter !== 'all') params.set('sesi', sesiFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/mahasiswa?${params}`);
      if (res.ok) {
        const json = await res.json();
        setMahasiswa(json.data);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, sesiFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const studentsWithPhotos = mahasiswa.filter((m) => m.fotoRaw1 || m.fotoRaw2);
  const completedStudents = mahasiswa.filter((m) => m.status === 'selesai');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon className="h-6 w-6 text-emerald-600" />
            <div>
              <CardTitle className="text-xl">Galeri Foto</CardTitle>
              <p className="text-sm text-muted-foreground">
                {studentsWithPhotos.length} foto · {completedStudents.length} selesai
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Filters */}
      <div className="px-6 pb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari nama atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sesiFilter} onValueChange={setSesiFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sesi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Sesi</SelectItem>
            <SelectItem value="A">Sesi A</SelectItem>
            <SelectItem value="B">Sesi B</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      </div>

      {/* Gallery Content */}
      <CardContent className="flex-1 overflow-y-auto">
        {mahasiswa.length === 0 && !isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-30" />
            <p className="text-lg">Belum ada foto</p>
            <p className="text-sm">Foto akan muncul setelah diambil oleh operator kamera</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {mahasiswa.map((m) => (
              <Card
                key={m.id}
                className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                  m.status === 'selesai'
                    ? 'border-green-200 dark:border-green-800'
                    : ''
                }`}
              >
                <div className="aspect-[3/4] bg-muted flex items-center justify-center relative">
                  {m.fotoRaw1 ? (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-800/10 flex flex-col items-center justify-center">
                      <Camera className="h-8 w-8 text-emerald-600 mb-2" />
                      <span className="text-xs text-emerald-600 font-medium">Foto Tersimpan</span>
                    </div>
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground/30" />
                  )}
                  {m.status === 'selesai' && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                  {m.status === 'dipanggil' && (
                    <div className="absolute top-1 left-1">
                      <Badge className="text-[9px] px-1 py-0 bg-blue-500">DIPANGGIL</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-[11px] font-mono text-muted-foreground">{m.nim}</p>
                  <p className="text-sm font-medium truncate">{m.nama}</p>
                  {m.sesi && (
                    <Badge variant="outline" className="text-[10px] mt-0.5">
                      Sesi {m.sesi}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="space-y-1">
            {mahasiswa.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {m.fotoRaw1 ? (
                    <Camera className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.nama}</p>
                  <p className="text-xs font-mono text-muted-foreground">{m.nim}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.fakultas && (
                    <span className="text-xs text-muted-foreground hidden md:inline">
                      {m.fakultas}
                    </span>
                  )}
                  {m.sesi && (
                    <Badge variant="outline" className="text-[10px]">
                      {m.sesi}
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      m.status === 'selesai'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : m.status === 'dipanggil'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {m.status}
                  </Badge>
                  {(m.fotoRaw1 || m.fotoRaw2) && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </div>
  );
}

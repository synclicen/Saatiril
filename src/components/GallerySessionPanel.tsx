'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Mahasiswa } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
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
  Clock,
  Camera,
} from 'lucide-react';

export default function GallerySessionPanel() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [search, setSearch] = useState('');
  const [sesiFilter, setSesiFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
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

  const studentsWithPhotos = mahasiswa.filter((m) => m.fotoRaw1 || m.fotoRaw2);
  const studentsWithoutPhotos = mahasiswa.filter((m) => !m.fotoRaw1 && !m.fotoRaw2);

  return (
    <div className="space-y-4">
      {/* Session stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{studentsWithPhotos.length}</p>
            <p className="text-xs text-muted-foreground">Dengan Foto</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{studentsWithoutPhotos.length}</p>
            <p className="text-xs text-muted-foreground">Tanpa Foto</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{mahasiswa.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid of students */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {mahasiswa.map((m) => (
          <Card
            key={m.id}
            className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
              m.status === 'selesai'
                ? 'border-green-200 dark:border-green-800'
                : m.status === 'dipanggil'
                ? 'border-blue-200 dark:border-blue-800'
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
              {/* Status indicator */}
              {m.status === 'selesai' && (
                <div className="absolute top-1 right-1">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              )}
              {m.status === 'dipanggil' && (
                <div className="absolute top-1 right-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <CardContent className="p-2">
              <p className="text-xs font-mono text-muted-foreground">{m.nim}</p>
              <p className="text-sm font-medium truncate">{m.nama}</p>
              {m.sesi && (
                <Badge variant="outline" className="text-[10px] mt-1">
                  Sesi {m.sesi}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {mahasiswa.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg">Belum ada data</p>
          <p className="text-sm">Import data mahasiswa terlebih dahulu</p>
        </div>
      )}
    </div>
  );
}

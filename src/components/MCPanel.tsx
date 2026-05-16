'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type Mahasiswa } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mic,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  RefreshCw,
  Pause,
  Play,
} from 'lucide-react';

export default function MCPanel() {
  const { setCurrentMahasiswa, currentMahasiswa, sesiAktif } = useAppStore();
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    dipanggil: 0,
    prosesi: 0,
    selesai: 0,
  });
  const [sesiFilter, setSesiFilter] = useState<string>(sesiAktif?.nama || 'all');
  const [isCalling, setIsCalling] = useState(false);
  const [recentCalls, setRecentCalls] = useState<Mahasiswa[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const [totalRes, menungguRes, dipanggilRes, prosesiRes, selesaiRes] =
        await Promise.all([
          fetch('/api/mahasiswa?limit=1'),
          fetch('/api/mahasiswa?status=menunggu&limit=1'),
          fetch('/api/mahasiswa?status=dipanggil&limit=1'),
          fetch('/api/mahasiswa?status=prosesi&limit=1'),
          fetch('/api/mahasiswa?status=selesai&limit=1'),
        ]);

      const total = totalRes.ok ? (await totalRes.json()).pagination.total : 0;
      const menunggu = menungguRes.ok ? (await menungguRes.json()).pagination.total : 0;
      const dipanggil = dipanggilRes.ok ? (await dipanggilRes.json()).pagination.total : 0;
      const prosesi = prosesiRes.ok ? (await prosesiRes.json()).pagination.total : 0;
      const selesai = selesaiRes.ok ? (await selesaiRes.json()).pagination.total : 0;

      setStats({ total, menunggu, dipanggil, prosesi, selesai });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchCurrent = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (sesiFilter !== 'all') params.set('sesi', sesiFilter);

      const res = await fetch(`/api/call/current?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCurrentMahasiswa(json.data);
      }
    } catch (error) {
      console.error('Error fetching current call:', error);
    }
  }, [sesiFilter, setCurrentMahasiswa]);

  useEffect(() => {
    fetchStats();
    fetchCurrent();
    const interval = setInterval(() => {
      fetchStats();
      fetchCurrent();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchCurrent]);

  const callNext = async () => {
    setIsCalling(true);
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'next',
          sesi: sesiFilter !== 'all' ? sesiFilter : undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setCurrentMahasiswa(json.data);
        if (currentMahasiswa) {
          setRecentCalls((prev) => [currentMahasiswa, ...prev].slice(0, 5));
        }
        fetchStats();
      } else {
        const json = await res.json();
        alert(json.error || 'Gagal memanggil mahasiswa berikutnya');
      }
    } catch (error) {
      console.error('Error calling next:', error);
      alert('Gagal memanggil mahasiswa berikutnya');
    } finally {
      setIsCalling(false);
    }
  };

  const markSelesai = async () => {
    if (!currentMahasiswa) return;
    try {
      await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          mahasiswaId: currentMahasiswa.id,
          status: 'selesai',
        }),
      });
      setRecentCalls((prev) => [currentMahasiswa, ...prev].slice(0, 5));
      setCurrentMahasiswa(null);
      fetchStats();
    } catch (error) {
      console.error('Error marking as selesai:', error);
    }
  };

  const skipStudent = async () => {
    if (!currentMahasiswa) return;
    try {
      await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skip',
          mahasiswaId: currentMahasiswa.id,
        }),
      });
      setCurrentMahasiswa(null);
      fetchStats();
    } catch (error) {
      console.error('Error skipping student:', error);
    }
  };

  const progressPercent =
    stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Top bar - Stats & Session selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mic className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold">Panel MC</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select value={sesiFilter} onValueChange={setSesiFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Pilih Sesi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sesi</SelectItem>
              <SelectItem value="A">Sesi A</SelectItem>
              <SelectItem value="B">Sesi B</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => { fetchStats(); fetchCurrent(); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Progres Wisuda
            </span>
            <span className="text-sm text-muted-foreground">
              {stats.selesai} / {stats.total} mahasiswa ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{stats.menunggu}</p>
              <p className="text-xs text-muted-foreground">Menunggu</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{stats.dipanggil}</p>
              <p className="text-xs text-muted-foreground">Dipanggil</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{stats.prosesi}</p>
              <p className="text-xs text-muted-foreground">Prosesi</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{stats.selesai}</p>
              <p className="text-xs text-muted-foreground">Selesai</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Display - Current Student */}
      <Card className="flex-1 border-2 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
          {currentMahasiswa ? (
            <div className="text-center space-y-4">
              {/* Status Badge */}
              <Badge
                className={`text-sm px-4 py-1 ${
                  currentMahasiswa.status === 'dipanggil'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : currentMahasiswa.status === 'prosesi'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {currentMahasiswa.status === 'dipanggil'
                  ? 'SEDANG DIPANGGIL'
                  : currentMahasiswa.status === 'prosesi'
                  ? 'PROSESI'
                  : 'SELESAI'}
              </Badge>

              {/* Student Name - Large for projector */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                {currentMahasiswa.nama}
              </h1>

              {/* NIM */}
              <p className="text-2xl md:text-3xl font-mono text-emerald-600">
                {currentMahasiswa.nim}
              </p>

              {/* Faculty / Study Program */}
              <div className="space-y-1">
                {currentMahasiswa.fakultas && (
                  <p className="text-xl text-muted-foreground">
                    {currentMahasiswa.fakultas}
                  </p>
                )}
                {currentMahasiswa.prodi && (
                  <p className="text-lg text-muted-foreground">
                    {currentMahasiswa.prodi}
                  </p>
                )}
              </div>

              {/* Session & Order */}
              <div className="flex items-center gap-3 justify-center">
                {currentMahasiswa.sesi && (
                  <Badge variant="outline" className="text-base px-3 py-1">
                    Sesi {currentMahasiswa.sesi}
                  </Badge>
                )}
                {currentMahasiswa.nomorUrut && (
                  <Badge variant="outline" className="text-base px-3 py-1">
                    No. {currentMahasiswa.nomorUrut}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 text-muted-foreground">
              <GraduationCap className="h-20 w-20 mx-auto opacity-30" />
              <div>
                <p className="text-2xl font-semibold">Belum ada mahasiswa dipanggil</p>
                <p className="text-lg">Tekan tombol &quot;Panggil Berikutnya&quot; untuk memulai</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 gap-2 h-14"
          onClick={skipStudent}
          disabled={!currentMahasiswa}
        >
          <SkipForward className="h-5 w-5" />
          Lewati
        </Button>

        <Button
          size="lg"
          className="flex-[2] gap-2 h-14 bg-emerald-600 hover:bg-emerald-700 text-lg font-bold"
          onClick={callNext}
          disabled={isCalling}
        >
          {isCalling ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          Panggil Berikutnya
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="flex-1 gap-2 h-14"
          onClick={markSelesai}
          disabled={!currentMahasiswa}
        >
          <CheckCircle2 className="h-5 w-5" />
          Selesai
        </Button>
      </div>

      {/* Recent calls */}
      {recentCalls.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-2">Pemanggilan Terakhir:</p>
            <div className="space-y-1">
              {recentCalls.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="font-mono text-xs text-muted-foreground">{m.nim}</span>
                  <span className="truncate">{m.nama}</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">
                    Selesai
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

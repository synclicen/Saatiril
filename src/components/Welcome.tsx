'use client';

import { useAppStore, type AppView } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Camera,
  Mic,
  Users,
  Image as ImageIcon,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const quickActions: Array<{
  label: string;
  icon: React.ReactNode;
  view: AppView;
  description: string;
  color: string;
}> = [
  {
    label: 'Panel MC',
    icon: <Mic className="h-6 w-6" />,
    view: 'mc',
    description: 'Panggil mahasiswa satu per satu',
    color: 'text-emerald-600',
  },
  {
    label: 'Panel Kamera',
    icon: <Camera className="h-6 w-6" />,
    view: 'camera',
    description: 'Ambil foto mahasiswa',
    color: 'text-amber-600',
  },
  {
    label: 'Galeri Foto',
    icon: <ImageIcon className="h-6 w-6" />,
    view: 'gallery',
    description: 'Lihat semua foto yang diambil',
    color: 'text-rose-600',
  },
  {
    label: 'Data Mahasiswa',
    icon: <Users className="h-6 w-6" />,
    view: 'mahasiswa',
    description: 'Kelola data mahasiswa',
    color: 'text-sky-600',
  },
];

export default function Welcome() {
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    dipanggil: 0,
    prosesi: 0,
    selesai: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/mahasiswa?limit=1');
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (cancelled) return;

        const [menungguRes, dipanggilRes, prosesiRes, selesaiRes] = await Promise.all([
          fetch('/api/mahasiswa?status=menunggu&limit=1'),
          fetch('/api/mahasiswa?status=dipanggil&limit=1'),
          fetch('/api/mahasiswa?status=prosesi&limit=1'),
          fetch('/api/mahasiswa?status=selesai&limit=1'),
        ]);

        if (cancelled) return;

        const menunggu = menungguRes.ok ? (await menungguRes.json()).pagination.total : 0;
        const dipanggil = dipanggilRes.ok ? (await dipanggilRes.json()).pagination.total : 0;
        const prosesi = prosesiRes.ok ? (await prosesiRes.json()).pagination.total : 0;
        const selesai = selesaiRes.ok ? (await selesaiRes.json()).pagination.total : 0;

        if (cancelled) return;

        setStats({
          total: menunggu + dipanggil + prosesi + selesai,
          menunggu,
          dipanggil,
          prosesi,
          selesai,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)] p-6">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
            <GraduationCap className="h-16 w-16 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          <span className="text-emerald-600">Saatiril</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Sistem Manajemen Foto Wisuda — Kelola pemanggilan dan foto untuk 4000 mahasiswa
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full max-w-2xl">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Mahasiswa</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.menunggu}</p>
            <p className="text-xs text-muted-foreground">Menunggu</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.dipanggil + stats.prosesi}</p>
            <p className="text-xs text-muted-foreground">Dipanggil/Prosesi</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.selesai}</p>
            <p className="text-xs text-muted-foreground">Selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {quickActions.map((action) => (
          <Card
            key={action.view}
            className="cursor-pointer hover:shadow-lg transition-all hover:border-emerald-300 dark:hover:border-emerald-700 group"
            onClick={() => setCurrentView(action.view)}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${action.color}`}>
                {action.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gallery Fullscreen Button */}
      <div className="mt-8">
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => {
            setCurrentView('gallery');
          }}
        >
          <ImageIcon className="h-5 w-5" />
          Buka Galeri Mahasiswa
        </Button>
      </div>

      {/* Footer info */}
      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <Database className="h-3 w-3" />
        <span>Offline-first · SQLite · Desktop-ready</span>
      </div>
    </div>
  );
}

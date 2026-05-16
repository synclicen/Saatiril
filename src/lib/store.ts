'use client';

import { create } from 'zustand';

export type Mahasiswa = {
  id: string;
  nim: string;
  nama: string;
  fakultas: string | null;
  prodi: string | null;
  sesi: string | null;
  nomorUrut: number | null;
  status: string;
  fotoRaw1: string | null;
  fotoRaw2: string | null;
  fotoFramed: string | null;
  gdriveFolderId: string | null;
  gdriveRaw1Id: string | null;
  gdriveRaw2Id: string | null;
  gdriveFramedId: string | null;
  dipanggilPada: string | null;
  fotoDiambilPada: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SesiProsesi = {
  id: string;
  nama: string;
  aktif: boolean;
  mahasiswaId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CameraStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type AppView = 'welcome' | 'mahasiswa' | 'mc' | 'camera' | 'gallery' | 'settings';

interface AppState {
  // Navigation
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // Current student being processed
  currentMahasiswa: Mahasiswa | null;
  setCurrentMahasiswa: (m: Mahasiswa | null) => void;

  // Active ceremony session
  sesiAktif: SesiProsesi | null;
  setSesiAktif: (s: SesiProsesi | null) => void;

  // Camera status
  cameraStatus: CameraStatus;
  setCameraStatus: (s: CameraStatus) => void;

  // Local folder path for saving photos
  localFolderPath: string;
  setLocalFolderPath: (p: string) => void;

  // Google Drive configuration status
  gdriveConfigured: boolean;
  setGdriveConfigured: (v: boolean) => void;

  // Electron detection
  isElectron: boolean;
  setIsElectron: (v: boolean) => void;

  // Gallery mode
  isGalleryMode: boolean;
  setIsGalleryMode: (v: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  // Stats
  totalMahasiswa: number;
  setTotalMahasiswa: (n: number) => void;
  selesaiCount: number;
  setSelesaiCount: (n: number) => void;
  dipanggilCount: number;
  setDipanggilCount: (n: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'welcome',
  setCurrentView: (view) => set({ currentView: view }),

  // Current student
  currentMahasiswa: null,
  setCurrentMahasiswa: (m) => set({ currentMahasiswa: m }),

  // Active session
  sesiAktif: null,
  setSesiAktif: (s) => set({ sesiAktif: s }),

  // Camera status
  cameraStatus: 'disconnected',
  setCameraStatus: (s) => set({ cameraStatus: s }),

  // Local folder path
  localFolderPath: '',
  setLocalFolderPath: (p) => set({ localFolderPath: p }),

  // Google Drive configured
  gdriveConfigured: false,
  setGdriveConfigured: (v) => set({ gdriveConfigured: v }),

  // Electron detection
  isElectron: false,
  setIsElectron: (v) => set({ isElectron: v }),

  // Gallery mode
  isGalleryMode: false,
  setIsGalleryMode: (v) => set({ isGalleryMode: v }),

  // Loading
  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),

  // Stats
  totalMahasiswa: 0,
  setTotalMahasiswa: (n) => set({ totalMahasiswa: n }),
  selesaiCount: 0,
  setSelesaiCount: (n) => set({ selesaiCount: n }),
  dipanggilCount: 0,
  setDipanggilCount: (n) => set({ dipanggilCount: n }),
}));

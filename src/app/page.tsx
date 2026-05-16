'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useElectron } from '@/hooks/use-electron';
import AppSidebar from '@/components/AppSidebar';
import Welcome from '@/components/Welcome';
import MahasiswaList from '@/components/MahasiswaList';
import MCPanel from '@/components/MCPanel';
import CameraPanel from '@/components/CameraPanel';
import Gallery from '@/components/Gallery';
import SettingsPanel from '@/components/SettingsPanel';

export default function Home() {
  const { currentView, isGalleryMode, setIsGalleryMode, setIsElectron } = useAppStore();
  const { isElectron } = useElectron();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsElectron(isElectron);
    if (searchParams.get('gallery') === 'true') {
      setIsGalleryMode(true);
    }
  }, [isElectron, searchParams, setIsGalleryMode, setIsElectron]);

  // Gallery fullscreen mode - no sidebar
  if (isGalleryMode) {
    return (
      <div className="h-screen bg-background">
        <Gallery />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'welcome':
        return <Welcome />;
      case 'mahasiswa':
        return (
          <div className="h-full overflow-y-auto">
            <MahasiswaList />
          </div>
        );
      case 'mc':
        return <MCPanel />;
      case 'camera':
        return <CameraPanel />;
      case 'gallery':
        return <Gallery />;
      case 'settings':
        return (
          <div className="h-full overflow-y-auto">
            <SettingsPanel />
          </div>
        );
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

'use client';

import { useAppStore, type AppView } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  Users,
  Mic,
  Camera,
  Image as ImageIcon,
  Settings,
  GraduationCap,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useState } from 'react';

const navItems: Array<{
  view: AppView;
  label: string;
  icon: React.ReactNode;
}> = [
  { view: 'welcome', label: 'Beranda', icon: <Home className="h-5 w-5" /> },
  { view: 'mahasiswa', label: 'Mahasiswa', icon: <Users className="h-5 w-5" /> },
  { view: 'mc', label: 'Panel MC', icon: <Mic className="h-5 w-5" /> },
  { view: 'camera', label: 'Panel Kamera', icon: <Camera className="h-5 w-5" /> },
  { view: 'gallery', label: 'Galeri', icon: <ImageIcon className="h-5 w-5" /> },
  { view: 'settings', label: 'Pengaturan', icon: <Settings className="h-5 w-5" /> },
];

export default function AppSidebar() {
  const { currentView, setCurrentView } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-56'
        } h-screen bg-card border-r flex flex-col transition-all duration-300 shrink-0`}
      >
        {/* Header */}
        <div className="p-3 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-base text-emerald-600 truncate">Saatiril</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Foto Wisuda
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            const button = (
              <Button
                key={item.view}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full ${
                  collapsed ? 'justify-center px-2' : 'justify-start gap-3'
                } ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold' : ''}`}
                onClick={() => setCurrentView(item.view)}
              >
                <span className={isActive ? 'text-emerald-600' : ''}>{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.view}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

        <Separator />

        {/* Footer */}
        <div className="p-3">
          {!collapsed ? (
            <p className="text-[10px] text-muted-foreground text-center">
              v1.0.0 · Offline-first
            </p>
          ) : (
            <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto" />
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

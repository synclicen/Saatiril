'use client';

import { useState, useEffect, useCallback } from 'react';

// Type definitions for Electron API
interface ElectronAPI {
  selectFolder: () => Promise<string | null>;
  checkFolderExists: (folderPath: string) => Promise<{ exists: boolean; isDirectory: boolean }>;
  createDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  savePhoto: (filePath: string, data: string) => Promise<{ success: boolean; path?: string; error?: string }>;
  listPhotos: (dirPath: string) => Promise<{ success: boolean; photos: Array<{ name: string; path: string; size: number; modified: Date }> }>;
  readPhoto: (filePath: string) => Promise<{ success: boolean; data?: string; mimeType?: string; error?: string }>;
  getAppInfo: () => Promise<{
    version: string;
    name: string;
    isPackaged: boolean;
    userDataPath: string;
    documentsPath: string;
    picturesPath: string;
    isDev: boolean;
  }>;
  getDefaultStoragePath: () => Promise<string>;
  isElectron: boolean;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

function getIsElectron() {
  return typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
}

/**
 * Hook to detect and use Electron desktop APIs
 * Falls back gracefully when running in a browser
 */
export function useElectron() {
  const [isElectron, setIsElectron] = useState(getIsElectron);
  const [appInfo, setAppInfo] = useState<Awaited<ReturnType<ElectronAPI['getAppInfo']>> | null>(null);
  const [defaultStoragePath, setDefaultStoragePath] = useState<string>('');

  useEffect(() => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.getAppInfo().then(setAppInfo).catch(console.error);
      window.electronAPI.getDefaultStoragePath().then(setDefaultStoragePath).catch(console.error);
    }
  }, [isElectron]);

  const selectFolder = useCallback(async (): Promise<string | null> => {
    if (!window.electronAPI) return null;
    return window.electronAPI.selectFolder();
  }, []);

  const checkFolderExists = useCallback(async (folderPath: string) => {
    if (!window.electronAPI) return { exists: false, isDirectory: false };
    return window.electronAPI.checkFolderExists(folderPath);
  }, []);

  const createDirectory = useCallback(async (dirPath: string) => {
    if (!window.electronAPI) return { success: false, error: 'Not in Electron' };
    return window.electronAPI.createDirectory(dirPath);
  }, []);

  const savePhoto = useCallback(async (filePath: string, data: string) => {
    if (!window.electronAPI) return { success: false, error: 'Not in Electron' };
    return window.electronAPI.savePhoto(filePath, data);
  }, []);

  const listPhotos = useCallback(async (dirPath: string) => {
    if (!window.electronAPI) return { success: false, photos: [] };
    return window.electronAPI.listPhotos(dirPath);
  }, []);

  const readPhoto = useCallback(async (filePath: string) => {
    if (!window.electronAPI) return { success: false, error: 'Not in Electron' };
    return window.electronAPI.readPhoto(filePath);
  }, []);

  return {
    isElectron,
    appInfo,
    defaultStoragePath,
    selectFolder,
    checkFolderExists,
    createDirectory,
    savePhoto,
    listPhotos,
    readPhoto,
    platform: isElectron ? window.electronAPI?.platform : 'web',
  };
}

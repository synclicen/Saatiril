/* eslint-disable @typescript-eslint/no-require-imports */
const { contextBridge, ipcRenderer } = require('electron');

// Expose desktop-specific APIs to the renderer process (Next.js app)
// This runs in a sandboxed environment with access to Node.js APIs

contextBridge.exposeInMainWorld('electronAPI', {
  // Folder selection
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  checkFolderExists: (folderPath) => ipcRenderer.invoke('check-folder-exists', folderPath),
  createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),
  
  // Photo management
  savePhoto: (filePath, data) => ipcRenderer.invoke('save-photo', { filePath, data }),
  listPhotos: (dirPath) => ipcRenderer.invoke('list-photos', dirPath),
  readPhoto: (filePath) => ipcRenderer.invoke('read-photo', filePath),
  
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  getDefaultStoragePath: () => ipcRenderer.invoke('get-default-storage-path'),
  
  // Platform detection
  isElectron: true,
  platform: process.platform,
});

console.log('[Preload] Electron APIs exposed to renderer');

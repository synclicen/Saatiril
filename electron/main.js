/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow = null;
let nextServer = null;
const isDev = !app.isPackaged;

// ==========================================
// NEXT.JS SERVER MANAGEMENT
// ==========================================

function startNextServer() {
  return new Promise((resolve, reject) => {
    const serverPath = isDev
      ? path.join(__dirname, '..', 'node_modules', '.bin', 'next')
      : path.join(process.resourcesPath, 'standalone', 'server.js');

    if (isDev) {
      // In dev mode, Next.js is already running via `bun run dev`
      console.log('[Electron] Dev mode - connecting to existing Next.js server on port 3000');
      resolve('http://localhost:3000');
      return;
    }

    // Production mode: start the standalone Next.js server
    const env = { ...process.env, PORT: '3000', HOSTNAME: 'localhost' };
    
    nextServer = spawn('node', [serverPath], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: path.join(process.resourcesPath, 'standalone'),
    });

    nextServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Next.js]', output);
      if (output.includes('Ready') || output.includes('started')) {
        resolve('http://localhost:3000');
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error('[Next.js Error]', data.toString());
    });

    nextServer.on('error', (err) => {
      console.error('[Next.js] Failed to start:', err);
      reject(err);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      resolve('http://localhost:3000');
    }, 30000);
  });
}

function stopNextServer() {
  if (nextServer) {
    console.log('[Electron] Stopping Next.js server...');
    nextServer.kill();
    nextServer = null;
  }
}

// ==========================================
// WINDOW MANAGEMENT
// ==========================================

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Saatiril - Sistem Manajemen Foto Wisuda',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false, // Don't show until ready
  });

  // Remove default menu bar
  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ==========================================
// IPC HANDLERS (Desktop-specific APIs)
// ==========================================

// Select local folder for photo storage
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Pilih Folder Penyimpanan Foto',
  });
  
  if (result.canceled) return null;
  return result.filePaths[0];
});

// Check if a folder exists
ipcMain.handle('check-folder-exists', async (event, folderPath) => {
  try {
    const stats = fs.statSync(folderPath);
    return { exists: true, isDirectory: stats.isDirectory() };
  } catch {
    return { exists: false, isDirectory: false };
  }
});

// Create directory recursively
ipcMain.handle('create-directory', async (event, dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Save photo to local folder
ipcMain.handle('save-photo', async (event, { filePath, data }) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // data is base64 encoded
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// List photos in a directory
ipcMain.handle('list-photos', async (event, dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) return { success: true, photos: [] };
    const files = fs.readdirSync(dirPath)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map(f => ({
        name: f,
        path: path.join(dirPath, f),
        size: fs.statSync(path.join(dirPath, f)).size,
        modified: fs.statSync(path.join(dirPath, f)).mtime,
      }));
    return { success: true, photos: files };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Read photo file as base64
ipcMain.handle('read-photo', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return { 
      success: true, 
      data: buffer.toString('base64'),
      mimeType: path.extname(filePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg',
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Get app version and info
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    isPackaged: app.isPackaged,
    userDataPath: app.getPath('userData'),
    documentsPath: app.getPath('documents'),
    picturesPath: app.getPath('pictures'),
    isDev: isDev,
  };
});

// Get default photo storage path
ipcMain.handle('get-default-storage-path', () => {
  const documentsPath = app.getPath('documents');
  return path.join(documentsPath, 'Saatiril-Photos');
});

// ==========================================
// APP LIFECYCLE
// ==========================================

app.whenReady().then(async () => {
  try {
    console.log('[Electron] Starting Saatiril Desktop App...');
    
    const serverUrl = await startNextServer();
    console.log('[Electron] Next.js server ready at:', serverUrl);
    
    createMainWindow();
    
    // Load the Next.js app
    await mainWindow.loadURL(serverUrl);
    console.log('[Electron] App loaded successfully!');
    
  } catch (err) {
    console.error('[Electron] Failed to start:', err);
    dialog.showErrorBox(
      'Gagal Memulai Aplikasi',
      `Saatiril gagal dimulai: ${err.message}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  stopNextServer();
  app.quit();
});

app.on('before-quit', () => {
  stopNextServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Electron] Uncaught Exception:', err);
});

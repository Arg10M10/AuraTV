import { app, BrowserWindow, session, ipcMain } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Aura TV Desktop",
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,    // Desactivado por seguridad
      contextIsolation: true,    // Activado para usar contextBridge
      webSecurity: false,        // Permitimos HTTP mixto para streams Xtream
      preload: path.join(__dirname, 'preload.js'), // Apuntamos al script de precarga
    },
  });

  // BYPASS GLOBAL: Inyectar User-Agent en todas las peticiones
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*/*'] },
    (details, callback) => {
      details.requestHeaders['User-Agent'] = 'IPTVSmarters/1.0.0';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  // Escuchar mensajes del Frontend (React)
  ipcMain.on('video-playback-start', (event, url) => {
    console.log(`[Electron-Backend] Reproduciendo flujo: ${url}`);
    // Aquí podrías añadir Discord RPC o controles de sistema
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
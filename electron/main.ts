import { app, BrowserWindow, session, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Aura TV Desktop",
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'), 
    },
  });

  // Proxy de cabeceras para evitar bloqueos 403
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*/*'] },
    (details, callback) => {
      details.requestHeaders['User-Agent'] = 'IPTVSmarters/1.0.0';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  // COMANDO PARA ABRIR EN VLC/REPRODUCTOR EXTERNO
  ipcMain.on('open-external-player', (event, url) => {
    console.log(`[Electron] Abriendo en reproductor externo: ${url}`);
    shell.openExternal(url);
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:8080').catch(() => {
      setTimeout(() => win.loadURL('http://localhost:8080'), 2000);
    });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
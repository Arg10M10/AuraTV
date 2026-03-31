import { app, BrowserWindow, session, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      // Usamos .ts directamente gracias a tsx/register
      preload: path.join(__dirname, 'preload.ts'), 
    },
  });

  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*/*'] },
    (details, callback) => {
      details.requestHeaders['User-Agent'] = 'IPTVSmarters/1.0.0';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  ipcMain.on('video-playback-start', (event, url) => {
    console.log(`[Electron] Stream detectado: ${url}`);
  });

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    win.loadURL('http://localhost:8080');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
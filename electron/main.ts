import { app, BrowserWindow, session } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Aura TV Desktop",
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // CRUCIAL: Permitir carga de contenido HTTP mixto y saltar CORS
      webSecurity: false, 
    },
  });

  // BYPASS DE SEGURIDAD: Inyectar User-Agent en todas las peticiones de video/api
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*/*'] },
    (details, callback) => {
      details.requestHeaders['User-Agent'] = 'IPTVSmarters/1.0.0';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

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
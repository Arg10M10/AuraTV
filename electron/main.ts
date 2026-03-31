import { app, BrowserWindow, session, ipcMain } from 'electron';
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
      // Usamos el archivo .ts directamente ya que tsx lo manejará en el proceso de Electron
      preload: path.join(__dirname, 'preload.ts'), 
    },
  });

  // Configuración de cabeceras para saltar restricciones de servidores IPTV
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*/*'] },
    (details, callback) => {
      details.requestHeaders['User-Agent'] = 'IPTVSmarters/1.0.0';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  ipcMain.on('video-playback-start', (event, url) => {
    console.log(`[Electron] Stream iniciado: ${url}`);
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    // Abrimos herramientas de desarrollo automáticamente para ver errores
    win.webContents.openDevTools();
    
    // Intentamos cargar la URL de Vite. Si falla (porque Vite aún no está listo), reintentamos en 2 segundos.
    win.loadURL('http://localhost:8080').catch(() => {
      console.log("[Electron] Servidor Vite no detectado, reintentando...");
      setTimeout(() => win.loadURL('http://localhost:8080'), 2000);
    });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
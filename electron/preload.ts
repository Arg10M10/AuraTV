import { contextBridge, ipcRenderer } from 'electron';

// Exponemos funciones específicas al objeto 'window.electronAPI'
contextBridge.exposeInMainWorld('electronAPI', {
  // Notifica al proceso principal que un video ha comenzado
  notifyVideoStart: (url: string) => ipcRenderer.send('video-playback-start', url),
  // Permite al frontend escuchar eventos de error del sistema
  onSystemError: (callback: (message: string) => void) => 
    ipcRenderer.on('system-error', (_event, value) => callback(value))
});
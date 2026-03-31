const { contextBridge, ipcRenderer } = require('electron');

// Exponemos funciones específicas al objeto 'window.electronAPI'
contextBridge.exposeInMainWorld('electronAPI', {
  // Notifica al proceso principal que un video ha comenzado
  notifyVideoStart: (url) => ipcRenderer.send('video-playback-start', url),
  // Permite al frontend escuchar eventos de error del sistema
  onSystemError: (callback) => 
    ipcRenderer.on('system-error', (_event, value) => callback(value))
});
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  notifyVideoStart: (url) => ipcRenderer.send('video-playback-start', url),
  openExternal: (url) => ipcRenderer.send('open-external-player', url),
  onSystemError: (callback) => 
    ipcRenderer.on('system-error', (_event, value) => callback(value))
});
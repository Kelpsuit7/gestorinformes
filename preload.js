const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  guardarPDF: (nombreSugerido) => ipcRenderer.invoke('guardar-pdf', nombreSugerido),
  abrirManualUsuario: () => ipcRenderer.invoke('abrir-manual-usuario')
});

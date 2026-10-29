const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  guardarPDF: (opciones) => ipcRenderer.invoke('guardar-pdf', opciones),
  abrirManualUsuario: () => ipcRenderer.invoke('abrir-manual-usuario'),
  abrirRuta: (ruta) => ipcRenderer.invoke('abrir-ruta', ruta),
  mostrarEnCarpeta: (ruta) => ipcRenderer.invoke('mostrar-en-carpeta', ruta),
  guardarRespaldoAutomatico: (respaldo) => ipcRenderer.invoke('guardar-respaldo-automatico', respaldo),
  cargarRespaldoAutomatico: () => ipcRenderer.invoke('cargar-respaldo-automatico')
});

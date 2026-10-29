const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

let ventanaPrincipal;
let ventanaManual;
let reloadTimer;
const rutaLogoAplicacion = path.join(__dirname, 'logo.ico');

function crearVentanaPrincipal() {
  ventanaPrincipal = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#F9F9F9',
    icon: rutaLogoAplicacion,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  ventanaPrincipal.loadFile(path.join(__dirname, 'index.html'));
  ventanaPrincipal.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
  });
  ventanaPrincipal.webContents.on('render-process-gone', (_event, details) => {
    console.error('El proceso renderer termino inesperadamente:', details);
  });
  ventanaPrincipal.on('closed', () => {
    ventanaPrincipal = null;
  });
}

function abrirManualUsuario() {
  if (ventanaManual && !ventanaManual.isDestroyed()) {
    ventanaManual.focus();
    return;
  }
  ventanaManual = new BrowserWindow({
    width: 1120,
    height: 820,
    minWidth: 760,
    minHeight: 580,
    title: 'Manual de usuario · Generador de Informes',
    backgroundColor: '#f3f6f5',
    icon: rutaLogoAplicacion,
    autoHideMenuBar: true,
    parent: ventanaPrincipal || undefined,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  ventanaManual.loadFile(path.join(__dirname, 'manual-usuario.html'));
  ventanaManual.on('closed', () => { ventanaManual = null; });
}

function activarRecargaAutomatica() {
  const archivos = ['index.html', 'styles.css', 'app-core.js', 'renderer.js', 'productivity.js', 'preload.js'];

  archivos.forEach((archivo) => {
    fs.watch(path.join(__dirname, archivo), () => {
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(() => {
        if (ventanaPrincipal && !ventanaPrincipal.isDestroyed()) {
          ventanaPrincipal.webContents.reloadIgnoringCache();
        }
      }, 250);
    });
  });
}

ipcMain.handle('guardar-pdf', async (event, opciones) => {
  const ventana = BrowserWindow.fromWebContents(event.sender);
  if (!ventana) return { ok: false, error: 'No se encontro la ventana activa.' };

  const nombreSugerido = typeof opciones === 'string' ? opciones : opciones?.nombreSugerido;
  const directorioInicial = typeof opciones === 'object' ? String(opciones?.directorioInicial || '') : '';
  const rutaSugerida = directorioInicial && path.isAbsolute(directorioInicial)
    ? path.join(directorioInicial, path.basename(nombreSugerido || 'informe.pdf'))
    : nombreSugerido || 'informe.pdf';

  const resultado = await dialog.showSaveDialog(ventana, {
    title: 'Guardar informe como PDF',
    defaultPath: rutaSugerida,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });

  if (resultado.canceled || !resultado.filePath) {
    return { ok: false, canceled: true };
  }

  const pdf = await ventana.webContents.printToPDF({
    pageSize: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margins: { marginType: 'none' }
  });

  await fs.promises.writeFile(resultado.filePath, pdf);
  return { ok: true, filePath: resultado.filePath };
});

ipcMain.handle('abrir-ruta', async (_event, ruta) => {
  const rutaSegura = path.resolve(String(ruta || ''));
  if (!ruta || !path.isAbsolute(rutaSegura) || !fs.existsSync(rutaSegura)) return { ok: false, error: 'El archivo ya no existe.' };
  const error = await shell.openPath(rutaSegura);
  return error ? { ok: false, error } : { ok: true };
});

ipcMain.handle('mostrar-en-carpeta', (_event, ruta) => {
  const rutaSegura = path.resolve(String(ruta || ''));
  if (!ruta || !path.isAbsolute(rutaSegura) || !fs.existsSync(rutaSegura)) return { ok: false, error: 'El archivo ya no existe.' };
  shell.showItemInFolder(rutaSegura);
  return { ok: true };
});

ipcMain.handle('guardar-respaldo-automatico', async (_event, respaldo) => {
  if (!respaldo || respaldo.product !== 'Generador de Informes' || typeof respaldo.entries !== 'object') return { ok: false, error: 'Respaldo inválido.' };
  const directorio = path.join(app.getPath('userData'), 'backups');
  const destino = path.join(directorio, 'respaldo-integral-automatico.json');
  const temporal = path.join(directorio, 'respaldo-integral-automatico.tmp');
  await fs.promises.mkdir(directorio, { recursive: true });
  await fs.promises.writeFile(temporal, JSON.stringify({ savedAt: new Date().toISOString(), backup: respaldo }), 'utf8');
  await fs.promises.rename(temporal, destino);
  return { ok: true, savedAt: new Date().toISOString() };
});

ipcMain.handle('cargar-respaldo-automatico', async () => {
  const destino = path.join(app.getPath('userData'), 'backups', 'respaldo-integral-automatico.json');
  try {
    const contenido = await fs.promises.readFile(destino, 'utf8');
    return { ok: true, data: JSON.parse(contenido) };
  } catch (error) {
    if (error && error.code === 'ENOENT') return { ok: false, missing: true };
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('abrir-manual-usuario', () => {
  abrirManualUsuario();
  return { ok: true };
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.huellitas.generadorinformes');
  if (process.platform === 'darwin' && app.dock) app.dock.setIcon(rutaLogoAplicacion);
  crearVentanaPrincipal();
  if (!app.isPackaged) activarRecargaAutomatica();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      crearVentanaPrincipal();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

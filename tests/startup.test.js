const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');

async function start(platform, loadError) {
  const windows = [];
  const errors = [];
  const app = new EventEmitter();
  Object.assign(app, {
    isPackaged: true,
    whenReady: () => Promise.resolve(),
    setAppUserModelId() {},
    dock: { setIcon() { throw new Error('Packaged macOS must use its bundle icon'); } }
  });
  class BrowserWindow extends EventEmitter {
    constructor(options) {
      super();
      this.options = options;
      this.webContents = new EventEmitter();
      windows.push(this);
    }
    loadFile(file) {
      this.file = file;
      return loadError ? Promise.reject(loadError) : Promise.resolve();
    }
  }
  const electron = {
    app, BrowserWindow,
    dialog: { showErrorBox: (...args) => errors.push(args) },
    ipcMain: { handle() {} }, shell: {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8'), {
    require: name => name === 'electron' ? electron : require(name),
    __dirname: path.join(__dirname, '..'),
    process: { platform }, console: { log() {}, error() {} }, setTimeout, clearTimeout
  });
  await new Promise(resolve => setImmediate(resolve));
  return { windows, errors };
}

test('macOS empaquetado crea la ventana sin cambiar el icono del Dock', async () => {
  const { windows, errors } = await start('darwin');
  assert.equal(windows.length, 1);
  assert.equal(path.basename(windows[0].options.icon), 'logo.png');
  assert.equal(path.basename(windows[0].file), 'index.html');
  assert.deepEqual(errors, []);
});

test('Windows conserva el icono ICO', async () => {
  const { windows, errors } = await start('win32');
  assert.equal(path.basename(windows[0].options.icon), 'logo.ico');
  assert.deepEqual(errors, []);
});

test('un fallo de carga muestra el motivo en un dialogo', async () => {
  const { errors } = await start('darwin', new Error('ERR_FILE_NOT_FOUND'));
  assert.equal(errors.length, 1);
  assert.match(errors[0][1], /ERR_FILE_NOT_FOUND/);
});

test('un cierre inesperado de la interfaz muestra el motivo', async () => {
  const { windows, errors } = await start('darwin');
  windows[0].webContents.emit('render-process-gone', {}, { reason: 'crashed', exitCode: 1 });
  assert.equal(errors.length, 1);
  assert.match(errors[0][1], /crashed/);
});

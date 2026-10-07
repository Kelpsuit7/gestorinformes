const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function sidebar() {
  const element = () => ({ style: {}, dataset: {}, classList: { toggle(name, value) { this[name] = value; } }, setAttribute() {} });
  const panels = Object.fromEntries(['.designer-navigator', '.designer-controls-section', '.designer-assistant', 'designerCatalogPanel', 'designerBlockPanel'].map(key => [key, element()]));
  panels.designerBlockPanel.style.display = 'grid';
  let scrolls = 0;
  const toolbox = { dataset: {}, querySelector: selector => panels[selector], querySelectorAll: () => [], scrollTo() { scrolls++; } };
  const context = vm.createContext({ document: { querySelector: () => toolbox, getElementById: id => panels[id] }, window: { requestAnimationFrame: fn => fn() }, HTMLDetailsElement: class {} });
  const source = fs.readFileSync(require.resolve('../renderer.js'), 'utf8');
  const start = source.indexOf('function enfocarSeccionSidebarDisenador(');
  vm.runInContext(source.slice(start, source.indexOf('\n}', start) + 2), context);
  return { panels, toolbox, focus: context.enfocarSeccionSidebarDisenador, scrolls: () => scrolls };
}

test('seleccionar un bloque conserva paginas visibles sin desplazar el sidebar', () => {
  const ui = sidebar();
  ui.focus('paginas');
  assert.equal(ui.toolbox.dataset.activeSection, 'paginas');
  assert.equal(ui.panels['.designer-navigator'].classList['is-sidebar-section-hidden'], false);
  assert.equal(ui.panels.designerBlockPanel.classList['is-sidebar-section-hidden'], false);
  assert.equal(ui.scrolls(), 0);
});

test('cerrar propiedades conserva el catalogo visible', () => {
  const ui = sidebar();
  ui.focus('bloques');
  ui.panels.designerBlockPanel.style.display = 'none';
  ui.focus(ui.toolbox.dataset.activeSection);
  assert.equal(ui.panels.designerCatalogPanel.classList['is-sidebar-section-hidden'], false);
  assert.equal(ui.panels.designerBlockPanel.classList['is-sidebar-section-hidden'], true);
  assert.equal(ui.scrolls(), 0);
});

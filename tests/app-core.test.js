const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../app-core');

test('respaldo integral válido conserva todas las entradas', () => {
  const backup = core.createBackup({ informesGuardados: '[]', ajustesApp: '{"tema":"huellitas"}' });
  assert.equal(core.validateBackup(backup).ok, true);
  assert.equal(backup.entries.informesGuardados, '[]');
});

test('respaldo modificado no supera la validación', () => {
  const backup = core.createBackup({ informesGuardados: '[]' });
  backup.entries.informesGuardados = '[{"id":"alterado"}]';
  assert.equal(core.validateBackup(backup).ok, false);
});

test('pacientes con mismo nombre y tutor se actualizan sin duplicarse', () => {
  const first = core.mergePatient([], { paciente: 'Luna', propietario: 'Ana', especie: 'Canino' });
  const second = core.mergePatient(first.patients, { paciente: ' luna ', propietario: 'ANA', raza: 'Poodle' });
  assert.equal(second.patients.length, 1);
  assert.equal(second.patient.raza, 'Poodle');
});

test('checklist exige paciente, fecha, resultados, conclusión e identidad', () => {
  const incomplete = core.reportChecklist({ paciente: 'Luna', fecha: '28-08-2026' }, { hasVisibleBlocks: true });
  assert.equal(incomplete.ready, false);
  const complete = core.reportChecklist({ paciente: 'Luna', fecha: '28-08-2026', resultados: 'Sin alteraciones', conclusion: 'Normal' }, { hasVisibleBlocks: true, doctorName: 'Dra. Pérez', doctorId: '12.345.678-9' });
  assert.equal(complete.ready, true);
});

test('una revisión conserva una copia independiente', () => {
  const report = { id: 'INF-1', estado: 'Borrador', datos: { paciente: 'Luna' } };
  const revision = core.createRevision(report, 'Antes de finalizar');
  report.datos.paciente = 'Otro';
  assert.equal(revision.snapshot.datos.paciente, 'Luna');
});

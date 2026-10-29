(function initAppCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AppCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createAppCore() {
  const BACKUP_VERSION = 1;

  function safeJsonParse(value, fallback = null) {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeSearch(value) {
    return cleanText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function createId(prefix = 'item') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function checksum(text) {
    let hash = 2166136261;
    const source = String(text || '');
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function normalizePatient(patient = {}) {
    const normalized = {
      id: cleanText(patient.id) || createId('paciente'),
      paciente: cleanText(patient.paciente || patient.nombre),
      especie: cleanText(patient.especie),
      raza: cleanText(patient.raza),
      edad: cleanText(patient.edad),
      sexo: cleanText(patient.sexo),
      estadoReproductivo: cleanText(patient.estadoReproductivo),
      propietario: cleanText(patient.propietario || patient.tutor),
      correo: cleanText(patient.correo),
      telefono: cleanText(patient.telefono),
      microchip: cleanText(patient.microchip),
      notas: cleanText(patient.notas),
      creadoEn: patient.creadoEn || new Date().toISOString(),
      actualizado: patient.actualizado || new Date().toISOString()
    };
    return normalized;
  }

  function patientKey(patient = {}) {
    return `${normalizeSearch(patient.paciente || patient.nombre)}|${normalizeSearch(patient.propietario || patient.tutor)}`;
  }

  function mergePatient(list = [], candidate = {}) {
    const patient = normalizePatient(candidate);
    if (!patient.paciente) return { patients: list.map(normalizePatient), patient: null, created: false };
    const patients = list.map(normalizePatient);
    const key = patientKey(patient);
    const index = patients.findIndex((item) => item.id === patient.id || patientKey(item) === key);
    if (index < 0) return { patients: [...patients, patient], patient, created: true };
    const merged = normalizePatient({ ...patients[index], ...patient, id: patients[index].id, creadoEn: patients[index].creadoEn, actualizado: new Date().toISOString() });
    patients[index] = merged;
    return { patients, patient: merged, created: false };
  }

  function reportChecklist(data = {}, options = {}) {
    const visibleBlocks = options.hasVisibleBlocks !== false;
    const identityReady = Boolean(cleanText(options.doctorName) && (cleanText(options.doctorId) || options.signatureReady));
    const images = Array.isArray(data.imagenes) ? data.imagenes : [];
    const items = [
      { id: 'paciente', label: 'Nombre del paciente', ok: Boolean(cleanText(data.paciente)), required: true, field: 'paciente' },
      { id: 'fecha', label: 'Fecha del informe', ok: Boolean(cleanText(data.fecha)), required: true, field: 'fecha' },
      { id: 'propietario', label: 'Tutor o propietario', ok: Boolean(cleanText(data.propietario)), required: false, field: 'propietario' },
      { id: 'antecedentes', label: 'Antecedentes clínicos', ok: Boolean(cleanText(data.antecedentes)), required: false, field: 'antecedentes' },
      { id: 'resultados', label: 'Resultados o hallazgos', ok: Boolean(cleanText(data.resultados || data.hallazgos)), required: true, field: 'resultados' },
      { id: 'conclusion', label: 'Conclusión', ok: Boolean(cleanText(data.conclusion)), required: true, field: 'conclusion' },
      { id: 'identidad', label: 'Identidad profesional', ok: identityReady, required: true, field: null },
      { id: 'plantilla', label: 'Plantilla con contenido visible', ok: visibleBlocks, required: true, field: null },
      { id: 'imagenes', label: images.length ? `${images.length} imagen${images.length === 1 ? '' : 'es'} revisada${images.length === 1 ? '' : 's'}` : 'Imágenes (opcional)', ok: true, required: false, field: null }
    ];
    const required = items.filter((item) => item.required);
    const completed = required.filter((item) => item.ok).length;
    return { items, completed, total: required.length, ready: completed === required.length };
  }

  function createRevision(report, reason = 'Guardado manual') {
    if (!report || !report.id) return null;
    return {
      revisionId: createId('revision'),
      reportId: report.id,
      reason: cleanText(reason) || 'Guardado manual',
      createdAt: new Date().toISOString(),
      snapshot: clone(report)
    };
  }

  function reportsEqual(first, second) {
    if (!first || !second) return false;
    return JSON.stringify(first.datos || {}) === JSON.stringify(second.datos || {}) && first.estado === second.estado;
  }

  function createBackup(entries = {}, metadata = {}) {
    const payload = {
      product: 'Generador de Informes',
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      metadata: { ...metadata },
      entries: clone(entries)
    };
    payload.checksum = checksum(JSON.stringify(payload.entries));
    return payload;
  }

  function validateBackup(backup) {
    if (!backup || backup.product !== 'Generador de Informes' || backup.version !== BACKUP_VERSION || !backup.entries || typeof backup.entries !== 'object') {
      return { ok: false, error: 'El archivo no corresponde a un respaldo integral compatible.' };
    }
    const current = checksum(JSON.stringify(backup.entries));
    if (backup.checksum !== current) return { ok: false, error: 'El respaldo está incompleto o fue modificado.' };
    return { ok: true };
  }

  return {
    BACKUP_VERSION,
    safeJsonParse,
    clone,
    cleanText,
    normalizeSearch,
    createId,
    checksum,
    normalizePatient,
    patientKey,
    mergePatient,
    reportChecklist,
    createRevision,
    reportsEqual,
    createBackup,
    validateBackup
  };
});

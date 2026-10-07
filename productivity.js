(function initProductivityLayer() {
  'use strict';

  const core = window.AppCore;
  if (!core) throw new Error('AppCore no está disponible.');

  const STORAGE = {
    patients: 'pacientesClinicos',
    snippets: 'textosClinicos',
    revisions: 'revisionesInformes',
    designerMode: 'modoDisenador',
    backupMeta: 'respaldoIntegralMetadata',
    lastPdfDirectory: 'ultimaCarpetaPDF'
  };
  const BACKUP_DB = 'generador-informes-respaldo';
  const BACKUP_STORE = 'snapshots';
  let activeSnippetTarget = null;
  let backupTimer = null;
  let lastPdfPath = '';

  function getJson(key, fallback) {
    return core.safeJsonParse(localStorage.getItem(key) || '', fallback);
  }

  function setJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    scheduleAutomaticBackup();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function formatDate(value, withTime = false) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return withTime ? date.toLocaleString('es-CL') : date.toLocaleDateString('es-CL');
  }

  function notify(message, type = 'success') {
    if (typeof window.mostrarAvisoBreve === 'function') window.mostrarAvisoBreve(message, type);
  }

  async function confirmApp(options) {
    if (typeof window.mostrarDialogoApp === 'function') return window.mostrarDialogoApp(options);
    return window.confirm(options.mensaje || options.titulo || '¿Deseas continuar?');
  }

  function ensureProductivityUI() {
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions && !document.getElementById('patientsQuickAction')) {
      quickActions.insertAdjacentHTML('beforeend', `
        <button id="patientsQuickAction" class="action-card" type="button" onclick="showPacientes()">
          <span class="action-icon"><svg class="ui-icon"><use href="#icon-user"></use></svg></span>
          <span class="action-copy"><strong>Pacientes</strong><small>Reutiliza fichas e informes anteriores</small></span><svg class="ui-icon action-arrow"><use href="#icon-chevron-right"></use></svg>
        </button>
        <button id="continueDraftQuickAction" class="action-card" type="button" onclick="continuarUltimoBorrador()" hidden>
          <span class="action-icon"><svg class="ui-icon"><use href="#icon-clock"></use></svg></span>
          <span class="action-copy"><strong>Continuar borrador</strong><small id="continueDraftCaption">Retoma el último informe</small></span><svg class="ui-icon action-arrow"><use href="#icon-chevron-right"></use></svg>
        </button>`);
    }

    const editorActions = document.querySelector('#editor-view .editor-actions');
    if (editorActions && !document.getElementById('saveDraftButton')) {
      editorActions.querySelector('[onclick="guardarInformePDF()"]')?.remove();
      editorActions.insertAdjacentHTML('beforeend', `
        <button class="editor-action-btn secondary" type="button" onclick="abrirSelectorPaciente()"><svg class="ui-icon"><use href="#icon-user"></use></svg>Paciente</button>
        <button class="editor-action-btn secondary" type="button" onclick="abrirBibliotecaTextos()"><svg class="ui-icon"><use href="#icon-text"></use></svg>Textos clínicos</button>
        <button class="editor-action-btn secondary" type="button" onclick="abrirChecklistInforme()"><svg class="ui-icon"><use href="#icon-check"></use></svg>Revisar</button>
        <button id="saveDraftButton" class="editor-action-btn secondary" type="button" onclick="guardarBorradorDesdeBarra()"><svg class="ui-icon"><use href="#icon-save"></use></svg>Guardar borrador</button>
        <button class="editor-action-btn secondary" type="button" onclick="mostrarVersionesInforme()"><svg class="ui-icon"><use href="#icon-clock"></use></svg>Versiones</button>
        <button id="finalizeReportButton" class="editor-action-btn" type="button" onclick="finalizarInformeClinico()"><svg class="ui-icon"><use href="#icon-check"></use></svg>Finalizar</button>
        <button class="editor-action-btn" type="button" onclick="guardarInformePDF()"><svg class="ui-icon"><use href="#icon-file"></use></svg>Exportar PDF</button>`);
    }

    const previewButton = document.getElementById('pdfPreviewSaveButton');
    if (previewButton) previewButton.textContent = 'Exportar PDF';

    const designerHeader = document.querySelector('#designer-view .config-header');
    if (designerHeader && !document.getElementById('designerModeToggle')) {
      const saveButton = document.getElementById('saveDesignerButton');
      saveButton?.insertAdjacentHTML('beforebegin', '<div class="designer-zoom-controls" aria-label="Zoom del diseñador"><button type="button" onclick="cambiarZoomDisenador(-0.1)" aria-label="Alejar">−</button><span id="designerZoomLabel">100%</span><button type="button" onclick="cambiarZoomDisenador(0.1)" aria-label="Acercar">+</button><button type="button" onclick="ajustarZoomDisenador()">Ajustar</button></div><button id="designerModeToggle" class="editor-action-btn secondary designer-mode-toggle" type="button" onclick="alternarModoDisenadorProducto()">Modo básico</button>');
    }

    injectPatientsView();
    injectConfigEnhancements();
    injectProductivityModals();
  }

  function injectPatientsView() {
    if (document.getElementById('pacientes-view')) return;
    document.getElementById('historial-view')?.insertAdjacentHTML('beforebegin', `
      <div id="pacientes-view" style="display:none">
        <div class="historial-shell patients-shell">
          <header class="editor-header historial-header">
            <button class="back-btn" type="button" onclick="showDashboard()"><svg class="ui-icon"><use href="#icon-arrow-left"></use></svg> Volver</button>
            <div><h2 class="editor-title">Pacientes</h2><p class="editor-subtitle">Reutiliza datos y consulta informes anteriores.</p></div>
            <button class="primary-btn" type="button" onclick="abrirFormularioPaciente()"><svg class="ui-icon"><use href="#icon-plus"></use></svg>Nuevo paciente</button>
          </header>
          <section class="historial-panel patients-panel">
            <div class="patients-toolbar"><label class="profiles-search"><span><svg class="ui-icon"><use href="#icon-search"></use></svg></span><input id="patientsSearch" type="search" placeholder="Buscar paciente, tutor, especie o microchip…" oninput="renderPacientes(this.value)" /></label><span id="patientsCount" class="listing-subtitle"></span></div>
            <div id="patientsList" class="patients-grid" aria-live="polite"></div>
          </section>
        </div>
      </div>`);
  }

  function injectConfigEnhancements() {
    const nav = document.querySelector('.config-navigation-list');
    if (nav && !document.querySelector('[data-config-nav="textos"]')) {
      const systemButton = nav.querySelector('[data-config-nav="sistema"]');
      systemButton?.insertAdjacentHTML('beforebegin', '<button class="config-nav-button" type="button" role="tab" aria-selected="false" aria-controls="configSnippetsSection" data-config-nav="textos" onclick="mostrarSeccionConfiguracion(\'textos\')"><span><svg class="ui-icon"><use href="#icon-text"></use></svg></span><span><strong>Textos clínicos</strong><small>Frases y hallazgos</small></span></button>');
    }
    const system = document.getElementById('configSystemSection');
    if (system && !document.getElementById('exportFullBackupButton')) {
      const actions = system.querySelector('.config-actions');
      actions?.insertAdjacentHTML('afterbegin', `
        <button id="exportFullBackupButton" class="config-action-tile featured" type="button" onclick="exportarRespaldoIntegral()"><span class="config-action-icon"><svg class="ui-icon"><use href="#icon-save"></use></svg></span><span><strong>Respaldar todo el sistema</strong><small>Incluye informes, pacientes, textos, plantillas, identidad y preferencias.</small></span><svg class="ui-icon config-action-arrow"><use href="#icon-chevron-right"></use></svg></button>
        <button class="config-action-tile" type="button" onclick="document.getElementById(\'importFullBackupInput\').click()"><span class="config-action-icon"><svg class="ui-icon"><use href="#icon-file-plus"></use></svg></span><span><strong>Restaurar respaldo integral</strong><small>Valida el archivo y conserva una copia automática previa.</small></span><svg class="ui-icon config-action-arrow"><use href="#icon-chevron-right"></use></svg></button>
        <input id="importFullBackupInput" class="hidden-file-input" type="file" accept="application/json,.json" onchange="importarRespaldoIntegral(this.files?.[0]);this.value=''" />
        <button class="config-action-tile" type="button" onclick="restaurarRespaldoAutomatico()"><span class="config-action-icon"><svg class="ui-icon"><use href="#icon-clock"></use></svg></span><span><strong>Recuperar copia automática</strong><small id="automaticBackupStatus">Preparando respaldo local seguro…</small></span><svg class="ui-icon config-action-arrow"><use href="#icon-chevron-right"></use></svg></button>`);
    }
    if (!document.getElementById('configSnippetsSection')) {
      system?.insertAdjacentHTML('beforebegin', `
        <section id="configSnippetsSection" class="config-section config-page" data-config-page="textos" role="tabpanel" aria-labelledby="configSnippetsTitle" hidden>
          <div class="config-section-head"><div><span class="config-eyebrow">Biblioteca clínica</span><h2 id="configSnippetsTitle" class="config-title">Textos y hallazgos reutilizables</h2><p class="config-subtitle">Crea frases frecuentes y utiliza variables como {paciente}, {fecha}, {especie} o {medico}.</p></div></div>
          <form id="snippetForm" class="snippet-form" onsubmit="guardarTextoClinico(event)"><input id="snippetEditId" type="hidden" /><label><span>Atajo</span><input id="snippetShortcut" class="config-input" maxlength="30" placeholder="higado-normal" required /></label><label><span>Título</span><input id="snippetTitle" class="config-input" maxlength="80" placeholder="Hígado sin alteraciones" required /></label><label class="snippet-content-field"><span>Texto clínico</span><textarea id="snippetContent" class="config-input" rows="5" placeholder="Escribe el contenido que insertarás en el informe…" required></textarea></label><div class="report-label-form-actions"><button class="config-btn" type="submit">Guardar texto</button><button class="config-btn secondary" type="button" onclick="limpiarFormularioTextoClinico()">Limpiar</button></div></form>
          <div id="snippetsList" class="snippets-list" aria-live="polite"></div>
        </section>`);
    }
  }

  function injectProductivityModals() {
    if (document.getElementById('patient-form-modal')) return;
    document.getElementById('app-message-modal')?.insertAdjacentHTML('beforebegin', `
      <div id="patient-form-modal" class="preview-modal" style="display:none" role="dialog" aria-modal="true" aria-labelledby="patientFormTitle"><div class="preview-backdrop" onclick="cerrarModalProducto('patient-form-modal')"></div><section class="productivity-dialog"><header><div><h2 id="patientFormTitle">Ficha del paciente</h2><p>Los datos podrán reutilizarse en informes posteriores.</p></div><button type="button" onclick="cerrarModalProducto('patient-form-modal')" aria-label="Cerrar">×</button></header><form id="patientForm" class="patient-form" onsubmit="guardarPaciente(event)"><input id="patientId" type="hidden" />${['paciente|Paciente','propietario|Tutor o propietario','especie|Especie','raza|Raza','edad|Edad','sexo|Sexo','estadoReproductivo|Estado reproductivo','correo|Correo','telefono|Teléfono','microchip|Microchip'].map((entry) => { const [id,label]=entry.split('|'); return `<label><span>${label}</span><input id="patient_${id}" class="config-input" ${id === 'paciente' ? 'required' : ''} /></label>`; }).join('')}<label class="patient-notes"><span>Notas</span><textarea id="patient_notas" class="config-input" rows="3"></textarea></label><footer><button class="editor-action-btn secondary" type="button" onclick="cerrarModalProducto('patient-form-modal')">Cancelar</button><button class="editor-action-btn" type="submit">Guardar paciente</button></footer></form></section></div>
      <div id="patient-selector-modal" class="preview-modal" style="display:none" role="dialog" aria-modal="true" aria-labelledby="patientSelectorTitle"><div class="preview-backdrop" onclick="cerrarModalProducto('patient-selector-modal')"></div><section class="productivity-dialog selector-productivity-dialog"><header><div><h2 id="patientSelectorTitle">Usar datos de un paciente</h2><p>Selecciona una ficha para completar los campos equivalentes.</p></div><button type="button" onclick="cerrarModalProducto('patient-selector-modal')" aria-label="Cerrar">×</button></header><label class="profiles-search"><span><svg class="ui-icon"><use href="#icon-search"></use></svg></span><input id="patientSelectorSearch" type="search" placeholder="Buscar paciente o tutor…" oninput="renderSelectorPacientes(this.value)" /></label><div id="patientSelectorList" class="selector-productivity-list"></div><footer><button class="editor-action-btn secondary" type="button" onclick="abrirFormularioPaciente()">Crear paciente</button></footer></section></div>
      <div id="snippet-selector-modal" class="preview-modal" style="display:none" role="dialog" aria-modal="true" aria-labelledby="snippetSelectorTitle"><div class="preview-backdrop" onclick="cerrarModalProducto('snippet-selector-modal')"></div><section class="productivity-dialog selector-productivity-dialog"><header><div><h2 id="snippetSelectorTitle">Insertar texto clínico</h2><p>El texto se insertará en el último campo clínico seleccionado.</p></div><button type="button" onclick="cerrarModalProducto('snippet-selector-modal')" aria-label="Cerrar">×</button></header><label class="profiles-search"><span><svg class="ui-icon"><use href="#icon-search"></use></svg></span><input id="snippetSelectorSearch" type="search" placeholder="Buscar título, atajo o contenido…" oninput="renderSelectorTextos(this.value)" /></label><div id="snippetSelectorList" class="selector-productivity-list"></div></section></div>
      <aside id="report-checklist" class="report-checklist" aria-label="Revisión del informe" aria-hidden="true"><header><div><span>Revisión clínica</span><h2>Antes de finalizar</h2></div><button type="button" onclick="cerrarChecklistInforme()" aria-label="Cerrar">×</button></header><div id="reportChecklistProgress" class="checklist-progress"></div><div id="reportChecklistItems" class="checklist-items"></div><footer><button class="editor-action-btn secondary" type="button" onclick="cerrarChecklistInforme()">Seguir editando</button><button id="checklistFinalizeButton" class="editor-action-btn" type="button" onclick="finalizarInformeClinico()">Finalizar informe</button></footer></aside>
      <div id="report-versions-modal" class="preview-modal" style="display:none" role="dialog" aria-modal="true" aria-labelledby="versionsTitle"><div class="preview-backdrop" onclick="cerrarModalProducto('report-versions-modal')"></div><section class="productivity-dialog selector-productivity-dialog"><header><div><h2 id="versionsTitle">Versiones del informe</h2><p>Compara fechas y restaura una copia como borrador.</p></div><button type="button" onclick="cerrarModalProducto('report-versions-modal')" aria-label="Cerrar">×</button></header><div id="reportVersionsList" class="selector-productivity-list"></div></section></div>
      <div id="patient-compare-modal" class="preview-modal" style="display:none" role="dialog" aria-modal="true" aria-labelledby="patientCompareTitle"><div class="preview-backdrop" onclick="cerrarModalProducto('patient-compare-modal')"></div><section class="productivity-dialog compare-dialog"><header><div><h2 id="patientCompareTitle">Comparar estudios</h2><p>Últimos dos informes del paciente.</p></div><button type="button" onclick="cerrarModalProducto('patient-compare-modal')" aria-label="Cerrar">×</button></header><div id="patientCompareContent" class="patient-compare-content"></div></section></div>
      <div id="pdf-success-modal" class="preview-modal" style="display:none" role="dialog" aria-modal="true" aria-labelledby="pdfSuccessTitle"><div class="preview-backdrop" onclick="cerrarModalProducto('pdf-success-modal')"></div><section class="productivity-dialog pdf-success-dialog"><header><div><h2 id="pdfSuccessTitle">PDF exportado correctamente</h2><p id="pdfSuccessPath"></p></div><button type="button" onclick="cerrarModalProducto('pdf-success-modal')" aria-label="Cerrar">×</button></header><div class="pdf-success-actions"><button class="editor-action-btn" type="button" onclick="abrirUltimoPDF()">Abrir PDF</button><button class="editor-action-btn secondary" type="button" onclick="mostrarUltimoPDFEnCarpeta()">Abrir carpeta</button><button class="editor-action-btn secondary" type="button" onclick="copiarRutaUltimoPDF()">Copiar ruta</button><button class="editor-action-btn secondary" type="button" onclick="exportarOtraCopiaPDF()">Exportar otra copia</button></div></section></div>`);
  }

  function showOnlyView(id) {
    document.querySelectorAll('body > div[id$="-view"]').forEach((view) => { view.style.display = view.id === id ? 'block' : 'none'; });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function getPatients() { return getJson(STORAGE.patients, []).map(core.normalizePatient); }
  function savePatients(patients) { setJson(STORAGE.patients, patients); }

  function showPacientes() {
    showOnlyView('pacientes-view');
    renderPacientes();
  }

  function patientReports(patient) {
    const reports = getJson('informesGuardados', []);
    const key = core.patientKey(patient);
    return reports.filter((report) => core.patientKey(report.datos || {}) === key).sort((a, b) => String(b.actualizado || '').localeCompare(String(a.actualizado || '')));
  }

  function renderPacientes(query = '') {
    const list = document.getElementById('patientsList');
    if (!list) return;
    const term = core.normalizeSearch(query);
    const patients = getPatients().filter((patient) => !term || core.normalizeSearch(Object.values(patient).join(' ')).includes(term)).sort((a, b) => a.paciente.localeCompare(b.paciente, 'es'));
    const count = document.getElementById('patientsCount');
    if (count) count.textContent = `${patients.length} paciente${patients.length === 1 ? '' : 's'}`;
    if (!patients.length) {
      list.innerHTML = '<div class="activity-empty"><strong>No hay pacientes para mostrar.</strong><span>Crea una ficha o guarda un informe para registrarla automáticamente.</span></div>';
      return;
    }
    list.innerHTML = patients.map((patient) => {
      const reports = patientReports(patient);
      return `<article class="patient-card"><div class="patient-card-main"><span class="patient-avatar">${escapeHtml(patient.paciente.slice(0, 1).toUpperCase())}</span><div><h3>${escapeHtml(patient.paciente)}</h3><p>${escapeHtml([patient.especie, patient.raza, patient.edad].filter(Boolean).join(' · ') || 'Sin datos clínicos')}</p><small>${escapeHtml(patient.propietario || 'Tutor no registrado')}${patient.microchip ? ` · ${escapeHtml(patient.microchip)}` : ''}</small></div></div><div class="patient-card-status"><strong>${reports.length}</strong><span>informe${reports.length === 1 ? '' : 's'}</span></div><div class="patient-card-actions"><button type="button" onclick="abrirFormularioPaciente('${patient.id}')">Editar</button><button type="button" onclick="usarPacienteEnNuevoInforme('${patient.id}')">Nuevo informe</button>${reports[0] ? `<button type="button" onclick="duplicarUltimoInformePaciente('${patient.id}')">Duplicar último</button>` : ''}${reports.length > 1 ? `<button type="button" onclick="compararInformesPaciente('${patient.id}')">Comparar</button>` : ''}<button class="is-danger" type="button" onclick="eliminarPaciente('${patient.id}')">Eliminar</button></div></article>`;
    }).join('');
  }

  function abrirFormularioPaciente(id = '') {
    const patient = getPatients().find((item) => item.id === id) || core.normalizePatient({ id: '' });
    document.getElementById('patientId').value = id || '';
    ['paciente','propietario','especie','raza','edad','sexo','estadoReproductivo','correo','telefono','microchip','notas'].forEach((field) => { const input = document.getElementById(`patient_${field}`); if (input) input.value = patient[field] || ''; });
    document.getElementById('patient-form-modal').style.display = 'flex';
    document.getElementById('patient_paciente')?.focus();
  }

  function guardarPaciente(event) {
    event.preventDefault();
    const id = document.getElementById('patientId').value;
    const candidate = { id };
    ['paciente','propietario','especie','raza','edad','sexo','estadoReproductivo','correo','telefono','microchip','notas'].forEach((field) => { candidate[field] = document.getElementById(`patient_${field}`)?.value || ''; });
    const current = getPatients();
    const existing = current.find((item) => item.id === id);
    const merged = core.mergePatient(current, { ...existing, ...candidate, id: id || undefined });
    savePatients(merged.patients);
    cerrarModalProducto('patient-form-modal');
    renderPacientes(document.getElementById('patientsSearch')?.value || '');
    renderSelectorPacientes(document.getElementById('patientSelectorSearch')?.value || '');
    notify(merged.created ? 'Paciente creado.' : 'Ficha del paciente actualizada.');
  }

  async function eliminarPaciente(id) {
    const patient = getPatients().find((item) => item.id === id);
    if (!patient) return;
    const ok = await confirmApp({ titulo: 'Eliminar ficha del paciente', mensaje: `Se eliminará la ficha de “${patient.paciente}”. Sus informes no se borrarán.`, tipo: 'danger', confirmar: 'Eliminar', cancelar: 'Conservar' });
    if (!ok) return;
    savePatients(getPatients().filter((item) => item.id !== id));
    renderPacientes(document.getElementById('patientsSearch')?.value || '');
  }

  function registerPatientFromReport(data = {}) {
    if (!core.cleanText(data.paciente)) return;
    const patients = getPatients();
    const existing = patients.find((item) => core.patientKey(item) === core.patientKey(data));
    const reportValues = Object.fromEntries(Object.entries(data).filter(([, value]) => core.cleanText(value)));
    const merged = core.mergePatient(patients, { ...existing, ...reportValues, id: existing?.id });
    savePatients(merged.patients);
  }

  function abrirSelectorPaciente() {
    document.getElementById('patient-selector-modal').style.display = 'flex';
    const search = document.getElementById('patientSelectorSearch');
    if (search) search.value = '';
    renderSelectorPacientes();
    search?.focus();
  }

  function renderSelectorPacientes(query = '') {
    const container = document.getElementById('patientSelectorList');
    if (!container) return;
    const term = core.normalizeSearch(query);
    const patients = getPatients().filter((patient) => !term || core.normalizeSearch(`${patient.paciente} ${patient.propietario} ${patient.especie} ${patient.microchip}`).includes(term));
    container.innerHTML = patients.length ? patients.map((patient) => `<button class="selector-productivity-item" type="button" onclick="aplicarPacienteAlInforme('${patient.id}')"><span><strong>${escapeHtml(patient.paciente)}</strong><small>${escapeHtml([patient.propietario, patient.especie, patient.raza].filter(Boolean).join(' · '))}</small></span><b>Usar</b></button>`).join('') : '<div class="activity-empty">No hay pacientes coincidentes.</div>';
  }

  function setReportField(field, value) {
    document.querySelectorAll(`#editor-view [data-report-field="${CSS.escape(field)}"]`).forEach((input) => {
      if ('value' in input) input.value = value || '';
      else input.textContent = value || '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  function aplicarPacienteAlInforme(id) {
    const patient = getPatients().find((item) => item.id === id);
    if (!patient) return;
    ['paciente','propietario','especie','raza','edad','sexo','estadoReproductivo','correo','telefono','microchip'].forEach((field) => setReportField(field, patient[field]));
    cerrarModalProducto('patient-selector-modal');
    notify(`Datos de ${patient.paciente} aplicados.`);
  }

  function usarPacienteEnNuevoInforme(id) {
    sessionStorage.setItem('pacientePendienteInforme', id);
    window.showDashboard();
    window.crearNuevoInforme();
  }

  function applyPendingPatient() {
    const id = sessionStorage.getItem('pacientePendienteInforme');
    if (!id || document.getElementById('editor-view')?.style.display === 'none') return;
    sessionStorage.removeItem('pacientePendienteInforme');
    window.setTimeout(() => aplicarPacienteAlInforme(id), 100);
  }

  function duplicarUltimoInformePaciente(id) {
    const patient = getPatients().find((item) => item.id === id);
    const report = patient && patientReports(patient)[0];
    if (!report) return;
    window.__appBridge?.duplicateReport(report.id);
  }

  function compararInformesPaciente(id) {
    const patient = getPatients().find((item) => item.id === id);
    const reports = patient ? patientReports(patient).slice(0, 2) : [];
    if (reports.length < 2) return notify('Se necesitan al menos dos informes para comparar.', 'info');
    const container = document.getElementById('patientCompareContent');
    container.innerHTML = reports.map((report, index) => `<section><span>${index === 0 ? 'Más reciente' : 'Anterior'}</span><h3>${escapeHtml(report.nombre || report.id)}</h3><small>${formatDate(report.actualizado || report.fecha, true)}</small><h4>Resultados</h4><p>${escapeHtml(report.datos?.resultados || report.datos?.hallazgos || 'Sin resultados registrados')}</p><h4>Conclusión</h4><p>${escapeHtml(report.datos?.conclusion || 'Sin conclusión registrada')}</p></section>`).join('');
    document.getElementById('patient-compare-modal').style.display = 'flex';
  }

  function getSnippets() { return getJson(STORAGE.snippets, []); }
  function saveSnippets(snippets) { setJson(STORAGE.snippets, snippets); }

  function renderTextosClinicos() {
    const list = document.getElementById('snippetsList');
    if (!list) return;
    const snippets = getSnippets().sort((a, b) => a.title.localeCompare(b.title, 'es'));
    list.innerHTML = snippets.length ? snippets.map((snippet) => `<article class="snippet-card"><div><code>/${escapeHtml(snippet.shortcut)}</code><h3>${escapeHtml(snippet.title)}</h3><p>${escapeHtml(snippet.content)}</p></div><span><button type="button" onclick="editarTextoClinico('${snippet.id}')">Editar</button><button class="is-danger" type="button" onclick="eliminarTextoClinico('${snippet.id}')">Eliminar</button></span></article>`).join('') : '<div class="activity-empty">Aún no hay textos clínicos guardados.</div>';
  }

  function guardarTextoClinico(event) {
    event.preventDefault();
    const id = document.getElementById('snippetEditId').value || core.createId('texto');
    const snippet = { id, shortcut: core.cleanText(document.getElementById('snippetShortcut').value).replace(/^\//, ''), title: core.cleanText(document.getElementById('snippetTitle').value), content: document.getElementById('snippetContent').value.trim(), updatedAt: new Date().toISOString() };
    const snippets = getSnippets();
    const duplicate = snippets.find((item) => item.id !== id && core.normalizeSearch(item.shortcut) === core.normalizeSearch(snippet.shortcut));
    if (duplicate) return notify(`El atajo /${snippet.shortcut} ya está asignado a “${duplicate.title}”.`, 'info');
    const index = snippets.findIndex((item) => item.id === id);
    if (index < 0) snippets.push(snippet); else snippets[index] = snippet;
    saveSnippets(snippets);
    limpiarFormularioTextoClinico();
    renderTextosClinicos();
    notify('Texto clínico guardado.');
  }

  function editarTextoClinico(id) {
    const snippet = getSnippets().find((item) => item.id === id);
    if (!snippet) return;
    document.getElementById('snippetEditId').value = snippet.id;
    document.getElementById('snippetShortcut').value = snippet.shortcut;
    document.getElementById('snippetTitle').value = snippet.title;
    document.getElementById('snippetContent').value = snippet.content;
    document.getElementById('snippetShortcut').focus();
  }

  async function eliminarTextoClinico(id) {
    const snippet = getSnippets().find((item) => item.id === id);
    if (!snippet) return;
    const ok = await confirmApp({ titulo: 'Eliminar texto clínico', mensaje: `Se eliminará “${snippet.title}”.`, tipo: 'danger', confirmar: 'Eliminar', cancelar: 'Conservar' });
    if (!ok) return;
    saveSnippets(getSnippets().filter((item) => item.id !== id));
    renderTextosClinicos();
  }

  function limpiarFormularioTextoClinico() {
    document.getElementById('snippetForm')?.reset();
    const id = document.getElementById('snippetEditId');
    if (id) id.value = '';
  }

  function abrirBibliotecaTextos() {
    document.getElementById('snippet-selector-modal').style.display = 'flex';
    const search = document.getElementById('snippetSelectorSearch');
    if (search) search.value = '';
    renderSelectorTextos();
    search?.focus();
  }

  function renderSelectorTextos(query = '') {
    const list = document.getElementById('snippetSelectorList');
    if (!list) return;
    const term = core.normalizeSearch(query);
    const snippets = getSnippets().filter((snippet) => !term || core.normalizeSearch(`${snippet.title} ${snippet.shortcut} ${snippet.content}`).includes(term));
    list.innerHTML = snippets.length ? snippets.map((snippet) => `<button class="selector-productivity-item" type="button" onclick="insertarTextoClinico('${snippet.id}')"><span><strong>${escapeHtml(snippet.title)}</strong><small>/${escapeHtml(snippet.shortcut)} · ${escapeHtml(snippet.content.slice(0, 100))}</small></span><b>Insertar</b></button>`).join('') : '<div class="activity-empty">No hay textos coincidentes. Créalo desde Configuración → Textos clínicos.</div>';
  }

  function replaceSnippetVariables(text) {
    const data = window.__appBridge?.getCurrentReportData() || {};
    const values = { paciente: data.paciente, fecha: data.fecha, especie: data.especie, propietario: data.propietario, medico: window.__appBridge?.getSettings()?.firmaSimple };
    return String(text).replace(/\{(paciente|fecha|especie|propietario|medico)\}/gi, (_, key) => values[key.toLowerCase()] || '');
  }

  function insertarTextoClinico(id) {
    const snippet = getSnippets().find((item) => item.id === id);
    if (!snippet) return;
    let target = activeSnippetTarget;
    if (!target?.isConnected) target = document.querySelector('#editor-view [data-report-field="resultados"], #editor-view .profile-rich-editor');
    if (!target) return notify('Selecciona primero un campo clínico del informe.', 'info');
    const text = replaceSnippetVariables(snippet.content);
    target.focus();
    if ('value' in target) {
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? start;
      target.setRangeText(text, start, end, 'end');
    } else {
      document.execCommand('insertText', false, text);
    }
    target.dispatchEvent(new Event('input', { bubbles: true }));
    cerrarModalProducto('snippet-selector-modal');
    notify('Texto clínico insertado.');
  }

  function expandSnippetShortcut(target) {
    if (!target || !('value' in target) || typeof target.selectionStart !== 'number') return;
    const cursor = target.selectionStart;
    const before = target.value.slice(0, cursor);
    const match = before.match(/(?:^|\s)\/([\p{L}\p{N}-]+)\s$/u);
    if (!match) return;
    const snippet = getSnippets().find((item) => core.normalizeSearch(item.shortcut) === core.normalizeSearch(match[1]));
    if (!snippet) return;
    const start = cursor - match[0].length + (match[0].startsWith('/') ? 0 : 1);
    target.setRangeText(replaceSnippetVariables(snippet.content), start, cursor, 'end');
    target.dispatchEvent(new Event('input', { bubbles: true }));
    notify(`Texto “${snippet.title}” insertado.`);
  }

  function currentChecklist() {
    const data = window.__appBridge?.getCurrentReportData() || {};
    const settings = window.__appBridge?.getSettings() || {};
    return core.reportChecklist(data, { hasVisibleBlocks: window.__appBridge?.hasVisibleReportBlocks() !== false, doctorName: settings.firmaSimple, doctorId: settings.rutMedico || settings.registroMedico, signatureReady: Boolean(settings.firmaDigital) });
  }

  function renderChecklist() {
    const checklist = currentChecklist();
    const progress = document.getElementById('reportChecklistProgress');
    const items = document.getElementById('reportChecklistItems');
    if (progress) progress.innerHTML = `<div><strong>${checklist.completed} de ${checklist.total}</strong><span>requisitos completos</span></div><span class="checklist-progress-track"><i style="width:${Math.round((checklist.completed / Math.max(1, checklist.total)) * 100)}%"></i></span>`;
    if (items) items.innerHTML = checklist.items.map((item) => `<button class="checklist-item ${item.ok ? 'is-ok' : item.required ? 'is-missing' : 'is-optional'}" type="button" ${item.field ? `onclick="enfocarCampoChecklist('${item.field}')"` : 'disabled'}><span>${item.ok ? '✓' : item.required ? '!' : '·'}</span><span><strong>${escapeHtml(item.label)}</strong><small>${item.ok ? 'Listo' : item.required ? 'Requiere revisión' : 'Opcional'}</small></span></button>`).join('');
    const finalize = document.getElementById('checklistFinalizeButton');
    if (finalize) finalize.disabled = !checklist.ready;
    return checklist;
  }

  function abrirChecklistInforme() {
    const drawer = document.getElementById('report-checklist');
    if (!drawer) return;
    renderChecklist();
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function cerrarChecklistInforme() {
    const drawer = document.getElementById('report-checklist');
    drawer?.classList.remove('is-open');
    drawer?.setAttribute('aria-hidden', 'true');
  }

  function enfocarCampoChecklist(field) {
    cerrarChecklistInforme();
    const target = document.querySelector(`#editor-view [data-report-field="${CSS.escape(field)}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus();
  }

  function guardarBorradorDesdeBarra() {
    window.guardarBorradorInforme(false);
    notify('Borrador guardado.');
  }

  async function finalizarInformeClinico() {
    const checklist = renderChecklist();
    if (!checklist.ready) {
      abrirChecklistInforme();
      notify('Completa los requisitos marcados antes de finalizar.', 'info');
      return;
    }
    const ok = await confirmApp({ titulo: 'Finalizar informe', mensaje: 'El informe quedará marcado como Completado. Podrás editarlo después y se conservarán sus versiones anteriores.', confirmar: 'Finalizar', cancelar: 'Seguir editando' });
    if (!ok) return;
    window.__appBridge?.finalizeCurrentReport();
    cerrarChecklistInforme();
    notify('Informe finalizado. Ya puedes exportarlo a PDF.');
  }

  function getRevisions() { return getJson(STORAGE.revisions, {}); }
  function saveRevisions(revisions) { setJson(STORAGE.revisions, revisions); }

  function registerReportRevision(report, reason) {
    if (!report?.id) return;
    const revisions = getRevisions();
    const current = revisions[report.id] || [];
    const latest = current[0]?.snapshot;
    if (latest && core.reportsEqual(latest, report)) return;
    const revision = core.createRevision(report, reason);
    if (!revision) return;
    revisions[report.id] = [revision, ...current].slice(0, 20);
    saveRevisions(revisions);
  }

  function mostrarVersionesInforme() {
    const id = window.__appBridge?.getCurrentReportId();
    const modal = document.getElementById('report-versions-modal');
    const list = document.getElementById('reportVersionsList');
    if (!modal || !list) return;
    const revisions = (getRevisions()[id] || []);
    list.innerHTML = revisions.length ? revisions.map((revision, index) => `<article class="version-item"><span><strong>Versión ${revisions.length - index}</strong><small>${escapeHtml(revision.reason)} · ${formatDate(revision.createdAt, true)}</small><details><summary>Ver contenido para comparar</summary><p><b>Resultados:</b> ${escapeHtml(revision.snapshot?.datos?.resultados || revision.snapshot?.datos?.hallazgos || 'Sin contenido')}</p><p><b>Conclusión:</b> ${escapeHtml(revision.snapshot?.datos?.conclusion || 'Sin contenido')}</p></details></span><button type="button" onclick="restaurarVersionInforme('${revision.revisionId}')">Restaurar como borrador</button></article>`).join('') : '<div class="activity-empty">Este informe aún no tiene versiones anteriores.</div>';
    modal.style.display = 'flex';
  }

  async function restaurarVersionInforme(revisionId) {
    const id = window.__appBridge?.getCurrentReportId();
    const revision = (getRevisions()[id] || []).find((item) => item.revisionId === revisionId);
    if (!revision) return;
    const ok = await confirmApp({ titulo: 'Restaurar versión', mensaje: 'La versión actual se conservará en el historial y la copia elegida se abrirá como borrador.', confirmar: 'Restaurar', cancelar: 'Cancelar' });
    if (!ok) return;
    window.__appBridge?.restoreReportRevision(revision.snapshot);
    cerrarModalProducto('report-versions-modal');
  }

  function collectStorageEntries() {
    const entries = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || key === STORAGE.backupMeta) continue;
      entries[key] = localStorage.getItem(key);
    }
    return entries;
  }

  function createFullBackup() {
    return core.createBackup(collectStorageEntries(), { appVersion: '1.0.0', platform: navigator.platform, patients: getPatients().length, reports: getJson('informesGuardados', []).length });
  }

  function downloadJson(value, name) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportarRespaldoIntegral() {
    const backup = createFullBackup();
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(backup, `respaldo-generador-informes-${date}.json`);
    localStorage.setItem(STORAGE.backupMeta, JSON.stringify({ createdAt: backup.createdAt, checksum: backup.checksum }));
    updateAutomaticBackupStatus();
    notify('Respaldo integral exportado.');
  }

  async function importarRespaldoIntegral(file) {
    if (!file) return;
    let backup;
    try { backup = JSON.parse(await file.text()); } catch (_) { return notify('El archivo no contiene JSON válido.', 'danger'); }
    const validation = core.validateBackup(backup);
    if (!validation.ok) return notify(validation.error, 'danger');
    const ok = await confirmApp({ titulo: 'Restaurar respaldo integral', mensaje: `Se restaurará el respaldo del ${formatDate(backup.createdAt, true)}. Los datos actuales se guardarán primero como copia automática.`, tipo: 'danger', confirmar: 'Restaurar', cancelar: 'Cancelar' });
    if (!ok) return;
    await saveAutomaticBackup('before-import');
    localStorage.clear();
    Object.entries(backup.entries).forEach(([key, value]) => localStorage.setItem(key, value));
    localStorage.setItem(STORAGE.backupMeta, JSON.stringify({ restoredAt: new Date().toISOString(), sourceCreatedAt: backup.createdAt }));
    window.location.reload();
  }

  function openBackupDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(BACKUP_DB, 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(BACKUP_STORE)) request.result.createObjectStore(BACKUP_STORE, { keyPath: 'id' }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveAutomaticBackup(reason = 'automatic') {
    const backup = createFullBackup();
    if (window.electronAPI?.guardarRespaldoAutomatico) {
      const result = await window.electronAPI.guardarRespaldoAutomatico(backup);
      if (!result?.ok) throw new Error(result?.error || 'No se pudo guardar la copia automática.');
      localStorage.setItem(STORAGE.backupMeta, JSON.stringify({ createdAt: result.savedAt || backup.createdAt, automatic: true, checksum: backup.checksum, storage: 'file' }));
      updateAutomaticBackupStatus();
      return;
    }
    if (!window.indexedDB) return;
    const db = await openBackupDb();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(BACKUP_STORE, 'readwrite');
      transaction.objectStore(BACKUP_STORE).put({ id: 'latest', reason, savedAt: new Date().toISOString(), backup });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    localStorage.setItem(STORAGE.backupMeta, JSON.stringify({ createdAt: backup.createdAt, automatic: true, checksum: backup.checksum }));
    updateAutomaticBackupStatus();
  }

  async function getAutomaticBackup() {
    if (window.electronAPI?.cargarRespaldoAutomatico) {
      const result = await window.electronAPI.cargarRespaldoAutomatico();
      return result?.ok ? result.data : null;
    }
    if (!window.indexedDB) return null;
    const db = await openBackupDb();
    const result = await new Promise((resolve, reject) => {
      const request = db.transaction(BACKUP_STORE, 'readonly').objectStore(BACKUP_STORE).get('latest');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return result;
  }

  function scheduleAutomaticBackup() {
    window.clearTimeout(backupTimer);
    backupTimer = window.setTimeout(() => saveAutomaticBackup().catch((error) => console.warn('No fue posible crear el respaldo integral automático:', error)), 1200);
  }

  async function restaurarRespaldoAutomatico() {
    const stored = await getAutomaticBackup();
    if (!stored?.backup) return notify('Todavía no existe una copia automática.', 'info');
    const validation = core.validateBackup(stored.backup);
    if (!validation.ok) return notify(validation.error, 'danger');
    const ok = await confirmApp({ titulo: 'Recuperar copia automática', mensaje: `Se restaurará la copia del ${formatDate(stored.savedAt, true)} y la aplicación se reiniciará.`, tipo: 'danger', confirmar: 'Recuperar', cancelar: 'Cancelar' });
    if (!ok) return;
    localStorage.clear();
    Object.entries(stored.backup.entries).forEach(([key, value]) => localStorage.setItem(key, value));
    window.location.reload();
  }

  function updateAutomaticBackupStatus() {
    const status = document.getElementById('automaticBackupStatus');
    if (!status) return;
    const meta = getJson(STORAGE.backupMeta, null);
    status.textContent = meta?.createdAt ? `Última copia local: ${formatDate(meta.createdAt, true)}.` : 'Se crea automáticamente al guardar cambios.';
  }

  function showPdfSuccess(path) {
    lastPdfPath = path || '';
    const modal = document.getElementById('pdf-success-modal');
    const output = document.getElementById('pdfSuccessPath');
    if (output) output.textContent = lastPdfPath;
    if (modal) modal.style.display = 'flex';
  }

  function abrirUltimoPDF() { if (lastPdfPath) window.electronAPI?.abrirRuta(lastPdfPath); }
  function mostrarUltimoPDFEnCarpeta() { if (lastPdfPath) window.electronAPI?.mostrarEnCarpeta(lastPdfPath); }
  async function copiarRutaUltimoPDF() { if (lastPdfPath) { await navigator.clipboard.writeText(lastPdfPath); notify('Ruta copiada.'); } }
  function exportarOtraCopiaPDF() { cerrarModalProducto('pdf-success-modal'); window.guardarInformePDF(); }

  function alternarModoDisenadorProducto() {
    const next = document.documentElement.dataset.designerMode === 'advanced' ? 'basic' : 'advanced';
    applyDesignerMode(next);
  }

  function applyDesignerMode(mode = localStorage.getItem(STORAGE.designerMode) || 'basic') {
    const safe = mode === 'advanced' ? 'advanced' : 'basic';
    document.documentElement.dataset.designerMode = safe;
    localStorage.setItem(STORAGE.designerMode, safe);
    const button = document.getElementById('designerModeToggle');
    if (button) button.textContent = safe === 'advanced' ? 'Modo avanzado' : 'Modo básico';
  }

  function setDesignerZoom(value) {
    const zoom = Math.max(0.5, Math.min(1.4, Number(value) || 1));
    const canvas = document.getElementById('designerBlocks');
    if (canvas) canvas.style.zoom = String(zoom);
    const label = document.getElementById('designerZoomLabel');
    if (label) label.textContent = `${Math.round(zoom * 100)}%`;
    sessionStorage.setItem('designerZoom', String(zoom));
  }

  function cambiarZoomDisenador(delta) {
    setDesignerZoom(Number(sessionStorage.getItem('designerZoom') || 1) + Number(delta || 0));
  }

  function ajustarZoomDisenador() {
    const canvas = document.getElementById('designerBlocks');
    const workspace = document.querySelector('.template-designer-layout');
    if (!canvas || !workspace) return;
    canvas.style.zoom = '1';
    const available = workspace.clientWidth - (document.querySelector('.designer-toolbox')?.offsetWidth || 0) - 70;
    setDesignerZoom(Math.min(1, available / Math.max(1, canvas.scrollWidth)));
  }

  function cerrarModalProducto(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
  }

  function refreshProductivityUI() {
    renderTextosClinicos();
    updateAutomaticBackupStatus();
    renderContinueDraft();
    applyPendingPatient();
    if (document.getElementById('report-checklist')?.classList.contains('is-open')) renderChecklist();
  }

  function renderContinueDraft() {
    const drafts = getJson('informesGuardados', []).filter((report) => report.estado === 'Borrador').sort((a, b) => String(b.actualizado || '').localeCompare(String(a.actualizado || '')));
    const button = document.getElementById('continueDraftQuickAction');
    if (!button) return;
    button.hidden = !drafts.length;
    button.dataset.reportId = drafts[0]?.id || '';
    const caption = document.getElementById('continueDraftCaption');
    if (caption && drafts[0]) caption.textContent = `${drafts[0].nombre || 'Informe'} · ${formatDate(drafts[0].actualizado)}`;
  }

  function continuarUltimoBorrador() {
    const id = document.getElementById('continueDraftQuickAction')?.dataset.reportId;
    if (id) window.abrirInforme(id);
  }

  function handleFileDrop(event) {
    if (document.getElementById('editor-view')?.style.display === 'none') return;
    const files = Array.from(event.dataTransfer?.files || []).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;
    event.preventDefault();
    const input = document.getElementById('imagenesInformeInput');
    if (!input) return;
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function init() {
    ensureProductivityUI();
    applyDesignerMode();
    renderTextosClinicos();
    renderContinueDraft();
    updateAutomaticBackupStatus();
    scheduleAutomaticBackup();
    navigator.storage?.persist?.().catch(() => {});
    document.addEventListener('focusin', (event) => { if (event.target.matches?.('#editor-view [data-report-field], #editor-view .profile-rich-editor')) activeSnippetTarget = event.target; });
    document.addEventListener('input', (event) => {
      if (!event.target.closest?.('#editor-view')) return;
      expandSnippetShortcut(event.target);
      if (document.getElementById('report-checklist')?.classList.contains('is-open')) renderChecklist();
    }, true);
    document.addEventListener('dragover', (event) => { if (document.getElementById('editor-view')?.style.display !== 'none' && Array.from(event.dataTransfer?.items || []).some((item) => item.type.startsWith('image/'))) event.preventDefault(); });
    document.addEventListener('drop', handleFileDrop);
    window.addEventListener('beforeunload', () => { if (backupTimer) saveAutomaticBackup().catch(() => {}); });
    window.setInterval(scheduleAutomaticBackup, 60000);
  }

  Object.assign(window, {
    showPacientes,
    renderPacientes,
    abrirFormularioPaciente,
    guardarPaciente,
    eliminarPaciente,
    abrirSelectorPaciente,
    renderSelectorPacientes,
    aplicarPacienteAlInforme,
    usarPacienteEnNuevoInforme,
    duplicarUltimoInformePaciente,
    compararInformesPaciente,
    guardarTextoClinico,
    editarTextoClinico,
    eliminarTextoClinico,
    limpiarFormularioTextoClinico,
    abrirBibliotecaTextos,
    renderSelectorTextos,
    insertarTextoClinico,
    abrirChecklistInforme,
    cerrarChecklistInforme,
    enfocarCampoChecklist,
    guardarBorradorDesdeBarra,
    finalizarInformeClinico,
    mostrarVersionesInforme,
    restaurarVersionInforme,
    exportarRespaldoIntegral,
    importarRespaldoIntegral,
    restaurarRespaldoAutomatico,
    showPdfSuccess,
    abrirUltimoPDF,
    mostrarUltimoPDFEnCarpeta,
    copiarRutaUltimoPDF,
    exportarOtraCopiaPDF,
    alternarModoDisenadorProducto,
    cambiarZoomDisenador,
    ajustarZoomDisenador,
    cerrarModalProducto,
    continuarUltimoBorrador,
    registrarPacienteDesdeDatos: registerPatientFromReport,
    registrarRevisionInforme: registerReportRevision,
    programarRespaldoIntegralAutomatico: scheduleAutomaticBackup,
    refrescarMejorasProducto: refreshProductivityUI
  });

  init();
})();

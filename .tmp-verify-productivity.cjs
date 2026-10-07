const fs = require('fs');
const http = require('http');

function getJson(url) {
  return new Promise((resolve, reject) => http.get(url, (response) => {
    let body = '';
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve(JSON.parse(body)));
  }).on('error', reject));
}

async function main() {
  const [page] = await getJson('http://127.0.0.1:9335/json/list');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  const pending = new Map();
  const diagnostics = [];
  let id = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') diagnostics.push({ type: 'exception', value: message.params.exceptionDetails.text });
    if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) diagnostics.push({ type: message.params.type, value: message.params.args.map((arg) => arg.value || arg.description).join(' ') });
    if (!message.id || !pending.has(message.id)) return;
    const callbacks = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) callbacks.reject(new Error(message.error.message)); else callbacks.resolve(message.result);
  };
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  await send('Runtime.enable');
  await new Promise((resolve) => setTimeout(resolve, 800));
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(`${result.exceptionDetails.text}: ${result.exceptionDetails.exception?.description || result.exceptionDetails.exception?.value || ''}`);
    return result.result.value;
  };
  const capture = async (name) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(name, Buffer.from(result.data, 'base64'));
  };
  const checks = {};
  checks.dashboard = await evaluate(`({
    summaries: document.querySelectorAll('.summary-card').length,
    pendingExport: Boolean(document.getElementById('pendingExportCount')),
    quickActions: document.querySelectorAll('.quick-actions .action-card').length,
    bridge: typeof window.__appBridge,
    core: typeof window.AppCore,
    backup: typeof window.exportarRespaldoIntegral,
    patients: typeof window.showPacientes,
    snippets: typeof window.insertarTextoClinico,
    checklist: typeof window.finalizarInformeClinico,
    appVisible: getComputedStyle(document.getElementById('dashboard-view')).display
  })`);
  await capture('.tmp-productivity-dashboard.png');
  checks.patients = await evaluate(`showPacientes(); abrirFormularioPaciente(); document.getElementById('patient_paciente').value='Luna'; document.getElementById('patient_propietario').value='Ana'; document.getElementById('patient_especie').value='Canino'; document.getElementById('patient_raza').value='Mestiza'; document.getElementById('patient_microchip').value='CHIP-001'; guardarPaciente(new Event('submit')); ({ visible: getComputedStyle(document.getElementById('pacientes-view')).display, cards: document.querySelectorAll('.patient-card').length, stored: JSON.parse(localStorage.getItem('pacientesClinicos') || '[]').length })`);
  await capture('.tmp-productivity-patients.png');
  checks.config = await evaluate(`showConfiguracion(); mostrarSeccionConfiguracion('textos'); ({ active: document.querySelector('[data-config-page].is-active')?.dataset.configPage, navItems: document.querySelectorAll('[data-config-nav]').length, snippetForm: Boolean(document.getElementById('snippetForm')), fullBackup: Boolean(document.getElementById('exportFullBackupButton')) })`);
  await capture('.tmp-productivity-config.png');
  checks.workflow = await evaluate(`(async () => {
    document.getElementById('snippetShortcut').value='control';
    document.getElementById('snippetTitle').value='Control clínico';
    document.getElementById('snippetContent').value='Paciente {paciente}: hallazgos de control.';
    guardarTextoClinico(new Event('submit'));
    showConfiguracion(); mostrarSeccionConfiguracion('identidad');
    document.getElementById('firmaSimpleInput').value='Dra. Prueba';
    document.getElementById('rutMedicoInput').value='12.345.678-5';
    guardarCredenciales();
    showEditor();
    const patient=JSON.parse(localStorage.getItem('pacientesClinicos'))[0];
    aplicarPacienteAlInforme(patient.id);
    const set=(key,value)=>{ const field=document.querySelector('#editor-view [data-report-field="'+key+'"]'); field.value=value; field.dispatchEvent(new Event('input',{bubbles:true})); return field; };
    set('fecha','28-08-2026'); set('conclusion','Sin alteraciones significativas');
    const results=set('resultados','Evaluación inicial. '); results.focus(); results.setSelectionRange(results.value.length,results.value.length);
    insertarTextoClinico(JSON.parse(localStorage.getItem('textosClinicos'))[0].id);
    guardarBorradorDesdeBarra();
    set('resultados',document.querySelector('[data-report-field="resultados"]').value+' Control final.');
    window.__appBridge.finalizeCurrentReport();
    const reports=JSON.parse(localStorage.getItem('informesGuardados')||'[]');
    const revisions=JSON.parse(localStorage.getItem('revisionesInformes')||'{}');
    abrirChecklistInforme();
    return { snippets:JSON.parse(localStorage.getItem('textosClinicos')).length, reportStatus:reports[0]?.estado, revisions:(revisions[reports[0]?.id]||[]).length, checklistItems:document.querySelectorAll('.checklist-item').length, checklistMissing:document.querySelectorAll('.checklist-item.is-missing').length, patientName:reports[0]?.datos?.paciente };
  })()`);
  await capture('.tmp-productivity-checklist.png');
  await evaluate('cerrarChecklistInforme(); showDashboard()');
  await capture('.tmp-productivity-dashboard-data.png');
  checks.designerMode = await evaluate(`(() => { cambiarVista('designer'); alternarModoDisenadorProducto(); const firstMode=document.documentElement.dataset.designerMode; cambiarZoomDisenador(-0.1); const zoomValue=document.getElementById('designerZoomLabel')?.textContent; alternarModoDisenadorProducto(); return { first:firstMode, second:document.documentElement.dataset.designerMode, zoom:zoomValue, controls:Boolean(document.querySelector('.designer-zoom-controls')) }; })()`);
  checks.storage = await evaluate(`new Promise((resolve) => setTimeout(async () => { const automatic=await window.electronAPI.cargarRespaldoAutomatico(); resolve({ patients: JSON.parse(localStorage.getItem('pacientesClinicos') || '[]').length, backupMeta: Boolean(localStorage.getItem('respaldoIntegralMetadata')), automaticBackup:Boolean(automatic?.ok && automatic?.data?.backup) }); }, 2200))`);
  await evaluate('showDashboard()');
  await new Promise((resolve) => setTimeout(resolve, 400));
  console.log(JSON.stringify({ checks, diagnostics }, null, 2));
  socket.close();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

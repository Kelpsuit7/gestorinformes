// Interacciones basicas del dashboard en JavaScript vanilla.

let perfilesInformes = [];
let coleccionesPlantillas = [];
let etiquetasInformes = [];
let coleccionPlantillasActivaId = 'todas';
let busquedaPlantillas = '';
let perfilArrastradoId = null;
let perfilesArrastradosIds = [];
let plantillasSeleccionadasIds = new Set();
let indicadorArrastrePlantillas = null;
let operacionColeccion = { tipo: null, coleccionId: null };
let rangoEditorEnriquecido = null;
let timerEstadoGuardadoWord = null;
let estadoTransferenciaPlantillas = { modo: null, plantillas: [], colecciones: [], etiquetas: [], seleccionadas: new Set(), busqueda: '' };
let tutorialInteractivoActivo = null;
let elementoFocoAntesTutorial = null;
let coloresRecientesDisenador = [];
let sesionDisenadorPlantilla = null;
let perfilNuevoPendienteId = null;
let permitirPersistenciaDisenador = false;
let operacionModalPerfil = { tipo: 'crear', perfilId: null };
let estadoInicialContenidoInforme = null;
let seccionConfiguracionActiva = 'apariencia';
const paginasListados = { dashboard: 1, plantillas: 1, historial: 1, papelera: 1 };
const TAMANOS_PAGINA = { dashboard: 6, plantillas: 9, historial: 8, papelera: 8 };
const IMAGENES_POR_PAGINA = 6;
const ALTO_ENCABEZADO_IMAGENES = 44;
const ESPACIO_ENCABEZADO_IMAGENES = 4;
const SEPARACION_CUADRICULA_IMAGENES = 8;
// Estado base de la app; al iniciar esta vacio para representar "empty states".
const estadoDashboard = {
  informes: [],
  papeleraInformes: []
};

let informeActivoId = null;
let informeActivoCreadoEn = null;
let informeSeleccionadoDashboardId = null;
let modoVistaPrevia = 'pdf';
let ultimaLineaDiplomadosActiva = null;
let resolverConfirmacionBorrador = null;
let tipoDiplomadosActivo = null;
let borradorDiplomadosModal = null;
let historialDeshacerEditor = [];
let historialRehacerEditor = [];
let aplicandoSnapshotEditor = false;
let seleccionFormatoTexto = null;
let bloqueDisenadorSeleccionadoId = null;
let bloquesDisenadorSeleccionados = new Set();
let timerAutoguardadoDisenador = null;
let recuperacionDisenadorRevisadaId = null;
let timerAutoguardadoInforme = null;
let sincronizandoCamposInteligentes = false;
const timersRepaginacion = {}; // Debounce timers for repagination
const ajustesApp = {
  tema: 'huellitas',
  modoTema: 'claro',
  firmaModo: 'simple',
  firmaDigital: '',
  firmaSimple: '',
  rutMedico: '',
  registroMedico: '',
  logoClinica: '',
  direccionClinica: '',
  telefonoClinica: '',
  diplomadosPrincipal: '',
  diplomadosLateral: '',
  diplomadosCursados: [],
  diplomadosEnCurso: []
};

const TEMAS_APLICACION = {
  huellitas: { nombre: 'Huellitas', colorBarra: '#314b46' },
  oceano: { nombre: 'Océano', colorBarra: '#164e63' },
  lavanda: { nombre: 'Lavanda', colorBarra: '#493c77' },
  terracota: { nombre: 'Terracota', colorBarra: '#684137' },
  cerezo: { nombre: 'Cerezo', colorBarra: '#754359' },
  ambar: { nombre: 'Ámbar', colorBarra: '#6f4d1d' }
};

const informeBase = {
  paciente: '',
  especie: '',
  raza: '',
  edad: '',
  propietario: '',
  fecha: '',
  sexo: '',
  correo: '',
  estadoReproductivo: '',
  medico: '',
  rutMedico: '',
  registroMedico: '',
  antecedentes: '',
  resultados: '',
  conclusion: '',
  observaciones: '',
  imagenes: []
};

const CAMPOS_PORTADA = ['fecha', 'especie', 'paciente', 'raza', 'propietario', 'sexo', 'correo', 'estadoReproductivo', 'edad'];
let informeLayoutActivo = crearLayoutInformeVacio();

function crearLayoutInformeVacio() {
  return {
    paginasEliminadas: [],
    ordenPaginas: [],
    camposPortadaEliminados: [],
    perfilId: null,
    perfilNombre: '',
    identificadorPlantilla: { colorFondo: '#4c626c', colorTexto: '#ffffff' },
    hoja: { colorFondo: '#ffffff', colorEnfasis: '#66bc00' },
    datosPaciente: {},
    ajustesImagenes: [],
    paginas: [],
    bloques: []
  };
}

function normalizarLayoutInforme(layout) {
  const base = crearLayoutInformeVacio();
  if (!layout || typeof layout !== 'object') return base;
  return {
    paginasEliminadas: Array.isArray(layout.paginasEliminadas) ? layout.paginasEliminadas.filter(Boolean) : [],
    ordenPaginas: Array.isArray(layout.ordenPaginas) ? layout.ordenPaginas.filter(Boolean) : [],
    camposPortadaEliminados: Array.isArray(layout.camposPortadaEliminados) ? layout.camposPortadaEliminados.filter(Boolean) : [],
    perfilId: layout.perfilId || null,
    perfilNombre: String(layout.perfilNombre || ''),
    identificadorPlantilla: normalizarIdentificadorPlantilla(layout.identificadorPlantilla),
    hoja: normalizarEstiloHoja(layout.hoja),
    datosPaciente: layout.datosPaciente && typeof layout.datosPaciente === 'object' ? clonarProfundo(layout.datosPaciente) : {},
    ajustesImagenes: Array.isArray(layout.ajustesImagenes) ? layout.ajustesImagenes.map((ajuste) => ({
      rotacion: [0, 90, 180, 270].includes(Number(ajuste?.rotacion)) ? Number(ajuste.rotacion) : 0,
      ajuste: ajuste?.ajuste === 'contain' ? 'contain' : 'cover',
      posicionX: Math.max(0, Math.min(100, Number.isFinite(Number(ajuste?.posicionX)) ? Number(ajuste.posicionX) : 50)),
      posicionY: Math.max(0, Math.min(100, Number.isFinite(Number(ajuste?.posicionY)) ? Number(ajuste.posicionY) : 50))
    })) : [],
    paginas: Array.isArray(layout.paginas) ? clonarProfundo(layout.paginas) : [],
    bloques: normalizarCapasBloques(Array.isArray(layout.bloques) ? clonarProfundo(layout.bloques) : []),
    imagenesPerfil: Array.isArray(layout.imagenesPerfil) ? layout.imagenesPerfil.filter(Boolean) : []
  };
}

function clonarProfundo(valor) {
  if (typeof structuredClone === 'function') return structuredClone(valor);
  return JSON.parse(JSON.stringify(valor));
}

function obtenerEspecialidadInforme() {
  const subtitulo = document.querySelector('#editor-view .cover-title-block p');
  const texto = subtitulo ? subtitulo.textContent : '';
  return String(texto || 'Ecografico').replace(/\s+/g, ' ').trim() || 'Ecografico';
}

function sanitizarParteNombreArchivo(valor, fallback) {
  const limpio = String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return limpio || fallback;
}

function normalizarFechaNombreArchivo(valor) {
  const fecha = obtenerFechaDesdeValor(valor);
  if (fecha) return formatearFechaPlanoNombreArchivo(fecha);
  return sanitizarParteNombreArchivo(valor, formatearFechaPlanoNombreArchivo(new Date()));
}

function crearNombreSugeridoInforme(datos) {
  return `${crearBaseNombreInforme(datos)}.pdf`;
}

function crearIdentificadorInforme(datos, horaCreacion = obtenerHoraCreacionInformeActivo()) {
  return `${crearBaseNombreInforme(datos)}-${normalizarHoraNombreArchivo(horaCreacion)}`;
}

function crearBaseNombreInforme(datos) {
  const paciente = sanitizarParteNombreArchivo(datos && datos.paciente, 'paciente');
  const nombreInforme = sanitizarParteNombreArchivo(
    informeLayoutActivo?.perfilNombre || obtenerEspecialidadInforme(),
    'informe'
  );
  const fecha = normalizarFechaNombreArchivo(datos && datos.fecha);
  return `${paciente}-${nombreInforme}-${fecha}`;
}

function esIdentificadorTemporalInforme(id) {
  return !id || /^INF-\d+$/.test(String(id));
}

function obtenerNumeroIdentificadorDesdeInformeId(id) {
  const coincidencia = String(id || '').match(/-(\d+)$/);
  if (!coincidencia) return null;
  const numero = Number.parseInt(coincidencia[1], 10);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function obtenerHoraCreacionInformeActivo() {
  const fecha = obtenerFechaDesdeValor(informeActivoCreadoEn) || new Date();
  return formatearHoraPlanoNombreArchivo(fecha);
}

function normalizarHoraNombreArchivo(valor) {
  const horaPlana = String(valor || '').match(/^(\d{1,2})(\d{2})$/);
  if (horaPlana) {
    return `${String(horaPlana[1]).padStart(2, '0')}${horaPlana[2]}`;
  }
  const fecha = obtenerFechaDesdeValor(valor);
  if (fecha) {
    return formatearHoraPlanoNombreArchivo(fecha);
  }
  const texto = String(valor || '').match(/(\d{1,2})[:\-](\d{2})/);
  if (texto) {
    return `${String(texto[1]).padStart(2, '0')}${texto[2]}`;
  }
  return obtenerHoraCreacionInformeActivo();
}

function prepararIdentificadorActivoInforme(datos, horaCreacionPreferida = null) {
  const idAnterior = informeActivoId;
  const numeroExistente = obtenerNumeroIdentificadorDesdeInformeId(idAnterior);
  if (idAnterior && !esIdentificadorTemporalInforme(idAnterior) && !horaCreacionPreferida) {
    return {
      idAnterior,
      idNuevo: idAnterior,
      numero: numeroExistente,
      horaCreacion: obtenerHoraCreacionInformeActivo()
    };
  }
  const horaCreacion = horaCreacionPreferida || obtenerHoraCreacionInformeActivo();
  const idNuevo = crearIdentificadorInforme(datos, horaCreacion);
  informeActivoId = idNuevo;
  return {
    idAnterior,
    idNuevo,
    numero: numeroExistente,
    horaCreacion
  };
}

function cargarInformesGuardados() {
  try {
    const informes = JSON.parse(localStorage.getItem('informesGuardados') || '[]');
    estadoDashboard.informes = Array.isArray(informes) ? informes : [];
  } catch (error) {
    estadoDashboard.informes = [];
  }

  try {
    const papeleraInformes = JSON.parse(localStorage.getItem('papeleraInformes') || '[]');
    estadoDashboard.papeleraInformes = Array.isArray(papeleraInformes) ? papeleraInformes : [];
  } catch (error) {
    estadoDashboard.papeleraInformes = [];
  }
}

function persistirInformes() {
  localStorage.setItem('informesGuardados', JSON.stringify(estadoDashboard.informes));
  localStorage.setItem('papeleraInformes', JSON.stringify(estadoDashboard.papeleraInformes));
  window.programarRespaldoIntegralAutomatico?.();
}

/**
 * =============================================================================
 * SECCIÓN 2: GESTIÓN DE PERFILES DE INFORMES
 * Lógica para cargar, inicializar y gestionar los perfiles (plantillas).
 * =============================================================================
 */

function cargarPerfiles() {
  let almacenamientoDanado = false;
  try {
    const perfilesGuardados = localStorage.getItem('perfilesInformes');
    perfilesInformes = perfilesGuardados ? JSON.parse(perfilesGuardados) : [];
  } catch (error) {
    console.error('Error al cargar perfiles:', error);
    perfilesInformes = [];
    almacenamientoDanado = true;
  }
  try {
    const coleccionesGuardadas = JSON.parse(localStorage.getItem('coleccionesPlantillas') || '[]');
    coleccionesPlantillas = Array.isArray(coleccionesGuardadas) ? coleccionesGuardadas : [];
  } catch (error) {
    console.error('Error al cargar colecciones:', error);
    coleccionesPlantillas = [];
    almacenamientoDanado = true;
  }
  try {
    const etiquetasGuardadas = JSON.parse(localStorage.getItem('etiquetasInformes') || '[]');
    etiquetasInformes = Array.isArray(etiquetasGuardadas) ? etiquetasGuardadas : [];
  } catch (error) {
    console.error('Error al cargar etiquetas:', error);
    etiquetasInformes = [];
    almacenamientoDanado = true;
  }
  if (almacenamientoDanado) {
    try {
      const respaldo = JSON.parse(localStorage.getItem('respaldoPlantillasAutomatico') || 'null');
      if ([2, 3].includes(respaldo?.version) && Array.isArray(respaldo.plantillas)) {
        perfilesInformes = respaldo.plantillas;
        coleccionesPlantillas = Array.isArray(respaldo.colecciones) ? respaldo.colecciones : [];
        if (respaldo.version === 3 && Array.isArray(respaldo.etiquetas)) etiquetasInformes = respaldo.etiquetas;
        window.setTimeout(() => mostrarMensajeApp('Datos recuperados', 'Se restauró automáticamente el último respaldo válido de tus plantillas.', 'success'), 0);
      }
    } catch (error) {
      console.error('El respaldo automático tampoco pudo recuperarse:', error);
    }
  }
}

function guardarPerfiles() {
  if (sesionDisenadorPlantilla && !permitirPersistenciaDisenador) {
    marcarDisenadorConCambios();
    programarAutoguardadoDisenador();
    return;
  }
  localStorage.setItem('perfilesInformes', JSON.stringify(perfilesInformes));
  localStorage.setItem('coleccionesPlantillas', JSON.stringify(coleccionesPlantillas));
  localStorage.setItem('etiquetasInformes', JSON.stringify(etiquetasInformes));
  try {
    localStorage.setItem('respaldoPlantillasAutomatico', JSON.stringify({
      version: 3,
      guardadoEn: new Date().toISOString(),
      colecciones: coleccionesPlantillas,
      etiquetas: etiquetasInformes,
      plantillas: perfilesInformes
    }));
  } catch (error) {
    console.warn('No fue posible actualizar el respaldo automático de plantillas:', error);
  }
  window.programarRespaldoIntegralAutomatico?.();
}

function marcarDisenadorConCambios() {
  const boton = document.getElementById('saveDesignerButton');
  if (!boton || document.getElementById('designer-view')?.style.display === 'none') return;
  boton.classList.add('has-unsaved-changes');
  boton.textContent = 'Guardar cambios';
  boton.setAttribute('aria-label', 'Guardar cambios pendientes de la plantilla');
}

function programarAutoguardadoDisenador() {
  window.clearTimeout(timerAutoguardadoDisenador);
  timerAutoguardadoDisenador = window.setTimeout(() => {
    const perfilId = sesionDisenadorPlantilla?.perfilId;
    const perfil = perfilesInformes.find((item) => item.id === perfilId);
    if (!perfil) return;
    try {
      localStorage.setItem(`borradorPlantilla:${perfilId}`, JSON.stringify({
        version: 1,
        guardadoEn: new Date().toISOString(),
        perfil: clonarProfundo(perfil)
      }));
    } catch (error) {
      console.warn('No fue posible autoguardar la plantilla:', error);
    }
  }, 900);
}

function exportarPlantillas() {
  if (!perfilesInformes.length) {
    mostrarMensajeApp('No hay plantillas', 'Crea al menos una plantilla antes de exportar.', 'info');
    return;
  }
  abrirTransferenciaPlantillas('exportar', perfilesInformes, coleccionesPlantillas);
}

function descargarPlantillasSeleccionadas(plantillasSeleccionadas) {
  const idsColecciones = new Set(plantillasSeleccionadas.map((perfil) => perfil.coleccionId).filter(Boolean));
  const idsEtiquetas = new Set(plantillasSeleccionadas.map((perfil) => perfil.identificador?.etiquetaId).filter(Boolean));
  const paquete = {
    formato: 'generador-informes-plantillas',
    version: 3,
    codificacion: 'UTF-8',
    exportadoEn: new Date().toISOString(),
    colecciones: coleccionesPlantillas.filter((coleccion) => idsColecciones.has(coleccion.id)).map(normalizarColeccionPlantillas),
    etiquetas: etiquetasInformes.filter((etiqueta) => idsEtiquetas.has(etiqueta.id)).map(normalizarEtiquetaInforme),
    plantillas: plantillasSeleccionadas.map(normalizarPerfilInforme)
  };
  const contenido = `\uFEFF${JSON.stringify(paquete, null, 2)}`;
  const url = URL.createObjectURL(new Blob([contenido], { type: 'application/json;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'generador-informes-plantillas.v3.json';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  mostrarMensajeApp('Plantillas exportadas', `Se exportaron ${plantillasSeleccionadas.length} plantilla${plantillasSeleccionadas.length === 1 ? '' : 's'} correctamente.`, 'success');
}

function importarPlantillas() {
  const input = document.getElementById('importTemplatesInput');
  if (!input) return;
  input.value = '';
  input.onchange = procesarImportacionPlantillas;
  input.click();
}

async function procesarImportacionPlantillas(event) {
  const archivo = event.target.files?.[0];
  if (!archivo) return;
  try {
    const texto = (await archivo.text()).replace(/^\uFEFF/, '');
    const paquete = JSON.parse(texto);
    if (paquete?.formato !== 'generador-informes-plantillas' || ![1, 2, 3].includes(paquete?.version) || !Array.isArray(paquete.plantillas)) {
      throw new Error('Formato de plantillas no compatible.');
    }
    const importadas = paquete.plantillas.map(normalizarPerfilInforme);
    const coleccionesImportadas = paquete.version === 2 && Array.isArray(paquete.colecciones)
      ? paquete.colecciones.map(normalizarColeccionPlantillas)
      : [];
    if (paquete.version === 3 && Array.isArray(paquete.colecciones)) coleccionesImportadas.push(...paquete.colecciones.map(normalizarColeccionPlantillas));
    const etiquetasImportadas = paquete.version === 3 && Array.isArray(paquete.etiquetas)
      ? paquete.etiquetas.map(normalizarEtiquetaInforme)
      : [];
    if (!importadas.length) throw new Error('El archivo no contiene plantillas.');
    abrirTransferenciaPlantillas('importar', importadas, coleccionesImportadas, etiquetasImportadas);
  } catch (error) {
    console.error('No fue posible importar las plantillas:', error);
    await mostrarMensajeApp('Archivo no válido', 'Selecciona un archivo JSON UTF-8 exportado por Generador de Informes.', 'danger');
  } finally {
    event.target.value = '';
  }
}

function abrirTransferenciaPlantillas(modo, plantillas, colecciones, etiquetas = []) {
  estadoTransferenciaPlantillas = {
    modo,
    plantillas: plantillas.map(normalizarPerfilInforme),
    colecciones: colecciones.map(normalizarColeccionPlantillas),
    etiquetas: etiquetas.map(normalizarEtiquetaInforme),
    seleccionadas: new Set(),
    busqueda: ''
  };
  const modal = document.getElementById('template-transfer-modal');
  const titulo = document.getElementById('templateTransferTitle');
  const descripcion = document.getElementById('templateTransferDescription');
  const etiqueta = document.getElementById('templateTransferEyebrow');
  const confirmar = document.getElementById('templateTransferConfirm');
  const buscador = document.getElementById('templateTransferSearch');
  if (!modal) return;
  if (etiqueta) etiqueta.textContent = modo === 'exportar' ? 'Exportar plantillas' : 'Importar plantillas';
  if (titulo) titulo.textContent = modo === 'exportar' ? '¿Qué plantillas deseas exportar?' : '¿Qué plantillas deseas importar?';
  if (descripcion) descripcion.textContent = modo === 'exportar'
    ? 'El archivo incluirá solamente las plantillas seleccionadas y sus colecciones.'
    : 'Las seleccionadas se agregarán sin eliminar las plantillas que ya tienes.';
  if (confirmar) confirmar.textContent = modo === 'exportar' ? 'Exportar seleccionadas' : 'Importar seleccionadas';
  if (buscador) buscador.value = '';
  modal.style.display = 'flex';
  renderizarTransferenciaPlantillas();
  window.requestAnimationFrame(() => document.getElementById('templateTransferSelectAll')?.focus());
}

function obtenerColeccionTransferencia(perfil) {
  return estadoTransferenciaPlantillas.colecciones.find((coleccion) => coleccion.id === perfil.coleccionId);
}

function renderizarTransferenciaPlantillas() {
  const lista = document.getElementById('templateTransferList');
  if (!lista) return;
  const consulta = normalizarTextoBusqueda(estadoTransferenciaPlantillas.busqueda);
  const visibles = estadoTransferenciaPlantillas.plantillas.filter((perfil) => {
    const coleccion = obtenerColeccionTransferencia(perfil);
    return !consulta || normalizarTextoBusqueda(`${perfil.nombre} ${coleccion?.nombre || 'sin carpeta'}`).includes(consulta);
  });
  if (!visibles.length) {
    lista.innerHTML = '<div class="template-transfer-empty"><strong>No hay coincidencias.</strong><span>Prueba con otro nombre o colección.</span></div>';
  } else {
    const grupos = new Map();
    visibles.forEach((perfil) => {
      const coleccion = obtenerColeccionTransferencia(perfil);
      const clave = coleccion?.nombre || 'Sin carpeta';
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(perfil);
    });
    lista.innerHTML = Array.from(grupos.entries()).map(([nombre, items]) => `<section class="template-transfer-group"><h3>${escaparHTML(nombre)} <small>${items.length}</small></h3>${items.map((perfil) => `<label class="template-transfer-item"><input type="checkbox" value="${perfil.id}" ${estadoTransferenciaPlantillas.seleccionadas.has(perfil.id) ? 'checked' : ''} onchange="alternarPlantillaTransferencia('${perfil.id}', this.checked)" /><span class="template-transfer-icon">${iconoUI('file')}</span><span><strong>${escaparHTML(perfil.nombre)}</strong><small>${perfil.paginas.length} página${perfil.paginas.length === 1 ? '' : 's'} · ${perfil.bloques.length} bloque${perfil.bloques.length === 1 ? '' : 's'}</small></span></label>`).join('')}</section>`).join('');
  }
  actualizarResumenTransferencia();
}

function alternarPlantillaTransferencia(perfilId, seleccionada) {
  if (seleccionada) estadoTransferenciaPlantillas.seleccionadas.add(perfilId);
  else estadoTransferenciaPlantillas.seleccionadas.delete(perfilId);
  actualizarResumenTransferencia();
}

function alternarSeleccionTotalTransferencia(seleccionar) {
  estadoTransferenciaPlantillas.seleccionadas = seleccionar
    ? new Set(estadoTransferenciaPlantillas.plantillas.map((perfil) => perfil.id))
    : new Set();
  renderizarTransferenciaPlantillas();
}

function filtrarTransferenciaPlantillas(valor) {
  estadoTransferenciaPlantillas.busqueda = valor;
  renderizarTransferenciaPlantillas();
}

function actualizarResumenTransferencia() {
  const cantidad = estadoTransferenciaPlantillas.seleccionadas.size;
  const total = estadoTransferenciaPlantillas.plantillas.length;
  const contador = document.getElementById('templateTransferCount');
  const confirmar = document.getElementById('templateTransferConfirm');
  const seleccionarTodo = document.getElementById('templateTransferSelectAll');
  if (contador) contador.textContent = `${cantidad} de ${total} seleccionada${cantidad === 1 ? '' : 's'}`;
  if (confirmar) confirmar.disabled = cantidad === 0;
  if (seleccionarTodo) {
    seleccionarTodo.checked = total > 0 && cantidad === total;
    seleccionarTodo.indeterminate = cantidad > 0 && cantidad < total;
  }
}

function confirmarTransferenciaPlantillas() {
  const seleccionadas = estadoTransferenciaPlantillas.plantillas.filter((perfil) => estadoTransferenciaPlantillas.seleccionadas.has(perfil.id));
  if (!seleccionadas.length) return;
  const modo = estadoTransferenciaPlantillas.modo;
  if (modo === 'exportar') {
    cerrarTransferenciaPlantillas();
    descargarPlantillasSeleccionadas(seleccionadas);
    return;
  }
  importarPlantillasSeleccionadas(seleccionadas, estadoTransferenciaPlantillas.colecciones, estadoTransferenciaPlantillas.etiquetas);
  cerrarTransferenciaPlantillas();
}

function importarPlantillasSeleccionadas(seleccionadas, coleccionesOrigen, etiquetasOrigen = []) {
  const mapaColecciones = new Map();
  const mapaEtiquetas = new Map();
  const idsEtiquetasSeleccionadas = new Set(seleccionadas.map((perfil) => perfil.identificador?.etiquetaId).filter(Boolean));
  etiquetasOrigen.filter((etiqueta) => idsEtiquetasSeleccionadas.has(etiqueta.id)).forEach((origen) => {
    let destino = etiquetasInformes.find((etiqueta) => normalizarTextoBusqueda(etiqueta.nombre) === normalizarTextoBusqueda(origen.nombre));
    if (!destino) {
      destino = normalizarEtiquetaInforme({ ...origen, id: etiquetasInformes.some((etiqueta) => etiqueta.id === origen.id) ? crearIdUnico('etiqueta') : origen.id });
      etiquetasInformes.push(destino);
    }
    mapaEtiquetas.set(origen.id, destino.id);
  });
  seleccionadas.forEach((perfil) => {
    if (!perfil.coleccionId || mapaColecciones.has(perfil.coleccionId)) return;
    const origen = coleccionesOrigen.find((coleccion) => coleccion.id === perfil.coleccionId);
    if (!origen) return;
    let destino = coleccionesPlantillas.find((coleccion) => normalizarTextoBusqueda(coleccion.nombre) === normalizarTextoBusqueda(origen.nombre));
    if (!destino) {
      destino = normalizarColeccionPlantillas({ ...origen, id: coleccionesPlantillas.some((item) => item.id === origen.id) ? crearIdUnico('coleccion') : origen.id, orden: coleccionesPlantillas.length });
      coleccionesPlantillas.push(destino);
    }
    mapaColecciones.set(origen.id, destino.id);
  });
  seleccionadas.forEach((perfilOrigen) => {
    const colisionId = perfilesInformes.some((perfil) => perfil.id === perfilOrigen.id);
    const colisionNombre = perfilesInformes.some((perfil) => normalizarTextoBusqueda(perfil.nombre) === normalizarTextoBusqueda(perfilOrigen.nombre));
    const nombre = colisionNombre ? obtenerNombreImportadoDisponible(perfilOrigen.nombre) : perfilOrigen.nombre;
    const importada = colisionId ? duplicarPerfilConNuevosIds(perfilOrigen, nombre) : normalizarPerfilInforme({ ...clonarProfundo(perfilOrigen), nombre });
    importada.coleccionId = mapaColecciones.get(perfilOrigen.coleccionId) || null;
    importada.identificador.etiquetaId = mapaEtiquetas.get(perfilOrigen.identificador?.etiquetaId) || null;
    importada.orden = perfilesInformes.length;
    importada.modificadoEn = new Date().toISOString();
    perfilesInformes.push(importada);
  });
  guardarPerfiles();
  renderConfiguracion();
  mostrarMensajeApp('Importación completada', `Se agregaron ${seleccionadas.length} plantilla${seleccionadas.length === 1 ? '' : 's'} sin eliminar las existentes.`, 'success');
}

function obtenerNombreImportadoDisponible(nombreOriginal) {
  const base = `${nombreOriginal} (importada)`;
  const nombres = new Set(perfilesInformes.map((perfil) => normalizarTextoBusqueda(perfil.nombre)));
  if (!nombres.has(normalizarTextoBusqueda(base))) return base;
  let numero = 2;
  while (nombres.has(normalizarTextoBusqueda(`${base} ${numero}`))) numero += 1;
  return `${base} ${numero}`;
}

function cerrarTransferenciaPlantillas() {
  const modal = document.getElementById('template-transfer-modal');
  if (modal) modal.style.display = 'none';
  estadoTransferenciaPlantillas = { modo: null, plantillas: [], colecciones: [], etiquetas: [], seleccionadas: new Set(), busqueda: '' };
}

function manejarTeclaTransferenciaPlantillas(event) {
  if (event.key === 'Escape') cerrarTransferenciaPlantillas();
}

function initPerfiles() {
  cargarPerfiles();
  coleccionesPlantillas = coleccionesPlantillas.filter(Boolean).map(normalizarColeccionPlantillas);
  etiquetasInformes = etiquetasInformes.filter(Boolean).map(normalizarEtiquetaInforme);
  const idsColecciones = new Set(coleccionesPlantillas.map((coleccion) => coleccion.id));
  perfilesInformes = perfilesInformes.filter(Boolean).map(normalizarPerfilInforme);
  perfilesInformes.forEach((perfil, indice) => {
    if (perfil.coleccionId && !idsColecciones.has(perfil.coleccionId)) perfil.coleccionId = null;
    if (!Number.isFinite(perfil.orden)) perfil.orden = indice;
  });
  guardarPerfiles();
}

function normalizarColeccionPlantillas(coleccion = {}, indice = 0) {
  return {
    id: coleccion.id || crearIdUnico('coleccion'),
    nombre: String(coleccion.nombre || 'Colección sin nombre').replace(/\s+/g, ' ').trim().slice(0, 60),
    color: normalizarColorFondo(coleccion.color, '#66bc00'),
    orden: Number.isFinite(Number(coleccion.orden)) ? Number(coleccion.orden) : indice,
    contraida: coleccion.contraida === true
  };
}

function obtenerColorTextoLegible(colorFondo) {
  const color = normalizarColorFondo(colorFondo, '#4c626c').slice(1);
  const canales = [0, 2, 4].map((indice) => Number.parseInt(color.slice(indice, indice + 2), 16) / 255);
  const luminancia = canales.map((canal) => canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4)
    .reduce((total, canal, indice) => total + canal * [0.2126, 0.7152, 0.0722][indice], 0);
  return luminancia > 0.42 ? '#1f2730' : '#ffffff';
}

function normalizarEtiquetaInforme(etiqueta = {}) {
  const color = normalizarColorFondo(etiqueta.color || etiqueta.colorFondo, '#4c626c');
  return {
    id: String(etiqueta.id || crearIdUnico('etiqueta')).replace(/[^a-zA-Z0-9_-]/g, '') || crearIdUnico('etiqueta'),
    nombre: String(etiqueta.nombre || 'Etiqueta sin nombre').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || 'Etiqueta sin nombre',
    color,
    colorTexto: obtenerColorTextoLegible(color)
  };
}

function obtenerEtiquetaInforme(etiquetaId) {
  return etiquetasInformes.find((etiqueta) => etiqueta.id === etiquetaId) || null;
}

function normalizarPerfilInforme(perfil = {}) {
  const paginasEntrada = Array.isArray(perfil.paginas) && perfil.paginas.length ? perfil.paginas : [{ id: crearIdUnico('pagina'), nombre: 'Página 1' }];
  const paginas = paginasEntrada.map((pagina, indice) => ({ id: pagina.id || crearIdUnico('pagina'), nombre: String(pagina.nombre || `Página ${indice + 1}`) }));
  const bloques = normalizarCapasBloques((Array.isArray(perfil.bloques) ? perfil.bloques : []).map((bloque, indice) => normalizarBloquePerfil(bloque, indice, paginas[0].id)));
  const idsPaginas = new Set(paginas.map((pagina) => pagina.id));
  const paginasEliminadas = Array.isArray(perfil.paginasEliminadas) ? perfil.paginasEliminadas.filter((id) => idsPaginas.has(id)) : [];
  return {
    id: perfil.id || crearIdUnico('perfil'),
    nombre: String(perfil.nombre || 'Plantilla sin nombre'),
    coleccionId: perfil.coleccionId || null,
    favorito: perfil.favorito === true,
    orden: Number.isFinite(Number(perfil.orden)) ? Number(perfil.orden) : 0,
    modificadoEn: perfil.modificadoEn || new Date().toISOString(),
    identificador: normalizarIdentificadorPlantilla(perfil.identificador),
    hoja: normalizarEstiloHoja(perfil.hoja),
    paginas,
    paginasEliminadas,
    bloques
  };
}

function normalizarIdentificadorPlantilla(identificador = {}) {
  const tieneTextoPersonalizado = Object.prototype.hasOwnProperty.call(identificador || {}, 'texto');
  return {
    etiquetaId: identificador.etiquetaId ? String(identificador.etiquetaId) : null,
    colorFondo: normalizarColorFondo(identificador.colorFondo, '#4c626c'),
    colorTexto: normalizarColorFondo(identificador.colorTexto, '#ffffff'),
    texto: tieneTextoPersonalizado && identificador.texto !== null && identificador.texto !== undefined
      ? String(identificador.texto).replace(/[\r\n\t]+/g, ' ').slice(0, 80)
      : null
  };
}

function resolverIdentificadorPlantilla(perfil = {}) {
  const identificador = normalizarIdentificadorPlantilla(perfil.identificador || perfil.identificadorPlantilla);
  const etiqueta = obtenerEtiquetaInforme(identificador.etiquetaId);
  return etiqueta
    ? { ...identificador, colorFondo: etiqueta.color, colorTexto: etiqueta.colorTexto, etiqueta }
    : { ...identificador, etiqueta: null };
}

function crearIdUnico(prefijo) {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function obtenerTituloPredeterminadoBloque(tipo) {
  const titulos = {
    'bloque-texto-libre': 'Texto libre',
    'bloque-tabla-moderna': 'Mediciones',
    'bloque-datos-paciente': 'Datos del paciente',
    'bloque-imagenes-grid': 'Imágenes',
    'bloque-identidad': 'Identidad profesional',
    'bloque-logo': 'Logo',
    'bloque-banner': 'Imagen / banner',
    'bloque-clinica': 'Nuestra clínica',
    'bloque-diplomados': 'Diplomados',
    'bloque-figura': 'Figura'
  };
  return titulos[tipo] || 'Encabezado';
}

function normalizarTipoFigura(tipo) {
  const tipos = ['onda', 'rectangulo', 'cuadrado', 'circulo', 'triangulo', 'rombo', 'linea', 'flecha'];
  return tipos.includes(tipo) ? tipo : 'rectangulo';
}

function normalizarCamposPaciente(campos) {
  const predeterminados = ['Paciente', 'Especie', 'Raza', 'Edad', 'Propietario', 'Fecha'];
  const origen = Array.isArray(campos) && campos.length ? campos : predeterminados;
  const vistos = new Set();
  return origen.slice(0, 16).map((campo, indice) => {
    const objeto = campo && typeof campo === 'object' ? campo : { etiqueta: campo };
    const etiqueta = String(objeto.etiqueta || objeto.nombre || `Campo ${indice + 1}`).trim().slice(0, 50) || `Campo ${indice + 1}`;
    let id = String(objeto.id || crearIdUnico('dato-paciente')).replace(/[^a-zA-Z0-9_-]/g, '');
    while (!id || vistos.has(id)) id = crearIdUnico('dato-paciente');
    vistos.add(id);
    return { id, etiqueta };
  });
}

function obtenerClaveCampoPaciente(bloque, campo) {
  const etiqueta = String(campo?.etiqueta || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
  const clavesInteligentes = [
    [/^(paciente|nombre del paciente|nombre paciente)$/, 'paciente'],
    [/^especie$/, 'especie'], [/^raza$/, 'raza'], [/^edad$/, 'edad'],
    [/^(propietario|tutor|responsable)$/, 'propietario'], [/^fecha( del informe)?$/, 'fecha'],
    [/^sexo$/, 'sexo'], [/^(correo|email|correo electronico)$/, 'correo'],
    [/^(estado reproductivo|condicion reproductiva)$/, 'estadoReproductivo'],
    [/^(medico|medico veterinario|veterinario|profesional)$/, 'medico'],
    [/^(rut medico|rut del medico)$/, 'rutMedico'],
    [/^(registro medico|numero de registro|n registro)$/, 'registroMedico']
  ];
  const coincidencia = clavesInteligentes.find(([patron]) => patron.test(etiqueta));
  if (coincidencia) return coincidencia[1];
  const bloqueId = String(bloque.id || 'bloque').replace(/[^a-zA-Z0-9_-]/g, '_');
  const campoId = String(campo.id || 'campo').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `dato_paciente_${bloqueId}_${campoId}`;
}

function calcularAltoBloqueImagenes(ancho) {
  const anchoSeguro = Math.max(240, Number(ancho) || 240);
  const lado = Math.max(1, (anchoSeguro - SEPARACION_CUADRICULA_IMAGENES) / 2);
  return Math.round(ALTO_ENCABEZADO_IMAGENES + ESPACIO_ENCABEZADO_IMAGENES + (lado * 3) + (SEPARACION_CUADRICULA_IMAGENES * 2));
}

function calcularAnchoBloqueImagenes(alto) {
  const altoCuadricula = Math.max(1, Number(alto) - ALTO_ENCABEZADO_IMAGENES - ESPACIO_ENCABEZADO_IMAGENES - (SEPARACION_CUADRICULA_IMAGENES * 2));
  return Math.round(((altoCuadricula / 3) * 2) + SEPARACION_CUADRICULA_IMAGENES);
}

function normalizarCapasBloques(bloques) {
  const lista = Array.isArray(bloques) ? bloques : [];
  const paginas = new Map();
  lista.forEach((bloque, indice) => {
    const paginaId = bloque?.paginaId || '__sin_pagina__';
    if (!paginas.has(paginaId)) paginas.set(paginaId, []);
    paginas.get(paginaId).push({ bloque, indice });
  });
  paginas.forEach((items) => {
    items
      .sort((a, b) => {
        const capaA = Number.isFinite(Number(a.bloque?.capa)) ? Number(a.bloque.capa) : a.indice + 1;
        const capaB = Number.isFinite(Number(b.bloque?.capa)) ? Number(b.bloque.capa) : b.indice + 1;
        return capaA - capaB || a.indice - b.indice;
      })
      .forEach(({ bloque }, indice) => { if (bloque) bloque.capa = indice + 1; });
  });
  return lista;
}

function normalizarBloquePerfil(bloque = {}, indice = 0, paginaPredeterminada = null) {
  const migracionTipos = { 'text-rich': 'bloque-texto-libre', 'table-mediciones': 'bloque-tabla-moderna', 'images-page': 'bloque-imagenes-grid' };
  const tiposValidos = ['bloque-titulo-principal', 'bloque-texto-libre', 'bloque-encabezado', 'bloque-tabla-moderna', 'bloque-datos-paciente', 'bloque-imagenes-grid', 'bloque-identidad', 'bloque-logo', 'bloque-clinica', 'bloque-diplomados', 'bloque-figura', 'bloque-banner'];
  let tipo = tiposValidos.includes(bloque.tipo) ? bloque.tipo : (migracionTipos[bloque.tipo] || 'bloque-texto-libre');
  const contenidoAnterior = bloque.contenidoDefecto !== undefined ? bloque.contenidoDefecto : bloque.contenido;
  if (tipo === 'bloque-identidad' && contenidoAnterior === 'logo') tipo = 'bloque-logo';
  const filtroDiplomados = ['todos', 'cursados', 'en-curso'].includes(contenidoAnterior) ? contenidoAnterior : 'todos';
  const anchoGuardado = Number.isFinite(Number(bloque.width)) ? Number(bloque.width) : (tipo === 'bloque-logo' ? 180 : tipo === 'bloque-figura' ? 240 : 620);
  const altoGuardado = Number.isFinite(Number(bloque.height)) ? Number(bloque.height) : (tipo === 'bloque-imagenes-grid' ? 600 : tipo === 'bloque-datos-paciente' ? 280 : tipo === 'bloque-diplomados' ? 320 : tipo === 'bloque-logo' ? 180 : tipo === 'bloque-figura' ? 160 : tipo === 'bloque-identidad' || tipo === 'bloque-clinica' ? 150 : 120);
  return {
    id: bloque.id || crearIdUnico('bloque'),
    tipo,
    titulo: String(bloque.titulo || obtenerTituloPredeterminadoBloque(tipo)),
    color: normalizarColorBloque(bloque.color),
    colorFondo: normalizarColorFondo(bloque.colorFondo, '#ffffff'),
    paginaId: bloque.paginaId || paginaPredeterminada,
    capa: Number.isFinite(Number(bloque.capa)) ? Math.max(1, Math.round(Number(bloque.capa))) : indice + 1,
    x: Number.isFinite(Number(bloque.x)) ? Number(bloque.x) : 40,
    y: Number.isFinite(Number(bloque.y)) ? Number(bloque.y) : 40 + (indice * 140),
    width: tipo === 'bloque-imagenes-grid' ? Math.max(240, anchoGuardado) : anchoGuardado,
    height: tipo === 'bloque-imagenes-grid' ? calcularAltoBloqueImagenes(Math.max(240, anchoGuardado)) : altoGuardado,
    fontSize: Number.isFinite(Number(bloque.fontSize)) ? Math.max(8, Math.min(72, Number(bloque.fontSize))) : (tipo === 'bloque-titulo-principal' ? 26 : tipo === 'bloque-encabezado' ? 20 : tipo === 'bloque-texto-libre' ? 14 : tipo === 'bloque-tabla-moderna' ? 13 : 14),
    alineacion: ['left', 'center', 'right', 'justify'].includes(bloque.alineacion) ? bloque.alineacion : 'left',
    contenidoDefecto: tipo === 'bloque-tabla-moderna'
      ? normalizarTablaMediciones(contenidoAnterior)
      : tipo === 'bloque-diplomados'
        ? filtroDiplomados
        : String(contenidoAnterior || ''),
    imagenSrc: normalizarImagenBanner(bloque.imagenSrc),
    imagenProporcion: Number(bloque.imagenProporcion) > 0 && Number.isFinite(Number(bloque.imagenProporcion)) ? Number(bloque.imagenProporcion) : 5,
    camposPaciente: tipo === 'bloque-datos-paciente' ? normalizarCamposPaciente(bloque.camposPaciente) : [],
    figuraTipo: normalizarTipoFigura(bloque.figuraTipo || contenidoAnterior),
    figuraColor: normalizarColorFondo(bloque.figuraColor, '#4c626c'),
    figuraRelleno: normalizarColorFondo(bloque.figuraRelleno, '#d8f5c6'),
    figuraRellena: bloque.figuraRellena === true,
    figuraGrosor: Math.max(1, Math.min(20, Number(bloque.figuraGrosor) || 4)),
    figuraEstiloLinea: ['solida', 'discontinua', 'punteada'].includes(bloque.figuraEstiloLinea) ? bloque.figuraEstiloLinea : 'solida',
    figuraRadio: Math.max(0, Math.min(50, Number(bloque.figuraRadio) || 0)),
    rotacion: Math.max(-180, Math.min(180, Number(bloque.rotacion) || 0)),
    opacidad: Math.max(0.05, Math.min(1, Number(bloque.opacidad) || 1)),
    bloqueado: bloque.bloqueado === true,
    visible: bloque.visible !== false
  };
}

function normalizarEstiloHoja(hoja = {}) {
  return {
    colorFondo: normalizarColorFondo(hoja.colorFondo, '#ffffff'),
    colorEnfasis: normalizarColorBloque(hoja.colorEnfasis || hoja.accentColor)
  };
}

function normalizarColorFondo(color, fallback) {
  const valor = String(color || '').trim();
  return /^#[0-9a-f]{6}$/i.test(valor) ? valor.toLowerCase() : fallback;
}


function normalizarColorBloque(color) {
  const valor = String(color || '').trim();
  return /^#[0-9a-f]{6}$/i.test(valor) ? valor.toLowerCase() : '#66bc00';
}

function normalizarTablaMediciones(tabla) {
  const base = tabla && typeof tabla === 'object' ? tabla : {};
  const filasEntrada = Array.isArray(base.filas) ? base.filas.filter(Array.isArray) : [];
  const cantidadInferidaColumnas = Math.max(1, ...filasEntrada.map((fila) => fila.length));
  const cabeceras = Array.isArray(base.cabeceras) && base.cabeceras.length
    ? base.cabeceras.map(String)
    : Array.from({ length: cantidadInferidaColumnas > 1 ? cantidadInferidaColumnas : 3 }, (_, indice) => `Columna ${indice + 1}`);
  const filas = (filasEntrada.length ? filasEntrada : [Array(cabeceras.length).fill('')]).map((fila) => {
    const rectangular = fila.slice(0, cabeceras.length).map(String);
    while (rectangular.length < cabeceras.length) rectangular.push('');
    return rectangular;
  });
  return {
    cabeceras,
    filas,
    estilosCeldas: base.estilosCeldas && typeof base.estilosCeldas === 'object' && !Array.isArray(base.estilosCeldas) ? clonarProfundo(base.estilosCeldas) : {}
  };
}

function crearNuevoPerfil() {
  operacionModalPerfil = { tipo: 'crear', perfilId: null };
  prepararModalNombrePerfil({
    titulo: 'Crear nueva plantilla',
    descripcion: 'Asigna un nombre reconocible. Luego podrás agregar y configurar sus bloques.',
    placeholder: 'Ej: Informe Ecográfico Abdominal',
    confirmar: 'Crear y configurar',
    valor: ''
  });
}

function abrirCrearColeccion() {
  const paleta = ['#66bc00', '#2f80ed', '#9b51e0', '#f2994a', '#eb5757', '#4c626c'];
  operacionColeccion = { tipo: 'crear', coleccionId: null, color: paleta[coleccionesPlantillas.length % paleta.length] };
  operacionModalPerfil = { tipo: 'crear-coleccion', perfilId: null };
  prepararModalNombrePerfil({
    titulo: 'Crear colección',
    descripcion: 'Agrupa plantillas relacionadas. Podrás moverlas arrastrándolas desde el gestor.',
    placeholder: 'Ej: Ecografías',
    confirmar: 'Crear colección',
    valor: ''
  });
  agregarControlColorColeccion(operacionColeccion.color);
}

function abrirRenombrarColeccion(coleccionId) {
  const coleccion = coleccionesPlantillas.find((item) => item.id === coleccionId);
  if (!coleccion) return;
  operacionColeccion = { tipo: 'renombrar', coleccionId, color: coleccion.color };
  operacionModalPerfil = { tipo: 'renombrar-coleccion', perfilId: null };
  prepararModalNombrePerfil({
    titulo: 'Editar colección',
    descripcion: 'Cambia el nombre de la colección. Sus plantillas conservarán todo su contenido.',
    placeholder: 'Nombre de la colección',
    confirmar: 'Guardar cambios',
    valor: coleccion.nombre
  });
  agregarControlColorColeccion(coleccion.color);
  const acciones = document.querySelector('#new-profile-modal footer');
  if (acciones && !acciones.querySelector('[data-delete-collection]')) {
    acciones.insertAdjacentHTML('afterbegin', `<button class="profile-delete-btn modal-delete-collection" data-delete-collection type="button" onclick="eliminarColeccionDesdeModal()">Eliminar colección</button>`);
  }
}

function agregarControlColorColeccion(color) {
  const error = document.getElementById('newProfileError');
  if (!error) return;
  document.getElementById('collectionColorField')?.remove();
  error.insertAdjacentHTML('beforebegin', `<label id="collectionColorField" class="new-profile-field collection-color-field"><span>Color de la colección</span><span><input id="collectionColorInput" type="color" value="${normalizarColorFondo(color, '#66bc00')}" aria-label="Color de la colección" /><small>Se usa para reconocerla rápidamente.</small></span></label>`);
}

async function eliminarColeccionDesdeModal() {
  const coleccion = coleccionesPlantillas.find((item) => item.id === operacionColeccion.coleccionId);
  if (!coleccion) return;
  const cantidad = perfilesInformes.filter((perfil) => perfil.coleccionId === coleccion.id).length;
  const confirmado = await mostrarDialogoApp({
    titulo: 'Eliminar colección',
    mensaje: cantidad ? `Las ${cantidad} plantillas de “${coleccion.nombre}” se moverán a Sin carpeta. No se eliminará ninguna plantilla.` : `Se eliminará la colección “${coleccion.nombre}”.`,
    tipo: 'danger',
    confirmar: 'Eliminar colección',
    cancelar: 'Cancelar'
  });
  if (!confirmado) return;
  perfilesInformes.forEach((perfil) => { if (perfil.coleccionId === coleccion.id) perfil.coleccionId = null; });
  coleccionesPlantillas = coleccionesPlantillas.filter((item) => item.id !== coleccion.id);
  if (coleccionPlantillasActivaId === coleccion.id) coleccionPlantillasActivaId = 'sin-carpeta';
  guardarPerfiles();
  cerrarModalNuevoPerfil();
  mostrarGestorPerfiles();
  mostrarMensajeApp('Colección eliminada', cantidad ? 'Las plantillas se conservaron en Sin carpeta.' : 'La colección se eliminó correctamente.', 'success');
}

function prepararModalNombrePerfil({ titulo, descripcion, placeholder, confirmar, valor = '' }) {
  const modal = document.getElementById('new-profile-modal');
  const input = document.getElementById('newProfileName');
  const error = document.getElementById('newProfileError');
  const tituloElemento = document.getElementById('newProfileTitle');
  const descripcionElemento = document.getElementById('newProfileDescription');
  const confirmarElemento = document.getElementById('newProfileConfirmButton');
  if (!modal || !input) return;
  if (tituloElemento) tituloElemento.textContent = titulo;
  if (descripcionElemento) descripcionElemento.textContent = descripcion;
  if (confirmarElemento) confirmarElemento.textContent = confirmar;
  input.placeholder = placeholder;
  input.value = valor;
  input.setAttribute('aria-invalid', 'false');
  if (error) error.textContent = '';
  modal.style.display = 'flex';
  window.requestAnimationFrame(() => {
    input.focus();
    if (valor) input.select();
  });
}

function confirmarNuevoPerfil() {
  const input = document.getElementById('newProfileName');
  const error = document.getElementById('newProfileError');
  let nombre = input ? input.value.replace(/\s+/g, ' ').trim() : '';
  const esOperacionColeccion = ['crear-coleccion', 'renombrar-coleccion'].includes(operacionModalPerfil.tipo);
  const perfilOrigen = perfilesInformes.find((perfil) => perfil.id === operacionModalPerfil.perfilId);
  if (operacionModalPerfil.tipo === 'copiar' && !nombre && perfilOrigen) {
    nombre = obtenerNombreCopiaDisponible(perfilOrigen.nombre);
  }
  if (!nombre) {
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
    if (error) error.textContent = esOperacionColeccion ? 'Escribe un nombre para la colección.' : 'Escribe un nombre para la plantilla.';
    return;
  }
  if (esOperacionColeccion) {
    const creandoColeccion = operacionModalPerfil.tipo === 'crear-coleccion';
    const nombreOcupado = coleccionesPlantillas.some((coleccion) => coleccion.id !== operacionColeccion.coleccionId && coleccion.nombre.toLocaleLowerCase('es') === nombre.toLocaleLowerCase('es'));
    if (nombreOcupado) {
      if (input) { input.setAttribute('aria-invalid', 'true'); input.select(); }
      if (error) error.textContent = 'Ya existe una colección con ese nombre.';
      return;
    }
    if (creandoColeccion) {
      const color = document.getElementById('collectionColorInput')?.value || operacionColeccion.color;
      const nueva = normalizarColeccionPlantillas({ nombre, color, orden: coleccionesPlantillas.length });
      coleccionesPlantillas.push(nueva);
      coleccionPlantillasActivaId = nueva.id;
    } else {
      const coleccion = coleccionesPlantillas.find((item) => item.id === operacionColeccion.coleccionId);
      if (!coleccion) return;
      coleccion.nombre = nombre;
      coleccion.color = normalizarColorFondo(document.getElementById('collectionColorInput')?.value, coleccion.color);
      coleccionPlantillasActivaId = coleccion.id;
    }
    guardarPerfiles();
    cerrarModalNuevoPerfil();
    mostrarGestorPerfiles();
    mostrarMensajeApp(creandoColeccion ? 'Colección creada' : 'Colección actualizada', `“${nombre}” está lista para organizar plantillas.`, 'success');
    return;
  }
  const nombreOcupado = perfilesInformes.some((perfil) => {
    const esLaMismaPlantillaRenombrada = operacionModalPerfil.tipo === 'renombrar'
      && perfil.id === operacionModalPerfil.perfilId;
    return !esLaMismaPlantillaRenombrada
      && perfil.nombre.toLocaleLowerCase('es') === nombre.toLocaleLowerCase('es');
  });
  if (nombreOcupado) {
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.select();
    }
    if (error) error.textContent = 'Ya existe una plantilla con ese nombre.';
    return;
  }
  if (operacionModalPerfil.tipo === 'renombrar') {
    if (!perfilOrigen) return;
    perfilOrigen.nombre = nombre;
    perfilOrigen.modificadoEn = new Date().toISOString();
    guardarPerfiles();
    cerrarModalNuevoPerfil();
    mostrarGestorPerfiles();
    mostrarMensajeApp('Nombre actualizado', `La plantilla ahora se llama “${nombre}”.`, 'success');
    return;
  }
  if (operacionModalPerfil.tipo === 'copiar') {
    if (!perfilOrigen) return;
    const copia = duplicarPerfilConNuevosIds(perfilOrigen, nombre);
    perfilesInformes.push(copia);
    guardarPerfiles();
    cerrarModalNuevoPerfil();
    mostrarGestorPerfiles();
    mostrarMensajeApp('Plantilla copiada', `Se creó “${nombre}” como una plantilla independiente.`, 'success');
    return;
  }
  const nuevoPerfil = {
    id: crearIdUnico('perfil'),
    nombre,
    coleccionId: !['todas', 'favoritas', 'sin-carpeta'].includes(coleccionPlantillasActivaId) ? coleccionPlantillasActivaId : null,
    favorito: false,
    orden: perfilesInformes.length,
    modificadoEn: new Date().toISOString(),
    identificador: normalizarIdentificadorPlantilla(),
    hoja: normalizarEstiloHoja(),
    paginas: [{ id: crearIdUnico('pagina'), nombre: 'Página 1' }],
    bloques: []
  };
  perfilesInformes.push(nuevoPerfil);
  perfilNuevoPendienteId = nuevoPerfil.id;
  cerrarModalNuevoPerfil();
  diseñarEstructuraPlantilla(nuevoPerfil.id);
}

function cerrarModalNuevoPerfil() {
  const modal = document.getElementById('new-profile-modal');
  if (modal) modal.style.display = 'none';
  modal?.querySelector('[data-delete-collection]')?.remove();
  document.getElementById('collectionColorField')?.remove();
  operacionModalPerfil = { tipo: 'crear', perfilId: null };
  operacionColeccion = { tipo: null, coleccionId: null };
}

function abrirCopiarPlantilla(perfilId) {
  const perfil = perfilesInformes.find((item) => item.id === perfilId);
  if (!perfil) return;
  operacionModalPerfil = { tipo: 'copiar', perfilId };
  prepararModalNombrePerfil({
    titulo: 'Copiar plantilla',
    descripcion: `Escribe el nombre de la copia de “${perfil.nombre}”. Si lo dejas vacío, se asignará automáticamente.`,
    placeholder: obtenerNombreCopiaDisponible(perfil.nombre),
    confirmar: 'Copiar plantilla',
    valor: ''
  });
}

function abrirRenombrarPlantilla(perfilId) {
  const perfil = perfilesInformes.find((item) => item.id === perfilId);
  if (!perfil) return;
  operacionModalPerfil = { tipo: 'renombrar', perfilId };
  prepararModalNombrePerfil({
    titulo: 'Cambiar nombre',
    descripcion: 'El nuevo nombre se aplicará a esta plantilla sin modificar su estructura.',
    placeholder: 'Nombre de la plantilla',
    confirmar: 'Guardar nombre',
    valor: perfil.nombre
  });
}

function obtenerNombreCopiaDisponible(nombreOriginal) {
  const base = `${String(nombreOriginal || 'Plantilla').trim()}-copia`;
  const nombres = new Set(perfilesInformes.map((perfil) => perfil.nombre.toLocaleLowerCase('es')));
  if (!nombres.has(base.toLocaleLowerCase('es'))) return base;
  let numero = 2;
  while (nombres.has(`${base}-${numero}`.toLocaleLowerCase('es'))) numero += 1;
  return `${base}-${numero}`;
}

function duplicarPerfilConNuevosIds(perfilOrigen, nombre) {
  const copia = clonarProfundo(perfilOrigen);
  const idsPaginas = new Map();
  copia.id = crearIdUnico('perfil');
  copia.nombre = nombre;
  copia.paginas = copia.paginas.map((pagina) => {
    const nuevoId = crearIdUnico('pagina');
    idsPaginas.set(pagina.id, nuevoId);
    return { ...pagina, id: nuevoId };
  });
  copia.paginasEliminadas = (copia.paginasEliminadas || []).map((id) => idsPaginas.get(id)).filter(Boolean);
  copia.bloques = copia.bloques.map((bloque) => ({
    ...bloque,
    id: crearIdUnico('bloque'),
    paginaId: idsPaginas.get(bloque.paginaId) || copia.paginas[0]?.id || null
  }));
  return normalizarPerfilInforme(copia);
}

function manejarTeclaNuevoPerfil(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    confirmarNuevoPerfil();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cerrarModalNuevoPerfil();
  }
}

let resolverDialogoApp = null;

function mostrarDialogoApp({ titulo = 'Aviso', mensaje = '', tipo = 'info', confirmar = 'Aceptar', cancelar = null } = {}) {
  const modal = document.getElementById('app-message-modal');
  if (!modal) return Promise.resolve(false);
  if (resolverDialogoApp) resolverDialogoApp(false);
  const tituloElemento = document.getElementById('appMessageTitle');
  const textoElemento = document.getElementById('appMessageText');
  const icono = document.getElementById('appMessageIcon');
  const botonConfirmar = document.getElementById('appMessageConfirm');
  const botonCancelar = document.getElementById('appMessageCancel');
  modal.dataset.type = tipo;
  tituloElemento.textContent = titulo;
  textoElemento.textContent = mensaje;
  icono.textContent = tipo === 'danger' ? '!' : tipo === 'success' ? '✓' : 'i';
  botonConfirmar.textContent = confirmar;
  botonConfirmar.classList.toggle('danger', tipo === 'danger');
  botonCancelar.style.display = cancelar ? '' : 'none';
  botonCancelar.textContent = cancelar || 'Cancelar';
  modal.style.display = 'flex';
  return new Promise((resolve) => {
    resolverDialogoApp = resolve;
    const terminar = (respuesta) => {
      modal.style.display = 'none';
      modal.onkeydown = null;
      resolverDialogoApp = null;
      resolve(respuesta);
    };
    botonConfirmar.onclick = () => terminar(true);
    botonCancelar.onclick = () => terminar(false);
    modal.onkeydown = (event) => {
      if (event.key === 'Escape' && cancelar) terminar(false);
      if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') terminar(true);
    };
    window.requestAnimationFrame(() => (cancelar ? botonCancelar : botonConfirmar).focus());
  });
}

function mostrarMensajeApp(titulo, mensaje, tipo = 'info') {
  return mostrarDialogoApp({ titulo, mensaje, tipo, confirmar: 'Entendido' });
}

async function eliminarPerfil(perfilId) {
  const perfil = perfilesInformes.find(p => p.id === perfilId);
  if (!perfil) return;
  const confirmado = await mostrarDialogoApp({ titulo: 'Eliminar plantilla', mensaje: `La plantilla "${perfil.nombre}" se eliminará de forma permanente.`, tipo: 'danger', confirmar: 'Eliminar', cancelar: 'Conservar' });
  if (confirmado) {
    perfilesInformes = perfilesInformes.filter(p => p.id !== perfilId);
    guardarPerfiles();
    mostrarGestorPerfiles(); // Refrescar la vista
  }
}

function cargarAjustesGuardados() {
  try {
    const ajustes = JSON.parse(localStorage.getItem('ajustesApp') || '{}');
    if (ajustes && typeof ajustes === 'object') {
      Object.assign(ajustesApp, ajustes);
      if (ajustesApp.tema === 'noche') {
        ajustesApp.tema = 'huellitas';
        ajustesApp.modoTema = 'oscuro';
      } else if (ajustesApp.tema === 'cielo') {
        ajustesApp.tema = 'oceano';
      } else if (ajustesApp.tema === 'bosque') {
        ajustesApp.tema = 'huellitas';
      } else if (ajustesApp.tema === 'grafito') {
        ajustesApp.tema = 'huellitas';
        if (!Object.prototype.hasOwnProperty.call(ajustes, 'modoTema')) ajustesApp.modoTema = 'oscuro';
      }
      limpiarDiplomadosPredeterminadosGuardados();
    }
  } catch (error) {
    // Mantiene los valores por defecto si hay datos corruptos.
  }
}

function limpiarDiplomadosPredeterminadosGuardados() {
  const texto = String(ajustesApp.diplomadosPrincipal || '');
  const parecePlantillaAnterior = texto.includes('Diploma en Imagenología en Pequeños Animales')
    && texto.includes('Curso de Ecocardiografía, Pablo Carle');
  if (parecePlantillaAnterior) {
    ajustesApp.diplomadosPrincipal = '';
    ajustesApp.diplomadosLateral = '';
  }
}

function persistirAjustes() {
  localStorage.setItem('ajustesApp', JSON.stringify(ajustesApp));
  window.programarRespaldoIntegralAutomatico?.();
}

function normalizarTemaAplicacion(tema) {
  return Object.prototype.hasOwnProperty.call(TEMAS_APLICACION, tema) ? tema : 'huellitas';
}

function normalizarModoTema(modo) {
  return modo === 'oscuro' ? 'oscuro' : 'claro';
}

function aplicarTemaAplicacion(tema, { persistir = false } = {}) {
  const temaSeguro = normalizarTemaAplicacion(tema);
  ajustesApp.tema = temaSeguro;
  ajustesApp.modoTema = normalizarModoTema(ajustesApp.modoTema);
  document.documentElement.dataset.theme = temaSeguro;
  document.documentElement.dataset.mode = ajustesApp.modoTema;
  const metaColor = document.querySelector('meta[name="theme-color"]');
  if (metaColor) metaColor.content = ajustesApp.modoTema === 'oscuro' ? '#111820' : TEMAS_APLICACION[temaSeguro].colorBarra;
  if (persistir) persistirAjustes();
  renderSelectorTemas();
}

function renderSelectorTemas() {
  const temaActivo = normalizarTemaAplicacion(ajustesApp.tema);
  document.querySelectorAll('[data-theme-option]').forEach((opcion) => {
    const activo = opcion.dataset.themeOption === temaActivo;
    opcion.classList.toggle('is-active', activo);
    opcion.setAttribute('aria-checked', String(activo));
  });
  const etiqueta = document.getElementById('activeThemeLabel');
  const modo = normalizarModoTema(ajustesApp.modoTema);
  if (etiqueta) etiqueta.textContent = `${TEMAS_APLICACION[temaActivo].nombre} · ${modo === 'oscuro' ? 'Oscuro' : 'Claro'}`;
  const interruptor = document.getElementById('themeModeToggle');
  if (interruptor) interruptor.checked = modo === 'oscuro';
  const etiquetaModo = document.getElementById('themeModeLabel');
  if (etiquetaModo) etiquetaModo.textContent = modo === 'oscuro' ? 'Oscuro' : 'Claro';
  document.querySelector('.appearance-mode-icon')?.replaceChildren(document.createTextNode(modo === 'oscuro' ? '☾' : '☀'));
}

function seleccionarTemaAplicacion(tema) {
  aplicarTemaAplicacion(tema, { persistir: true });
  mostrarAvisoBreve(`Tema ${TEMAS_APLICACION[ajustesApp.tema].nombre} aplicado en todo el sistema.`);
}

function cambiarModoTema(activarOscuro) {
  ajustesApp.modoTema = activarOscuro ? 'oscuro' : 'claro';
  aplicarTemaAplicacion(ajustesApp.tema, { persistir: true });
  mostrarAvisoBreve(`Modo ${ajustesApp.modoTema} aplicado a la paleta ${TEMAS_APLICACION[ajustesApp.tema].nombre}.`);
}

const SECCIONES_CONFIGURACION = {
  apariencia: 'Personaliza temas, colores y el ambiente visual del sistema.',
  etiquetas: 'Crea los nombres y colores que reutilizas en tus plantillas.',
  textos: 'Guarda frases, hallazgos y conclusiones clínicas reutilizables.',
  identidad: 'Administra tus datos profesionales, firma e identidad de la clínica.',
  sistema: 'Respalda, importa o restablece los datos locales de la aplicación.',
  ayuda: 'Aprende a utilizar el sistema con el tutorial y el manual de usuario.'
};

function mostrarSeccionConfiguracion(seccion, { enfocar = false } = {}) {
  const seccionSegura = Object.prototype.hasOwnProperty.call(SECCIONES_CONFIGURACION, seccion) ? seccion : 'apariencia';
  seccionConfiguracionActiva = seccionSegura;
  document.querySelectorAll('[data-config-page]').forEach((panel) => {
    const activo = panel.dataset.configPage === seccionSegura;
    panel.hidden = !activo;
    panel.classList.toggle('is-active', activo);
  });
  document.querySelectorAll('[data-config-nav]').forEach((boton) => {
    const activo = boton.dataset.configNav === seccionSegura;
    boton.classList.toggle('is-active', activo);
    boton.setAttribute('aria-selected', String(activo));
    boton.tabIndex = activo ? 0 : -1;
  });
  const subtitulo = document.getElementById('configHeaderSubtitle');
  if (subtitulo) subtitulo.textContent = SECCIONES_CONFIGURACION[seccionSegura];
  if (enfocar) document.querySelector(`[data-config-nav="${seccionSegura}"]`)?.focus();
}

function manejarTeclaNavegacionConfiguracion(event) {
  if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const botones = Array.from(document.querySelectorAll('[data-config-nav]'));
  if (!botones.length) return;
  event.preventDefault();
  const actual = Math.max(0, botones.indexOf(document.activeElement));
  let destino = actual;
  if (event.key === 'Home') destino = 0;
  else if (event.key === 'End') destino = botones.length - 1;
  else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') destino = (actual + 1) % botones.length;
  else destino = (actual - 1 + botones.length) % botones.length;
  mostrarSeccionConfiguracion(botones[destino].dataset.configNav, { enfocar: true });
}

function iconoUI(nombre, clase = '') {
  return `<svg class="ui-icon ${clase}" aria-hidden="true"><use href="#icon-${nombre}"></use></svg>`;
}

function obtenerPaginaValida(pagina, totalElementos, tamanoPagina) {
  const totalPaginas = Math.max(1, Math.ceil(totalElementos / tamanoPagina));
  return Math.max(1, Math.min(Number(pagina) || 1, totalPaginas));
}

function obtenerNumerosPaginacion(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, indice) => indice + 1);
  const numeros = new Set([1, total, actual - 1, actual, actual + 1]);
  const validos = Array.from(numeros).filter((pagina) => pagina >= 1 && pagina <= total).sort((a, b) => a - b);
  const resultado = [];
  validos.forEach((pagina, indice) => {
    if (indice && pagina - validos[indice - 1] > 1) resultado.push('…');
    resultado.push(pagina);
  });
  return resultado;
}

function renderizarPaginacion(contenedorId, tipo, totalElementos, tamanoPagina) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  const totalPaginas = Math.max(1, Math.ceil(totalElementos / tamanoPagina));
  const pagina = obtenerPaginaValida(paginasListados[tipo], totalElementos, tamanoPagina);
  paginasListados[tipo] = pagina;
  if (totalElementos <= tamanoPagina) {
    contenedor.innerHTML = '';
    contenedor.hidden = true;
    return;
  }
  contenedor.hidden = false;
  const inicio = (pagina - 1) * tamanoPagina + 1;
  const fin = Math.min(totalElementos, pagina * tamanoPagina);
  const botones = obtenerNumerosPaginacion(pagina, totalPaginas).map((numero) => numero === '…'
    ? '<span class="pagination-ellipsis" aria-hidden="true">…</span>'
    : `<button class="pagination-number ${numero === pagina ? 'is-active' : ''}" type="button" ${numero === pagina ? 'aria-current="page"' : ''} onclick="cambiarPaginaListado('${tipo}', ${numero})" aria-label="Ir a la página ${numero}">${numero}</button>`).join('');
  contenedor.innerHTML = `<span class="pagination-summary">Mostrando ${inicio}–${fin} de ${totalElementos}</span><div class="pagination-controls"><button type="button" onclick="cambiarPaginaListado('${tipo}', ${pagina - 1})" ${pagina === 1 ? 'disabled' : ''} aria-label="Página anterior">${iconoUI('arrow-left')}<span>Anterior</span></button>${botones}<button type="button" onclick="cambiarPaginaListado('${tipo}', ${pagina + 1})" ${pagina === totalPaginas ? 'disabled' : ''} aria-label="Página siguiente"><span>Siguiente</span>${iconoUI('chevron-right')}</button></div>`;
}

function cambiarPaginaListado(tipo, pagina) {
  if (!Object.prototype.hasOwnProperty.call(paginasListados, tipo)) return;
  paginasListados[tipo] = Math.max(1, Number(pagina) || 1);
  if (tipo === 'plantillas') renderizarPlantillasGestion();
  else if (tipo === 'dashboard') renderDashboard();
  else if (tipo === 'historial') renderHistorial();
  else if (tipo === 'papelera') renderPapeleraInformes();
  const objetivos = { dashboard: 'activityBody', plantillas: 'activeCollectionTitle', historial: 'historialCaption', papelera: 'papeleraCaption' };
  document.getElementById(objetivos[tipo])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ejecutarCuandoLibre(callback) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback, { timeout: 500 });
    return;
  }
  window.setTimeout(callback, 0);
}

/**
 * =============================================================================
 * SECCIÓN 3: INTERFAZ DEL GESTOR DE PERFILES
 * Funciones para renderizar la vista de gestión de perfiles.
 * =============================================================================
 */

function mostrarGestorPerfiles() {
  cambiarVista('perfiles');
  marcarNavActiva(null);
  renderizarColeccionesPlantillas();
  renderizarPlantillasGestion();
}

function normalizarTextoBusqueda(valor) {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}

function obtenerPerfilesVisibles() {
  const consulta = normalizarTextoBusqueda(busquedaPlantillas);
  return perfilesInformes
    .filter((perfil) => {
      if (coleccionPlantillasActivaId === 'favoritas' && !perfil.favorito) return false;
      if (coleccionPlantillasActivaId === 'sin-carpeta' && perfil.coleccionId) return false;
      if (!['todas', 'favoritas', 'sin-carpeta'].includes(coleccionPlantillasActivaId) && perfil.coleccionId !== coleccionPlantillasActivaId) return false;
      const coleccion = coleccionesPlantillas.find((item) => item.id === perfil.coleccionId);
      const contenidoBuscable = [
        perfil.nombre,
        coleccion?.nombre || '',
        ...perfil.bloques.flatMap((bloque) => [
          bloque.titulo,
          obtenerTituloPredeterminadoBloque(bloque.tipo),
          ...(bloque.camposPaciente || []).map((campo) => campo.etiqueta)
        ])
      ].join(' ');
      return !consulta || normalizarTextoBusqueda(contenidoBuscable).includes(consulta);
    })
    .sort((a, b) => Number(b.favorito) - Number(a.favorito) || Number(a.orden) - Number(b.orden) || a.nombre.localeCompare(b.nombre, 'es'));
}

function renderizarColeccionesPlantillas() {
  const lista = document.getElementById('collectionsList');
  if (!lista) return;
  const totalSinCarpeta = perfilesInformes.filter((perfil) => !perfil.coleccionId).length;
  const accesos = [
    { id: 'todas', nombre: 'Todas', icono: iconoUI('grid'), cantidad: perfilesInformes.length },
    { id: 'favoritas', nombre: 'Favoritas', icono: iconoUI('star'), cantidad: perfilesInformes.filter((perfil) => perfil.favorito).length },
    { id: 'sin-carpeta', nombre: 'Sin carpeta', icono: iconoUI('folder'), cantidad: totalSinCarpeta }
  ];
  const htmlAccesos = accesos.map((item) => `<button class="collection-item ${coleccionPlantillasActivaId === item.id ? 'is-active' : ''}" data-drop-kind="${item.id}" type="button" onclick="seleccionarColeccionPlantillas('${item.id}')" ondragover="permitirSoltarPlantillaEnColeccion(event, '${item.id}')" ondragleave="salirColeccionDestino(event)" ondrop="soltarPlantillaEnColeccion(event, '${item.id}')"><span class="collection-icon">${item.icono}</span><span>${item.nombre}</span><small>${item.cantidad}</small></button>`).join('');
  const htmlColecciones = coleccionesPlantillas
    .slice().sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es'))
    .map((coleccion) => {
      const cantidad = perfilesInformes.filter((perfil) => perfil.coleccionId === coleccion.id).length;
      return `<div class="collection-row"><button class="collection-item ${coleccionPlantillasActivaId === coleccion.id ? 'is-active' : ''}" type="button" onclick="seleccionarColeccionPlantillas('${coleccion.id}')" ondragover="permitirSoltarPlantillaEnColeccion(event, '${coleccion.id}')" ondragleave="salirColeccionDestino(event)" ondrop="soltarPlantillaEnColeccion(event, '${coleccion.id}')"><span class="collection-icon collection-color" style="--collection-color:${coleccion.color}">${iconoUI('folder')}</span><span>${escaparHTML(coleccion.nombre)}</span><small>${cantidad}</small></button><button class="collection-menu-button" type="button" title="Editar ${escaparHTML(coleccion.nombre)}" aria-label="Editar colección ${escaparHTML(coleccion.nombre)}" onclick="abrirRenombrarColeccion('${coleccion.id}')">${iconoUI('more')}</button></div>`;
    }).join('');
  lista.innerHTML = `${htmlAccesos}<div class="collections-divider"><span>Mis colecciones</span></div>${htmlColecciones || '<p class="collections-empty">Crea una colección para agrupar plantillas.</p>'}`;
}

function renderizarPlantillasGestion() {
  const cardContainer = document.getElementById('perfiles-card-container');
  if (!cardContainer) return;
  const perfilesVisibles = obtenerPerfilesVisibles();
  const pagina = obtenerPaginaValida(paginasListados.plantillas, perfilesVisibles.length, TAMANOS_PAGINA.plantillas);
  paginasListados.plantillas = pagina;
  const inicioPagina = (pagina - 1) * TAMANOS_PAGINA.plantillas;
  const perfilesPagina = perfilesVisibles.slice(inicioPagina, inicioPagina + TAMANOS_PAGINA.plantillas);
  const coleccionActiva = coleccionesPlantillas.find((coleccion) => coleccion.id === coleccionPlantillasActivaId);
  const titulosEspeciales = { todas: 'Todas las plantillas', favoritas: 'Plantillas favoritas', 'sin-carpeta': 'Sin carpeta' };
  const titulo = document.getElementById('activeCollectionTitle');
  const subtitulo = document.getElementById('activeCollectionCaption');
  if (titulo) titulo.textContent = coleccionActiva?.nombre || titulosEspeciales[coleccionPlantillasActivaId] || 'Plantillas';
  if (subtitulo) subtitulo.textContent = `${perfilesVisibles.length} plantilla${perfilesVisibles.length === 1 ? '' : 's'}${busquedaPlantillas ? ' encontrada' + (perfilesVisibles.length === 1 ? '' : 's') : ''}. Selecciona varias y arrastra cualquiera a una colección o a Favoritas.`;
  if (perfilesVisibles.length === 0) {
    const mensaje = busquedaPlantillas ? 'No hay resultados para esta búsqueda.' : 'Esta colección todavía está vacía.';
    cardContainer.innerHTML = `<div class="profiles-empty"><span class="profiles-empty-icon">${iconoUI(busquedaPlantillas ? 'search' : 'file-plus')}</span><strong>${mensaje}</strong><span>${busquedaPlantillas ? 'Prueba con otro nombre o limpia la búsqueda.' : 'Puedes arrastrar una plantilla aquí o crear una nueva.'}</span>${busquedaPlantillas ? `<button class="editor-action-btn secondary" type="button" onclick="limpiarBusquedaPlantillas()">${iconoUI('close')} Limpiar búsqueda</button>` : `<button class="editor-action-btn" type="button" onclick="crearNuevoPerfil()">${iconoUI('file-plus')} Crear plantilla</button>`}</div>`;
    renderizarPaginacion('profilesPagination', 'plantillas', 0, TAMANOS_PAGINA.plantillas);
    renderizarBarraSeleccionPlantillas([]);
    return;
  }
  cardContainer.innerHTML = perfilesPagina.map((perfil) => {
    const coleccion = coleccionesPlantillas.find((item) => item.id === perfil.coleccionId);
    const seleccionada = plantillasSeleccionadasIds.has(perfil.id);
    return `
    <article class="profile-card-template ${seleccionada ? 'is-selected' : ''}" draggable="true" data-profile-id="${perfil.id}" aria-selected="${seleccionada}" ondragstart="iniciarArrastrePlantilla(event, '${perfil.id}')" ondragend="finalizarArrastrePlantilla(event)" onclick="manejarClickSeleccionPlantilla(event, '${perfil.id}')">
      <label class="profile-select-control" title="Seleccionar ${escaparHTML(perfil.nombre)}" onclick="event.stopPropagation()"><input type="checkbox" ${seleccionada ? 'checked' : ''} aria-label="Seleccionar ${escaparHTML(perfil.nombre)}" onchange="alternarSeleccionPlantilla('${perfil.id}', this.checked, event)" /><span aria-hidden="true">✓</span></label>
      <button class="profile-favorite-btn ${perfil.favorito ? 'is-favorite' : ''}" type="button" title="${perfil.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}" aria-label="${perfil.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}" aria-pressed="${perfil.favorito}" onclick="alternarFavoritoPlantilla('${perfil.id}')">${iconoUI('star')}</button>
      <button class="profile-copy-icon" type="button" title="Copiar plantilla" aria-label="Copiar plantilla ${escaparHTML(perfil.nombre)}" onclick="abrirCopiarPlantilla('${perfil.id}')">${iconoUI('copy')}</button>
      <div class="profile-card-icon" aria-hidden="true">${iconoUI('file')}</div>
      <div class="profile-card-body">
        <button class="profile-name-button" type="button" title="Cambiar nombre" onclick="abrirRenombrarPlantilla('${perfil.id}')">${escaparHTML(perfil.nombre)}</button>
        <p>${perfil.paginas.length} página${perfil.paginas.length === 1 ? '' : 's'} · ${perfil.bloques.length} bloque${perfil.bloques.length === 1 ? '' : 's'} configurado${perfil.bloques.length === 1 ? '' : 's'}.</p>
        <span class="profile-collection-badge">${coleccion ? `<i style="--collection-color:${coleccion.color}"></i>${escaparHTML(coleccion.nombre)}` : 'Sin carpeta'}</span>
      </div>
      <div class="profile-card-actions">
        <button class="editor-action-btn secondary" type="button" onclick="diseñarEstructuraPlantilla('${perfil.id}')">${iconoUI('palette')} Editar plantilla</button>
        <label class="profile-move-control" title="Mover a otra colección"><span class="sr-only">Mover ${escaparHTML(perfil.nombre)} a</span><select aria-label="Mover ${escaparHTML(perfil.nombre)} a otra colección" onchange="moverPlantillaDesdeSelector('${perfil.id}', this.value)"><option value="" disabled selected>Mover a…</option><option value="sin-carpeta">Sin carpeta</option>${coleccionesPlantillas.map((item) => `<option value="${item.id}">${escaparHTML(item.nombre)}</option>`).join('')}</select></label>
        <button class="profile-delete-btn" type="button" onclick="eliminarPerfil('${perfil.id}')">${iconoUI('trash')} Eliminar</button>
      </div>
    </article>`;
  }).join('');
  renderizarPaginacion('profilesPagination', 'plantillas', perfilesVisibles.length, TAMANOS_PAGINA.plantillas);
  renderizarBarraSeleccionPlantillas(perfilesPagina.map((perfil) => perfil.id));
}

function obtenerIdsPlantillasPaginaActual() {
  const perfilesVisibles = obtenerPerfilesVisibles();
  const pagina = obtenerPaginaValida(paginasListados.plantillas, perfilesVisibles.length, TAMANOS_PAGINA.plantillas);
  const inicio = (pagina - 1) * TAMANOS_PAGINA.plantillas;
  return perfilesVisibles.slice(inicio, inicio + TAMANOS_PAGINA.plantillas).map((perfil) => perfil.id);
}

function renderizarBarraSeleccionPlantillas(idsPagina = obtenerIdsPlantillasPaginaActual()) {
  const estado = document.getElementById('profilesSelectionStatus');
  const botonPagina = document.getElementById('selectProfilesPageButton');
  const botonLimpiar = document.getElementById('clearProfilesSelectionButton');
  const seleccionadasValidas = Array.from(plantillasSeleccionadasIds).filter((id) => perfilesInformes.some((perfil) => perfil.id === id));
  plantillasSeleccionadasIds = new Set(seleccionadasValidas);
  const todasPagina = idsPagina.length > 0 && idsPagina.every((id) => plantillasSeleccionadasIds.has(id));
  if (estado) estado.textContent = seleccionadasValidas.length
    ? `${seleccionadasValidas.length} plantilla${seleccionadasValidas.length === 1 ? '' : 's'} seleccionada${seleccionadasValidas.length === 1 ? '' : 's'}. Arrastra cualquiera para mover el grupo.`
    : 'Selecciona varias plantillas para arrastrarlas juntas.';
  if (botonPagina) {
    botonPagina.innerHTML = `<span class="profiles-select-page-icon" aria-hidden="true"><svg class="ui-icon"><use href="#icon-select-page"></use></svg></span><span>${todasPagina ? 'Quitar selección de esta página' : 'Seleccionar esta página'}</span>`;
    botonPagina.setAttribute('aria-pressed', String(todasPagina));
    botonPagina.disabled = idsPagina.length === 0;
  }
  if (botonLimpiar) botonLimpiar.hidden = seleccionadasValidas.length === 0;
}

function sincronizarSeleccionVisualPlantillas() {
  document.querySelectorAll('#perfiles-card-container .profile-card-template').forEach((tarjeta) => {
    const seleccionada = plantillasSeleccionadasIds.has(tarjeta.dataset.profileId);
    tarjeta.classList.toggle('is-selected', seleccionada);
    tarjeta.setAttribute('aria-selected', String(seleccionada));
    const checkbox = tarjeta.querySelector('.profile-select-control input');
    if (checkbox) checkbox.checked = seleccionada;
  });
  renderizarBarraSeleccionPlantillas();
}

function alternarSeleccionPlantilla(perfilId, seleccionada, event = null) {
  event?.stopPropagation();
  if (seleccionada) plantillasSeleccionadasIds.add(perfilId);
  else plantillasSeleccionadasIds.delete(perfilId);
  sincronizarSeleccionVisualPlantillas();
}

function manejarClickSeleccionPlantilla(event, perfilId) {
  if (event.target.closest('button, select, label, input')) return;
  if (!(event.ctrlKey || event.metaKey)) return;
  alternarSeleccionPlantilla(perfilId, !plantillasSeleccionadasIds.has(perfilId), event);
}

function alternarSeleccionPaginaPlantillas() {
  const ids = obtenerIdsPlantillasPaginaActual();
  const todasSeleccionadas = ids.length > 0 && ids.every((id) => plantillasSeleccionadasIds.has(id));
  ids.forEach((id) => todasSeleccionadas ? plantillasSeleccionadasIds.delete(id) : plantillasSeleccionadasIds.add(id));
  sincronizarSeleccionVisualPlantillas();
}

function limpiarSeleccionPlantillas() {
  plantillasSeleccionadasIds.clear();
  sincronizarSeleccionVisualPlantillas();
}

function seleccionarColeccionPlantillas(coleccionId) {
  coleccionPlantillasActivaId = coleccionId;
  paginasListados.plantillas = 1;
  renderizarColeccionesPlantillas();
  renderizarPlantillasGestion();
}

function actualizarBusquedaPlantillas(valor) {
  busquedaPlantillas = valor;
  paginasListados.plantillas = 1;
  renderizarPlantillasGestion();
}

function limpiarBusquedaPlantillas() {
  busquedaPlantillas = '';
  paginasListados.plantillas = 1;
  const input = document.getElementById('profilesSearchInput');
  if (input) { input.value = ''; input.focus(); }
  renderizarPlantillasGestion();
}

function alternarFavoritoPlantilla(perfilId) {
  const perfil = perfilesInformes.find((item) => item.id === perfilId);
  if (!perfil) return;
  perfil.favorito = !perfil.favorito;
  perfil.modificadoEn = new Date().toISOString();
  guardarPerfiles();
  renderizarColeccionesPlantillas();
  renderizarPlantillasGestion();
}

function iniciarArrastrePlantilla(event, perfilId) {
  if (!plantillasSeleccionadasIds.has(perfilId)) {
    plantillasSeleccionadasIds = new Set([perfilId]);
    sincronizarSeleccionVisualPlantillas();
  }
  perfilArrastradoId = perfilId;
  perfilesArrastradosIds = Array.from(plantillasSeleccionadasIds).filter((id) => perfilesInformes.some((perfil) => perfil.id === id));
  document.querySelectorAll('#perfiles-card-container .profile-card-template').forEach((tarjeta) => tarjeta.classList.toggle('is-dragging', perfilesArrastradosIds.includes(tarjeta.dataset.profileId)));
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', perfilId);
  event.dataTransfer.setData('application/x-generador-plantillas', JSON.stringify(perfilesArrastradosIds));
  if (perfilesArrastradosIds.length > 1) {
    indicadorArrastrePlantillas = document.createElement('div');
    indicadorArrastrePlantillas.className = 'profiles-drag-indicator';
    indicadorArrastrePlantillas.textContent = `${perfilesArrastradosIds.length} plantillas`;
    document.body.appendChild(indicadorArrastrePlantillas);
    event.dataTransfer.setDragImage(indicadorArrastrePlantillas, 24, 20);
  }
}

function finalizarArrastrePlantilla(event) {
  document.querySelectorAll('#perfiles-card-container .profile-card-template.is-dragging').forEach((tarjeta) => tarjeta.classList.remove('is-dragging'));
  document.querySelectorAll('.collection-item.is-drop-target').forEach((item) => item.classList.remove('is-drop-target'));
  indicadorArrastrePlantillas?.remove();
  indicadorArrastrePlantillas = null;
  perfilArrastradoId = null;
  perfilesArrastradosIds = [];
}

function permitirSoltarPlantillaEnColeccion(event, coleccionId) {
  if ((!perfilArrastradoId && !perfilesArrastradosIds.length) || coleccionId === 'todas') return;
  event.preventDefault();
  event.currentTarget.classList.add('is-drop-target');
  event.dataTransfer.dropEffect = 'move';
}

function salirColeccionDestino(event) {
  event.currentTarget.classList.remove('is-drop-target');
}

function soltarPlantillaEnColeccion(event, coleccionId) {
  event.preventDefault();
  event.currentTarget.classList.remove('is-drop-target');
  let idsTransferidos = [];
  try { idsTransferidos = JSON.parse(event.dataTransfer.getData('application/x-generador-plantillas') || '[]'); } catch (error) { idsTransferidos = []; }
  const ids = (perfilesArrastradosIds.length ? perfilesArrastradosIds : idsTransferidos.length ? idsTransferidos : [perfilArrastradoId || event.dataTransfer.getData('text/plain')]).filter(Boolean);
  const perfiles = perfilesInformes.filter((item) => ids.includes(item.id));
  if (!perfiles.length || coleccionId === 'todas') return;
  const fecha = new Date().toISOString();
  if (coleccionId === 'favoritas') {
    perfiles.forEach((perfil) => {
      perfil.favorito = true;
      perfil.modificadoEn = fecha;
    });
  } else {
    perfiles.forEach((perfil) => {
      perfil.coleccionId = coleccionId === 'sin-carpeta' ? null : coleccionId;
      perfil.modificadoEn = fecha;
    });
  }
  guardarPerfiles();
  plantillasSeleccionadasIds.clear();
  renderizarColeccionesPlantillas();
  renderizarPlantillasGestion();
  if (coleccionId === 'favoritas') mostrarAvisoBreve(`${perfiles.length} plantilla${perfiles.length === 1 ? '' : 's'} agregada${perfiles.length === 1 ? '' : 's'} a Favoritas.`);
  else mostrarAvisoBreve(`${perfiles.length} plantilla${perfiles.length === 1 ? '' : 's'} movida${perfiles.length === 1 ? '' : 's'} correctamente.`);
}

function moverPlantillaDesdeSelector(perfilId, coleccionId) {
  const perfil = perfilesInformes.find((item) => item.id === perfilId);
  if (!perfil) return;
  perfil.coleccionId = coleccionId === 'sin-carpeta' ? null : coleccionId;
  perfil.modificadoEn = new Date().toISOString();
  guardarPerfiles();
  renderizarColeccionesPlantillas();
  renderizarPlantillasGestion();
  mostrarAvisoBreve(`“${perfil.nombre}” se movió correctamente.`);
}

function diseñarEstructuraPlantilla(idPerfil) {
  const perfil = perfilesInformes.find((item) => item.id === idPerfil);
  if (!perfil) return;
  const entrandoAlDisenador = document.getElementById('designer-view')?.style.display === 'none';
  if (!sesionDisenadorPlantilla || sesionDisenadorPlantilla.perfilId !== idPerfil) {
    sesionDisenadorPlantilla = {
      perfilId: idPerfil,
      original: perfilNuevoPendienteId === idPerfil ? null : clonarProfundo(perfil)
    };
  }
  cambiarVista('designer');
  const titulo = document.getElementById('designerProfileName');
  const tituloSidebar = document.getElementById('designerSidebarTemplateName');
  const lienzo = document.getElementById('designerBlocks');
  if (titulo) titulo.textContent = `Diseñador de plantilla: ${perfil.nombre}`;
  if (tituloSidebar) tituloSidebar.textContent = perfil.nombre;
  const colorHoja = document.getElementById('designerPageColor');
  const enfasisHoja = document.getElementById('designerAccentColor');
  if (colorHoja) colorHoja.value = perfil.hoja.colorFondo;
  if (enfasisHoja) enfasisHoja.value = perfil.hoja.colorEnfasis;
  const valorColorHoja = document.getElementById('designerPageColorValue');
  const valorEnfasisHoja = document.getElementById('designerAccentColorValue');
  if (valorColorHoja) valorColorHoja.value = perfil.hoja.colorFondo;
  if (valorEnfasisHoja) valorEnfasisHoja.value = perfil.hoja.colorEnfasis;
  if (!lienzo) return;
  lienzo.dataset.profileId = idPerfil;
  const eliminadas = new Set(perfil.paginasEliminadas || []);
  lienzo.innerHTML = perfil.paginas.map((pagina, indice) => {
    const eliminada = eliminadas.has(pagina.id);
    const identificador = indice === 0 ? crearHTMLIdentificadorPlantilla(perfil, true) : '';
    return `<section class="designer-page-canvas body-page ${eliminada ? 'is-deleted-template-page' : ''}" data-designer-page-id="${pagina.id}" onclick="seleccionarHojaDisenador('${pagina.id}'); cerrarOpcionesBloqueDisenador()"><span class="designer-page-label">${escaparHTML(pagina.nombre)}</span>${identificador}${!eliminada ? `<button class="designer-page-duplicate" type="button" title="Duplicar página" aria-label="Duplicar página ${escaparHTML(pagina.nombre)}" onclick="event.stopPropagation(); duplicarPaginaPlantilla('${pagina.id}')">${iconoUI('copy')}</button>` : ''}<button class="designer-page-delete" type="button" title="${eliminada ? 'Restaurar página' : 'Eliminar página'}" aria-label="${eliminada ? 'Restaurar página' : 'Eliminar página'}" onclick="event.stopPropagation(); ${eliminada ? `restaurarPaginaPlantilla('${pagina.id}')` : `eliminarPaginaPlantilla('${pagina.id}')`}">${iconoUI(eliminada ? 'undo' : 'close')}</button>${eliminada ? `<button class="designer-page-destroy" type="button" title="Eliminar definitivamente" aria-label="Eliminar página definitivamente" onclick="event.stopPropagation(); eliminarPaginaPlantillaDefinitivamente('${pagina.id}')">${iconoUI('trash')}</button>` : ''}${perfil.bloques.filter((bloque) => bloque.paginaId === pagina.id && !(bloque.tipo === 'bloque-titulo-principal' && indice > 0)).map(crearHTMLBloqueDisenador).join('')}<button class="designer-page-empty-action" type="button" onclick="event.stopPropagation(); ${eliminada ? `restaurarPaginaPlantilla('${pagina.id}')` : `seleccionarHojaDisenador('${pagina.id}')`}">${eliminada ? 'Restaurar esta hoja' : `Hoja ${indice + 1}`}</button></section>`;
  }).join('');
  seleccionarHojaDisenador(perfil.paginas.find((pagina) => !eliminadas.has(pagina.id))?.id || perfil.paginas[0]?.id);
  actualizarVistaPreviaDisenador();
  renderPaginasEliminadasPlantilla(perfil);
  renderizarNavegadorDisenador(perfil);
  renderizarPaletasColoresRecientes(document.getElementById('designer-view'));
  if (entrandoAlDisenador) {
    document.querySelectorAll('#designerCatalogPanel .designer-category').forEach((categoria) => { categoria.open = false; });
    const herramientasAvanzadas = document.querySelector('.designer-toolbox .designer-assistant');
    if (herramientasAvanzadas) herramientasAvanzadas.open = true;
    const aparienciaHoja = document.querySelector('.designer-toolbox .designer-controls-section');
    if (aparienciaHoja) aparienciaHoja.open = true;
    const paginasYCapas = document.querySelector('.designer-toolbox .designer-navigator');
    if (paginasYCapas) paginasYCapas.open = true;
    const buscadorCatalogo = document.getElementById('designerCatalogSearch');
    if (buscadorCatalogo) buscadorCatalogo.value = '';
    filtrarCatalogoDisenador('');
    enfocarSeccionSidebarDisenador('paginas');
  }
  if (bloqueDisenadorSeleccionadoId && perfil.bloques.some((bloque) => bloque.id === bloqueDisenadorSeleccionadoId)) {
    const seleccionConservada = new Set(Array.from(bloquesDisenadorSeleccionados).filter((id) => perfil.bloques.some((bloque) => bloque.id === id)));
    seleccionarBloqueDisenador(bloqueDisenadorSeleccionadoId);
    if (seleccionConservada.size > 1) {
      bloquesDisenadorSeleccionados = seleccionConservada;
      document.querySelectorAll('#designerBlocks .designer-block').forEach((elemento) => {
        const activo = bloquesDisenadorSeleccionados.has(elemento.dataset.blockId);
        elemento.classList.toggle('is-selected-block', activo);
        elemento.classList.toggle('is-multi-selected', activo);
      });
    }
  } else cerrarOpcionesBloqueDisenador();
  window.setTimeout(() => revisarRecuperacionDisenador(perfil), 0);
}

function crearHTMLIdentificadorPlantilla(perfil, modoDisenador = false) {
  const estilo = resolverIdentificadorPlantilla(perfil);
  const nombreAutomatico = String(perfil?.nombre || perfil?.perfilNombre || 'Plantilla');
  const textoPredeterminado = estilo.etiqueta?.nombre || nombreAutomatico;
  const texto = estilo.texto === null ? textoPredeterminado : estilo.texto;
  const etiqueta = escaparHTML(texto);
  return `<${modoDisenador ? 'button' : 'div'} class="template-name-badge ${modoDisenador ? 'is-designer-badge' : ''}" ${modoDisenador ? 'type="button" title="Editar texto y etiqueta del identificador" aria-label="Editar identificador de la plantilla" onclick="event.stopPropagation(); seleccionarIdentificadorPlantilla()"' : ''} style="--template-badge-bg:${estilo.colorFondo};--template-badge-text:${estilo.colorTexto}">${etiqueta}</${modoDisenador ? 'button' : 'div'}>`;
}

function crearHTMLBloqueDisenador(bloque) {
  const contenido = crearContenidoBloqueMaquetacion(bloque, true);
  const seleccionado = bloquesDisenadorSeleccionados.has(bloque.id) || bloque.id === bloqueDisenadorSeleccionadoId;
  return `<article class="designer-block layout-block ${bloque.tipo} ${bloque.visible ? '' : 'is-designer-hidden'} ${seleccionado ? 'is-selected-block' : ''} ${bloquesDisenadorSeleccionados.size > 1 && seleccionado ? 'is-multi-selected' : ''} ${bloque.bloqueado ? 'is-locked' : ''}" data-block-id="${bloque.id}" data-block-type="${bloque.tipo}" data-visible="${bloque.visible}" data-layer="${bloque.capa}" data-locked="${bloque.bloqueado}" style="left:${bloque.x}px;top:${bloque.y}px;width:${bloque.width}px;height:${bloque.height}px;z-index:${bloque.capa};background-color:${normalizarColorFondo(bloque.colorFondo, '#ffffff')};--block-font-size:${bloque.fontSize}px;--block-text-align:${bloque.alineacion}" onclick="event.stopPropagation(); seleccionarBloqueDisenador('${bloque.id}', event)" onpointerdown="iniciarArrastreBloque(event, this, true)">${contenido}<span class="block-drag-handle" title="Arrastra para mover" aria-label="Mover bloque">⠿</span><button class="block-corner-delete" type="button" title="Eliminar bloque" aria-label="Eliminar bloque" onclick="event.stopPropagation(); eliminarBloqueDisenador('${bloque.id}')">×</button>${crearControlesRedimensionBloque(true, bloque.tipo)}</article>`;
}

function renderizarNavegadorDisenador(perfil = null) {
  const lista = document.getElementById('designerNavigatorList');
  const contador = document.getElementById('designerNavigatorCount');
  const perfilActivo = perfil || perfilesInformes.find((item) => item.id === document.getElementById('designerBlocks')?.dataset.profileId);
  if (!lista || !perfilActivo) return;
  const eliminadas = new Set(perfilActivo.paginasEliminadas || []);
  if (contador) contador.textContent = String(perfilActivo.paginas.length);
  lista.innerHTML = perfilActivo.paginas.map((pagina, indice) => {
    const bloques = perfilActivo.bloques.filter((bloque) => bloque.paginaId === pagina.id).sort((a, b) => b.capa - a.capa);
    return `<section class="designer-navigator-page ${eliminadas.has(pagina.id) ? 'is-deleted' : ''}" data-navigator-page-id="${pagina.id}"><button type="button" onclick="irAPaginaDisenador('${pagina.id}')"><span>${indice + 1}</span><strong>${escaparHTML(pagina.nombre)}</strong><small>${bloques.length}</small></button><div>${bloques.map((bloque) => `<button class="designer-navigator-layer ${bloque.id === bloqueDisenadorSeleccionadoId ? 'is-active' : ''}" type="button" onclick="irABloqueDisenador('${pagina.id}','${bloque.id}')"><span aria-hidden="true">${iconoUI(bloque.visible ? 'eye' : 'eye-off')}</span><span>${escaparHTML(bloque.titulo || obtenerTituloPredeterminadoBloque(bloque.tipo))}</span><small>${bloque.capa}</small></button>`).join('') || '<span class="designer-navigator-empty">Sin bloques</span>'}</div></section>`;
  }).join('');
}

function irAPaginaDisenador(paginaId) {
  seleccionarHojaDisenador(paginaId);
  document.querySelector(`#designerBlocks .designer-page-canvas[data-designer-page-id="${paginaId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function irABloqueDisenador(paginaId, bloqueId) {
  irAPaginaDisenador(paginaId);
  seleccionarBloqueDisenador(bloqueId);
  document.querySelector(`#designerBlocks .designer-block[data-block-id="${bloqueId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const perfil = perfilesInformes.find((item) => item.id === document.getElementById('designerBlocks')?.dataset.profileId);
  renderizarNavegadorDisenador(perfil);
}

function duplicarPaginaPlantilla(paginaId) {
  guardarEstructuraPlantilla(false);
  const perfilId = document.getElementById('designerBlocks')?.dataset.profileId;
  const perfil = perfilesInformes.find((item) => item.id === perfilId);
  if (!perfil) return;
  const indice = perfil.paginas.findIndex((pagina) => pagina.id === paginaId);
  if (indice < 0) return;
  const origen = perfil.paginas[indice];
  const nuevaPagina = { id: crearIdUnico('pagina'), nombre: `${origen.nombre} copia` };
  perfil.paginas.splice(indice + 1, 0, nuevaPagina);
  const copias = perfil.bloques.filter((bloque) => bloque.paginaId === paginaId).map((bloque) => ({
    ...clonarProfundo(bloque),
    id: crearIdUnico('bloque'),
    paginaId: nuevaPagina.id
  }));
  perfil.bloques.push(...copias);
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarHojaDisenador(nuevaPagina.id);
  mostrarAvisoBreve(`Se duplicó “${origen.nombre}” con todos sus bloques.`);
}

function crearControlesRedimensionBloque(modoDisenador, tipoBloque = '') {
  const direcciones = tipoBloque === 'bloque-figura'
    ? ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
    : ['nw', 'ne', 'sw', 'se'];
  return direcciones.map((direccion) => `<span class="block-resize-handle resize-${direccion}" role="button" aria-label="Ajustar tamaño del bloque" title="Arrastra para ajustar el tamaño" onpointerdown="iniciarRedimensionBloque(event, this.parentElement, '${direccion}', ${modoDisenador})"></span>`).join('');
}

function crearContenidoDatosPaciente(bloque, titulo, modoDisenador = false) {
  const campos = normalizarCamposPaciente(bloque.camposPaciente);
  const contenido = campos.map((campo) => {
    if (modoDisenador) {
      return `<div class="patient-data-field is-preview" data-patient-field-id="${campo.id}"><span>${escaparHTML(campo.etiqueta)}</span><strong>Completar en el informe</strong></div>`;
    }
    const clave = obtenerClaveCampoPaciente(bloque, campo);
    return `<label class="patient-data-field" data-patient-field-id="${campo.id}"><span>${escaparHTML(campo.etiqueta)}</span><input class="report-field patient-data-input" data-report-field="${clave}" type="text" autocomplete="off" placeholder="Escribe aquí" /></label>`;
  }).join('');
  return `<div class="patient-data-block">${titulo}<div class="layout-accent-line"></div><div class="patient-data-grid">${contenido}</div></div>`;
}

function crearContenidoBloqueMaquetacion(bloque, modoDisenador = false) {
  const titulo = `<h2 ${modoDisenador ? `contenteditable="true" data-direct-block-text oninput="actualizarTextoBloqueDisenador(event, this, 'titulo')"` : ''}>${escaparHTML(bloque.titulo)}</h2>`;
  if (bloque.tipo === 'bloque-titulo-principal') return `<div class="layout-main-title">${titulo}</div>`;
  if (bloque.tipo === 'bloque-encabezado') return `<div class="layout-heading">${titulo}<div class="layout-accent-line"></div></div>`;
  if (bloque.tipo === 'bloque-texto-libre') return `${titulo}<div class="layout-accent-line"></div><div class="${modoDisenador ? 'designer-free-text' : 'profile-rich-editor'}" ${modoDisenador ? `contenteditable="true" data-direct-block-text oninput="actualizarTextoBloqueDisenador(event, this, 'contenidoDefecto')"` : `contenteditable="true" data-rich-block="${bloque.id}" oninput="paginarEditorEnTiempoReal(this)" onkeydown="manejarBackspaceContinuacion(event, this)"`}>${bloque.contenidoDefecto || ''}</div>`;
  if (bloque.tipo === 'bloque-tabla-moderna') return `${titulo}${modoDisenador ? crearHTMLTablaDisenador(bloque) : crearHTMLTablaRellenable(bloque)}`;
  if (bloque.tipo === 'bloque-datos-paciente') return crearContenidoDatosPaciente(bloque, titulo, modoDisenador);
  if (bloque.tipo === 'bloque-imagenes-grid') return `<div class="template-image-grid-header">${titulo}<div class="template-image-grid-rule"></div></div><div class="designer-photo-grid" role="grid" aria-label="Cuadrícula de imágenes, dos columnas por tres filas">${Array.from({ length: IMAGENES_POR_PAGINA }, (_, indice) => `<span role="gridcell">Imagen ${indice + 1}</span>`).join('')}</div>`;
  if (bloque.tipo === 'bloque-banner') return bloque.imagenSrc ? `<img class="template-banner-image" src="${escaparHTML(normalizarImagenBanner(bloque.imagenSrc))}" alt="${escaparHTML(bloque.titulo)}" draggable="false" />` : (modoDisenador ? '<div class="template-banner-placeholder">Selecciona el bloque y carga una imagen / banner</div>' : '');
  if (bloque.tipo === 'bloque-logo') return crearContenidoLogoClinica(modoDisenador);
  if (bloque.tipo === 'bloque-clinica') return crearContenidoInformacionClinica(titulo);
  if (bloque.tipo === 'bloque-diplomados') return crearContenidoDiplomadosBloque(bloque, titulo);
  if (bloque.tipo === 'bloque-figura') return crearContenidoFiguraBloque(bloque);
  const identidad = bloque.contenidoDefecto || 'firma-simple';
  if (modoDisenador) return `<div class="identity-card identity-card-output"><span class="identity-eyebrow">${escaparHTML(etiquetaTipoIdentidad(identidad))}</span><div class="identity-preview">${crearValorIdentidad(identidad)}</div></div>`;
  return `<div class="identity-card identity-card-output"><span class="identity-eyebrow">Datos profesionales</span><div class="identity-preview">${crearValorIdentidad(identidad)}</div></div>`;
}

let celdasTablaSeleccionadas = new Set();
let tablaSeleccionBloqueId = null;

function obtenerEstiloCeldaTabla(tabla, clave) {
  const estilo = tabla.estilosCeldas?.[clave] || {};
  return `${estilo.backgroundColor ? `background-color:${normalizarColorFondo(estilo.backgroundColor, '#ffffff')};` : ''}${estilo.color ? `color:${normalizarColorFondo(estilo.color, '#1f2730')};` : ''}${estilo.borderColor ? `border-color:${normalizarColorFondo(estilo.borderColor, '#cbd6d2')};` : ''}`;
}

function crearHTMLTablaDisenador(bloque) {
  const tabla = normalizarTablaMediciones(bloque.contenidoDefecto);
  return `<div class="designer-word-table-wrap"><table class="designer-word-table" data-table-block-id="${bloque.id}"><thead><tr><th class="table-select-all" title="Seleccionar tabla" onclick="seleccionarTablaCompletaDisenador(event, '${bloque.id}')">▦</th>${tabla.cabeceras.map((cabecera, columna) => `<th class="table-column-header" data-table-key="h-${columna}" style="${obtenerEstiloCeldaTabla(tabla, `h-${columna}`)}" onclick="seleccionarColumnaTablaDisenador(event, '${bloque.id}', ${columna})"><span contenteditable="true" oninput="actualizarCeldaTablaDisenador(event, '${bloque.id}', -1, ${columna})">${escaparHTML(cabecera)}</span></th>`).join('')}</tr></thead><tbody>${tabla.filas.map((fila, indiceFila) => `<tr><th class="table-row-header" title="Seleccionar fila" onclick="seleccionarFilaTablaDisenador(event, '${bloque.id}', ${indiceFila})">${indiceFila + 1}</th>${tabla.cabeceras.map((_, columna) => `<td data-table-key="${indiceFila}-${columna}" style="${obtenerEstiloCeldaTabla(tabla, `${indiceFila}-${columna}`)}" onclick="seleccionarCeldaTablaDisenador(event, this, '${bloque.id}', ${indiceFila}, ${columna})"><span contenteditable="true" oninput="actualizarCeldaTablaDisenador(event, '${bloque.id}', ${indiceFila}, ${columna})">${escaparHTML(fila[columna] || '')}</span></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function prepararSeleccionTabla(bloqueId, conservar = false) {
  if (bloqueDisenadorSeleccionadoId !== bloqueId) seleccionarBloqueDisenador(bloqueId);
  if (tablaSeleccionBloqueId !== bloqueId || !conservar) celdasTablaSeleccionadas = new Set();
  tablaSeleccionBloqueId = bloqueId;
}

function seleccionarCeldaTablaDisenador(event, celda, bloqueId, fila, columna) {
  event.stopPropagation();
  const conservar = event.ctrlKey || event.metaKey;
  prepararSeleccionTabla(bloqueId, conservar);
  if (event.shiftKey) {
    event.preventDefault();
    seleccionarClavesFilaTabla(bloqueId, fila);
  } else {
    const clave = `${fila}-${columna}`;
    if (conservar && celdasTablaSeleccionadas.has(clave)) celdasTablaSeleccionadas.delete(clave);
    else celdasTablaSeleccionadas.add(clave);
  }
  pintarSeleccionTablaDisenador();
}

function seleccionarClavesFilaTabla(bloqueId, fila) {
  const { bloque } = obtenerBloqueDisenador(bloqueId);
  const tabla = bloque && normalizarTablaMediciones(bloque.contenidoDefecto);
  if (!tabla) return;
  tabla.cabeceras.forEach((_, columna) => celdasTablaSeleccionadas.add(`${fila}-${columna}`));
}

function seleccionarFilaTablaDisenador(event, bloqueId, fila) {
  event.stopPropagation();
  prepararSeleccionTabla(bloqueId, event.ctrlKey || event.metaKey);
  seleccionarClavesFilaTabla(bloqueId, fila);
  pintarSeleccionTablaDisenador();
}

function seleccionarColumnaTablaDisenador(event, bloqueId, columna) {
  if (event.target.closest('[contenteditable="true"]') && !event.shiftKey && !event.ctrlKey && !event.metaKey) return;
  event.stopPropagation();
  if (event.shiftKey) event.preventDefault();
  prepararSeleccionTabla(bloqueId, event.ctrlKey || event.metaKey);
  const { bloque } = obtenerBloqueDisenador(bloqueId);
  const tabla = bloque && normalizarTablaMediciones(bloque.contenidoDefecto);
  if (!tabla) return;
  celdasTablaSeleccionadas.add(`h-${columna}`);
  tabla.filas.forEach((_, fila) => celdasTablaSeleccionadas.add(`${fila}-${columna}`));
  pintarSeleccionTablaDisenador();
}

function seleccionarTablaCompletaDisenador(event, bloqueId) {
  event.stopPropagation();
  prepararSeleccionTabla(bloqueId, event.ctrlKey || event.metaKey);
  const { bloque } = obtenerBloqueDisenador(bloqueId);
  const tabla = bloque && normalizarTablaMediciones(bloque.contenidoDefecto);
  if (!tabla) return;
  tabla.cabeceras.forEach((_, columna) => celdasTablaSeleccionadas.add(`h-${columna}`));
  tabla.filas.forEach((_, fila) => tabla.cabeceras.forEach((__, columna) => celdasTablaSeleccionadas.add(`${fila}-${columna}`)));
  pintarSeleccionTablaDisenador();
}

function pintarSeleccionTablaDisenador() {
  document.querySelectorAll('.designer-word-table [data-table-key]').forEach((celda) => celda.classList.toggle('is-table-cell-selected', celdasTablaSeleccionadas.has(celda.dataset.tableKey)));
}

function actualizarCeldaTablaDisenador(event, bloqueId, fila, columna) {
  event.stopPropagation();
  const { bloque } = obtenerBloqueDisenador(bloqueId);
  if (!bloque) return;
  const tabla = bloque.contenidoDefecto = normalizarTablaMediciones(bloque.contenidoDefecto);
  if (fila < 0) tabla.cabeceras[columna] = event.target.textContent.trim();
  else tabla.filas[fila][columna] = event.target.textContent;
  guardarPerfiles();
}

function etiquetaTipoIdentidad(tipo) {
  return tipo === 'firma-digital' || tipo === 'firma-png' ? 'Firma digital' : tipo === 'rut' ? 'RUT' : tipo === 'registro' ? 'Registro profesional' : 'Firma simple';
}

function crearOpcionesIdentidad(valor) {
  return [
    ['firma-simple', 'Firma simple'],
    ['firma-digital', 'Firma digital'],
    ['rut', 'RUT'],
    ['registro', 'N° registro Colegio Médico Veterinario']
  ].map(([id, etiqueta]) => `<option value="${id}" ${valor === id || (valor === 'firma-png' && id === 'firma-digital') ? 'selected' : ''}>${etiqueta}</option>`).join('');
}

function crearValorIdentidad(tipo) {
  if (tipo === 'firma-digital' || tipo === 'firma-png') {
    return ajustesApp.firmaDigital ? `<img class="identity-signature-image" src="${ajustesApp.firmaDigital}" alt="Firma digital" />` : '<span class="block-empty-state">Carga la firma digital en Configuración</span>';
  }
  if (tipo === 'rut') return `<strong class="identity-text-value">${escaparHTML(ajustesApp.rutMedico || 'RUT no configurado')}</strong>`;
  if (tipo === 'registro') return `<strong class="identity-text-value">${escaparHTML(ajustesApp.registroMedico || 'Registro no configurado')}</strong>`;
  return `<strong class="identity-text-value">${escaparHTML(ajustesApp.firmaSimple || 'Firma simple no configurada')}</strong>`;
}

function actualizarIdentidadBloqueDisenador(select) {
  const preview = select.closest('.identity-card')?.querySelector('[data-identity-preview]');
  if (preview) preview.innerHTML = crearValorIdentidad(select.value);
}

function seleccionarBloqueDisenador(idBloque, event = null) {
  const { bloque } = obtenerBloqueDisenador(idBloque);
  if (!bloque) return;
  const alternar = Boolean(event && (event.ctrlKey || event.metaKey || event.shiftKey));
  if (alternar) {
    if (bloquesDisenadorSeleccionados.has(idBloque) && bloquesDisenadorSeleccionados.size > 1) bloquesDisenadorSeleccionados.delete(idBloque);
    else bloquesDisenadorSeleccionados.add(idBloque);
  } else {
    bloquesDisenadorSeleccionados = new Set([idBloque]);
  }
  bloqueDisenadorSeleccionadoId = idBloque;
  document.querySelectorAll('#designerBlocks .designer-block').forEach((elemento) => {
    const activo = bloquesDisenadorSeleccionados.has(elemento.dataset.blockId);
    elemento.classList.toggle('is-selected-block', activo);
    elemento.classList.toggle('is-multi-selected', activo && bloquesDisenadorSeleccionados.size > 1);
  });
  const catalogo = document.getElementById('designerCatalogPanel');
  const panel = document.getElementById('designerBlockPanel');
  if (catalogo) catalogo.style.display = 'grid';
  if (!panel) return;
  panel.style.display = 'grid';
  panel.innerHTML = crearOpcionesSidebarBloque(bloque);
  renderizarPaletasColoresRecientes(panel);
  enfocarSeccionSidebarDisenador(document.querySelector('.designer-toolbox')?.dataset.activeSection || 'bloques');
  const perfil = perfilesInformes.find((item) => item.id === document.getElementById('designerBlocks')?.dataset.profileId);
  renderizarNavegadorDisenador(perfil);
}

function seleccionarIdentificadorPlantilla() {
  bloqueDisenadorSeleccionadoId = null;
  bloquesDisenadorSeleccionados.clear();
  document.querySelectorAll('#designerBlocks .designer-block').forEach((elemento) => elemento.classList.remove('is-selected-block'));
  document.querySelector('#designerBlocks .template-name-badge')?.classList.add('is-selected');
  const perfil = perfilesInformes.find((item) => item.id === document.getElementById('designerBlocks')?.dataset.profileId);
  const panel = document.getElementById('designerBlockPanel');
  const catalogo = document.getElementById('designerCatalogPanel');
  if (!perfil || !panel) return;
  const identificador = perfil.identificador = normalizarIdentificadorPlantilla(perfil.identificador);
  const etiquetaActiva = obtenerEtiquetaInforme(identificador.etiquetaId);
  const textoPredeterminado = etiquetaActiva?.nombre || perfil.nombre;
  const textoVisible = identificador.texto === null ? textoPredeterminado : identificador.texto;
  const modoTexto = identificador.texto === null ? (etiquetaActiva ? 'Texto de la etiqueta activo' : 'Nombre automático activo') : identificador.texto ? 'Texto personalizado' : 'Identificador sin texto';
  const opcionesEtiquetas = etiquetasInformes.length
    ? `<option value="">Selecciona una etiqueta</option>${etiquetasInformes.map((etiqueta) => `<option value="${escaparHTML(etiqueta.id)}" ${etiqueta.id === identificador.etiquetaId ? 'selected' : ''}>${escaparHTML(etiqueta.nombre)}</option>`).join('')}`
    : '<option value="">Primero crea etiquetas en Configuración</option>';
  if (catalogo) catalogo.style.display = 'grid';
  panel.style.display = 'grid';
  panel.innerHTML = `<button class="designer-panel-back" type="button" onclick="cerrarOpcionesBloqueDisenador()">${iconoUI('arrow-left')} Volver a bloques</button><div class="designer-panel-heading"><span>Primera página</span><strong>Identificador de plantilla</strong></div><p class="designer-table-help">Selecciona una etiqueta para aplicar su color. El texto se puede personalizar solo para esta plantilla.</p><label class="designer-option-field"><span>Etiqueta y color</span><select id="designerIdentifierLabel" onchange="cambiarEtiquetaIdentificadorPlantilla(this.value)" ${etiquetasInformes.length ? '' : 'disabled'}>${opcionesEtiquetas}</select></label><label class="designer-option-field"><span>Texto del identificador</span><input id="designerIdentifierText" type="text" maxlength="80" value="${escaparHTML(textoVisible)}" placeholder="Puede quedar en blanco" oninput="cambiarTextoIdentificadorPlantilla(this.value)" /></label><div class="designer-identifier-text-actions"><button class="designer-use-auto-name" type="button" onclick="restablecerTextoIdentificadorPlantilla()">${etiquetaActiva ? 'Usar texto de la etiqueta' : 'Usar nombre automático'}</button><small id="designerIdentifierTextStatus">${modoTexto}</small></div>${etiquetaActiva ? `<div class="designer-label-selection-preview"><span style="--template-badge-bg:${etiquetaActiva.color};--template-badge-text:${etiquetaActiva.colorTexto}">${escaparHTML(etiquetaActiva.nombre)}</span><small>Color guardado en Configuración</small></div>` : '<p class="designer-table-help">Crea y administra las etiquetas en la sección Etiquetas de Configuración.</p>'}`;
  enfocarSeccionSidebarDisenador(document.querySelector('.designer-toolbox')?.dataset.activeSection || 'bloques');
}

function cambiarEtiquetaIdentificadorPlantilla(etiquetaId) {
  const perfil = perfilesInformes.find((item) => item.id === document.getElementById('designerBlocks')?.dataset.profileId);
  const etiqueta = obtenerEtiquetaInforme(etiquetaId);
  if (!perfil || !etiqueta) return;
  perfil.identificador = normalizarIdentificadorPlantilla({
    ...perfil.identificador,
    etiquetaId: etiqueta.id,
    colorFondo: etiqueta.color,
    colorTexto: etiqueta.colorTexto,
    texto: null
  });
  const distintivo = document.querySelector('#designerBlocks .template-name-badge');
  if (distintivo) {
    distintivo.textContent = etiqueta.nombre;
    distintivo.style.setProperty('--template-badge-bg', etiqueta.color);
    distintivo.style.setProperty('--template-badge-text', etiqueta.colorTexto);
  }
  guardarPerfiles();
  seleccionarIdentificadorPlantilla();
}

function cambiarTextoIdentificadorPlantilla(valor) {
  const perfil = perfilesInformes.find((item) => item.id === document.getElementById('designerBlocks')?.dataset.profileId);
  if (!perfil) return;
  const texto = String(valor ?? '').replace(/[\r\n\t]+/g, ' ').slice(0, 80);
  perfil.identificador = normalizarIdentificadorPlantilla({ ...perfil.identificador, texto });
  const etiqueta = document.querySelector('#designerBlocks .template-name-badge');
  if (etiqueta) etiqueta.textContent = texto;
  const estado = document.getElementById('designerIdentifierTextStatus');
  if (estado) estado.textContent = texto ? 'Texto personalizado' : 'Identificador sin texto';
  guardarPerfiles();
}

function restablecerTextoIdentificadorPlantilla() {
  const perfil = perfilesInformes.find((item) => item.id === document.getElementById('designerBlocks')?.dataset.profileId);
  if (!perfil) return;
  perfil.identificador = normalizarIdentificadorPlantilla({ ...perfil.identificador, texto: null });
  const input = document.getElementById('designerIdentifierText');
  const etiqueta = document.querySelector('#designerBlocks .template-name-badge');
  const estado = document.getElementById('designerIdentifierTextStatus');
  const etiquetaPredefinida = obtenerEtiquetaInforme(perfil.identificador.etiquetaId);
  const textoPredeterminado = etiquetaPredefinida?.nombre || perfil.nombre;
  if (input) input.value = textoPredeterminado;
  if (etiqueta) etiqueta.textContent = textoPredeterminado;
  if (estado) estado.textContent = etiquetaPredefinida ? 'Texto de la etiqueta activo' : 'Nombre automático activo';
  guardarPerfiles();
}

function actualizarTextoBloqueDisenador(event, elemento, propiedad) {
  event.stopPropagation();
  const bloqueElemento = elemento.closest('.designer-block');
  const { bloque } = obtenerBloqueDisenador(bloqueElemento?.dataset.blockId);
  if (!bloque) return;
  bloque[propiedad] = propiedad === 'contenidoDefecto' ? elemento.innerHTML : elemento.textContent.replace(/\s+/g, ' ').trim();
  guardarPerfiles();
  if (propiedad === 'titulo') {
    const encabezado = document.querySelector('#designerBlockPanel .designer-panel-heading strong');
    if (encabezado) encabezado.textContent = bloque.titulo || 'Bloque sin título';
  }
}

function cerrarOpcionesBloqueDisenador() {
  bloqueDisenadorSeleccionadoId = null;
  bloquesDisenadorSeleccionados.clear();
  document.querySelectorAll('#designerBlocks .designer-block').forEach((elemento) => elemento.classList.remove('is-selected-block', 'is-multi-selected'));
  document.querySelector('#designerBlocks .template-name-badge')?.classList.remove('is-selected');
  const catalogo = document.getElementById('designerCatalogPanel');
  const panel = document.getElementById('designerBlockPanel');
  if (catalogo) catalogo.style.display = 'grid';
  if (panel) {
    panel.style.display = 'none';
    panel.innerHTML = '';
  }
  enfocarSeccionSidebarDisenador(document.querySelector('.designer-toolbox')?.dataset.activeSection || 'bloques');
}

function crearEditorCamposPaciente(bloque) {
  const campos = normalizarCamposPaciente(bloque.camposPaciente);
  return `<section class="patient-fields-editor"><div class="patient-fields-editor-head"><div><strong>Campos para rellenar</strong><small>Se acomodan automáticamente según el tamaño del bloque.</small></div><button type="button" onclick="agregarCampoPacienteDisenador()">+ Campo</button></div><div class="patient-fields-editor-list">${campos.map((campo, indice) => `<div class="patient-field-editor-row"><span>${indice + 1}</span><input type="text" maxlength="50" value="${escaparHTML(campo.etiqueta)}" aria-label="Nombre del campo ${indice + 1}" onchange="actualizarCampoPacienteDisenador('${campo.id}', this.value)" /><div><button type="button" title="Subir" aria-label="Subir campo" onclick="moverCampoPacienteDisenador('${campo.id}', -1)" ${indice === 0 ? 'disabled' : ''}>↑</button><button type="button" title="Bajar" aria-label="Bajar campo" onclick="moverCampoPacienteDisenador('${campo.id}', 1)" ${indice === campos.length - 1 ? 'disabled' : ''}>↓</button><button class="is-danger" type="button" title="Eliminar" aria-label="Eliminar campo" onclick="eliminarCampoPacienteDisenador('${campo.id}')">×</button></div></div>`).join('')}</div><p class="designer-table-help">Puedes escribir cualquier etiqueta. Cada dato se guardará con el informe aunque después cambies el orden visual.</p></section>`;
}

function actualizarBloquePacienteYRenderizar(mutacion) {
  const { bloque, perfil } = obtenerBloqueDisenador(bloqueDisenadorSeleccionadoId);
  if (!bloque || !perfil || bloque.tipo !== 'bloque-datos-paciente') return;
  bloque.camposPaciente = normalizarCamposPaciente(bloque.camposPaciente);
  mutacion(bloque.camposPaciente);
  bloque.camposPaciente = normalizarCamposPaciente(bloque.camposPaciente);
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarHojaDisenador(bloque.paginaId);
  seleccionarBloqueDisenador(bloque.id);
}

function agregarCampoPacienteDisenador() {
  actualizarBloquePacienteYRenderizar((campos) => {
    if (campos.length >= 16) return;
    campos.push({ id: crearIdUnico('dato-paciente'), etiqueta: `Campo ${campos.length + 1}` });
  });
}

function actualizarCampoPacienteDisenador(campoId, etiqueta) {
  const { bloque } = obtenerBloqueDisenador(bloqueDisenadorSeleccionadoId);
  if (!bloque || bloque.tipo !== 'bloque-datos-paciente') return;
  bloque.camposPaciente = normalizarCamposPaciente(bloque.camposPaciente);
  const campo = bloque.camposPaciente.find((item) => item.id === campoId);
  if (!campo) return;
  campo.etiqueta = String(etiqueta || '').trim().slice(0, 50) || 'Campo sin nombre';
  guardarPerfiles();
  const etiquetaLienzo = document.querySelector(`#designerBlocks .designer-block[data-block-id="${bloque.id}"] [data-patient-field-id="${campoId}"] > span`);
  if (etiquetaLienzo) etiquetaLienzo.textContent = campo.etiqueta;
}

function moverCampoPacienteDisenador(campoId, desplazamiento) {
  actualizarBloquePacienteYRenderizar((campos) => {
    const origen = campos.findIndex((item) => item.id === campoId);
    const destino = Math.max(0, Math.min(campos.length - 1, origen + Number(desplazamiento)));
    if (origen < 0 || origen === destino) return;
    const [campo] = campos.splice(origen, 1);
    campos.splice(destino, 0, campo);
  });
}

function eliminarCampoPacienteDisenador(campoId) {
  actualizarBloquePacienteYRenderizar((campos) => {
    if (campos.length <= 1) return;
    const indice = campos.findIndex((item) => item.id === campoId);
    if (indice >= 0) campos.splice(indice, 1);
  });
}

function crearOpcionesSidebarBloque(bloque) {
  const tablaActual = bloque.tipo === 'bloque-tabla-moderna' ? normalizarTablaMediciones(bloque.contenidoDefecto) : null;
  const { perfil } = obtenerBloqueDisenador(bloque.id);
  const bloquesPagina = perfil
    ? perfil.bloques.filter((item) => item.paginaId === bloque.paginaId).sort((a, b) => a.capa - b.capa)
    : [bloque];
  const indiceCapa = Math.max(0, bloquesPagina.findIndex((item) => item.id === bloque.id));
  const estaAlFondo = indiceCapa === 0;
  const estaAlFrente = indiceCapa === bloquesPagina.length - 1;
  const opcionesEspecificas = bloque.tipo === 'bloque-banner'
    ? `<label class="designer-option-field"><span>${bloque.imagenSrc ? 'Reemplazar imagen' : 'Cargar imagen'}</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onchange="cargarImagenBanner(this, '${bloque.id}')" /></label><button type="button" onclick="extenderBannerEnHoja('${bloque.id}')">Extender de borde a borde</button><p class="designer-table-help">La imagen se guarda en esta plantilla. El botón ajusta el ancho completo y conserva su proporción. Usa Alinear arriba o abajo para ubicarla.</p>`
    : bloque.tipo === 'bloque-datos-paciente'
    ? crearEditorCamposPaciente(bloque)
    : bloque.tipo === 'bloque-identidad'
    ? `<label class="designer-option-field"><span>Dato que se mostrará</span><select onchange="actualizarOpcionBloqueDisenador('contenidoDefecto', this.value)">${crearOpcionesIdentidad(bloque.contenidoDefecto || 'firma-simple')}</select></label>`
    : bloque.tipo === 'bloque-texto-libre'
      ? `<label class="designer-option-field"><span>Contenido inicial</span><textarea rows="6" oninput="actualizarOpcionBloqueDisenador('contenidoDefecto', this.value)">${escaparHTML(bloque.contenidoDefecto || '')}</textarea></label>`
      : bloque.tipo === 'bloque-tabla-moderna'
        ? `<div class="designer-table-options"><div class="designer-size-fields"><label class="designer-option-field"><span>Número de filas</span><input type="number" min="1" max="30" value="${tablaActual.filas.length}" oninput="actualizarDimensionTablaDisenador(this, 'filas')" /></label><label class="designer-option-field"><span>Número de columnas</span><input type="number" min="1" max="12" value="${tablaActual.cabeceras.length}" oninput="actualizarDimensionTablaDisenador(this, 'columnas')" /></label></div><p class="designer-table-help"><strong>Ctrl + clic:</strong> selecciona varias celdas.<br /><strong>Shift + clic:</strong> selecciona una fila. Usa los encabezados para columnas y la esquina para toda la tabla.</p><div class="designer-table-color-controls"><label class="designer-option-field"><span>Fondo</span><span class="color-picker-row"><input type="color" value="#ffffff" onchange="cambiarColorSeleccionTabla(this, 'backgroundColor')" /><input class="hex-color-input" type="text" value="#ffffff" maxlength="7" spellcheck="false" aria-label="Hexadecimal del fondo de las celdas" onchange="cambiarColorSeleccionTabla(this, 'backgroundColor')" onkeydown="confirmarHexColorConEnter(event)" /></span></label><label class="designer-option-field"><span>Texto</span><span class="color-picker-row"><input type="color" value="#1f2730" onchange="cambiarColorSeleccionTabla(this, 'color')" /><input class="hex-color-input" type="text" value="#1f2730" maxlength="7" spellcheck="false" aria-label="Hexadecimal del texto de las celdas" onchange="cambiarColorSeleccionTabla(this, 'color')" onkeydown="confirmarHexColorConEnter(event)" /></span></label><label class="designer-option-field"><span>Bordes</span><span class="color-picker-row"><input type="color" value="#cbd6d2" onchange="cambiarColorSeleccionTabla(this, 'borderColor')" /><input class="hex-color-input" type="text" value="#cbd6d2" maxlength="7" spellcheck="false" aria-label="Hexadecimal de los bordes de la tabla" onchange="cambiarColorSeleccionTabla(this, 'borderColor')" onkeydown="confirmarHexColorConEnter(event)" /></span></label></div></div>`
        : bloque.tipo === 'bloque-diplomados'
          ? `<label class="designer-option-field"><span>Diplomados a mostrar</span><select onchange="actualizarOpcionBloqueDisenador('contenidoDefecto', this.value)">${[['todos', 'Todos'], ['cursados', 'Solo cursados'], ['en-curso', 'Solo en curso']].map(([valor, etiqueta]) => `<option value="${valor}" ${bloque.contenidoDefecto === valor ? 'selected' : ''}>${etiqueta}</option>`).join('')}</select></label><p class="designer-table-help">Este bloque usa automáticamente los diplomados guardados en Configuración.</p>`
          : bloque.tipo === 'bloque-figura'
            ? `<label class="designer-option-field"><span>Tipo de figura</span><select onchange="actualizarOpcionBloqueDisenador('figuraTipo', this.value)">${[['onda', 'Onda'], ['rectangulo', 'Rectángulo'], ['cuadrado', 'Cuadrado'], ['circulo', 'Círculo'], ['triangulo', 'Triángulo'], ['rombo', 'Rombo'], ['linea', 'Línea'], ['flecha', 'Flecha']].map(([valor, etiqueta]) => `<option value="${valor}" ${bloque.figuraTipo === valor ? 'selected' : ''}>${etiqueta}</option>`).join('')}</select></label><label class="designer-option-field"><span>Color del borde</span><span class="color-picker-row"><input type="color" value="${bloque.figuraColor}" onchange="cambiarColorFiguraDisenador(this, 'figuraColor')" /><input class="hex-color-input" type="text" value="${bloque.figuraColor}" maxlength="7" spellcheck="false" aria-label="Hexadecimal del borde de la figura" onchange="cambiarColorFiguraDisenador(this, 'figuraColor')" onkeydown="confirmarHexColorConEnter(event)" /></span></label><div class="designer-size-fields"><label class="designer-option-field"><span>Estilo de línea</span><select onchange="actualizarOpcionBloqueDisenador('figuraEstiloLinea', this.value)">${[['solida','Sólida'],['discontinua','Discontinua'],['punteada','Punteada']].map(([valor,etiqueta]) => `<option value="${valor}" ${bloque.figuraEstiloLinea === valor ? 'selected' : ''}>${etiqueta}</option>`).join('')}</select></label><label class="designer-option-field"><span>Grosor</span><input type="number" min="1" max="20" value="${bloque.figuraGrosor}" onchange="actualizarOpcionBloqueDisenador('figuraGrosor', this.value)" /></label></div><label class="designer-visible-option"><input type="checkbox" ${bloque.figuraRellena ? 'checked' : ''} onchange="actualizarOpcionBloqueDisenador('figuraRellena', this.checked)" /><span>Usar relleno</span></label><label class="designer-option-field"><span>Color del relleno</span><span class="color-picker-row"><input type="color" value="${bloque.figuraRelleno}" onchange="cambiarColorFiguraDisenador(this, 'figuraRelleno')" /><input class="hex-color-input" type="text" value="${bloque.figuraRelleno}" maxlength="7" spellcheck="false" aria-label="Hexadecimal del relleno de la figura" onchange="cambiarColorFiguraDisenador(this, 'figuraRelleno')" onkeydown="confirmarHexColorConEnter(event)" /></span></label><div class="designer-size-fields"><label class="designer-option-field"><span>Rotación</span><input type="number" min="-180" max="180" value="${bloque.rotacion}" onchange="actualizarOpcionBloqueDisenador('rotacion', this.value)" /></label><label class="designer-option-field"><span>Opacidad %</span><input type="number" min="5" max="100" value="${Math.round(bloque.opacidad * 100)}" onchange="actualizarOpcionBloqueDisenador('opacidadPorcentaje', this.value)" /></label></div><label class="designer-option-field"><span>Esquinas redondeadas</span><input type="range" min="0" max="50" value="${bloque.figuraRadio}" onchange="actualizarOpcionBloqueDisenador('figuraRadio', this.value)" /></label>`
            : '';
  const controlAlineacion = ['bloque-encabezado', 'bloque-texto-libre'].includes(bloque.tipo)
    ? `<div class="designer-option-field"><span>Alineación del texto</span><div class="designer-alignment-control" role="group" aria-label="Alineación del texto">${[['left', '≡', 'Izquierda'], ['center', '≡', 'Centro'], ['right', '≡', 'Derecha'], ['justify', '☰', 'Justificado']].map(([valor, icono, etiqueta]) => `<button class="align-${valor} ${bloque.alineacion === valor ? 'active' : ''}" type="button" title="${etiqueta}" aria-label="${etiqueta}" aria-pressed="${bloque.alineacion === valor}" onclick="actualizarOpcionBloqueDisenador('alineacion', '${valor}')"><span>${icono}</span></button>`).join('')}</div></div>`
    : '';
  const controlTipografia = bloque.tipo === 'bloque-figura' ? '' : `<label class="designer-option-field"><span>Tamaño de letra</span><select onchange="actualizarOpcionBloqueDisenador('fontSize', this.value)">${[10,11,12,13,14,16,18,20,22,24,26,28,32,36,42,48].map((tamano) => `<option value="${tamano}" ${Number(bloque.fontSize) === tamano ? 'selected' : ''}>${tamano} px</option>`).join('')}</select></label>`;
  const controlFondo = bloque.tipo === 'bloque-figura' ? '' : `<label class="designer-option-field"><span>Fondo del bloque</span><span class="color-picker-row"><input type="color" value="${normalizarColorFondo(bloque.colorFondo, '#ffffff')}" onchange="cambiarColorFondoBloqueDisenador(this)" /><input class="hex-color-input" type="text" value="${normalizarColorFondo(bloque.colorFondo, '#ffffff')}" maxlength="7" spellcheck="false" aria-label="Hexadecimal del fondo del bloque" onchange="cambiarColorFondoBloqueDisenador(this)" onkeydown="confirmarHexColorConEnter(event)" /></span></label>`;
  const controlEsquinas = bloque.tipo === 'bloque-figura'
    ? `<section class="designer-corner-controls"><div><strong>Ubicar sin margen</strong><small>Ajusta la figura al borde exacto de la hoja.</small></div><div role="group" aria-label="Ubicar figura en una esquina"><button type="button" title="Esquina superior izquierda" aria-label="Ubicar arriba a la izquierda" onclick="ubicarFiguraEnEsquina('${bloque.id}', 'superior-izquierda')">↖</button><button type="button" title="Esquina superior derecha" aria-label="Ubicar arriba a la derecha" onclick="ubicarFiguraEnEsquina('${bloque.id}', 'superior-derecha')">↗</button><button type="button" title="Esquina inferior izquierda" aria-label="Ubicar abajo a la izquierda" onclick="ubicarFiguraEnEsquina('${bloque.id}', 'inferior-izquierda')">↙</button><button type="button" title="Esquina inferior derecha" aria-label="Ubicar abajo a la derecha" onclick="ubicarFiguraEnEsquina('${bloque.id}', 'inferior-derecha')">↘</button></div></section>`
    : '';
  const minimoDimension = bloque.tipo === 'bloque-figura' ? 24 : 80;
  const controlesAlineacionHoja = `<section class="designer-page-align-controls"><div><strong>Alinear en la hoja</strong><small>Posiciona respecto a los bordes o al centro.</small></div><div><button type="button" title="Izquierda" aria-label="Alinear a la izquierda" onclick="alinearBloqueEnHoja('${bloque.id}','izquierda')">⇤</button><button type="button" title="Centro horizontal" aria-label="Centrar horizontalmente" onclick="alinearBloqueEnHoja('${bloque.id}','centro-horizontal')">↔</button><button type="button" title="Derecha" aria-label="Alinear a la derecha" onclick="alinearBloqueEnHoja('${bloque.id}','derecha')">⇥</button><button type="button" title="Arriba" aria-label="Alinear arriba" onclick="alinearBloqueEnHoja('${bloque.id}','arriba')">↥</button><button type="button" title="Centro vertical" aria-label="Centrar verticalmente" onclick="alinearBloqueEnHoja('${bloque.id}','centro-vertical')">↕</button><button type="button" title="Abajo" aria-label="Alinear abajo" onclick="alinearBloqueEnHoja('${bloque.id}','abajo')">↧</button></div></section>`;
  const controlesCapa = `<section class="designer-layer-controls"><div class="designer-layer-heading"><span>Posición de capa</span><small>Capa ${indiceCapa + 1} de ${bloquesPagina.length}</small></div><div class="designer-layer-actions"><button type="button" title="Enviar al fondo" aria-label="Enviar bloque al fondo" onclick="cambiarCapaBloqueDisenador('${bloque.id}', 'fondo')" ${estaAlFondo ? 'disabled' : ''}>⇊<span>Al fondo</span></button><button type="button" title="Enviar atrás una capa" aria-label="Enviar bloque atrás una capa" onclick="cambiarCapaBloqueDisenador('${bloque.id}', 'atras')" ${estaAlFondo ? 'disabled' : ''}>↓<span>Atrás</span></button><button type="button" title="Traer adelante una capa" aria-label="Traer bloque adelante una capa" onclick="cambiarCapaBloqueDisenador('${bloque.id}', 'adelante')" ${estaAlFrente ? 'disabled' : ''}>↑<span>Adelante</span></button><button type="button" title="Traer al frente" aria-label="Traer bloque al frente" onclick="cambiarCapaBloqueDisenador('${bloque.id}', 'frente')" ${estaAlFrente ? 'disabled' : ''}>⇈<span>Al frente</span></button></div></section>`;
  return `<button class="designer-panel-back" type="button" onclick="cerrarOpcionesBloqueDisenador()">${iconoUI('arrow-left')} Volver a bloques</button>
    <div class="designer-panel-heading"><span>Bloque seleccionado</span><strong>${escaparHTML(bloque.titulo)}</strong></div>
    ${opcionesEspecificas}
    ${controlAlineacion}
    ${controlTipografia}
    <div class="designer-position-fields"><label class="designer-option-field"><span>Posición X</span><input type="number" min="0" step="1" value="${Math.round(bloque.x)}" onchange="actualizarOpcionBloqueDisenador('x', this.value)" /></label><label class="designer-option-field"><span>Posición Y</span><input type="number" min="0" step="1" value="${Math.round(bloque.y)}" onchange="actualizarOpcionBloqueDisenador('y', this.value)" /></label></div>
    <div class="designer-size-fields"><label class="designer-option-field"><span>Ancho</span><input type="number" min="${minimoDimension}" step="${bloque.tipo === 'bloque-figura' ? 1 : 20}" value="${Math.round(bloque.width)}" onchange="actualizarOpcionBloqueDisenador('width', this.value)" /></label><label class="designer-option-field"><span>Alto</span><input type="number" min="${bloque.tipo === 'bloque-figura' ? 24 : 48}" step="${bloque.tipo === 'bloque-figura' ? 1 : 20}" value="${Math.round(bloque.height)}" onchange="actualizarOpcionBloqueDisenador('height', this.value)" ${bloque.tipo === 'bloque-logo' ? 'disabled title="El logo conserva proporción cuadrada"' : ''} /></label></div>
    ${controlesAlineacionHoja}
    ${controlEsquinas}
    ${controlFondo}
    ${controlesCapa}
    <label class="designer-visible-option"><input type="checkbox" ${bloque.bloqueado ? 'checked' : ''} onchange="actualizarOpcionBloqueDisenador('bloqueado', this.checked)" /><span>Bloquear posición y tamaño</span></label>
    <label class="designer-visible-option"><input type="checkbox" ${bloque.visible ? 'checked' : ''} onchange="actualizarOpcionBloqueDisenador('visible', this.checked)" /><span>Mostrar este bloque en el informe</span></label>
    <button class="designer-delete-block" type="button" onclick="eliminarBloqueDisenador('${bloque.id}')">Eliminar bloque</button>`;
}

function redimensionarTablaDisenador(dimension, valor) {
  const { bloque } = obtenerBloqueDisenador(bloqueDisenadorSeleccionadoId);
  if (!bloque || bloque.tipo !== 'bloque-tabla-moderna') return;
  const tabla = bloque.contenidoDefecto = normalizarTablaMediciones(bloque.contenidoDefecto);
  if (dimension === 'filas') {
    const cantidad = Math.max(1, Math.min(30, Number.parseInt(valor, 10) || 1));
    while (tabla.filas.length < cantidad) tabla.filas.push(Array(tabla.cabeceras.length).fill(''));
    tabla.filas = tabla.filas.slice(0, cantidad);
  } else {
    const cantidad = Math.max(1, Math.min(12, Number.parseInt(valor, 10) || 1));
    while (tabla.cabeceras.length < cantidad) tabla.cabeceras.push(`Columna ${tabla.cabeceras.length + 1}`);
    tabla.cabeceras = tabla.cabeceras.slice(0, cantidad);
    tabla.filas = tabla.filas.map((fila) => {
      const ajustada = fila.slice(0, cantidad);
      while (ajustada.length < cantidad) ajustada.push('');
      return ajustada;
    });
  }
  limpiarEstilosFueraDeTabla(tabla);
  celdasTablaSeleccionadas.clear();
  guardarPerfiles();
  refrescarBloqueDisenador(bloque.id);
  pintarSeleccionTablaDisenador();
}

function actualizarDimensionTablaDisenador(input, dimension) {
  if (!input || input.value === '') return;
  const maximo = dimension === 'filas' ? 30 : 12;
  const cantidad = Math.max(1, Math.min(maximo, Number.parseInt(input.value, 10) || 1));
  input.value = String(cantidad);
  redimensionarTablaDisenador(dimension, cantidad);
}

function limpiarEstilosFueraDeTabla(tabla) {
  const estilosValidos = {};
  Object.entries(tabla.estilosCeldas || {}).forEach(([clave, estilo]) => {
    const cabecera = clave.match(/^h-(\d+)$/);
    const cuerpo = clave.match(/^(\d+)-(\d+)$/);
    if (cabecera && Number(cabecera[1]) < tabla.cabeceras.length) estilosValidos[clave] = estilo;
    if (cuerpo && Number(cuerpo[1]) < tabla.filas.length && Number(cuerpo[2]) < tabla.cabeceras.length) estilosValidos[clave] = estilo;
  });
  tabla.estilosCeldas = estilosValidos;
}

function aplicarColorSeleccionTabla(propiedad, valor) {
  const { bloque } = obtenerBloqueDisenador(tablaSeleccionBloqueId || bloqueDisenadorSeleccionadoId);
  if (!bloque || bloque.tipo !== 'bloque-tabla-moderna') return;
  if (!celdasTablaSeleccionadas.size) {
    mostrarMensajeApp('Selecciona celdas', 'Haz clic en una celda o utiliza Ctrl y Shift para crear una selección antes de aplicar el color.');
    return;
  }
  const tabla = bloque.contenidoDefecto = normalizarTablaMediciones(bloque.contenidoDefecto);
  celdasTablaSeleccionadas.forEach((clave) => {
    tabla.estilosCeldas[clave] = { ...(tabla.estilosCeldas[clave] || {}), [propiedad]: normalizarColorFondo(valor, propiedad === 'color' ? '#1f2730' : '#ffffff') };
  });
  guardarPerfiles();
  refrescarBloqueDisenador(bloque.id);
  pintarSeleccionTablaDisenador();
}

function normalizarHexadecimalEditable(valor) {
  let hexadecimal = String(valor || '').trim();
  if (!hexadecimal.startsWith('#')) hexadecimal = `#${hexadecimal}`;
  if (/^#[0-9a-f]{3}$/i.test(hexadecimal)) {
    hexadecimal = `#${hexadecimal.slice(1).split('').map((caracter) => caracter.repeat(2)).join('')}`;
  }
  return /^#[0-9a-f]{6}$/i.test(hexadecimal) ? hexadecimal.toLowerCase() : null;
}

function sincronizarControlColor(input, fallback) {
  if (!input) return null;
  const fila = input.closest('.color-picker-row');
  const selector = fila?.querySelector('input[type="color"]');
  const entradaHexadecimal = fila?.querySelector('.hex-color-input');
  const valor = input.type === 'color'
    ? normalizarColorFondo(input.value, fallback)
    : normalizarHexadecimalEditable(input.value);
  if (!valor) {
    const valorAnterior = normalizarColorFondo(selector?.value, fallback);
    input.value = valorAnterior;
    input.setAttribute('aria-invalid', 'true');
    mostrarMensajeApp('Color no válido', 'Escribe un hexadecimal como #66BC00, 66BC00 o #6B0. Se conservará el color anterior.', 'danger');
    return null;
  }
  if (selector) selector.value = valor;
  if (entradaHexadecimal) {
    entradaHexadecimal.value = valor;
    entradaHexadecimal.setAttribute('aria-invalid', 'false');
  }
  registrarColorRecienteDisenador(valor);
  return valor;
}

function inicializarColoresRecientesDisenador() {
  try {
    const guardados = JSON.parse(localStorage.getItem('coloresRecientesDisenador') || '[]');
    coloresRecientesDisenador = Array.isArray(guardados)
      ? guardados.map((color) => normalizarColorFondo(color, null)).filter(Boolean).slice(0, 6)
      : [];
  } catch (error) {
    coloresRecientesDisenador = [];
  }
  if (!coloresRecientesDisenador.length) coloresRecientesDisenador = ['#66bc00', '#4c626c', '#2f80ed', '#9b51e0', '#f2994a', '#ffffff'];
}

function registrarColorRecienteDisenador(color) {
  const normalizado = normalizarColorFondo(color, null);
  if (!normalizado) return;
  coloresRecientesDisenador = [normalizado, ...coloresRecientesDisenador.filter((item) => item !== normalizado)].slice(0, 6);
  localStorage.setItem('coloresRecientesDisenador', JSON.stringify(coloresRecientesDisenador));
  window.setTimeout(() => renderizarPaletasColoresRecientes(document.getElementById('designer-view')), 0);
}

function renderizarPaletasColoresRecientes(raiz) {
  if (!raiz) return;
  raiz.querySelectorAll('.color-picker-row').forEach((fila) => {
    let paleta = fila.nextElementSibling;
    if (!paleta?.classList.contains('recent-colors-palette')) {
      paleta = document.createElement('div');
      paleta.className = 'recent-colors-palette';
      paleta.setAttribute('aria-label', 'Colores usados recientemente');
      fila.after(paleta);
    }
    paleta.innerHTML = `<span>Recientes</span>${coloresRecientesDisenador.map((color) => `<button type="button" data-recent-color="${color}" style="--recent-color:${color}" title="Usar ${color}" aria-label="Usar color reciente ${color}"></button>`).join('')}`;
    paleta.querySelectorAll('[data-recent-color]').forEach((boton) => {
      boton.onclick = () => {
        const selector = fila.querySelector('input[type="color"]');
        const hexadecimal = fila.querySelector('.hex-color-input');
        if (selector) selector.value = boton.dataset.recentColor;
        if (hexadecimal) hexadecimal.value = boton.dataset.recentColor;
        (selector || hexadecimal)?.dispatchEvent(new Event('change', { bubbles: true }));
      };
    });
  });
}

function confirmarHexColorConEnter(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  event.currentTarget.blur();
}

function cambiarColorSeleccionTabla(input, propiedad) {
  if (!input) return;
  const coloresPredeterminados = {
    backgroundColor: '#ffffff',
    color: '#1f2730',
    borderColor: '#cbd6d2'
  };
  const valor = sincronizarControlColor(input, coloresPredeterminados[propiedad] || '#ffffff');
  if (!valor) return;
  aplicarColorSeleccionTabla(propiedad, valor);
}

function cambiarColorFondoBloqueDisenador(input) {
  if (!input) return;
  const valor = sincronizarControlColor(input, '#ffffff');
  if (!valor) return;
  actualizarOpcionBloqueDisenador('colorFondo', valor);
}

function cambiarColorFiguraDisenador(input, propiedad) {
  if (!input || !['figuraColor', 'figuraRelleno'].includes(propiedad)) return;
  const valor = sincronizarControlColor(input, propiedad === 'figuraColor' ? '#4c626c' : '#d8f5c6');
  if (!valor) return;
  actualizarOpcionBloqueDisenador(propiedad, valor);
}

function ubicarFiguraEnEsquina(bloqueId, esquina) {
  guardarEstructuraPlantilla(false);
  const { perfil, bloque } = obtenerBloqueDisenador(bloqueId);
  const pagina = document.querySelector(`#designerBlocks .designer-page-canvas[data-designer-page-id="${bloque?.paginaId || ''}"]`);
  if (!perfil || !bloque || bloque.tipo !== 'bloque-figura' || !pagina) return;
  const derecha = esquina.endsWith('derecha');
  const inferior = esquina.startsWith('inferior');
  bloque.x = derecha ? Math.max(0, pagina.offsetWidth - bloque.width) : 0;
  bloque.y = inferior ? Math.max(0, pagina.offsetHeight - bloque.height) : 0;
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarBloqueDisenador(bloque.id);
  mostrarAvisoBreve('Figura ajustada al borde de la hoja, sin margen.');
}

function alinearBloqueEnHoja(bloqueId, alineacion) {
  guardarEstructuraPlantilla(false);
  const { perfil, bloque } = obtenerBloqueDisenador(bloqueId);
  const pagina = document.querySelector(`#designerBlocks .designer-page-canvas[data-designer-page-id="${bloque?.paginaId || ''}"]`);
  if (!perfil || !bloque || !pagina) return;
  if (alineacion === 'izquierda') bloque.x = 0;
  else if (alineacion === 'centro-horizontal') bloque.x = Math.max(0, (pagina.offsetWidth - bloque.width) / 2);
  else if (alineacion === 'derecha') bloque.x = Math.max(0, pagina.offsetWidth - bloque.width);
  else if (alineacion === 'arriba') bloque.y = 0;
  else if (alineacion === 'centro-vertical') bloque.y = Math.max(0, (pagina.offsetHeight - bloque.height) / 2);
  else if (alineacion === 'abajo') bloque.y = Math.max(0, pagina.offsetHeight - bloque.height);
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarBloqueDisenador(bloque.id);
}

function actualizarOpcionBloqueDisenador(propiedad, valor) {
  const { bloque } = obtenerBloqueDisenador(bloqueDisenadorSeleccionadoId);
  if (!bloque) return;
  const paginaElemento = document.querySelector(`#designerBlocks .designer-page-canvas[data-designer-page-id="${bloque.paginaId}"]`);
  const estabaEnDerecha = bloque.tipo === 'bloque-figura' && paginaElemento && Math.abs((bloque.x + bloque.width) - paginaElemento.offsetWidth) <= 2;
  const estabaAbajo = bloque.tipo === 'bloque-figura' && paginaElemento && Math.abs((bloque.y + bloque.height) - paginaElemento.offsetHeight) <= 2;
  if (propiedad === 'x' || propiedad === 'y') {
    const maximo = paginaElemento
      ? (propiedad === 'x' ? paginaElemento.offsetWidth - bloque.width : paginaElemento.offsetHeight - bloque.height)
      : Number.MAX_SAFE_INTEGER;
    bloque[propiedad] = Math.max(0, Math.min(maximo, Number(valor) || 0));
  } else if (propiedad === 'width' || propiedad === 'height') {
    const minimo = bloque.tipo === 'bloque-figura' ? 24 : (propiedad === 'width' ? 80 : 48);
    const numero = Math.max(minimo, Number(valor) || 0);
    bloque[propiedad] = numero;
    if (bloque.tipo === 'bloque-logo') bloque.width = bloque.height = numero;
    if (bloque.tipo === 'bloque-imagenes-grid') {
      if (propiedad === 'width') bloque.height = calcularAltoBloqueImagenes(bloque.width);
      else {
        bloque.width = Math.max(240, calcularAnchoBloqueImagenes(bloque.height));
        bloque.height = calcularAltoBloqueImagenes(bloque.width);
      }
      if (paginaElemento) {
        const anchoMaximo = Math.min(paginaElemento.offsetWidth - bloque.x, calcularAnchoBloqueImagenes(paginaElemento.offsetHeight - bloque.y));
        bloque.width = Math.max(240, Math.min(bloque.width, anchoMaximo));
        bloque.height = calcularAltoBloqueImagenes(bloque.width);
      }
    }
    if (bloque.tipo === 'bloque-figura' && paginaElemento) {
      bloque.width = Math.min(bloque.width, paginaElemento.offsetWidth);
      bloque.height = Math.min(bloque.height, paginaElemento.offsetHeight);
      bloque.x = estabaEnDerecha ? paginaElemento.offsetWidth - bloque.width : Math.max(0, Math.min(bloque.x, paginaElemento.offsetWidth - bloque.width));
      bloque.y = estabaAbajo ? paginaElemento.offsetHeight - bloque.height : Math.max(0, Math.min(bloque.y, paginaElemento.offsetHeight - bloque.height));
    }
  } else if (propiedad === 'fontSize') bloque.fontSize = Math.max(8, Math.min(72, Number(valor) || 14));
  else if (propiedad === 'visible') bloque.visible = Boolean(valor);
  else if (propiedad === 'bloqueado') bloque.bloqueado = Boolean(valor);
  else if (propiedad === 'figuraRellena') bloque.figuraRellena = Boolean(valor);
  else if (propiedad === 'figuraTipo') bloque.figuraTipo = normalizarTipoFigura(valor);
  else if (propiedad === 'figuraColor') bloque.figuraColor = normalizarColorFondo(valor, '#4c626c');
  else if (propiedad === 'figuraRelleno') bloque.figuraRelleno = normalizarColorFondo(valor, '#d8f5c6');
  else if (propiedad === 'figuraGrosor') bloque.figuraGrosor = Math.max(1, Math.min(20, Number(valor) || 4));
  else if (propiedad === 'figuraEstiloLinea') bloque.figuraEstiloLinea = ['solida', 'discontinua', 'punteada'].includes(valor) ? valor : 'solida';
  else if (propiedad === 'figuraRadio') bloque.figuraRadio = Math.max(0, Math.min(50, Number(valor) || 0));
  else if (propiedad === 'rotacion') bloque.rotacion = Math.max(-180, Math.min(180, Number(valor) || 0));
  else if (propiedad === 'opacidadPorcentaje') bloque.opacidad = Math.max(0.05, Math.min(1, (Number(valor) || 100) / 100));
  else if (propiedad === 'colorFondo') {
    bloque.colorFondo = normalizarColorFondo(valor, '#ffffff');
    const { perfil } = obtenerBloqueDisenador(bloque.id);
    if (perfil && bloquesDisenadorSeleccionados.size > 1) {
      perfil.bloques.filter((item) => bloquesDisenadorSeleccionados.has(item.id) && item.tipo !== 'bloque-figura').forEach((item) => { item.colorFondo = bloque.colorFondo; });
    }
    const elemento = document.querySelector(`#designerBlocks .designer-block[data-block-id="${bloque.id}"]`);
    if (elemento) elemento.style.backgroundColor = bloque.colorFondo;
    guardarPerfiles();
    if (perfil && bloquesDisenadorSeleccionados.size > 1) diseñarEstructuraPlantilla(perfil.id);
    return;
  }
  else if (propiedad === 'alineacion') bloque.alineacion = ['left', 'center', 'right', 'justify'].includes(valor) ? valor : 'left';
  else bloque[propiedad] = String(valor);
  guardarPerfiles();
  refrescarBloqueDisenador(bloque.id);
  if (propiedad === 'alineacion') seleccionarBloqueDisenador(bloque.id);
}

function refrescarBloqueDisenador(idBloque) {
  const elemento = document.querySelector(`#designerBlocks .designer-block[data-block-id="${idBloque}"]`);
  const { bloque } = obtenerBloqueDisenador(idBloque);
  if (!elemento || !bloque) return;
  elemento.insertAdjacentHTML('beforebegin', crearHTMLBloqueDisenador(bloque));
  elemento.remove();
}

function crearContenidoLogoClinica(modoDisenador) {
  const contenido = ajustesApp.logoClinica
    ? `<img src="${ajustesApp.logoClinica}" alt="Logo de la clínica" />`
    : '<span class="block-empty-state">Carga el logo en Configuración</span>';
  return `<div class="clinic-logo-block ${modoDisenador ? 'is-designer-preview' : ''}">${contenido}</div>`;
}

function crearContenidoInformacionClinica(titulo) {
  const direccion = escaparHTML(ajustesApp.direccionClinica || 'Dirección no configurada');
  const telefono = escaparHTML(ajustesApp.telefonoClinica || 'Teléfono no configurado');
  return `<div class="clinic-info-card"><div class="clinic-info-heading">${titulo}<span>Datos de contacto</span></div><div class="clinic-contact-list"><div class="clinic-contact-item"><span class="clinic-contact-icon" aria-hidden="true">⌖</span><div><small>Dirección</small><strong>${direccion}</strong></div></div><div class="clinic-contact-item"><span class="clinic-contact-icon" aria-hidden="true">☎</span><div><small>Teléfono</small><strong>${telefono}</strong></div></div></div></div>`;
}

function crearContenidoDiplomadosBloque(bloque, titulo) {
  const filtro = ['todos', 'cursados', 'en-curso'].includes(bloque.contenidoDefecto) ? bloque.contenidoDefecto : 'todos';
  const cursados = filtro === 'en-curso' ? [] : obtenerDiplomadosCursados();
  const enCurso = filtro === 'cursados' ? [] : obtenerDiplomadosEnCurso();
  if (!cursados.length && !enCurso.length) {
    return `<div class="diplomas-layout-block is-empty">${titulo}<span class="block-empty-state">Carga los diplomados desde Configuración para mostrarlos aquí.</span></div>`;
  }
  const crearLista = (items) => `<ul>${items.map((item) => `<li><span class="diplomas-block-marker" aria-hidden="true"></span><span><strong>${escaparHTML(item.diplomado || 'Diplomado')}</strong>${item.institucion ? `<small>${escaparHTML(item.institucion)}</small>` : ''}</span></li>`).join('')}</ul>`;
  const columnas = [
    cursados.length ? `<section><span class="diplomas-block-eyebrow">Formación completada</span>${crearLista(cursados)}</section>` : '',
    enCurso.length ? `<section><span class="diplomas-block-eyebrow">Actualmente cursando</span>${crearLista(enCurso)}</section>` : ''
  ].filter(Boolean).join('');
  return `<div class="diplomas-layout-block">${titulo}<div class="diplomas-block-columns">${columnas}</div></div>`;
}

function crearContenidoFiguraBloque(bloque) {
  const tipo = normalizarTipoFigura(bloque.figuraTipo);
  const color = normalizarColorFondo(bloque.figuraColor, '#4c626c');
  const rellenable = !['onda', 'linea', 'flecha'].includes(tipo);
  const relleno = bloque.figuraRellena && rellenable ? normalizarColorFondo(bloque.figuraRelleno, '#d8f5c6') : 'none';
  const grosor = Math.max(1, Math.min(20, Number(bloque.figuraGrosor) || 4));
  const radio = Math.max(0, Math.min(50, Number(bloque.figuraRadio) || 0));
  const guiones = bloque.figuraEstiloLinea === 'discontinua' ? '14 9' : bloque.figuraEstiloLinea === 'punteada' ? '2 8' : 'none';
  const rotacion = Math.max(-180, Math.min(180, Number(bloque.rotacion) || 0));
  const opacidad = Math.max(0.05, Math.min(1, Number(bloque.opacidad) || 1));
  const figuras = {
    onda: '<path d="M0 60 C28 0 62 0 91 60 S150 120 200 60" />',
    rectangulo: `<rect x="0" y="0" width="200" height="120" rx="${radio}" />`,
    cuadrado: `<rect x="0" y="0" width="200" height="120" rx="${radio}" />`,
    circulo: '<ellipse cx="100" cy="60" rx="100" ry="60" />',
    triangulo: '<polygon points="100,0 200,120 0,120" />',
    rombo: '<polygon points="100,0 200,60 100,120 0,60" />',
    linea: '<line x1="0" y1="60" x2="200" y2="60" />',
    flecha: '<path d="M0 60 H200 M164 22 L200 60 L164 98" />'
  };
  const etiqueta = tipo.charAt(0).toUpperCase() + tipo.slice(1);
  return `<div class="shape-layout-block" style="opacity:${opacidad};transform:rotate(${rotacion}deg)"><svg viewBox="0 0 200 120" role="img" aria-label="${escaparHTML(etiqueta)}" preserveAspectRatio="none" style="--shape-stroke:${color};--shape-fill:${relleno};--shape-width:${grosor};--shape-dash:${guiones}">${figuras[tipo]}</svg></div>`;
}

function actualizarVistaPreviaDisenador() {
  const lienzo = document.getElementById('designerBlocks');
  if (!lienzo) return;
  const colorFondo = normalizarColorFondo(document.getElementById('designerPageColor')?.value, '#ffffff');
  const enfasis = normalizarColorBloque(document.getElementById('designerAccentColor')?.value);
  const perfil = perfilesInformes.find((item) => item.id === lienzo.dataset.profileId);
  if (perfil) {
    perfil.hoja = normalizarEstiloHoja({ colorFondo, colorEnfasis: enfasis });
    guardarPerfiles();
  }
  lienzo.style.setProperty('--designer-accent', enfasis);
  lienzo.querySelectorAll('.designer-page-canvas').forEach((pagina) => { pagina.style.backgroundColor = colorFondo; pagina.style.setProperty('--designer-accent', enfasis); });
}

function cambiarColorGlobalDisenador(input, tipo) {
  if (!input) return;
  const esFondo = tipo === 'fondo';
  const valor = sincronizarControlColor(input, esFondo ? '#ffffff' : '#66bc00');
  if (!valor) return;
  actualizarVistaPreviaDisenador();
}

function cambiarCapaBloqueDisenador(idBloque, accion) {
  guardarEstructuraPlantilla(false);
  const { perfil, bloque } = obtenerBloqueDisenador(idBloque);
  if (!perfil || !bloque) return;
  const bloquesPagina = perfil.bloques
    .filter((item) => item.paginaId === bloque.paginaId)
    .sort((a, b) => a.capa - b.capa);
  const indice = bloquesPagina.findIndex((item) => item.id === idBloque);
  if (indice < 0 || bloquesPagina.length < 2) return;
  const [seleccionado] = bloquesPagina.splice(indice, 1);
  if (accion === 'fondo') bloquesPagina.unshift(seleccionado);
  else if (accion === 'frente') bloquesPagina.push(seleccionado);
  else if (accion === 'atras') bloquesPagina.splice(Math.max(0, indice - 1), 0, seleccionado);
  else if (accion === 'adelante') bloquesPagina.splice(Math.min(bloquesPagina.length, indice + 1), 0, seleccionado);
  else return;
  bloquesPagina.forEach((item, posicion) => { item.capa = posicion + 1; });
  guardarPerfiles();
  document.querySelectorAll('#designerBlocks .designer-block').forEach((elemento) => {
    const item = perfil.bloques.find((bloquePerfil) => bloquePerfil.id === elemento.dataset.blockId);
    if (!item) return;
    elemento.dataset.layer = String(item.capa);
    elemento.style.zIndex = String(item.capa);
  });
  seleccionarBloqueDisenador(idBloque);
}

function normalizarImagenBanner(src) {
  return /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(String(src || '')) ? String(src) : '';
}

function ajustarBannerAnchoHoja(bloque, pagina) {
  bloque.x = 0;
  bloque.width = pagina?.clientWidth || 794;
  bloque.height = bloque.width / (bloque.imagenProporcion || 5);
  bloque.y = Math.max(0, Math.min(bloque.y, (pagina?.clientHeight || 1123) - bloque.height));
}

function extenderBannerEnHoja(id) {
  guardarEstructuraPlantilla(false);
  const { perfil, bloque } = obtenerBloqueDisenador(id);
  if (!perfil || bloque?.tipo !== 'bloque-banner') return;
  const pagina = document.querySelector(`#designerBlocks [data-designer-page-id="${bloque.paginaId}"]`);
  ajustarBannerAnchoHoja(bloque, pagina);
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarBloqueDisenador(id);
}

async function cargarImagenBanner(input, id) {
  const archivo = input.files?.[0];
  if (!archivo) return;
  const { perfil, bloque } = obtenerBloqueDisenador(id);
  if (!perfil || bloque?.tipo !== 'bloque-banner') return;
  try {
    const src = normalizarImagenBanner(await leerImagenComoDataURL(archivo));
    if (!src) throw new Error('Selecciona una imagen PNG, JPG, WebP o GIF.');
    const dimensiones = await analizarImagenDataURL(src);
    if (!dimensiones.width || !dimensiones.height) throw new Error('No se pudo leer la imagen.');
    guardarEstructuraPlantilla(false);
    bloque.imagenSrc = src;
    bloque.imagenProporcion = dimensiones.width / dimensiones.height;
    extenderBannerEnHoja(id);
  } catch (error) {
    mostrarMensajeApp('No se pudo cargar el banner', error.message, 'error');
  } finally {
    input.value = '';
  }
}

function agregarBloquePlantilla(tipo) {
  const lienzo = document.getElementById('designerBlocks');
  const perfil = lienzo && perfilesInformes.find((item) => item.id === lienzo.dataset.profileId);
  if (!perfil) return;
  const paginaId = lienzo.dataset.activePageId || perfil.paginas[0]?.id;
  if (tipo === 'bloque-titulo-principal' && perfil.bloques.some((bloque) => bloque.tipo === tipo)) return;
  const pagina = perfil.paginas.find((item) => item.id === paginaId);
  const indicePagina = perfil.paginas.indexOf(pagina);
  if (tipo === 'bloque-titulo-principal' && indicePagina !== 0) return;
  perfil.paginasEliminadas = (perfil.paginasEliminadas || []).filter((id) => id !== paginaId);
  const nuevoBloque = normalizarBloquePerfil({ tipo, paginaId, x: 40, y: 60, width: tipo === 'bloque-logo' ? 180 : tipo === 'bloque-figura' ? 240 : tipo === 'bloque-titulo-principal' ? 520 : 620, height: tipo === 'bloque-imagenes-grid' ? 600 : tipo === 'bloque-datos-paciente' ? 280 : tipo === 'bloque-diplomados' ? 320 : tipo === 'bloque-logo' ? 180 : tipo === 'bloque-figura' ? 160 : tipo === 'bloque-identidad' || tipo === 'bloque-clinica' ? 150 : 140 }, perfil.bloques.length, paginaId);
  if (tipo === 'bloque-banner') {
    const hoja = lienzo.querySelector('.designer-page-canvas.is-active-page') || lienzo.querySelector('.designer-page-canvas');
    nuevoBloque.x = 0;
    nuevoBloque.y = 0;
    nuevoBloque.width = hoja?.clientWidth || 794;
    nuevoBloque.height = nuevoBloque.width / 5;
  }
  nuevoBloque.capa = perfil.bloques.filter((bloque) => bloque.paginaId === paginaId).reduce((maximo, bloque) => Math.max(maximo, Number(bloque.capa) || 0), 0) + 1;
  perfil.bloques.push(nuevoBloque);
  bloqueDisenadorSeleccionadoId = nuevoBloque.id;
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarHojaDisenador(paginaId);
}

function seleccionarHojaDisenador(paginaId) {
  const lienzo = document.getElementById('designerBlocks');
  if (!lienzo) return;
  lienzo.dataset.activePageId = paginaId;
  lienzo.querySelectorAll('.designer-page-canvas').forEach((pagina) => pagina.classList.toggle('is-active-page', pagina.dataset.designerPageId === paginaId));
  document.querySelectorAll('#designerNavigatorList [data-navigator-page-id]').forEach((pagina) => pagina.classList.toggle('is-active', pagina.dataset.navigatorPageId === paginaId));
}

function agregarHojaEnBlanco() {
  guardarEstructuraPlantilla(false);
  const lienzo = document.getElementById('designerBlocks');
  const perfil = lienzo && perfilesInformes.find((item) => item.id === lienzo.dataset.profileId);
  if (!perfil) return;
  const pagina = { id: crearIdUnico('pagina'), nombre: `Página ${perfil.paginas.length + 1}` };
  perfil.paginas.push(pagina);
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarHojaDisenador(pagina.id);
}

function eliminarPaginaPlantilla(paginaId) {
  guardarEstructuraPlantilla(false);
  const lienzo = document.getElementById('designerBlocks');
  const perfil = lienzo && perfilesInformes.find((item) => item.id === lienzo.dataset.profileId);
  if (!perfil) return;
  const eliminadas = new Set(perfil.paginasEliminadas || []);
  const visibles = perfil.paginas.filter((pagina) => !eliminadas.has(pagina.id));
  if (visibles.length <= 1) {
    mostrarMensajeApp('No se puede eliminar', 'La plantilla debe conservar al menos una página.', 'info');
    return;
  }
  eliminadas.add(paginaId);
  perfil.paginasEliminadas = Array.from(eliminadas);
  if (perfil.bloques.some((bloque) => bloque.id === bloqueDisenadorSeleccionadoId && bloque.paginaId === paginaId)) bloqueDisenadorSeleccionadoId = null;
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
}

function restaurarPaginaPlantilla(paginaId) {
  const lienzo = document.getElementById('designerBlocks');
  const perfil = lienzo && perfilesInformes.find((item) => item.id === lienzo.dataset.profileId);
  if (!perfil) return;
  perfil.paginasEliminadas = (perfil.paginasEliminadas || []).filter((id) => id !== paginaId);
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarHojaDisenador(paginaId);
}

async function eliminarPaginaPlantillaDefinitivamente(paginaId) {
  guardarEstructuraPlantilla(false);
  const lienzo = document.getElementById('designerBlocks');
  const perfil = lienzo && perfilesInformes.find((item) => item.id === lienzo.dataset.profileId);
  const pagina = perfil?.paginas.find((item) => item.id === paginaId);
  if (!perfil || !pagina || !(perfil.paginasEliminadas || []).includes(paginaId)) return;
  if (perfil.paginas.length <= 1) {
    await mostrarMensajeApp('No se puede eliminar', 'La plantilla debe conservar al menos una página.', 'info');
    return;
  }
  const bloquesEnPagina = perfil.bloques.filter((bloque) => bloque.paginaId === paginaId).length;
  const detalleBloques = bloquesEnPagina === 0
    ? 'sin bloques asociados'
    : bloquesEnPagina === 1 ? 'junto con su bloque' : `junto con sus ${bloquesEnPagina} bloques`;
  const confirmado = await mostrarDialogoApp({
    titulo: 'Eliminar página definitivamente',
    mensaje: `La página “${pagina.nombre}”, ${detalleBloques}, se eliminará por completo de esta plantilla. Esta acción no se puede restaurar después de guardar.`,
    tipo: 'danger',
    confirmar: 'Eliminar definitivamente',
    cancelar: 'Conservar página'
  });
  if (!confirmado) return;
  perfil.paginas = perfil.paginas.filter((item) => item.id !== paginaId);
  perfil.paginasEliminadas = (perfil.paginasEliminadas || []).filter((id) => id !== paginaId);
  perfil.bloques = perfil.bloques.filter((bloque) => bloque.paginaId !== paginaId);
  if (bloqueDisenadorSeleccionadoId && !perfil.bloques.some((bloque) => bloque.id === bloqueDisenadorSeleccionadoId)) bloqueDisenadorSeleccionadoId = null;
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
}

function renderPaginasEliminadasPlantilla(perfil) {
  const panel = document.getElementById('designerDeletedPagesPanel');
  if (!panel) return;
  panel.style.display = 'none';
  panel.innerHTML = '';
}

function obtenerBloqueDisenador(idBloque) {
  const perfilId = document.getElementById('designerBlocks')?.dataset.profileId;
  const perfil = perfilesInformes.find((item) => item.id === perfilId);
  return { perfil, bloque: perfil?.bloques.find((item) => item.id === idBloque) };
}

function alternarVisibilidadDisenador(idBloque) {
  const { perfil, bloque } = obtenerBloqueDisenador(idBloque);
  if (!bloque) return;
  bloque.visible = !bloque.visible;
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
}

function eliminarBloqueDisenador(idBloque) {
  const { perfil } = obtenerBloqueDisenador(idBloque);
  if (!perfil) return;
  perfil.bloques = perfil.bloques.filter((item) => item.id !== idBloque);
  if (bloqueDisenadorSeleccionadoId === idBloque) bloqueDisenadorSeleccionadoId = null;
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
}

function obtenerPerfilDisenadorActivo() {
  const perfilId = document.getElementById('designerBlocks')?.dataset.profileId;
  return perfilesInformes.find((item) => item.id === perfilId) || null;
}

function contrasteEntreColores(colorA, colorB) {
  const luminancia = (color) => {
    const rgb = String(color || '#000000').slice(1).match(/.{2}/g)?.map((valor) => Number.parseInt(valor, 16) / 255) || [0, 0, 0];
    const lineal = rgb.map((valor) => valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4);
    return (0.2126 * lineal[0]) + (0.7152 * lineal[1]) + (0.0722 * lineal[2]);
  };
  const a = luminancia(colorA);
  const b = luminancia(colorB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function validarPlantillaActiva(mostrarResultado = true) {
  guardarEstructuraPlantilla(false);
  const perfil = obtenerPerfilDisenadorActivo();
  if (!perfil) return [];
  document.querySelectorAll('#designerBlocks .designer-block').forEach((elemento) => elemento.classList.remove('designer-issue-error', 'designer-issue-warning'));
  const incidencias = [];
  const agregar = (nivel, mensaje, bloque = null) => incidencias.push({ nivel, mensaje, bloqueId: bloque?.id || null });
  const eliminadas = new Set(perfil.paginasEliminadas || []);
  perfil.paginas.filter((pagina) => !eliminadas.has(pagina.id)).forEach((pagina) => {
    const paginaElemento = document.querySelector(`#designerBlocks [data-designer-page-id="${pagina.id}"]`);
    const anchoPagina = paginaElemento?.offsetWidth || 794;
    const altoPagina = paginaElemento?.offsetHeight || 1123;
    const bloques = perfil.bloques.filter((bloque) => bloque.paginaId === pagina.id && bloque.visible);
    if (!bloques.length) agregar('advertencia', `${pagina.nombre}: la página está vacía.`);
    const areaOcupada = bloques.reduce((total, bloque) => total + Math.max(0, bloque.width * bloque.height), 0);
    if (bloques.length && areaOcupada < anchoPagina * altoPagina * 0.08) agregar('advertencia', `${pagina.nombre}: contiene muy poco contenido; podría combinarse con otra página.`);
    bloques.forEach((bloque) => {
      if (bloque.x < 0 || bloque.y < 0 || bloque.x + bloque.width > anchoPagina + 1 || bloque.y + bloque.height > altoPagina + 1) agregar('error', `${pagina.nombre}: “${bloque.titulo}” sale de los límites de la hoja.`, bloque);
      const minimoAncho = bloque.tipo === 'bloque-figura' ? 24 : 80;
      const minimoAlto = bloque.tipo === 'bloque-figura' ? 24 : 48;
      if (bloque.width < minimoAncho || bloque.height < minimoAlto) agregar('error', `${pagina.nombre}: “${bloque.titulo}” es demasiado pequeño.`, bloque);
      if (bloque.tipo === 'bloque-datos-paciente' && normalizarCamposPaciente(bloque.camposPaciente).some((campo) => !campo.etiqueta.trim())) agregar('error', `${pagina.nombre}: hay un campo del paciente sin etiqueta.`, bloque);
      if (bloque.tipo === 'bloque-tabla-moderna' && normalizarTablaMediciones(bloque.contenidoDefecto).cabeceras.some((cabecera) => !String(cabecera).trim())) agregar('advertencia', `${pagina.nombre}: la tabla “${bloque.titulo}” tiene encabezados vacíos.`, bloque);
      if (bloque.tipo === 'bloque-imagenes-grid' && Math.abs(bloque.height - calcularAltoBloqueImagenes(bloque.width)) > 4) agregar('error', `${pagina.nombre}: la cuadrícula de imágenes perdió su proporción 2 × 3.`, bloque);
      if (!['bloque-figura', 'bloque-titulo-principal'].includes(bloque.tipo) && contrasteEntreColores(bloque.color || perfil.hoja.colorEnfasis, bloque.colorFondo || perfil.hoja.colorFondo) < 3) agregar('advertencia', `${pagina.nombre}: revisa el contraste de “${bloque.titulo}”.`, bloque);
    });
    for (let i = 0; i < bloques.length; i += 1) {
      for (let j = i + 1; j < bloques.length; j += 1) {
        const a = bloques[i]; const b = bloques[j];
        if (a.tipo === 'bloque-figura' || b.tipo === 'bloque-figura') continue;
        const ancho = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const alto = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        const proporcion = (ancho * alto) / Math.max(1, Math.min(a.width * a.height, b.width * b.height));
        if (proporcion > 0.18) agregar('advertencia', `${pagina.nombre}: “${a.titulo}” y “${b.titulo}” se superponen.`, a);
      }
    }
  });
  incidencias.forEach((item) => {
    if (!item.bloqueId) return;
    document.querySelector(`#designerBlocks [data-block-id="${item.bloqueId}"]`)?.classList.add(item.nivel === 'error' ? 'designer-issue-error' : 'designer-issue-warning');
  });
  if (mostrarResultado) {
    const errores = incidencias.filter((item) => item.nivel === 'error').length;
    const advertencias = incidencias.length - errores;
    const detalle = incidencias.slice(0, 8).map((item) => `${item.nivel === 'error' ? 'Error' : 'Aviso'}: ${item.mensaje}`).join(' · ');
    mostrarMensajeApp(incidencias.length ? `Revisión: ${errores} errores y ${advertencias} avisos` : 'Plantilla lista', incidencias.length ? `${detalle}${incidencias.length > 8 ? ` · Y ${incidencias.length - 8} observaciones más.` : ''}` : 'No se detectaron recortes, tamaños inválidos, solapamientos ni problemas importantes de contraste.', incidencias.length ? 'info' : 'success');
  }
  return incidencias;
}

function previsualizarDesbordamientoPlantilla() {
  guardarEstructuraPlantilla(false);
  const perfil = obtenerPerfilDisenadorActivo();
  if (!perfil) return;
  const estimaciones = [];
  perfil.bloques.filter((bloque) => bloque.visible).forEach((bloque) => {
    if (bloque.tipo === 'bloque-texto-libre') {
      const texto = String(bloque.contenidoDefecto || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const capacidad = Math.max(40, Math.floor((bloque.width * Math.max(20, bloque.height - 42)) / Math.max(80, bloque.fontSize * bloque.fontSize * 0.72)));
      if (texto.length > capacidad) estimaciones.push(`“${bloque.titulo}”: aproximadamente ${Math.ceil(texto.length / capacidad)} páginas`);
    }
    if (bloque.tipo === 'bloque-tabla-moderna') {
      const filas = normalizarTablaMediciones(bloque.contenidoDefecto).filas.length;
      const capacidad = Math.max(1, Math.floor((bloque.height - 70) / 32));
      if (filas > capacidad) estimaciones.push(`“${bloque.titulo}”: ${Math.ceil(filas / capacidad)} páginas, repitiendo encabezados`);
    }
    if (bloque.tipo === 'bloque-imagenes-grid') estimaciones.push(`“${bloque.titulo}”: una página nueva por cada 6 imágenes adicionales`);
  });
  mostrarMensajeApp('Vista previa de desbordamiento', estimaciones.length ? estimaciones.join(' · ') : 'Con el contenido inicial actual no se prevén páginas adicionales. Los bloques que crezcan se repetirán con la misma estética, sin rótulo de continuación.', 'info');
}

function copiarBloquesSeleccionados() {
  guardarEstructuraPlantilla(false);
  const perfil = obtenerPerfilDisenadorActivo();
  if (!perfil) return;
  const ids = bloquesDisenadorSeleccionados.size ? bloquesDisenadorSeleccionados : new Set(bloqueDisenadorSeleccionadoId ? [bloqueDisenadorSeleccionadoId] : []);
  const bloques = perfil.bloques.filter((bloque) => ids.has(bloque.id));
  if (!bloques.length) return mostrarAvisoBreve('Selecciona al menos un bloque para copiar.', 'info');
  localStorage.setItem('portapapelesBloquesPlantilla', JSON.stringify({ version: 1, bloques: clonarProfundo(bloques) }));
  mostrarAvisoBreve(`${bloques.length} bloque${bloques.length === 1 ? '' : 's'} copiado${bloques.length === 1 ? '' : 's'}. Puedes pegarlos en otra plantilla.`);
}

function pegarBloquesDisenador() {
  const perfil = obtenerPerfilDisenadorActivo();
  if (!perfil) return;
  let portapapeles;
  try { portapapeles = JSON.parse(localStorage.getItem('portapapelesBloquesPlantilla') || 'null'); } catch (error) { portapapeles = null; }
  if (!Array.isArray(portapapeles?.bloques) || !portapapeles.bloques.length) return mostrarAvisoBreve('El portapapeles de bloques está vacío.', 'info');
  const paginaId = document.getElementById('designerBlocks')?.dataset.activePageId || perfil.paginas[0]?.id;
  const nuevos = portapapeles.bloques.map((origen, indice) => normalizarBloquePerfil({ ...clonarProfundo(origen), id: crearIdUnico('bloque'), paginaId, x: Number(origen.x || 0) + 20, y: Number(origen.y || 0) + 20, capa: perfil.bloques.length + indice + 1, bloqueado: false }, perfil.bloques.length + indice, paginaId));
  perfil.bloques.push(...nuevos);
  bloquesDisenadorSeleccionados = new Set(nuevos.map((bloque) => bloque.id));
  bloqueDisenadorSeleccionadoId = nuevos[0].id;
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  seleccionarHojaDisenador(paginaId);
}

function alinearSeleccionDisenador(modo = 'izquierda') {
  guardarEstructuraPlantilla(false);
  const perfil = obtenerPerfilDisenadorActivo();
  const bloques = perfil?.bloques.filter((bloque) => bloquesDisenadorSeleccionados.has(bloque.id) && !bloque.bloqueado) || [];
  if (bloques.length < 2) return mostrarAvisoBreve('Selecciona dos o más bloques desbloqueados con Ctrl o Cmd + clic.', 'info');
  const referencia = bloques[0];
  bloques.forEach((bloque) => {
    if (modo === 'izquierda') bloque.x = referencia.x;
    else if (modo === 'arriba') bloque.y = referencia.y;
    else if (modo === 'centro') bloque.x = referencia.x + (referencia.width - bloque.width) / 2;
  });
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
}

function alternarBloqueoSeleccionDisenador() {
  const perfil = obtenerPerfilDisenadorActivo();
  const bloques = perfil?.bloques.filter((bloque) => bloquesDisenadorSeleccionados.has(bloque.id)) || [];
  if (!bloques.length) return mostrarAvisoBreve('Selecciona uno o más bloques.', 'info');
  const bloquear = bloques.some((bloque) => !bloque.bloqueado);
  bloques.forEach((bloque) => { bloque.bloqueado = bloquear; });
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
  mostrarAvisoBreve(bloquear ? 'Selección bloqueada.' : 'Selección desbloqueada.');
}

function guardarComponenteDisenador() {
  copiarBloquesSeleccionados();
  let copia;
  try { copia = JSON.parse(localStorage.getItem('portapapelesBloquesPlantilla') || 'null'); } catch (error) { copia = null; }
  if (!copia?.bloques?.length) return;
  const nombre = window.prompt('Nombre del componente reutilizable:', copia.bloques[0].titulo || 'Componente');
  if (!String(nombre || '').trim()) return;
  let componentes = [];
  try { componentes = JSON.parse(localStorage.getItem('componentesPlantilla') || '[]'); } catch (error) { componentes = []; }
  componentes.push({ id: crearIdUnico('componente'), nombre: String(nombre).trim().slice(0, 60), creadoEn: new Date().toISOString(), bloques: copia.bloques });
  localStorage.setItem('componentesPlantilla', JSON.stringify(componentes.slice(-30)));
  mostrarAvisoBreve('Componente guardado.');
}

function insertarComponenteDisenador() {
  let componentes = [];
  try { componentes = JSON.parse(localStorage.getItem('componentesPlantilla') || '[]'); } catch (error) { componentes = []; }
  if (!componentes.length) return mostrarAvisoBreve('Aún no hay componentes guardados.', 'info');
  const lista = componentes.map((item, indice) => `${indice + 1}. ${item.nombre}`).join('\n');
  const numero = Number.parseInt(window.prompt(`Elige el número del componente:\n${lista}`, String(componentes.length)), 10);
  const componente = componentes[numero - 1];
  if (!componente) return;
  localStorage.setItem('portapapelesBloquesPlantilla', JSON.stringify({ version: 1, bloques: componente.bloques }));
  pegarBloquesDisenador();
}

function obtenerVersionesPlantillas() {
  try { return JSON.parse(localStorage.getItem('versionesPlantillas') || '{}') || {}; } catch (error) { return {}; }
}

function registrarVersionPlantilla(perfil) {
  const versiones = obtenerVersionesPlantillas();
  const anterior = sesionDisenadorPlantilla?.original || perfil;
  versiones[perfil.id] = [...(versiones[perfil.id] || []), { guardadoEn: new Date().toISOString(), perfil: clonarProfundo(anterior) }].slice(-12);
  localStorage.setItem('versionesPlantillas', JSON.stringify(versiones));
}

async function mostrarHistorialVersionesPlantilla() {
  const perfil = obtenerPerfilDisenadorActivo();
  const versiones = perfil ? (obtenerVersionesPlantillas()[perfil.id] || []) : [];
  if (!perfil || !versiones.length) return mostrarMensajeApp('Sin versiones anteriores', 'Las versiones se crearán automáticamente cada vez que guardes la plantilla.', 'info');
  const version = versiones[versiones.length - 1];
  const anterior = version.perfil;
  const aceptar = await mostrarDialogoApp({ titulo: 'Restaurar versión anterior', mensaje: `Guardada el ${new Date(version.guardadoEn).toLocaleString('es-CL')}. Actual: ${perfil.paginas.length} páginas y ${perfil.bloques.length} bloques. Anterior: ${anterior.paginas.length} páginas y ${anterior.bloques.length} bloques.`, tipo: 'info', confirmar: 'Restaurar', cancelar: 'Conservar actual' });
  if (!aceptar) return;
  const indice = perfilesInformes.findIndex((item) => item.id === perfil.id);
  perfilesInformes[indice] = normalizarPerfilInforme(clonarProfundo(anterior));
  versiones[perfil.id].pop();
  localStorage.setItem('versionesPlantillas', JSON.stringify(versiones));
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
}

async function guardarPlantillaConValidacion() {
  const incidencias = validarPlantillaActiva(false);
  if (incidencias.length) {
    const errores = incidencias.filter((item) => item.nivel === 'error').length;
    const continuar = await mostrarDialogoApp({ titulo: 'Revisar antes de guardar', mensaje: `Se detectaron ${errores} errores y ${incidencias.length - errores} avisos. Se resaltaron los bloques implicados. Puedes guardar igualmente o volver a corregirlos.`, tipo: errores ? 'danger' : 'info', confirmar: 'Guardar igualmente', cancelar: 'Corregir' });
    if (!continuar) return;
  }
  const perfil = obtenerPerfilDisenadorActivo();
  if (perfil) registrarVersionPlantilla(perfil);
  window.clearTimeout(timerAutoguardadoDisenador);
  guardarEstructuraPlantilla(true);
  if (perfil) localStorage.removeItem(`borradorPlantilla:${perfil.id}`);
}

async function revisarRecuperacionDisenador(perfil) {
  if (!perfil || recuperacionDisenadorRevisadaId === perfil.id) return;
  recuperacionDisenadorRevisadaId = perfil.id;
  let borrador;
  try { borrador = JSON.parse(localStorage.getItem(`borradorPlantilla:${perfil.id}`) || 'null'); } catch (error) { borrador = null; }
  if (!borrador?.perfil || borrador.guardadoEn <= (perfil.modificadoEn || '')) return;
  const recuperar = await mostrarDialogoApp({ titulo: 'Recuperar edición automática', mensaje: `Hay cambios sin guardar recuperados del ${new Date(borrador.guardadoEn).toLocaleString('es-CL')}.`, tipo: 'info', confirmar: 'Recuperar', cancelar: 'Descartar' });
  if (!recuperar) {
    localStorage.removeItem(`borradorPlantilla:${perfil.id}`);
    return;
  }
  const indice = perfilesInformes.findIndex((item) => item.id === perfil.id);
  perfilesInformes[indice] = normalizarPerfilInforme(borrador.perfil);
  marcarDisenadorConCambios();
  diseñarEstructuraPlantilla(perfil.id);
}

function agregarFilaDisenador(idBloque) {
  guardarEstructuraPlantilla(false);
  const { perfil, bloque } = obtenerBloqueDisenador(idBloque);
  if (!bloque) return;
  bloque.contenidoDefecto.filas.push(['', '', '']);
  guardarPerfiles();
  diseñarEstructuraPlantilla(perfil.id);
}

function guardarEstructuraPlantilla(mostrarAviso = true) {
  const lienzo = document.getElementById('designerBlocks');
  const perfil = lienzo && perfilesInformes.find((item) => item.id === lienzo.dataset.profileId);
  if (!perfil) return;
  perfil.hoja = normalizarEstiloHoja({
    colorFondo: document.getElementById('designerPageColor')?.value,
    colorEnfasis: document.getElementById('designerAccentColor')?.value
  });
  lienzo.querySelectorAll('.designer-block').forEach((elemento) => {
    const bloque = perfil.bloques.find((item) => item.id === elemento.dataset.blockId);
    if (!bloque) return;
    const pagina = elemento.closest('.designer-page-canvas');
    if (pagina?.dataset.designerPageId) bloque.paginaId = pagina.dataset.designerPageId;
    bloque.x = Number.parseFloat(elemento.style.left) || 0;
    bloque.y = Number.parseFloat(elemento.style.top) || 0;
    bloque.width = elemento.offsetWidth;
    bloque.height = elemento.offsetHeight;
  });
  if (mostrarAviso) {
    perfil.modificadoEn = new Date().toISOString();
    permitirPersistenciaDisenador = true;
    guardarPerfiles();
    permitirPersistenciaDisenador = false;
    if (sesionDisenadorPlantilla) sesionDisenadorPlantilla.original = clonarProfundo(perfil);
    perfilNuevoPendienteId = null;
    const botonGuardar = document.getElementById('saveDesignerButton');
    botonGuardar?.classList.remove('has-unsaved-changes');
    botonGuardar?.setAttribute('aria-label', 'Guardar plantilla');
    if (botonGuardar) {
      botonGuardar.textContent = 'Guardar plantilla';
      botonGuardar.dataset.originalText = 'Guardar plantilla';
    }
    mostrarEstadoBoton(botonGuardar, 'Plantilla guardada');
  }
}

function volverDesdeDisenador() {
  const sesion = sesionDisenadorPlantilla;
  if (sesion) {
    const indice = perfilesInformes.findIndex((perfil) => perfil.id === sesion.perfilId);
    if (sesion.original && indice >= 0) perfilesInformes[indice] = clonarProfundo(sesion.original);
    if (!sesion.original) perfilesInformes = perfilesInformes.filter((perfil) => perfil.id !== sesion.perfilId);
  }
  sesionDisenadorPlantilla = null;
  perfilNuevoPendienteId = null;
  permitirPersistenciaDisenador = false;
  cargarPerfiles();
  perfilesInformes = perfilesInformes.filter(Boolean).map(normalizarPerfilInforme);
  mostrarGestorPerfiles();
}

let ajusteCuadriculaActivo = true;
let arrastreBloqueActivo = null;
let redimensionBloqueActiva = null;
let fotogramaAutoScrollArrastre = null;
const PASO_CUADRICULA = 20;
const MARGEN_AUTO_SCROLL = 120;
const VELOCIDAD_MAX_AUTO_SCROLL = 26;
const TOLERANCIA_GUIA_ALINEACION = 8;

function iniciarArrastreBloque(event, elemento, modoDisenador = false) {
  if (event.button !== 0 || event.target.closest('input, textarea, button, select, [contenteditable="true"]')) return;
  if (modoDisenador && elemento.dataset.locked === 'true') {
    seleccionarBloqueDisenador(elemento.dataset.blockId, event);
    mostrarAvisoBreve('Este bloque está bloqueado. Desbloquéalo para moverlo.', 'info');
    return;
  }
  const pagina = elemento.closest('.designer-page-canvas, .profile-layout-page');
  if (!pagina) return;
  event.preventDefault();
  const rectPagina = pagina.getBoundingClientRect();
  const rectBloque = elemento.getBoundingClientRect();
  const escalaX = rectPagina.width / pagina.offsetWidth || 1;
  const escalaY = rectPagina.height / pagina.offsetHeight || 1;
  arrastreBloqueActivo = {
    elemento,
    pagina,
    modoDisenador,
    pointerId: event.pointerId,
    offsetX: (event.clientX - rectBloque.left) / escalaX,
    offsetY: (event.clientY - rectBloque.top) / escalaY,
    ultimoClientX: event.clientX,
    ultimoClientY: event.clientY,
    inicioElementoX: Number.parseFloat(elemento.style.left) || 0,
    inicioElementoY: Number.parseFloat(elemento.style.top) || 0,
    grupo: modoDisenador && bloquesDisenadorSeleccionados.has(elemento.dataset.blockId)
      ? Array.from(pagina.querySelectorAll('.designer-block')).filter((item) => item !== elemento && bloquesDisenadorSeleccionados.has(item.dataset.blockId) && item.dataset.locked !== 'true').map((item) => ({ elemento: item, x: Number.parseFloat(item.style.left) || 0, y: Number.parseFloat(item.style.top) || 0 }))
      : []
  };
  if (elemento.setPointerCapture) elemento.setPointerCapture(event.pointerId);
  elemento.classList.add('is-moving');
  pagina.classList.add('show-snap-grid');
  prepararGuiasAlineacionArrastre(pagina);
  document.addEventListener('pointermove', moverBloqueActivo);
  document.addEventListener('pointerup', finalizarArrastreBloque);
  document.addEventListener('pointercancel', finalizarArrastreBloque);
  window.addEventListener('blur', finalizarArrastreBloque);
}

function iniciarRedimensionBloque(event, elemento, direccion, modoDisenador = false) {
  if (event.button !== 0) return;
  if (modoDisenador && elemento.dataset.locked === 'true') {
    event.preventDefault();
    event.stopPropagation();
    mostrarAvisoBreve('Este bloque está bloqueado. Desbloquéalo para cambiar su tamaño.', 'info');
    return;
  }
  const pagina = elemento.closest('.designer-page-canvas, .profile-layout-page');
  if (!pagina) return;
  event.preventDefault();
  event.stopPropagation();
  const rectPagina = pagina.getBoundingClientRect();
  const escalaX = rectPagina.width / pagina.offsetWidth || 1;
  const escalaY = rectPagina.height / pagina.offsetHeight || 1;
  redimensionBloqueActiva = {
    elemento,
    pagina,
    direccion,
    modoDisenador,
    inicioX: event.clientX,
    inicioY: event.clientY,
    x: Number.parseFloat(elemento.style.left) || 0,
    y: Number.parseFloat(elemento.style.top) || 0,
    width: elemento.offsetWidth,
    height: elemento.offsetHeight,
    escalaX,
    escalaY
  };
  elemento.classList.add('is-resizing');
  if (modoDisenador) seleccionarBloqueDisenador(elemento.dataset.blockId);
  pagina.classList.add('show-snap-grid');
  document.addEventListener('pointermove', redimensionarBloqueActivo);
  document.addEventListener('pointerup', finalizarRedimensionBloque, { once: true });
}

function redimensionarBloqueActivo(event) {
  if (!redimensionBloqueActiva) return;
  const estado = redimensionBloqueActiva;
  const { elemento, pagina, direccion } = estado;
  const dx = (event.clientX - estado.inicioX) / estado.escalaX;
  const dy = (event.clientY - estado.inicioY) / estado.escalaY;
  let x = estado.x;
  let y = estado.y;
  const ajustaHorizontal = direccion.includes('e') || direccion.includes('w');
  const ajustaVertical = direccion.includes('n') || direccion.includes('s');
  let width = estado.width + (direccion.includes('e') ? dx : direccion.includes('w') ? -dx : 0);
  let height = estado.height + (direccion.includes('s') ? dy : direccion.includes('n') ? -dy : 0);
  if (direccion.includes('w')) x = estado.x + dx;
  if (direccion.includes('n')) y = estado.y + dy;
  const esFigura = elemento.classList.contains('bloque-figura');
  const minimo = elemento.classList.contains('bloque-logo') ? 100 : esFigura ? 24 : 80;
  if (elemento.classList.contains('bloque-logo')) {
    const lado = Math.max(minimo, width, height);
    width = lado;
    height = lado;
    if (direccion.includes('w')) x = estado.x + estado.width - lado;
    if (direccion.includes('n')) y = estado.y + estado.height - lado;
  }
  if (ajusteCuadriculaActivo) {
    x = Math.round(x / PASO_CUADRICULA) * PASO_CUADRICULA;
    y = Math.round(y / PASO_CUADRICULA) * PASO_CUADRICULA;
    if (ajustaHorizontal) width = Math.round(width / PASO_CUADRICULA) * PASO_CUADRICULA;
    if (ajustaVertical) height = Math.round(height / PASO_CUADRICULA) * PASO_CUADRICULA;
  }
  if (elemento.classList.contains('bloque-imagenes-grid')) {
    const bordeDerecho = estado.x + estado.width;
    const bordeInferior = estado.y + estado.height;
    const anchoDesdeAlto = calcularAnchoBloqueImagenes(height);
    const cambioHorizontal = Math.abs(width - estado.width);
    const cambioVertical = Math.abs(anchoDesdeAlto - estado.width);
    let anchoObjetivo = cambioHorizontal >= cambioVertical ? width : anchoDesdeAlto;
    if (ajusteCuadriculaActivo) anchoObjetivo = Math.round(anchoObjetivo / PASO_CUADRICULA) * PASO_CUADRICULA;
    const maximoHorizontal = direccion.includes('w') ? bordeDerecho : pagina.offsetWidth - estado.x;
    const altoDisponible = direccion.includes('n') ? bordeInferior : pagina.offsetHeight - estado.y;
    const maximoVertical = calcularAnchoBloqueImagenes(altoDisponible);
    const anchoMaximo = Math.max(80, Math.min(maximoHorizontal, maximoVertical));
    const anchoMinimo = Math.min(240, anchoMaximo);
    width = Math.max(anchoMinimo, Math.min(anchoObjetivo, anchoMaximo));
    height = calcularAltoBloqueImagenes(width);
    x = direccion.includes('w') ? bordeDerecho - width : estado.x;
    y = direccion.includes('n') ? bordeInferior - height : estado.y;
    elemento.style.left = `${Math.max(0, x)}px`;
    elemento.style.top = `${Math.max(0, y)}px`;
    elemento.style.width = `${width}px`;
    elemento.style.height = `${height}px`;
    return;
  }
  x = Math.max(0, Math.min(x, pagina.offsetWidth - minimo));
  y = Math.max(0, Math.min(y, pagina.offsetHeight - minimo));
  width = Math.max(minimo, Math.min(width, pagina.offsetWidth - x));
  height = Math.max(minimo, Math.min(height, pagina.offsetHeight - y));
  if (elemento.classList.contains('bloque-logo')) {
    const lado = Math.min(width, height);
    width = lado;
    height = lado;
  }
  elemento.style.left = `${x}px`;
  elemento.style.top = `${y}px`;
  if (estado.grupo?.length) {
    const deltaX = x - estado.inicioElementoX;
    const deltaY = y - estado.inicioElementoY;
    estado.grupo.forEach((item) => {
      const maxGrupoX = Math.max(0, pagina.offsetWidth - item.elemento.offsetWidth);
      const maxGrupoY = Math.max(0, pagina.offsetHeight - item.elemento.offsetHeight);
      item.elemento.style.left = `${Math.max(0, Math.min(maxGrupoX, item.x + deltaX))}px`;
      item.elemento.style.top = `${Math.max(0, Math.min(maxGrupoY, item.y + deltaY))}px`;
      item.elemento.classList.add('is-moving');
    });
  }
  elemento.style.width = `${width}px`;
  elemento.style.height = `${height}px`;
}

function finalizarRedimensionBloque() {
  document.removeEventListener('pointermove', redimensionarBloqueActivo);
  if (!redimensionBloqueActiva) return;
  const { elemento, pagina, modoDisenador } = redimensionBloqueActiva;
  elemento.classList.remove('is-resizing');
  pagina.classList.remove('show-snap-grid');
  const bloque = informeLayoutActivo.bloques.find((item) => item.id === elemento.dataset.blockId);
  if (!modoDisenador && bloque) {
    bloque.x = Number.parseFloat(elemento.style.left) || 0;
    bloque.y = Number.parseFloat(elemento.style.top) || 0;
    bloque.width = elemento.offsetWidth;
    bloque.height = elemento.offsetHeight;
  }
  if (modoDisenador) guardarEstructuraPlantilla(false);
  if (modoDisenador) seleccionarBloqueDisenador(elemento.dataset.blockId);
  redimensionBloqueActiva = null;
}

function moverBloqueActivo(event) {
  if (!arrastreBloqueActivo) return;
  arrastreBloqueActivo.ultimoClientX = event.clientX;
  arrastreBloqueActivo.ultimoClientY = event.clientY;
  moverBloqueHaciaPuntero(event.clientX, event.clientY);
  iniciarAutoScrollArrastre();
}

function moverBloqueHaciaPuntero(clientX, clientY) {
  if (!arrastreBloqueActivo) return;
  const estado = arrastreBloqueActivo;
  const paginaDestino = obtenerPaginaDestinoArrastre(clientX, clientY, estado);
  if (paginaDestino && paginaDestino !== estado.pagina) cambiarPaginaDuranteArrastre(paginaDestino);
  const { elemento, pagina } = estado;
  const rectPagina = pagina.getBoundingClientRect();
  const escalaX = rectPagina.width / pagina.offsetWidth || 1;
  const escalaY = rectPagina.height / pagina.offsetHeight || 1;
  const maxX = Math.max(0, pagina.offsetWidth - elemento.offsetWidth);
  const maxY = Math.max(0, pagina.offsetHeight - elemento.offsetHeight);
  let x = (clientX - rectPagina.left) / escalaX - estado.offsetX;
  let y = (clientY - rectPagina.top) / escalaY - estado.offsetY;
  if (ajusteCuadriculaActivo) {
    x = Math.round(x / PASO_CUADRICULA) * PASO_CUADRICULA;
    y = Math.round(y / PASO_CUADRICULA) * PASO_CUADRICULA;
  }
  x = Math.max(0, Math.min(maxX, x));
  y = Math.max(0, Math.min(maxY, y));
  const ajusteAlineacion = calcularAjusteGuiasAlineacion(elemento, pagina, x, y);
  x = Math.max(0, Math.min(maxX, ajusteAlineacion.x));
  y = Math.max(0, Math.min(maxY, ajusteAlineacion.y));
  if (elemento.classList.contains('bloque-figura')) {
    const toleranciaBorde = 16;
    if (x <= toleranciaBorde) x = 0;
    else if (maxX - x <= toleranciaBorde) x = maxX;
    if (y <= toleranciaBorde) y = 0;
    else if (maxY - y <= toleranciaBorde) y = maxY;
  }
  actualizarGuiasAlineacionArrastre(pagina, ajusteAlineacion);
  elemento.style.left = `${x}px`;
  elemento.style.top = `${y}px`;
}

function encontrarCentroAlineado(centroActual, candidatos) {
  return candidatos.reduce((mejor, candidato) => {
    const distancia = Math.abs(candidato.valor - centroActual);
    if (distancia > TOLERANCIA_GUIA_ALINEACION || (mejor && distancia >= mejor.distancia)) return mejor;
    return { ...candidato, distancia };
  }, null);
}

function calcularAjusteGuiasAlineacion(elemento, pagina, x, y) {
  const otrosBloques = Array.from(pagina.children).filter((hijo) => hijo !== elemento && hijo.classList?.contains('layout-block'));
  const candidatosX = [{ valor: pagina.offsetWidth / 2, origen: 'hoja' }];
  const candidatosY = [{ valor: pagina.offsetHeight / 2, origen: 'hoja' }];
  otrosBloques.forEach((bloque) => {
    candidatosX.push({ valor: bloque.offsetLeft + (bloque.offsetWidth / 2), origen: 'bloque' });
    candidatosY.push({ valor: bloque.offsetTop + (bloque.offsetHeight / 2), origen: 'bloque' });
  });
  const centroX = x + (elemento.offsetWidth / 2);
  const centroY = y + (elemento.offsetHeight / 2);
  const ajusteX = encontrarCentroAlineado(centroX, candidatosX);
  const ajusteY = encontrarCentroAlineado(centroY, candidatosY);
  return {
    x: ajusteX ? x + ajusteX.valor - centroX : x,
    y: ajusteY ? y + ajusteY.valor - centroY : y,
    guiaX: ajusteX?.valor ?? null,
    guiaY: ajusteY?.valor ?? null,
    origenX: ajusteX?.origen || '',
    origenY: ajusteY?.origen || ''
  };
}

function crearGuiaAlineacion(clase, eje, etiqueta = '') {
  const guia = document.createElement('span');
  guia.className = `alignment-guide ${clase} alignment-guide-${eje}`;
  guia.setAttribute('aria-hidden', 'true');
  if (etiqueta) guia.dataset.label = etiqueta;
  return guia;
}

function prepararGuiasAlineacionArrastre(pagina) {
  limpiarGuiasAlineacionArrastre();
  pagina.classList.add('show-alignment-guides');
  pagina.appendChild(crearGuiaAlineacion('page-center-guide', 'vertical', 'Centro de hoja'));
  pagina.appendChild(crearGuiaAlineacion('page-center-guide', 'horizontal', 'Centro de hoja'));
  pagina.appendChild(crearGuiaAlineacion('smart-alignment-guide', 'vertical'));
  pagina.appendChild(crearGuiaAlineacion('smart-alignment-guide', 'horizontal'));
}

function actualizarGuiasAlineacionArrastre(pagina, ajuste) {
  const vertical = pagina.querySelector('.smart-alignment-guide.alignment-guide-vertical');
  const horizontal = pagina.querySelector('.smart-alignment-guide.alignment-guide-horizontal');
  if (vertical) {
    vertical.classList.toggle('is-visible', ajuste.guiaX !== null);
    vertical.classList.toggle('is-page-alignment', ajuste.origenX === 'hoja');
    if (ajuste.guiaX !== null) vertical.style.left = `${ajuste.guiaX}px`;
  }
  if (horizontal) {
    horizontal.classList.toggle('is-visible', ajuste.guiaY !== null);
    horizontal.classList.toggle('is-page-alignment', ajuste.origenY === 'hoja');
    if (ajuste.guiaY !== null) horizontal.style.top = `${ajuste.guiaY}px`;
  }
}

function limpiarGuiasAlineacionArrastre() {
  document.querySelectorAll('.show-alignment-guides').forEach((pagina) => pagina.classList.remove('show-alignment-guides'));
  document.querySelectorAll('.alignment-guide').forEach((guia) => guia.remove());
}

function obtenerPaginaDestinoArrastre(clientX, clientY, estado) {
  const selector = estado.modoDisenador
    ? '.designer-page-canvas:not(.is-deleted-template-page)'
    : '.profile-layout-page';
  const paginas = Array.from(document.querySelectorAll(selector));
  return paginas.find((pagina) => {
    if (estado.elemento.classList.contains('bloque-titulo-principal') && pagina !== estado.pagina) return false;
    const rect = pagina.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }) || null;
}

function cambiarPaginaDuranteArrastre(paginaDestino) {
  if (!arrastreBloqueActivo) return;
  const estado = arrastreBloqueActivo;
  estado.pagina.classList.remove('show-snap-grid');
  limpiarGuiasAlineacionArrastre();
  paginaDestino.appendChild(estado.elemento);
  estado.pagina = paginaDestino;
  paginaDestino.classList.add('show-snap-grid');
  prepararGuiasAlineacionArrastre(paginaDestino);
  const paginaId = estado.modoDisenador
    ? paginaDestino.dataset.designerPageId
    : paginaDestino.dataset.profilePageId;
  if (paginaId) {
    if (estado.modoDisenador) seleccionarHojaDisenador(paginaId);
    const bloques = estado.modoDisenador
      ? perfilesInformes.find((perfil) => perfil.id === document.getElementById('designerBlocks')?.dataset.profileId)?.bloques
      : informeLayoutActivo.bloques;
    const bloque = bloques?.find((item) => item.id === estado.elemento.dataset.blockId);
    if (bloque) {
      bloque.paginaId = paginaId;
      bloque.capa = (bloques || []).filter((item) => item.id !== bloque.id && item.paginaId === paginaId).reduce((maximo, item) => Math.max(maximo, Number(item.capa) || 0), 0) + 1;
      normalizarCapasBloques(bloques);
      estado.elemento.dataset.layer = String(bloque.capa);
      estado.elemento.style.zIndex = String(bloque.capa);
    }
  }
}

function obtenerVelocidadAutoScroll(clientY) {
  const altoVentana = window.innerHeight || document.documentElement.clientHeight;
  const margen = Math.min(MARGEN_AUTO_SCROLL, altoVentana * 0.22);
  if (clientY < margen) {
    const intensidad = Math.min(1, Math.max(0, (margen - clientY) / margen));
    return -Math.max(4, VELOCIDAD_MAX_AUTO_SCROLL * intensidad);
  }
  if (clientY > altoVentana - margen) {
    const intensidad = Math.min(1, Math.max(0, (clientY - (altoVentana - margen)) / margen));
    return Math.max(4, VELOCIDAD_MAX_AUTO_SCROLL * intensidad);
  }
  return 0;
}

function iniciarAutoScrollArrastre() {
  if (!arrastreBloqueActivo || fotogramaAutoScrollArrastre !== null) return;
  if (arrastreBloqueActivo.elemento.classList.contains('bloque-titulo-principal')) return;
  const desplazar = () => {
    fotogramaAutoScrollArrastre = null;
    if (!arrastreBloqueActivo) return;
    const velocidad = obtenerVelocidadAutoScroll(arrastreBloqueActivo.ultimoClientY);
    if (!velocidad) return;
    const scrollAnterior = window.scrollY;
    window.scrollBy(0, velocidad);
    if (window.scrollY !== scrollAnterior) {
      moverBloqueHaciaPuntero(arrastreBloqueActivo.ultimoClientX, arrastreBloqueActivo.ultimoClientY);
      fotogramaAutoScrollArrastre = window.requestAnimationFrame(desplazar);
    }
  };
  fotogramaAutoScrollArrastre = window.requestAnimationFrame(desplazar);
}

function detenerAutoScrollArrastre() {
  if (fotogramaAutoScrollArrastre !== null) window.cancelAnimationFrame(fotogramaAutoScrollArrastre);
  fotogramaAutoScrollArrastre = null;
}

function finalizarArrastreBloque() {
  document.removeEventListener('pointermove', moverBloqueActivo);
  document.removeEventListener('pointerup', finalizarArrastreBloque);
  document.removeEventListener('pointercancel', finalizarArrastreBloque);
  window.removeEventListener('blur', finalizarArrastreBloque);
  detenerAutoScrollArrastre();
  limpiarGuiasAlineacionArrastre();
  if (!arrastreBloqueActivo) return;
  const { elemento, pagina, modoDisenador, grupo = [] } = arrastreBloqueActivo;
  if (ajusteCuadriculaActivo) {
    const maxX = Math.max(0, pagina.offsetWidth - elemento.offsetWidth);
    const maxY = Math.max(0, pagina.offsetHeight - elemento.offsetHeight);
    const x = Math.round((Number.parseFloat(elemento.style.left) || 0) / PASO_CUADRICULA) * PASO_CUADRICULA;
    const y = Math.round((Number.parseFloat(elemento.style.top) || 0) / PASO_CUADRICULA) * PASO_CUADRICULA;
    elemento.style.left = `${Math.min(maxX, x)}px`;
    elemento.style.top = `${Math.min(maxY, y)}px`;
  }
  elemento.classList.remove('is-moving');
  grupo.forEach((item) => item.elemento.classList.remove('is-moving'));
  pagina.classList.remove('show-snap-grid');
  const bloque = informeLayoutActivo.bloques.find((item) => item.id === elemento.dataset.blockId);
  if (!modoDisenador && bloque) {
    bloque.paginaId = pagina.dataset.profilePageId || bloque.paginaId;
    bloque.x = Number.parseFloat(elemento.style.left) || 0;
    bloque.y = Number.parseFloat(elemento.style.top) || 0;
  }
  if (modoDisenador) guardarEstructuraPlantilla(false);
  arrastreBloqueActivo = null;
}

function cambiarAjusteCuadricula(checkbox) {
  ajusteCuadriculaActivo = Boolean(checkbox?.checked);
  document.body.classList.toggle('grid-snapping-enabled', ajusteCuadriculaActivo);
}

/**
 * =============================================================================
 * SECCIÓN 4: EDITOR DINÁMICO BASADO EN BLOQUES
 * Renderiza los bloques de un informe/perfil en el editor.
 * =============================================================================
 */

function renderizarBloquesEnEditor(bloques, contenedor) {
  if (!contenedor) return;
  contenedor.innerHTML = ''; // Limpiar el editor antes de renderizar

  bloques.forEach(bloque => {
    const wrapper = document.createElement('div');
    wrapper.className = 'report-block';
    wrapper.dataset.blockId = bloque.id;
    if (!bloque.visible) {
      wrapper.classList.add('bloque-oculto');
    }

    let contenidoBloque = '';
    switch (bloque.tipo) {
      case 'text-rich':
        contenidoBloque = `<div class="text-rich-editor" contenteditable="true">${bloque.contenido}</div>`;
        break;
      // Aquí se añadirían los otros tipos de bloques (table-mediciones, checkbox-group)
      default:
        contenidoBloque = `<p>Tipo de bloque no soportado: ${bloque.tipo}</p>`;
    }

    wrapper.innerHTML = `
      <div class="report-block-header">
        <h3>${escaparHTML(bloque.titulo)}</h3>
        <button class="mini-btn" onclick="toggleVisibilidadBloque(this, '${bloque.id}')">
          ${bloque.visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      <div class="report-block-content">
        ${contenidoBloque}
      </div>
    `;
    contenedor.appendChild(wrapper);
  });
}

function toggleVisibilidadBloque(button, bloqueId) {
  // Esta función necesitaría encontrar el bloque en el objeto del informe activo y cambiar su propiedad 'visible'.
  // Por ahora, solo simulamos el efecto visual.
  const wrapper = button.closest('.report-block');
  wrapper.classList.toggle('bloque-oculto');
  button.textContent = wrapper.classList.contains('bloque-oculto') ? 'Mostrar' : 'Ocultar';
}

function mostrarEstadoBoton(boton, textoTemporal = 'Cambios guardados') {
  if (!boton) return;
  const textoOriginal = boton.dataset.originalText || boton.textContent;
  boton.dataset.originalText = textoOriginal;
  boton.textContent = textoTemporal;
  window.clearTimeout(Number(boton.dataset.statusTimer || 0));
  const timer = window.setTimeout(() => {
    boton.textContent = boton.dataset.originalText || textoOriginal;
    boton.dataset.statusTimer = '';
  }, 1200);
  boton.dataset.statusTimer = String(timer);
}


function obtenerPlantillaDiplomadosPrincipal() {
  return '';
}

function obtenerPlantillaDiplomadosLateral() {
  return '';
}

function cambiarVista(vistaActiva) {
  const dashboardView = document.getElementById('dashboard-view');
  const editorView = document.getElementById('editor-view');
  const historialView = document.getElementById('historial-view');
  const papeleraView = document.getElementById('papelera-view');
  const configuracionView = document.getElementById('configuracion-view');
  const perfilesView = document.getElementById('perfiles-view');
  const designerView = document.getElementById('designer-view');
  const pacientesView = document.getElementById('pacientes-view');

  if (dashboardView) dashboardView.style.display = vistaActiva === 'dashboard' ? 'block' : 'none';
  if (editorView) editorView.style.display = vistaActiva === 'editor' ? 'block' : 'none';
  if (historialView) historialView.style.display = vistaActiva === 'historial' ? 'block' : 'none';
  if (papeleraView) papeleraView.style.display = vistaActiva === 'papelera' ? 'block' : 'none';
  if (configuracionView) configuracionView.style.display = vistaActiva === 'configuracion' ? 'block' : 'none';
  if (perfilesView) perfilesView.style.display = vistaActiva === 'perfiles' ? 'block' : 'none';
  if (designerView) designerView.style.display = vistaActiva === 'designer' ? 'block' : 'none';
  if (pacientesView) pacientesView.style.display = vistaActiva === 'pacientes' ? 'block' : 'none';
  if (vistaActiva !== 'editor') {
    const cinta = document.getElementById('wordRibbon');
    if (cinta) cinta.style.display = 'none';
  }
}

function marcarNavActiva(textoObjetivo) {
  const botones = Array.from(document.querySelectorAll('.top-nav .nav-item'));
  botones.forEach((boton) => {
    const etiqueta = boton.textContent.replace(/\s+/g, ' ').trim();
    const activa = textoObjetivo ? etiqueta.includes(textoObjetivo) : false;
    boton.classList.toggle('active', activa);
  });
}

/**
 * =============================================================================
 * SECCIÓN 5: CLONACIÓN PARA NUEVOS INFORMES
 * Inicia un nuevo informe a partir de un perfil seleccionado.
 * =============================================================================
 */

function iniciarInformeDesdePerfil(perfilId, datosPaciente = {}) {
  const perfil = perfilesInformes.find(p => p.id === perfilId);
  if (!perfil) {
    mostrarMensajeApp('Plantilla no disponible', 'La plantilla seleccionada ya no existe o no pudo cargarse.', 'danger');
    return;
  }

  // Clonación profunda para no mutar la plantilla original
  const paginasExcluidas = new Set(perfil.paginasEliminadas || []);
  const datosIniciales = { fecha: formatearFechaISO(new Date()), ...datosPaciente };
  informeLayoutActivo = normalizarLayoutInforme({
    perfilId: perfil.id,
    perfilNombre: perfil.nombre,
    identificadorPlantilla: clonarProfundo(perfil.identificador),
    hoja: clonarProfundo(perfil.hoja),
    datosPaciente: datosIniciales,
    paginas: clonarProfundo(perfil.paginas.filter((pagina) => !paginasExcluidas.has(pagina.id))),
    paginasEliminadas: [],
    bloques: clonarProfundo(perfil.bloques)
  });
  informeActivoId = `INF-${Date.now()}`;
  informeActivoCreadoEn = new Date().toISOString();
  cambiarVista('editor');
  renderizarEditorPerfil();
  document.querySelectorAll('#editor-view [data-report-field]').forEach((campo) => {
    asignarValorCampoInforme(campo, obtenerValorDatoInforme(datosIniciales, campo.dataset.reportField));
  });
  estadoInicialContenidoInforme = capturarEstadoContenidoInforme();
  marcarNavActiva(null);
}

function crearToolbarWord() {
  return '';
}

function aplicarFormatoWord(comando, valor = null) {
  restaurarRangoEditorEnriquecido();
  const editor = obtenerEditorEnriquecidoActivo();
  if (!editor) {
    mostrarAvisoBreve('Selecciona texto dentro del documento para aplicarle formato.', 'info');
    return;
  }
  registrarEstadoEditorParaDeshacer();
  editor.focus();
  document.execCommand('styleWithCSS', false, true);
  document.execCommand(comando, false, valor);
  guardarRangoEditorEnriquecido();
  sincronizarInformePerfilDesdeDOM();
  actualizarEstadoCintaWord();
  mostrarEstadoGuardadoWord('Cambios sin guardar');
}

function obtenerEditorEnriquecidoActivo() {
  const seleccion = window.getSelection();
  const nodo = seleccion?.anchorNode;
  const elemento = nodo?.nodeType === Node.ELEMENT_NODE ? nodo : nodo?.parentElement;
  return elemento?.closest?.('#editor-view .profile-rich-editor') || null;
}

function guardarRangoEditorEnriquecido() {
  const seleccion = window.getSelection();
  if (!seleccion?.rangeCount || !obtenerEditorEnriquecidoActivo()) return;
  rangoEditorEnriquecido = seleccion.getRangeAt(0).cloneRange();
}

function restaurarRangoEditorEnriquecido() {
  if (!rangoEditorEnriquecido) return;
  const seleccion = window.getSelection();
  try {
    seleccion.removeAllRanges();
    seleccion.addRange(rangoEditorEnriquecido);
  } catch (error) {
    rangoEditorEnriquecido = null;
  }
}

function actualizarEstadoCintaWord() {
  document.querySelectorAll('#wordRibbon [data-word-state]').forEach((boton) => {
    let activo = false;
    try { activo = document.queryCommandState(boton.dataset.wordState); } catch (error) { activo = false; }
    boton.classList.toggle('is-active', activo);
    boton.setAttribute('aria-pressed', String(activo));
  });
}

function mostrarEstadoGuardadoWord(texto) {
  const estado = document.getElementById('wordSaveStatus');
  if (!estado) return;
  estado.textContent = texto;
  estado.classList.toggle('has-changes', texto !== 'Guardado');
  window.clearTimeout(timerEstadoGuardadoWord);
  if (texto !== 'Guardado') timerEstadoGuardadoWord = window.setTimeout(() => { estado.textContent = 'Edición activa'; }, 1800);
}

function manejarAtajosWord(event) {
  const editor = event.target.closest?.('.profile-rich-editor');
  if (!editor || !(event.ctrlKey || event.metaKey) || event.altKey) return;
  const comandos = { b: 'bold', i: 'italic', u: 'underline' };
  const comando = comandos[String(event.key || '').toLowerCase()];
  if (!comando) return;
  event.preventDefault();
  guardarRangoEditorEnriquecido();
  aplicarFormatoWord(comando);
}

function filtrarCatalogoDisenador(valor) {
  const panel = document.getElementById('designerCatalogPanel');
  if (!panel) return;
  const consulta = normalizarTextoBusqueda(valor);
  let visibles = 0;
  panel.querySelectorAll('[data-block-label]').forEach((boton) => {
    const coincide = !consulta || normalizarTextoBusqueda(boton.dataset.blockLabel).includes(consulta);
    boton.hidden = !coincide;
    if (coincide) visibles += 1;
  });
  panel.querySelectorAll('.designer-category').forEach((categoria) => {
    const tieneResultados = Array.from(categoria.querySelectorAll('[data-block-label]')).some((boton) => !boton.hidden);
    categoria.hidden = !tieneResultados;
    if (consulta && tieneResultados) categoria.open = true;
  });
  const vacio = document.getElementById('designerCatalogEmpty');
  if (vacio) vacio.hidden = visibles > 0;
}

function enfocarSeccionSidebarDisenador(seccion, boton = null) {
  const toolbox = document.querySelector('.designer-toolbox');
  if (!toolbox) return;
  const catalogo = document.getElementById('designerCatalogPanel');
  const panelBloque = document.getElementById('designerBlockPanel');
  const mostrandoPropiedades = Boolean(panelBloque && panelBloque.style.display !== 'none');
  const paneles = {
    paginas: [toolbox.querySelector('.designer-navigator')],
    bloques: [catalogo],
    apariencia: [toolbox.querySelector('.designer-controls-section')],
    avanzado: [toolbox.querySelector('.designer-assistant')]
  };
  const seccionActiva = Object.prototype.hasOwnProperty.call(paneles, seccion) ? seccion : 'paginas';
  toolbox.dataset.activeSection = seccionActiva;
  const visibles = new Set((paneles[seccionActiva] || []).filter(Boolean));
  if (mostrandoPropiedades) visibles.add(panelBloque);
  [toolbox.querySelector('.designer-navigator'), catalogo, panelBloque, toolbox.querySelector('.designer-controls-section'), toolbox.querySelector('.designer-assistant')]
    .filter(Boolean)
    .forEach((panel) => panel.classList.toggle('is-sidebar-section-hidden', !visibles.has(panel)));
  const destino = Array.from(visibles)[0];
  if (!destino) return;
  if (boton && destino instanceof HTMLDetailsElement) destino.open = true;
  const botonActivo = boton || toolbox.querySelector(`.designer-sidebar-nav button[data-designer-section="${seccionActiva}"]`);
  toolbox.querySelectorAll('.designer-sidebar-nav button').forEach((item) => {
    const activo = item === botonActivo;
    item.classList.toggle('is-active', activo);
    item.setAttribute('aria-pressed', String(activo));
  });
  if (boton) window.requestAnimationFrame(() => {
    toolbox.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function mostrarAvisoBreve(mensaje, tipo = 'success') {
  let region = document.getElementById('appToastRegion');
  if (!region) {
    region = document.createElement('div');
    region.id = 'appToastRegion';
    region.className = 'app-toast-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }
  const aviso = document.createElement('div');
  aviso.className = `app-toast ${tipo === 'info' ? 'is-info' : ''}`;
  aviso.textContent = mensaje;
  region.replaceChildren(aviso);
  window.setTimeout(() => aviso.classList.add('is-visible'), 10);
  window.setTimeout(() => {
    aviso.classList.remove('is-visible');
    window.setTimeout(() => aviso.remove(), 220);
  }, 2600);
}

function manejarPegadoEditorEnriquecido(event) {
  const editor = event.target.closest?.('.profile-rich-editor');
  if (!editor) return;
  event.preventDefault();
  const texto = event.clipboardData?.getData('text/plain') || '';
  document.execCommand('insertText', false, texto.replace(/\r\n/g, '\n'));
  mostrarAvisoBreve('Texto pegado sin estilos externos.');
}

function renderizarEditorPerfil() {
  const plantilla = document.querySelector('#editor-view .report-template');
  if (!plantilla) return;
  plantilla.classList.add('profile-fill-mode');
  const cinta = document.getElementById('wordRibbon');
  if (cinta) cinta.style.display = 'block';
  let paginas = plantilla.querySelector('.profile-report-pages');
  if (!paginas) {
    paginas = document.createElement('div');
    paginas.className = 'profile-report-pages';
    plantilla.prepend(paginas);
  }
  paginas.innerHTML = '';
  const paginasPerfil = Array.isArray(informeLayoutActivo.paginas) && informeLayoutActivo.paginas.length ? informeLayoutActivo.paginas : [{ id: 'pagina-unica', nombre: 'Página 1' }];
  paginasPerfil.forEach((paginaPerfil, indicePagina) => {
    const pagina = document.createElement('section');
    pagina.className = 'report-letter-page body-page profile-body-page profile-layout-page';
    pagina.dataset.profilePageId = paginaPerfil.id;
    pagina.dataset.pageId = paginaPerfil.id;
    aplicarEstiloHojaPerfil(pagina);
    pagina.innerHTML = '';
    if (indicePagina === 0) pagina.insertAdjacentHTML('beforeend', crearHTMLIdentificadorPlantilla(informeLayoutActivo, false));
    informeLayoutActivo.bloques.filter((bloque) => bloque.paginaId === paginaPerfil.id && !(bloque.tipo === 'bloque-titulo-principal' && indicePagina > 0)).forEach((bloque) => pagina.appendChild(crearBloqueEditorMaquetacion(bloque)));
    paginas.appendChild(pagina);
  });
  renderPaginasImagenesPerfil(informeLayoutActivo.imagenesPerfil, document);
  repaginarBloquesPerfil();
  aplicarPaginasEliminadas();
  renderControlesPaginasInforme();
  mostrarEstadoGuardadoWord('Listo');
}

function crearHTMLSlotsFotosPerfil(offset = 0) {
  return Array.from({ length: IMAGENES_POR_PAGINA }, (_, indice) => {
    const indiceGlobal = offset + indice;
    return `<button class="protected-photo-slot" type="button" draggable="true" data-photo-slot="${indice}" data-photo-index="${indiceGlobal}" onclick="seleccionarFotoPerfil(this)" ondragstart="iniciarArrastreFoto(event, this)" ondragover="permitirSoltarFoto(event, this)" ondragleave="salirZonaFoto(this)" ondrop="soltarFotoPerfil(event, this)" ondragend="finalizarArrastreFoto()"><span class="photo-slot-placeholder">+ Imagen</span><input type="file" accept="image/*" tabindex="-1" /></button>`;
  }).join('');
}

function crearBloqueEditorMaquetacion(bloque) {
  const elemento = document.createElement('article');
  elemento.className = `layout-block profile-layout-block is-layout-locked ${bloque.tipo}${bloque.tipo === 'bloque-imagenes-grid' ? ' profile-images-page' : ''}`;
  elemento.dataset.blockId = bloque.id;
  elemento.dataset.visible = String(bloque.visible);
  elemento.dataset.layer = String(bloque.capa);
  elemento.style.cssText = `left:${bloque.x}px;top:${bloque.y}px;width:${bloque.width}px;height:${bloque.height}px;z-index:${bloque.capa};background-color:${normalizarColorFondo(bloque.colorFondo, '#ffffff')};--bloque-color:${normalizarColorBloque(informeLayoutActivo.hoja.colorEnfasis)};--block-font-size:${bloque.fontSize}px;--block-text-align:${bloque.alineacion}`;
  if (bloque.tipo === 'bloque-imagenes-grid') {
    elemento.innerHTML = `<div class="template-image-grid-header"><h2>${escaparHTML(bloque.titulo)}</h2><div class="template-image-grid-rule"></div></div><div class="protected-photo-grid">${crearHTMLSlotsFotosPerfil()}</div>`;
  } else {
    elemento.innerHTML = crearContenidoBloqueMaquetacion(bloque, false);
  }
  return elemento;
}

function crearPaginaBloquePerfil(bloque, continuacion = false) {
  const pagina = document.createElement('section');
  pagina.className = `report-letter-page body-page profile-body-page profile-layout-page profile-generated-block-page${continuacion ? ' profile-continuation-page' : ''}`;
  pagina.dataset.blockId = bloque.id;
  pagina.dataset.visible = String(bloque.visible);
  aplicarEstiloHojaPerfil(pagina);
  const bloquePagina = { ...bloque, contenidoDefecto: continuacion && bloque.tipo === 'bloque-texto-libre' ? '' : bloque.contenidoDefecto };
  const elemento = crearBloqueEditorMaquetacion(bloquePagina);
  elemento.classList.add('profile-automatic-block');
  pagina.appendChild(elemento);
  return pagina;
}

function aplicarEstiloHojaPerfil(pagina) {
  const hoja = normalizarEstiloHoja(informeLayoutActivo.hoja);
  pagina.style.backgroundColor = hoja.colorFondo;
  pagina.style.setProperty('--bloque-color', hoja.colorEnfasis);
}

function crearHTMLTablaRellenable(bloque) {
  const tabla = normalizarTablaMediciones(bloque.contenidoDefecto);
  return `<table class="measurements-table"><thead><tr>${tabla.cabeceras.map((item, columna) => `<th style="${obtenerEstiloCeldaTabla(tabla, `h-${columna}`)}">${escaparHTML(item)}</th>`).join('')}</tr></thead><tbody>${tabla.filas.map((fila, indiceFila) => `<tr>${tabla.cabeceras.map((_, columna) => columna === 0 ? `<th scope="row" style="${obtenerEstiloCeldaTabla(tabla, `${indiceFila}-${columna}`)}">${escaparHTML(fila[columna] || '')}</th>` : columna === 1 ? `<td style="${obtenerEstiloCeldaTabla(tabla, `${indiceFila}-${columna}`)}"><input type="number" step="any" value="${escaparHTML(fila[columna] || '')}" aria-label="${escaparHTML(tabla.cabeceras[columna] || 'Valor')}" /></td>` : `<td style="${obtenerEstiloCeldaTabla(tabla, `${indiceFila}-${columna}`)}">${escaparHTML(fila[columna] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function paginarEditorEnTiempoReal(editor) {
  paginarBloqueTextoPerfil(editor, true);
}

function obtenerLimiteEditorPerfil(editor) {
  const bloqueElemento = editor.closest('.profile-layout-block');
  if (bloqueElemento) return Math.max(70, bloqueElemento.clientHeight - editor.offsetTop - 16);
  return 650;
}

function paginarBloqueTextoPerfil(editor, enfocarDestino = false) {
  if (!editor) return;
  const bloqueId = editor.dataset.richBlock || editor.closest('[data-block-id]')?.dataset.blockId;
  const bloque = informeLayoutActivo.bloques.find((item) => item.id === bloqueId);
  if (!bloque) return;
  let editorActual = editor;
  let destinoFinal = null;
  let seguridad = 0;
  while (editorActual.scrollHeight > obtenerLimiteEditorPerfil(editorActual) + 1 && seguridad < 30) {
    const paginaActual = editorActual.closest('.report-letter-page');
    if (!paginaActual) break;
    const nuevaPagina = crearPaginaBloquePerfil(bloque, true);
    nuevaPagina.dataset.generatedPage = `bloque-${bloque.id}`;
    paginaActual.after(nuevaPagina);
    const destino = nuevaPagina.querySelector('.profile-rich-editor');
    transferirDesbordamiento(editorActual, destino, obtenerLimiteEditorPerfil(editorActual));
    if (!destino.textContent.trim() && !destino.querySelector('*')) {
      nuevaPagina.remove();
      break;
    }
    destinoFinal = destino;
    editorActual = destino;
    seguridad += 1;
  }
  if (destinoFinal && enfocarDestino) {
    destinoFinal.focus();
    colocarCursorAlFinal(destinoFinal);
  }
  aplicarLayoutInforme();
}

function transferirDesbordamiento(origen, destino, limite) {
  const movidos = [];
  while (origen.scrollHeight > limite && origen.lastChild) {
    const nodo = origen.lastChild;
    if (nodo.nodeType === Node.TEXT_NODE && nodo.textContent.trim().includes(' ')) {
      const palabras = nodo.textContent.split(/(\s+)/);
      movidos.unshift(document.createTextNode(palabras.splice(-2).join('')));
      nodo.textContent = palabras.join('');
    } else {
      movidos.unshift(origen.removeChild(nodo));
    }
  }
  movidos.forEach((nodo) => destino.appendChild(nodo));
}

function manejarBackspaceContinuacion(event, editor) {
  if (event.key !== 'Backspace' || editor.textContent.trim() || editor.innerHTML.includes('<img')) return;
  const pagina = editor.closest('.profile-continuation-page');
  if (!pagina) return;
  event.preventDefault();
  const anterior = pagina.previousElementSibling?.querySelector('.profile-rich-editor');
  pagina.remove();
  if (anterior) { anterior.focus(); colocarCursorAlFinal(anterior); }
}

function colocarCursorAlFinal(elemento) {
  const rango = document.createRange();
  rango.selectNodeContents(elemento);
  rango.collapse(false);
  const seleccion = window.getSelection();
  seleccion.removeAllRanges();
  seleccion.addRange(rango);
}

function obtenerFilasTablaDesdeElemento(elemento) {
  return Array.from(elemento?.querySelectorAll('.measurements-table tbody tr') || []).map((fila) => Array.from(fila.cells).map((celda) => celda.querySelector('input')?.value ?? celda.textContent.trim()));
}

function crearPaginaContinuacionTablaPerfil(bloque, tabla, filas, numeroParte) {
  const pagina = document.createElement('section');
  pagina.className = 'report-letter-page body-page profile-body-page profile-layout-page profile-continuation-page profile-table-continuation-page';
  pagina.dataset.blockId = bloque.id;
  pagina.dataset.generatedPage = `bloque-${bloque.id}`;
  pagina.dataset.sourceBlockId = bloque.id;
  pagina.dataset.visible = String(bloque.visible);
  aplicarEstiloHojaPerfil(pagina);
  const bloqueParte = { ...bloque, contenidoDefecto: { ...tabla, filas } };
  const elemento = crearBloqueEditorMaquetacion(bloqueParte);
  elemento.classList.add('profile-automatic-block');
  elemento.dataset.sourceBlockId = bloque.id;
  pagina.appendChild(elemento);
  return pagina;
}

function repaginarTablaPerfil(bloque, elementoBase) {
  if (!bloque || !elementoBase) return;
  const paginas = elementoBase.closest('.profile-report-pages');
  if (!paginas) return;
  const tabla = normalizarTablaMediciones(bloque.contenidoDefecto);
  const elementosTabla = [elementoBase, ...Array.from(paginas.querySelectorAll(`.profile-table-continuation-page[data-block-id="${bloque.id}"]`))];
  const filasActuales = elementosTabla.flatMap(obtenerFilasTablaDesdeElemento);
  paginas.querySelectorAll(`.profile-table-continuation-page[data-block-id="${bloque.id}"]`).forEach((pagina) => pagina.remove());
  const filas = filasActuales.length ? filasActuales : tabla.filas;
  const capacidadBase = Math.max(1, Math.floor((bloque.height - 88) / 38));
  const tablaBase = { ...tabla, filas: filas.slice(0, capacidadBase) };
  elementoBase.innerHTML = `<h2>${escaparHTML(bloque.titulo)}</h2>${crearHTMLTablaRellenable({ ...bloque, contenidoDefecto: tablaBase })}`;
  let referencia = elementoBase.closest('.report-letter-page');
  const filasPorPagina = capacidadBase;
  let numeroParte = 2;
  for (let indice = capacidadBase; indice < filas.length; indice += filasPorPagina) {
    const pagina = crearPaginaContinuacionTablaPerfil(bloque, tabla, filas.slice(indice, indice + filasPorPagina), numeroParte);
    referencia.after(pagina);
    referencia = pagina;
    numeroParte += 1;
  }
}

function crearPaginaParaBloqueFueraDeHoja(bloque, elemento, numeroParte) {
  const pagina = document.createElement('section');
  pagina.className = 'report-letter-page body-page profile-body-page profile-generated-block-page';
  pagina.dataset.blockId = bloque.id;
  pagina.dataset.generatedPage = `bloque-posicion-${bloque.id}`;
  pagina.dataset.pageId = `bloque-posicion-${bloque.id}-${numeroParte}`;
  aplicarEstiloHojaPerfil(pagina);
  pagina.appendChild(elemento);
  elemento.style.top = '70px';
  elemento.style.left = `${Math.max(24, Math.min(760 - bloque.width, bloque.x))}px`;
  elemento.style.height = `${Math.min(bloque.height, 930)}px`;
  return pagina;
}

function repaginarBloquesPerfil() {
  const paginas = document.querySelector('#editor-view .profile-report-pages');
  if (!paginas) return;
  paginas.querySelectorAll('.profile-layout-page .profile-layout-block').forEach((elemento) => {
    const bloque = informeLayoutActivo.bloques.find((item) => item.id === elemento.dataset.blockId);
    const pagina = elemento.closest('.profile-layout-page');
    if (!bloque || !pagina || bloque.tipo === 'bloque-imagenes-grid') return;
    const altoPagina = pagina.clientHeight || 1122;
    if (bloque.y + bloque.height > altoPagina) {
      const paginaExtra = crearPaginaParaBloqueFueraDeHoja(bloque, elemento, 1);
      pagina.after(paginaExtra);
    }
  });
  informeLayoutActivo.bloques.filter((bloque) => bloque.tipo === 'bloque-tabla-moderna').forEach((bloque) => {
    const elemento = paginas.querySelector(`.profile-layout-block[data-block-id="${bloque.id}"]`);
    if (elemento) repaginarTablaPerfil(bloque, elemento);
  });
  Array.from(paginas.querySelectorAll('.profile-layout-block .profile-rich-editor')).forEach((editor) => paginarBloqueTextoPerfil(editor, false));
  aplicarLayoutInforme();
}

function crearPaginaFotosPerfil(bloque, numeroContinuacion = 1, offset = 0) {
  const pagina = document.createElement('section');
  pagina.className = 'report-letter-page body-page profile-body-page profile-layout-page profile-images-page profile-generated-images-page';
  pagina.dataset.blockId = bloque.id;
  pagina.dataset.generatedPage = `imagenes-perfil-${bloque.id}`;
  pagina.dataset.pageId = `imagenes-perfil-${bloque.id}-${numeroContinuacion}`;
  pagina.dataset.visible = String(bloque.visible);
  aplicarEstiloHojaPerfil(pagina);
  const elemento = crearBloqueEditorMaquetacion(bloque);
  elemento.classList.add('profile-automatic-block');
  elemento.innerHTML = `<div class="template-image-grid-header"><h2>${escaparHTML(bloque.titulo)}</h2><div class="template-image-grid-rule"></div></div><div class="protected-photo-grid">${crearHTMLSlotsFotosPerfil(offset)}</div>`;
  pagina.appendChild(elemento);
  return pagina;
}

let slotFotoArrastrado = null;

function iniciarArrastreFoto(event, slot) {
  slotFotoArrastrado = slot;
  slot.classList.add('is-dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', slot.dataset.photoSlot || '0');
}

function permitirSoltarFoto(event, slot) {
  event.preventDefault();
  if (slot !== slotFotoArrastrado) slot.classList.add('is-drop-target');
  event.dataTransfer.dropEffect = 'move';
}

function salirZonaFoto(slot) {
  slot.classList.remove('is-drop-target');
}

function soltarFotoPerfil(event, destino) {
  event.preventDefault();
  destino.classList.remove('is-drop-target');
  const origen = slotFotoArrastrado;
  if (!origen || origen === destino) return;
  const imagenOrigen = origen.querySelector('img');
  const imagenDestino = destino.querySelector('img');
  const srcOrigen = imagenOrigen?.src || '';
  const srcDestino = imagenDestino?.src || '';
  const indiceOrigen = Number(origen.dataset.photoIndex) || 0;
  const indiceDestino = Number(destino.dataset.photoIndex) || 0;
  const ajusteOrigen = { ...obtenerAjusteImagen(indiceOrigen) };
  const ajusteDestino = { ...obtenerAjusteImagen(indiceDestino) };
  actualizarAjusteImagen(indiceOrigen, ajusteDestino, false);
  actualizarAjusteImagen(indiceDestino, ajusteOrigen, false);
  establecerImagenSlot(origen, srcDestino);
  establecerImagenSlot(destino, srcOrigen);
  sincronizarInformePerfilDesdeDOM();
  programarAutoguardadoInforme();
}

function establecerImagenSlot(slot, src) {
  slot.querySelector('img')?.remove();
  slot.querySelector('.photo-image-tools')?.remove();
  const etiqueta = slot.querySelector('.photo-slot-placeholder');
  if (!src) {
    if (etiqueta) etiqueta.style.display = '';
    return;
  }
  const imagen = new Image();
  imagen.alt = 'Imagen del informe';
  imagen.src = src;
  imagen.draggable = false;
  imagen.title = 'Arrastra para ajustar el encuadre. Doble clic para centrar.';
  imagen.addEventListener('click', (event) => event.stopPropagation());
  imagen.addEventListener('pointerdown', (event) => iniciarReencuadreImagen(event, Number(slot.dataset.photoIndex) || 0));
  imagen.addEventListener('dblclick', (event) => {
    event.preventDefault();
    event.stopPropagation();
    centrarImagenInforme(Number(slot.dataset.photoIndex) || 0);
  });
  aplicarAjusteVisualImagen(imagen, Number(slot.dataset.photoIndex) || 0);
  slot.prepend(imagen);
  slot.insertAdjacentHTML('beforeend', `<span class="photo-image-tools" aria-label="Herramientas de imagen"><span role="button" tabindex="0" title="Centrar imagen" onclick="event.stopPropagation(); centrarImagenInforme(${Number(slot.dataset.photoIndex) || 0})">⌾</span><span role="button" tabindex="0" title="Rotar" onclick="event.stopPropagation(); rotarImagenInforme(${Number(slot.dataset.photoIndex) || 0})">↻</span><span role="button" tabindex="0" title="Alternar recorte y ajuste" onclick="event.stopPropagation(); alternarAjusteImagenInforme(${Number(slot.dataset.photoIndex) || 0})">◩</span></span>`);
  if (etiqueta) etiqueta.style.display = 'none';
}

function finalizarArrastreFoto() {
  document.querySelectorAll('.protected-photo-slot').forEach((slot) => slot.classList.remove('is-dragging', 'is-drop-target'));
  slotFotoArrastrado = null;
}

async function seleccionarFotoPerfil(slot) {
  const input = slot.querySelector('input');
  input.onchange = async () => {
    const archivo = input.files?.[0];
    if (!archivo) return;
    input.value = '';
    const src = await leerImagenComoDataURL(archivo);
    if (!src || !(await confirmarCalidadYDuplicadoImagen(archivo, src, obtenerImagenesInforme()))) return;
    establecerImagenSlot(slot, src);
    sincronizarInformePerfilDesdeDOM();
    programarAutoguardadoInforme();
  };
  input.click();
}

function showEditor() {
  cambiarVista('editor');
  renderEditor();
  document.querySelectorAll('#editor-view [data-report-field="fecha"]').forEach((campo) => {
    if (!obtenerValorCampoInforme(campo).trim()) asignarValorCampoInforme(campo, formatearFechaISO(new Date()));
  });
  marcarNavActiva(null);
}

function crearNuevoInforme() {
  const modal = document.getElementById('profile-selector-modal');
  if (!modal) return;
  const buscador = document.getElementById('profileSelectorSearch');
  if (buscador) buscador.value = '';
  renderizarSelectorPerfiles('');
  modal.style.display = 'flex';
  window.requestAnimationFrame(() => (buscador || document.querySelector('#profileSelectorList button'))?.focus());
}

function renderizarSelectorPerfiles(consulta = '') {
  const lista = document.getElementById('profileSelectorList');
  if (!lista) return;
  const busqueda = normalizarTextoBusqueda(consulta);
  const visibles = perfilesInformes.filter((perfil) => {
    const coleccion = coleccionesPlantillas.find((item) => item.id === perfil.coleccionId);
    return !busqueda || normalizarTextoBusqueda(`${perfil.nombre} ${coleccion?.nombre || 'sin carpeta'}`).includes(busqueda);
  }).sort((a, b) => Number(b.favorito) - Number(a.favorito) || a.nombre.localeCompare(b.nombre, 'es'));
  if (!perfilesInformes.length) {
    lista.innerHTML = '<div class="profile-selector-empty"><strong>No hay plantillas disponibles.</strong><span>Primero crea un molde desde Plantillas de informes.</span><button class="editor-action-btn" type="button" onclick="cerrarSelectorPerfiles(); mostrarGestorPerfiles()">Administrar plantillas</button></div>';
    return;
  }
  if (!visibles.length) {
    lista.innerHTML = '<div class="profile-selector-empty"><strong>No encontramos esa plantilla.</strong><span>Prueba con su nombre o el de su colección.</span></div>';
    return;
  }
  const grupos = new Map();
  visibles.forEach((perfil) => {
    const coleccion = coleccionesPlantillas.find((item) => item.id === perfil.coleccionId);
    const clave = coleccion?.nombre || 'Sin carpeta';
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(perfil);
  });
  lista.innerHTML = Array.from(grupos.entries()).map(([nombre, perfiles]) => `<section class="profile-selector-group"><h3>${escaparHTML(nombre)} <small>${perfiles.length}</small></h3>${perfiles.map((perfil) => `
    <button class="profile-selector-card" type="button" onclick="seleccionarPerfilNuevoInforme('${perfil.id}')">
      <span class="profile-selector-icon">${iconoUI(perfil.favorito ? 'star' : 'file')}</span>
      <span><strong>${escaparHTML(perfil.nombre)}</strong><small>${perfil.bloques.length} bloque${perfil.bloques.length === 1 ? '' : 's'}</small></span>
      <span class="profile-selector-arrow">→</span>
    </button>`).join('')}</section>`).join('');
}

function seleccionarPerfilNuevoInforme(idPerfil) {
  cerrarSelectorPerfiles();
  iniciarInformeDesdePerfil(idPerfil, { fecha: formatearFechaISO(new Date()) });
}

function cerrarSelectorPerfiles() {
  const modal = document.getElementById('profile-selector-modal');
  if (modal) modal.style.display = 'none';
}

function manejarTeclaSelectorPerfiles(event) {
  if (event.key === 'Escape') cerrarSelectorPerfiles();
}

function formatearFechaHoraCorta(fecha) {
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatearFechaPlanoNombreArchivo(fecha) {
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  return `${day}${month}${year}`;
}

function formatearHoraPlanoNombreArchivo(fecha) {
  return `${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}`;
}

function showDashboard() {
  cambiarVista('dashboard');
  renderDashboard();
  marcarNavActiva('Dashboard');
}

function showHistorial() {
  cambiarVista('historial');
  renderHistorial();
  marcarNavActiva(null);
}

function showPapelera() {
  cambiarVista('papelera');
  renderPapeleraInformes();
  marcarNavActiva(null);
}

function showConfiguracion() {
  cambiarVista('configuracion');
  renderConfiguracion();
  marcarNavActiva(null);
}

async function abrirManualUsuario() {
  if (window.electronAPI?.abrirManualUsuario) {
    try {
      await window.electronAPI.abrirManualUsuario();
      return;
    } catch (error) {
      console.error('No se pudo abrir el manual desde Electron:', error);
    }
  }
  window.open('manual-usuario.html', '_blank', 'noopener');
}

function obtenerPasosTutorialInteractivo() {
  const hayPlantillas = perfilesInformes.length > 0;
  return [
    { esencial: true, grupo: 'Preparación', icono: 'book', vista: 'configuracion', configSeccion: 'ayuda', selector: '#configHelpSection', ceja: 'Bienvenida', titulo: 'Tu centro de aprendizaje', texto: 'Desde aquí puedes repetir este recorrido y abrir el manual completo cuando necesites una explicación detallada.', pista: 'Busca esta sección al final de cualquier sesión de aprendizaje.' },
    { grupo: 'Preparación', icono: 'settings', vista: 'configuracion', configSeccion: 'apariencia', selector: '#configThemeSection', ceja: 'Apariencia', titulo: 'Haz tuyo el espacio de trabajo', texto: 'Elige una de seis paletas diferenciadas y alterna su versión clara u oscura. El documento impreso no cambia.', pista: 'La paleta y el modo se aplican al instante y se guardan automáticamente.' },
    { esencial: true, grupo: 'Preparación', icono: 'settings', vista: 'configuracion', configSeccion: 'identidad', selector: '#configCredentialsSection', ceja: 'Datos profesionales', titulo: 'Configura una vez, reutiliza siempre', texto: 'Firma, RUT, registro, diplomados, logo y contacto alimentan automáticamente los bloques de tus informes.', pista: 'Guarda los cambios antes de volver al inicio.' },
    { grupo: 'Inicio', icono: 'grid', vista: 'dashboard', selector: '.summary-row', ceja: 'Panel principal', titulo: 'Tu actividad de un vistazo', texto: 'Estas tarjetas muestran cuántos informes y plantillas tienes. La actividad reciente aparece justo debajo.', pista: 'Usa el buscador superior para encontrar informes rápidamente.' },
    { esencial: true, grupo: 'Inicio', icono: 'file-plus', vista: 'dashboard', selector: '.quick-actions', ceja: 'Acciones rápidas', titulo: 'Todo comienza aquí', texto: 'Crea un informe, administra plantillas, consulta el historial o recupera documentos desde la papelera.', pista: 'Crear informe te pedirá primero elegir una plantilla.' },
    { esencial: true, grupo: 'Pacientes', icono: 'user', vista: 'dashboard', selector: '#patientsQuickAction', ceja: 'Fichas reutilizables', titulo: 'Evita escribir los mismos datos', texto: 'Guarda pacientes y tutores una sola vez. Desde su ficha puedes iniciar un informe o duplicar el último como punto de partida.', pista: 'Al guardar un informe, su paciente se registra o actualiza automáticamente.' },
    { esencial: true, grupo: 'Informes', icono: 'check', vista: 'dashboard', selector: '.action-card:first-child', ceja: 'Del molde al PDF', titulo: 'Guarda, finaliza y exporta con claridad', texto: 'Guardar borrador conserva el trabajo pendiente; Finalizar cambia su estado a Completado; Exportar PDF crea el archivo sin alterar por sí solo el estado clínico.', pista: 'Revisar abre un checklist y el autoguardado mantiene una copia recuperable mientras editas.' },
    { grupo: 'Plantillas', icono: 'folder', vista: 'perfiles', selector: '.collections-sidebar', ceja: 'Organización', titulo: 'Colecciones como carpetas', texto: 'Agrupa plantillas por especialidad o tipo de examen. Puedes crear colecciones, cambiar su nombre y asignarles un color.', pista: 'Arrastra una tarjeta sobre una colección para moverla.' },
    { grupo: 'Plantillas', icono: 'search', vista: 'perfiles', selector: '.profiles-workspace', ceja: 'Biblioteca', titulo: 'Selecciona y organiza en grupo', texto: 'Usa las casillas o “Seleccionar esta página” para reunir varias plantillas. Después arrastra cualquiera de las seleccionadas a una colección o a Favoritas.', pista: 'Favoritas funciona como etiqueta: la plantilla conserva su colección original.' },
    { esencial: true, grupo: 'Diseñador', icono: 'layout', vista: hayPlantillas ? 'designer' : 'perfiles', selector: hayPlantillas ? '.designer-navigator' : '.profiles-header-actions', ceja: 'Páginas y capas', titulo: hayPlantillas ? 'Controla la estructura del documento' : 'Crea tu primera plantilla', texto: hayPlantillas ? 'Navega entre hojas y selecciona capas. El orden determina qué bloque aparece delante de otro.' : 'Crea una plantilla para acceder al diseñador de páginas, capas y bloques.', pista: hayPlantillas ? 'Selecciona una capa para editarla sin buscarla sobre la hoja.' : 'Después de crearla, se abrirá directamente su diseñador.' },
    { grupo: 'Diseñador', icono: 'grid', vista: hayPlantillas ? 'designer' : 'perfiles', selector: hayPlantillas ? '#designerCatalogPanel' : '#perfiles-card-container', ceja: 'Catálogo de bloques', titulo: 'Construye la plantilla por categorías', texto: 'Agrega texto, tablas, imágenes, identidad profesional y figuras desde un catálogo ordenado y con búsqueda.', pista: 'Selecciona un bloque para editar posición, tamaño, color y capa.' },
    { grupo: 'Diseñador', icono: 'check', vista: hayPlantillas ? 'designer' : 'perfiles', selector: hayPlantillas ? '.designer-assistant' : '.profiles-header-actions', ceja: 'Asistente de diseño', titulo: 'Detecta problemas antes de guardar', texto: hayPlantillas ? 'Valida recortes, solapamientos, contraste, tamaños y páginas poco aprovechadas. También puedes anticipar desbordamientos, copiar bloques entre plantillas, crear componentes y recuperar versiones.' : 'Crea una plantilla para acceder a validación, componentes, versiones y recuperación automática.', pista: 'Usa Ctrl o Cmd + clic para seleccionar varios bloques, alinearlos o bloquearlos juntos.' },
    { grupo: 'Diseñador', icono: 'file-plus', vista: hayPlantillas ? 'designer' : 'perfiles', selector: hayPlantillas ? '[data-block-label="Datos paciente ficha campos rellenables"]' : '.profiles-header-actions', ceja: 'Datos del paciente', titulo: 'Crea fichas a tu medida', texto: hayPlantillas ? 'Agrega el bloque y define manualmente sus campos. Puedes renombrarlos, ordenarlos, eliminarlos o añadir nuevos; la ficha organiza filas y columnas automáticamente.' : 'Crea una plantilla para añadir una ficha de datos del paciente con campos personalizados.', pista: 'Los valores que completes después se guardan con cada informe y se trasladan al PDF.' },
    { grupo: 'Informes', icono: 'camera', vista: hayPlantillas ? 'designer' : 'perfiles', selector: hayPlantillas ? '[data-block-label="Cuadrícula imágenes fotografías"]' : '.profiles-header-actions', ceja: 'Imágenes automáticas', titulo: 'Seis imágenes por cuadrícula', texto: hayPlantillas ? 'Agrega este bloque a la plantilla. Las imágenes se distribuyen en cuadros 2 × 3; el sistema avisa sobre duplicados reales, baja resolución y formatos extremos. El excedente replica exactamente la estética del bloque.' : 'Crea una plantilla y agrega una cuadrícula de imágenes. Cada hoja admite seis fotografías y el excedente genera nuevas páginas.', pista: 'En el informe puedes rotar cada imagen o alternar entre recorte cuadrado y ajuste completo.' },
    { grupo: 'Informes', icono: 'text', vista: 'configuracion', configSeccion: 'textos', selector: '#configSnippetsSection', ceja: 'Biblioteca clínica', titulo: 'Reutiliza frases y hallazgos', texto: 'Guarda textos frecuentes con atajos y variables como paciente, fecha, especie o médico. Después insértalos en el campo clínico activo.', pista: 'Usa nombres breves y reconocibles para encontrarlos rápidamente.' },
    { esencial: true, grupo: 'Respaldo', icono: 'file', vista: 'configuracion', configSeccion: 'sistema', selector: '#configSystemSection', ceja: 'Protección de datos', titulo: 'Respalda todo el sistema', texto: 'El respaldo integral incluye informes, pacientes, textos, plantillas, identidad y preferencias. Además se mantiene una copia automática local recuperable.', pista: 'Conserva también una copia exportada fuera del equipo.' },
    { esencial: true, grupo: 'Final', icono: 'check', vista: 'configuracion', configSeccion: 'ayuda', selector: '#configHelpSection', ceja: 'Recorrido completado', titulo: 'Ya estás listo para comenzar', texto: 'Conoces el flujo principal. Puedes repetir el recorrido, elegir la versión completa o consultar el manual cuando quieras.', pista: 'Pulsa Finalizar para registrar el recorrido como completado.' }
  ];
}

function prepararVistaPasoTutorial(vista, paso = {}) {
  if (vista !== 'designer' && sesionDisenadorPlantilla) volverDesdeDisenador();
  if (vista === 'dashboard') showDashboard();
  else if (vista === 'perfiles') mostrarGestorPerfiles();
  else if (vista === 'configuracion') {
    showConfiguracion();
    if (paso.configSeccion) mostrarSeccionConfiguracion(paso.configSeccion);
  }
  else if (vista === 'designer') {
    const perfil = perfilesInformes[0];
    if (perfil) diseñarEstructuraPlantilla(perfil.id);
    else mostrarGestorPerfiles();
  }
}

function iniciarTutorialInteractivo() {
  elementoFocoAntesTutorial = document.activeElement;
  tutorialInteractivoActivo = { indice: -1, pasos: [], modo: null, bienvenida: true };
  const tutorial = document.getElementById('interactive-tutorial');
  if (!tutorial) return;
  tutorial.style.display = 'block';
  document.body.classList.add('tutorial-is-active');
  document.addEventListener('keydown', manejarTeclaTutorialInteractivo, true);
  window.addEventListener('resize', reposicionarTutorialInteractivo);
  window.addEventListener('scroll', reposicionarTutorialInteractivo, true);
  mostrarBienvenidaTutorialInteractivo();
}

function mostrarBienvenidaTutorialInteractivo() {
  const bienvenida = document.getElementById('tutorialWelcome');
  const contenido = document.getElementById('tutorialStepContent');
  const pie = document.getElementById('tutorialFooter');
  const progreso = document.getElementById('tutorialProgress');
  const foco = document.getElementById('tutorialSpotlight');
  const tarjeta = document.getElementById('tutorialCard');
  const tutorial = document.getElementById('interactive-tutorial');
  tutorial?.classList.add('is-welcome-mode');
  tutorial?.setAttribute('aria-labelledby', 'tutorialTitle');
  if (bienvenida) bienvenida.style.display = 'grid';
  if (contenido) contenido.style.display = 'none';
  if (pie) pie.style.display = 'none';
  if (progreso) progreso.style.display = 'none';
  if (foco) foco.style.display = 'none';
  if (tarjeta) {
    tarjeta.classList.add('is-welcome');
    tarjeta.style.left = `${Math.max(14, (window.innerWidth - tarjeta.offsetWidth) / 2)}px`;
    tarjeta.style.top = `${Math.max(14, (window.innerHeight - tarjeta.offsetHeight) / 2)}px`;
  }
  const etiqueta = document.getElementById('tutorialStepLabel');
  if (etiqueta) etiqueta.textContent = 'Recorrido interactivo';
  const progresoGuardado = obtenerProgresoTutorialGuardado();
  const botonContinuar = document.getElementById('tutorialResumeButton');
  const descripcion = document.getElementById('tutorialResumeCaption');
  if (botonContinuar) botonContinuar.style.display = progresoGuardado ? 'flex' : 'none';
  if (descripcion && progresoGuardado) descripcion.textContent = `${progresoGuardado.modo === 'completo' ? 'Recorrido completo' : 'Recorrido esencial'} · paso ${progresoGuardado.indice + 1}`;
  window.requestAnimationFrame(() => document.querySelector('.tutorial-route-list button')?.focus());
}

function obtenerProgresoTutorialGuardado() {
  try {
    const progreso = JSON.parse(localStorage.getItem('tutorialSistemaProgreso') || 'null');
    if (!progreso || !['esencial', 'completo'].includes(progreso.modo) || !Number.isInteger(progreso.indice)) return null;
    return progreso;
  } catch (_) {
    return null;
  }
}

function comenzarTutorialInteractivo(modo = 'esencial', indiceInicial = 0) {
  if (!tutorialInteractivoActivo) iniciarTutorialInteractivo();
  const todos = obtenerPasosTutorialInteractivo();
  const pasos = modo === 'completo' ? todos : todos.filter((paso) => paso.esencial);
  tutorialInteractivoActivo = { indice: Math.max(0, Math.min(indiceInicial, pasos.length - 1)), pasos, modo, bienvenida: false };
  document.getElementById('tutorialWelcome').style.display = 'none';
  document.getElementById('tutorialStepContent').style.display = 'block';
  document.getElementById('tutorialFooter').style.display = 'grid';
  document.getElementById('tutorialProgress').style.display = 'block';
  document.getElementById('tutorialCard')?.classList.remove('is-welcome');
  document.getElementById('interactive-tutorial')?.classList.remove('is-welcome-mode');
  document.getElementById('interactive-tutorial')?.setAttribute('aria-labelledby', 'tutorialStepTitle');
  mostrarPasoTutorialInteractivo();
}

function reanudarTutorialInteractivo() {
  const progreso = obtenerProgresoTutorialGuardado();
  if (!progreso) { comenzarTutorialInteractivo('esencial'); return; }
  comenzarTutorialInteractivo(progreso.modo, progreso.indice);
}

function guardarProgresoTutorialInteractivo() {
  if (!tutorialInteractivoActivo || tutorialInteractivoActivo.bienvenida || tutorialInteractivoActivo.indice < 0) return;
  localStorage.setItem('tutorialSistemaProgreso', JSON.stringify({ modo: tutorialInteractivoActivo.modo, indice: tutorialInteractivoActivo.indice, fecha: new Date().toISOString() }));
}

function mostrarPasoTutorialInteractivo() {
  if (!tutorialInteractivoActivo) return;
  const { pasos, indice } = tutorialInteractivoActivo;
  const paso = pasos[indice];
  prepararVistaPasoTutorial(paso.vista, paso);
  const etiqueta = document.getElementById('tutorialStepLabel');
  const ceja = document.getElementById('tutorialEyebrow');
  const titulo = document.getElementById('tutorialStepTitle');
  const texto = document.getElementById('tutorialText');
  const pista = document.getElementById('tutorialActionHint');
  const seccion = document.getElementById('tutorialSectionLabel');
  const puntos = document.getElementById('tutorialDots');
  const icono = document.getElementById('tutorialStepIcon');
  const progreso = document.getElementById('tutorialProgressBar');
  const anterior = document.getElementById('tutorialPreviousButton');
  const siguiente = document.getElementById('tutorialNextButton');
  if (etiqueta) etiqueta.textContent = `Paso ${indice + 1} de ${pasos.length}`;
  if (ceja) ceja.textContent = paso.ceja;
  if (titulo) titulo.textContent = paso.titulo;
  if (texto) texto.textContent = paso.texto;
  if (pista) pista.innerHTML = `<strong>Consejo</strong><span>${escaparHTML(paso.pista || '')}</span>`;
  if (seccion) seccion.textContent = paso.grupo || 'Recorrido';
  if (icono) icono.innerHTML = iconoUI(paso.icono || 'layout');
  if (puntos) puntos.innerHTML = pasos.map((_, posicion) => `<i class="${posicion === indice ? 'is-current' : posicion < indice ? 'is-complete' : ''}"></i>`).join('');
  if (progreso) progreso.style.width = `${((indice + 1) / pasos.length) * 100}%`;
  if (anterior) anterior.disabled = indice === 0;
  if (siguiente) siguiente.innerHTML = indice === pasos.length - 1 ? `${iconoUI('check')} Finalizar` : `Siguiente <span aria-hidden="true">→</span>`;
  guardarProgresoTutorialInteractivo();
  window.setTimeout(() => {
    const objetivo = document.querySelector(paso.selector);
    const categoria = objetivo?.closest('details');
    if (categoria) categoria.open = true;
    objetivo?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
    window.requestAnimationFrame(() => {
      reposicionarTutorialInteractivo();
      document.getElementById('tutorialNextButton')?.focus();
    });
  }, 80);
}

function reposicionarTutorialInteractivo() {
  if (!tutorialInteractivoActivo || tutorialInteractivoActivo.bienvenida) return;
  const paso = tutorialInteractivoActivo.pasos[tutorialInteractivoActivo.indice];
  const objetivo = document.querySelector(paso.selector);
  const foco = document.getElementById('tutorialSpotlight');
  const tarjeta = document.getElementById('tutorialCard');
  if (!foco || !tarjeta) return;
  if (!objetivo) {
    foco.style.display = 'none';
    tarjeta.style.left = `${Math.max(16, (window.innerWidth - tarjeta.offsetWidth) / 2)}px`;
    tarjeta.style.top = `${Math.max(16, (window.innerHeight - tarjeta.offsetHeight) / 2)}px`;
    return;
  }
  const rect = objetivo.getBoundingClientRect();
  const margen = 9;
  const izquierdaFoco = Math.max(5, rect.left - margen);
  const arribaFoco = Math.max(5, rect.top - margen);
  const derechaFoco = Math.min(window.innerWidth - 5, rect.right + margen);
  const abajoFoco = Math.min(window.innerHeight - 5, rect.bottom + margen);
  foco.style.display = 'block';
  foco.style.left = `${izquierdaFoco}px`;
  foco.style.top = `${arribaFoco}px`;
  foco.style.width = `${Math.max(0, derechaFoco - izquierdaFoco)}px`;
  foco.style.height = `${Math.max(0, abajoFoco - arribaFoco)}px`;
  const ancho = tarjeta.offsetWidth || 380;
  const alto = tarjeta.offsetHeight || 280;
  let left = rect.right + 18;
  let top = rect.top;
  if (left + ancho > window.innerWidth - 14) left = rect.left - ancho - 18;
  if (left < 14) {
    left = Math.min(window.innerWidth - ancho - 14, Math.max(14, rect.left));
    top = rect.bottom + 18;
    if (top + alto > window.innerHeight - 14) top = rect.top - alto - 18;
  }
  tarjeta.style.left = `${Math.max(14, Math.min(window.innerWidth - ancho - 14, left))}px`;
  tarjeta.style.top = `${Math.max(14, Math.min(window.innerHeight - alto - 14, top))}px`;
}

function avanzarTutorial() {
  if (!tutorialInteractivoActivo) return;
  if (tutorialInteractivoActivo.indice >= tutorialInteractivoActivo.pasos.length - 1) {
    finalizarTutorialInteractivo(true);
    return;
  }
  tutorialInteractivoActivo.indice += 1;
  mostrarPasoTutorialInteractivo();
}

function retrocederTutorial() {
  if (!tutorialInteractivoActivo || tutorialInteractivoActivo.indice === 0) return;
  tutorialInteractivoActivo.indice -= 1;
  mostrarPasoTutorialInteractivo();
}

function finalizarTutorialInteractivo(completado) {
  if (!tutorialInteractivoActivo) return;
  if (!completado) guardarProgresoTutorialInteractivo();
  if (sesionDisenadorPlantilla) volverDesdeDisenador();
  tutorialInteractivoActivo = null;
  document.getElementById('interactive-tutorial').style.display = 'none';
  document.getElementById('interactive-tutorial').classList.remove('is-welcome-mode');
  document.body.classList.remove('tutorial-is-active');
  document.removeEventListener('keydown', manejarTeclaTutorialInteractivo, true);
  window.removeEventListener('resize', reposicionarTutorialInteractivo);
  window.removeEventListener('scroll', reposicionarTutorialInteractivo, true);
  if (completado) {
    localStorage.setItem('tutorialSistemaCompletado', new Date().toISOString());
    localStorage.removeItem('tutorialSistemaProgreso');
  }
  showConfiguracion();
  renderEstadoTutorialConfiguracion();
  window.requestAnimationFrame(() => (elementoFocoAntesTutorial?.isConnected ? elementoFocoAntesTutorial : document.getElementById('startTutorialButton'))?.focus());
}

function manejarTeclaTutorialInteractivo(event) {
  if (!tutorialInteractivoActivo) return;
  if (event.key === 'Escape') { event.preventDefault(); finalizarTutorialInteractivo(false); }
  else if (!tutorialInteractivoActivo.bienvenida && event.key === 'ArrowRight') { event.preventDefault(); avanzarTutorial(); }
  else if (!tutorialInteractivoActivo.bienvenida && event.key === 'ArrowLeft') { event.preventDefault(); retrocederTutorial(); }
  else if (event.key === 'Tab') {
    const controles = Array.from(document.querySelectorAll('#tutorialCard button:not(:disabled)')).filter((control) => control.offsetParent !== null);
    if (!controles.length) return;
    const primero = controles[0];
    const ultimo = controles[controles.length - 1];
    if (event.shiftKey && document.activeElement === primero) { event.preventDefault(); ultimo.focus(); }
    else if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primero.focus(); }
  }
}

function renderEstadoTutorialConfiguracion() {
  const estado = document.getElementById('tutorialCompletionStatus');
  const boton = document.getElementById('startTutorialButton');
  const completadoEn = localStorage.getItem('tutorialSistemaCompletado');
  if (!estado) return;
  const progreso = obtenerProgresoTutorialGuardado();
  if (progreso) {
    estado.textContent = `Tienes un recorrido ${progreso.modo} pendiente en el paso ${progreso.indice + 1}. Puedes continuarlo cuando quieras.`;
    if (boton) boton.innerHTML = `${iconoUI('play')} Continuar tutorial`;
  } else if (completadoEn) {
    estado.textContent = `Tutorial completado el ${new Date(completadoEn).toLocaleDateString('es-CL')}. Puedes repetirlo cuando quieras.`;
    if (boton) boton.innerHTML = `${iconoUI('play')} Repetir tutorial`;
  } else {
    estado.textContent = 'Aún no has completado el recorrido interactivo.';
    if (boton) boton.innerHTML = `${iconoUI('play')} Iniciar tutorial`;
  }
}

function obtenerFechaInforme(informe) {
  if (!informe.fecha) return null;
  return obtenerFechaDesdeValor(informe.fecha);
}

function formatearFechaISO(fecha) {
  if (!fecha) return '';
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function obtenerFechaDesdeValor(valor) {
  if (!valor) return null;
  const partesFecha = String(valor).trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  const fecha = partesFecha
    ? new Date(Number(partesFecha[3]), Number(partesFecha[2]) - 1, Number(partesFecha[1]))
    : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatearFechaHora(fecha) {
  if (!fecha) return 'Sin fecha';
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

function obtenerFechaRegistroInforme(informe) {
  if (!informe) return null;
  const valorFecha = informe.estado === 'Completado'
    ? informe.completadoEn || informe.actualizado || informe.creadoEn || informe.fecha
    : informe.creadoEn || informe.actualizado || informe.fecha;
  return obtenerFechaDesdeValor(valorFecha);
}

function obtenerFechaMostradaInforme(informe) {
  return formatearFechaHora(obtenerFechaRegistroInforme(informe));
}

function obtenerFechaCreacionInforme(informe) {
  if (!informe) return 'Sin fecha';
  return formatearFechaHora(obtenerFechaDesdeValor(informe.creadoEn || informe.actualizado || informe.fecha));
}

function obtenerFechaModificacionInforme(informe) {
  if (!informe) return 'Sin fecha';
  return formatearFechaHora(obtenerFechaDesdeValor(informe.actualizado || informe.completadoEn || informe.creadoEn || informe.fecha));
}

function obtenerFechaActividad(informe) {
  if (informe.actualizado) {
    const fechaActualizada = new Date(informe.actualizado);
    if (!Number.isNaN(fechaActualizada.getTime())) {
      return fechaActualizada;
    }
  }

  return obtenerFechaInforme(informe);
}

function esMismoDia(fechaA, fechaB) {
  if (!fechaA || !fechaB) return false;
  return fechaA.getFullYear() === fechaB.getFullYear()
    && fechaA.getMonth() === fechaB.getMonth()
    && fechaA.getDate() === fechaB.getDate();
}

function obtenerInformePorId(informeId) {
  return estadoDashboard.informes.find((item) => item.id === informeId);
}

function actualizarSeleccionDashboard(informeId) {
  informeSeleccionadoDashboardId = informeId;
  Array.from(document.querySelectorAll('[data-dashboard-report-id]')).forEach((fila) => {
    fila.classList.toggle('is-selected', fila.dataset.dashboardReportId === informeId);
  });
}

function rellenarVistaPreviaDesdeDatos(contenedor, datosInforme) {
  if (!contenedor) return;

  contenedor.querySelectorAll('[data-report-field]').forEach((campo) => {
    const key = campo.dataset.reportField;
    const valor = obtenerValorDatoInforme(datosInforme, key);
    if ('value' in campo) {
      campo.value = valor;
      ajustarAlturaCampoInforme(campo);
      if (campo.classList.contains('cover-field')) ajustarCampoPortada(campo);
    } else {
      campo.textContent = valor;
    }
  });
  ajustarCamposPortada(contenedor);
}

function obtenerValorDatoInforme(datosInforme, key) {
  if (datosInforme && datosInforme[key]) return datosInforme[key];
  if (key === 'antecedentes' && datosInforme && datosInforme.motivo) return datosInforme.motivo;
  if (key === 'resultados' && datosInforme && datosInforme.hallazgos) return datosInforme.hallazgos;
  if (key === 'observaciones' && datosInforme && datosInforme.indicaciones) return datosInforme.indicaciones;
  if (key === 'medico') return ajustesApp.firmaSimple || '';
  if (key === 'rutMedico') return ajustesApp.rutMedico || '';
  if (key === 'registroMedico') return ajustesApp.registroMedico || '';
  return informeBase[key] || '';
}

function aplicarCredencialesAlEditor(sobrescribir = false) {
  const equivalencias = {
    medico: ajustesApp.firmaSimple,
    rutMedico: ajustesApp.rutMedico,
    registroMedico: ajustesApp.registroMedico
  };

  obtenerCamposInforme().forEach((campo) => {
    const valor = equivalencias[campo.dataset.reportField];
    if (typeof valor === 'string' && (sobrescribir || (valor && !obtenerValorCampoInforme(campo).trim()))) {
      asignarValorCampoInforme(campo, valor);
    }
  });
}

function aplicarCredencialesYDiplomados(contenedor = document) {
  contenedor.querySelectorAll('[data-credential-output]').forEach((elemento) => {
    const key = elemento.dataset.credentialOutput;
    elemento.textContent = ajustesApp[key] || '';
  });

  const hayDiplomados = tienePlantillaDiplomados();
  contenedor.querySelectorAll('#diplomadosPage').forEach((pagina) => {
    const eliminadaManualmente = informeLayoutActivo.paginasEliminadas.includes('diplomados');
    pagina.classList.toggle('is-hidden', !hayDiplomados || eliminadaManualmente);
  });

  contenedor.querySelectorAll('[data-diplomas-output]').forEach((elemento) => {
    const key = elemento.dataset.diplomasOutput;
    if (key === 'lateral') {
      elemento.innerHTML = formatearDiplomadosEnCurso(obtenerDiplomadosEnCurso());
      return;
    }
    elemento.innerHTML = formatearDiplomadosCursados(obtenerDiplomadosCursados());
  });

  contenedor.querySelectorAll('.profile-layout-block.bloque-diplomados[data-block-id]').forEach((elemento) => {
    const bloque = informeLayoutActivo.bloques.find((item) => item.id === elemento.dataset.blockId);
    if (bloque) elemento.innerHTML = crearContenidoBloqueMaquetacion(bloque, false);
  });

  renumerarPaginasInforme(contenedor);
}

function resolverTextoDinamicoDiplomados(texto) {
  const variables = {
    firmaSimple: ajustesApp.firmaSimple || '',
    rutMedico: ajustesApp.rutMedico || '',
    registroMedico: ajustesApp.registroMedico || '',
    medico: ajustesApp.firmaSimple || '',
    rut: ajustesApp.rutMedico || '',
    registro: ajustesApp.registroMedico || ''
  };

  return String(texto || '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, nombre) => {
    return Object.prototype.hasOwnProperty.call(variables, nombre)
      ? variables[nombre]
      : match;
  });
}

function tienePlantillaDiplomados() {
  return Boolean(
    obtenerDiplomadosCursados().length > 0
    || obtenerDiplomadosEnCurso().length > 0
    || String(ajustesApp.diplomadosPrincipal || '').replace(/\s+/g, ' ').trim()
    || String(ajustesApp.diplomadosLateral || '').replace(/\s+/g, ' ').trim()
  );
}

function normalizarListaDiplomados(lista) {
  return Array.isArray(lista)
    ? lista
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        diplomado: String(item.diplomado || '').trim(),
        institucion: String(item.institucion || '').trim()
      }))
      .filter((item) => item.diplomado || item.institucion)
    : [];
}

function obtenerDiplomadosCursados() {
  return normalizarListaDiplomados(ajustesApp.diplomadosCursados);
}

function obtenerDiplomadosEnCurso() {
  return normalizarListaDiplomados(ajustesApp.diplomadosEnCurso);
}

function crearTextoDiplomadosDesdeLista(lista) {
  return normalizarListaDiplomados(lista)
    .map((item) => [item.diplomado, item.institucion].filter(Boolean).join(', '))
    .join('\n');
}

function formatearDiplomadosCursados(lista) {
  return normalizarListaDiplomados(lista)
    .map((item, index) => [
      `<p class="diploma-line" data-line-index="${index + 1}">`,
      '  <span class="diploma-marker"></span>',
      `  <span class="diploma-tail"><strong class="diploma-title-green">${escaparHTML(item.diplomado)}</strong>${item.institucion ? `, ${escaparHTML(item.institucion)}` : ''}</span>`,
      '</p>'
    ].join(''))
    .join('');
}

function formatearDiplomadosEnCurso(lista) {
  const items = normalizarListaDiplomados(lista);
  if (items.length === 0) return '';
  return [
    '<div class="diplomas-current-heading">',
    '  <strong>Actualmente cursando:</strong>',
    '  <div class="diplomas-current-rule"></div>',
    '</div>',
    items.map((item, index) => [
      `<p class="diploma-line diploma-line-current" data-line-index="${index + 1}">`,
      `  <span class="diploma-tail"><strong class="diploma-title-black">${escaparHTML(item.diplomado)}</strong>${item.institucion ? `, ${escaparHTML(item.institucion)}` : ''}</span>`,
      '</p>'
    ].join('')).join('')
  ].join('');
}

function formatearTextoDiplomados(texto, zona = 'principal') {
  const lineas = String(texto || '').split('\n').map((linea) => linea.trim());
  let indiceNoVacio = 0;

  return lineas
    .map((linea) => {
      if (!linea) return '<p class="diploma-spacer"></p>';
      indiceNoVacio += 1;
      const lineaEscapada = escaparHTML(linea);
      return `<p class="diploma-line" data-line-index="${indiceNoVacio}"><span class="diploma-marker"></span><span class="diploma-tail">${lineaEscapada}</span></p>`;
    })
    .join('');
}

function escaparHTML(valor) {
  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function bloquearCamposVistaPrevia(contenedor) {
  if (!contenedor) return;
  contenedor.querySelectorAll('[data-report-field]').forEach((campo) => {
    if ('readOnly' in campo) campo.readOnly = true;
    campo.setAttribute('tabindex', '-1');
  });
}

function prepararLayoutClonVistaPrevia(clon) {
  const plantilla = clon?.querySelector?.('.report-template');
  if (!plantilla) return;
  if (!informeLayoutActivo.perfilId) {
    plantilla.classList.remove('profile-fill-mode');
    plantilla.querySelector('.profile-report-pages')?.remove();
    return;
  }

  plantilla.classList.add('profile-fill-mode');
  let paginas = plantilla.querySelector('.profile-report-pages');
  if (!paginas) {
    paginas = document.createElement('div');
    paginas.className = 'profile-report-pages';
    plantilla.prepend(paginas);
  }
  paginas.innerHTML = '';
  const paginasPerfil = informeLayoutActivo.paginas.length
    ? informeLayoutActivo.paginas
    : [{ id: 'pagina-unica', nombre: 'Página 1' }];
  paginasPerfil.forEach((paginaPerfil, indicePagina) => {
    const pagina = document.createElement('section');
    pagina.className = 'report-letter-page body-page profile-body-page profile-layout-page';
    pagina.dataset.profilePageId = paginaPerfil.id;
    pagina.dataset.pageId = paginaPerfil.id;
    aplicarEstiloHojaPerfil(pagina);
    if (indicePagina === 0) pagina.insertAdjacentHTML('beforeend', crearHTMLIdentificadorPlantilla(informeLayoutActivo, false));
    informeLayoutActivo.bloques
      .filter((bloque) => bloque.paginaId === paginaPerfil.id && !(bloque.tipo === 'bloque-titulo-principal' && indicePagina > 0))
      .forEach((bloque) => pagina.appendChild(crearBloqueEditorMaquetacion(bloque)));
    paginas.appendChild(pagina);
  });
}

function abrirVistaPreviaQuickLook(informeId, informeDirecto = null) {
  const informe = informeDirecto || obtenerInformePorId(informeId);
  if (!informe) return;

  const modal = document.getElementById('pdf-preview-modal');
  const previewContent = document.getElementById('pdfPreviewContent');
  const botonGuardar = document.getElementById('pdfPreviewSaveButton');
  const titulo = modal ? modal.querySelector('.editor-title') : null;
  const subtitulo = modal ? modal.querySelector('.editor-subtitle') : null;
  const page = document.querySelector('#editor-view .editor-page');
  if (!modal || !previewContent || !page) return;

  modoVistaPrevia = 'quicklook';
  if (botonGuardar) botonGuardar.style.display = 'none';
  if (titulo) titulo.textContent = 'Vista previa';
  if (subtitulo) subtitulo.textContent = 'Revisa el informe sin abrir el editor.';

  previewContent.innerHTML = '';
  const clon = page.cloneNode(true);
  const layoutAnterior = informeLayoutActivo;
  try {
    informeLayoutActivo = normalizarLayoutInforme((informe.datos || informeBase)._layout);
    if (informeLayoutActivo.perfilId) informeLayoutActivo.imagenesPerfil = normalizarImagenesInforme((informe.datos || informeBase).imagenes || informeLayoutActivo.imagenesPerfil);
    prepararLayoutClonVistaPrevia(clon);
    rellenarVistaPreviaDesdeDatos(clon, informe.datos || informeBase);
    renderPaginasImagenesInforme((informe.datos || informeBase).imagenes || [], clon);
    aplicarCredencialesYDiplomados(clon);
    aplicarLayoutInforme(clon);
  } finally {
    informeLayoutActivo = layoutAnterior;
  }
  ajustarPaginaConclusion(clon);
  bloquearCamposVistaPrevia(clon);
  previewContent.appendChild(clon);
  clon.querySelectorAll('textarea').forEach(ajustarAlturaCampoInforme);
  ajustarPaginaConclusion(clon);
  modal.style.display = 'flex';
}

function abrirVistaPreviaPDFDesdeEditor() {
  repaginarInforme();
  const modal = document.getElementById('pdf-preview-modal');
  const previewContent = document.getElementById('pdfPreviewContent');
  const botonGuardar = document.getElementById('pdfPreviewSaveButton');
  const titulo = modal ? modal.querySelector('.editor-title') : null;
  const subtitulo = modal ? modal.querySelector('.editor-subtitle') : null;
  const page = document.querySelector('#editor-view .editor-page');
  if (!modal || !previewContent || !page) return;

  modoVistaPrevia = 'pdf';
  if (botonGuardar) botonGuardar.style.display = '';
  if (titulo) titulo.textContent = 'Vista previa PDF';
  if (subtitulo) subtitulo.textContent = 'Revisa el formato antes de guardar.';

  previewContent.innerHTML = '';
  const clon = page.cloneNode(true);
  const datos = leerInformeDesdeEditor();
  rellenarVistaPreviaDesdeDatos(clon, datos);
  renderPaginasImagenesInforme(datos.imagenes || [], clon);
  aplicarCredencialesYDiplomados(clon);
  aplicarLayoutInforme(clon);
  ajustarPaginaConclusion(clon);
  bloquearCamposVistaPrevia(clon);
  previewContent.appendChild(clon);
  clon.querySelectorAll('textarea').forEach(ajustarAlturaCampoInforme);
  ajustarPaginaConclusion(clon);
  modal.style.display = 'flex';
}

function renderHistorial() {
  const historialBody = document.getElementById('historialBody');
  const historialCaption = document.getElementById('historialCaption');
  const inputFecha = document.getElementById('historialFecha');
  const selectOrden = document.getElementById('historialOrden');
  if (!historialBody) return;

  const fechaFiltro = inputFecha ? inputFecha.value : '';
  const orden = selectOrden ? selectOrden.value : 'recientes';

  const informesFiltrados = estadoDashboard.informes
    .filter((informe) => {
      if (!fechaFiltro) return true;
      const fechaInforme = obtenerFechaRegistroInforme(informe);
      return formatearFechaISO(fechaInforme) === fechaFiltro;
    })
    .sort((a, b) => {
      const fechaA = obtenerFechaRegistroInforme(a);
      const fechaB = obtenerFechaRegistroInforme(b);
      const tiempoA = fechaA ? fechaA.getTime() : 0;
      const tiempoB = fechaB ? fechaB.getTime() : 0;
      return orden === 'antiguos' ? tiempoA - tiempoB : tiempoB - tiempoA;
    });

  if (historialCaption) {
    const total = informesFiltrados.length;
    const textoFecha = fechaFiltro ? ` para ${fechaFiltro}` : '';
    historialCaption.textContent = total === 0
      ? `No hay informes${textoFecha}.`
      : total === 1
        ? `1 informe encontrado${textoFecha}.`
        : `${total} informes encontrados${textoFecha}.`;
  }

  if (informesFiltrados.length === 0) {
    historialBody.innerHTML = '<div class="activity-empty">No hay informes guardados para mostrar.</div>';
    renderizarPaginacion('historialPagination', 'historial', 0, TAMANOS_PAGINA.historial);
    return;
  }

  const pagina = obtenerPaginaValida(paginasListados.historial, informesFiltrados.length, TAMANOS_PAGINA.historial);
  paginasListados.historial = pagina;
  const inicioPagina = (pagina - 1) * TAMANOS_PAGINA.historial;
  const informesPagina = informesFiltrados.slice(inicioPagina, inicioPagina + TAMANOS_PAGINA.historial);
  historialBody.innerHTML = informesPagina
    .map((informe) => {
      const claseEstado = informe.estado === 'Completado' ? 'ok' : 'warn';
      return [
        `<div class="table-row historial-row" role="row" tabindex="0" data-historial-report-id="${informe.id || ''}" onclick="seleccionarInformeHistorial(event, '${informe.id || ''}')" ondblclick="abrirInformeDesdeListado('${informe.id || ''}', event)" onkeydown="manejarTeclaFilaHistorial(event, '${informe.id || ''}')">`,
        `  <span title="${escaparHTML(informe.id || '')}">${escaparHTML(informe.nombre || informe.id || 'Sin nombre')}</span>`,
        `  <span>${obtenerFechaCreacionInforme(informe)}</span>`,
        `  <span>${obtenerFechaModificacionInforme(informe)}</span>`,
        `  <span class="status ${claseEstado}">${informe.estado || 'Pendiente'}</span>`,
        `  <span><button class="mini-btn" type="button" onclick="eliminarInforme('${informe.id}', event)">Eliminar</button></span>`,
        '</div>'
      ].join('');
    })
    .join('');
  renderizarPaginacion('historialPagination', 'historial', informesFiltrados.length, TAMANOS_PAGINA.historial);
}

function obtenerInformeEliminadoPorId(informeId) {
  return estadoDashboard.papeleraInformes.find((item) => item.id === informeId);
}

function obtenerFechaEliminacionInforme(informe) {
  if (!informe) return 'Sin fecha';
  return formatearFechaHora(obtenerFechaDesdeValor(informe.eliminadoEn));
}

function crearIdRestauradoSinColision(idOriginal) {
  if (!obtenerInformePorId(idOriginal)) return idOriginal;
  const marca = formatearFechaPlanoNombreArchivo(new Date()) + formatearHoraPlanoNombreArchivo(new Date());
  let candidato = `${idOriginal}-restaurado-${marca}`;
  let contador = 2;
  while (obtenerInformePorId(candidato)) {
    candidato = `${idOriginal}-restaurado-${marca}-${contador}`;
    contador += 1;
  }
  return candidato;
}

function renderPapeleraInformes() {
  const papeleraBody = document.getElementById('papeleraBody');
  const papeleraCaption = document.getElementById('papeleraCaption');
  if (!papeleraBody) return;

  const informesEliminados = estadoDashboard.papeleraInformes
    .slice()
    .sort((a, b) => {
      const fechaA = obtenerFechaDesdeValor(a.eliminadoEn);
      const fechaB = obtenerFechaDesdeValor(b.eliminadoEn);
      const tiempoA = fechaA ? fechaA.getTime() : 0;
      const tiempoB = fechaB ? fechaB.getTime() : 0;
      return tiempoB - tiempoA;
    });

  if (papeleraCaption) {
    papeleraCaption.textContent = informesEliminados.length === 0
      ? 'No hay informes en papelera.'
      : informesEliminados.length === 1
        ? '1 informe eliminado.'
        : `${informesEliminados.length} informes eliminados.`;
  }

  if (informesEliminados.length === 0) {
    papeleraBody.innerHTML = '<div class="activity-empty">La papelera esta vacia.</div>';
    renderizarPaginacion('papeleraPagination', 'papelera', 0, TAMANOS_PAGINA.papelera);
    return;
  }

  const pagina = obtenerPaginaValida(paginasListados.papelera, informesEliminados.length, TAMANOS_PAGINA.papelera);
  paginasListados.papelera = pagina;
  const inicioPagina = (pagina - 1) * TAMANOS_PAGINA.papelera;
  const informesPagina = informesEliminados.slice(inicioPagina, inicioPagina + TAMANOS_PAGINA.papelera);
  papeleraBody.innerHTML = informesPagina
    .map((informe) => {
      const claseEstado = informe.estado === 'Completado' ? 'ok' : 'warn';
      return [
        `<div class="table-row papelera-row" role="row" tabindex="0" data-papelera-report-id="${informe.id || ''}" onclick="seleccionarInformePapelera(event, '${informe.id || ''}')" onkeydown="manejarTeclaFilaPapelera(event, '${informe.id || ''}')">`,
        `  <span title="${escaparHTML(informe.id || '')}">${escaparHTML(informe.nombre || informe.id || 'Sin nombre')}</span>`,
        `  <span>${obtenerFechaCreacionInforme(informe)}</span>`,
        `  <span>${obtenerFechaEliminacionInforme(informe)}</span>`,
        `  <span class="status ${claseEstado}">${informe.estado || 'Pendiente'}</span>`,
        '  <span class="papelera-actions">',
        `    <button class="mini-btn recover" type="button" onclick="restaurarInformePapelera('${informe.id}', event)">Recuperar</button>`,
        `    <button class="mini-btn danger" type="button" onclick="eliminarInformeDefinitivo('${informe.id}', event)">Eliminar</button>`,
        '  </span>',
        '</div>'
      ].join('');
    })
    .join('');
  renderizarPaginacion('papeleraPagination', 'papelera', informesEliminados.length, TAMANOS_PAGINA.papelera);
}

function limpiarFiltrosHistorial() {
  const inputFecha = document.getElementById('historialFecha');
  const selectOrden = document.getElementById('historialOrden');
  if (inputFecha) inputFecha.value = '';
  if (selectOrden) selectOrden.value = 'recientes';
  paginasListados.historial = 1;
  renderHistorial();
}

function normalizarTextoBusqueda(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function obtenerTextoBuscableInforme(informe) {
  const datos = informe && informe.datos ? informe.datos : {};
  const valoresDatos = Object.entries(datos)
    .filter(([key]) => key !== 'imagenes' && key !== '_layout')
    .map(([, valor]) => Array.isArray(valor) ? valor.join(' ') : valor);

  return normalizarTextoBusqueda([
    informe && informe.id,
    informe && informe.nombre,
    informe && informe.estado,
    informe && informe.tecnico,
    informe && informe.fecha,
    obtenerFechaCreacionInforme(informe),
    obtenerFechaModificacionInforme(informe),
    ...valoresDatos
  ].join(' '));
}

function informeCoincideBusqueda(informe, terminoBusqueda) {
  const termino = normalizarTextoBusqueda(terminoBusqueda);
  if (!termino) return true;
  const palabras = termino.split(/\s+/).filter(Boolean);
  const textoInforme = obtenerTextoBuscableInforme(informe);
  return palabras.every((palabra) => textoInforme.includes(palabra));
}

function obtenerBusquedaDashboard() {
  const input = document.getElementById('searchInput');
  return input ? input.value : '';
}

function obtenerCamposInforme() {
  return Array.from(document.querySelectorAll('#editor-view .editor-page [data-report-field]'));
}

function obtenerCamposBaseInforme() {
  return obtenerCamposInforme().filter((campo) => !campo.dataset.generatedPage);
}

function esCampoInformeEditable(campo) {
  return Boolean(campo && campo.matches && campo.matches('#editor-view [data-report-field]') && !campo.readOnly && !campo.disabled);
}

function obtenerContenedorImagenesInforme(contenedor = document) {
  return contenedor.querySelector('#reportImagesPages');
}

function obtenerImagenesInforme() {
  const plantilla = document.querySelector('#editor-view .report-template');
  if (plantilla?.classList.contains('profile-fill-mode')) {
    return normalizarImagenesInforme(Array.from(plantilla.querySelectorAll('.profile-report-pages .protected-photo-slot img')).map((imagen) => imagen.src));
  }
  const contenedor = obtenerContenedorImagenesInforme();
  if (!contenedor) return [];
  return Array.from(contenedor.querySelectorAll('img'))
    .map((imagen) => imagen.src)
    .filter(Boolean);
}

function renderPaginasImagenesPerfil(imagenes = [], contenedor = document) {
  const raiz = contenedor.querySelector ? contenedor : document;
  const plantilla = raiz.querySelector('.report-template');
  const paginas = plantilla?.querySelector('.profile-report-pages');
  if (!plantilla?.classList.contains('profile-fill-mode') || !paginas) return false;

  const imagenesUnicas = normalizarImagenesInforme(imagenes);
  paginas.querySelectorAll('.profile-generated-images-page').forEach((pagina) => pagina.remove());
  const bloquesBase = Array.from(paginas.querySelectorAll('.profile-layout-page .profile-layout-block.bloque-imagenes-grid'));
  const bloquesConfigurados = bloquesBase.map((elemento) => informeLayoutActivo.bloques.find((bloque) => bloque.id === elemento.dataset.blockId)).filter(Boolean);
  const bloqueRespaldo = bloquesConfigurados[bloquesConfigurados.length - 1] || {
    id: 'imagenes-automaticas', titulo: 'IMÁGENES', visible: true, colorFondo: '#ffffff'
  };

  bloquesBase.forEach((elemento, indice) => {
    const bloque = bloquesConfigurados[indice] || bloqueRespaldo;
    const offset = indice * IMAGENES_POR_PAGINA;
    elemento.innerHTML = `<div class="template-image-grid-header"><h2>${escaparHTML(bloque.titulo || 'IMÁGENES')}</h2><div class="template-image-grid-rule"></div></div><div class="protected-photo-grid">${crearHTMLSlotsFotosPerfil(offset)}</div>`;
  });

  const capacidadBase = bloquesBase.length * IMAGENES_POR_PAGINA;
  let referencia = bloquesBase.length ? bloquesBase[bloquesBase.length - 1].closest('.report-letter-page') : paginas.lastElementChild;
  let offset = capacidadBase;
  let numeroContinuacion = 1;
  while (offset < imagenesUnicas.length || (!bloquesBase.length && offset === 0 && imagenesUnicas.length)) {
    const pagina = crearPaginaFotosPerfil(bloqueRespaldo, numeroContinuacion, offset);
    if (referencia) referencia.insertAdjacentElement('afterend', pagina);
    else paginas.appendChild(pagina);
    referencia = pagina;
    offset += IMAGENES_POR_PAGINA;
    numeroContinuacion += 1;
  }

  Array.from(paginas.querySelectorAll('.protected-photo-slot')).forEach((slot, indice) => establecerImagenSlot(slot, imagenesUnicas[indice] || ''));
  if (contenedor === document) informeLayoutActivo.imagenesPerfil = imagenesUnicas.slice();
  aplicarLayoutInforme(contenedor);
  return true;
}

function renderImagenesInforme(imagenes = [], contenedor = document) {
  const grid = obtenerContenedorImagenesInforme(contenedor);
  if (!grid) return;

  grid.innerHTML = imagenes
    .filter(Boolean)
    .map((src, indice) => [
      '<figure class="report-image-item">',
      `  <img src="${src}" alt="Imagen ecografica ${indice + 1}" draggable="false" title="Arrastra para ajustar el encuadre. Doble clic para centrar." style="${obtenerEstiloAjusteImagen(indice)}" onclick="event.stopPropagation()" onpointerdown="iniciarReencuadreImagen(event, ${indice})" ondblclick="event.preventDefault(); event.stopPropagation(); centrarImagenInforme(${indice})" />`,
      `  <span class="photo-image-tools"><span role="button" tabindex="0" title="Centrar imagen" onclick="event.stopPropagation(); centrarImagenInforme(${indice})">⌾</span><span role="button" tabindex="0" title="Rotar" onclick="event.stopPropagation(); rotarImagenInforme(${indice})">↻</span><span role="button" tabindex="0" title="Alternar recorte" onclick="event.stopPropagation(); alternarAjusteImagenInforme(${indice})">◩</span></span>`,
      `  <button class="remove-report-image" type="button" onclick="quitarImagenInforme(${indice})" aria-label="Quitar imagen">×</button>`,
      '</figure>'
    ].join(''))
    .join('');
}

function normalizarImagenesInforme(imagenes = []) {
  return imagenes.filter(Boolean);
}

function renderPaginasImagenesInforme(imagenes = [], contenedor = document) {
  if (renderPaginasImagenesPerfil(imagenes, contenedor)) return;
  const contenedorImagenes = obtenerContenedorImagenesInforme(contenedor);
  if (!contenedorImagenes) return;

  const imagenesUnicas = normalizarImagenesInforme(imagenes);
  const paginas = [];
  for (let indice = 0; indice < imagenesUnicas.length; indice += IMAGENES_POR_PAGINA) {
    paginas.push(imagenesUnicas.slice(indice, indice + IMAGENES_POR_PAGINA));
  }

  contenedorImagenes.innerHTML = paginas.map((imagenesPagina, paginaIndice) => {
    const offset = paginaIndice * IMAGENES_POR_PAGINA;
    return [
      '<section class="report-letter-page eco-images-page">',
      '  <section class="eco-section-title">',
      '    <h2>IMÁGENES ECOGRÁFICAS</h2>',
      '    <div class="eco-section-title-rule"></div>',
      '  </section>',
      '  <div class="report-images-grid">',
      Array.from({ length: IMAGENES_POR_PAGINA }, (_, indice) => imagenesPagina[indice] ? [
          '    <figure class="report-image-item">',
          `      <img src="${imagenesPagina[indice]}" alt="Imagen ecografica ${offset + indice + 1}" draggable="false" title="Arrastra para ajustar el encuadre. Doble clic para centrar." style="${obtenerEstiloAjusteImagen(offset + indice)}" onclick="event.stopPropagation()" onpointerdown="iniciarReencuadreImagen(event, ${offset + indice})" ondblclick="event.preventDefault(); event.stopPropagation(); centrarImagenInforme(${offset + indice})" />`,
          `      <span class="photo-image-tools"><span role="button" tabindex="0" title="Centrar imagen" onclick="event.stopPropagation(); centrarImagenInforme(${offset + indice})">⌾</span><span role="button" tabindex="0" title="Rotar" onclick="event.stopPropagation(); rotarImagenInforme(${offset + indice})">↻</span><span role="button" tabindex="0" title="Alternar recorte" onclick="event.stopPropagation(); alternarAjusteImagenInforme(${offset + indice})">◩</span></span>`,
          `      <button class="remove-report-image" type="button" onclick="quitarImagenInforme(${offset + indice})" aria-label="Quitar imagen">×</button>`,
          '    </figure>'
        ].join('') : '<button class="report-image-item report-image-slot" type="button" onclick="agregarImagenesInforme()"><span>+ Agregar imagen</span></button>').join(''),
      '  </div>',
      '  <footer class="eco-page-footer"><span></span><strong></strong></footer>',
      '</section>'
    ].join('');
  }).join('');

  aplicarLayoutInforme(contenedor);
}

function renumerarPaginasInforme(contenedor = document) {
  const raiz = contenedor.querySelector ? contenedor : document;
  const paginas = Array.from(raiz.querySelectorAll('.report-template > .report-letter-page, .report-template > .report-images-pages > .report-letter-page'));
  let numero = 1;
  paginas.forEach((pagina) => {
    const footerEco = pagina.querySelector('.eco-page-footer strong');
    const footerBody = pagina.querySelector('.body-page-footer strong');
    const footerNumero = footerEco || footerBody;
    const visible = !pagina.classList.contains('is-hidden');
    if (footerNumero) {
      footerNumero.textContent = visible && numero > 1 ? String(numero) : '';
    }
    if (visible) numero += 1;
  });
}

function obtenerTemplateInforme(contenedor = document) {
  const raiz = contenedor.querySelector ? contenedor : document;
  return raiz.querySelector('.report-template');
}

function obtenerPaginasInforme(contenedor = document) {
  const raiz = contenedor.querySelector ? contenedor : document;
  const template = raiz.querySelector('.report-template');
  if (template?.classList.contains('profile-fill-mode')) {
    return Array.from(template.querySelectorAll(':scope > .profile-report-pages > .report-letter-page'));
  }
  return Array.from(raiz.querySelectorAll('.report-template > .report-letter-page, .report-template > .report-images-pages > .report-letter-page, .report-template > .profile-report-pages > .report-letter-page'));
}

function obtenerIdPaginaInforme(pagina) {
  if (!pagina) return '';
  if (pagina.classList.contains('cover-page')) return 'portada';
  if (pagina.classList.contains('body-conclusion-page')) return 'conclusiones';
  if (pagina.id === 'diplomadosPage') return 'diplomados';
  if (pagina.dataset.generatedPage) {
    const similares = obtenerPaginasInforme().filter((item) => item.dataset.generatedPage === pagina.dataset.generatedPage);
    return `${pagina.dataset.generatedPage}-${similares.indexOf(pagina) + 1}`;
  }
  if (pagina.classList.contains('eco-images-page')) {
    const similares = obtenerPaginasInforme().filter((item) => item.classList.contains('eco-images-page'));
    return `imagenes-${similares.indexOf(pagina) + 1}`;
  }
  if (pagina.querySelector('[data-report-field="resultados"]')) return 'resultados';
  return pagina.dataset.pageId || '';
}

function asignarIdentidadesPaginasInforme(contenedor = document) {
  obtenerPaginasInforme(contenedor).forEach((pagina) => {
    const id = obtenerIdPaginaInforme(pagina);
    if (id) pagina.dataset.pageId = id;
  });
}

function ordenarPaginasSegunLayout(contenedor = document) {
  const template = obtenerTemplateInforme(contenedor);
  const contenedorImagenes = obtenerContenedorImagenesInforme(contenedor);
  if (template?.classList.contains('profile-fill-mode')) return;
  if (!template || !informeLayoutActivo.ordenPaginas.length) return;

  const paginas = obtenerPaginasInforme(contenedor);
  const porId = new Map(paginas.map((pagina) => [pagina.dataset.pageId, pagina]));
  informeLayoutActivo.ordenPaginas.forEach((id) => {
    const pagina = porId.get(id);
    if (!pagina) return;
    if (pagina.classList.contains('eco-images-page') && contenedorImagenes) {
      contenedorImagenes.appendChild(pagina);
    } else {
      template.insertBefore(pagina, contenedorImagenes || null);
    }
  });
}

function aplicarCamposPortadaEliminados(contenedor = document) {
  const eliminados = new Set(informeLayoutActivo.camposPortadaEliminados || []);
  CAMPOS_PORTADA.forEach((key) => {
    const campo = contenedor.querySelector(`.cover-page [data-report-field="${key}"]`);
    const fila = campo ? campo.closest('.cover-field-row') : null;
    if (fila) fila.classList.toggle('is-removed-from-report', eliminados.has(key));
  });
}

function aplicarPaginasEliminadas(contenedor = document) {
  const eliminadas = new Set(informeLayoutActivo.paginasEliminadas || []);
  asignarIdentidadesPaginasInforme(contenedor);
  obtenerPaginasInforme(contenedor).forEach((pagina) => {
    pagina.classList.toggle('is-removed-from-report', eliminadas.has(pagina.dataset.pageId));
  });
}

function capturarOrdenPaginasInforme() {
  asignarIdentidadesPaginasInforme();
  informeLayoutActivo.ordenPaginas = obtenerPaginasInforme()
    .map((pagina) => pagina.dataset.pageId)
    .filter(Boolean);
}

function aplicarLayoutInforme(contenedor = document) {
  asignarIdentidadesPaginasInforme(contenedor);
  ordenarPaginasSegunLayout(contenedor);
  asignarIdentidadesPaginasInforme(contenedor);
  aplicarPaginasEliminadas(contenedor);
  aplicarCamposPortadaEliminados(contenedor);
  if (contenedor === document) {
    renderControlesPaginasInforme();
  }
  renumerarPaginasInforme(contenedor);
}

function obtenerTituloPaginaInforme(pagina) {
  if (!pagina) return 'Pagina';
  if (pagina.dataset.profilePageId) return informeLayoutActivo.paginas.find((item) => item.id === pagina.dataset.profilePageId)?.nombre || 'Página del informe';
  if (pagina.classList.contains('cover-page')) return 'Portada';
  if (pagina.classList.contains('body-conclusion-page')) return 'Conclusiones';
  if (pagina.id === 'diplomadosPage') return 'Diplomados';
  if (pagina.classList.contains('eco-images-page')) return 'Imagenes';
  if (pagina.dataset.generatedPage === 'resultados') return 'Resultados cont.';
  if (pagina.querySelector('[data-report-field="resultados"]')) return 'Resultados';
  return 'Pagina';
}

function crearBotonControlPagina(texto, titulo, accion, deshabilitado = false) {
  return `<button class="report-page-tool-btn" type="button" title="${titulo}" aria-label="${titulo}" data-page-action="${accion}" ${deshabilitado ? 'disabled' : ''}>${texto}</button>`;
}

function renderControlesPaginasInforme() {
  const paginas = obtenerPaginasInforme();
  paginas.forEach((pagina) => pagina.querySelector('.report-page-tools')?.remove());
  paginas.forEach((pagina, indice) => {
    if (!pagina.closest('#editor-view')) return;
    const id = pagina.dataset.pageId || obtenerIdPaginaInforme(pagina);
    pagina.dataset.pageId = id;
    const eliminada = pagina.classList.contains('is-removed-from-report');
    const barra = document.createElement('div');
    barra.className = 'report-page-tools';
    barra.dataset.pageToolsFor = id;
    barra.innerHTML = [
      `<span>${obtenerTituloPaginaInforme(pagina)}</span>`,
      crearBotonControlPagina(eliminada ? 'Restaurar' : 'Eliminar', eliminada ? 'Restaurar pagina' : 'Eliminar pagina', eliminada ? 'restore' : 'delete')
    ].join('');
    pagina.prepend(barra);
  });
  renderPanelPaginasEliminadas();
}

function renderPanelPaginasEliminadas() {
  const panel = document.getElementById('deletedPagesPanel');
  const boton = document.getElementById('deletedPagesButton');
  if (!panel || !boton) return;
  const idsEliminados = new Set(informeLayoutActivo.paginasEliminadas || []);
  const paginas = obtenerPaginasInforme().filter((pagina) => idsEliminados.has(pagina.dataset.pageId));
  boton.disabled = paginas.length === 0;
  boton.textContent = `Páginas eliminadas (${paginas.length})`;
  if (!paginas.length) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }
  panel.innerHTML = `<div class="deleted-pages-panel-head"><div><strong>Páginas eliminadas</strong><span>Restáuralas individualmente cuando las necesites.</span></div><button type="button" onclick="alternarPanelPaginasEliminadas(false)" aria-label="Cerrar">×</button></div><div class="deleted-pages-list">${paginas.map((pagina, indice) => `<article class="deleted-page-item"><div class="deleted-page-number">${indice + 1}</div><div><strong>${escaparHTML(obtenerTituloPaginaInforme(pagina))}</strong><span>Fuera del informe y del PDF</span></div><button type="button" onclick="restaurarPaginaInformePorId('${escaparHTML(pagina.dataset.pageId)}')">Restaurar</button></article>`).join('')}</div>`;
}

function alternarPanelPaginasEliminadas(forzar) {
  const panel = document.getElementById('deletedPagesPanel');
  const boton = document.getElementById('deletedPagesButton');
  if (!panel || boton?.disabled) return;
  const mostrar = typeof forzar === 'boolean' ? forzar : panel.style.display === 'none';
  panel.style.display = mostrar ? 'grid' : 'none';
}

function restaurarPaginaInformePorId(idPagina) {
  const pagina = obtenerPaginasInforme().find((item) => item.dataset.pageId === idPagina);
  if (pagina) restaurarPaginaInforme(pagina);
}

function moverPaginaInforme(pagina, direccion) {
  if (!pagina) return;
  registrarEstadoEditorParaDeshacer();
  capturarOrdenPaginasInforme();
  const id = pagina.dataset.pageId || obtenerIdPaginaInforme(pagina);
  const orden = informeLayoutActivo.ordenPaginas.slice();
  const indice = orden.indexOf(id);
  const destino = indice + direccion;
  if (indice < 0 || destino < 0 || destino >= orden.length) return;
  [orden[indice], orden[destino]] = [orden[destino], orden[indice]];
  informeLayoutActivo.ordenPaginas = orden;
  aplicarLayoutInforme();
}

function eliminarPaginaInforme(pagina) {
  if (!pagina) return;
  const id = pagina.dataset.pageId || obtenerIdPaginaInforme(pagina);
  if (!id) return;
  registrarEstadoEditorParaDeshacer();
  if (!informeLayoutActivo.paginasEliminadas.includes(id)) {
    informeLayoutActivo.paginasEliminadas.push(id);
  }
  aplicarLayoutInforme();
}

function restaurarPaginaInforme(pagina) {
  if (!pagina) return;
  const id = pagina.dataset.pageId || obtenerIdPaginaInforme(pagina);
  registrarEstadoEditorParaDeshacer();
  informeLayoutActivo.paginasEliminadas = informeLayoutActivo.paginasEliminadas.filter((item) => item !== id);
  aplicarLayoutInforme();
}

function manejarClickControlesPaginasInforme(event) {
  const boton = event.target.closest('[data-page-action]');
  if (!boton) return;
  const pagina = boton.closest('.report-letter-page');
  if (!pagina) return;
  event.preventDefault();
  event.stopPropagation();
  const accion = boton.dataset.pageAction;
  if (accion === 'move-up') moverPaginaInforme(pagina, -1);
  if (accion === 'move-down') moverPaginaInforme(pagina, 1);
  if (accion === 'delete') eliminarPaginaInforme(pagina);
  if (accion === 'restore') restaurarPaginaInforme(pagina);
}

function agregarControlesCamposPortada() {
  document.querySelectorAll('#editor-view .cover-field-row .cover-field-remove-btn').forEach((boton) => boton.remove());
  document.querySelectorAll('#editor-view .cover-page .cover-field-row [data-report-field]').forEach((campo) => {
    const fila = campo.closest('.cover-field-row');
    if (!fila) return;
    const boton = document.createElement('button');
    boton.className = 'cover-field-remove-btn';
    boton.type = 'button';
    boton.title = 'Borrar parametro de portada';
    boton.setAttribute('aria-label', 'Borrar parametro de portada');
    boton.dataset.coverFieldAction = 'delete';
    boton.textContent = 'x';
    fila.appendChild(boton);
  });
}

function manejarClickCamposPortada(event) {
  const boton = event.target.closest('[data-cover-field-action]');
  if (!boton) return;
  const fila = boton.closest('.cover-field-row');
  const campo = fila ? fila.querySelector('[data-report-field]') : null;
  const key = campo ? campo.dataset.reportField : '';
  if (!key) return;
  event.preventDefault();
  event.stopPropagation();
  registrarEstadoEditorParaDeshacer();
  if (!informeLayoutActivo.camposPortadaEliminados.includes(key)) {
    informeLayoutActivo.camposPortadaEliminados.push(key);
  }
  aplicarLayoutInforme();
}

function restaurarParametrosPortada() {
  registrarEstadoEditorParaDeshacer();
  informeLayoutActivo.camposPortadaEliminados = [];
  aplicarLayoutInforme();
}

function actualizarPaginaDiplomados(contenedor = document) {
  const pagina = contenedor.querySelector('#diplomadosPage');
  const campo = contenedor.querySelector('[data-report-field="diplomados"]');
  if (!pagina || !campo) return;
  pagina.classList.toggle('is-hidden', !obtenerValorCampoInforme(campo).trim());
}

function plantillaDiplomados() {
  return '';
}

function insertarPlantillaDiplomados() {
  const campo = document.querySelector('#editor-view [data-report-field="diplomados"]');
  if (!campo) return;
  if (!obtenerValorCampoInforme(campo).trim()) {
    asignarValorCampoInforme(campo, plantillaDiplomados());
  }
  aplicarCredencialesAlEditor(false);
  actualizarPaginaDiplomados();
}

function insertarPlantillaDiplomadosDesdeConfig() {
  if (!informeActivoId) {
    crearNuevoInforme();
  } else {
    showEditor();
  }
  insertarPlantillaDiplomados();
}

function agregarImagenesInforme() {
  const input = document.getElementById('imagenesInformeInput');
  if (input) input.click();
}

function leerImagenComoDataURL(archivo) {
  return new Promise((resolve) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result || ''));
    lector.onerror = () => resolve('');
    lector.readAsDataURL(archivo);
  });
}

function analizarImagenDataURL(src) {
  return new Promise((resolve) => {
    const imagen = new Image();
    imagen.onload = () => resolve({ width: imagen.naturalWidth, height: imagen.naturalHeight });
    imagen.onerror = () => resolve({ width: 0, height: 0 });
    imagen.src = src;
  });
}

async function confirmarCalidadYDuplicadoImagen(archivo, src, existentes = []) {
  if (existentes.includes(src)) {
    const agregarDuplicada = await mostrarDialogoApp({
      titulo: 'Imagen duplicada',
      mensaje: `“${archivo.name || 'Imagen sin nombre'}” coincide exactamente con una imagen ya agregada. ¿Deseas agregarla nuevamente?`,
      tipo: 'info', confirmar: 'Agregar igualmente', cancelar: 'No agregar'
    });
    if (!agregarDuplicada) return false;
  }
  const dimensiones = await analizarImagenDataURL(src);
  const avisos = [];
  if (!dimensiones.width || !dimensiones.height) avisos.push('no se pudieron verificar sus dimensiones');
  else {
    if (Math.min(dimensiones.width, dimensiones.height) < 640) avisos.push(`su resolución es baja (${dimensiones.width} × ${dimensiones.height} px)`);
    const proporcion = Math.max(dimensiones.width, dimensiones.height) / Math.max(1, Math.min(dimensiones.width, dimensiones.height));
    if (proporcion > 2.5) avisos.push('su formato es muy alargado y requerirá bastante recorte');
  }
  if (!avisos.length) return true;
  return mostrarDialogoApp({ titulo: 'Revisar calidad de imagen', mensaje: `“${archivo.name || 'Imagen'}”: ${avisos.join(' y ')}. Se ajustará automáticamente a un cuadro; puedes alternar entre recorte y ajuste completo.`, tipo: 'info', confirmar: 'Agregar imagen', cancelar: 'Omitir' });
}

function obtenerAjusteImagen(indice) {
  const actual = informeLayoutActivo.ajustesImagenes?.[indice] || {};
  return {
    rotacion: [0, 90, 180, 270].includes(Number(actual.rotacion)) ? Number(actual.rotacion) : 0,
    ajuste: actual.ajuste === 'contain' ? 'contain' : 'cover',
    posicionX: Math.max(0, Math.min(100, Number.isFinite(Number(actual.posicionX)) ? Number(actual.posicionX) : 50)),
    posicionY: Math.max(0, Math.min(100, Number.isFinite(Number(actual.posicionY)) ? Number(actual.posicionY) : 50))
  };
}

function obtenerEstiloAjusteImagen(indice) {
  const ajuste = obtenerAjusteImagen(indice);
  const escala = ajuste.rotacion === 90 || ajuste.rotacion === 270 ? ' scale(1.01)' : '';
  return `object-fit:${ajuste.ajuste};object-position:${ajuste.posicionX}% ${ajuste.posicionY}%;transform:rotate(${ajuste.rotacion}deg)${escala};`;
}

function aplicarAjusteVisualImagen(imagen, indice) {
  if (!imagen) return;
  const ajuste = obtenerAjusteImagen(indice);
  imagen.style.objectFit = ajuste.ajuste;
  imagen.style.objectPosition = `${ajuste.posicionX}% ${ajuste.posicionY}%`;
  imagen.style.transform = `rotate(${ajuste.rotacion}deg)${ajuste.rotacion === 90 || ajuste.rotacion === 270 ? ' scale(1.01)' : ''}`;
}

function actualizarAjusteImagen(indice, cambios, notificar = true) {
  if (!Array.isArray(informeLayoutActivo.ajustesImagenes)) informeLayoutActivo.ajustesImagenes = [];
  informeLayoutActivo.ajustesImagenes[indice] = { ...obtenerAjusteImagen(indice), ...cambios };
  document.querySelectorAll(`[data-photo-index="${indice}"] img`).forEach((imagen) => aplicarAjusteVisualImagen(imagen, indice));
  document.querySelectorAll('.report-image-item img').forEach((imagen, posicion) => { if (posicion === indice) aplicarAjusteVisualImagen(imagen, indice); });
  if (notificar) {
    mostrarEstadoGuardadoWord('Cambios sin guardar');
    programarAutoguardadoInforme();
  }
}

let reencuadreImagenActivo = null;

function iniciarReencuadreImagen(event, indice) {
  if (event.button !== 0 || event.target.closest('.preview-content')) return;
  const imagen = event.currentTarget || event.target;
  if (!imagen?.src) return;
  event.preventDefault();
  event.stopPropagation();
  const ajuste = obtenerAjusteImagen(indice);
  reencuadreImagenActivo = {
    indice,
    imagen,
    pointerId: event.pointerId,
    inicioX: event.clientX,
    inicioY: event.clientY,
    posicionX: ajuste.posicionX,
    posicionY: ajuste.posicionY,
    ancho: Math.max(1, imagen.clientWidth),
    alto: Math.max(1, imagen.clientHeight)
  };
  imagen.classList.add('is-reframing');
  imagen.setPointerCapture?.(event.pointerId);
  imagen.addEventListener('pointermove', moverReencuadreImagen);
  imagen.addEventListener('pointerup', finalizarReencuadreImagen, { once: true });
  imagen.addEventListener('pointercancel', finalizarReencuadreImagen, { once: true });
}

function moverReencuadreImagen(event) {
  const activo = reencuadreImagenActivo;
  if (!activo || event.pointerId !== activo.pointerId) return;
  const posicionX = Math.max(0, Math.min(100, activo.posicionX - ((event.clientX - activo.inicioX) / activo.ancho) * 100));
  const posicionY = Math.max(0, Math.min(100, activo.posicionY - ((event.clientY - activo.inicioY) / activo.alto) * 100));
  actualizarAjusteImagen(activo.indice, { posicionX, posicionY }, false);
}

function finalizarReencuadreImagen(event) {
  const activo = reencuadreImagenActivo;
  if (!activo || event.pointerId !== activo.pointerId) return;
  activo.imagen.releasePointerCapture?.(event.pointerId);
  activo.imagen.removeEventListener('pointermove', moverReencuadreImagen);
  activo.imagen.classList.remove('is-reframing');
  reencuadreImagenActivo = null;
  mostrarEstadoGuardadoWord('Cambios sin guardar');
  programarAutoguardadoInforme();
}

function centrarImagenInforme(indice) {
  actualizarAjusteImagen(indice, { posicionX: 50, posicionY: 50 });
  mostrarAvisoBreve('Imagen centrada.');
}

function rotarImagenInforme(indice) {
  actualizarAjusteImagen(indice, { rotacion: (obtenerAjusteImagen(indice).rotacion + 90) % 360 });
}

function alternarAjusteImagenInforme(indice) {
  const actual = obtenerAjusteImagen(indice);
  actualizarAjusteImagen(indice, { ajuste: actual.ajuste === 'cover' ? 'contain' : 'cover' });
  mostrarAvisoBreve(actual.ajuste === 'cover' ? 'Imagen completa, sin recorte.' : 'Recorte cuadrado automático.');
}

async function cargarImagenesInforme(event) {
  const archivos = Array.from(event.target.files || []);
  if (archivos.length === 0) return;
  const input = event.target;
  input.value = '';
  input.disabled = true;
  try {
    const imagenesNuevas = await Promise.all(archivos.map(async (archivo) => ({ archivo, src: await leerImagenComoDataURL(archivo) })));
    const existentes = obtenerImagenesInforme();
    const imagenes = existentes.slice();
    let agregadas = 0;
    for (const { archivo, src } of imagenesNuevas) {
      if (!src) continue;
      if (!(await confirmarCalidadYDuplicadoImagen(archivo, src, imagenes))) continue;
      imagenes.push(src);
      agregadas += 1;
    }
    if (agregadas > 0) {
      registrarEstadoEditorParaDeshacer();
      renderPaginasImagenesInforme(imagenes);
      const paginasNecesarias = Math.max(1, Math.ceil(imagenes.length / IMAGENES_POR_PAGINA));
      mostrarAvisoBreve(`${agregadas} imagen${agregadas === 1 ? '' : 'es'} agregada${agregadas === 1 ? '' : 's'}${paginasNecesarias > 1 ? ` en ${paginasNecesarias} páginas` : ''}.`);
    }
  } finally {
    input.disabled = false;
  }
}

function quitarImagenInforme(indice) {
  const imagenes = obtenerImagenesInforme();
  if (indice < 0 || indice >= imagenes.length) return;
  registrarEstadoEditorParaDeshacer();
  imagenes.splice(indice, 1);
  if (Array.isArray(informeLayoutActivo.ajustesImagenes)) informeLayoutActivo.ajustesImagenes.splice(indice, 1);
  renderPaginasImagenesInforme(imagenes);
}

function obtenerValorCampoInforme(campo) {
  if (!campo) return '';
  return 'value' in campo ? campo.value : campo.textContent;
}

function asignarValorCampoInforme(campo, valor) {
  if (!campo) return;
  if ('value' in campo) {
    campo.value = valor;
    ajustarAlturaCampoInforme(campo);
    if (campo.classList && campo.classList.contains('cover-field')) {
      ajustarCampoPortada(campo);
    }
    if (['conclusion', 'observaciones'].includes(campo.dataset.reportField)) {
      ajustarPaginaConclusion(campo.closest('.body-conclusion-page') || document);
    }
  } else {
    campo.textContent = valor;
  }
}

function ajustarAlturaCampoInforme(campo) {
  if (!campo || campo.tagName !== 'TEXTAREA') return;
  if (esCampoPaginado(campo)) return;
  campo.style.height = 'auto';
  campo.style.height = `${campo.scrollHeight}px`;
}

function ajustarObservacionesAutomaticamente(campo) {
  if (!campo || campo.dataset.reportField !== 'observaciones') return;
  campo.style.height = '';
}

function obtenerNumeroCSS(valor, fallback = 0) {
  const numero = Number.parseFloat(valor);
  return Number.isFinite(numero) ? numero : fallback;
}

function recordarMedidaBase(elemento, propiedad) {
  if (!elemento) return 0;
  const key = `base${propiedad.charAt(0).toUpperCase()}${propiedad.slice(1)}`;
  if (!elemento.dataset[key]) {
    elemento.dataset[key] = getComputedStyle(elemento)[propiedad] || '0px';
  }
  return obtenerNumeroCSS(elemento.dataset[key]);
}

function obtenerAlturaLineas(campo, lineas) {
  const estilos = getComputedStyle(campo);
  const fontSize = obtenerNumeroCSS(estilos.fontSize, 16);
  const lineHeight = estilos.lineHeight === 'normal'
    ? fontSize * 1.2
    : obtenerNumeroCSS(estilos.lineHeight, fontSize * 1.2);
  const paddingVertical = obtenerNumeroCSS(estilos.paddingTop) + obtenerNumeroCSS(estilos.paddingBottom);
  const bordeVertical = obtenerNumeroCSS(estilos.borderTopWidth) + obtenerNumeroCSS(estilos.borderBottomWidth);
  return (lineHeight * lineas) + paddingVertical + bordeVertical;
}

function medirAlturaTextoCampo(campo) {
  const estilos = getComputedStyle(campo);
  const fontSize = obtenerNumeroCSS(estilos.fontSize, 16);
  const lineHeight = estilos.lineHeight === 'normal'
    ? fontSize * 1.2
    : obtenerNumeroCSS(estilos.lineHeight, fontSize * 1.2);
  const paddingHorizontal = obtenerNumeroCSS(estilos.paddingLeft) + obtenerNumeroCSS(estilos.paddingRight);
  const paddingVertical = obtenerNumeroCSS(estilos.paddingTop) + obtenerNumeroCSS(estilos.paddingBottom);
  const bordeVertical = obtenerNumeroCSS(estilos.borderTopWidth) + obtenerNumeroCSS(estilos.borderBottomWidth);
  const anchoDisponible = Math.max(1, campo.clientWidth - paddingHorizontal);
  const canvas = medirAlturaTextoCampo.canvas || document.createElement('canvas');
  medirAlturaTextoCampo.canvas = canvas;
  const contexto = canvas.getContext('2d');
  contexto.font = `${estilos.fontStyle} ${estilos.fontWeight} ${estilos.fontSize} ${estilos.fontFamily}`;

  let lineas = 1;
  let anchoLinea = 0;
  String(campo.value || '').split('').forEach((caracter) => {
    if (caracter === '\n') {
      lineas += 1;
      anchoLinea = 0;
      return;
    }

    const anchoCaracter = contexto.measureText(caracter).width;
    if (anchoLinea > 0 && anchoLinea + anchoCaracter > anchoDisponible) {
      lineas += 1;
      anchoLinea = anchoCaracter;
      return;
    }

    anchoLinea += anchoCaracter;
  });

  return (lineas * lineHeight) + paddingVertical + bordeVertical;
}

function contarLineasVisualesCampo(campo) {
  const estilos = getComputedStyle(campo);
  const paddingHorizontal = obtenerNumeroCSS(estilos.paddingLeft) + obtenerNumeroCSS(estilos.paddingRight);
  const anchoDisponible = Math.max(1, campo.clientWidth - paddingHorizontal);
  const canvas = contarLineasVisualesCampo.canvas || document.createElement('canvas');
  contarLineasVisualesCampo.canvas = canvas;
  const contexto = canvas.getContext('2d');
  contexto.font = `${estilos.fontStyle} ${estilos.fontWeight} ${estilos.fontSize} ${estilos.fontFamily}`;

  let lineas = 1;
  let anchoLinea = 0;
  String(campo.value || '').split('').forEach((caracter) => {
    if (caracter === '\n') {
      lineas += 1;
      anchoLinea = 0;
      return;
    }

    const anchoCaracter = contexto.measureText(caracter).width;
    if (anchoLinea > 0 && anchoLinea + anchoCaracter > anchoDisponible) {
      lineas += 1;
      anchoLinea = anchoCaracter;
      return;
    }

    anchoLinea += anchoCaracter;
  });

  return lineas;
}

function ajustarCampoPorLineas(campo, lineas) {
  if (!campo) return { altura: 0, extra: 0 };
  const alturaBase = obtenerAlturaLineas(campo, lineas);
  campo.style.minHeight = `${alturaBase}px`;
  campo.style.maxHeight = `${alturaBase}px`;
  campo.style.height = `${alturaBase}px`;
  campo.style.overflow = 'hidden';
  return {
    altura: alturaBase,
    extra: 0,
    lineas: contarLineasVisualesCampo(campo)
  };
}

function limitarCampoPorLineas(campo, lineasMaximas) {
  if (!campo) return;

  const valorActual = obtenerValorCampoInforme(campo);
  if (contarLineasVisualesCampo(campo) <= lineasMaximas) {
    campo.dataset.lastValidValue = valorActual;
  }
}

function formatearFechaPortada(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}-${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 4)}-${digitos.slice(4)}`;
}

function manejarInputFechaPortada(campo) {
  const anterior = campo.value;
  const digitosAntesCursor = anterior.slice(0, campo.selectionStart || anterior.length).replace(/\D/g, '').length;
  campo.value = formatearFechaPortada(anterior);
  let vistos = 0;
  let posicion = campo.value.length;
  for (let i = 0; i < campo.value.length; i += 1) {
    if (/\d/.test(campo.value[i])) vistos += 1;
    if (vistos >= digitosAntesCursor) {
      posicion = i + 1;
      break;
    }
  }
  campo.setSelectionRange(posicion, posicion);
  ajustarCampoPortada(campo);
}

function ajustarCampoPortada(campo) {
  if (!campo || !campo.classList || !campo.classList.contains('cover-field')) return;
  campo.style.fontSize = '';
  const base = obtenerNumeroCSS(getComputedStyle(campo).fontSize, 16);
  let size = base;
  while (campo.scrollWidth > campo.clientWidth + 1 && size > base * 0.72) {
    size -= 0.5;
    campo.style.fontSize = `${size}px`;
  }
}

function ajustarCamposPortada(contenedor = document) {
  contenedor.querySelectorAll('.cover-field').forEach(ajustarCampoPortada);
}

function ajustarPaginaConclusion(contenedor = document) {
  const raiz = contenedor.querySelector ? contenedor : document;
  const paginas = Array.from(raiz.querySelectorAll('.body-conclusion-page'));
  paginas.forEach((pagina) => {
    const conclusionContent = pagina.querySelector('.body-conclusion-content');
    const conclusionField = pagina.querySelector('.body-conclusion-field');
    const observationsPanel = pagina.querySelector('.body-observations-panel');
    const observationsField = pagina.querySelector('.body-observations-field');
    const divider = pagina.querySelector('.body-conclusion-divider');
    if (!conclusionContent || !conclusionField || !observationsPanel || !observationsField) return;

    const conclusion = ajustarCampoPorLineas(conclusionField, 10);
    conclusionContent.style.height = `${conclusion.altura}px`;
    conclusionContent.style.minHeight = `${conclusion.altura}px`;

    const observations = ajustarCampoPorLineas(observationsField, 8);
    observationsPanel.style.top = '';
    observationsPanel.style.height = '';
    observationsPanel.style.minHeight = '';
    if (divider) divider.style.top = '';

    limitarCampoPorLineas(conclusionField, 10);
    limitarCampoPorLineas(observationsField, 8);
  });
}

function esCampoPaginado(campo) {
  return campo && campo.dataset.reportField === 'resultados';
}

function limitarCampoPorAltura(campo) {
  if (!campo) return;
  const valorActual = obtenerValorCampoInforme(campo);
  const ultimoValido = campo.dataset.lastValidValue ?? '';
  if (campo.scrollHeight <= campo.clientHeight + 1) {
    campo.dataset.lastValidValue = valorActual;
    return;
  }
  const selectionStart = campo.selectionStart;
  const selectionEnd = campo.selectionEnd;
  asignarValorCampoInforme(campo, ultimoValido);
  const posicion = Math.min(campo.value.length, selectionStart ?? campo.value.length);
  campo.selectionStart = posicion;
  campo.selectionEnd = Math.min(campo.value.length, selectionEnd ?? posicion);
}

function obtenerValorDespuesDeInput(campo, event) {
  const valor = campo.value || '';
  const inicio = campo.selectionStart ?? valor.length;
  const fin = campo.selectionEnd ?? inicio;

  if (event.inputType === 'deleteContentBackward') {
    if (inicio !== fin) return valor.slice(0, inicio) + valor.slice(fin);
    return valor.slice(0, Math.max(0, inicio - 1)) + valor.slice(fin);
  }

  if (event.inputType === 'deleteContentForward') {
    if (inicio !== fin) return valor.slice(0, inicio) + valor.slice(fin);
    return valor.slice(0, inicio) + valor.slice(Math.min(valor.length, fin + 1));
  }

  return valor.slice(0, inicio) + (event.data || '') + valor.slice(fin);
}

function bloquearInputSiNoCabe(campo, event) {
  if (!campo || !event || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.inputType && event.inputType.startsWith('delete')) return;

  const valorAnterior = campo.value;
  const seleccionInicio = campo.selectionStart;
  const seleccionFin = campo.selectionEnd;
  const siguienteValor = obtenerValorDespuesDeInput(campo, event);
  campo.value = siguienteValor;
  const cabe = campo.scrollHeight <= campo.clientHeight + 1;
  campo.value = valorAnterior;
  if (typeof campo.setSelectionRange === 'function' && seleccionInicio !== null && seleccionFin !== null) {
    campo.setSelectionRange(seleccionInicio, seleccionFin);
  }

  if (!cabe) {
    event.preventDefault();
  }
}

function crearMedidorCampoPaginado(campo) {
  const rect = campo.getBoundingClientRect();
  const medidor = campo.cloneNode(false);
  medidor.removeAttribute('id');
  medidor.removeAttribute('name');
  medidor.value = '';
  medidor.readOnly = true;
  medidor.style.position = 'absolute';
  medidor.style.left = '-10000px';
  medidor.style.top = '0';
  medidor.style.width = `${rect.width}px`;
  medidor.style.height = `${rect.height}px`;
  medidor.style.minHeight = `${rect.height}px`;
  medidor.style.maxHeight = `${rect.height}px`;
  medidor.style.overflow = 'hidden';
  medidor.style.visibility = 'hidden';
  medidor.style.pointerEvents = 'none';
  document.body.appendChild(medidor);

  return {
    entra(texto) {
      medidor.value = texto;
      return medidor.scrollHeight <= medidor.clientHeight + 1;
    },
    destruir() {
      medidor.remove();
    }
  };
}

function crearMedidorContinuacion(key) {
  const pagina = crearPaginaContinuacion(key, '', 2);
  pagina.style.position = 'absolute';
  pagina.style.left = '-10000px';
  pagina.style.top = '0';
  pagina.style.visibility = 'hidden';
  pagina.style.pointerEvents = 'none';
  document.body.appendChild(pagina);
  const campo = pagina.querySelector(`[data-report-field="${key}"]`);
  const medidor = crearMedidorCampoPaginado(campo);
  pagina.remove();
  return medidor;
}

function buscarCorteNatural(texto, limite) {
  if (limite >= texto.length) return limite;
  const ventana = texto.slice(0, limite);
  const ultimoSalto = ventana.lastIndexOf('\n');
  const ultimoEspacio = Math.max(
    ventana.lastIndexOf(' '),
    ventana.lastIndexOf('\t')
  );
  const corte = Math.max(ultimoSalto, ultimoEspacio);
  return corte > Math.max(0, limite * 0.65) ? corte + 1 : limite;
}

function tomarTextoQueEntraPorAltura(texto, medidor) {
  if (!texto) return { pagina: '', restante: '' };
  if (medidor.entra(texto)) return { pagina: texto, restante: '' };

  let bajo = 1;
  let alto = texto.length;
  let mejor = 1;

  while (bajo <= alto) {
    const medio = Math.floor((bajo + alto) / 2);
    if (medidor.entra(texto.slice(0, medio))) {
      mejor = medio;
      bajo = medio + 1;
    } else {
      alto = medio - 1;
    }
  }

  const corte = buscarCorteNatural(texto, mejor);
  return {
    pagina: texto.slice(0, corte).replace(/[ \t]+$/g, ''),
    restante: texto.slice(corte).replace(/^[ \t]+/g, '')
  };
}

function dividirTextoPorAltura(texto, medidorInicial, crearMedidorSiguiente) {
  let restante = String(texto || '').replace(/\r/g, '');
  const paginas = [];
  let medidorActual = medidorInicial;
  let usandoInicial = true;

  while (restante.length > 0) {
    const corte = tomarTextoQueEntraPorAltura(restante, medidorActual);
    paginas.push(corte.pagina);
    restante = corte.restante;

    if (restante.length > 0 && usandoInicial) {
      medidorActual = crearMedidorSiguiente();
      usandoInicial = false;
    }
  }

  return paginas.length > 0 ? paginas : [''];
}

function repaginarCampoInforme(key) {
  const campos = Array.from(document.querySelectorAll(`#editor-view [data-report-field="${key}"]`));
  if (campos.length === 0) return;

  const textoCompleto = campos
    .map((campo) => obtenerValorCampoInforme(campo))
    .join('')
    .replace(/\r/g, '');
  const campoBase = campos.find((campo) => !campo.dataset.generatedPage) || campos[0];

  document.querySelectorAll(`#editor-view [data-generated-page="${key}"]`).forEach((pagina) => pagina.remove());

  const medidorInicial = crearMedidorCampoPaginado(campoBase);
  const medidoresCreados = [medidorInicial];
  const paginas = dividirTextoPorAltura(textoCompleto, medidorInicial, () => {
    const medidor = crearMedidorContinuacion(key);
    medidoresCreados.push(medidor);
    return medidor;
  });
  medidoresCreados.forEach((medidor) => medidor.destruir());
  asignarValorCampoInforme(campoBase, paginas[0] || '');

  let paginaReferencia = campoBase.closest('.report-letter-page');
  if (key === 'observaciones') {
    let siguiente = paginaReferencia ? paginaReferencia.nextElementSibling : null;
    while (siguiente && siguiente.dataset.generatedPage === 'conclusion') {
      paginaReferencia = siguiente;
      siguiente = siguiente.nextElementSibling;
    }
  }
  paginas.slice(1).forEach((texto, indice) => {
    const pagina = crearPaginaContinuacion(key, texto, indice + 2);
    paginaReferencia.insertAdjacentElement('afterend', pagina);
    paginaReferencia = pagina;
  });

  aplicarLayoutInforme();
}

function enfocarUltimoCampoPaginado(key) {
  const campos = Array.from(document.querySelectorAll(`#editor-view [data-report-field="${key}"]`));
  const ultimo = campos[campos.length - 1];
  if (!ultimo || ultimo === document.activeElement) return;
  ultimo.focus();
  if (typeof ultimo.setSelectionRange === 'function') {
    const largo = ultimo.value.length;
    ultimo.setSelectionRange(largo, largo);
  }
}

function partirTextoPorOverflow(campo) {
  const texto = obtenerValorCampoInforme(campo);
  const tokens = texto.split(/(\s+)/).filter((parte) => parte !== '');

  if (tokens.length <= 1) {
    // Fallback para textos largos sin espacios: cortar por caracteres.
    if (campo.scrollHeight <= campo.clientHeight + 1) {
      return { visible: texto, sobrante: '' };
    }

    let bajo = 0;
    let alto = texto.length;
    let mejor = 0;

    while (bajo <= alto) {
      const medio = Math.floor((bajo + alto) / 2);
      campo.value = texto.slice(0, medio);
      if (campo.scrollHeight <= campo.clientHeight + 1) {
        mejor = medio;
        bajo = medio + 1;
      } else {
        alto = medio - 1;
      }
    }

    campo.value = texto.slice(0, mejor);
    return {
      visible: campo.value,
      sobrante: texto.slice(mejor)
    };
  }

  let visibleTokens = tokens.slice();
  const sobranteTokens = [];
  while (visibleTokens.length > 1 && campo.scrollHeight > campo.clientHeight + 1) {
    sobranteTokens.unshift(visibleTokens.pop());
    campo.value = visibleTokens.join('').trimEnd();
  }

  return {
    visible: campo.value,
    sobrante: sobranteTokens.join('').trimStart()
  };
}

function obtenerOSCrearSiguientePaginaResultados(campo) {
  const paginaActual = campo.closest('.report-letter-page');
  let siguiente = paginaActual ? paginaActual.nextElementSibling : null;
  let creada = false;
  while (siguiente && siguiente.dataset.generatedPage !== 'resultados') {
    siguiente = siguiente.nextElementSibling;
  }

  if (!siguiente) {
    // Buscar el máximo número de página de continuación para asignar el siguiente
    let numeroParte = 2;
    const template = document.querySelector('.report-template');
    if (template) {
      const paginasResultados = Array.from(template.querySelectorAll('[data-generated-page="resultados"]'));
      if (paginasResultados.length > 0) {
        numeroParte = paginasResultados.length + 2;
      }
    }

    siguiente = crearPaginaContinuacion('resultados', '', numeroParte);
    if (paginaActual) {
      paginaActual.insertAdjacentElement('afterend', siguiente);
    }
    creada = true;
  }

  return {
    campo: siguiente.querySelector('[data-report-field="resultados"]'),
    creada
  };
}

function obtenerOffsetVerticalCursorTextarea(campo) {
  if (!campo || campo.tagName !== 'TEXTAREA') return null;
  const posicionCursor = typeof campo.selectionStart === 'number' ? campo.selectionStart : campo.value.length;
  const estilos = getComputedStyle(campo);
  const espejo = document.createElement('div');
  const marcador = document.createElement('span');

  espejo.style.position = 'absolute';
  espejo.style.left = '-10000px';
  espejo.style.top = '0';
  espejo.style.visibility = 'hidden';
  espejo.style.pointerEvents = 'none';
  espejo.style.whiteSpace = 'pre-wrap';
  espejo.style.overflowWrap = 'break-word';
  espejo.style.wordBreak = 'break-word';
  espejo.style.boxSizing = estilos.boxSizing;
  espejo.style.width = `${campo.offsetWidth}px`;
  espejo.style.paddingTop = estilos.paddingTop;
  espejo.style.paddingRight = estilos.paddingRight;
  espejo.style.paddingBottom = estilos.paddingBottom;
  espejo.style.paddingLeft = estilos.paddingLeft;
  espejo.style.borderTopWidth = estilos.borderTopWidth;
  espejo.style.borderRightWidth = estilos.borderRightWidth;
  espejo.style.borderBottomWidth = estilos.borderBottomWidth;
  espejo.style.borderLeftWidth = estilos.borderLeftWidth;
  espejo.style.borderStyle = estilos.borderStyle;
  espejo.style.fontFamily = estilos.fontFamily;
  espejo.style.fontSize = estilos.fontSize;
  espejo.style.fontWeight = estilos.fontWeight;
  espejo.style.fontStyle = estilos.fontStyle;
  espejo.style.lineHeight = estilos.lineHeight;
  espejo.style.letterSpacing = estilos.letterSpacing;
  espejo.style.textTransform = estilos.textTransform;

  espejo.textContent = campo.value.slice(0, posicionCursor);
  marcador.textContent = '\u200b';
  espejo.appendChild(marcador);
  document.body.appendChild(espejo);

  const lineHeight = estilos.lineHeight === 'normal'
    ? obtenerNumeroCSS(estilos.fontSize, 16) * 1.2
    : obtenerNumeroCSS(estilos.lineHeight, obtenerNumeroCSS(estilos.fontSize, 16) * 1.2);
  const offset = marcador.offsetTop - campo.scrollTop + (lineHeight / 2);

  espejo.remove();
  return offset;
}

function centrarCursorEnVista(campo) {
  if (!campo) return;

  const rect = campo.getBoundingClientRect();
  let posicionVertical = rect.top + (rect.height / 2);

  const offsetCursor = obtenerOffsetVerticalCursorTextarea(campo);
  if (Number.isFinite(offsetCursor)) {
    posicionVertical = rect.top + offsetCursor;
  }

  const objetivo = window.scrollY + posicionVertical - (window.innerHeight / 2);
  window.scrollTo({ top: Math.max(0, objetivo), behavior: 'auto' });
}

function manejarInputResultados(campo) {
  if (!campo) return;
  const posicionGlobal = obtenerPosicionGlobalCampoResultados(campo);
  repaginarCampoInforme('resultados');
  restaurarCursorResultados(posicionGlobal);
}

function colapsarTextoDesdePaginasSiguientes(campo) {
  if (!campo) return;

  const posicionCursorOriginal = campo.selectionStart || 0;
  let campoActual = campo;
  
  while (true) {
    if (campoActual.scrollHeight > campoActual.clientHeight + 1) break;

    const paginaActual = campoActual.closest('.report-letter-page');
    let siguientePagina = paginaActual ? paginaActual.nextElementSibling : null;
    while (siguientePagina && siguientePagina.dataset.generatedPage !== 'resultados') {
      siguientePagina = siguientePagina.nextElementSibling;
    }

    if (!siguientePagina) break;

    const siguienteCampo = siguientePagina.querySelector('[data-report-field="resultados"]');
    if (!siguienteCampo || !siguienteCampo.value.trim()) {
      // Si la siguiente está vacía, eliminar página
      siguientePagina.remove();
      continue;
    }

    // Traer contenido de la siguiente página
    const textoSiguiente = siguienteCampo.value;
    const textoActual = obtenerValorCampoInforme(campoActual);

    // Usar búsqueda binaria para saber cuánto cabe
    let bajo = 0;
    let alto = textoSiguiente.length;
    let mejor = 0;

    while (bajo <= alto) {
      const medio = Math.floor((bajo + alto) / 2);
      const valorPrueba = (textoActual + textoSiguiente.slice(0, medio)).trim();
      campoActual.value = valorPrueba;
      if (campoActual.scrollHeight <= campoActual.clientHeight + 1) {
        mejor = medio;
        bajo = medio + 1;
      } else {
        alto = medio - 1;
      }
    }

    if (mejor === 0) break; // No cabe nada más

    // Actualizar campos
    const textoNuevo = (textoActual + textoSiguiente.slice(0, mejor)).trim();
    campoActual.value = textoNuevo;
    siguienteCampo.value = textoSiguiente.slice(mejor).trim();

    if (!siguienteCampo.value.trim()) {
      siguientePagina.remove();
    }
  }
  
  // Restaurar cursor en el campo original
  const nuevaPosicion = Math.min(posicionCursorOriginal, campo.value.length);
  campo.setSelectionRange(nuevaPosicion, nuevaPosicion);
}

function obtenerTodasLasPaginasDeField(field) {
  const fieldKey = field.dataset.reportField;
  const paginas = [field.closest('.report-letter-page')];

  let siguiente = paginas[0].nextElementSibling;
  while (siguiente) {
    if (siguiente.dataset.generatedPage === fieldKey) {
      paginas.push(siguiente);
    }
    siguiente = siguiente.nextElementSibling;
  }

  return paginas;
}

function obtenerCamposResultadosOrdenados() {
  return Array.from(document.querySelectorAll('#editor-view [data-report-field="resultados"]'));
}

function obtenerPosicionGlobalCampoResultados(campoActivo) {
  const campos = obtenerCamposResultadosOrdenados();
  let posicion = 0;
  for (const campo of campos) {
    if (campo === campoActivo) {
      return posicion + (campo.selectionStart || 0);
    }
    posicion += obtenerValorCampoInforme(campo).length;
  }
  return posicion;
}

function restaurarCursorResultados(posicionGlobal) {
  const campos = obtenerCamposResultadosOrdenados();
  let acumulado = 0;
  for (const campo of campos) {
    const largo = obtenerValorCampoInforme(campo).length;
    if (posicionGlobal <= acumulado + largo) {
      const posicionLocal = Math.max(0, Math.min(largo, posicionGlobal - acumulado));
      campo.focus();
      if (typeof campo.setSelectionRange === 'function') {
        campo.setSelectionRange(posicionLocal, posicionLocal);
      }
      centrarCursorEnVista(campo);
      return;
    }
    acumulado += largo;
  }

  const ultimo = campos[campos.length - 1];
  if (ultimo) {
    const posicion = ultimo.value.length;
    ultimo.focus();
    ultimo.setSelectionRange(posicion, posicion);
    centrarCursorEnVista(ultimo);
  }
}

function seleccionarTodoEnPaginas(campoInicial) {
  const fieldKey = campoInicial.dataset.reportField;
  const paginas = obtenerTodasLasPaginasDeField(campoInicial);
  const campos = paginas.map((p) => p.querySelector(`[data-report-field="${fieldKey}"]`)).filter(Boolean);

  if (campos.length === 1) {
    campos[0].select();
    return;
  }

  // Solo seleccionar el primer campo de resultados
  campos[0].select();
}

function repaginarCampoInformeConDebounce(key) {
  clearTimeout(timersRepaginacion[key]);
  timersRepaginacion[key] = setTimeout(() => {
    repaginarCampoInforme(key);
  }, 800);
}

function crearPaginaContinuacion(key, texto, numeroParte) {
  const titulos = {
    antecedentes: 'ANTECEDENTES',
    resultados: 'ECOGRAFÍA ABDOMINAL | RESULTADOS',
    conclusion: 'CONCLUSIONES | DETALLES ADICIONALES',
    observaciones: 'OBSERVACIONES'
  };
  const pagina = document.createElement('section');
  pagina.className = ['resultados', 'conclusion', 'observaciones'].includes(key)
    ? 'report-letter-page body-page body-continuation-page'
    : 'report-letter-page eco-continuation-page';
  pagina.dataset.generatedPage = key;
  
  let contenidoHTML;
  if (key === 'observaciones') {
    contenidoHTML = [
      '<section class="body-continuation-header">',
      `  <h2>${titulos[key]}</h2>`,
      '  <div class="body-continuation-rule"></div>',
      '</section>',
      '<section class="body-text-continuation">',
      `  <textarea class="report-field body-field body-continuation-field" data-report-field="${key}" data-generated-page="${key}"></textarea>`,
      '</section>',
      `<footer class="body-page-footer"><span class="body-footer-mark"></span><strong>${numeroParte}</strong></footer>`
    ].join('');
  } else if (key === 'resultados') {
    contenidoHTML = [
      '<section class="body-results-continuation">',
      `  <textarea class="report-field body-field body-results-continuation-field" data-report-field="${key}" data-generated-page="${key}"></textarea>`,
      '</section>',
      `<footer class="body-page-footer"><span class="body-footer-mark"></span><strong>${numeroParte}</strong></footer>`
    ].join('');
  } else if (key === 'conclusion') {
    contenidoHTML = [
      '<section class="body-continuation-header">',
      `  <h2>${titulos[key]}</h2>`,
      '  <div class="body-continuation-rule"></div>',
      '</section>',
      '<section class="body-text-continuation">',
      `  <textarea class="report-field body-field body-continuation-field" data-report-field="${key}" data-generated-page="${key}"></textarea>`,
      '</section>',
      `<footer class="body-page-footer"><span class="body-footer-mark"></span><strong>${numeroParte}</strong></footer>`
    ].join('');
  } else {
    contenidoHTML = [
      '<section class="eco-section eco-section-soft">',
      `  <h2>${titulos[key] || 'ANTECEDENTES'}</h2>`,
      '  <div class="eco-section-rule"></div>',
      '</section>',
      '<section class="eco-section eco-body-section">',
      `  <textarea class="report-field report-field-block eco-continuation-text" data-report-field="${key}" data-generated-page="${key}"></textarea>`,
      '</section>',
      '<footer class="eco-page-footer"><span></span><strong></strong></footer>'
    ].join('');
  }
  
  pagina.innerHTML = contenidoHTML;
  const campo = pagina.querySelector('textarea');
  campo.value = texto;
  campo.addEventListener('input', () => {
    if (key === 'resultados') {
      manejarInputResultados(campo);
    } else if (key === 'observaciones') {
      ajustarObservacionesAutomaticamente(campo);
      repaginarCampoInformeConDebounce(key);
    } else {
      repaginarCampoInformeConDebounce(key);
    }
  });
  
  return pagina;
}

function repaginarInforme() {
  const paginaPerfilRenderizada = document.querySelector('#editor-view .report-template.profile-fill-mode .profile-report-pages .profile-layout-page[data-profile-page-id]');
  if (informeLayoutActivo.perfilId && paginaPerfilRenderizada && informeLayoutActivo.paginas.some((pagina) => pagina.id === paginaPerfilRenderizada.dataset.profilePageId)) repaginarBloquesPerfil();
  ajustarPaginaConclusion();
  ['resultados'].forEach(repaginarCampoInforme);
  ajustarPaginaConclusion();
  aplicarLayoutInforme();
  ajustarCamposPortada();
}

function leerInformeDesdeEditor() {
  const datos = {};
  const camposExtensos = new Set(['antecedentes', 'resultados', 'conclusion', 'observaciones']);
  obtenerCamposInforme().forEach((campo) => {
    const key = campo.dataset.reportField;
    const valor = obtenerValorCampoInforme(campo).trim();
    if (camposExtensos.has(key)) datos[key] = datos[key] ? `${datos[key]}\n\n${valor}`.trim() : valor;
    else if (!datos[key] && valor) datos[key] = valor;
    else if (!(key in datos)) datos[key] = '';
  });
  datos.imagenes = obtenerImagenesInforme();
  sincronizarInformePerfilDesdeDOM();
  datos._layout = normalizarLayoutInforme(informeLayoutActivo);
  return datos;
}

function manejarCampoInteligenteInforme(event) {
  const campo = event.target?.closest?.('#editor-view [data-report-field]');
  if (!campo || sincronizandoCamposInteligentes) return;
  const key = campo.dataset.reportField;
  if (!key || ['antecedentes', 'resultados', 'conclusion', 'observaciones'].includes(key)) return;
  sincronizandoCamposInteligentes = true;
  const valor = obtenerValorCampoInforme(campo);
  document.querySelectorAll(`#editor-view [data-report-field="${CSS.escape(key)}"]`).forEach((destino) => {
    if (destino !== campo && !destino.dataset.generatedPage) asignarValorCampoInforme(destino, valor);
  });
  sincronizandoCamposInteligentes = false;
}

function programarAutoguardadoInforme() {
  if (document.getElementById('editor-view')?.style.display === 'none') return;
  window.clearTimeout(timerAutoguardadoInforme);
  timerAutoguardadoInforme = window.setTimeout(() => {
    try {
      const datos = leerInformeDesdeEditor();
      localStorage.setItem('borradorInformeAutomatico', JSON.stringify({
        version: 1,
        guardadoEn: new Date().toISOString(),
        id: informeActivoId,
        creadoEn: informeActivoCreadoEn || new Date().toISOString(),
        datos: prepararDatosPersistenciaInforme(datos)
      }));
      mostrarEstadoGuardadoWord('Autoguardado');
    } catch (error) {
      console.warn('No fue posible autoguardar el informe:', error);
    }
  }, 1200);
}

async function revisarRecuperacionInforme() {
  let borrador;
  try { borrador = JSON.parse(localStorage.getItem('borradorInformeAutomatico') || 'null'); } catch (error) { borrador = null; }
  if (!borrador?.datos) return;
  const guardado = borrador.id && estadoDashboard.informes.find((item) => item.id === borrador.id);
  if (guardado && String(guardado.actualizado || '') >= String(borrador.guardadoEn || '')) {
    localStorage.removeItem('borradorInformeAutomatico');
    return;
  }
  const recuperar = await mostrarDialogoApp({ titulo: 'Recuperar informe', mensaje: `Hay una edición automática del ${new Date(borrador.guardadoEn).toLocaleString('es-CL')}.`, tipo: 'info', confirmar: 'Recuperar', cancelar: 'Descartar' });
  if (!recuperar) {
    localStorage.removeItem('borradorInformeAutomatico');
    return;
  }
  cargarInformeEnEditor({ id: borrador.id || `INF-${Date.now()}`, creadoEn: borrador.creadoEn, datos: borrador.datos });
  cambiarVista('editor');
  mostrarAvisoBreve('Se recuperó el último autoguardado.');
}

function sincronizarInformePerfilDesdeDOM() {
  const paginas = document.querySelector('.profile-report-pages');
  if (!paginas || !informeLayoutActivo.perfilId) return;
  informeLayoutActivo.bloques.forEach((bloque) => {
    const bloqueElemento = paginas.querySelector(`.profile-layout-block[data-block-id="${bloque.id}"]`);
    if (bloque.tipo === 'bloque-texto-libre') {
      const editores = Array.from(paginas.querySelectorAll(`.profile-rich-editor[data-rich-block="${bloque.id}"]`));
      bloque.contenidoDefecto = editores.length ? editores.map((editor) => editor.innerHTML).join('') : bloque.contenidoDefecto || '';
      return;
    }
    if (bloque.tipo !== 'bloque-tabla-moderna') return;
    const elementos = [bloqueElemento, ...Array.from(paginas.querySelectorAll(`.profile-table-continuation-page[data-block-id="${bloque.id}"]`))].filter(Boolean);
    bloque.contenidoDefecto.filas = elementos.flatMap(obtenerFilasTablaDesdeElemento);
  });
  informeLayoutActivo.imagenesPerfil = normalizarImagenesInforme(Array.from(paginas.querySelectorAll('.protected-photo-slot img')).map((imagen) => imagen.src));
}

function capturarEstadoContenidoInforme() {
  const raiz = document.querySelector('.profile-report-pages');
  if (!raiz) return null;
  return JSON.stringify({
    textos: informeLayoutActivo.bloques.filter((bloque) => bloque.tipo === 'bloque-texto-libre').map((bloque) => ({ id: bloque.id, html: Array.from(raiz.querySelectorAll(`.profile-rich-editor[data-rich-block="${bloque.id}"]`)).map((editor) => editor.innerHTML).join('').replace(/\s+/g, ' ').trim() })),
    valores: Array.from(raiz.querySelectorAll('.measurements-table input')).map((input) => input.value),
    datosPaciente: Array.from(raiz.querySelectorAll('.bloque-datos-paciente [data-report-field]')).map((input) => ({ campo: input.dataset.reportField, valor: input.value })),
    imagenes: Array.from(raiz.querySelectorAll('.protected-photo-slot img')).map((imagen) => imagen.src)
  });
}

function informePacienteTieneCambiosDeContenido() {
  if (!informeLayoutActivo.perfilId) {
    const datos = leerInformeDesdeEditor();
    return !informeEstaVacio(datos);
  }
  const actual = capturarEstadoContenidoInforme();
  return actual !== null && estadoInicialContenidoInforme !== null && actual !== estadoInicialContenidoInforme;
}

function clonarDatosEditor(datos) {
  return JSON.parse(JSON.stringify(datos || {}));
}

function crearSnapshotEditor() {
  const datos = leerInformeDesdeEditor();
  return {
    datos: clonarDatosEditor(datos),
    layout: normalizarLayoutInforme(datos._layout || informeLayoutActivo)
  };
}

function sonSnapshotsIguales(snapshotA, snapshotB) {
  return JSON.stringify(snapshotA || {}) === JSON.stringify(snapshotB || {});
}

function recordarFocoEditor() {
  const activo = document.activeElement;
  if (!activo || !activo.matches || !activo.matches('#editor-view [data-report-field]')) return null;
  return {
    campo: activo,
    inicio: typeof activo.selectionStart === 'number' ? activo.selectionStart : null,
    fin: typeof activo.selectionEnd === 'number' ? activo.selectionEnd : null
  };
}

function restaurarFocoEditor(foco) {
  if (!foco || !foco.campo || !document.contains(foco.campo)) return;
  window.requestAnimationFrame(() => {
    foco.campo.focus();
    if (foco.inicio !== null && foco.fin !== null && typeof foco.campo.setSelectionRange === 'function') {
      const largo = obtenerValorCampoInforme(foco.campo).length;
      foco.campo.setSelectionRange(Math.min(foco.inicio, largo), Math.min(foco.fin, largo));
    }
  });
}

function refrescarListasInformesDiferido() {
  const refrescar = () => {
    renderDashboard();
    renderHistorial();
    renderPapeleraInformes();
  };
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(refrescar, { timeout: 600 });
  } else {
    window.setTimeout(refrescar, 0);
  }
}

function actualizarBotonesHistorialEditor() {
  const botonDeshacer = document.getElementById('undoEditorButton');
  const botonRehacer = document.getElementById('redoEditorButton');
  if (botonDeshacer) botonDeshacer.disabled = historialDeshacerEditor.length === 0;
  if (botonRehacer) botonRehacer.disabled = historialRehacerEditor.length === 0;
}

function limpiarHistorialEditor() {
  historialDeshacerEditor = [];
  historialRehacerEditor = [];
  actualizarBotonesHistorialEditor();
}

function registrarEstadoEditorParaDeshacer() {
  if (aplicandoSnapshotEditor) return;
  const snapshot = crearSnapshotEditor();
  const ultimo = historialDeshacerEditor[historialDeshacerEditor.length - 1];
  if (!sonSnapshotsIguales(snapshot, ultimo)) {
    historialDeshacerEditor.push(snapshot);
  }
  historialRehacerEditor = [];
  actualizarBotonesHistorialEditor();
}

function manejarBeforeInputHistorialEditor(event) {
  const campo = event.target && event.target.closest ? event.target.closest('#editor-view [data-report-field]') : null;
  if (!campo || campo.readOnly || campo.disabled || aplicandoSnapshotEditor) return;
  if (!String(event.inputType || '').startsWith('delete')) return;
  registrarEstadoEditorParaDeshacer();
}

function aplicarSnapshotEditor(snapshot) {
  if (!snapshot || !snapshot.datos) return;
  aplicandoSnapshotEditor = true;
  const datos = clonarDatosEditor(snapshot.datos);
  informeLayoutActivo = normalizarLayoutInforme(snapshot.layout || datos._layout);
  document.querySelectorAll('#editor-view [data-generated-page]').forEach((pagina) => pagina.remove());
  obtenerCamposBaseInforme().forEach((campo) => {
    const key = campo.dataset.reportField;
    asignarValorCampoInforme(campo, obtenerValorDatoInforme(datos, key));
  });
  repaginarInforme();
  renderPaginasImagenesInforme(datos.imagenes || []);
  aplicarCredencialesYDiplomados();
  aplicarLayoutInforme();
  renderEditor();
  aplicandoSnapshotEditor = false;
  window.requestAnimationFrame(() => {
    vincularCamposInformeDinamicos();
    ajustarCamposPortada();
  });
}

function deshacerCambioEditor() {
  if (historialDeshacerEditor.length === 0) return;
  const actual = crearSnapshotEditor();
  const anterior = historialDeshacerEditor.pop();
  historialRehacerEditor.push(actual);
  aplicarSnapshotEditor(anterior);
  actualizarBotonesHistorialEditor();
}

function rehacerCambioEditor() {
  if (historialRehacerEditor.length === 0) return;
  const actual = crearSnapshotEditor();
  const siguiente = historialRehacerEditor.pop();
  historialDeshacerEditor.push(actual);
  aplicarSnapshotEditor(siguiente);
  actualizarBotonesHistorialEditor();
}

function manejarAtajosHistorialEditor(event) {
  if (!document.getElementById('editor-view') || document.getElementById('editor-view').style.display === 'none') return;
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
  const tecla = String(event.key || '').toLowerCase();
  if (tecla === 'z' && !event.shiftKey) {
    if (historialDeshacerEditor.length === 0) return;
    event.preventDefault();
    deshacerCambioEditor();
    return;
  }
  if (tecla === 'y' || (tecla === 'z' && event.shiftKey)) {
    if (historialRehacerEditor.length === 0) return;
    event.preventDefault();
    rehacerCambioEditor();
  }
}

function vincularCamposInformeDinamicos() {
  obtenerCamposInforme().forEach((campo) => {
    if (campo.dataset.editorDynamicBound === '1') return;
    campo.dataset.editorDynamicBound = '1';
    if (campo.classList && campo.classList.contains('cover-field')) {
      campo.addEventListener('input', () => {
        if (campo.dataset.reportField === 'fecha') {
          manejarInputFechaPortada(campo);
        } else {
          ajustarCampoPortada(campo);
        }
      });
      ajustarCampoPortada(campo);
    }
  });
}

function informeEstaVacio(datos) {
  const camposIgnorados = new Set([
    'fecha',
    'medico',
    'rutMedico',
    'registroMedico',
    '_layout'
  ]);

  return Object.entries(datos).every(([key, valor]) => {
    if (camposIgnorados.has(key)) return true;
    if (Array.isArray(valor)) return valor.length === 0;
    if (valor && typeof valor === 'object') return Object.keys(valor).length === 0;
    return !String(valor || '').replace(/\s+/g, ' ').trim();
  });
}

function cargarInformeEnEditor(informe) {
  informeActivoId = informe.id;
  informeActivoCreadoEn = informe.creadoEn || informe.actualizado || (informe.id ? new Date().toISOString() : null);
  const datos = { ...(informe.datos || informeBase) };
  if (!informe.id && !datos.fecha) datos.fecha = formatearFechaISO(new Date());
  informeLayoutActivo = normalizarLayoutInforme(datos._layout || informe._layout);
  if (informeLayoutActivo.perfilId) informeLayoutActivo.imagenesPerfil = normalizarImagenesInforme(datos.imagenes || informeLayoutActivo.imagenesPerfil);
  informeLayoutActivo.paginasEliminadas = [];
  document.querySelectorAll('#editor-view [data-generated-page]').forEach((pagina) => pagina.remove());
  obtenerCamposBaseInforme().forEach((campo) => {
    const key = campo.dataset.reportField;
    asignarValorCampoInforme(campo, obtenerValorDatoInforme(datos, key));
  });
  repaginarInforme();
  renderPaginasImagenesInforme(datos.imagenes || []);
  aplicarCredencialesYDiplomados();
  aplicarLayoutInforme();
  ajustarCamposPortada();
  renderEditor();
  document.querySelectorAll('#editor-view .bloque-datos-paciente [data-report-field]').forEach((campo) => {
    asignarValorCampoInforme(campo, obtenerValorDatoInforme(datos, campo.dataset.reportField));
  });
  estadoInicialContenidoInforme = capturarEstadoContenidoInforme();
  limpiarHistorialEditor();
  window.requestAnimationFrame(() => {
    repaginarCampoInforme('resultados');
    ajustarPaginaConclusion();
    ajustarCamposPortada();
    window.refrescarMejorasProducto?.();
  });
}

function renderEditor() {
  const editorEstado = document.getElementById('editorEstado');
  if (!editorEstado) return;

  const plantilla = document.querySelector('#editor-view .report-template');
  if (informeLayoutActivo.perfilId) {
    renderizarEditorPerfil();
  } else if (plantilla) {
    plantilla.classList.remove('profile-fill-mode');
    plantilla.querySelector('.profile-report-pages')?.remove();
    const cinta = document.getElementById('wordRibbon');
    if (cinta) cinta.style.display = 'none';
  }

  const informe = estadoDashboard.informes.find((item) => item.id === informeActivoId);
  if (!informeActivoId) {
    editorEstado.textContent = 'Borrador sin guardar.';
    return;
  }

  if (informe) {
    const fechaTexto = obtenerFechaMostradaInforme(informe);
    editorEstado.textContent = `${informe.estado || 'Borrador'} ${informe.nombre || informe.id} guardado. ${fechaTexto}.`;
    return;
  }

  editorEstado.textContent = `Borrador ${informeActivoId} sin guardar.`;
}

function guardarBorradorInforme(mostrarConfirmacion = true) {
  const focoEditor = recordarFocoEditor();
  if (!informeActivoId) {
    informeActivoId = `INF-${Date.now()}`;
  }
  if (!informeActivoCreadoEn) {
    informeActivoCreadoEn = new Date().toISOString();
  }

  const datos = leerInformeDesdeEditor();
  const datosPersistentes = prepararDatosPersistenciaInforme(datos);
  const fechaActual = new Date().toISOString();
  const identificador = prepararIdentificadorActivoInforme(datos);
  const informeExistente = obtenerInformePorId(identificador.idAnterior) || obtenerInformePorId(identificador.idNuevo);
  const yaEstaCompletado = informeExistente && informeExistente.estado === 'Completado';
  const informe = {
    id: identificador.idNuevo,
    nombre: crearBaseNombreInforme(datos),
    tecnico: 'Sin tecnico',
    fecha: datos.fecha || formatearFechaISO(new Date()),
    estado: yaEstaCompletado ? 'Completado' : 'Borrador',
    creadoEn: informeExistente ? informeExistente.creadoEn || informeExistente.actualizado || informeActivoCreadoEn : informeActivoCreadoEn,
    actualizado: fechaActual,
    completadoEn: yaEstaCompletado ? informeExistente.completadoEn || fechaActual : '',
    datos: datosPersistentes
  };

  if (informeExistente && window.registrarRevisionInforme && !(window.AppCore?.reportsEqual(informeExistente, informe))) {
    window.registrarRevisionInforme(informeExistente, 'Antes de guardar cambios');
  }

  const indice = estadoDashboard.informes.findIndex((item) => item.id === identificador.idAnterior || item.id === identificador.idNuevo);
  if (indice === -1) {
    estadoDashboard.informes.push(informe);
  } else {
    estadoDashboard.informes[indice] = informe;
  }

  persistirInformes();
  window.registrarPacienteDesdeDatos?.(datos);
  window.clearTimeout(timerAutoguardadoInforme);
  localStorage.removeItem('borradorInformeAutomatico');
  renderEditor();
  mostrarEstadoGuardadoWord('Guardado');
  restaurarFocoEditor(focoEditor);
  refrescarListasInformesDiferido();
}

function guardarInformeCompletado(datos, nombrePaciente, horaCreacion = null) {
  const focoEditor = recordarFocoEditor();
  if (!informeActivoId) {
    informeActivoId = `INF-${Date.now()}`;
  }
  if (!informeActivoCreadoEn) {
    informeActivoCreadoEn = new Date().toISOString();
  }

  const fechaActual = new Date().toISOString();
  const datosPersistentes = prepararDatosPersistenciaInforme(datos);
  const identificador = prepararIdentificadorActivoInforme(datos, horaCreacion);
  const informeExistente = obtenerInformePorId(identificador.idAnterior) || obtenerInformePorId(identificador.idNuevo);
  const informe = {
    id: identificador.idNuevo,
    nombre: crearBaseNombreInforme(datos),
    tecnico: 'Sin tecnico',
    fecha: datos.fecha || formatearFechaISO(new Date()),
    estado: 'Completado',
    creadoEn: informeExistente ? informeExistente.creadoEn || informeExistente.actualizado || informeActivoCreadoEn : informeActivoCreadoEn,
    actualizado: fechaActual,
    completadoEn: fechaActual,
    datos: datosPersistentes
  };

  if (informeExistente && window.registrarRevisionInforme && !(window.AppCore?.reportsEqual(informeExistente, informe))) {
    window.registrarRevisionInforme(informeExistente, 'Antes de finalizar');
  }

  const indice = estadoDashboard.informes.findIndex((item) => item.id === identificador.idAnterior || item.id === identificador.idNuevo);
  if (indice === -1) {
    estadoDashboard.informes.push(informe);
  } else {
    estadoDashboard.informes[indice] = informe;
  }

  persistirInformes();
  window.registrarPacienteDesdeDatos?.(datos);
  window.clearTimeout(timerAutoguardadoInforme);
  localStorage.removeItem('borradorInformeAutomatico');
  renderEditor();
  mostrarEstadoGuardadoWord('Guardado');
  restaurarFocoEditor(focoEditor);
  refrescarListasInformesDiferido();
}

function prepararDatosPersistenciaInforme(datos) {
  const copia = clonarDatosEditor(datos);
  if (copia._layout) copia._layout.paginasEliminadas = [];
  return copia;
}

async function eliminarInforme(informeId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const informe = obtenerInformePorId(informeId);
  if (!informe) return;

  const deseaEliminar = await mostrarDialogoApp({ titulo: 'Mover a la papelera', mensaje: 'El informe dejará de aparecer entre los documentos activos.', tipo: 'danger', confirmar: 'Mover', cancelar: 'Cancelar' });
  if (!deseaEliminar) return;

  const informeEliminado = {
    ...informe,
    eliminadoEn: new Date().toISOString()
  };
  estadoDashboard.informes = estadoDashboard.informes.filter((item) => item.id !== informeId);
  estadoDashboard.papeleraInformes = [
    informeEliminado,
    ...estadoDashboard.papeleraInformes.filter((item) => item.id !== informeId)
  ];
  persistirInformes();

  if (informeActivoId === informeId) {
    cargarInformeEnEditor({
      id: null,
      datos: { ...informeBase }
    });
  }

  if (informeSeleccionadoDashboardId === informeId) {
    informeSeleccionadoDashboardId = null;
  }

  renderDashboard();
  renderHistorial();
  renderPapeleraInformes();
}

function restaurarInformePapelera(informeId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const informe = obtenerInformeEliminadoPorId(informeId);
  if (!informe) return;

  const idRestaurado = crearIdRestauradoSinColision(informe.id);
  const { eliminadoEn, ...informeRestaurado } = informe;
  informeRestaurado.id = idRestaurado;
  informeRestaurado.actualizado = new Date().toISOString();

  estadoDashboard.papeleraInformes = estadoDashboard.papeleraInformes.filter((item) => item.id !== informeId);
  estadoDashboard.informes.push(informeRestaurado);
  persistirInformes();

  renderDashboard();
  renderHistorial();
  renderPapeleraInformes();
}

async function eliminarInformeDefinitivo(informeId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const informe = obtenerInformeEliminadoPorId(informeId);
  if (!informe) return;

  const deseaEliminar = await mostrarDialogoApp({ titulo: 'Eliminar definitivamente', mensaje: 'Esta acción no se puede deshacer.', tipo: 'danger', confirmar: 'Eliminar', cancelar: 'Conservar' });
  if (!deseaEliminar) return;

  estadoDashboard.papeleraInformes = estadoDashboard.papeleraInformes.filter((item) => item.id !== informeId);
  persistirInformes();
  renderPapeleraInformes();
}

async function vaciarPapeleraInformes() {
  if (estadoDashboard.papeleraInformes.length === 0) return;
  const deseaVaciar = await mostrarDialogoApp({ titulo: 'Vaciar papelera', mensaje: 'Todos los informes de la papelera se eliminarán definitivamente.', tipo: 'danger', confirmar: 'Vaciar papelera', cancelar: 'Cancelar' });
  if (!deseaVaciar) return;
  estadoDashboard.papeleraInformes = [];
  persistirInformes();
  renderPapeleraInformes();
}

function abrirInforme(informeId) {
  const informe = obtenerInformePorId(informeId);
  if (!informe) return;
  showEditor();
  cargarInformeEnEditor(informe);
}

function abrirInformeDesdeListado(informeId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  abrirInforme(informeId);
}

function seleccionarInformeDashboard(event, informeId) {
  if (event && event.target && event.target.closest('button')) return;
  actualizarSeleccionDashboard(informeId);
}

function manejarTeclaFilaInforme(event, informeId) {
  if (event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space') {
    event.preventDefault();
    abrirVistaPreviaQuickLook(informeId);
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    abrirInforme(informeId);
  }
}

function seleccionarInformeHistorial(event, informeId) {
  if (event && event.target && event.target.closest('button')) return;
  Array.from(document.querySelectorAll('[data-historial-report-id]')).forEach((fila) => {
    fila.classList.toggle('is-selected', fila.dataset.historialReportId === informeId);
  });
}

function manejarTeclaFilaHistorial(event, informeId) {
  if (event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space') {
    event.preventDefault();
    abrirVistaPreviaQuickLook(informeId);
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    abrirInforme(informeId);
  }
}

function seleccionarInformePapelera(event, informeId) {
  if (event && event.target && event.target.closest('button')) return;
  Array.from(document.querySelectorAll('[data-papelera-report-id]')).forEach((fila) => {
    fila.classList.toggle('is-selected', fila.dataset.papeleraReportId === informeId);
  });
}

function manejarTeclaFilaPapelera(event, informeId) {
  seleccionarInformePapelera(event, informeId);
  if (event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space') {
    event.preventDefault();
    abrirVistaPreviaQuickLook(informeId, obtenerInformeEliminadoPorId(informeId));
  }
}

function mostrarVistaPreviaPDF() {
  try {
    abrirVistaPreviaPDFDesdeEditor();
  } catch (error) {
    console.error('No fue posible generar la vista previa:', error);
    mostrarMensajeApp('Vista previa no disponible', 'No fue posible preparar el informe. Vuelve a intentarlo o guarda el PDF directamente.', 'danger');
  }
}

function esperarPintadoPDF() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function cerrarVistaPreviaPDF() {
  const modal = document.getElementById('pdf-preview-modal');
  const botonGuardar = document.getElementById('pdfPreviewSaveButton');
  const titulo = modal ? modal.querySelector('.editor-title') : null;
  const subtitulo = modal ? modal.querySelector('.editor-subtitle') : null;
  if (modal) modal.style.display = 'none';
  if (botonGuardar) botonGuardar.style.display = '';
  if (titulo) titulo.textContent = 'Vista previa PDF';
  if (subtitulo) subtitulo.textContent = 'Revisa el formato antes de guardar.';
  modoVistaPrevia = 'pdf';
}

async function guardarInformePDF() {
  const focoEditor = recordarFocoEditor();
  repaginarInforme();
  cerrarVistaPreviaPDF();

  const datos = leerInformeDesdeEditor();
  const informeVacio = informeEstaVacio(datos);
  if (informeVacio) {
    const deseaGuardarVacio = await mostrarDialogoApp({ titulo: 'Informe vacío', mensaje: 'El documento no contiene datos del paciente. ¿Deseas guardarlo igualmente?', tipo: 'danger', confirmar: 'Guardar igualmente', cancelar: 'Volver al editor' });
    if (!deseaGuardarVacio) return;
  }
  const advertencias = informeVacio ? [] : obtenerAdvertenciasPreflightInforme(datos);
  if (advertencias.length) {
    const continuar = await mostrarDialogoApp({
      titulo: 'Revisión antes de exportar',
      mensaje: `${advertencias.join(' · ')} Puedes regresar al editor o generar el PDF igualmente.`,
      tipo: 'danger',
      confirmar: 'Generar igualmente',
      cancelar: 'Revisar informe'
    });
    if (!continuar) return;
  }

  const horaCreacionInforme = obtenerHoraCreacionInformeActivo();
  const nombreSugerido = crearNombreSugeridoInforme(datos, horaCreacionInforme);

  if (window.electronAPI && typeof window.electronAPI.guardarPDF === 'function') {
    document.body.classList.add('pdf-export-mode');
    try {
      await esperarPintadoPDF();
      repaginarInforme();
      await esperarPintadoPDF();
      const resultado = await window.electronAPI.guardarPDF({
        nombreSugerido,
        directorioInicial: localStorage.getItem('ultimaCarpetaPDF') || ''
      });
      if (resultado && resultado.ok) {
        const estadoAntesDeExportar = obtenerInformePorId(informeActivoId);
        const conservarCompletado = estadoAntesDeExportar?.estado === 'Completado';
        const completadoEnAnterior = estadoAntesDeExportar?.completadoEn || '';
        guardarBorradorInforme(false);
        const informeGuardado = obtenerInformePorId(informeActivoId);
        if (conservarCompletado && informeGuardado) {
          informeGuardado.estado = 'Completado';
          informeGuardado.completadoEn = completadoEnAnterior || new Date().toISOString();
        }
        window.__appBridge?.markCurrentReportExported(resultado.filePath);
        const separador = Math.max(resultado.filePath.lastIndexOf('/'), resultado.filePath.lastIndexOf('\\'));
        if (separador > 0) localStorage.setItem('ultimaCarpetaPDF', resultado.filePath.slice(0, separador));
        if (window.showPdfSuccess) window.showPdfSuccess(resultado.filePath);
        else mostrarMensajeApp('PDF exportado', resultado.filePath, 'success');
      }
    } finally {
      document.body.classList.remove('pdf-export-mode');
      restaurarFocoEditor(focoEditor);
    }
    return;
  }

  await mostrarMensajeApp('No se pudo guardar el PDF', 'El canal de guardado de Electron no está disponible en esta vista.', 'danger');
}

function obtenerAdvertenciasPreflightInforme(datos) {
  const advertencias = [];
  if (!String(datos?.paciente || '').trim()) advertencias.push('Falta el nombre del paciente.');
  if (!String(datos?.fecha || '').trim()) advertencias.push('Falta la fecha del informe.');
  if (informeLayoutActivo.perfilId && !informeLayoutActivo.bloques.some((bloque) => bloque.visible !== false)) advertencias.push('La plantilla no contiene bloques visibles.');
  return advertencias;
}

function confirmarGuardadoBorrador() {
  const modal = document.getElementById('draft-confirm-modal');
  if (!modal) return mostrarDialogoApp({ titulo: 'Guardar borrador', mensaje: 'Antes de volver al dashboard, ¿deseas conservar los cambios?', confirmar: 'Guardar', cancelar: 'Descartar' });
  modal.style.display = 'flex';
  return new Promise((resolve) => {
    resolverConfirmacionBorrador = resolve;
  });
}

function responderConfirmacionBorrador(respuesta) {
  const modal = document.getElementById('draft-confirm-modal');
  if (modal) modal.style.display = 'none';
  if (resolverConfirmacionBorrador) {
    resolverConfirmacionBorrador(Boolean(respuesta));
    resolverConfirmacionBorrador = null;
  }
}

async function volverDesdeEditor() {
  try {
    const informeExistente = obtenerInformePorId(informeActivoId);
    const hayCambiosDeContenido = informePacienteTieneCambiosDeContenido();

    if (informeExistente) {
      guardarBorradorInforme(false);
    } else if (informeActivoId && hayCambiosDeContenido) {
      const deseaGuardarBorrador = await confirmarGuardadoBorrador();
      if (deseaGuardarBorrador) {
        guardarBorradorInforme(false);
      } else {
        informeActivoId = null;
        informeActivoCreadoEn = null;
      }
    } else if (!informeExistente) {
      informeActivoId = null;
      informeActivoCreadoEn = null;
    }
  } catch (error) {
    console.error('No fue posible procesar el borrador al volver:', error);
  } finally {
    estadoInicialContenidoInforme = null;
    showDashboard();
  }
}

async function restablecerAjustes() {
  const deseaRestablecer = await mostrarDialogoApp({ titulo: 'Restablecer datos', mensaje: 'Se eliminarán informes, credenciales y preferencias locales. Las plantillas se conservarán.', tipo: 'danger', confirmar: 'Restablecer', cancelar: 'Cancelar' });
  if (!deseaRestablecer) return;

  estadoDashboard.informes = [];
  informeActivoId = null;
  ajustesApp.firmaDigital = '';
  ajustesApp.firmaSimple = '';
  ajustesApp.rutMedico = '';
  ajustesApp.registroMedico = '';
  ajustesApp.logoClinica = '';
  ajustesApp.direccionClinica = '';
  ajustesApp.telefonoClinica = '';
  ajustesApp.diplomadosPrincipal = '';
  ajustesApp.diplomadosLateral = '';
  ajustesApp.diplomadosCursados = [];
  ajustesApp.diplomadosEnCurso = [];
  ajustesApp.tema = 'huellitas';
  ajustesApp.modoTema = 'claro';
  informeActivoCreadoEn = null;
  persistirInformes();
  persistirAjustes();
  aplicarTemaAplicacion(ajustesApp.tema);
  renderConfiguracion();
}

function renderConfiguracion() {
  const firmaPreview = document.getElementById('firmaPreview');
  const firmaPlaceholder = document.getElementById('firmaPlaceholder');
  const firmaSimpleInput = document.getElementById('firmaSimpleInput');
  const rutMedicoInput = document.getElementById('rutMedicoInput');
  const registroMedicoInput = document.getElementById('registroMedicoInput');
  const firmaModeSelect = document.getElementById('firmaModeSelect');
  const direccionClinicaInput = document.getElementById('direccionClinicaInput');
  const telefonoClinicaInput = document.getElementById('telefonoClinicaInput');
  const logoClinicaPreview = document.getElementById('logoClinicaPreview');
  const logoClinicaPlaceholder = document.getElementById('logoClinicaPlaceholder');

  mostrarSeccionConfiguracion(seccionConfiguracionActiva);
  renderSelectorTemas();
  renderizarEtiquetasInformes();

  if (firmaSimpleInput) firmaSimpleInput.value = ajustesApp.firmaSimple || '';
  if (rutMedicoInput) rutMedicoInput.value = formatearRut(ajustesApp.rutMedico || '');
  if (registroMedicoInput) registroMedicoInput.value = ajustesApp.registroMedico || '';
  if (firmaModeSelect) firmaModeSelect.value = ajustesApp.firmaModo === 'png' ? 'png' : 'simple';
  if (direccionClinicaInput) direccionClinicaInput.value = ajustesApp.direccionClinica || '';
  if (telefonoClinicaInput) telefonoClinicaInput.value = ajustesApp.telefonoClinica || '';

  if (firmaPreview) {
    firmaPreview.src = ajustesApp.firmaDigital || '';
    firmaPreview.style.display = ajustesApp.firmaDigital ? 'block' : 'none';
  }

  if (firmaPlaceholder) {
    firmaPlaceholder.style.display = ajustesApp.firmaDigital ? 'none' : 'block';
  }
  if (logoClinicaPreview) {
    logoClinicaPreview.src = ajustesApp.logoClinica || '';
    logoClinicaPreview.style.display = ajustesApp.logoClinica ? 'block' : 'none';
  }
  if (logoClinicaPlaceholder) logoClinicaPlaceholder.style.display = ajustesApp.logoClinica ? 'none' : 'block';
  renderEstadoTutorialConfiguracion();
}

function actualizarVistaPreviaEtiquetaInforme() {
  const nombre = String(document.getElementById('reportLabelName')?.value || '').trim() || 'Nueva etiqueta';
  const color = normalizarColorFondo(document.getElementById('reportLabelColor')?.value, '#4c626c');
  const vistaPrevia = document.getElementById('reportLabelPreview');
  if (!vistaPrevia) return;
  vistaPrevia.textContent = nombre;
  vistaPrevia.style.backgroundColor = color;
  vistaPrevia.style.color = obtenerColorTextoLegible(color);
}

function renderizarEtiquetasInformes() {
  const lista = document.getElementById('reportLabelsList');
  const contador = document.getElementById('reportLabelsCount');
  const nombreInput = document.getElementById('reportLabelName');
  const colorInput = document.getElementById('reportLabelColor');
  if (contador) contador.textContent = `${etiquetasInformes.length} etiqueta${etiquetasInformes.length === 1 ? '' : 's'}`;
  if (nombreInput && nombreInput.dataset.previewBound !== '1') {
    nombreInput.dataset.previewBound = '1';
    nombreInput.addEventListener('input', actualizarVistaPreviaEtiquetaInforme);
  }
  if (colorInput && colorInput.dataset.previewBound !== '1') {
    colorInput.dataset.previewBound = '1';
    colorInput.addEventListener('input', actualizarVistaPreviaEtiquetaInforme);
  }
  actualizarVistaPreviaEtiquetaInforme();
  if (!lista) return;
  if (!etiquetasInformes.length) {
    lista.innerHTML = '<div class="report-labels-empty"><strong>Aún no hay etiquetas.</strong><span>Crea la primera para poder seleccionarla en tus plantillas.</span></div>';
    return;
  }
  lista.innerHTML = etiquetasInformes.map((etiqueta) => {
    const usos = perfilesInformes.filter((perfil) => perfil.identificador?.etiquetaId === etiqueta.id).length;
    return `<article class="report-label-item"><span class="report-label-chip" style="background:${etiqueta.color};color:${etiqueta.colorTexto}">${escaparHTML(etiqueta.nombre)}</span><span class="report-label-meta"><strong>${escaparHTML(etiqueta.nombre)}</strong><small>${etiqueta.color.toUpperCase()} · ${usos} plantilla${usos === 1 ? '' : 's'}</small></span><span class="report-label-actions"><button type="button" onclick="editarEtiquetaInforme('${etiqueta.id}')">Editar</button><button class="is-danger" type="button" onclick="eliminarEtiquetaInforme('${etiqueta.id}')">Eliminar</button></span></article>`;
  }).join('');
}

function guardarEtiquetaInforme(event) {
  event.preventDefault();
  const nombreInput = document.getElementById('reportLabelName');
  const colorInput = document.getElementById('reportLabelColor');
  const idEdicion = document.getElementById('reportLabelEditId')?.value || '';
  const nombre = String(nombreInput?.value || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  if (!nombre) {
    nombreInput?.focus();
    return;
  }
  const color = normalizarColorFondo(colorInput?.value, '#4c626c');
  const duplicada = etiquetasInformes.find((etiqueta) => etiqueta.id !== idEdicion && normalizarTextoBusqueda(etiqueta.nombre) === normalizarTextoBusqueda(nombre));
  if (duplicada) {
    mostrarMensajeApp('Nombre repetido', 'Usa un nombre diferente para distinguir esta etiqueta.', 'info');
    return;
  }
  const existente = etiquetasInformes.find((etiqueta) => etiqueta.id === idEdicion);
  if (existente) {
    Object.assign(existente, normalizarEtiquetaInforme({ ...existente, nombre, color }));
    perfilesInformes.forEach((perfil) => {
      if (perfil.identificador?.etiquetaId !== existente.id) return;
      perfil.identificador.colorFondo = existente.color;
      perfil.identificador.colorTexto = existente.colorTexto;
      perfil.modificadoEn = new Date().toISOString();
    });
    mostrarAvisoBreve(`Etiqueta “${nombre}” actualizada.`);
  } else {
    etiquetasInformes.push(normalizarEtiquetaInforme({ nombre, color }));
    mostrarAvisoBreve(`Etiqueta “${nombre}” creada.`);
  }
  guardarPerfiles();
  cancelarEdicionEtiquetaInforme();
  renderizarEtiquetasInformes();
}

function editarEtiquetaInforme(etiquetaId) {
  const etiqueta = obtenerEtiquetaInforme(etiquetaId);
  if (!etiqueta) return;
  const idInput = document.getElementById('reportLabelEditId');
  const nombreInput = document.getElementById('reportLabelName');
  const colorInput = document.getElementById('reportLabelColor');
  if (idInput) idInput.value = etiqueta.id;
  if (nombreInput) nombreInput.value = etiqueta.nombre;
  if (colorInput) colorInput.value = etiqueta.color;
  const guardar = document.getElementById('reportLabelSaveButton');
  const cancelar = document.getElementById('reportLabelCancelButton');
  if (guardar) guardar.textContent = 'Guardar cambios';
  if (cancelar) cancelar.hidden = false;
  actualizarVistaPreviaEtiquetaInforme();
  nombreInput?.focus();
}

function cancelarEdicionEtiquetaInforme() {
  const idInput = document.getElementById('reportLabelEditId');
  const nombreInput = document.getElementById('reportLabelName');
  const colorInput = document.getElementById('reportLabelColor');
  if (idInput) idInput.value = '';
  if (nombreInput) nombreInput.value = '';
  if (colorInput) colorInput.value = '#4c626c';
  const guardar = document.getElementById('reportLabelSaveButton');
  const cancelar = document.getElementById('reportLabelCancelButton');
  if (guardar) guardar.textContent = 'Crear etiqueta';
  if (cancelar) cancelar.hidden = true;
  actualizarVistaPreviaEtiquetaInforme();
}

async function eliminarEtiquetaInforme(etiquetaId) {
  const etiqueta = obtenerEtiquetaInforme(etiquetaId);
  if (!etiqueta) return;
  const perfilesEnUso = perfilesInformes.filter((perfil) => perfil.identificador?.etiquetaId === etiqueta.id);
  const detalleUso = perfilesEnUso.length ? ` Está usada por ${perfilesEnUso.length} plantilla${perfilesEnUso.length === 1 ? '' : 's'}; conservarán su color actual, pero quedarán sin etiqueta seleccionada.` : '';
  const confirmado = await mostrarDialogoApp({ titulo: 'Eliminar etiqueta', mensaje: `Se eliminará “${etiqueta.nombre}”.${detalleUso}`, tipo: 'danger', confirmar: 'Eliminar', cancelar: 'Conservar' });
  if (!confirmado) return;
  perfilesEnUso.forEach((perfil) => {
    perfil.identificador.etiquetaId = null;
    perfil.modificadoEn = new Date().toISOString();
  });
  etiquetasInformes = etiquetasInformes.filter((item) => item.id !== etiqueta.id);
  guardarPerfiles();
  cancelarEdicionEtiquetaInforme();
  renderizarEtiquetasInformes();
  mostrarAvisoBreve(`Etiqueta “${etiqueta.nombre}” eliminada.`);
}

function cargarLogoClinica(event) {
  const archivo = event.target.files?.[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = () => {
    ajustesApp.logoClinica = String(lector.result || '');
    persistirAjustes();
    renderConfiguracion();
  };
  lector.readAsDataURL(archivo);
}

function eliminarLogoClinica() {
  ajustesApp.logoClinica = '';
  const input = document.getElementById('logoClinicaInput');
  if (input) input.value = '';
  persistirAjustes();
  renderConfiguracion();
}

function cargarFirmaDigital(event) {
  const archivo = event.target.files && event.target.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = () => {
    ajustesApp.firmaDigital = String(lector.result || '');
    persistirAjustes();
    renderConfiguracion();
  };
  lector.readAsDataURL(archivo);
}

function eliminarFirmaDigital() {
  ajustesApp.firmaDigital = '';
  const input = document.getElementById('firmaDigitalInput');
  if (input) input.value = '';
  persistirAjustes();
  renderConfiguracion();
}

function actualizarCredenciales() {
  const firmaSimpleInput = document.getElementById('firmaSimpleInput');
  const rutMedicoInput = document.getElementById('rutMedicoInput');
  const registroMedicoInput = document.getElementById('registroMedicoInput');
  const firmaModeSelect = document.getElementById('firmaModeSelect');
  const direccionClinicaInput = document.getElementById('direccionClinicaInput');
  const telefonoClinicaInput = document.getElementById('telefonoClinicaInput');
  ajustesApp.firmaModo = firmaModeSelect?.value === 'png' ? 'png' : 'simple';
  ajustesApp.firmaSimple = firmaSimpleInput ? firmaSimpleInput.value.trim() : '';
  ajustesApp.rutMedico = rutMedicoInput ? formatearRut(rutMedicoInput.value) : '';
  if (rutMedicoInput) rutMedicoInput.value = ajustesApp.rutMedico;
  ajustesApp.registroMedico = registroMedicoInput ? registroMedicoInput.value.trim() : '';
  ajustesApp.direccionClinica = direccionClinicaInput ? direccionClinicaInput.value.trim() : '';
  ajustesApp.telefonoClinica = telefonoClinicaInput ? telefonoClinicaInput.value.trim() : '';
  persistirAjustes();
}

function mostrarEstadoCredencialesGuardadas() {
  const boton = document.getElementById('guardarCredencialesButton');
  mostrarEstadoBoton(boton);
}

function guardarCredenciales() {
  actualizarCredenciales();
  mostrarEstadoCredencialesGuardadas();
  ejecutarCuandoLibre(() => {
    aplicarCredencialesAlEditor(true);
    aplicarCredencialesYDiplomados();
  });
}

function formatearRut(valor) {
  const limpio = String(valor || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (!limpio) return '';
  const cuerpo = limpio.slice(0, -1);
  const verificador = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return cuerpo ? `${cuerpoFormateado}-${verificador}` : verificador;
}

function manejarInputRut(event) {
  const input = event.target;
  const inicio = input.selectionStart;
  const largoAnterior = input.value.length;
  input.value = formatearRut(input.value);
  const diferencia = input.value.length - largoAnterior;
  const nuevaPosicion = Math.max(0, (inicio || input.value.length) + diferencia);
  input.setSelectionRange(nuevaPosicion, nuevaPosicion);
}

function abrirPlantillaDiplomados() {
  const modal = document.getElementById('diplomados-modal');
  borradorDiplomadosModal = {
    cursados: obtenerDiplomadosCursados(),
    enCurso: obtenerDiplomadosEnCurso()
  };
  if (modal) modal.style.display = 'flex';
  volverSelectorDiplomados();
}

function volverSelectorDiplomados() {
  guardarTipoDiplomadosActivoEnBorrador();
  tipoDiplomadosActivo = null;
  const picker = document.getElementById('diplomasTypePicker');
  const panel = document.getElementById('diplomasFormPanel');
  const rows = document.getElementById('diplomasRows');
  if (picker) picker.style.display = '';
  if (panel) panel.style.display = 'none';
  if (rows) rows.innerHTML = '';
}

function obtenerListaDiplomadosPorTipo(tipo) {
  if (borradorDiplomadosModal) {
    return tipo === 'enCurso' ? borradorDiplomadosModal.enCurso : borradorDiplomadosModal.cursados;
  }
  return tipo === 'enCurso' ? obtenerDiplomadosEnCurso() : obtenerDiplomadosCursados();
}

function asignarListaDiplomadosPorTipo(tipo, lista) {
  if (tipo === 'enCurso') {
    ajustesApp.diplomadosEnCurso = normalizarListaDiplomados(lista);
  } else {
    ajustesApp.diplomadosCursados = normalizarListaDiplomados(lista);
  }
}

function abrirEditorDiplomadosTipo(tipo) {
  guardarTipoDiplomadosActivoEnBorrador();
  tipoDiplomadosActivo = tipo === 'enCurso' ? 'enCurso' : 'cursados';
  const picker = document.getElementById('diplomasTypePicker');
  const panel = document.getElementById('diplomasFormPanel');
  const title = document.getElementById('diplomasFormTitle');
  const help = document.getElementById('diplomasFormHelp');
  if (picker) picker.style.display = 'none';
  if (panel) panel.style.display = '';
  if (title) title.textContent = tipoDiplomadosActivo === 'enCurso' ? 'Diplomados en curso' : 'Diplomados cursados';
  if (help) {
    help.textContent = tipoDiplomadosActivo === 'enCurso'
      ? 'Agrega los diplomados que estan actualmente en curso.'
      : 'Agrega los diplomados ya cursados y su institucion.';
  }
  renderFilasDiplomados(obtenerListaDiplomadosPorTipo(tipoDiplomadosActivo));
}

function guardarTipoDiplomadosActivoEnBorrador() {
  if (!borradorDiplomadosModal || !tipoDiplomadosActivo) return;
  const lista = normalizarListaDiplomados(leerFilasDiplomados());
  if (tipoDiplomadosActivo === 'enCurso') {
    borradorDiplomadosModal.enCurso = lista;
  } else {
    borradorDiplomadosModal.cursados = lista;
  }
}

function renderFilasDiplomados(lista) {
  const rows = document.getElementById('diplomasRows');
  if (!rows) return;
  const items = normalizarListaDiplomados(lista);
  rows.innerHTML = '';
  if (items.length === 0) {
    agregarFilaDiplomado('', '');
    return;
  }
  items.forEach((item) => agregarFilaDiplomado(item.diplomado, item.institucion));
}

function agregarFilaDiplomado(diplomado = '', institucion = '') {
  const rows = document.getElementById('diplomasRows');
  if (!rows) return;
  const fila = document.createElement('div');
  fila.className = 'diplomas-form-row';
  fila.innerHTML = [
    '<label class="credential-field">',
    '  <span>Diplomado</span>',
    `  <input class="config-input" data-diploma-field="diplomado" type="text" value="${escaparHTML(diplomado)}" />`,
    '</label>',
    '<label class="credential-field">',
    '  <span>Institución</span>',
    `  <input class="config-input" data-diploma-field="institucion" type="text" value="${escaparHTML(institucion)}" />`,
    '</label>',
    '<button class="config-btn config-btn-danger" type="button" onclick="eliminarFilaDiplomado(event)">Eliminar</button>'
  ].join('');
  rows.appendChild(fila);
  const primerInput = fila.querySelector('input');
  if (!diplomado && !institucion && primerInput) {
    window.requestAnimationFrame(() => primerInput.focus());
  }
}

function eliminarFilaDiplomado(event) {
  const fila = event && event.target ? event.target.closest('.diplomas-form-row') : null;
  if (fila) fila.remove();
}

function leerFilasDiplomados() {
  return Array.from(document.querySelectorAll('#diplomasRows .diplomas-form-row')).map((fila) => {
    const diplomado = fila.querySelector('[data-diploma-field="diplomado"]');
    const institucion = fila.querySelector('[data-diploma-field="institucion"]');
    return {
      diplomado: diplomado ? diplomado.value : '',
      institucion: institucion ? institucion.value : ''
    };
  });
}

function guardarDiplomadosConfiguracion() {
  const boton = document.getElementById('guardarDiplomadosButton');
  if (!tipoDiplomadosActivo) {
    mostrarEstadoBoton(boton, 'Selecciona un tipo');
    return;
  }
  guardarTipoDiplomadosActivoEnBorrador();
  asignarListaDiplomadosPorTipo('cursados', borradorDiplomadosModal ? borradorDiplomadosModal.cursados : []);
  asignarListaDiplomadosPorTipo('enCurso', borradorDiplomadosModal ? borradorDiplomadosModal.enCurso : []);
  ajustesApp.diplomadosPrincipal = crearTextoDiplomadosDesdeLista(ajustesApp.diplomadosCursados);
  ajustesApp.diplomadosLateral = crearTextoDiplomadosDesdeLista(ajustesApp.diplomadosEnCurso);
  persistirAjustes();
  borradorDiplomadosModal = {
    cursados: obtenerDiplomadosCursados(),
    enCurso: obtenerDiplomadosEnCurso()
  };
  mostrarEstadoBoton(boton);
  cerrarPlantillaDiplomados();
  ejecutarCuandoLibre(() => {
    aplicarCredencialesYDiplomados();
    aplicarLayoutInforme();
  });
}

function prepararCampoDiplomados(campo, texto, zona = 'principal') {
  if (!campo) return;
  campo.classList.remove('is-loading');
  campo.contentEditable = 'false';
  campo.setAttribute('role', 'textbox');
  campo.setAttribute('aria-multiline', 'true');
  renderEditorDiplomados(campo, texto, zona);
  if (!campo.dataset.diplomasEditableBound) {
    campo.addEventListener('keydown', (event) => manejarTeclaEditorDiplomados(event, campo, zona));
    campo.addEventListener('input', (event) => manejarInputEditorDiplomados(event, campo, zona));
    campo.addEventListener('focusin', (event) => manejarEnfoqueEditorDiplomados(event, campo));
    campo.dataset.diplomasEditableBound = '1';
  }
}

function renderEditorDiplomados(campo, texto, zona = 'principal') {
  const lineas = String(texto || '').split('\n');
  campo.innerHTML = '';
  const lineasRender = lineas.length === 1 && lineas[0] === '' ? [''] : lineas;
  lineasRender.forEach((linea, indice) => {
    campo.appendChild(crearFilaEditorDiplomados(linea, zona, indice + 1));
  });
  if (lineasRender.length === 0) {
    campo.appendChild(crearFilaEditorDiplomados('', zona, 1));
  }
  actualizarNumerosLineasEditorDiplomados(campo);
}

function crearFilaEditorDiplomados(valor = '', zona = 'principal', indice = 1) {
  const fila = document.createElement('div');
  fila.className = 'diploma-edit-row';
  fila.dataset.lineIndex = String(indice);

  const marcador = document.createElement('span');
  marcador.className = 'diploma-marker';
  marcador.setAttribute('aria-hidden', 'true');

  const texto = document.createElement('span');
  texto.className = 'diploma-edit-text';
  texto.contentEditable = 'true';
  texto.setAttribute('data-line-editor', 'true');
  texto.setAttribute('data-line-index', String(indice));
  texto.setAttribute('data-line-zone', zona);
  texto.spellcheck = true;
  texto.innerText = valor || '';

  fila.appendChild(marcador);
  fila.appendChild(texto);
  actualizarEstiloFilaDiplomados(fila, zona);
  return fila;
}

function obtenerLineaEditableActiva(target, contenedor) {
  if (!target) return null;
  if (target.matches && target.matches('[data-line-editor]')) return target;
  return target.closest ? target.closest('[data-line-editor]') : null;
}

function obtenerLineasEditorDiplomados(campo) {
  return Array.from(campo.querySelectorAll('[data-line-editor]'));
}

function obtenerTextoEditorDiplomados(campo) {
  return obtenerLineasEditorDiplomados(campo)
    .map((linea) => (linea.innerText || '').replace(/\u00a0/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n+$/g, '');
}

function manejarEnfoqueEditorDiplomados(event, contenedor) {
  const linea = obtenerLineaEditableActiva(event.target, contenedor);
  if (!linea) return;
  ultimaLineaDiplomadosActiva = linea;
  const rango = document.createRange();
  const seleccion = window.getSelection();
  if (!linea.firstChild) {
    linea.appendChild(document.createTextNode(''));
  }
  rango.selectNodeContents(linea);
  rango.collapse(false);
  seleccion.removeAllRanges();
  seleccion.addRange(rango);
}

function manejarTeclaEditorDiplomados(event, contenedor, zona) {
  const linea = obtenerLineaEditableActiva(event.target, contenedor);
  if (!linea) return;

  if (event.key === 'Enter') {
    event.preventDefault();
    insertarNuevaLineaEditorDiplomados(linea, contenedor, zona);
    return;
  }

  if (event.key === 'Backspace' && esLineaVacia(linea)) {
    const anterior = linea.previousElementSibling?.querySelector('[data-line-editor]');
    if (anterior) {
      event.preventDefault();
      eliminarLineaEditorDiplomados(linea, contenedor);
      moverCursorFinal(anterior);
    }
  }
}

function manejarInputEditorDiplomados(event, contenedor, zona) {
  const linea = obtenerLineaEditableActiva(event.target, contenedor);
  if (!linea) return;
  actualizarEstiloFilaDiplomados(linea.closest('.diploma-edit-row'), zona);
}

function insertarNuevaLineaEditorDiplomados(lineaActual, contenedor, zona = 'principal') {
  const filaActual = lineaActual.closest('.diploma-edit-row');
  const nuevaFila = crearFilaEditorDiplomados('', zona, obtenerLineasEditorDiplomados(contenedor).length + 1);
  filaActual.insertAdjacentElement('afterend', nuevaFila);
  const nuevaLinea = nuevaFila.querySelector('[data-line-editor]');
  moverCursorFinal(nuevaLinea);
  actualizarNumerosLineasEditorDiplomados(contenedor);
}

function eliminarLineaEditorDiplomados(linea, contenedor) {
  const fila = linea.closest('.diploma-edit-row');
  if (!fila) return;
  fila.remove();
  if (!contenedor.querySelector('[data-line-editor]')) {
    contenedor.appendChild(crearFilaEditorDiplomados('', contenedor.id === 'diplomadosLateralInput' ? 'lateral' : 'principal', 1));
  }
  actualizarNumerosLineasEditorDiplomados(contenedor);
}

function esLineaVacia(linea) {
  return String(linea.innerText || '').replace(/\u00a0/g, ' ').trim().length === 0;
}

function moverCursorFinal(linea) {
  if (!linea) return;
  linea.focus();
  const texto = document.createTextNode(linea.innerText || '');
  if (!linea.firstChild) {
    linea.appendChild(texto);
  }
  const rango = document.createRange();
  const seleccion = window.getSelection();
  rango.selectNodeContents(linea);
  rango.collapse(false);
  seleccion.removeAllRanges();
  seleccion.addRange(rango);
}

function actualizarEstiloLineaDiplomados(linea, zona = 'principal') {
  actualizarEstiloFilaDiplomados(linea ? linea.closest('.diploma-edit-row') : null, zona);
}

function actualizarEstiloFilaDiplomados(fila, zona = 'principal') {
  if (!fila) return;
  const linea = fila.querySelector('[data-line-editor]');
  const texto = (linea ? linea.innerText : '').replace(/\u00a0/g, ' ').trim();
  const marker = fila.querySelector('.diploma-marker');
  const usarMarcador = Boolean(texto);

  fila.classList.toggle('diploma-line-empty', !texto);
  fila.classList.remove('diploma-line-title', 'diploma-line-with-comma', 'diploma-line-no-marker');
  fila.classList.toggle('diploma-zone-lateral', zona === 'lateral');
  fila.classList.toggle('diploma-zone-principal', zona !== 'lateral');
  if (marker) marker.style.visibility = usarMarcador ? 'visible' : 'hidden';
}

function actualizarNumerosLineasEditorDiplomados(contenedor) {
  obtenerLineasEditorDiplomados(contenedor).forEach((linea, index) => {
    const fila = linea.closest('.diploma-edit-row');
    if (fila) fila.dataset.lineIndex = String(index + 1);
    linea.dataset.lineIndex = String(index + 1);
    actualizarEstiloFilaDiplomados(fila, contenedor.id === 'diplomadosLateralInput' ? 'lateral' : 'principal');
  });
}

function cerrarPlantillaDiplomados() {
  const modal = document.getElementById('diplomados-modal');
  if (modal) modal.style.display = 'none';
  tipoDiplomadosActivo = null;
  borradorDiplomadosModal = null;
}

function guardarPlantillaDiplomados() {
  const principal = document.getElementById('diplomadosPrincipalInput');
  const lateral = document.getElementById('diplomadosLateralInput');
  const lineaActiva = ultimaLineaDiplomadosActiva && document.body.contains(ultimaLineaDiplomadosActiva)
    ? ultimaLineaDiplomadosActiva
    : null;
  const boton = document.getElementById('guardarDiplomadosButton');
  ajustesApp.diplomadosPrincipal = principal ? obtenerTextoEditorDiplomados(principal) : '';
  ajustesApp.diplomadosLateral = lateral ? obtenerTextoEditorDiplomados(lateral) : '';
  persistirAjustes();
  mostrarEstadoBoton(boton);
  if (lineaActiva) {
    window.requestAnimationFrame(() => moverCursorFinal(lineaActiva));
  }
  ejecutarCuandoLibre(() => {
    aplicarCredencialesYDiplomados();
    aplicarLayoutInforme();
  });
}

function obtenerAbreviaturaAntesDelCursor(campo) {
  if (!campo || typeof campo.selectionStart !== 'number') return null;
  const cursor = campo.selectionStart;
  const textoAnterior = campo.value.slice(0, cursor);
  const coincidencia = textoAnterior.match(/(^|\s)(\S+)$/);
  if (!coincidencia) return null;
  const abreviatura = coincidencia[2];
  return {
    abreviatura,
    inicio: cursor - abreviatura.length,
    fin: cursor
  };
}

function notificarCambioCampoInforme(campo) {
  if (!campo) return;
  const key = campo.dataset.reportField;
  if (key === 'resultados') {
    manejarInputResultados(campo);
    return;
  }
  if (key === 'observaciones') {
    ajustarPaginaConclusion(campo.closest('.body-conclusion-page') || document);
    return;
  }
  if (key === 'conclusion') {
    ajustarPaginaConclusion(campo.closest('.body-conclusion-page') || document);
    return;
  }
  if (esCampoPaginado(campo)) {
    repaginarCampoInformeConDebounce(key);
    return;
  }
  if (key === 'antecedentes') {
    limitarCampoPorAltura(campo);
    return;
  }
  ajustarAlturaCampoInforme(campo);
}

function esCampoInformeEditable(campo) {
  return Boolean(
    campo
    && campo.matches
    && campo.matches('#editor-view [data-report-field]')
    && !campo.readOnly
    && !campo.disabled
    && ['TEXTAREA', 'INPUT'].includes(campo.tagName)
  );
}

function esCampoInformeFormateable(campo) {
  return Boolean(
    campo
    && campo.matches
    && campo.matches('#editor-view [data-report-field]')
    && !campo.disabled
    && ['TEXTAREA', 'INPUT'].includes(campo.tagName)
    && !['medico', 'rutMedico', 'registroMedico'].includes(campo.dataset.reportField)
  );
}

function manejarInputPaginaConclusion(event) {
  const campo = event.target;
  if (!campo || !campo.matches || !campo.matches('#editor-view [data-report-field="conclusion"], #editor-view [data-report-field="observaciones"]')) return;
  if (event.type === 'beforeinput') {
    bloquearInputSiNoCabe(campo, event);
    return;
  }
  ajustarPaginaConclusion(campo.closest('.body-conclusion-page') || document);
}

function obtenerToolbarFormatoTexto() {
  let toolbar = document.getElementById('textFormatToolbar');
  if (toolbar) return toolbar;
  toolbar = document.createElement('div');
  toolbar.id = 'textFormatToolbar';
  toolbar.className = 'text-format-toolbar';
  toolbar.innerHTML = [
    '<button type="button" data-format-action="bold" title="Negrita"><strong>B</strong></button>',
    '<button type="button" data-format-action="italic" title="Cursiva"><em>I</em></button>',
    '<button type="button" data-format-action="underline" title="Subrayado"><span class="format-underlined">U</span></button>'
  ].join('');
  toolbar.addEventListener('mousedown', (event) => event.preventDefault());
  toolbar.addEventListener('click', (event) => {
    const boton = event.target.closest('[data-format-action]');
    if (!boton) return;
    aplicarFormatoSeleccionTexto(boton.dataset.formatAction);
  });
  document.body.appendChild(toolbar);
  return toolbar;
}

function ocultarToolbarFormatoTexto() {
  const toolbar = document.getElementById('textFormatToolbar');
  if (toolbar) toolbar.style.display = 'none';
}

function mostrarToolbarFormatoTexto(campo) {
  if (!esCampoInformeFormateable(campo) || campo.selectionStart === campo.selectionEnd) {
    ocultarToolbarFormatoTexto();
    return;
  }
  const toolbar = obtenerToolbarFormatoTexto();
  const rect = campo.getBoundingClientRect();
  const seleccionado = campo.value.slice(campo.selectionStart, campo.selectionEnd);
  seleccionFormatoTexto = {
    campo,
    inicio: campo.selectionStart,
    fin: campo.selectionEnd
  };
  toolbar.dataset.targetField = campo.dataset.reportField || '';
  toolbar.querySelectorAll('[data-format-action]').forEach((boton) => {
    boton.classList.toggle('is-active', seleccionTieneFormato(seleccionado, boton.dataset.formatAction));
  });
  toolbar.style.display = 'flex';
  toolbar.style.left = `${Math.min(window.innerWidth - 150, Math.max(12, rect.left + 12))}px`;
  toolbar.style.top = `${Math.max(12, rect.top - 44)}px`;
}

function guardarSeleccionFormatoTexto(campo) {
  if (!esCampoInformeFormateable(campo) || campo.selectionStart === campo.selectionEnd) return false;
  seleccionFormatoTexto = {
    campo,
    inicio: campo.selectionStart,
    fin: campo.selectionEnd
  };
  return true;
}

function obtenerCampoSeleccionFormato() {
  const activo = document.activeElement;
  if (guardarSeleccionFormatoTexto(activo)) return activo;
  if (
    seleccionFormatoTexto
    && document.contains(seleccionFormatoTexto.campo)
    && seleccionFormatoTexto.inicio !== seleccionFormatoTexto.fin
  ) {
    return seleccionFormatoTexto.campo;
  }
  return null;
}

function obtenerMapasFormatoTexto() {
  if (obtenerMapasFormatoTexto.cache) return obtenerMapasFormatoTexto.cache;
  const mayusculas = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const minusculas = Array.from('abcdefghijklmnopqrstuvwxyz');
  const normales = mayusculas.concat(minusculas);
  const crearAlfabetoMatematico = (inicioMayusculas, inicioMinusculas) => mayusculas
    .map((_, index) => String.fromCodePoint(inicioMayusculas + index))
    .concat(minusculas.map((_, index) => String.fromCodePoint(inicioMinusculas + index)));
  const negritas = crearAlfabetoMatematico(0x1D5D4, 0x1D5EE);
  const cursivas = crearAlfabetoMatematico(0x1D608, 0x1D622);
  const negritasCursivas = crearAlfabetoMatematico(0x1D63C, 0x1D656);
  obtenerMapasFormatoTexto.cache = {
    normal: normales,
    bold: negritas,
    italic: cursivas,
    boldItalic: negritasCursivas,
    toBold: new Map(normales.map((char, index) => [char, negritas[index]])),
    toItalic: new Map(normales.map((char, index) => [char, cursivas[index]])),
    toBoldItalic: new Map(normales.map((char, index) => [char, negritasCursivas[index]])),
    fromBold: new Map(negritas.map((char, index) => [char, normales[index]])),
    fromItalic: new Map(cursivas.map((char, index) => [char, normales[index]])),
    fromBoldItalic: new Map(negritasCursivas.map((char, index) => [char, normales[index]]))
  };
  return obtenerMapasFormatoTexto.cache;
}

function quitarSubrayadoTexto(texto) {
  return String(texto || '').replace(/\u0332/g, '');
}

function separarGraphemesFormato(texto) {
  const partes = [];
  for (const char of Array.from(String(texto || '').normalize('NFD'))) {
    if (/[\u0300-\u036f]/.test(char) && partes.length > 0) {
      partes[partes.length - 1] += char;
    } else {
      partes.push(char);
    }
  }
  return partes;
}

function obtenerBaseYMarcasFormato(grapheme) {
  const sinSubrayado = String(grapheme || '').replace(/\u0332/g, '');
  const chars = Array.from(sinSubrayado);
  return {
    base: chars[0] || '',
    marcas: chars.slice(1).join('')
  };
}

function obtenerEstadoBaseFormato(base) {
  const mapas = obtenerMapasFormatoTexto();
  if (mapas.fromBoldItalic.has(base)) return { normal: mapas.fromBoldItalic.get(base), bold: true, italic: true };
  if (mapas.fromBold.has(base)) return { normal: mapas.fromBold.get(base), bold: true, italic: false };
  if (mapas.fromItalic.has(base)) return { normal: mapas.fromItalic.get(base), bold: false, italic: true };
  return { normal: base, bold: false, italic: false };
}

function convertirBaseConEstado(normal, boldActivo, italicActivo) {
  const mapas = obtenerMapasFormatoTexto();
  if (boldActivo && italicActivo) return mapas.toBoldItalic.get(normal) || normal;
  if (boldActivo) return mapas.toBold.get(normal) || normal;
  if (italicActivo) return mapas.toItalic.get(normal) || normal;
  return normal;
}

function quitarEstiloTexto(texto, estilo) {
  if (estilo === 'underline') return quitarSubrayadoTexto(texto);
  return separarGraphemesFormato(texto).map((grapheme) => {
    const { base, marcas } = obtenerBaseYMarcasFormato(grapheme);
    const estado = obtenerEstadoBaseFormato(base);
    const boldActivo = estilo === 'bold' ? false : estado.bold;
    const italicActivo = estilo === 'italic' ? false : estado.italic;
    return `${convertirBaseConEstado(estado.normal, boldActivo, italicActivo)}${marcas}`;
  }).join('').normalize('NFC');
}

function aplicarEstiloTexto(texto, estilo) {
  if (estilo === 'underline') {
    return separarGraphemesFormato(quitarSubrayadoTexto(texto))
      .map((grapheme) => /\s/.test(grapheme) ? grapheme : `${grapheme}\u0332`)
      .join('');
  }
  return separarGraphemesFormato(texto).map((grapheme) => {
    const { base, marcas } = obtenerBaseYMarcasFormato(grapheme);
    const estado = obtenerEstadoBaseFormato(base);
    const boldActivo = estilo === 'bold' ? true : estado.bold;
    const italicActivo = estilo === 'italic' ? true : estado.italic;
    return `${convertirBaseConEstado(estado.normal, boldActivo, italicActivo)}${marcas}`;
  }).join('');
}

function seleccionTieneFormato(texto, estilo) {
  const graphemes = separarGraphemesFormato(texto).filter((grapheme) => !/\s/.test(grapheme.replace(/\u0332/g, '')));
  if (graphemes.length === 0) return false;
  if (estilo === 'underline') {
    return graphemes.every((grapheme) => grapheme.includes('\u0332'));
  }
  return graphemes.every((grapheme) => {
    const { base } = obtenerBaseYMarcasFormato(grapheme);
    const estado = obtenerEstadoBaseFormato(base);
    return estilo === 'bold' ? estado.bold : estado.italic;
  });
}

function convertirTextoEstilizado(texto, estilo) {
  return seleccionTieneFormato(texto, estilo)
    ? quitarEstiloTexto(texto, estilo)
    : aplicarEstiloTexto(texto, estilo);
}

function aplicarFormatoSeleccionTexto(estilo) {
  const campo = obtenerCampoSeleccionFormato();
  if (!campo || !seleccionFormatoTexto) return;
  const inicio = seleccionFormatoTexto.inicio;
  const fin = seleccionFormatoTexto.fin;
  if (inicio === fin) return;
  const seleccionado = campo.value.slice(inicio, fin);
  const reemplazo = convertirTextoEstilizado(seleccionado, estilo);
  registrarEstadoEditorParaDeshacer();
  campo.setRangeText(reemplazo, inicio, fin, 'select');
  notificarCambioCampoInforme(campo);
  campo.focus();
  campo.setSelectionRange(inicio, inicio + reemplazo.length);
  seleccionFormatoTexto = {
    campo,
    inicio,
    fin: inicio + reemplazo.length
  };
  mostrarToolbarFormatoTexto(campo);
}

function manejarSeleccionTextoInforme(event) {
  const campo = event.target && event.target.closest
    ? event.target.closest('#editor-view [data-report-field]')
    : event.target;
  guardarSeleccionFormatoTexto(campo);
  mostrarToolbarFormatoTexto(campo);
}

function manejarClickFormatoTexto(event) {
  const toolbar = document.getElementById('textFormatToolbar');
  const dentroToolbar = toolbar && toolbar.contains(event.target);
  const campo = event.target && event.target.closest ? event.target.closest('#editor-view [data-report-field]') : null;
  if (!dentroToolbar && !campo) {
    ocultarToolbarFormatoTexto();
    seleccionFormatoTexto = null;
  }
}

window.showEditor = showEditor;
window.showDashboard = showDashboard;
window.showHistorial = showHistorial;
window.showPapelera = showPapelera;
window.showConfiguracion = showConfiguracion;
window.crearNuevoInforme = crearNuevoInforme;
window.volverDesdeDisenador = volverDesdeDisenador;
window.actualizarVistaPreviaDisenador = actualizarVistaPreviaDisenador;
window.iniciarArrastreFoto = iniciarArrastreFoto;
window.permitirSoltarFoto = permitirSoltarFoto;
window.salirZonaFoto = salirZonaFoto;
window.soltarFotoPerfil = soltarFotoPerfil;
window.finalizarArrastreFoto = finalizarArrastreFoto;
window.iniciarReencuadreImagen = iniciarReencuadreImagen;
window.centrarImagenInforme = centrarImagenInforme;
window.agregarHojaEnBlanco = agregarHojaEnBlanco;
window.seleccionarHojaDisenador = seleccionarHojaDisenador;
window.iniciarArrastreBloque = iniciarArrastreBloque;
window.iniciarRedimensionBloque = iniciarRedimensionBloque;
window.seleccionarBloqueDisenador = seleccionarBloqueDisenador;
window.cerrarOpcionesBloqueDisenador = cerrarOpcionesBloqueDisenador;
window.actualizarOpcionBloqueDisenador = actualizarOpcionBloqueDisenador;
window.cambiarCapaBloqueDisenador = cambiarCapaBloqueDisenador;
window.cambiarColorFiguraDisenador = cambiarColorFiguraDisenador;
window.actualizarTextoBloqueDisenador = actualizarTextoBloqueDisenador;
window.actualizarDimensionTablaDisenador = actualizarDimensionTablaDisenador;
window.eliminarPaginaPlantilla = eliminarPaginaPlantilla;
window.restaurarPaginaPlantilla = restaurarPaginaPlantilla;
window.eliminarPaginaPlantillaDefinitivamente = eliminarPaginaPlantillaDefinitivamente;
window.cambiarAjusteCuadricula = cambiarAjusteCuadricula;
window.alternarPanelPaginasEliminadas = alternarPanelPaginasEliminadas;
window.restaurarPaginaInformePorId = restaurarPaginaInformePorId;
window.exportarPlantillas = exportarPlantillas;
window.importarPlantillas = importarPlantillas;
window.guardarBorradorInforme = guardarBorradorInforme;
window.mostrarVistaPreviaPDF = mostrarVistaPreviaPDF;
window.cerrarVistaPreviaPDF = cerrarVistaPreviaPDF;
window.guardarInformePDF = guardarInformePDF;
window.volverDesdeEditor = volverDesdeEditor;
window.abrirInforme = abrirInforme;
window.limpiarFiltrosHistorial = limpiarFiltrosHistorial;
window.restablecerAjustes = restablecerAjustes;
window.agregarImagenesInforme = agregarImagenesInforme;
window.quitarImagenInforme = quitarImagenInforme;
window.guardarCredenciales = guardarCredenciales;
window.abrirPlantillaDiplomados = abrirPlantillaDiplomados;
window.cerrarPlantillaDiplomados = cerrarPlantillaDiplomados;
window.guardarPlantillaDiplomados = guardarPlantillaDiplomados;
window.abrirEditorDiplomadosTipo = abrirEditorDiplomadosTipo;
window.volverSelectorDiplomados = volverSelectorDiplomados;
window.agregarFilaDiplomado = agregarFilaDiplomado;
window.eliminarFilaDiplomado = eliminarFilaDiplomado;
window.guardarDiplomadosConfiguracion = guardarDiplomadosConfiguracion;
window.eliminarFirmaDigital = eliminarFirmaDigital;
window.eliminarLogoClinica = eliminarLogoClinica;
window.actualizarIdentidadBloqueDisenador = actualizarIdentidadBloqueDisenador;
window.eliminarInforme = eliminarInforme;
window.restaurarInformePapelera = restaurarInformePapelera;
window.eliminarInformeDefinitivo = eliminarInformeDefinitivo;
window.vaciarPapeleraInformes = vaciarPapeleraInformes;
window.seleccionarInformeDashboard = seleccionarInformeDashboard;
window.seleccionarInformeHistorial = seleccionarInformeHistorial;
window.seleccionarInformePapelera = seleccionarInformePapelera;
window.manejarTeclaFilaInforme = manejarTeclaFilaInforme;
window.manejarTeclaFilaHistorial = manejarTeclaFilaHistorial;
window.manejarTeclaFilaPapelera = manejarTeclaFilaPapelera;
window.abrirInformeDesdeListado = abrirInformeDesdeListado;
window.restaurarParametrosPortada = restaurarParametrosPortada;
window.deshacerCambioEditor = deshacerCambioEditor;
window.rehacerCambioEditor = rehacerCambioEditor;
window.responderConfirmacionBorrador = responderConfirmacionBorrador;

function duplicarInformeParaPaciente(informeId) {
  const origen = obtenerInformePorId(informeId);
  if (!origen) return;
  const datos = clonarDatosEditor(origen.datos || {});
  datos.fecha = formatearFechaISO(new Date());
  datos.imagenes = [];
  const copia = {
    id: `INF-${Date.now()}`,
    creadoEn: new Date().toISOString(),
    actualizado: new Date().toISOString(),
    estado: 'Borrador',
    datos
  };
  showEditor();
  cargarInformeEnEditor(copia);
  mostrarAvisoBreve('Se creó un borrador desde el informe anterior. Revisa fecha, hallazgos y conclusión.');
}

function restaurarRevisionInforme(snapshot) {
  if (!snapshot?.id) return;
  const actual = obtenerInformePorId(snapshot.id);
  if (actual) window.registrarRevisionInforme?.(actual, 'Antes de restaurar una versión');
  const restaurado = {
    ...clonarProfundo(snapshot),
    estado: 'Borrador',
    completadoEn: '',
    actualizado: new Date().toISOString()
  };
  const indice = estadoDashboard.informes.findIndex((item) => item.id === restaurado.id);
  if (indice < 0) estadoDashboard.informes.push(restaurado);
  else estadoDashboard.informes[indice] = restaurado;
  persistirInformes();
  showEditor();
  cargarInformeEnEditor(restaurado);
}

window.__appBridge = {
  getCurrentReportData: () => leerInformeDesdeEditor(),
  getCurrentReportId: () => informeActivoId,
  getSettings: () => ({ ...ajustesApp }),
  hasVisibleReportBlocks: () => !informeLayoutActivo.perfilId || informeLayoutActivo.bloques.some((bloque) => bloque.visible !== false),
  finalizeCurrentReport: () => {
    const datos = leerInformeDesdeEditor();
    guardarInformeCompletado(datos, datos.paciente || 'informe', obtenerHoraCreacionInformeActivo());
  },
  duplicateReport: duplicarInformeParaPaciente,
  restoreReportRevision: restaurarRevisionInforme,
  markCurrentReportExported: (filePath) => {
    const informe = obtenerInformePorId(informeActivoId);
    if (!informe) return;
    informe.exportadoEn = new Date().toISOString();
    informe.ultimoPDF = String(filePath || '');
    persistirInformes();
    renderDashboard();
  },
  refreshDashboard: () => renderDashboard()
};

function renderDashboard() {
  const informesCount = document.getElementById('informesCount');
  const informesCaption = document.getElementById('informesCaption');
  const plantillasCount = document.getElementById('plantillasCount');
  const plantillasCaption = document.getElementById('plantillasCaption');
  const draftsCount = document.getElementById('draftsCount');
  const draftsCaption = document.getElementById('draftsCaption');
  const completedWeekCount = document.getElementById('completedWeekCount');
  const pendingExportCount = document.getElementById('pendingExportCount');
  const pendingExportCaption = document.getElementById('pendingExportCaption');
  const activityBody = document.getElementById('activityBody');
  const activityBadge = document.querySelector('.activity-badge');
  const terminoBusqueda = obtenerBusquedaDashboard();
  const hayBusqueda = Boolean(normalizarTextoBusqueda(terminoBusqueda));

  const totalInformes = estadoDashboard.informes.length;
  const totalBorradores = estadoDashboard.informes.filter((informe) => informe.estado === 'Borrador').length;
  const limiteSemana = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const totalCompletadosSemana = estadoDashboard.informes.filter((informe) => informe.estado === 'Completado' && new Date(informe.completadoEn || informe.actualizado || 0).getTime() >= limiteSemana).length;
  const totalPendientesExportar = estadoDashboard.informes.filter((informe) => informe.estado === 'Completado' && !informe.exportadoEn).length;
  if (draftsCount) draftsCount.textContent = String(totalBorradores);
  if (draftsCaption) draftsCaption.textContent = totalBorradores ? `${totalBorradores} informe${totalBorradores === 1 ? '' : 's'} por continuar.` : 'Sin trabajo pendiente.';
  if (completedWeekCount) completedWeekCount.textContent = String(totalCompletadosSemana);
  if (pendingExportCount) pendingExportCount.textContent = String(totalPendientesExportar);
  if (pendingExportCaption) pendingExportCaption.textContent = totalPendientesExportar ? `${totalPendientesExportar} informe${totalPendientesExportar === 1 ? '' : 's'} completado${totalPendientesExportar === 1 ? '' : 's'} sin exportar.` : 'Todo lo completado está exportado.';
  if (informesCount) informesCount.textContent = String(totalInformes);
  if (informesCaption) {
    const totalCoincidencias = hayBusqueda
      ? estadoDashboard.informes.filter((informe) => informeCoincideBusqueda(informe, terminoBusqueda)).length
      : totalInformes;
    informesCaption.textContent = hayBusqueda
      ? totalCoincidencias === 1
        ? '1 informe coincide con la busqueda.'
        : `${totalCoincidencias} informes coinciden con la busqueda.`
      : totalInformes === 0
      ? 'Sin actividad reciente registrada.'
      : totalInformes === 1
        ? '1 informe creado.'
        : `${totalInformes} informes creados.`;
  }

  const totalPlantillas = perfilesInformes.length;
  if (plantillasCount) plantillasCount.textContent = String(totalPlantillas);
  if (plantillasCaption) {
    plantillasCaption.textContent = totalPlantillas === 0
      ? 'Aún no hay plantillas creadas.'
      : totalPlantillas === 1
        ? '1 plantilla creada.'
        : `${totalPlantillas} plantillas creadas.`;
  }

  if (!activityBody) return;

  const informesMostrados = estadoDashboard.informes
    .filter((informe) => {
      if (hayBusqueda) return informeCoincideBusqueda(informe, terminoBusqueda);
      return true;
    })
    .sort((a, b) => {
      const fechaA = obtenerFechaActividad(a);
      const fechaB = obtenerFechaActividad(b);
      const tiempoA = fechaA ? fechaA.getTime() : 0;
      const tiempoB = fechaB ? fechaB.getTime() : 0;
      return tiempoB - tiempoA;
    });

  if (activityBadge) activityBadge.textContent = hayBusqueda ? 'Búsqueda' : 'Todos';

  if (informesMostrados.length === 0) {
    activityBody.innerHTML = [
      '<div class="activity-empty">',
      hayBusqueda ? '  No hay informes que coincidan con la búsqueda.' : '  Aún no hay informes guardados.',
      '</div>'
    ].join('');
    renderizarPaginacion('dashboardPagination', 'dashboard', 0, TAMANOS_PAGINA.dashboard);
    return;
  }

  const pagina = obtenerPaginaValida(paginasListados.dashboard, informesMostrados.length, TAMANOS_PAGINA.dashboard);
  paginasListados.dashboard = pagina;
  const inicioPagina = (pagina - 1) * TAMANOS_PAGINA.dashboard;
  const informesPagina = informesMostrados.slice(inicioPagina, inicioPagina + TAMANOS_PAGINA.dashboard);
  activityBody.innerHTML = informesPagina
    .map((informe) => {
      const claseEstado = informe.estado === 'Completado' ? 'ok' : 'warn';
      return [
        `<div class="table-row dashboard-report-row" role="row" tabindex="0" data-dashboard-report-id="${informe.id || ''}" onclick="seleccionarInformeDashboard(event, '${informe.id || ''}')" ondblclick="abrirInformeDesdeListado('${informe.id || ''}', event)" onkeydown="manejarTeclaFilaInforme(event, '${informe.id || ''}')">`,
        `  <span title="${escaparHTML(informe.id || '')}">${escaparHTML(informe.nombre || informe.id || 'Sin nombre')}</span>`,
        `  <span>${obtenerFechaCreacionInforme(informe)}</span>`,
        `  <span>${obtenerFechaModificacionInforme(informe)}</span>`,
        `  <span class="status ${claseEstado}">${informe.estado}</span>`,
        `  <span><button class="mini-btn" type="button" onclick="eliminarInforme('${informe.id}', event)">Eliminar</button></span>`,
        '</div>'
      ].join('');
    })
    .join('');
  renderizarPaginacion('dashboardPagination', 'dashboard', informesMostrados.length, TAMANOS_PAGINA.dashboard);
  window.refrescarMejorasProducto?.();
}

(function inicializarDashboard() {
  cargarInformesGuardados();
  inicializarColoresRecientesDisenador();
  initPerfiles(); // Carga o inicializa los perfiles al arrancar
  cargarAjustesGuardados();
  aplicarTemaAplicacion(ajustesApp.tema);

  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  const quickCards = Array.from(document.querySelectorAll('.action-card'));
  const botonNuevoInforme = document.getElementById('btnNuevoInforme');
  const searchInput = document.getElementById('searchInput');
  const historialFecha = document.getElementById('historialFecha');
  const historialOrden = document.getElementById('historialOrden');
  const firmaDigitalInput = document.getElementById('firmaDigitalInput');
  const logoClinicaInput = document.getElementById('logoClinicaInput');
  const imagenesInformeInput = document.getElementById('imagenesInformeInput');
  const firmaSimpleInput = document.getElementById('firmaSimpleInput');
  const rutMedicoInput = document.getElementById('rutMedicoInput');
  const registroMedicoInput = document.getElementById('registroMedicoInput');
  const profileName = document.querySelector('.profile-name');

  if (profileName && !profileName.textContent.trim()) {
    profileName.textContent = 'Usuario';
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  quickCards.forEach((card) => {
    card.addEventListener('click', () => {
      quickCards.forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
    });
  });

  if (botonNuevoInforme) {
    botonNuevoInforme.addEventListener('click', () => {
      showEditor();
    });
  }

  marcarNavActiva('Dashboard');

  if (searchInput) {
    searchInput.addEventListener('input', () => { paginasListados.dashboard = 1; renderDashboard(); });
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        paginasListados.dashboard = 1;
        renderDashboard();
      }
      if (event.key === 'Escape') {
        searchInput.value = '';
        paginasListados.dashboard = 1;
        renderDashboard();
      }
    });
  }

  if (historialFecha) {
    historialFecha.addEventListener('change', () => { paginasListados.historial = 1; renderHistorial(); });
  }

  if (historialOrden) {
    historialOrden.addEventListener('change', () => { paginasListados.historial = 1; renderHistorial(); });
  }

  if (firmaDigitalInput) {
    firmaDigitalInput.addEventListener('change', cargarFirmaDigital);
  }
  if (logoClinicaInput) logoClinicaInput.addEventListener('change', cargarLogoClinica);

  if (imagenesInformeInput) {
    imagenesInformeInput.addEventListener('change', cargarImagenesInforme);
  }

  if (rutMedicoInput) {
    rutMedicoInput.addEventListener('input', manejarInputRut);
  }

  document.addEventListener('beforeinput', manejarInputPaginaConclusion, true);
  document.addEventListener('beforeinput', manejarBeforeInputHistorialEditor, true);
  document.addEventListener('input', manejarInputPaginaConclusion, true);
  document.addEventListener('input', (event) => {
    if (!event.target?.closest?.('#editor-view [data-report-field], #editor-view .profile-rich-editor, #editor-view .measurements-table')) return;
    manejarCampoInteligenteInforme(event);
    programarAutoguardadoInforme();
  }, true);
  document.addEventListener('click', manejarClickControlesPaginasInforme, true);
  document.addEventListener('click', manejarClickCamposPortada, true);
  document.addEventListener('keydown', manejarAtajosHistorialEditor, true);
  document.addEventListener('keydown', manejarAtajosWord, true);
  document.addEventListener('paste', manejarPegadoEditorEnriquecido, true);
  document.addEventListener('input', (event) => {
    if (!event.target.closest?.('.profile-rich-editor')) return;
    mostrarEstadoGuardadoWord('Cambios sin guardar');
  }, true);
  document.addEventListener('select', manejarSeleccionTextoInforme, true);
  document.addEventListener('mouseup', manejarSeleccionTextoInforme, true);
  document.addEventListener('keyup', manejarSeleccionTextoInforme, true);
  document.addEventListener('click', manejarClickFormatoTexto, true);
  document.addEventListener('selectionchange', () => {
    const activo = document.activeElement;
    if (!esCampoInformeFormateable(activo) && !seleccionFormatoTexto) ocultarToolbarFormatoTexto();
    guardarRangoEditorEnriquecido();
    actualizarEstadoCintaWord();
  });
  const cintaWord = document.getElementById('wordRibbon');
  if (cintaWord) cintaWord.addEventListener('mousedown', (event) => {
    if (event.target.closest('button')) event.preventDefault();
  });

  obtenerCamposInforme().forEach((campo) => {
    if (campo.classList && campo.classList.contains('cover-field')) {
      campo.addEventListener('input', () => {
        if (campo.dataset.reportField === 'fecha') {
          manejarInputFechaPortada(campo);
        } else {
          ajustarCampoPortada(campo);
        }
      });
      ajustarCampoPortada(campo);
    }

    if (campo.tagName === 'TEXTAREA') {
      const fieldKey = campo.dataset.reportField;
      if (fieldKey === 'antecedentes') {
        campo.addEventListener('beforeinput', (event) => {
          bloquearInputSiNoCabe(campo, event);
        });
        limitarCampoPorAltura(campo);
        return;
      }

      if (fieldKey === 'resultados') {
        // Determinar el campo base (el editable): el primero sin data-generated-page
        const template = document.querySelector('.report-template');
        let baseCampo = null;
        const posibles = Array.from(template.querySelectorAll('[data-report-field="resultados"]'));
        for (const c of posibles) {
          if (!c.dataset.generatedPage) { baseCampo = c; break; }
        }
        if (!baseCampo) baseCampo = posibles[0] || campo;

        // Si este campo es una página generada, lo dejamos de solo lectura y redirigimos foco al base
        if (campo.dataset.generatedPage) {
          campo.readOnly = true;
          campo.setAttribute('tabindex', '-1');
          campo.addEventListener('click', () => {
            baseCampo.focus();
          });
          return;
        }

        // Campo base: editable, maneja input y Ctrl+A
        campo.addEventListener('input', () => {
          manejarInputResultados(campo);
        });
        campo.addEventListener('keydown', (event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            event.preventDefault();
            // Seleccionar todo solo en el campo base
            campo.select();
          }
        });
        // Inicializar su tamaño
        limitarCampoPorAltura(campo);
        return;
      }

      // Observaciones y demás campos paginados normales
      campo.addEventListener('input', () => {
        if (fieldKey === 'conclusion' || fieldKey === 'observaciones') {
          ajustarPaginaConclusion(campo.closest('.body-conclusion-page') || document);
        } else if (esCampoPaginado(campo)) {
          repaginarCampoInformeConDebounce(fieldKey);
        } else {
          ajustarAlturaCampoInforme(campo);
        }
      });

      if (fieldKey === 'conclusion' || fieldKey === 'observaciones') {
        ajustarPaginaConclusion(campo.closest('.body-conclusion-page') || document);
      } else if (esCampoPaginado(campo)) {
        repaginarCampoInformeConDebounce(fieldKey);
      } else {
        ajustarAlturaCampoInforme(campo);
      }
    }
  });

  agregarControlesCamposPortada();
  vincularCamposInformeDinamicos();
  aplicarCredencialesYDiplomados();
  aplicarLayoutInforme();
  renderDashboard();
  renderHistorial();
  renderPapeleraInformes();
  renderConfiguracion();
  window.setTimeout(revisarRecuperacionInforme, 250);
})();

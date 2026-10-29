# Resumen del Proyecto: Generador de Informes

Este documento describe la arquitectura, características y funcionamiento de la aplicación de escritorio "Generador de Informes", una herramienta desarrollada con Electron y JavaScript para la creación de informes médicos, probablemente ecográficos, en el ámbito veterinario.

## 1. Descripción General

La aplicación es un sistema autocontenido (standalone) que permite a los usuarios:
*   Crear, editar y gestionar informes médicos detallados.
*   Utilizar plantillas predefinidas para agilizar la redacción.
*   Personalizar credenciales del médico, incluyendo firma y diplomados.
*   Exportar los informes finales en formato PDF.

Toda la información (informes, plantillas y ajustes) se almacena localmente mediante `localStorage`, por lo que la aplicación no depende de una conexión a internet ni de un servidor externo.

## 2. Arquitectura y Tecnologías

*   **Entorno de Escritorio**: **Electron.js**. El archivo `tasks.json` y las referencias a `window.electronAPI` en `renderer.js` confirman que es una aplicación de escritorio.
*   **Icono de la Aplicación**: La ventana de Electron y el instalador de Windows utilizan `logo.ico`. `logo.png` permanece como recurso gráfico visible dentro de la interfaz y los informes.
*   **Lógica Principal**: **JavaScript (Vanilla)**. El archivo `renderer.js` contiene toda la lógica de la aplicación, desde la manipulación del DOM hasta la gestión del estado, sin usar frameworks externos como React o Vue.
*   **Estilos**: **CSS3**. El archivo `styles.css` define toda la apariencia de la aplicación y las plantillas de los informes.
*   **Almacenamiento de Datos**: **`localStorage`**. La aplicación utiliza el almacenamiento local del navegador para persistir los datos del usuario. Las claves principales son:
    *   `informesGuardados`: Almacena la lista de informes activos.
    *   `papeleraInformes`: Guarda los informes eliminados.
    *   `ajustesApp`: Guarda la configuración del usuario (firma, RUT, diplomados, etc.).
    *   `perfilesInformes`: Guarda las plantillas, hojas y bloques del diseñador WYSIWYG.

## 3. Estructura de Archivos

El proyecto se compone principalmente de los siguientes archivos:

### `renderer.js`
Es el "cerebro" de la aplicación. Gestiona:
*   **Estado de la Aplicación**: Mantiene el estado actual en variables globales como `estadoDashboard`, `ajustesApp` e `informeLayoutActivo`.
*   **Gestión de Vistas**: Funciones como `cambiarVista` y `showDashboard`, `showEditor`, etc., controlan qué pantalla se muestra al usuario.
*   **CRUD de Informes**: Lógica para crear, leer, guardar (como borrador o completado), y eliminar informes. Incluye una papelera de reciclaje (`papeleraInformes`).
*   **Editor de Informes**:
    *   **Paginación Dinámica**: La funcionalidad `repaginarCampoInforme` divide automáticamente el texto que excede la capacidad de una página (como en "Resultados") en páginas de continuación.
*   **Gestión de Layout**: Permite al usuario eliminar y reordenar páginas del informe (`informeLayoutActivo`).
    *   Durante el arrastre de bloques, acercar el puntero a los bordes superior o inferior desplaza automáticamente la ventana y permite mover el bloque entre hojas, manteniéndolo bajo el puntero.
    *   Mientras se arrastra un bloque aparecen guías inteligentes: una cruz marca el centro de la hoja y otras líneas indican y ajustan la coincidencia entre los centros de los bloques, al estilo Canva.
    *   El catálogo incluye un bloque de **Diplomados**, conectado a los diplomados cursados y en curso guardados en Configuración, y un bloque de **Figuras y formas** basado en SVG para ondas, rectángulos, cuadrados, círculos, triángulos, rombos, líneas y flechas.
    *   Las figuras se redimensionan desde ocho tiradores (esquinas y laterales). El SVG se adapta al ancho y alto reales del bloque, incluso en tamaños pequeños, con un mínimo de 24 px.
    *   Todos los bloques guardan una capa dentro de su propia hoja. Desde el panel del bloque se puede **Enviar al fondo**, **Enviar atrás**, **Traer adelante** o **Traer al frente**; el mismo orden se conserva en el informe y en el PDF.
    *   Las tablas modernas conservan una matriz rectangular: al cambiar el número de filas o columnas se actualizan todas las filas, y cada contenido editable permanece dentro de su celda correspondiente.
    *   Los controles de color combinan selector visual y entrada hexadecimal manual. Aceptan `#RRGGBB`, `RRGGBB` y `#RGB`; un valor inválido se rechaza mediante la mensajería interna de la aplicación.
    *   **Manejo de Imágenes**: Carga, muestra y elimina imágenes dentro del informe.
    *   **Formato de Texto**: Implementa negrita, cursiva y subrayado convirtiendo los caracteres a sus equivalentes matemáticos Unicode.
    *   **Historial (Undo/Redo)**: Guarda "snapshots" del estado del editor para permitir deshacer y rehacer cambios.
*   **Configuración**: Carga y guarda los ajustes del usuario, como las credenciales del médico y la gestión de diplomados.
*   **Exportación a PDF**: Se comunica con el proceso principal de Electron a través de `window.electronAPI.guardarPDF()` para generar el archivo final.

### `styles.css`
Este archivo es responsable de toda la presentación visual.
*   **Tema Principal**: Define una paleta de colores coherente con variables CSS (`--sidebar-bg`, `--accent`, etc.).
*   **Layout General**: Estructura la aplicación en un panel principal y, en diseños anteriores, una barra lateral. El diseño actual usa una barra de navegación superior.
*   **Estilos de Componentes**: Contiene las reglas para todos los elementos de la interfaz: botones, tarjetas, tablas, modales y formularios.
*   **Plantillas de Informe**: Define con precisión milimétrica el diseño de las páginas del informe para que coincidan con el formato de exportación a PDF. Hay varias plantillas:
    1.  `cover-template`: La portada principal.
    2.  `body-page`: Para las páginas de "Antecedentes" y "Resultados".
    3.  `body-conclusion-page`: Para la página de "Conclusiones" y "Observaciones".
    4.  `eco-images-page`: Para las páginas que contienen las imágenes ecográficas.
    5.  `diplomadosPage`: Una página dedicada a listar los diplomados del médico.
*   **Modo de Exportación**: Usa la clase `.pdf-export-mode` en el `<body>` para ocultar todos los elementos de la UI y dejar solo las páginas del informe al momento de generar el PDF.

### `.vscode/tasks.json`
Archivo de configuración para Visual Studio Code.
*   Define una serie de tareas para ejecutar la aplicación Electron.
*   La mayoría de las tareas son variantes del comando `npx --yes electron@30.5.1 .`, lo que indica un flujo de trabajo de desarrollo rápido para probar la aplicación. La repetición de tareas sugiere un proceso de desarrollo iterativo.

## 4. Funcionalidades Clave

### Dashboard y Navegación
*   La vista principal (`Dashboard`) muestra un resumen de la actividad, estadísticas de informes y una lista de los informes creados recientemente.
*   Una barra de navegación superior permite cambiar entre las vistas: `Dashboard`, `Historial`, `Papelera` y `Configuración`.
*   Incluye una barra de búsqueda para filtrar informes por cualquier campo (paciente, fecha, contenido, etc.).

### Administración de Plantillas
*   Cada tarjeta permite cambiar el nombre haciendo clic directamente sobre el nombre de la plantilla.
*   La acción de copiar se presenta como un icono en la esquina superior derecha de la tarjeta.
*   Los cambios de nombre, copias y eliminaciones utilizan los diálogos temáticos internos; las eliminaciones exigen confirmación antes de ser permanentes.

### Editor de Informes
*   **Interfaz WYSIWYG ("What You See Is What You Get")**: El editor muestra una vista previa en tiempo real del informe tal como se verá en el PDF.
*   **Campos Dinámicos**: Los campos de texto como `textarea` se expanden automáticamente con el contenido.
*   **Paginación Automática**: El campo "Resultados" es especialmente complejo. Si el texto excede el espacio disponible en la página, la función `repaginarCampoInforme` lo divide y crea páginas de continuación (`body-results-continuation-field`) para albergar el texto sobrante. Esto se gestiona midiendo el texto con `canvas`.
*   **Personalización de Plantilla**: El usuario puede eliminar páginas no deseadas (como la de diplomados) o campos de la portada, y estas decisiones se guardan en el layout del informe (`datos._layout`).
*   **Vista Previa**: Un modal permite previsualizar el informe final antes de guardarlo como PDF, bloqueando la edición.

### Configuración y Personalización
*   **Credenciales del Médico**: El usuario puede definir su nombre, RUT y número de registro.
*   **Firma Digital**: Permite cargar una imagen (ej. `.png` con fondo transparente) de la firma manuscrita.
*   **Gestión de Diplomados**: Una interfaz dedicada permite al usuario listar los diplomados cursados y en curso, que luego se formatean y se muestran en una página específica del informe.

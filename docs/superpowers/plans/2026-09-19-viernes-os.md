# VIERNES OS — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el portafolio personal de Bruno Fragoso como un sistema operativo ficticio de los 80 (VIERNES OS): arranque CRT, puerta de entrada S/N, y una TUI navegable y bilingüe con su trabajo.

**Architecture:** Sitio estático sin build. Módulos ES nativos cargados directo por el navegador. La lógica pura (idioma, navegación, planificación del tipeo) vive en módulos sin DOM, testeados con el runner nativo de Node; el DOM y los efectos CRT se verifican a mano. Todo el texto vive en un único `contenido.js`.

**Tech Stack:** HTML5, CSS3 (custom properties), JavaScript ES2022 (módulos nativos), `node --test` para tests, Cloudflare Workers Static Assets para despliegue.

**Spec:** `docs/superpowers/specs/2026-09-19-viernes-os-portfolio-design.md`

## Global Constraints

- **Sin build y sin dependencias de runtime.** Prohibido `npm install` para el sitio. Los módulos se cargan con `<script type="module">`. Node solo se usa para correr tests.
- **Sin correo ni teléfono** en ningún archivo desplegado. Contacto = LinkedIn y GitHub únicamente.
- **El hedge fund no se nombra.** El proyecto de commodities se describe como "un hedge fund".
- **No se presenta "machine learning" como pilar.** Los tres pilares son: Desarrollo web, Datos y análisis, Automatización e IA aplicada.
- **Todo el contenido alcanzable con teclado y con mouse.** Las flechas son atajo, nunca requisito.
- **`prefers-reduced-motion: reduce`** desactiva tipeo, parpadeo, glitch y apagado. El contenido no cambia.
- **Idiomas:** `es` y `en`. Todo string visible existe en ambos.
- **Variable única de intensidad CRT:** `--crt`. Arranque `1`, sistema `0.35`, toggle OFF `0`.
- **Secciones, en este orden:** `whoami`, `archivos`, `procesos`, `stack`, `trayectoria`, `contacto`.
- **Idioma del código:** identificadores y comentarios en español, consistente con el contenido del sitio.
- **Commits:** mensajes en español, formato `tipo: descripción`.

---

### Task 1: Contenido bilingüe e i18n

Base de todo: los datos del portafolio y la resolución de idioma. Son módulos puros, sin DOM, así que se testean de verdad.

**Files:**
- Create: `js/contenido.js`
- Create: `js/i18n.js`
- Create: `tests/i18n.test.js`
- Create: `.gitignore`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `contenido` (objeto por defecto de `contenido.js`), con las claves `meta`, `boot`, `secciones`, `whoami`, `archivos`, `procesos`, `stack`, `trayectoria`, `contacto`.
  - `IDIOMAS: string[]`, `IDIOMA_POR_DEFECTO: string`
  - `detectarIdioma(idiomasNavegador: string[], guardado: string|null): string`
  - `t(nodo: any, idioma: string): string` — resuelve `{es, en}` a un string.
  - `recorrer(contenido: object, ruta: string): any` — accede por ruta con puntos.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/i18n.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDIOMAS, IDIOMA_POR_DEFECTO, detectarIdioma, t, recorrer } from '../js/i18n.js';
import contenido from '../js/contenido.js';

test('los idiomas soportados son es y en', () => {
  assert.deepEqual(IDIOMAS, ['es', 'en']);
  assert.equal(IDIOMA_POR_DEFECTO, 'es');
});

test('detectarIdioma prioriza lo guardado sobre el navegador', () => {
  assert.equal(detectarIdioma(['en-US'], 'es'), 'es');
  assert.equal(detectarIdioma(['es-MX'], 'en'), 'en');
});

test('detectarIdioma ignora un valor guardado invalido', () => {
  assert.equal(detectarIdioma(['en-US'], 'klingon'), 'en');
});

test('detectarIdioma lee la etiqueta base del navegador', () => {
  assert.equal(detectarIdioma(['en-GB', 'es-MX'], null), 'en');
  assert.equal(detectarIdioma(['es-419'], null), 'es');
});

test('detectarIdioma cae al idioma por defecto si no reconoce ninguno', () => {
  assert.equal(detectarIdioma(['fr-FR', 'de'], null), 'es');
  assert.equal(detectarIdioma([], null), 'es');
});

test('t resuelve un nodo bilingue', () => {
  assert.equal(t({ es: 'hola', en: 'hello' }, 'es'), 'hola');
  assert.equal(t({ es: 'hola', en: 'hello' }, 'en'), 'hello');
});

test('t devuelve los strings planos sin tocarlos', () => {
  assert.equal(t('Plantasia', 'en'), 'Plantasia');
});

test('recorrer accede por ruta con puntos', () => {
  const datos = { a: { b: { c: 42 } } };
  assert.equal(recorrer(datos, 'a.b.c'), 42);
  assert.equal(recorrer(datos, 'a.x.c'), undefined);
});

test('todo string visible existe en los dos idiomas', () => {
  const faltantes = [];
  const visitar = (nodo, ruta) => {
    if (nodo === null || nodo === undefined) return;
    if (Array.isArray(nodo)) return nodo.forEach((n, i) => visitar(n, `${ruta}[${i}]`));
    if (typeof nodo !== 'object') return;
    const claves = Object.keys(nodo);
    if (claves.includes('es') || claves.includes('en')) {
      for (const idioma of IDIOMAS) {
        const valor = nodo[idioma];
        if (typeof valor !== 'string' || valor.trim() === '') faltantes.push(`${ruta}.${idioma}`);
      }
      return;
    }
    claves.forEach((c) => visitar(nodo[c], ruta ? `${ruta}.${c}` : c));
  };
  visitar(contenido, '');
  assert.deepEqual(faltantes, []);
});

test('no hay correo ni telefono en el contenido', () => {
  const crudo = JSON.stringify(contenido);
  assert.equal(/@[a-z0-9.-]+\.[a-z]{2,}/i.test(crudo), false, 'se filtro un correo');
  assert.equal(/\+?\d[\d\s().-]{8,}\d/.test(crudo), false, 'se filtro un telefono');
});

test('el hedge fund no se nombra', () => {
  const crudo = JSON.stringify(contenido).toLowerCase();
  assert.equal(crudo.includes('moreton'), false, 'se filtro el nombre del cliente');
});

test('las secciones estan en el orden del spec', () => {
  assert.deepEqual(contenido.secciones.map((s) => s.id), [
    'whoami', 'archivos', 'procesos', 'stack', 'trayectoria', 'contacto',
  ]);
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module '../js/i18n.js'`

- [ ] **Step 3: Escribir `js/i18n.js`**

```js
export const IDIOMAS = ['es', 'en'];
export const IDIOMA_POR_DEFECTO = 'es';

/** Elige idioma: lo guardado manda, si no la preferencia del navegador. */
export function detectarIdioma(idiomasNavegador = [], guardado = null) {
  if (IDIOMAS.includes(guardado)) return guardado;
  for (const etiqueta of idiomasNavegador) {
    const base = String(etiqueta).toLowerCase().split('-')[0];
    if (IDIOMAS.includes(base)) return base;
  }
  return IDIOMA_POR_DEFECTO;
}

/** Resuelve un nodo {es, en} a string. Los strings planos pasan intactos. */
export function t(nodo, idioma) {
  if (nodo === null || nodo === undefined) return '';
  if (typeof nodo === 'string') return nodo;
  if (typeof nodo === 'object' && idioma in nodo) return nodo[idioma];
  if (typeof nodo === 'object' && IDIOMA_POR_DEFECTO in nodo) return nodo[IDIOMA_POR_DEFECTO];
  return String(nodo);
}

/** Acceso por ruta con puntos: recorrer(datos, 'a.b.c') */
export function recorrer(raiz, ruta) {
  return String(ruta).split('.').reduce((nodo, parte) => (
    nodo === null || nodo === undefined ? undefined : nodo[parte]
  ), raiz);
}
```

- [ ] **Step 4: Escribir `js/contenido.js`**

Contenido real, extraído del CV de Bruno y de sus repos. Cada string visible es un objeto `{es, en}`.

```js
const contenido = {
  meta: {
    nombre: 'VIERNES OS',
    version: '1.37',
    titular: { es: 'Bruno Fragoso — Desarrollo web, datos y automatización con IA',
               en: 'Bruno Fragoso — Web development, data and AI automation' },
  },

  boot: {
    post: [
      'VIERNES BIOS v1.37 — (c) 1987',
      'CPU ....... OK',
      'MEM ....... 640K OK',
      'VIDEO ..... CGA/EGA DETECTADO',
      'DISCO ..... /dev/bruno MONTADO',
    ],
    saludo: 'hello, world',
    pregunta: { es: '¿INICIAR SESIÓN? [S/N]', en: 'LOG IN? [Y/N]' },
    saltar: { es: 'saltar intro', en: 'skip intro' },
    rechazo: { es: 'CONEXIÓN TERMINADA', en: 'CONNECTION TERMINATED' },
    reproche: { es: '...¿en serio?', en: '...really?' },
    reintentar: { es: '[REINTENTAR]', en: '[RETRY]' },
    entrando: { es: 'ACCESO CONCEDIDO', en: 'ACCESS GRANTED' },
  },

  secciones: [
    { id: 'whoami',      etiqueta: { es: 'WHOAMI',      en: 'WHOAMI' } },
    { id: 'archivos',    etiqueta: { es: 'ARCHIVOS',    en: 'FILES' } },
    { id: 'procesos',    etiqueta: { es: 'PROCESOS',    en: 'PROCESSES' } },
    { id: 'stack',       etiqueta: { es: 'STACK',       en: 'STACK' } },
    { id: 'trayectoria', etiqueta: { es: 'TRAYECTORIA', en: 'HISTORY' } },
    { id: 'contacto',    etiqueta: { es: 'CONTACTO',    en: 'CONTACT' } },
  ],

  whoami: {
    nombre: 'Bruno Fragoso Márquez',
    ubicacion: { es: 'Ciudad de México', en: 'Mexico City' },
    parrafos: [
      { es: 'Desarrollador full-stack y estudiante de Inteligencia de Datos y Ciberseguridad en la Universidad Panamericana. Actualmente trabajo en un hedge fund, construyendo herramientas de análisis para investigación de materias primas.',
        en: 'Full-stack developer and student of Data Intelligence and Cybersecurity at Universidad Panamericana. I currently work at a hedge fund, building analysis tooling for commodities research.' },
      { es: 'Cofundé una agencia digital y trabajo por mi cuenta entregando aplicaciones web y automatizaciones. Me interesa el punto donde el software deja de ser una demo y empieza a sostener decisiones reales.',
        en: 'I co-founded a digital agency and work independently delivering web applications and automations. I care about the point where software stops being a demo and starts supporting real decisions.' },
    ],
    pilares: [
      { es: 'Desarrollo web', en: 'Web development' },
      { es: 'Datos y análisis', en: 'Data and analysis' },
      { es: 'Automatización e IA aplicada', en: 'Automation and applied AI' },
    ],
  },

  archivos: [
    {
      id: 'commodities',
      nombre: { es: 'ANALISIS-COMMODITIES', en: 'COMMODITIES-ANALYSIS' },
      etiqueta: 'FIN',
      anio: '2025',
      resumen: { es: 'Plataforma de análisis técnico de materias primas para un hedge fund.',
                 en: 'Technical analysis platform for commodities research at a hedge fund.' },
      detalle: { es: 'Visualización de contratos de futuros por producto y vencimiento, motor de series derivadas para construir spreads y butterflies con pesos configurables, análisis de estacionalidad año a año, e indicadores SMA-20 y MACD. Incluye carga de archivos Parquet desde la interfaz para actualizar la base de precios.',
                 en: 'Futures contract visualization by product and expiry, a derived-series engine to build spreads and butterflies with configurable weights, year-over-year seasonality analysis, and SMA-20 and MACD indicators. Includes Parquet upload from the interface to refresh the price database.' },
      stack: ['FastAPI', 'React', 'Pandas', 'SQLAlchemy', 'Docker'],
      enlace: null,
    },
    {
      id: 'automatizacion-ia',
      nombre: { es: 'AUTOMATIZACION-IA', en: 'AI-AUTOMATION' },
      etiqueta: 'IA',
      anio: '2025',
      resumen: { es: 'Flujos de automatización con pasos de IA, entregados a clientes.',
                 en: 'Automation workflows with AI steps, delivered to clients.' },
      detalle: { es: 'Diseño e implementación de flujos en n8n que integran modelos de lenguaje dentro de procesos de negocio, entregados a clientes de la agencia y de trabajo freelance. Corren en producción.',
                 en: 'Design and implementation of n8n workflows that embed language models inside business processes, delivered to agency and freelance clients. Running in production.' },
      stack: ['n8n', 'APIs de IA', 'Webhooks', 'REST'],
      enlace: null,
    },
    {
      id: 'plantasia',
      nombre: 'PLANTASIA',
      etiqueta: 'IoT',
      anio: '2025',
      resumen: { es: 'Plataforma IoT de cuidado de plantas, de hardware a navegador.',
                 en: 'IoT plant-care platform, from hardware to browser.' },
      detalle: { es: 'Macetas inteligentes con ESP32 que miden temperatura, luz y humedad y reportan a una API, más una aplicación web para monitorearlas en tiempo real y gestionar cada planta. Todo el ecosistema levanta con Docker Compose: base de datos, backend y frontend.',
                 en: 'Smart planters built on ESP32 that measure temperature, light and humidity and report to an API, plus a web app to monitor them in real time and manage each plant. The whole stack comes up with Docker Compose: database, backend and frontend.' },
      stack: ['React', 'Vite', 'Flask', 'PostgreSQL', 'C++', 'Docker'],
      enlace: 'https://github.com/Viernes137/Plantasia',
    },
    {
      id: 'omniscient',
      nombre: 'OMNISCIENT',
      etiqueta: { es: 'DATOS', en: 'DATA' },
      anio: '2025',
      resumen: { es: 'Mapeo de riesgo urbano con reportes de la comunidad.',
                 en: 'Urban risk mapping with community reporting.' },
      detalle: { es: 'Aplicación full-stack con mapa interactivo y reportes comunitarios en tiempo real, sobre un pipeline de datos propio: recolección, limpieza, modelado y visualización. La predicción de robos usa regresión lineal sobre incidentes históricos y patrones de ubicación.',
                 en: 'Full-stack application with an interactive map and real-time community reporting, built on a hand-rolled data pipeline: collection, cleaning, modeling and visualization. Theft prediction uses linear regression over historical incidents and location patterns.' },
      stack: ['Python', 'Pandas', 'scikit-learn', 'JavaScript'],
      enlace: null,
    },
    {
      id: 'psyche',
      nombre: 'PSYCHE',
      etiqueta: { es: 'WEB', en: 'WEB' },
      anio: '2022-2023',
      resumen: { es: 'Plataforma de telepsicología multiusuario.',
                 en: 'Multi-user telepsychology platform.' },
      detalle: { es: 'Plataforma donde psicólogos y pacientes se conectan, agendan sesiones y comparten recursos. Construí la lógica de backend, el esquema de base de datos y la interfaz, con foco en el manejo seguro de datos sensibles.',
                 en: 'A platform where psychologists and patients connect, schedule sessions and share resources. I built the backend logic, the database schema and the interface, focused on handling sensitive data safely.' },
      stack: ['JavaScript', 'HTML/CSS', 'SQL'],
      enlace: null,
    },
    {
      id: 'academicos',
      nombre: { es: 'TRABAJO-ACADEMICO', en: 'ACADEMIC-WORK' },
      etiqueta: 'UP',
      anio: '2024-2025',
      resumen: { es: 'Proyectos de carrera: sistemas operativos, arquitectura de datos, bases de datos.',
                 en: 'Coursework: operating systems, data architecture, databases.' },
      detalle: { es: 'Simulación de planificación de sistemas operativos en Python, proyecto de arquitectura de datos en Assembly, y un dashboard sobre una base de datos relacional avanzada en JavaScript.',
                 en: 'An operating-system scheduling simulation in Python, a data architecture project in Assembly, and a dashboard over an advanced relational database in JavaScript.' },
      stack: ['Python', 'Assembly', 'JavaScript', 'SQL'],
      enlace: 'https://github.com/Viernes137',
    },
  ],

  procesos: [
    {
      id: 'ia-profunda',
      nombre: { es: 'profundizacion-ia', en: 'ai-deep-dive' },
      estado: { es: 'EN CURSO', en: 'RUNNING' },
      detalle: { es: 'Más allá de los modelos lineales: arquitecturas modernas, evaluación honesta y puesta en producción.',
                 en: 'Beyond linear models: modern architectures, honest evaluation, and getting things into production.' },
    },
    {
      id: 'viernes-os',
      nombre: 'viernes-os',
      estado: { es: 'EN CURSO', en: 'RUNNING' },
      detalle: { es: 'Este sitio. Sin frameworks, sin build, sin dependencias.',
                 en: 'This site. No frameworks, no build step, no dependencies.' },
    },
  ],

  stack: [
    { grupo: { es: 'Lenguajes', en: 'Languages' },
      items: ['Python', 'JavaScript', 'SQL', 'C#', 'C++', 'HTML/CSS'] },
    { grupo: { es: 'Datos', en: 'Data' },
      items: ['Pandas', 'NumPy', 'scikit-learn', 'Power BI', 'PostgreSQL'] },
    { grupo: { es: 'Web', en: 'Web' },
      items: ['React', 'Vite', 'FastAPI', 'Flask', 'REST'] },
    { grupo: { es: 'Herramientas', en: 'Tools' },
      items: ['Git', 'Docker', 'n8n', 'Linux', 'Agile/Scrum'] },
  ],

  trayectoria: [
    { periodo: { es: '2025 — hoy', en: '2025 — present' },
      titulo: { es: 'Desarrollador · hedge fund', en: 'Developer · hedge fund' },
      detalle: { es: 'Herramientas de análisis técnico para investigación de materias primas.',
                 en: 'Technical analysis tooling for commodities research.' } },
    { periodo: { es: 'feb 2025 — hoy', en: 'Feb 2025 — present' },
      titulo: { es: 'Cofundador y desarrollador full-stack · Mablo Digital Agency',
                en: 'Co-founder and full-stack developer · Mablo Digital Agency' },
      detalle: { es: 'Agencia fundada con tres socios. Sitios, aplicaciones web y automatizaciones para clientes; dos clientes entregados en el primer mes.',
                 en: 'Agency founded with three partners. Websites, web applications and automations for clients; two clients delivered in the first month.' } },
    { periodo: { es: 'A demanda', en: 'On demand' },
      titulo: { es: 'Desarrollador web freelance', en: 'Freelance web developer' },
      detalle: { es: 'Proyectos de punta a punta: relevamiento, arquitectura, desarrollo y despliegue.',
                 en: 'End-to-end projects: scoping, architecture, development and deployment.' } },
    { periodo: { es: '2024 — hoy', en: '2024 — present' },
      titulo: { es: 'Universidad Panamericana', en: 'Universidad Panamericana' },
      detalle: { es: 'Inteligencia de Datos y Ciberseguridad. Prácticas en admisiones para la división de Ingeniería y Tecnología, y coordinación de voluntariado en el Programa de Compromiso Social.',
                 en: 'Data Intelligence and Cybersecurity. Admissions internship for the Engineering and Technology division, and volunteer coordination in the Social Commitment Program.' } },
    { periodo: { es: '2019 — 2023', en: '2019 — 2023' },
      titulo: { es: 'CECyT 9 "Juan de Dios Bátiz" · IPN', en: 'CECyT 9 "Juan de Dios Bátiz" · IPN' },
      detalle: { es: 'Bachillerato técnico con especialidad en Programación.',
                 en: 'Technical high school diploma specialized in Programming.' } },
  ],

  contacto: {
    lineas: [
      { es: 'La forma de contactarme es LinkedIn.', en: 'The way to reach me is LinkedIn.' },
    ],
    enlaces: [
      { etiqueta: 'LinkedIn', url: 'https://www.linkedin.com/in/brunofrag' },
      { etiqueta: 'GitHub', url: 'https://github.com/Viernes137' },
    ],
    idiomas: [
      { es: 'Español (nativo)', en: 'Spanish (native)' },
      { es: 'Inglés (fluido)', en: 'English (fluent)' },
      { es: 'Francés (básico)', en: 'French (basic)' },
    ],
  },
};

export default contenido;
```

> Nota para Bruno: la entrada `automatizacion-ia` está escrita al nivel de detalle que se puede defender hoy. Cuando puedas, reemplazá `detalle` por qué automatizan concretamente esos flujos y con qué modelo o API. Es el proyecto que sostiene tu tercer pilar y merece ser específico.

- [ ] **Step 5: Escribir `.gitignore`**

```
node_modules/
.wrangler/
.DS_Store
*.log
```

- [ ] **Step 6: Correr los tests y verificar que pasan**

Run: `node --test tests/`
Expected: PASS — 12 tests, 0 fallos.

- [ ] **Step 7: Commit**

```bash
git add js/contenido.js js/i18n.js tests/i18n.test.js .gitignore
git commit -m "feat: contenido bilingue del portafolio y resolucion de idioma"
```

---

### Task 2: Máquina de navegación

Estado puro de la TUI: qué sección está activa, qué ítem tiene el foco, qué archivo está abierto. Sin DOM, así que se testea entero.

**Files:**
- Create: `js/nav.js`
- Create: `tests/nav.test.js`

**Interfaces:**
- Consumes: `contenido.secciones` de Task 1 (solo para los ids, en los tests).
- Produces:
  - `crearEstado(seccionesIds: string[], seccionInicial?: string): Estado`
    donde `Estado = { secciones: string[], seccion: string, indice: number, abierto: string|null }`
  - `reducir(estado: Estado, accion: Accion, contexto?: { cantidadItems?: number }): Estado`
    donde `Accion` es uno de: `{tipo:'seccion', id:string}`, `{tipo:'seccion-delta', delta:number}`, `{tipo:'item-delta', delta:number}`, `{tipo:'abrir', id:string}`, `{tipo:'cerrar'}`
  - `accionDesdeTecla(tecla: string, estado: Estado): Accion|null`
  - Siempre devuelve un estado nuevo; nunca muta el recibido.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/nav.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearEstado, reducir, accionDesdeTecla } from '../js/nav.js';

const IDS = ['whoami', 'archivos', 'procesos', 'stack', 'trayectoria', 'contacto'];
const nuevo = () => crearEstado(IDS);

test('el estado inicial arranca en la primera seccion', () => {
  const e = nuevo();
  assert.equal(e.seccion, 'whoami');
  assert.equal(e.indice, 0);
  assert.equal(e.abierto, null);
});

test('crearEstado acepta una seccion inicial valida', () => {
  assert.equal(crearEstado(IDS, 'stack').seccion, 'stack');
});

test('crearEstado ignora una seccion inicial invalida', () => {
  assert.equal(crearEstado(IDS, 'inexistente').seccion, 'whoami');
});

test('reducir nunca muta el estado recibido', () => {
  const e = nuevo();
  reducir(e, { tipo: 'seccion', id: 'stack' });
  assert.equal(e.seccion, 'whoami');
});

test('cambiar de seccion resetea el foco de item', () => {
  let e = nuevo();
  e = reducir(e, { tipo: 'seccion', id: 'archivos' });
  e = reducir(e, { tipo: 'item-delta', delta: 2 }, { cantidadItems: 6 });
  assert.equal(e.indice, 2);
  e = reducir(e, { tipo: 'seccion', id: 'stack' });
  assert.equal(e.indice, 0);
});

test('seccion-delta da la vuelta en los dos extremos', () => {
  let e = nuevo();
  e = reducir(e, { tipo: 'seccion-delta', delta: -1 });
  assert.equal(e.seccion, 'contacto');
  e = reducir(e, { tipo: 'seccion-delta', delta: 1 });
  assert.equal(e.seccion, 'whoami');
});

test('item-delta da la vuelta dentro de la cantidad de items', () => {
  let e = reducir(nuevo(), { tipo: 'seccion', id: 'archivos' });
  e = reducir(e, { tipo: 'item-delta', delta: -1 }, { cantidadItems: 6 });
  assert.equal(e.indice, 5);
  e = reducir(e, { tipo: 'item-delta', delta: 1 }, { cantidadItems: 6 });
  assert.equal(e.indice, 0);
});

test('item-delta sin items no rompe', () => {
  const e = reducir(nuevo(), { tipo: 'item-delta', delta: 1 }, { cantidadItems: 0 });
  assert.equal(e.indice, 0);
});

test('abrir y cerrar un archivo', () => {
  let e = reducir(nuevo(), { tipo: 'seccion', id: 'archivos' });
  e = reducir(e, { tipo: 'abrir', id: 'plantasia' });
  assert.equal(e.abierto, 'plantasia');
  e = reducir(e, { tipo: 'cerrar' });
  assert.equal(e.abierto, null);
});

test('cerrar sin nada abierto es inofensivo', () => {
  const e = reducir(nuevo(), { tipo: 'cerrar' });
  assert.equal(e.abierto, null);
});

test('cambiar de seccion cierra lo que estuviera abierto', () => {
  let e = reducir(nuevo(), { tipo: 'seccion', id: 'archivos' });
  e = reducir(e, { tipo: 'abrir', id: 'plantasia' });
  e = reducir(e, { tipo: 'seccion', id: 'stack' });
  assert.equal(e.abierto, null);
});

test('una accion desconocida devuelve el mismo estado', () => {
  const e = nuevo();
  assert.equal(reducir(e, { tipo: 'inventada' }), e);
});

test('las flechas se mapean a acciones', () => {
  const e = nuevo();
  assert.deepEqual(accionDesdeTecla('ArrowDown', e), { tipo: 'item-delta', delta: 1 });
  assert.deepEqual(accionDesdeTecla('ArrowUp', e), { tipo: 'item-delta', delta: -1 });
  assert.deepEqual(accionDesdeTecla('ArrowRight', e), { tipo: 'seccion-delta', delta: 1 });
  assert.deepEqual(accionDesdeTecla('ArrowLeft', e), { tipo: 'seccion-delta', delta: -1 });
});

test('Escape cierra solo si hay algo abierto', () => {
  const cerrado = nuevo();
  assert.equal(accionDesdeTecla('Escape', cerrado), null);
  const abierto = { ...cerrado, abierto: 'plantasia' };
  assert.deepEqual(accionDesdeTecla('Escape', abierto), { tipo: 'cerrar' });
});

test('una tecla sin mapeo devuelve null', () => {
  assert.equal(accionDesdeTecla('q', nuevo()), null);
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `node --test tests/nav.test.js`
Expected: FAIL — `Cannot find module '../js/nav.js'`

- [ ] **Step 3: Escribir `js/nav.js`**

```js
/** Envuelve un indice dentro de [0, total). */
function envolver(indice, total) {
  if (total <= 0) return 0;
  return ((indice % total) + total) % total;
}

export function crearEstado(secciones, seccionInicial = null) {
  const lista = [...secciones];
  const seccion = lista.includes(seccionInicial) ? seccionInicial : lista[0];
  return { secciones: lista, seccion, indice: 0, abierto: null };
}

export function reducir(estado, accion, contexto = {}) {
  const { cantidadItems = 0 } = contexto;

  switch (accion?.tipo) {
    case 'seccion': {
      if (!estado.secciones.includes(accion.id)) return estado;
      if (accion.id === estado.seccion && estado.abierto === null) return estado;
      return { ...estado, seccion: accion.id, indice: 0, abierto: null };
    }
    case 'seccion-delta': {
      const actual = estado.secciones.indexOf(estado.seccion);
      const siguiente = envolver(actual + accion.delta, estado.secciones.length);
      return { ...estado, seccion: estado.secciones[siguiente], indice: 0, abierto: null };
    }
    case 'item-delta': {
      return { ...estado, indice: envolver(estado.indice + accion.delta, cantidadItems) };
    }
    case 'abrir': {
      return { ...estado, abierto: accion.id };
    }
    case 'cerrar': {
      if (estado.abierto === null) return estado;
      return { ...estado, abierto: null };
    }
    default:
      return estado;
  }
}

const MAPA_TECLAS = {
  ArrowDown:  { tipo: 'item-delta', delta: 1 },
  ArrowUp:    { tipo: 'item-delta', delta: -1 },
  ArrowRight: { tipo: 'seccion-delta', delta: 1 },
  ArrowLeft:  { tipo: 'seccion-delta', delta: -1 },
};

export function accionDesdeTecla(tecla, estado) {
  if (tecla === 'Escape') return estado.abierto === null ? null : { tipo: 'cerrar' };
  return MAPA_TECLAS[tecla] ?? null;
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `node --test tests/`
Expected: PASS — todos los tests de i18n y nav.

- [ ] **Step 5: Commit**

```bash
git add js/nav.js tests/nav.test.js
git commit -m "feat: maquina de navegacion de la TUI"
```

---

### Task 3: Planificador de tipeo

El efecto de máquina de escribir. La planificación (qué carácter aparece en qué momento) es pura y se testea; el render al DOM es una función aparte y delgada.

**Files:**
- Create: `js/typewriter.js`
- Create: `tests/typewriter.test.js`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `planificar(texto: string, opciones?: { velocidad?: number, pausaPuntuacion?: number, instantaneo?: boolean }): Paso[]`
    donde `Paso = { texto: string, retraso: number }` — `texto` es el acumulado hasta ese punto.
  - `duracionTotal(plan: Paso[]): number`
  - `async tipear(elemento: HTMLElement, texto: string, opciones?): Promise<void>` — aplica el plan al DOM.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/typewriter.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planificar, duracionTotal } from '../js/typewriter.js';

test('planificar produce un paso por caracter', () => {
  const plan = planificar('abc', { velocidad: 10 });
  assert.equal(plan.length, 3);
});

test('cada paso lleva el texto acumulado', () => {
  const plan = planificar('abc', { velocidad: 10 });
  assert.deepEqual(plan.map((p) => p.texto), ['a', 'ab', 'abc']);
});

test('el primer paso no tiene retraso', () => {
  const plan = planificar('abc', { velocidad: 10 });
  assert.equal(plan[0].retraso, 0);
});

test('los caracteres normales usan la velocidad dada', () => {
  const plan = planificar('abc', { velocidad: 25 });
  assert.equal(plan[1].retraso, 25);
  assert.equal(plan[2].retraso, 25);
});

test('la puntuacion agrega una pausa', () => {
  const plan = planificar('a.b', { velocidad: 10, pausaPuntuacion: 200 });
  assert.equal(plan[1].retraso, 10, 'el punto entra a velocidad normal');
  assert.equal(plan[2].retraso, 210, 'el caracter despues del punto espera');
});

test('modo instantaneo devuelve un solo paso sin retraso', () => {
  const plan = planificar('hola mundo', { instantaneo: true });
  assert.deepEqual(plan, [{ texto: 'hola mundo', retraso: 0 }]);
});

test('texto vacio produce un plan vacio', () => {
  assert.deepEqual(planificar('', { velocidad: 10 }), []);
});

test('duracionTotal suma los retrasos', () => {
  const plan = planificar('abc', { velocidad: 10 });
  assert.equal(duracionTotal(plan), 20);
  assert.equal(duracionTotal([]), 0);
});

test('duracionTotal de un plan instantaneo es cero', () => {
  assert.equal(duracionTotal(planificar('hola', { instantaneo: true })), 0);
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `node --test tests/typewriter.test.js`
Expected: FAIL — `Cannot find module '../js/typewriter.js'`

- [ ] **Step 3: Escribir `js/typewriter.js`**

```js
const PUNTUACION = new Set(['.', ',', ':', ';', '!', '?', '—']);

/**
 * Calcula cuando aparece cada caracter.
 * Devuelve pasos con el texto acumulado, para que el render sea un simple asignar.
 */
export function planificar(texto, opciones = {}) {
  const { velocidad = 28, pausaPuntuacion = 220, instantaneo = false } = opciones;
  if (texto === '') return [];
  if (instantaneo) return [{ texto, retraso: 0 }];

  const pasos = [];
  let acumulado = '';
  for (let i = 0; i < texto.length; i += 1) {
    acumulado += texto[i];
    let retraso = i === 0 ? 0 : velocidad;
    if (i > 0 && PUNTUACION.has(texto[i - 1])) retraso += pausaPuntuacion;
    pasos.push({ texto: acumulado, retraso });
  }
  return pasos;
}

export function duracionTotal(plan) {
  return plan.reduce((suma, paso) => suma + paso.retraso, 0);
}

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

/** Aplica un plan de tipeo a un elemento del DOM. */
export async function tipear(elemento, texto, opciones = {}) {
  for (const paso of planificar(texto, opciones)) {
    if (paso.retraso > 0) await esperar(paso.retraso);
    elemento.textContent = paso.texto;
  }
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `node --test tests/`
Expected: PASS — i18n, nav y typewriter.

- [ ] **Step 5: Commit**

```bash
git add js/typewriter.js tests/typewriter.test.js
git commit -m "feat: planificador y render del efecto de tipeo"
```

---

### Task 4: Cáscara HTML y estética CRT

Acá aparece la pantalla por primera vez. Sin contenido todavía: la máquina, el color, el glow, las scanlines y la curvatura.

**Files:**
- Create: `index.html`
- Create: `css/crt.css`

**Interfaces:**
- Consumes: nada.
- Produces:
  - Variable CSS `--crt` en `:root` — escala global de intensidad. `1` arranque, `0.35` sistema, `0` apagado.
  - Clases: `.pantalla` (contenedor con curvatura), `.capa-scanlines`, `.capa-vineta`, `.apagando` (animación de apagado de CRT).
  - Estructura HTML: `#pantalla`, `#fase-arranque`, `#fase-sistema`, `#barra-estado`.

- [ ] **Step 1: Escribir `index.html`**

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Bruno Fragoso — VIERNES OS</title>
  <meta name="description" content="Portafolio de Bruno Fragoso: desarrollo web, datos y automatizacion con IA.">
  <meta name="color-scheme" content="dark">
  <meta property="og:title" content="Bruno Fragoso — VIERNES OS">
  <meta property="og:description" content="Desarrollo web, datos y automatizacion con IA.">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="css/crt.css">
  <link rel="stylesheet" href="css/tui.css">
</head>
<body>
  <div class="pantalla" id="pantalla">
    <main class="contenido" id="contenido">
      <section class="fase" id="fase-arranque" aria-live="polite"></section>
      <section class="fase oculto" id="fase-sistema" hidden></section>
    </main>
    <div class="capa-scanlines" aria-hidden="true"></div>
    <div class="capa-vineta" aria-hidden="true"></div>
  </div>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Escribir `css/crt.css`**

```css
:root {
  /* Intensidad global de los efectos CRT. 1 = arranque, 0.35 = sistema, 0 = apagado. */
  --crt: 1;

  --fondo: #050a08;
  --fosforo: #6bffc8;
  --fosforo-tenue: #3d8f74;
  --acento: #ff5ed2;
  --ambar: #ffcc66;

  --fuente: ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace;

  --glow: calc(var(--crt) * 8px);
  --opacidad-scanlines: calc(var(--crt) * 0.28);
  --curvatura: calc(var(--crt) * 0.9deg);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  height: 100%;
  background: #000;
  color: var(--fosforo);
  font-family: var(--fuente);
  font-size: 16px;
  line-height: 1.55;
  overflow: hidden;
}

.pantalla {
  position: relative;
  height: 100%;
  background:
    radial-gradient(ellipse at center, #0a1512 0%, var(--fondo) 70%, #010403 100%);
  overflow: hidden;
  transform: perspective(1400px) rotateX(var(--curvatura));
  transition: transform 1.2s ease, filter 1.2s ease;
}

.contenido {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: clamp(1rem, 3vw, 2.5rem);
  overflow: auto;
  text-shadow: 0 0 var(--glow) rgba(107, 255, 200, calc(var(--crt) * 0.7));
}

/* Scanlines: lineas horizontales del tubo. */
.capa-scanlines {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  opacity: var(--opacidad-scanlines);
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.45) 0px,
    rgba(0, 0, 0, 0.45) 1px,
    transparent 1px,
    transparent 3px
  );
}

/* Vineta: el tubo se oscurece en los bordes. */
.capa-vineta {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: var(--crt);
  background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.75) 100%);
}

/* Parpadeo sutil del fosforo. */
@keyframes parpadeo {
  0%, 100% { opacity: 1; }
  97%      { opacity: 1; }
  98%      { opacity: calc(1 - var(--crt) * 0.12); }
  99%      { opacity: 1; }
}
.pantalla { animation: parpadeo 6s infinite steps(1); }

/* Apagado de CRT: la imagen se aplasta a una linea y se va a un punto. */
@keyframes apagado {
  0%   { transform: scale(1, 1);       opacity: 1; filter: brightness(1); }
  45%  { transform: scale(1, 0.012);   opacity: 1; filter: brightness(3); }
  70%  { transform: scale(0.28, 0.008); opacity: 1; filter: brightness(4); }
  100% { transform: scale(0, 0);       opacity: 0; filter: brightness(6); }
}
.apagando { animation: apagado 700ms ease-in forwards; }

/* Aberracion cromatica: el haz no converge perfecto en los bordes. */
.contenido::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  opacity: calc(var(--crt) * 0.35);
  background: linear-gradient(
    90deg,
    rgba(255, 94, 210, 0.10) 0%,
    transparent 8%,
    transparent 92%,
    rgba(107, 200, 255, 0.10) 100%
  );
}

.cursor::after {
  content: "\2588";
  animation: latido 1s steps(2) infinite;
}
@keyframes latido { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

/* Nadie deberia marearse leyendo un portafolio. */
@media (prefers-reduced-motion: reduce) {
  .pantalla, .apagando, .cursor::after { animation: none !important; }
  .pantalla { transform: none; transition: none; }
  .apagando { opacity: 0; }
}
```

- [ ] **Step 3: Verificar a mano en el navegador**

Run: `python3 -m http.server 8137 --directory .` y abrir `http://localhost:8137`

Verificar, con los ojos:
- La pantalla se ve verde-cian sobre negro, con curvatura perceptible.
- Las scanlines son visibles pero no tapan nada.
- Los bordes se oscurecen (viñeta).
- En DevTools, cambiar `--crt` a `0.35` en `:root` atenúa todo de forma pareja.
- Con `--crt: 0`, quedan solo el color y la tipografía.

- [ ] **Step 4: Verificar reduced-motion**

En DevTools: Rendering → Emulate CSS `prefers-reduced-motion: reduce`.
Expected: la pantalla queda quieta, sin parpadeo ni curvatura animada.

- [ ] **Step 5: Commit**

```bash
git add index.html css/crt.css
git commit -m "feat: cascara HTML y estetica CRT con intensidad variable"
```

---

### Task 5: Secuencia de arranque y puerta S/N

El momento que define el sitio: negro, POST, `hello, world`, y la pregunta.

**Files:**
- Create: `js/boot.js`
- Modify: `css/crt.css` (agregar estilos de la fase de arranque al final)

**Interfaces:**
- Consumes: `tipear`, `planificar` de `js/typewriter.js` (Task 3); `t` de `js/i18n.js` (Task 1); `contenido.boot` (Task 1).
- Produces:
  - `async ejecutarArranque(opciones: { contenedor: HTMLElement, contenido: object, idioma: string, reducirMovimiento: boolean, saltar: boolean }): Promise<'entrar'>`
    Resuelve solo cuando el visitante entra. El "no" se maneja internamente (apagado, reproche, reintento) y vuelve a la pregunta.
  - `const CLAVE_VISITADO = 'viernes-os:visitado'`

- [ ] **Step 1: Escribir `js/boot.js`**

```js
import { tipear } from './typewriter.js';
import { t } from './i18n.js';

export const CLAVE_VISITADO = 'viernes-os:visitado';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function linea(texto = '', clase = '') {
  const el = document.createElement('div');
  el.className = `linea ${clase}`.trim();
  el.textContent = texto;
  return el;
}

/** Ejecuta el arranque completo. Resuelve cuando el visitante decide entrar. */
export async function ejecutarArranque({ contenedor, contenido, idioma, reducirMovimiento, saltar }) {
  const rapido = reducirMovimiento || saltar;
  contenedor.innerHTML = '';

  const botonSaltar = document.createElement('button');
  botonSaltar.className = 'saltar';
  botonSaltar.type = 'button';
  botonSaltar.textContent = t(contenido.boot.saltar, idioma);
  contenedor.append(botonSaltar);

  let salteado = rapido;
  botonSaltar.addEventListener('click', () => { salteado = true; });

  // 1. Negro con cursor.
  if (!salteado) {
    const cursor = linea('', 'cursor');
    contenedor.append(cursor);
    await esperar(800);
    cursor.remove();
  }

  // 2. POST del BIOS.
  for (const texto of contenido.boot.post) {
    contenedor.append(linea(texto, 'tenue'));
    if (!salteado) await esperar(180);
  }
  if (!salteado) await esperar(400);

  // 3. hello, world
  const saludo = linea('', 'saludo cursor');
  contenedor.append(saludo);
  await tipear(saludo, contenido.boot.saludo, {
    velocidad: 70,
    instantaneo: salteado,
  });
  saludo.classList.remove('cursor');
  if (!salteado) await esperar(500);

  // 4. La puerta.
  return preguntar({ contenedor, contenido, idioma, reducirMovimiento, botonSaltar });
}

function preguntar({ contenedor, contenido, idioma, reducirMovimiento, botonSaltar }) {
  return new Promise((resolver) => {
    botonSaltar.remove();

    const bloque = document.createElement('div');
    bloque.className = 'puerta';
    bloque.innerHTML = `
      <p class="pregunta">${t(contenido.boot.pregunta, idioma)}</p>
      <div class="opciones">
        <button type="button" class="opcion" data-respuesta="si">${idioma === 'es' ? 'S' : 'Y'} — ${idioma === 'es' ? 'SÍ' : 'YES'}</button>
        <button type="button" class="opcion" data-respuesta="no">N — NO</button>
      </div>`;
    contenedor.append(bloque);
    bloque.querySelector('[data-respuesta="si"]').focus();

    const teclasSi = idioma === 'es' ? ['s', 'S'] : ['y', 'Y'];
    const alTeclado = (evento) => {
      if (teclasSi.includes(evento.key) || evento.key === 'Enter') responder('si');
      else if (evento.key === 'n' || evento.key === 'N') responder('no');
    };
    document.addEventListener('keydown', alTeclado);

    bloque.addEventListener('click', (evento) => {
      const boton = evento.target.closest('[data-respuesta]');
      if (boton) responder(boton.dataset.respuesta);
    });

    async function responder(respuesta) {
      document.removeEventListener('keydown', alTeclado);
      if (respuesta === 'si') {
        bloque.remove();
        contenedor.append(linea(t(contenido.boot.entrando, idioma), 'concedido'));
        if (!reducirMovimiento) await esperar(600);
        resolver('entrar');
        return;
      }
      await rechazar({ contenedor, contenido, idioma, reducirMovimiento });
      contenedor.innerHTML = '';
      for (const texto of contenido.boot.post) contenedor.append(linea(texto, 'tenue'));
      contenedor.append(linea(contenido.boot.saludo, 'saludo'));
      resolver(await preguntar({ contenedor, contenido, idioma, reducirMovimiento,
                                botonSaltar: document.createElement('button') }));
    }
  });
}

/** El "no": glitch, apagado de CRT, y una segunda oportunidad. */
async function rechazar({ contenedor, contenido, idioma, reducirMovimiento }) {
  const pantalla = document.getElementById('pantalla');
  contenedor.append(linea(t(contenido.boot.rechazo, idioma), 'rechazo'));
  await esperar(reducirMovimiento ? 100 : 500);

  pantalla.classList.add('apagando');
  await esperar(reducirMovimiento ? 100 : 700);

  contenedor.innerHTML = '';
  await esperar(reducirMovimiento ? 100 : 1600);

  pantalla.classList.remove('apagando');
  const reproche = linea('', 'reproche');
  contenedor.append(reproche);
  await tipear(reproche, t(contenido.boot.reproche, idioma), {
    velocidad: 90, instantaneo: reducirMovimiento,
  });
  await esperar(reducirMovimiento ? 100 : 700);

  return new Promise((resolver) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'opcion reintentar';
    boton.textContent = t(contenido.boot.reintentar, idioma);
    contenedor.append(boton);
    boton.focus();
    boton.addEventListener('click', () => resolver());
    document.addEventListener('keydown', function alEnter(evento) {
      if (evento.key === 'Enter' || evento.key === ' ') {
        document.removeEventListener('keydown', alEnter);
        resolver();
      }
    });
  });
}
```

- [ ] **Step 2: Agregar los estilos de arranque al final de `css/crt.css`**

```css
/* ---------- Fase de arranque ---------- */
.fase { max-width: 70ch; margin: 0 auto; }
.linea { white-space: pre-wrap; }
.linea.tenue { color: var(--fosforo-tenue); font-size: 0.9rem; }
.saludo { font-size: clamp(1.6rem, 6vw, 3rem); margin: 1.5rem 0; letter-spacing: 0.04em; }
.rechazo { color: var(--acento); margin-top: 1rem; }
.reproche { color: var(--fosforo-tenue); font-size: 1.2rem; }
.concedido { color: var(--ambar); margin-top: 1rem; }

.puerta { margin-top: 2rem; }
.pregunta { font-size: clamp(1rem, 3vw, 1.4rem); margin: 0 0 1rem; }
.opciones { display: flex; gap: 1rem; flex-wrap: wrap; }

.opcion {
  font: inherit;
  color: var(--fosforo);
  background: transparent;
  border: 1px solid var(--fosforo-tenue);
  padding: 0.6rem 1.4rem;
  cursor: pointer;
  text-shadow: inherit;
  min-height: 44px;
}
.opcion:hover, .opcion:focus-visible {
  color: var(--fondo);
  background: var(--fosforo);
  outline: none;
}
.opcion:focus-visible { box-shadow: 0 0 0 2px var(--acento); }

.saltar {
  position: absolute;
  top: 1rem; right: 1rem;
  font: inherit; font-size: 0.8rem;
  color: var(--fosforo-tenue);
  background: transparent; border: none;
  cursor: pointer; text-decoration: underline;
  min-height: 44px;
}
.saltar:hover, .saltar:focus-visible { color: var(--fosforo); }
```

- [ ] **Step 3: Cablear temporalmente `js/main.js` para poder probar**

```js
import contenido from './contenido.js';
import { detectarIdioma } from './i18n.js';
import { ejecutarArranque, CLAVE_VISITADO } from './boot.js';

const leer = (clave) => { try { return localStorage.getItem(clave); } catch { return null; } };
const guardar = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch { /* modo privado */ } };

const idioma = detectarIdioma(navigator.languages ?? [navigator.language], leer('viernes-os:idioma'));
const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const visitado = leer(CLAVE_VISITADO) === '1';

ejecutarArranque({
  contenedor: document.getElementById('fase-arranque'),
  contenido, idioma, reducirMovimiento, saltar: visitado,
}).then(() => {
  guardar(CLAVE_VISITADO, '1');
  document.getElementById('fase-arranque').hidden = true;
  const sistema = document.getElementById('fase-sistema');
  sistema.hidden = false;
  sistema.textContent = 'SISTEMA — pendiente de Task 6';
  document.documentElement.style.setProperty('--crt', '0.35');
});
```

- [ ] **Step 4: Verificar a mano**

Run: `python3 -m http.server 8137 --directory .`

Verificar:
- Negro con cursor, POST, `hello, world` tipeado, y la pregunta.
- `S` (o `Y` en inglés) entra. `N` dispara el apagado de CRT, el `...¿en serio?` y el `[REINTENTAR]`.
- El botón `saltar intro` corta la secuencia en cualquier momento.
- Recargar: la segunda visita saltea sola.
- Borrar localStorage y recargar: vuelve la secuencia completa.
- Con `prefers-reduced-motion`: sin tipeo ni apagado, pero la pregunta aparece igual.
- Solo con teclado: se puede entrar sin tocar el mouse.
- Al entrar, `--crt` baja a 0.35 y se nota que la pantalla se estabiliza.

- [ ] **Step 5: Commit**

```bash
git add js/boot.js js/main.js css/crt.css
git commit -m "feat: secuencia de arranque y puerta de entrada"
```

---

### Task 6: La TUI

El sistema propiamente dicho: chrome, secciones, render del contenido y navegación completa.

**Files:**
- Create: `css/tui.css`
- Create: `js/tui.js`
- Modify: `js/main.js` (reemplazar el cableado temporal de Task 5)

**Interfaces:**
- Consumes: `crearEstado`, `reducir`, `accionDesdeTecla` de `js/nav.js` (Task 2); `t` de `js/i18n.js`; `contenido` (Task 1).
- Produces:
  - `montarTUI(opciones: { contenedor: HTMLElement, contenido: object, idioma: string, alCambiarIdioma: (idioma: string) => void }): { destruir: () => void }`

- [ ] **Step 1: Escribir `css/tui.css`**

```css
.sistema {
  display: grid;
  grid-template-areas: "titulo titulo" "menu panel" "estado estado";
  grid-template-columns: minmax(9rem, 14rem) 1fr;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  gap: 0;
  border: 1px solid var(--fosforo-tenue);
}

.barra-titulo {
  grid-area: titulo;
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  padding: 0.4rem 0.8rem;
  border-bottom: 1px solid var(--fosforo-tenue);
  font-size: 0.85rem;
  color: var(--ambar);
}

.menu {
  grid-area: menu;
  border-right: 1px solid var(--fosforo-tenue);
  padding: 0.5rem 0;
  overflow: auto;
}
.menu button {
  display: block; width: 100%;
  font: inherit; text-align: left;
  color: var(--fosforo-tenue);
  background: transparent; border: none;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
  min-height: 44px;
}
.menu button::before { content: "  "; white-space: pre; }
.menu button[aria-current="true"] { color: var(--fondo); background: var(--fosforo); }
.menu button[aria-current="true"]::before { content: "> "; }
.menu button:hover:not([aria-current="true"]) { color: var(--fosforo); }
.menu button:focus-visible { outline: 2px solid var(--acento); outline-offset: -2px; }

.panel { grid-area: panel; padding: 1rem 1.2rem; overflow: auto; }
.panel h2 { margin: 0 0 1rem; font-size: 1rem; color: var(--ambar); letter-spacing: 0.1em; }
.panel p { max-width: 68ch; }

.barra-estado {
  grid-area: estado;
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  flex-wrap: wrap;
  padding: 0.4rem 0.8rem;
  border-top: 1px solid var(--fosforo-tenue);
  font-size: 0.78rem;
  color: var(--fosforo-tenue);
}
.barra-estado button {
  font: inherit; color: var(--fosforo-tenue);
  background: transparent; border: 1px solid transparent;
  cursor: pointer; padding: 0.25rem 0.5rem;
  min-height: 44px;
}
.barra-estado button:hover, .barra-estado button:focus-visible {
  color: var(--fosforo); border-color: var(--fosforo-tenue); outline: none;
}

.lista-archivos { list-style: none; margin: 0; padding: 0; }
.lista-archivos li { margin-bottom: 0.3rem; }
.lista-archivos button {
  display: flex; gap: 1rem; width: 100%;
  font: inherit; text-align: left;
  color: var(--fosforo); background: transparent;
  border: 1px solid var(--fosforo-tenue);
  padding: 0.7rem 0.9rem; cursor: pointer;
  min-height: 44px;
}
.lista-archivos button:hover, .lista-archivos button:focus-visible,
.lista-archivos button[data-foco="true"] {
  color: var(--fondo); background: var(--fosforo); outline: none;
}
.etiqueta-archivo { color: var(--acento); flex-shrink: 0; }
.lista-archivos button:hover .etiqueta-archivo,
.lista-archivos button[data-foco="true"] .etiqueta-archivo { color: var(--fondo); }

.detalle { border: 1px solid var(--acento); padding: 1rem; }
.detalle .stack { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
.detalle .stack span { border: 1px solid var(--fosforo-tenue); padding: 0.15rem 0.5rem; font-size: 0.8rem; }
.detalle a { color: var(--acento); }

.proceso { border-left: 2px solid var(--fosforo-tenue); padding-left: 0.9rem; margin-bottom: 1.2rem; }
.proceso .estado { color: var(--ambar); font-size: 0.8rem; }

.grupo-stack { margin-bottom: 1.2rem; }
.grupo-stack h3 { margin: 0 0 0.4rem; font-size: 0.85rem; color: var(--ambar); }

.evento { margin-bottom: 1.2rem; }
.evento .periodo { color: var(--fosforo-tenue); font-size: 0.8rem; }
.evento h3 { margin: 0.1rem 0 0.3rem; font-size: 0.95rem; }

/* Celular: el menu lateral pasa a pestanas arriba. */
@media (max-width: 42rem) {
  .sistema {
    grid-template-areas: "titulo" "menu" "panel" "estado";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
  }
  .menu {
    display: flex; overflow-x: auto;
    border-right: none; border-bottom: 1px solid var(--fosforo-tenue);
    padding: 0;
  }
  .menu button { width: auto; white-space: nowrap; padding: 0.6rem 0.9rem; }
  .menu button::before { content: ""; }
  .barra-estado { font-size: 0.7rem; }
  .barra-estado .teclas { display: none; }
}
```

- [ ] **Step 2: Escribir `js/tui.js`**

```js
import { crearEstado, reducir, accionDesdeTecla } from './nav.js';
import { t } from './i18n.js';

const crear = (etiqueta, clase = '', texto = '') => {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto) el.textContent = texto;
  return el;
};

/** Envuelve un elemento en otro y devuelve el contenedor. */
const envolverEn = (etiqueta, hijo, clase = '') => {
  const padre = crear(etiqueta, clase);
  padre.append(hijo);
  return padre;
};

export function montarTUI({ contenedor, contenido, idioma, alCambiarIdioma }) {
  const ids = contenido.secciones.map((s) => s.id);
  let estado = crearEstado(ids);

  contenedor.innerHTML = '';
  const raiz = crear('div', 'sistema');

  // --- Barra de titulo
  const titulo = crear('header', 'barra-titulo');
  titulo.append(crear('span', '', `${contenido.meta.nombre} v${contenido.meta.version}`));
  titulo.append(crear('span', '', '[MEM 640K OK]'));
  raiz.append(titulo);

  // --- Menu de secciones
  const menu = crear('nav', 'menu');
  menu.setAttribute('aria-label', idioma === 'es' ? 'Secciones' : 'Sections');
  for (const seccion of contenido.secciones) {
    const boton = crear('button', '', t(seccion.etiqueta, idioma));
    boton.type = 'button';
    boton.dataset.seccion = seccion.id;
    boton.addEventListener('click', () => aplicar({ tipo: 'seccion', id: seccion.id }));
    menu.append(boton);
  }
  raiz.append(menu);

  // --- Panel de contenido
  const panel = crear('div', 'panel');
  panel.id = 'panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-live', 'polite');
  raiz.append(panel);

  // --- Barra de estado
  const estadoBarra = crear('footer', 'barra-estado');
  const teclas = crear('span', 'teclas',
    idioma === 'es' ? '↑↓ mover · ←→ seccion · ENTER abrir · ESC volver'
                    : '↑↓ move · ←→ section · ENTER open · ESC back');
  const controles = crear('div');
  const botonIdioma = crear('button', '', idioma === 'es' ? 'ES / en' : 'es / EN');
  botonIdioma.type = 'button';
  botonIdioma.addEventListener('click', () => alCambiarIdioma(idioma === 'es' ? 'en' : 'es'));
  const botonCrt = crear('button', '', 'CRT: ON');
  botonCrt.type = 'button';
  let crtEncendido = true;
  botonCrt.addEventListener('click', () => {
    crtEncendido = !crtEncendido;
    document.documentElement.style.setProperty('--crt', crtEncendido ? '0.35' : '0');
    botonCrt.textContent = crtEncendido ? 'CRT: ON' : 'CRT: OFF';
  });
  controles.append(botonIdioma, botonCrt);
  estadoBarra.append(teclas, controles);
  raiz.append(estadoBarra);

  contenedor.append(raiz);

  // --- Render
  function itemsDeSeccion() {
    if (estado.seccion === 'archivos') return contenido.archivos;
    return [];
  }

  function aplicar(accion) {
    if (!accion) return;
    const siguiente = reducir(estado, accion, { cantidadItems: itemsDeSeccion().length });
    if (siguiente === estado) return;
    estado = siguiente;
    render();
  }

  function render() {
    for (const boton of menu.querySelectorAll('button')) {
      boton.setAttribute('aria-current', String(boton.dataset.seccion === estado.seccion));
    }
    panel.innerHTML = '';
    const seccion = contenido.secciones.find((s) => s.id === estado.seccion);
    panel.append(crear('h2', '', t(seccion.etiqueta, idioma)));
    RENDERS[estado.seccion](panel);
  }

  const RENDERS = {
    whoami(destino) {
      destino.append(crear('p', '', `${contenido.whoami.nombre} — ${t(contenido.whoami.ubicacion, idioma)}`));
      for (const parrafo of contenido.whoami.parrafos) destino.append(crear('p', '', t(parrafo, idioma)));
      const lista = crear('ul');
      for (const pilar of contenido.whoami.pilares) lista.append(crear('li', '', t(pilar, idioma)));
      destino.append(lista);
    },

    archivos(destino) {
      if (estado.abierto) {
        const archivo = contenido.archivos.find((a) => a.id === estado.abierto);
        const caja = crear('div', 'detalle');
        caja.append(crear('h3', '', t(archivo.nombre, idioma)));
        caja.append(crear('p', '', t(archivo.detalle, idioma)));
        const stack = crear('div', 'stack');
        for (const item of archivo.stack) stack.append(crear('span', '', item));
        caja.append(stack);
        if (archivo.enlace) {
          const enlace = crear('a', '', archivo.enlace.replace('https://', ''));
          enlace.href = archivo.enlace;
          enlace.rel = 'noopener';
          enlace.target = '_blank';
          caja.append(envolverEn('p', enlace));
        }
        const volver = crear('button', 'opcion', idioma === 'es' ? '← VOLVER' : '← BACK');
        volver.type = 'button';
        volver.addEventListener('click', () => aplicar({ tipo: 'cerrar' }));
        caja.append(volver);
        destino.append(caja);
        volver.focus();
        return;
      }
      const lista = crear('ul', 'lista-archivos');
      contenido.archivos.forEach((archivo, i) => {
        const boton = crear('button');
        boton.type = 'button';
        boton.dataset.foco = String(i === estado.indice);
        boton.append(crear('span', 'etiqueta-archivo', `[${t(archivo.etiqueta, idioma)}]`));
        boton.append(crear('span', '', t(archivo.nombre, idioma)));
        boton.append(crear('span', '', t(archivo.resumen, idioma)));
        boton.addEventListener('click', () => aplicar({ tipo: 'abrir', id: archivo.id }));
        lista.append(envolverEn('li', boton));
      });
      destino.append(lista);
    },

    procesos(destino) {
      for (const proceso of contenido.procesos) {
        const caja = crear('div', 'proceso');
        caja.append(crear('div', 'estado', `[${t(proceso.estado, idioma)}]`));
        caja.append(crear('h3', '', t(proceso.nombre, idioma)));
        caja.append(crear('p', '', t(proceso.detalle, idioma)));
        destino.append(caja);
      }
    },

    stack(destino) {
      for (const grupo of contenido.stack) {
        const caja = crear('div', 'grupo-stack');
        caja.append(crear('h3', '', t(grupo.grupo, idioma)));
        caja.append(crear('p', '', grupo.items.join(' · ')));
        destino.append(caja);
      }
    },

    trayectoria(destino) {
      for (const evento of contenido.trayectoria) {
        const caja = crear('div', 'evento');
        caja.append(crear('div', 'periodo', t(evento.periodo, idioma)));
        caja.append(crear('h3', '', t(evento.titulo, idioma)));
        caja.append(crear('p', '', t(evento.detalle, idioma)));
        destino.append(caja);
      }
    },

    contacto(destino) {
      for (const linea of contenido.contacto.lineas) destino.append(crear('p', '', t(linea, idioma)));
      const lista = crear('ul');
      for (const enlace of contenido.contacto.enlaces) {
        const a = crear('a', '', enlace.etiqueta);
        a.href = enlace.url; a.rel = 'noopener'; a.target = '_blank';
        lista.append(envolverEn('li', a));
      }
      destino.append(lista);
      const idiomas = crear('p', '', contenido.contacto.idiomas.map((i) => t(i, idioma)).join(' · '));
      destino.append(idiomas);
    },
  };

  // --- Teclado
  const alTeclado = (evento) => {
    if (evento.target.matches('input, textarea')) return;
    if (evento.key === 'Enter' && estado.seccion === 'archivos' && !estado.abierto) {
      const archivo = contenido.archivos[estado.indice];
      if (archivo) { evento.preventDefault(); aplicar({ tipo: 'abrir', id: archivo.id }); }
      return;
    }
    const accion = accionDesdeTecla(evento.key, estado);
    if (accion) { evento.preventDefault(); aplicar(accion); }
  };
  document.addEventListener('keydown', alTeclado);

  render();
  return { destruir() { document.removeEventListener('keydown', alTeclado); contenedor.innerHTML = ''; } };
}
```

- [ ] **Step 3: Reescribir `js/main.js` completo**

```js
import contenido from './contenido.js';
import { detectarIdioma } from './i18n.js';
import { ejecutarArranque, CLAVE_VISITADO } from './boot.js';
import { montarTUI } from './tui.js';

const CLAVE_IDIOMA = 'viernes-os:idioma';

const leer = (clave) => { try { return localStorage.getItem(clave); } catch { return null; } };
const guardar = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch { /* modo privado */ } };

const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
let idioma = detectarIdioma(navigator.languages ?? [navigator.language], leer(CLAVE_IDIOMA));
let tui = null;

const faseArranque = document.getElementById('fase-arranque');
const faseSistema = document.getElementById('fase-sistema');

function entrarAlSistema() {
  document.documentElement.lang = idioma;
  document.documentElement.style.setProperty('--crt', '0.35');
  faseArranque.hidden = true;
  faseSistema.hidden = false;
  if (tui) tui.destruir();
  tui = montarTUI({
    contenedor: faseSistema,
    contenido,
    idioma,
    alCambiarIdioma(nuevo) {
      idioma = nuevo;
      guardar(CLAVE_IDIOMA, nuevo);
      entrarAlSistema();
    },
  });
}

ejecutarArranque({
  contenedor: faseArranque,
  contenido,
  idioma,
  reducirMovimiento,
  saltar: leer(CLAVE_VISITADO) === '1',
}).then(() => {
  guardar(CLAVE_VISITADO, '1');
  entrarAlSistema();
});
```

- [ ] **Step 4: Correr los tests para confirmar que nada se rompió**

Run: `node --test tests/`
Expected: PASS — todos.

- [ ] **Step 5: Verificar a mano**

Run: `python3 -m http.server 8137 --directory .`

Verificar:
- Las seis secciones aparecen y se abren.
- `ARCHIVOS` lista los seis proyectos; Enter abre el que tiene el foco; Esc vuelve.
- Flechas ↑↓ mueven dentro de archivos, ←→ cambian de sección.
- El toggle de idioma cambia todo el texto y sobrevive a una recarga.
- El toggle `CRT: ON/OFF` apaga y prende los efectos.
- Clic funciona en todo sin tocar el teclado.
- Tab recorre todos los controles y el foco se ve.

- [ ] **Step 6: Commit**

```bash
git add css/tui.css js/tui.js js/main.js
git commit -m "feat: TUI navegable con las seis secciones"
```

---

### Task 7: Pasada de verificación

Nada nuevo. Se recorre el sitio contra las seis restricciones no negociables del spec §8 y se arregla lo que falle.

**Files:**
- Modify: cualquiera que falle la verificación.

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: nada nuevo. Deja el sitio listo para desplegar.

- [ ] **Step 1: Confirmar que no se filtró contacto privado**

```bash
grep -rniE "@[a-z0-9.-]+\.[a-z]{2,}|\+?52[ 0-9().-]{8,}|moreton" \
  index.html css/ js/ --include="*.html" --include="*.css" --include="*.js"
```
Expected: sin resultados. Cualquier coincidencia se borra antes de seguir.

- [ ] **Step 2: Recorrido solo con teclado**

Sin tocar el mouse: entrar, visitar las seis secciones, abrir y cerrar dos archivos, cambiar idioma, apagar CRT.
Expected: todo alcanzable, el foco siempre visible.

- [ ] **Step 3: Recorrido solo con mouse**

Sin tocar el teclado: lo mismo.
Expected: todo alcanzable. Las flechas nunca son obligatorias.

- [ ] **Step 4: Reduced motion**

DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`. Borrar localStorage y recargar.
Expected: sin tipeo, sin parpadeo, sin glitch ni apagado. Todo el contenido presente.

- [ ] **Step 5: Celular**

DevTools responsive a 360 px de ancho.
Expected: el menú es una fila de pestañas desplazable, el contenido en una columna, sin scroll horizontal, los toques cómodos (44 px mínimo).

- [ ] **Step 6: Firefox**

Repetir el recorrido completo en Firefox.
Expected: idéntico. Prestar atención a la curvatura y al apagado, que usan transformes.

- [ ] **Step 7: Contraste**

DevTools → Lighthouse → Accessibility, o inspeccionar el contraste del texto tenue.
Expected: el texto del cuerpo pasa. Si `--fosforo-tenue` sobre el fondo no llega, se aclara el color — el glow no compensa contraste bajo.

- [ ] **Step 8: Commit de los arreglos**

```bash
git add -A
git commit -m "fix: arreglos de la pasada de verificacion"
```

---

### Task 8: Despliegue

**Files:**
- Create: `wrangler.toml`
- Modify: `README.md`

**Interfaces:**
- Consumes: el sitio completo.
- Produces: el sitio publicado.

- [ ] **Step 1: Escribir `wrangler.toml`**

```toml
name = "viernes-os"
compatibility_date = "2025-09-19"

[assets]
directory = "."
not_found_handling = "single-page-application"
```

- [ ] **Step 2: Reescribir `README.md`**

```markdown
# VIERNES OS

Portafolio personal de Bruno Fragoso, construido como un sistema operativo
ficticio de los años 80.

En vivo: https://viernes137.github.io

## Cómo correrlo

No hay build ni dependencias. Cualquier servidor estático alcanza:

```bash
python3 -m http.server 8137
```

## Tests

Runner nativo de Node, sin instalar nada:

```bash
node --test tests/
```

## Editar el contenido

Todo el texto del sitio vive en `js/contenido.js`, en español e inglés.
Es el único archivo que hay que tocar para actualizar el portafolio.

## Despliegue

- **GitHub Pages**: automático al empujar a `main`.
- **Cloudflare Workers**: `npx wrangler deploy`
```

- [ ] **Step 3: Verificar que el despliegue local funciona**

Run: `npx wrangler dev`
Expected: sirve el sitio; el arranque y la TUI andan igual que con el servidor de Python.

- [ ] **Step 4: Commit**

```bash
git add wrangler.toml README.md
git commit -m "chore: configuracion de despliegue y documentacion"
```

- [ ] **Step 5: Publicar**

Preguntar a Bruno antes de empujar. Con su visto bueno:

```bash
git push origin main       # publica en GitHub Pages
npx wrangler deploy        # publica en el Worker
```

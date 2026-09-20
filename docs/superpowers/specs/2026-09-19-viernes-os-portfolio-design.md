# VIERNES OS — Portafolio personal de Bruno Fragoso

Fecha: 2026-09-19
Estado: diseño aprobado, pendiente de revisión final

## 1. Objetivo

Un portafolio personal público que presente a Bruno Fragoso Márquez como
profesional de tecnología, construido como un sistema operativo ficticio
de los años 80 llamado VIERNES OS.

El objetivo no es la nostalgia por sí misma. Es que alguien que recibe el
link lo recuerde al día siguiente, y que en el camino lea lo que Bruno
hizo. Si la estética gana y el contenido se pierde, el sitio falló.

## 2. Audiencia

En orden de prioridad:

1. Reclutadores técnicos, locales e internacionales, incluido fintech.
2. Clientes potenciales de la agencia Mablo y de trabajo freelance.
3. Pares y comunidad técnica.

Ninguno de los tres va a escribir comandos para ver un proyecto. El
sistema se navega con flechas, con Tab y con clic.

## 3. Posicionamiento

Tres pilares, los tres con evidencia real detrás:

| Pilar | Evidencia |
|---|---|
| Desarrollo web | Plantasia (full-stack + IoT + Docker), dashboard de commodities (FastAPI + React), agencia Mablo con clientes, freelance |
| Datos y análisis | Pipeline end-to-end en Omniscient, Pandas/NumPy, Power BI, dashboards de bases de datos |
| Automatización e IA aplicada | Flujos de n8n con pasos de IA corriendo para clientes reales |

Decisión explícita: **no se presenta "machine learning" como pilar.** El ML
concreto de Bruno hoy son dos regresiones lineales, una de ellas un
ejercicio académico con R² de 0.20. Presentarlo como pilar crea una
promesa que el contenido no sostiene y que una entrevista técnica expone.
El ML aparece descrito con precisión dentro de los proyectos donde se usó,
y la profundización aparece como proceso en curso.

## 4. Decisiones tomadas

| Decisión | Elección | Razón |
|---|---|---|
| Estructura interna | TUI navegable, no terminal de comandos | Conserva el concepto completo sin esconder el contenido detrás de saber escribir `ls` |
| Idioma | Bilingüe ES/EN con toggle | CV en inglés y sector fintech angloparlante, pero base en CDMX y clientes locales |
| Stack | HTML/CSS/JS vanilla con módulos ES nativos | Sin build, sin dependencias. Decisión de Bruno |
| Despliegue | Cloudflare Worker con static assets | Decisión de Bruno |
| Contacto | Solo LinkedIn | Sin correo ni teléfono: son scrapeados en horas en una página pública |
| Proyecto del hedge fund | Descrito sin nombrar al cliente | Práctica estándar en finanzas, sin riesgo contractual |
| ML | Descrito con precisión, sin inflar | Ver sección 3 |

## 5. Flujo de la experiencia

### 5.1 Arranque (~6 s, salteable)

1. Negro. Un cursor parpadea 800 ms. Nada más.
2. POST tipo BIOS: chequeo de memoria, detección de dispositivos. ~2 s.
3. `hello, world` tipeado a máquina, con el cursor siguiéndolo.
4. La puerta: `> ¿INICIAR SESIÓN? [S/N]`

El arranque se puede saltar en cualquier momento. En la segunda visita el
sitio recuerda (localStorage) que ya se vio y ofrece saltarlo de entrada.
Nadie espera seis segundos dos veces.

### 5.2 La puerta

**SÍ** (tecla S, Enter, o clic) → secuencia corta de login → el sistema.

**NO** (tecla N o clic) → glitch, `CONEXIÓN TERMINADA`, y apagado de CRT
real: la imagen se aplasta a una línea horizontal y se desvanece a un
punto. Dos segundos de negro. Después, tenue: `...¿en serio?` con un
botón `[REINTENTAR]`.

El "no" se ríe con el visitante, no de él. No es un castigo ni un
callejón sin salida: siempre hay vuelta.

### 5.3 El sistema

Chrome de TUI: barra de título arriba (nombre del sistema, indicadores),
lista de secciones a la izquierda, barra de estado abajo con las teclas
disponibles y los toggles de idioma y CRT.

Navegación: flechas + Enter + Esc, Tab, y clic. Las tres siempre.

## 6. Secciones

| Sección | Contenido |
|---|---|
| `WHOAMI` | Dos párrafos: estudiante de Inteligencia de Datos y Ciberseguridad en la Universidad Panamericana, desarrollador full-stack, actualmente trabajando en un hedge fund. Los tres pilares. |
| `ARCHIVOS` | Proyectos entregados. Cada uno se abre como un archivo del sistema. |
| `PROCESOS` | Lo que está en curso, presentado como procesos activos con estado, al estilo `ps`. |
| `STACK` | Lenguajes y herramientas, agrupados como reporte de hardware del sistema. |
| `TRAYECTORIA` | Mablo, hedge fund, freelance, UP, formación. Formato de log con fechas. |
| `CONTACTO` | LinkedIn y GitHub. Sin correo, sin teléfono. |

### 6.1 ARCHIVOS, en orden de fuerza

1. **Análisis técnico de materias primas** — Plataforma de análisis para un
   hedge fund. Visualización de contratos de futuros, motor de series
   derivadas (spreads, butterflies con pesos configurables), análisis de
   estacionalidad año a año, indicadores SMA-20 y MACD, carga de Parquet.
   FastAPI + React + Pandas + SQLAlchemy + Docker. Sin nombrar al cliente.

2. **Automatización con agentes de IA** — Flujos de n8n con pasos de IA
   entregados a clientes de la agencia y freelance.
   *(Pendiente de Bruno: qué automatizan, qué modelo/API usan, cuántos
   clientes. Ver sección 13.)*

3. **Plantasia** — Plataforma IoT de cuidado de plantas. Macetas con ESP32
   que reportan temperatura, luz y humedad a una API, y una web para
   monitorearlas en tiempo real. React/Vite + Flask + PostgreSQL + C++ +
   Docker Compose. Es el proyecto que prueba hardware, backend y frontend
   en una sola pieza.

4. **Omniscient** — Mapeo de riesgo urbano. Aplicación full-stack con mapa
   interactivo y reportes comunitarios en tiempo real, sobre un pipeline
   propio: recolección, limpieza, modelado y visualización. La predicción
   de robos usa regresión lineal sobre incidentes históricos y patrones de
   ubicación. El peso está en el pipeline y el producto; el modelo se
   nombra sin adornos.

5. **Psyche** — Plataforma de telepsicología multiusuario: psicólogos y
   pacientes se conectan, agendan sesiones y comparten recursos. Backend,
   esquema de base de datos y frontend. Proyecto académico 2022–2023.

6. **Trabajo académico** — Agrupados, sin inflar: sistemas operativos
   (Python), arquitectura de datos (Assembly), dashboard de bases de datos
   avanzadas (JavaScript).

### 6.2 PROCESOS

Dos entradas con estado tipo `ps`:

- Profundización en IA/ML — más allá de modelos lineales.
- `viernes-os` — este sitio.

## 7. Diseño visual

Fósforo verde-cian sobre negro azulado. Acentos magenta para lo
interactivo. Efectos: scanlines, glow de fósforo, curvatura de pantalla,
parpadeo sutil, viñeta, aberración cromática leve en los bordes.

**Regla central:** los efectos que hacen que una terminal vieja se vea
bien también hacen que el texto se lea mal. Por lo tanto:

Se definen dos niveles concretos, controlados por una sola variable CSS
(`--crt`) que escala todos los efectos a la vez:

- **Arranque (`--crt: 1`)**: efectos al máximo. Glow amplio, scanlines
  marcadas, curvatura y parpadeo visibles. No hay nada que leer y el
  impacto lo es todo.
- **Sistema (`--crt: 0.35`)**: glow reducido a un halo mínimo, scanlines
  apenas perceptibles, sin parpadeo, curvatura leve. El texto se lee sin
  esfuerzo. La bajada es gradual y forma parte de la experiencia: la
  máquina se estabiliza al encender.
- **Toggle `CRT: ON/OFF`** en la barra de estado: `OFF` lleva `--crt` a
  `0`, dejando solo el color y la tipografía.

## 8. Restricciones no negociables

Estas no se sacrifican por estética:

1. Todo el contenido es alcanzable con teclado y con mouse. Las flechas
   son un atajo, no un requisito.
2. `prefers-reduced-motion` desactiva tipeo, parpadeo, glitch y la
   animación de apagado. El contenido sigue siendo el mismo.
3. El arranque es salteable siempre, y se saltea solo en visitas
   repetidas.
4. El texto del sistema cumple contraste legible. El glow no compensa
   bajo contraste: se usa sobre color ya legible.
5. En celular la barra lateral se convierte en pestañas horizontales y
   el contenido fluye en una columna.
6. Sin correo ni teléfono en ninguna parte del HTML.

## 9. Arquitectura

```
index.html
wrangler.toml          Worker con static assets
css/
  crt.css              scanlines, glow, curvatura, apagado
  tui.css              layout del sistema: chrome, sidebar, paneles
js/
  main.js              arranque y ruteo entre fases
  boot.js              secuencia de encendido y puerta S/N
  nav.js               máquina de estados de navegación (pura, sin DOM)
  tui.js               render del sistema, foco, teclado
  typewriter.js        planificación y render del tipeo
  i18n.js              detección de idioma y resolución de textos
  contenido.js         todo el texto, en ambos idiomas
tests/
  i18n.test.js         node --test, sin dependencias
  nav.test.js
  typewriter.test.js
```

Los módulos puros (`nav`, `i18n`, la planificación de `typewriter`) no
tocan el DOM, y por eso se testean de verdad con el runner nativo de Node.
El DOM y los efectos CRT se verifican a mano según §11. `tests/` no se
despliega.

Módulos ES nativos, sin build y sin `npm install`. Todo el contenido vive
en `contenido.js`: es el único archivo que Bruno necesita tocar para
actualizar el portafolio.

Cada módulo tiene un propósito único y una interfaz declarada. `boot.js`
no sabe nada de la TUI; emite un evento cuando termina. `tui.js` no sabe
de idiomas; pide textos a `i18n.js`. `typewriter.js` no sabe de contenido.

## 10. Despliegue

Cloudflare Worker sirviendo assets estáticos, vía `wrangler.toml` con
binding de assets. Sin paso de build: `wrangler deploy` publica los
archivos tal como están.

## 11. Verificación

Sin framework de tests. Verificación manual, con evidencia:

- Chrome y Firefox, escritorio.
- Ancho de celular (360 px) y tablet.
- Recorrido completo usando solo teclado, sin tocar el mouse.
- Recorrido completo usando solo mouse, sin tocar el teclado.
- `prefers-reduced-motion: reduce` activado.
- Toggle de idioma en cada sección.
- Toggle CRT encendido y apagado.
- `grep` final confirmando que no hay correo ni teléfono en el build.

## 12. Fuera de alcance

Deliberadamente excluido de esta versión:

- Blog o sección de escritura.
- Formulario de contacto (requiere backend; LinkedIn alcanza).
- Analítica.
- Dominio propio (se resuelve después, sobre `workers.dev`).
- Sonido. Tentador para una terminal, pero el audio automático espanta.
- Modo claro. Una terminal CRT no tiene modo claro.
- Línea de comandos oculta (`ls`, `whoami`, `sudo`). Es un buen detalle,
  pero es decorado sobre una navegación que ya funciona. Se suma después
  de que el sitio esté publicado, no antes.

## 13. Pendiente de Bruno

1. **Automatizaciones con n8n**: qué automatizan concretamente, qué
   modelo o API de IA usan, y cuántos clientes las usan. Sin esto la
   entrada queda genérica, y es el proyecto que sostiene el tercer pilar.
2. **Confirmar** que no hay impedimento contractual para describir el
   trabajo del hedge fund, aun sin nombrarlo.
3. **Capturas o demo** de Omniscient y Psyche, si existen. Si los repos
   están privados o perdidos, las entradas van sin imagen.

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
  // tabindex -1: no entra en el orden de Tab, pero sirve de destino de foco de
  // respaldo cuando el panel se reconstruye y no hay un elemento mas especifico
  // al que devolver el foco (ver render()).
  panel.tabIndex = -1;
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
  /* Tres niveles en vez de un interruptor: ALTO para quien quiere la maquina
     vieja entera, MEDIO para leer comodo, OFF para quien solo quiere el texto. */
  const NIVELES_CRT = [
    { valor: '1',   etiqueta: 'CRT: ALTO' },
    { valor: '0.7', etiqueta: 'CRT: MEDIO' },
    { valor: '0',   etiqueta: 'CRT: OFF' },
  ];
  let nivelCrt = 0;   // arranca en ALTO
  const botonCrt = crear('button', '', NIVELES_CRT[nivelCrt].etiqueta);
  botonCrt.type = 'button';
  botonCrt.addEventListener('click', () => {
    nivelCrt = (nivelCrt + 1) % NIVELES_CRT.length;
    document.documentElement.style.setProperty('--crt', NIVELES_CRT[nivelCrt].valor);
    botonCrt.textContent = NIVELES_CRT[nivelCrt].etiqueta;
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
    // El panel se reconstruye por completo mas abajo: si el foco de teclado
    // estaba en un elemento de dentro del panel (por ejemplo, un item de la
    // lista de archivos alcanzado con Tab, o el boton "volver" de un detalle),
    // ese nodo se destruye y el navegador manda el foco a <body>. Eso rompe la
    // navegacion por teclado (Tab deja de tener un punto de partida sensato).
    // Guardamos si el foco estaba dentro del panel para poder recuperarlo
    // despues de reconstruirlo.
    const teniaFocoEnPanel = panel.contains(document.activeElement);

    for (const boton of menu.querySelectorAll('button')) {
      boton.setAttribute('aria-current', String(boton.dataset.seccion === estado.seccion));
    }
    panel.innerHTML = '';
    const seccion = contenido.secciones.find((s) => s.id === estado.seccion);
    panel.append(crear('h2', '', t(seccion.etiqueta, idioma)));
    RENDERIZADORES[estado.seccion](panel);

    // Si el render de la seccion (por ejemplo, abrir un archivo) ya puso el
    // foco en algun lado dentro del panel, no lo tocamos. Si no, y el foco
    // estaba en el panel antes de reconstruirlo, lo recuperamos: primero el
    // item resaltado (si existe), si no el primer elemento enfocable, y si no
    // el panel mismo (con tabindex -1) como ultimo recurso.
    if (teniaFocoEnPanel && !panel.contains(document.activeElement)) {
      const objetivo = panel.querySelector('[data-foco="true"]')
        ?? panel.querySelector('button, a, [tabindex]')
        ?? panel;
      objetivo.focus();
    }
  }

  const RENDERIZADORES = {
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
      // El atajo de indice (abrir el item resaltado con Enter) solo debe
      // actuar cuando el foco real no tiene nada propio que hacer con Enter:
      // ni el panel ni el body saben responder un Enter por si mismos. Si el
      // foco esta sobre CUALQUIER elemento enfocable propio (un boton de la
      // lista, un boton del menu, el toggle de idioma, el de CRT, un enlace,
      // etc.), ese elemento va a recibir su propio click nativo por este
      // mismo Enter: lo dejamos responder a el, para no secuestrarle la tecla
      // ni contestar dos veces la misma pulsacion (como en la puerta de
      // arranque). Antes esta guarda solo excluia los botones de la lista de
      // archivos, lo que dejaba secuestrados los botones del menu y de la
      // barra de estado mientras la seccion activa era "archivos".
      const foco = evento.target;
      const focoNoTieneActivacionPropia = foco === document.body || foco === panel;
      if (!focoNoTieneActivacionPropia) return;
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

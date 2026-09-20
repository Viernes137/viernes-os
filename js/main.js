import contenido from './contenido.js';
import { detectarIdioma } from './i18n.js';
import { ejecutarArranque, CLAVE_VISITADO } from './boot.js';
import { montarTUI, NIVELES_CRT } from './tui.js';

const CLAVE_IDIOMA = 'viernes-os:idioma';
// El indice 0 (CRT: ALTO) es el nivel de arranque. Se toma el valor de
// NIVELES_CRT (definido una sola vez en js/tui.js) en vez de duplicarlo
// aqui, para que no se puedan desincronizar la etiqueta del boton y el
// valor real de --crt.
const INDICE_CRT_POR_DEFECTO = 0;

const leer = (clave) => { try { return localStorage.getItem(clave); } catch { return null; } };
const guardar = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch { /* modo privado */ } };

const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
let idioma = detectarIdioma(navigator.languages ?? [navigator.language], leer(CLAVE_IDIOMA));
let tui = null;

// El idioma se resuelve antes de mostrar nada: el atributo lang del documento
// debe coincidir con el idioma real desde la primera linea del arranque, no
// solo al entrar al sistema (si no, un lector de pantalla pronuncia el POST
// y el "hello, world" en ingles con el idioma marcado como espanol, o
// viceversa).
document.documentElement.lang = idioma;

const faseArranque = document.getElementById('fase-arranque');
const faseSistema = document.getElementById('fase-sistema');

// seccionActual/indiceCrt viajan de un montaje al siguiente: sin esto, cada
// vez que alCambiarIdioma remontaba la TUI desde cero, el lector volvia a
// WHOAMI y el CRT volvia a ALTO sin importar donde estuviera parado.
function entrarAlSistema(seccionActual = null, indiceCrt = INDICE_CRT_POR_DEFECTO) {
  document.documentElement.lang = idioma;
  document.documentElement.style.setProperty('--crt', NIVELES_CRT[indiceCrt].valor);
  faseArranque.hidden = true;
  faseSistema.hidden = false;
  if (tui) tui.destruir();
  tui = montarTUI({
    contenedor: faseSistema,
    contenido,
    idioma,
    seccionActual,
    nivelCrt: indiceCrt,
    alCambiarIdioma(nuevo, seccion, nivelCrt) {
      idioma = nuevo;
      guardar(CLAVE_IDIOMA, nuevo);
      entrarAlSistema(seccion, nivelCrt);
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

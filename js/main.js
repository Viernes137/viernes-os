import contenido from './contenido.js';
import { detectarIdioma } from './i18n.js';
import { ejecutarArranque, CLAVE_VISITADO } from './boot.js';
import { montarTUI } from './tui.js';

const CLAVE_IDIOMA = 'viernes-os:idioma';
const NIVEL_CRT_POR_DEFECTO = '1';

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

function entrarAlSistema() {
  document.documentElement.lang = idioma;
  document.documentElement.style.setProperty('--crt', NIVEL_CRT_POR_DEFECTO);
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

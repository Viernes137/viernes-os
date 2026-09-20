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

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
    const botonSi = bloque.querySelector('[data-respuesta="si"]');
    const botonNo = bloque.querySelector('[data-respuesta="no"]');
    botonSi.focus();

    let resuelta = false;

    const teclasSi = idioma === 'es' ? ['s', 'S'] : ['y', 'Y'];
    const alTeclado = (evento) => {
      // Enter/Space sobre un boton enfocado ya disparan su propio click nativo:
      // dejamos que ese click responda, para no contestar dos veces la misma tecla.
      const enfocadoEsBoton = document.activeElement === botonSi || document.activeElement === botonNo;
      if (teclasSi.includes(evento.key)) responder('si');
      else if (evento.key === 'n' || evento.key === 'N') responder('no');
      else if (evento.key === 'Enter' && !enfocadoEsBoton) responder('si');
    };
    document.addEventListener('keydown', alTeclado);

    bloque.addEventListener('click', (evento) => {
      const boton = evento.target.closest('[data-respuesta]');
      if (boton) responder(boton.dataset.respuesta);
    });

    async function responder(respuesta) {
      if (resuelta) return;
      resuelta = true;
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

    function alEnter(evento) {
      if (evento.key === 'Enter' || evento.key === ' ') finalizar();
    }
    function finalizar() {
      document.removeEventListener('keydown', alEnter);
      resolver();
    }
    boton.addEventListener('click', finalizar);
    document.addEventListener('keydown', alEnter);
  });
}

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

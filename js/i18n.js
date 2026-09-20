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

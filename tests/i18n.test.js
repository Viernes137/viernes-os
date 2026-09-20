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

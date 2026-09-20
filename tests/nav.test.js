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

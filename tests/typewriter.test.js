import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planificar, duracionTotal } from '../js/typewriter.js';

test('planificar produce un paso por caracter', () => {
  const plan = planificar('abc', { velocidad: 10 });
  assert.equal(plan.length, 3);
});

test('cada paso lleva el texto acumulado', () => {
  const plan = planificar('abc', { velocidad: 10 });
  assert.deepEqual(plan.map((p) => p.texto), ['a', 'ab', 'abc']);
});

test('el primer paso no tiene retraso', () => {
  const plan = planificar('abc', { velocidad: 10 });
  assert.equal(plan[0].retraso, 0);
});

test('los caracteres normales usan la velocidad dada', () => {
  const plan = planificar('abc', { velocidad: 25 });
  assert.equal(plan[1].retraso, 25);
  assert.equal(plan[2].retraso, 25);
});

test('la puntuacion agrega una pausa', () => {
  const plan = planificar('a.b', { velocidad: 10, pausaPuntuacion: 200 });
  assert.equal(plan[1].retraso, 10, 'el punto entra a velocidad normal');
  assert.equal(plan[2].retraso, 210, 'el caracter despues del punto espera');
});

test('modo instantaneo devuelve un solo paso sin retraso', () => {
  const plan = planificar('hola mundo', { instantaneo: true });
  assert.deepEqual(plan, [{ texto: 'hola mundo', retraso: 0 }]);
});

test('texto vacio produce un plan vacio', () => {
  assert.deepEqual(planificar('', { velocidad: 10 }), []);
});

test('duracionTotal suma los retrasos', () => {
  const plan = planificar('abc', { velocidad: 10 });
  assert.equal(duracionTotal(plan), 20);
  assert.equal(duracionTotal([]), 0);
});

test('duracionTotal de un plan instantaneo es cero', () => {
  assert.equal(duracionTotal(planificar('hola', { instantaneo: true })), 0);
});

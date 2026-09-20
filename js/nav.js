/** Envuelve un indice dentro de [0, total). */
function envolver(indice, total) {
  if (total <= 0) return 0;
  return ((indice % total) + total) % total;
}

export function crearEstado(secciones, seccionInicial = null) {
  const lista = [...secciones];
  const seccion = lista.includes(seccionInicial) ? seccionInicial : lista[0];
  return { secciones: lista, seccion, indice: 0, abierto: null };
}

export function reducir(estado, accion, contexto = {}) {
  const { cantidadItems = 0 } = contexto;

  switch (accion?.tipo) {
    case 'seccion': {
      if (!estado.secciones.includes(accion.id)) return estado;
      if (accion.id === estado.seccion && estado.abierto === null) return estado;
      return { ...estado, seccion: accion.id, indice: 0, abierto: null };
    }
    case 'seccion-delta': {
      const actual = estado.secciones.indexOf(estado.seccion);
      const siguiente = envolver(actual + accion.delta, estado.secciones.length);
      return { ...estado, seccion: estado.secciones[siguiente], indice: 0, abierto: null };
    }
    case 'item-delta': {
      // Sin items que recorrer (toda seccion salvo "archivos") no hay nada
      // que mover: devolver el mismo estado deja que quien disparo la accion
      // (una flecha de teclado) sepa que no paso nada y no interfiera con el
      // scroll nativo del navegador. Lo mismo si hay un detalle abierto: las
      // flechas no deben re-renderizar por debajo del detalle.
      if (cantidadItems <= 0 || estado.abierto !== null) return estado;
      return { ...estado, indice: envolver(estado.indice + accion.delta, cantidadItems) };
    }
    case 'abrir': {
      return { ...estado, abierto: accion.id };
    }
    case 'cerrar': {
      if (estado.abierto === null) return estado;
      return { ...estado, abierto: null };
    }
    default:
      return estado;
  }
}

const MAPA_TECLAS = {
  ArrowDown:  { tipo: 'item-delta', delta: 1 },
  ArrowUp:    { tipo: 'item-delta', delta: -1 },
  ArrowRight: { tipo: 'seccion-delta', delta: 1 },
  ArrowLeft:  { tipo: 'seccion-delta', delta: -1 },
};

export function accionDesdeTecla(tecla, estado) {
  if (tecla === 'Escape') return estado.abierto === null ? null : { tipo: 'cerrar' };
  return MAPA_TECLAS[tecla] ?? null;
}

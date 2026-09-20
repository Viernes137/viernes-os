# VIERNES OS

Portafolio personal de Bruno Fragoso, construido como un sistema operativo
ficticio de los años 80.

En vivo: https://viernes137.github.io

## Cómo correrlo

No hay build ni dependencias. Cualquier servidor estático alcanza:

```bash
python3 -m http.server 8137
```

## Tests

Runner nativo de Node, sin instalar nada:

```bash
node --test tests/
```

## Editar el contenido

Todo el texto del sitio vive en `js/contenido.js`, en español e inglés.
Es el único archivo que hay que tocar para actualizar el portafolio.

## Despliegue

- **GitHub Pages**: automático al empujar a `main`.
- **Cloudflare Workers**: `npx wrangler deploy`

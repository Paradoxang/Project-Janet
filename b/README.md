# Maqueta B

Es la tienda de juguetes de demostración: un sitio estático con datos de ejemplo y sin cobros reales. Sigue el stack de
`PLAN.md` §3.

## Cómo se usa

```bash
npm install
npm run dev        # http://localhost:3000/en/
npm run build      # genera out/ (sitio estático para Cloudflare Pages)
npm test           # pruebas unitarias (Vitest)
npm run e2e        # pruebas en tamaño celular (Playwright), sobre out/
```

## Las dos marcas

La misma tienda tiene dos versiones, siempre a la par:

| Versión | Qué muestra | Enlace |
|---|---|---|
| **Neutra** (la inicial) | Sin marca ni mascota, con marcadores («Your logo», «Mascot») | `/en/?marca=neutra` |
| **Brinco** | La propuesta de marca 1 (`marca/`) como valor agregado | `/en/?marca=brinco` |

- El interruptor «Brand proposal» de la franja de demo cambia de marca al instante y la recuerda.
- Todo lo que cambia está en `src/app/globals.css` (variables `--m-*`) y en `src/marca/`.
- Para que la marca inicial de un despliegue sea Brinco: `NEXT_PUBLIC_MARCA_INICIAL=brinco`.

## Reglas

- Todos los datos pasan por `src/lib/data.ts`, que hoy lee `/datos` y mañana leerá la API.
- Lo de ejemplo se ve como ejemplo: hay franja de demo, tiendas DEMO, reseñas de ejemplo e «Illustrative image».
- El pago no pide datos reales.

## Publicar en Cloudflare

Es un Worker con archivos estáticos: `wrangler.jsonc` sube la carpeta `out/` y no lleva código de servidor. Ajustes del
proyecto en el panel (Settings → Build):

| Ajuste | Valor |
|---|---|
| Nombre del proyecto | `maqueta-b-janet` (igual que `name` en `wrangler.jsonc`) |
| Rama de producción | `demo` (solo se publica lo que llega ahí) |
| Root directory | `b` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Variable de build | `NODE_VERSION` = `22` |
| Builds for non-production branches | Desactivado |

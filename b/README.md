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

## Cuentas y panel de la dueña

Todo es de demostración y vive solo en el navegador (no hay servidor ni se envían correos).

| Quién | Cómo entra | Qué ve |
|---|---|---|
| **Compradora** | «Crear una cuenta» con cualquier correo inventado | Su cuenta: pedidos y «Volver a comprar», favoritos, «Te puede gustar», datos y contraseña, avisos por correo (simulados) |
| **Dueña** | El mismo login con `admin@example.com` y cualquier contraseña | El panel (`/panel`): cifras con su explicación, «En vivo» con lo que se hace en la tienda, y «Productos» para crear, editar, ocultar y borrar |
| **Equipo (invitados)** | `santiago@example.com` o `juan@example.com`, con cualquier contraseña | El mismo panel, marcado como «Invitado» |

- Las contraseñas de las compradoras se guardan cifradas (PBKDF2 con sal), nunca tal cual.
- Lo que crea o cambia la dueña se ve al momento en la tienda **del mismo navegador**. Para la presentación, usar un
  solo dispositivo. «Volver al catálogo de ejemplo» deshace todo; «Empezar de cero» borra la actividad en vivo.
- Los datos de ejemplo del panel salen de `datos/herramientas/generar_panel.py` (determinista).

## Reglas

- Todos los datos pasan por `src/lib/data.ts`, que hoy lee `/datos` y mañana leerá la API.
- Lo de ejemplo se ve como ejemplo: hay franja de demo, tiendas DEMO, reseñas de ejemplo e «Illustrative image».
- El pago no pide datos reales.
- Código de terceros: las tarjetas holográficas usan HoloCard de React Bits (MIT + Commons Clause). Se puede usar
  dentro de la tienda, con su aviso (`src/components/efectos/holo-card/LICENSE.md`); no se puede vender ni repartir
  el componente por separado.

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

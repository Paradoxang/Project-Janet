# Project Janet

Tienda online de juguetes para EE. UU. (web propia, sin Shopify) para una posible clienta. **Hoy existe una maqueta
funcional, la versión B (`/b`), publicada para la presentación del lunes 19-10-2026.** Aún no hay contrato: el
desarrollo real solo empieza si ella firma.

> **Si eres Claude en una sesión nueva:** este archivo es el mapa. Léelo entero (unos 5 minutos) y después
> `DECISIONES.md`, que manda sobre todo lo demás. Tu papel (Dionisio) y las reglas que no se negocian están en
> `CLAUDE.md`, que ya cargaste. Antes de construir algo nuevo, confirma con Santiago qué te toca.

## En 30 segundos

| | |
|---|---|
| **Qué hay** | La maqueta B: tienda estática con datos de ejemplo, carrito y pago simulados, mapa de tiendas, cuentas simuladas y panel de la dueña con estadísticas y gestión de productos |
| **Quién** | Santiago decide. Dionisio (Claude) construye la versión B. La persona A hace su versión aparte: no está en este repositorio |
| **Dónde se ve** | Cloudflare, proyecto `maqueta-b-janet`, que publica la rama `demo`. La URL no se escribe aquí porque el repositorio es público |
| **Ramas** | El código está en `claude/festive-wozniak-rl090e` (trabajo) y en `demo` (lo publicado). **`main` todavía no lo tiene.** Nunca se trabaja en `main`; si tu sesión trae otra rama asignada, pártela de `claude/festive-wozniak-rl090e` |
| **Publicar** | Push de avance rápido a `demo`, **solo con un sí de Santiago para esa publicación** |
| **Cómo está** | Todo lo de la demo está hecho y probado: 82 pruebas e2e y 53 unitarias en verde (16-10) |

## Qué leer y para qué

| Archivo | Para qué | ¿Vigente? |
|---|---|---|
| `CLAUDE.md` | Papel de Dionisio, cómo trabaja y cómo habla, reglas | Sí |
| `DECISIONES.md` | Cada decisión de Santiago, literal y con fecha y hora de Bogotá | Sí; manda sobre todo |
| `README.md` (este) | Estado, mapa del código, cómo funciona, cómo se prueba y cómo se publica | Sí |
| `PLAN.md` | Requisitos de la clienta (§5), guía de la maqueta (§3) y plan del desarrollo real si firma (§4) | Sí, salvo §2 «Estado» (del 15-10) y §6 «Con Santiago» (resuelto). §6 «Con la clienta» sigue abierto |
| `b/marca/README.md` | La propuesta de marca Brinco (logo, mascota, colores) | Sí |

## Estado al 16-10

**Hecho** (todo en `/b`, en inglés y español, pensado primero para el celular):

| Área | Qué hace |
|---|---|
| Tienda | Inicio, buscador que tolera errores, ficha de producto, carrito (panel y página), pago simulado con confirmación, dónde comprar (mapa con 6 tiendas DEMO y ZIP), FAQ |
| Marca | Dos versiones a la par: **neutra** (con marcadores «Your logo») y **Brinco** (la propuesta). Se cambia con el interruptor de la franja de demo o con `?marca=` |
| Efectos | Tarjetas de producto holográficas (HoloCard de React Bits), con créditos en el pie |
| Cuentas | Login con dos roles. La compradora tiene contraseña, favoritos, pedidos, recomendaciones y avisos por correo simulados. La administración entra al panel |
| Panel de la dueña | `/panel`: cifras con «¿Qué significa esto?», «¿Qué hago hoy?», «En vivo» (lo que pasa en la tienda de este navegador), ventas, productos, clientes e inventario |
| Productos (CRUD) | `/panel/catalogo`: crear, editar, ocultar, borrar y restaurar. Se refleja al momento en la tienda del mismo navegador |
| Formulario de producto | Fichas, pasos − y +, pestañas ES/EN, listas de puntos, medidas y peso con unidad, materiales y advertencias para marcar |
| Panel a pantalla completa | Con administración dentro del panel, la cabecera de la tienda se recoge en una sola barra |

**Accesos de la demo** (cualquier contraseña para administración; todo vive en el navegador):

| Quién | Correo | Qué ve |
|---|---|---|
| Compradora | Cualquiera inventado, con «Crear una cuenta» | Su cuenta |
| Dueña | `admin@example.com`, por el mismo login (`/account`) o desde `/panel` | El panel |
| Equipo (invitados) | `santiago@example.com`, `juan@example.com` | El panel, marcado «Invitado» |

**Para la presentación:**
- **Un solo dispositivo:** todo vive en el navegador, así que lo que la dueña crea solo se ve en ese mismo navegador.
- **Deshacer:** «Volver al catálogo de ejemplo» (en Productos) deshace los cambios del catálogo, y «Empezar de cero» (en
  «En vivo») borra la actividad.
- **Empezar de cero del todo** (cuentas, pedidos, carrito y marca): borra los datos del sitio en el navegador o usa una
  ventana de incógnito.
- **Fotos subidas:** se reducen (640 px, JPEG), pero van al `localStorage`, que tiene unos 5 MB. Si se llena, al guardar
  avisa de que no hay espacio.
- **Antes de presentar,** repasa la lista de `PLAN.md` §3 («Antes de presentar se revisa»).

**Pendiente o abierto:**
- **Accesibilidad** (fallos que ya estaban): poco contraste en la etiqueta «Publicado» de `/panel/catalogo`, y dos tablas
  del panel con scroll en celular a las que no se llega con el teclado.
- **Lighthouse:** el buscador tiene un CLS de 0.092, que ya estaba. Accesibilidad y buenas prácticas dan 100.
- **Ofrecido, sin respuesta:** administración invitada de solo lectura; ocultar el interruptor de marca antes de presentar;
  versiones alternativas de la marca cuando Santiago valide Brinco.
- **Con la clienta:** los pendientes de `PLAN.md` §6 (tiendas físicas reales, inventario, empresa en EE. UU., tercer
  idioma, catálogo, envíos, fecha y presupuesto).

## Comandos

Todo se corre dentro de `b/` (Node 22 o más, npm):

```bash
npm install
npm run dev                  # http://localhost:3000/en/
npm run typecheck && npm run lint
npm test                     # unitarias (Vitest)
npm run build                # genera out/: el sitio estático que se publica
npm run e2e                  # Playwright sobre out/ (levanta `serve out` en :4173, o reusa uno que ya esté)
BASE_URL=https://… npm run e2e   # las mismas pruebas contra la web publicada
```

Las e2e prueban `out/`: **haz `npm run build` antes**. Solo hay Chromium; los perfiles son `iphone` y `android`. En los
contenedores de Claude Code en la nube, Chromium ya viene instalado; en otro equipo, `npx playwright install chromium`.

## Mapa del código

```text
/                        CLAUDE.md · DECISIONES.md · PLAN.md · README.md
datos/                   datos de ejemplo comunes a A y B (products, stores, panel, tax-rates)
  herramientas/          generar_panel.py: genera panel.json (determinista)
b/                       la maqueta B (Next.js estático)
  marca/                 propuesta Brinco: SVG, tokens.css y su generador
  messages/              todos los textos: es.json y en.json (siempre los dos)
  public/                index.html (redirige / a /es/ o /en/), ilustraciones de productos, _headers (noindex)
  src/app/[locale]/      las páginas (abajo)
  src/components/        por zona: cabecera, inicio, busqueda, producto, carrito, pago, donde, cuenta, panel, efectos, ui
  src/lib/               lógica sin React (abajo)
  src/stores/            estado con Zustand guardado en localStorage (abajo)
  src/marca/             cambio de marca: script antes de pintar, interruptor, Logo y Mascota
  src/hooks/             useHidratado (true solo en el navegador ya hidratado)
  src/i18n/              rutas de idioma de next-intl (routing, navigation y request)
  tests/unit/            Vitest
  tests/e2e/             Playwright; fixtures.ts trae test, entrarComoDuena y crearCuenta
```

**Páginas** (`src/app/[locale]/`, con `/en/…` y `/es/…`):

| Ruta | Qué es |
|---|---|
| `/` | Inicio |
| `/search` | Buscador y catálogo con filtros (`?q=`, `?edad=`, `?categoria=`, `?ocasion=`, `?max=`, `?orden=`) |
| `/p/[slug]` | Ficha de un producto de ejemplo |
| `/p/nuevo/?id=n-…` | Ficha de un producto creado en el panel (la exportación estática no puede crear páginas nuevas) |
| `/cart`, `/checkout`, `/order/?id=` | Carrito, pago simulado y confirmación |
| `/account` | Login y registro, y la cuenta de la compradora (`?volver=` para regresar al pago). La administración también entra aquí y pasa al panel |
| `/where-to-buy` | Mapa de tiendas DEMO (react-leaflet) |
| `/faq` | Preguntas frecuentes |
| `/panel`, `/panel/catalogo` | Panel de la dueña y gestión de productos (protegidos por `SoloAdmin`) |

**`src/lib/`, lo importante:**

| Archivo | Qué hace |
|---|---|
| `data.ts` | **Única entrada de datos** (`getProducts`, `getStores`, `getPanel`…). Hoy lee `/datos`; mañana leerá la API |
| `constantes.ts` | Listas sin datos (edades, categorías, ocasiones, colores por edad), seguras para el navegador |
| `catalogo.ts` | Catálogo = el de ejemplo más los cambios de la dueña; formulario ↔ producto (`DatosProducto`) |
| `detalles.ts` | Unidades (cm, m, in; kg, lb), lista de materiales y advertencias comunes |
| `sesion.ts` | Cuentas: huella PBKDF2 de la contraseña y la lista de `ADMINISTRACION` |
| `modo-panel.ts` | Script antes de pintar que recoge la cabecera en el panel |
| `buscar.ts` · `recomendar.ts` | Búsqueda con Fuse.js (entiende «regalo niño 5 años») y «Te puede gustar» |
| `totales.ts` · `zip.ts` | Envío, impuesto estimado por estado y ZIP a coordenadas y distancia |
| `actividad.ts` | Resumen de «En vivo» |
| `turnos.ts` | Cola que reparte un número fijo de turnos. La usa `capa-holo.tsx` (`MAX_HOLOGRAMAS` = 8) para no pasar de 8 contextos WebGL |

**`src/stores/`** (cada uno con su clave en `localStorage`):

| Store | Clave | Guarda |
|---|---|---|
| `useCarrito` | `carrito` | Líneas, «guardado para después» y opción de regalo |
| `useCuenta` | `cuenta` | Sesión, cuentas (con huella), favoritos y avisos, por correo |
| `usePedidos` | `pedidos` | Pedidos simulados (con la cuenta que compró) |
| `useCatalogoLocal` | `catalogo` | Cambios de la dueña: nuevos (`n-…`), ediciones, ocultos y borrados |
| `useActividad` | `actividad` | Eventos para «En vivo»: visita, producto, carrito, compra y búsqueda |
| `usePreferencias` | `preferencias` | El ZIP elegido (de inicio, 98101: Seattle) |
| `useCarritoUI` | — | Si el panel del carrito está abierto (no se guarda) |
| (no es un store) | `marca` | `neutra` o `brinco`; la escriben `src/marca/script-marca.ts` y el interruptor |

## Cómo funciona (lo que no se ve leyendo un solo archivo)

1. **Sitio 100 % estático.** `output: 'export'` y `trailingSlash: true`: no hay servidor. Lo «dinámico» (cuentas, carrito,
   cambios del catálogo) vive en el `localStorage` del navegador.
2. **Hidratación.** Lo que depende de `localStorage` o de la fecha se protege con `useHidratado()`. Los stores rehidratan
   enseguida, pero el primer render (el del HTML estático) usa el estado inicial.
3. **Datos.** Un componente de cliente **no importa `lib/data.ts`**, porque metería el JSON en el bundle. Usa
   `lib/constantes.ts` o `useCatalogo()`, que viene de `ProveedorCatalogo` y ya trae los cambios de la dueña.
4. **Scripts antes de pintar.** En el `<head>` de `app/[locale]/layout.tsx`, `scriptMarca()` pone `data-marca` y
   `scriptModoPanel()` pone `data-panel` en `<html>`. El CSS (`.solo-brinco`, `.solo-neutra` y `.cabecera-tienda`) hace
   el resto, sin parpadeo.
5. **Marca.** Los colores, la letra y las formas son variables `--m-*` en `src/app/globals.css`, una tanda por marca. La
   marca inicial de un despliegue sale de `NEXT_PUBLIC_MARCA_INICIAL` (por defecto, neutra).
6. **Cuentas.** Las compradoras se guardan con la contraseña cifrada (PBKDF2 con sal, WebCrypto). La administración son los
   correos de `ADMINISTRACION` con cualquier contraseña (decisión del 16-10).
7. **Panel.** `SoloAdmin` lo protege y pone la barra de administración. `ModoPanel` mantiene `data-panel` al navegar.
8. **Formulario de producto.**
   - Las piezas están en `components/panel/campos.tsx`; la lógica, en `lib/catalogo.ts` y `lib/detalles.ts`.
   - La ficha sigue mostrando texto («60 x 30.5 x 85 cm»).
   - Lo que el producto ya traía y no encaja en los campos se conserva aparte (`textoLibre`).
   - Invariante probado: editar cualquiera de los 20 juguetes de ejemplo sin tocar nada lo deja idéntico.
9. **Tarjetas holográficas.** HoloCard tiene licencia MIT + Commons Clause, con su aviso en `efectos/holo-card/LICENSE.md`.
   Se puede usar dentro de la tienda, pero no vender ni repartir el componente por separado.
   - Como mucho hay 8 a la vez (`MAX_HOLOGRAMAS` en `components/producto/capa-holo.tsx`, con la cola de `lib/turnos.ts`).
   - No se montan con «reducir movimiento» ni con WebGL por software (Lighthouse, PageSpeed).
10. **Idiomas.** next-intl con `/en` y `/es`. Cada texto va en `messages/es.json` y `messages/en.json`; las negritas, con
    `t.rich`.
11. **Solo modo claro.** El `dark:` de Tailwind está desactivado (`@custom-variant dark` en `globals.css`): con el sistema en
    modo oscuro, los componentes de shadcn dejaban los campos grises.

## Pruebas

- **Unitarias (53, `tests/unit`):** sesión, catálogo, detalles, búsqueda, totales, ZIP, formato de precios y fechas,
  recomendaciones, actividad, turnos, modo panel y la integridad de `/datos`.
- **E2E (41 pruebas × 2 perfiles = 82, `tests/e2e`):**
  - el recorrido de la demo (`paso2` a `paso4`);
  - cuentas, panel, gestión de productos y panel a pantalla completa;
  - las tarjetas holográficas;
  - un recorrido completo: la dueña sube un juguete, una compradora lo compra y la dueña lo ve en vivo.
- **El fixture** espera en cada `goto` a que la página esté hidratada: `html.js-revelar`, salvo con «reducir movimiento».
- **Para escritorio** se usa `page.setViewportSize` dentro de la prueba.
- **Contra la web publicada** todo va más lento. Una prueba que recorre muchas páginas lleva `test.slow()`.
- **Accesibilidad:** no hay prueba de axe en el repositorio. Para revisar, se inyecta `node_modules/axe-core/axe.min.js`
  en la página con Playwright (`page.addScriptTag`) y se corre `axe.run()`. axe-core no está en `package.json`: llega
  como dependencia de `eslint-plugin-jsx-a11y`.
- **Lighthouse:** se compara alternando corridas contra una build de base. Una sola corrida no vale, porque la máquina
  varía mucho.

## Publicar en Cloudflare

Es un Worker con archivos estáticos: `wrangler.jsonc` sube `out/` y no lleva código de servidor.

| Ajuste del proyecto (Settings → Build) | Valor |
|---|---|
| Nombre | `maqueta-b-janet` (igual que `name` en `wrangler.jsonc`) |
| Rama de producción | `demo` |
| Root directory | `b` |
| Build command / Deploy command | `npm run build` / `npx wrangler deploy` |
| Variable de build | `NODE_VERSION` = `22` |
| Builds de otras ramas | Desactivado |

**Pasos:**
1. Pedir el sí de Santiago para **esta** publicación y anotarlo en `DECISIONES.md`.
2. Comprobar el avance rápido con `git fetch origin demo && git merge-base --is-ancestor origin/demo HEAD`.
3. Publicar con `git push origin HEAD:demo`. Nunca con `--force`.
4. Esperar. La página nueva sale a los 2 o 3 minutos, pero sus archivos pueden dar 404 entre 1 y 2 minutos más, y quien
   entre en ese rato ve «Application error».
   - Hay que esperar a que respondan los `/_next/static/...js` que enlaza la página.
   - **Nunca publicar justo antes de una presentación.**
5. Probar la web publicada con `BASE_URL=https://… npm run e2e`. Esas pruebas entran con los accesos simulados de la demo,
   que viven solo en el navegador de la prueba: no se envía nada a ningún servidor.

## Reglas y convenciones

Las completas están en `CLAUDE.md`. Resumen:

**Permisos y publicación**
- **Push** a la rama de trabajo al cerrar cada paso (permitido por la decisión del 15-10). **`demo` y todo lo que toque
  producción, solo con su sí**, y el sí a una cosa no vale para la siguiente.
- **Lo que cuesta dinero** va con el importe delante.

**Lo que no va al repositorio** (es público)
- Ni datos personales, ni secretos, ni notas internas, ni precios o acuerdos con la clienta.
- Los correos de ejemplo son `@example.com` y sin apellidos.

**Registro y orden**
- **Cada decisión de Santiago** va a `DECISIONES.md` (en la práctica, cada pedido y cada sí de publicación), literal y con
  la hora de Bogotá de su mensaje. Lo que no puede ir en un repositorio público se recorta con «[…]».
- **Nada se borra en firme:** ni `push --force` ni reescribir la historia. Para quitar archivos, primero se pregunta.

**Contenido de la tienda**
- **Lo de ejemplo se ve como ejemplo:** franja de demo (en el panel, la etiqueta «Demo»), tiendas DEMO, reseñas de ejemplo e
  «Illustrative image».
- **El pago no pide datos reales.**

**Código**
- **Idioma:** se habla en español y de tú. El código va en español (nombres, comentarios y `data-testid`).
- **Comentarios:** cortos, solo donde hace falta.
- **Prettier:** el repositorio usa líneas de unos 120 caracteres, pero `b/.prettierrc.json` dice 100, así que casi todos
  los archivos «fallan» el check de Prettier. No se reformatea en masa: se imita el código de alrededor.

## Trampas conocidas

**Textos y código**
- **Al editar `messages/*.json` con un script**, carga el JSON entero y vuelve a escribirlo con el mismo orden, `indent=2`
  y salto de línea final. Abrir el archivo en modo escritura antes de leerlo lo vació una vez.
- **Constantes compartidas, en `src/lib/`.** Una constante que exporta un módulo `"use client"` no sirve en un componente
  de servidor: llega como referencia de cliente, no como valor.
- **Sin página estática nueva:** con la exportación estática no hay páginas nuevas sin `generateStaticParams`. Por eso los
  productos creados en el panel usan `/p/nuevo/?id=`.

**Entorno y servidores**
- **`pkill -f` con un patrón** puede matar la propia shell.
- **Puertos de `serve`:** el de las e2e es el 4173; reusa uno que ya esté levantado.
- **Lighthouse en headless:** Chrome no siempre avisa del WebGL por software. Por eso la tarjeta holográfica revisa además el
  nombre del renderizador.

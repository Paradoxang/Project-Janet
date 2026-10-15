# Plan de Project Janet

Hoja de ruta y plan de trabajo al 15-10-2026. Viene de lo que llevaba Mercurio y lo revisó Hades. **No incluye el
contexto comercial**, porque el repositorio es público. Las decisiones de Santiago, literales, están en `DECISIONES.md`.

## 1. Qué es

Una **tienda online propia de juguetes para EE. UU.** (sin Shopify), blanca y limpia, con la estructura de Amazon y
Walmart. Así:
- se dirige a mamás y papás;
- está en inglés, español y un tercer idioma;
- trae un mapa de tiendas físicas con el stock de cada una;
- trae un panel de negocio en lenguaje simple para la dueña («product owner»);
- queda preparada para crecer después a Latinoamérica.

## 2. Estado al 15-10-2026

- **Todavía no hay contrato.** Primero va una **maqueta funcional**, para que la clienta la pruebe en su celular y decida si
  firma.
- **La maqueta se entrega el lunes 19-10-2026.**
- Hay dos planes, y no se mezclan:
  - **Ahora, la maqueta** (sección 3): un sitio estático con datos de ejemplo y sin backend.
  - **Solo si firma, el desarrollo real** (sección 4): el plan que ganó la arena del 14-10, con Medusa v2 y pagos reales.
    Sus fechas contaban con arrancar el 14-10, así que **hay que recalcularlas** desde el día de la firma.
- No consta que la maqueta se haya empezado. Según el calendario, el paquete de datos se congelaba el jueves 15 a
  mediodía.

## 3. Ahora: la maqueta funcional (guía aprobada el 14-10)

**Qué es:** una tienda que se ve y se usa como la de verdad. Se puede buscar, ver un producto, añadir al carrito, «pagar»,
ver el mapa de tiendas y el panel de la dueña. Pero lleva datos de ejemplo y no cobra de verdad.

### Reglas
- **Iguales para los dos:** el stack, el paquete de datos, las pantallas obligatorias y la fecha.
- **Libre para cada uno:** el diseño, la propuesta de marca (nombre provisional, logo, colores y tipografía), las
  animaciones y los extras.
- **Cada uno en su carpeta** (`/a` y `/b`), sin compartir componentes y sin mirar la del otro hasta el lunes.
- **Lo de ejemplo se ve como ejemplo:**
  - las tiendas llevan «DEMO» y las reseñas dicen «de ejemplo»;
  - el panel dice «datos de demostración»;
  - una franja fija dice «Maqueta de demostración · datos de ejemplo»;
  - las imágenes de IA van rotuladas «Illustrative image», y no hay fotos de marcas ajenas.
- **Nada real:** ni Stripe en vivo, ni datos personales, ni claves en el repositorio.
- **Pensada primero para el celular:** la demo se hace en el teléfono de ella.

### Stack
| Pieza | Elección |
|---|---|
| Framework | Next.js 15 (App Router) con TypeScript y `output: 'export'` (sitio estático) |
| UI | Tailwind CSS, shadcn/ui y lucide-react |
| Animación | Motion (Framer Motion) |
| Estado | Zustand con `localStorage`: carrito, lista de deseos y una «sesión» simulada |
| Idiomas | next-intl con `/en` y `/es`; para exportar en estático, `generateStaticParams` y una redirección en la raíz |
| Búsqueda | Fuse.js en el navegador |
| Carruseles | Embla |
| Mapa | react-leaflet con OpenStreetMap, con su atribución visible |
| Gráficos del panel | Recharts |
| Publicación | Cloudflare Pages, un proyecto por persona (`maqueta-a` y `maqueta-b`), con `noindex`. El plan gratis de Vercel prohíbe el uso comercial. |
| Repositorio | Uno solo, con `/datos`, `/a` y `/b` · Node 24 · npm · ESLint y Prettier |

**La única regla de arquitectura:** todos los datos pasan por `lib/data.ts` (`getProducts()`, `getStores()`, `getPanel()`).
Hoy leen el JSON; en el desarrollo real leerán la API sin tocar las pantallas.

### Paquete de datos común (`/datos`)
- **`products.json`:** unos 20 juguetes en inglés y español. Cada uno lleva título, de 4 a 6 viñetas, especificaciones
  (edad, medidas, materiales y pilas), advertencias de seguridad, precio, categoría, ocasión, valoración y relacionados.
- **`stores.json`:** 6 tiendas DEMO (Seattle, San Diego, Los Ángeles, Houston, Miami y Nueva York), con dirección,
  coordenadas, horario y stock. Al menos un producto está agotado en Seattle y disponible en San Diego.
- **`panel.json`:** 30 días de ventas, pedidos, embudo, más vendidos y stock por tienda. Además, de 3 a 5 avisos «¿Qué hago
  hoy?», cada uno explicado en español y en inglés.
- **`tax-rates.json`:** una tasa estimada por estado, marcada como ejemplo.
- **Estado:** que se sepa, no está hecho.

### Pantallas obligatorias
P1: sin esto no hay demo. P2: debe estar. P3: si sobra tiempo.

| Pantalla | Qué tiene que mostrar | |
|---|---|---|
| Inicio | Buscador grande; menú por edad, categoría y ocasión; ofertas, más vendidos y «regalos por edad» | P1 |
| Buscador | Sugiere desde la 2.ª letra y encuentra aunque se escriba mal | P1 |
| Producto | Galería, precio, «en stock», fecha estimada, «About this item», especificaciones, advertencias de seguridad, «Add to cart» y «Buy now», recomendados, reseñas de ejemplo y «Check store availability» | P1 |
| Carrito | Panel lateral más página completa: cantidades, «Save for later», barra de envío gratis, impuesto estimado con el ZIP y opción de regalo | P1 |
| Checkout simulado | Invitado o cuenta, dirección, pago de mentira (tarjeta, Apple Pay, Google Pay, PayPal y cuotas) y confirmación | P1 |
| Dónde comprar | Mapa de EE. UU. con las 6 tiendas DEMO y buscador por ZIP o «cerca de mí». La ficha de cada tienda trae dirección, horario, stock y «cómo llegar». Desde el producto, se ve la tienda más cercana que sí lo tiene. | P1 |
| Panel de la dueña (`/panel`) | «¿Cómo va mi negocio?»: ventas, pedidos y ticket promedio contra el periodo anterior, con una frase. Además, el camino de compra en palabras, los más vendidos, el stock por tienda con alertas y «¿Qué hago hoy?». Cada número lleva su «¿Qué significa esto?». | P1 |
| Idiomas | Selector inglés/español sin salir de la página | P2 |
| Catálogo | Filtros (edad, precio, categoría y disponible en tienda) y orden | P2 |
| Cuenta simulada | Entrar o registrarse (de mentira), mis pedidos, «Buy it again» y lista de deseos | P2 |
| FAQ y pie | Products · Where to buy · FAQ, devoluciones y privacidad, con textos de ejemplo | P3 |

### Calendario
| Día | Qué queda hecho en cada versión |
|---|---|
| Mié 14 (tarde) | Repositorio con `/datos`, `/a` y `/b`; stack instalado; paquete de datos |
| Jue 15 | Marca propia, estructura, inicio, buscador y producto. Los datos se congelan a mediodía. |
| Vie 16 | Carrito, checkout simulado, idiomas y primera publicación |
| Sáb 17 | Mapa, disponibilidad en el producto y panel de la dueña |
| Dom 18 | P2 y P3, pulido en el celular, pruebas en iPhone y Android, y ensayo de la demo |
| Lun 19 (mañana) | Revisión cruzada, ajustes y enlace listo |

Si no se trabaja el fin de semana: jueves y viernes, todos los P1 menos el panel; el lunes temprano, el panel base y la
revisión. P2 y P3 quedan fuera.

### Cómo se comparan A y B el lunes
Cada criterio se puntúa de 1 a 5:
1. Alguien de fuera compra en el celular sin ayuda, del buscador a la confirmación, en menos de 1 minuto.
2. Es tan fácil como Amazon o Walmart, pero con identidad propia.
3. La página de producto convence, y se entienden los recomendados y la disponibilidad en tienda.
4. El mapa se entiende a la primera: Seattle sin stock, San Diego con stock.
5. Alguien no técnico usa el panel para responder «¿cuánto vendí?», «¿qué se agota y dónde?» y «¿qué hago hoy?».
6. Se ve pulida y rápida en el celular (Lighthouse móvil de 85 o más), sin errores visibles.
7. Sirve para el desarrollo real: los datos pasan por `lib/data.ts` y los componentes están limpios.

Después se decide si se presentan las dos («Propuesta A» y «Propuesta B») o una sola con lo mejor de la otra.

### La demo (10 minutos, en su celular)
1. Una mamá en Seattle busca un regalo para su hijo de 5 años y mira los recomendados.
2. En Seattle no hay: la web le dice que en San Diego sí, cuántos quedan y la dirección.
3. Añade al carrito, ve el envío gratis y el impuesto estimado, y paga como invitada.
4. Cambia a español con un toque.
5. «Y tú, como dueña, ves esto»: el panel.
6. Cierre: «Esto es la maqueta. Con el contrato la convertimos en la tienda real.» Se le pide su opinión y una fecha para
   firmar.

**Antes de presentar se revisa:**
- la franja de demo se ve en todas las páginas;
- las tiendas dicen DEMO y las reseñas, «de ejemplo»;
- ningún pago pide datos reales;
- el enlace abre en Safari (iPhone) y en Chrome (Android);
- el `noindex` está activo;
- los nombres de marca se presentan como propuesta, sin registro.

## 4. Si firma: el plan de desarrollo (ganó la arena del 14-10)

Sale de la guía de trabajo del 14-10. Las fechas son estimadas y **hay que recalcularlas** desde el día de la firma.

### Las decisiones del plan
| Tema | Decisión |
|---|---|
| Motor | **Medusa v2**, con la tienda propia en Next.js, a partir de `medusajs/dtc-starter` fijado en un commit (el starter clásico de Next.js se archivó el 2-07-2026). El comercio no se programa desde cero. **Plan B: Vendure**, que alarga el prototipo de 1 a 2 semanas. Se decide con una prueba técnica de 2 o 3 días (más abajo). |
| Prototipo | Unas 5 semanas desde el arranque con 3 personas, con demos en el celular de la clienta. Con 2 personas tarda bastante más. Lleva pagos en modo prueba, datos demo rotulados y staging con contraseña y `noindex`. |
| Black Friday (27-11) | La tienda nueva **no** sale a vender. Como mucho, una página «Coming soon» para juntar correos, si ya están el nombre, el dominio y el aviso de privacidad. |
| V1 en vivo | **Dos puertas.** La de **alcance** (alcance y presupuesto firmados) abre unas 7 semanas de construcción sin esperar a su empresa. La de **activación** (EIN, Stripe en vivo, impuestos, textos legales, envíos, stock y catálogo con CPC) abre 2 semanas de activación y 1 de lanzamiento suave. |
| Panel de la dueña | Tarjetas en un paquete propio (`packages/panel-ui`), montadas por defecto en el admin de Medusa. Pasarlas a una app aparte cuesta unos 3 días-persona. Dónde van lo decide una prueba en el celular con una pantalla real: se aprueba si ella responde 3 preguntas en menos de 1 minuto cada una. Cada aviso de «¿Qué hago hoy?» trae su acción; lo que no tiene acción es una cifra, no un aviso. |
| Inventario | La web vende **solo** el stock de una **bodega online**, vinculada al canal de venta web. Las tiendas físicas **no** se vinculan: solo alimentan el mapa y la consulta. Con 0 en la bodega y 4 en San Diego, no deja comprar: dice «Not available to ship right now» y «Available in store: San Diego (4)». |
| Despacho | Cada pedido cobrado le llega por correo a quien despacha, con un enlace firmado y tres botones: «Accept», «Shipped» y «Can't ship». Si nadie responde en 24 h, la alerta le llega a ella. La fecha prometida nunca se reescribe. Al cliente solo se le avisa un retraso con un motivo real y antes de que venza la fecha (Mail Order Rule). |
| Impuestos | El catálogo muestra el precio **sin impuesto**, como se hace en EE. UU. El carrito estima con la tasa combinada promedio del estado del ZIP, **sin llamar a ningún servicio**. El checkout calcula el exacto con Stripe Tax, que cobra por llamada. Apple Pay y Google Pay calculan con ciudad, estado y ZIP, y cobran justo el total aprobado. |
| SEO | Products, Where to buy y FAQ existen siempre, en el menú y en el pie, y entran en el sitemap. La home lleva WebSite y Organization. Los enlaces bajo el nombre en Google no se prometen. |
| Latinoamérica | Se prepara sin construirla: todo depende de la región, las URLs son `/{país}/{idioma}` (`/us/en`, `/us/es`) y una región de prueba oculta hace fallar la CI si algo queda atado al dólar. |
| Hosting | En el prototipo, todo en Railway (tienda, Medusa, Postgres, Redis y Meilisearch), con el DNS en Cloudflare. En V1, igual pero en cuentas de ella. |

### El stack del desarrollo real
- **Base:** el monorepo de `dtc-starter` (pnpm y Turborepo), con `apps/storefront` (Next.js, TypeScript y Tailwind, con SSR
  e ISR), `apps/backend` (Medusa v2) y `packages/panel-ui`.
- **Datos:** PostgreSQL y Redis.
- **Pagos:** Stripe Payment Element y Express Checkout Element, con `capture: true`. PayPal y Venmo, en V1.
- **Impuestos:** Stripe Tax, solo en el checkout y en el botón exprés.
- **Búsqueda:** Meilisearch, con un índice por idioma.
- **Mapa:** SVG propio de EE. UU. con d3-geo, us-atlas y la proyección Albers USA. «Get directions» es un enlace a Google
  Maps o Apple Maps, sin clave.
- **ZIP a coordenadas y a estado:** el Gazetteer ZCTA del Censo de EE. UU.
- **Idiomas:** next-intl.
- **Correo:** el módulo de notificaciones de Medusa, con SendGrid o Resend.
- **Calidad y errores:** Sentry. GitHub Actions pasa tipos, lint, pruebas unitarias, Playwright, axe y Lighthouse CI.

### Reglas de arquitectura que no se negocian
1. **Dinero:** Medusa v2 guarda unidades normales con BigNumber, no centavos. Nada de cuentas con `number`; los centavos,
   solo al hablar con Stripe.
2. Un pedido está **pagado** cuando Stripe le confirma el cobro al servidor, nunca porque el navegador volvió de la página
   de pago.
3. La tarjeta **nunca** pasa por nuestro servidor.
4. **Todo depende de la región.** Está prohibido escribir `if (country === "US")` o `"USD"` en el código.
5. **Cero textos fijos** en los componentes; una regla de lint lo vigila.
6. **Datos reales o rotulados DEMO.** El staging va con contraseña y `noindex`, y lleva la banda «PROTOTYPE · demo data ·
   test payments».
7. Toda la interfaz usa **tokens de diseño**.
8. **Interruptores** para lo que depende de ella: tiendas y mapa, PayPal, cuotas y tercer idioma.
9. La venta online sale de la **bodega online**, nunca de una tienda.
10. El **carrito no llama** a servicios que cobran por llamada.
11. Cada pedido cobrado tiene **quién lo despache** y una **fecha prometida** que no se reescribe.

### La prueba técnica (antes de escribir código atado a Medusa)
Son seis comprobaciones sobre `dtc-starter`:
1. Corre en Railway con Postgres y Redis.
2. El contenido de producto sale en inglés y en español.
3. Funciona el modelo de bodega online más tiendas no vinculadas.
4. Un pago de prueba con Stripe crea el pedido **cobrado**.
5. Una pantalla propia en el admin lee una ruta propia e importa `packages/panel-ui`.
6. Stripe Tax en modo prueba da el impuesto de una dirección. Para eso hacen falta registros de prueba en 3 estados: sin
   ellos devuelve 0 con `not_collecting`. Además, se cuentan las llamadas.

**Regla:** si pasan la 1, la 3 y la 4, y la 2 tiene un camino claro, se sigue con Medusa. Si no corre en ningún hosting o
el pago no crea el pedido, se prueba Vendure. Mientras no se decida, nadie escribe código atado al motor.

### Fases
| Fase | Qué sale |
|---|---|
| 0 · Arranque | Prueba técnica y decisión en `docs/decisiones/001-motor.md`; repositorio con CI y staging; preguntas a la clienta; 2 direcciones de marca y wireframes |
| 1 · Prototipo | La tienda completa en modo prueba, con datos demo y el panel base (Inicio, Inventario y «¿Qué hago hoy?»). Tiene 15 criterios de salida, con pruebas Playwright de compra, 3D Secure, tarjeta rechazada, idioma y disponibilidad. |
| 2 · Puertas de V1 | Alcance y presupuesto firmados; después, sus cuentas y datos reales |
| 3A · Construcción de V1 | Todo V1 en su producción cerrada, con claves de prueba (unas 7 semanas) |
| 3B · Activación | Cobros, impuestos, textos legales, stock, despacho y catálogo reales (unas 2 semanas) |
| 4 · Lanzamiento suave | Ventas reales solo a invitados, durante 1 semana o 2 como máximo; luego se abre al público |
| 5 · V1.1 | Reseñas, lista de deseos, «Buy it again», BOPIS, login con Google o Apple, POS y la primera región de Latinoamérica |

**Cómo se trabaja:** cada fase es un milestone de GitHub; cada entregable, un issue con su criterio de salida; cada
decisión, un registro en `docs/decisiones/`.

**Cumplimiento en EE. UU.** (es un aviso, no asesoría legal):
- CPSIA: certificado CPC para los juguetes infantiles y la advertencia de «piezas pequeñas» junto al precio. Lo que se
  exige para publicar depende de la edad.
- COPPA: el sitio es para adultos.
- ADA, con WCAG 2.1 AA.
- CCPA/CPRA: «Your Privacy Choices» y la señal GPC.
- FTC: nada de reseñas falsas, precios «antes» inventados ni urgencia falsa.

## 5. Lo que pidió la clienta (reunión del 13-10)

- **Estilo:** blanco y limpio, con la estructura de Amazon y Walmart, también en el cobro y el pago.
- **Marca:** no tiene (ni logo, ni colores, ni letra, ni mascota). Crearla es parte de la oferta.
- **Público:** sin nicho definido; mamás y papás, más mamás.
- **Carrito:** «sofisticado», como el de Amazon, y que añadir al carrito sea fácil.
- **Producto:** descripción clara y corta, y un carrusel de recomendados.
- **Idiomas:** inglés, español y uno más.
- **Conversión:** con todos los recursos disponibles, pero solo los honestos, porque así lo exigen la FTC y nuestras reglas.
- **Cuentas:** login y compra como invitado.
- **Pagos e impuestos de EE. UU.:** pidió «ver el precio con impuestos». En EE. UU. el precio se muestra sin impuesto y el
  impuesto se calcula al pagar; hay que explicárselo.
- **Mapa:** interactivo, de EE. UU., con las tiendas físicas y su stock (si en Seattle no hay, que muestre San Diego).
- **Google:** SEO para salir primero, con «Products · Where to buy · FAQ» bajo el nombre.
- **Redes:** conectadas y listas. El marketing no está acordado.
- **A futuro:** otras secciones y llevar productos a Latinoamérica.

## 6. Pendientes

**Con Santiago**
- Qué hace Dionisio: ¿la versión B de la maqueta (la de Santiago), el paquete de datos común o el desarrollo real si ella
  firma?
- Si este repositorio es el de la maqueta (con `/datos`, `/a` y `/b`) o el del desarrollo real.
- Recalcular las fechas del plan de desarrollo desde el día de la firma.

**Con la clienta**
- ¿Tiene tiendas físicas reales? Si no, el mapa sale apagado: solo puede mostrar tiendas y stock que existan.
- Cómo lleva hoy el inventario, si tiene sistema de caja (POS) y quién tiene el stock que venderá la web.
- Si tiene empresa en EE. UU. con EIN, banco y dominio.
- Cuál es el tercer idioma.
- El catálogo: cuántos productos tiene y si el proveedor da fotos, datos y certificados.
- Envíos y devoluciones.
- Fecha objetivo y presupuesto.

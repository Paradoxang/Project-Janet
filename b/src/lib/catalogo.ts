// Catálogo de la tienda = el de ejemplo (/datos) + los cambios que hace la dueña desde su panel.
// En la demo, los cambios viven en este navegador; en el desarrollo real irán a la API.
import {
  leerMateriales,
  leerMedidas,
  leerPeso,
  MEDIDAS_VACIAS,
  numeroValido,
  PESO_VACIO,
  textoMateriales,
  textoMedidas,
  textoPeso,
  type Medidas,
  type Peso,
} from "./detalles";
import type { Categoria, GrupoEdad, Ocasion, Producto, ProductoLigero, Texto, Tinte } from "./tipos";

export interface CambiosCatalogo {
  /** Productos creados por la dueña. */
  nuevos: Producto[];
  /** Cambios sobre los productos de ejemplo, por id. */
  ediciones: Record<string, Partial<Producto>>;
  /** Ocultos: siguen en el panel pero no en la tienda. */
  ocultos: string[];
  /** Productos de ejemplo borrados. */
  borrados: string[];
}

export const SIN_CAMBIOS: CambiosCatalogo = { nuevos: [], ediciones: {}, ocultos: [], borrados: [] };

const PREFIJO_NUEVO = "n-";
export const esNuevo = (id: string) => id.startsWith(PREFIJO_NUEVO);

/** Lo mínimo que necesita el navegador (buscador, tarjetas, carrito). */
export function aLigero(p: Producto): ProductoLigero {
  const { id, slug, title, price, illustration, imagen, tint, ageGroup, category, occasions } = p;
  const { rating, reviewCount, bestSeller, stockOnline, deliveryDays, keywords } = p;
  return {
    id,
    slug,
    title,
    price,
    illustration,
    ...(imagen ? { imagen } : {}),
    tint,
    ageGroup,
    category,
    occasions,
    rating,
    reviewCount,
    bestSeller,
    stockOnline,
    deliveryDays,
    keywords,
  };
}

/** Lo que ve la tienda: sin borrados ni ocultos, con las ediciones y con los nuevos (primero). */
export function catalogoVisible(base: ProductoLigero[], c: CambiosCatalogo): ProductoLigero[] {
  const fuera = new Set([...c.borrados, ...c.ocultos]);
  const nuevos = c.nuevos.filter((p) => !fuera.has(p.id)).map(aLigero);
  const deBase = base
    .filter((p) => !fuera.has(p.id))
    .map((p) => (c.ediciones[p.id] ? aLigero({ ...(p as Producto), ...c.ediciones[p.id] }) : p));
  return [...nuevos, ...deBase];
}

/** Lo que ve la dueña en su panel: todos (también los ocultos), completos y editados; sin los borrados. */
export function catalogoCompleto(base: Producto[], c: CambiosCatalogo): Producto[] {
  const borrados = new Set(c.borrados);
  return [...c.nuevos, ...base.filter((p) => !borrados.has(p.id)).map((p) => ({ ...p, ...c.ediciones[p.id] }))];
}

export const srcProducto = (p: { illustration: string; imagen?: string }) =>
  p.imagen || `/productos/${p.illustration}.svg`;

/** Enlace a la ficha. Los productos nuevos no tienen página propia: usan /p/nuevo/?id=…. */
export const rutaProducto = (p: { id: string; slug: string }) =>
  esNuevo(p.id) ? { pathname: "/p/nuevo", query: { id: p.id } } : `/p/${p.slug}`;

export function aSlug(texto: string): string {
  const slug = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "producto";
}

// ——— Formulario de producto (lo que escribe la dueña) ———

export interface DatosProducto {
  titulo: Texto;
  resumen: Texto;
  /** «Sobre este artículo»: una idea por línea. */
  vinetas: Texto;
  /** Advertencias de seguridad: una por línea. */
  seguridad: Texto;
  precio: string;
  stock: string;
  diasEntrega: string;
  edad: GrupoEdad | "";
  categoria: Categoria | "";
  ocasiones: Ocasion[];
  ilustracion: string;
  imagen: string;
  tinte: Tinte;
  medidas: Medidas;
  peso: Peso;
  /** Ids de la lista de materiales (lib/detalles.ts). */
  materiales: string[];
  piezas: string;
  /**
   * Lo que el producto ya decía y no encaja en los campos de arriba (los materiales del catálogo de ejemplo,
   * o unas medidas sin unidad): se conserva mientras no se rellenen esos campos.
   */
  textoLibre: { medidas: string; peso: string; materiales: Texto };
  masVendido: boolean;
}

export type CampoConError =
  | "titulo"
  | "precio"
  | "stock"
  | "diasEntrega"
  | "edad"
  | "categoria"
  | "imagen"
  | "medidas"
  | "peso"
  | "piezas";

export function validarProducto(d: DatosProducto): CampoConError[] {
  const errores: CampoConError[] = [];
  const precio = Number(d.precio);
  if (!d.titulo.es.trim() && !d.titulo.en.trim()) errores.push("titulo");
  if (!d.precio.trim() || !Number.isFinite(precio) || precio <= 0 || precio > 10_000) errores.push("precio");
  if (!/^\d{1,5}$/.test(d.stock.trim())) errores.push("stock");
  if (!/^\d{1,2}$/.test(d.diasEntrega.trim()) || Number(d.diasEntrega) < 1) errores.push("diasEntrega");
  if (!d.edad) errores.push("edad");
  if (!d.categoria) errores.push("categoria");
  if (!d.imagen && !d.ilustracion) errores.push("imagen");
  // Detalles: opcionales, pero si se escriben, con números (el largo y el ancho, al menos)
  const { largo, ancho, alto } = d.medidas;
  if ([largo, ancho, alto].some((v) => v.trim())) {
    if (!numeroValido(largo) || !numeroValido(ancho) || (alto.trim() && !numeroValido(alto))) errores.push("medidas");
  }
  if (d.peso.valor.trim() && !numeroValido(d.peso.valor)) errores.push("peso");
  if (d.piezas.trim() && !(/^\d{1,4}$/.test(d.piezas.trim()) && Number(d.piezas) >= 1)) errores.push("piezas");
  return errores;
}

const lineas = (texto: string) =>
  texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Si falta un idioma, se usa el otro (la tienda es bilingüe). */
const ambos = (t: Texto): Texto => ({ en: t.en.trim() || t.es.trim(), es: t.es.trim() || t.en.trim() });

/** Producto a partir del formulario. Con `anterior`, conserva lo que el formulario no toca (reseñas, etc.). */
export function productoDesdeDatos(d: DatosProducto, anterior?: Producto, id?: string): Producto {
  const titulo = ambos(d.titulo);
  const base: Producto = anterior ?? {
    id: id ?? `${PREFIJO_NUEVO}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    slug: aSlug(titulo.en || titulo.es),
    title: titulo,
    summary: { en: "", es: "" },
    bullets: { en: [], es: [] },
    specs: { ages: { en: "", es: "" }, dimensions: "", weight: "", materials: { en: "", es: "" }, batteries: { en: "", es: "" }, pieces: null },
    safety: { en: [], es: [] },
    price: 0,
    category: "baby",
    ageGroup: "0-12m",
    occasions: [],
    bestSeller: false,
    rating: 0,
    reviewCount: 0,
    stockOnline: 0,
    deliveryDays: 3,
    illustration: "",
    tint: "cielo",
    related: [],
    keywords: { en: [], es: [] },
    reviews: [],
  };
  const resumen = ambos(d.resumen);
  const vinetas = ambos(d.vinetas);
  const seguridad = ambos(d.seguridad);
  return {
    ...base,
    title: titulo,
    summary: resumen,
    bullets: { en: lineas(vinetas.en), es: lineas(vinetas.es) },
    safety: { en: lineas(seguridad.en), es: lineas(seguridad.es) },
    price: Math.round(Number(d.precio) * 100) / 100,
    stockOnline: Number(d.stock),
    deliveryDays: Number(d.diasEntrega),
    ageGroup: d.edad || base.ageGroup,
    category: d.categoria || base.category,
    occasions: d.ocasiones,
    illustration: d.imagen ? base.illustration || d.ilustracion : d.ilustracion,
    imagen: d.imagen || undefined,
    tint: d.tinte,
    specs: {
      ...base.specs,
      dimensions: textoMedidas(d.medidas) || d.textoLibre.medidas,
      weight: textoPeso(d.peso) || d.textoLibre.peso,
      materials: d.materiales.length > 0 ? textoMateriales(d.materiales) : { ...d.textoLibre.materiales },
      pieces: /^\d+$/.test(d.piezas.trim()) && Number(d.piezas) > 0 ? Number(d.piezas) : null,
    },
    bestSeller: d.masVendido,
  };
}

/** Lo que la dueña puede cambiar de un producto de ejemplo (lo demás, como las reseñas, no se toca). */
export function soloEditables(p: Producto): Partial<Producto> {
  const { title, summary, bullets, safety, price, stockOnline, deliveryDays, ageGroup, category, occasions } = p;
  const { illustration, imagen, tint, specs, bestSeller } = p;
  return {
    title,
    summary,
    bullets,
    safety,
    price,
    stockOnline,
    deliveryDays,
    ageGroup,
    category,
    occasions,
    illustration,
    imagen,
    tint,
    specs,
    bestSeller,
  };
}

/** Formulario lleno con un producto (para editarlo). */
export function datosDesdeProducto(p: Producto): DatosProducto {
  const medidas = leerMedidas(p.specs.dimensions);
  const peso = leerPeso(p.specs.weight);
  const materiales = leerMateriales(p.specs.materials);
  return {
    titulo: { ...p.title },
    resumen: { ...p.summary },
    vinetas: { en: p.bullets.en.join("\n"), es: p.bullets.es.join("\n") },
    seguridad: { en: p.safety.en.join("\n"), es: p.safety.es.join("\n") },
    precio: String(p.price),
    stock: String(p.stockOnline),
    diasEntrega: String(p.deliveryDays),
    edad: p.ageGroup,
    categoria: p.category,
    ocasiones: [...p.occasions],
    ilustracion: p.illustration,
    imagen: p.imagen ?? "",
    tinte: p.tint,
    medidas: medidas ?? MEDIDAS_VACIAS,
    peso: peso ?? PESO_VACIO,
    materiales: materiales ?? [],
    piezas: p.specs.pieces === null ? "" : String(p.specs.pieces),
    textoLibre: {
      medidas: medidas ? "" : p.specs.dimensions,
      peso: peso ? "" : p.specs.weight,
      materiales: materiales ? { en: "", es: "" } : { ...p.specs.materials },
    },
    masVendido: p.bestSeller,
  };
}

export const DATOS_VACIOS: DatosProducto = {
  titulo: { en: "", es: "" },
  resumen: { en: "", es: "" },
  vinetas: { en: "", es: "" },
  seguridad: { en: "", es: "" },
  precio: "",
  stock: "10",
  diasEntrega: "3",
  edad: "",
  categoria: "",
  ocasiones: [],
  ilustracion: "",
  imagen: "",
  tinte: "cielo",
  medidas: MEDIDAS_VACIAS,
  peso: PESO_VACIO,
  materiales: [],
  piezas: "",
  textoLibre: { medidas: "", peso: "", materiales: { en: "", es: "" } },
  masVendido: false,
};

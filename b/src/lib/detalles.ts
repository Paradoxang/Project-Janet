// Detalles de un producto (decisión del 16-10): el formulario pide las medidas y el peso con su unidad, las piezas
// como número entero y los materiales de una lista. La ficha los sigue mostrando como texto ("30 x 20 x 15 cm").
import type { Idioma, Texto } from "./tipos";

export const UNIDADES_MEDIDA = ["cm", "m", "in"] as const;
export const UNIDADES_PESO = ["kg", "lb"] as const;
export type UnidadMedida = (typeof UNIDADES_MEDIDA)[number];
export type UnidadPeso = (typeof UNIDADES_PESO)[number];

export interface Medidas {
  largo: string;
  ancho: string;
  alto: string;
  unidad: UnidadMedida;
  /** Lo que va entre paréntesis en el catálogo de ejemplo, como «each block»: se conserva tal cual. */
  nota: string;
}

export interface Peso {
  valor: string;
  unidad: UnidadPeso;
}

export const MEDIDAS_VACIAS: Medidas = { largo: "", ancho: "", alto: "", unidad: "cm", nota: "" };
export const PESO_VACIO: Peso = { valor: "", unidad: "kg" };

/** Materiales para elegir. Van en minúscula (salvo siglas): la ficha los junta en una frase. */
export const MATERIALES: ({ id: string } & Texto)[] = [
  { id: "madera", es: "madera", en: "wood" },
  { id: "bambu", es: "bambú", en: "bamboo" },
  { id: "plastico", es: "plástico", en: "plastic" },
  { id: "plastico-abs", es: "plástico ABS", en: "ABS plastic" },
  { id: "plastico-sin-bpa", es: "plástico sin BPA", en: "BPA-free plastic" },
  { id: "silicona", es: "silicona de grado alimenticio", en: "food-grade silicone" },
  { id: "caucho", es: "caucho natural", en: "natural rubber" },
  { id: "espuma-eva", es: "espuma EVA", en: "EVA foam" },
  { id: "algodon", es: "algodón", en: "cotton" },
  { id: "algodon-organico", es: "algodón orgánico", en: "organic cotton" },
  { id: "poliester", es: "poliéster", en: "polyester" },
  { id: "peluche", es: "peluche", en: "plush" },
  { id: "fieltro", es: "fieltro", en: "felt" },
  { id: "metal", es: "metal", en: "metal" },
  { id: "imanes", es: "imanes", en: "magnets" },
  { id: "carton", es: "cartón", en: "cardboard" },
  { id: "papel", es: "papel", en: "paper" },
  { id: "vidrio", es: "vidrio", en: "glass" },
  { id: "pintura-agua", es: "pintura a base de agua", en: "water-based paint" },
];

/**
 * Advertencias de seguridad comunes, para marcarlas en vez de escribirlas. Las que ya usa el catálogo de ejemplo
 * van con su texto exacto (la de asfixia activa el aviso destacado de la ficha).
 */
export type IdAviso = "asfixia" | "empaque" | "supervision" | "pilas" | "imanes" | "proyectiles";

export const AVISOS_SEGURIDAD: ({ id: IdAviso } & Texto)[] = [
  {
    id: "asfixia",
    es: "ADVERTENCIA: PELIGRO DE ASFIXIA — Piezas pequeñas. No apto para menores de 3 años.",
    en: "WARNING: CHOKING HAZARD — Small parts. Not for children under 3 yrs.",
  },
  {
    id: "empaque",
    es: "Retira todo el empaque antes de darle este juguete a un niño.",
    en: "Remove all packaging before giving this toy to a child.",
  },
  { id: "supervision", es: "Se requiere la supervisión de un adulto.", en: "Adult supervision required." },
  {
    id: "pilas",
    es: "Mantén las pilas y baterías fuera del alcance de los niños.",
    en: "Keep batteries away from children.",
  },
  {
    id: "imanes",
    es: "ADVERTENCIA: Este producto contiene imanes pequeños. Si se tragan, los imanes pueden unirse a través de los intestinos y causar infecciones graves y la muerte. Busca atención médica de inmediato si se tragan o se inhalan imanes.",
    en: "WARNING: This product contains small magnets. Swallowed magnets can stick together across intestines causing serious infections and death. Seek immediate medical attention if magnets are swallowed or inhaled.",
  },
  {
    id: "proyectiles",
    es: "No apuntes a los ojos ni a la cara. Usa solo los proyectiles incluidos con este juguete.",
    en: "Do not aim at eyes or face. Use only the projectiles supplied with this toy.",
  },
];

/** La advertencia común que dice exactamente este texto (en los dos idiomas), si la hay. */
export const avisoComun = (t: Texto) => AVISOS_SEGURIDAD.find((a) => a.es === t.es && a.en === t.en);

export const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** "12,5" o "12.5" → 12.5 (con 2 decimales como mucho). Lo que no es un número positivo bien escrito → NaN. */
export function aNumero(texto: string): number {
  const limpio = texto.trim().replace(",", ".");
  return /^\d+(\.\d+)?$/.test(limpio) ? Math.round(Number(limpio) * 100) / 100 : NaN;
}

/** Un número de medida o de peso válido: mayor que 0 y razonable. */
export const numeroValido = (texto: string) => {
  const n = aNumero(texto);
  return n > 0 && n <= 10_000;
};

const comoTexto = (texto: string) => (Number.isNaN(aNumero(texto)) ? "" : String(aNumero(texto)));

/** "30 x 20.5 x 15 cm"; sin alto, "30 x 20.5 cm"; sin medidas, "". */
export function textoMedidas(m: Medidas): string {
  const valores = [m.largo, m.ancho, m.alto].map(comoTexto).filter(Boolean);
  if (valores.length === 0) return "";
  return `${valores.join(" x ")} ${m.unidad}${m.nota ? ` (${m.nota})` : ""}`;
}

export function textoPeso(p: Peso): string {
  const valor = comoTexto(p.valor);
  return valor ? `${valor} ${p.unidad}` : "";
}

/** Los materiales en los dos idiomas, en el orden de la lista: «Madera, pintura a base de agua». */
export function textoMateriales(ids: string[]): Texto {
  const elegidos = MATERIALES.filter((m) => ids.includes(m.id));
  const frase = (idioma: Idioma) => conMayuscula(elegidos.map((m) => m[idioma]).join(", "));
  return { es: frase("es"), en: frase("en") };
}

const NUMERO = String.raw`(\d+(?:\.\d+)?)`;
const RE_MEDIDAS = new RegExp(String.raw`^${NUMERO} x ${NUMERO}(?: x ${NUMERO})? (${UNIDADES_MEDIDA.join("|")})(?: \((.+)\))?$`);
const RE_PESO = new RegExp(String.raw`^${NUMERO} (${UNIDADES_PESO.join("|")})$`);

/**
 * Las medidas de un producto, para editarlas. Solo si al volver a escribirlas queda el mismo texto
 * (así nunca se cambia sin querer); si no, null y el texto se conserva aparte. Vacío → sin medidas.
 */
export function leerMedidas(texto: string): Medidas | null {
  if (!texto.trim()) return MEDIDAS_VACIAS;
  const r = RE_MEDIDAS.exec(texto);
  if (!r) return null;
  const m: Medidas = { largo: r[1], ancho: r[2], alto: r[3] ?? "", unidad: r[4] as UnidadMedida, nota: r[5] ?? "" };
  return textoMedidas(m) === texto ? m : null;
}

export function leerPeso(texto: string): Peso | null {
  if (!texto.trim()) return PESO_VACIO;
  const r = RE_PESO.exec(texto);
  if (!r) return null;
  const p: Peso = { valor: r[1], unidad: r[2] as UnidadPeso };
  return textoPeso(p) === texto ? p : null;
}

/** Los materiales de la lista que dice el texto, si lo dice exactamente así en los dos idiomas; si no, null. */
export function leerMateriales(t: Texto): string[] | null {
  if (!t.es.trim() && !t.en.trim()) return [];
  const nombres = t.en.split(",").map((s) => s.trim().toLowerCase());
  const ids = nombres.map((n) => MATERIALES.find((m) => m.en.toLowerCase() === n)?.id);
  if (ids.some((id) => !id)) return null;
  const otraVez = textoMateriales(ids as string[]);
  return otraVez.es === t.es && otraVez.en === t.en ? (ids as string[]) : null;
}

// Buscador del navegador: tolera errores de escritura y entiende la edad («regalo niño 5 años»).
import Fuse from "fuse.js";
import type { GrupoEdad, ProductoLigero } from "./tipos";

// Palabras que no ayudan a distinguir un juguete de otro.
const VACIAS = new Set([
  "a", "an", "and", "the", "for", "with", "of", "to", "my", "gift", "gifts", "toy", "toys", "kid", "kids",
  "boy", "boys", "girl", "girls", "child", "children", "year", "years", "yr", "yrs", "old", "yo", "month",
  "months", "baby", "y", "o", "de", "del", "la", "las", "el", "los", "un", "una", "para", "con", "mi",
  "regalo", "regalos", "juguete", "juguetes", "niño", "niños", "nino", "ninos", "niña", "niñas", "nina",
  "ninas", "año", "años", "ano", "anos", "mes", "meses", "bebe", "bebé", "hijo", "hija",
]);

export function crearIndice(productos: ProductoLigero[]) {
  return new Fuse(productos, {
    keys: [
      { name: "title.en", weight: 2 },
      { name: "title.es", weight: 2 },
      { name: "keywords.en", weight: 1.5 },
      { name: "keywords.es", weight: 1.5 },
    ],
    threshold: 0.36,
    ignoreLocation: true,
    ignoreDiacritics: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

export type Indice = ReturnType<typeof crearIndice>;

/** «5 años», «5 year old», «18 months», «3-4» → grupo de edad. */
export function edadDeConsulta(q: string): GrupoEdad | null {
  const texto = q.toLowerCase();
  // El número tiene que ir con una palabra de edad: «100 piezas» o «2.4 GHz» no son edades.
  const m = texto.match(
    /(?<![\d.])(\d{1,2})(?![\d.])\s*(?:(?:-|–|to|a)\s*\d{1,2}\s*)?(\+|years?\b|yrs?\b|yo\b|y\/o|old\b|años?\b|anos?\b|months?\b|meses\b|mes\b|m\b)/,
  );
  if (!m) return null;
  const meses = /^m/.test(m[2]);
  const n = meses ? Number(m[1]) / 12 : Number(m[1]);
  if (n < 1) return "0-12m";
  if (n <= 2) return "1-2";
  if (n <= 4) return "3-4";
  if (n <= 7) return "5-7";
  if (n <= 14) return "8+";
  return null;
}

export function palabrasDeConsulta(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((p) => p.length >= 2 && !/^\d+$/.test(p) && !VACIAS.has(p));
}

/**
 * Devuelve los productos ordenados por relevancia.
 * Cada palabra se busca por separado (así «magnetik tiles» encuentra «Magnetic tiles») y la edad suma puntos.
 */
export function buscar(indice: Indice, productos: ProductoLigero[], q: string, limite?: number): ProductoLigero[] {
  const palabras = palabrasDeConsulta(q);
  const edad = edadDeConsulta(q);
  if (palabras.length === 0 && !edad) return [];

  const puntos = new Map<string, { p: ProductoLigero; puntos: number; palabras: number }>();
  for (const palabra of palabras) {
    for (const r of indice.search(palabra)) {
      const actual = puntos.get(r.item.id) ?? { p: r.item, puntos: 0, palabras: 0 };
      actual.puntos += 1 - (r.score ?? 1);
      actual.palabras += 1;
      puntos.set(r.item.id, actual);
    }
  }

  let candidatos = [...puntos.values()];
  if (palabras.length === 0 && edad) {
    candidatos = productos.filter((p) => p.ageGroup === edad).map((p) => ({ p, puntos: 0, palabras: 0 }));
  }
  if (edad) {
    for (const c of candidatos) if (c.p.ageGroup === edad) c.puntos += 1.5;
    // Si hay palabras y edad, los de otra edad solo entran si casan con todas las palabras.
    if (palabras.length > 0) {
      candidatos = candidatos.filter((c) => c.p.ageGroup === edad || c.palabras === palabras.length);
    }
  }
  // Con varias palabras, primero los que casan con más palabras.
  candidatos.sort(
    (a, b) =>
      b.palabras - a.palabras ||
      b.puntos - a.puntos ||
      Number(b.p.bestSeller) - Number(a.p.bestSeller) ||
      b.p.reviewCount - a.p.reviewCount,
  );
  const lista = candidatos.map((c) => c.p);
  return limite ? lista.slice(0, limite) : lista;
}

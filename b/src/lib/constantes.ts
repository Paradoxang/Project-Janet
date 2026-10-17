// Listas fijas de la tienda, sin datos: se pueden usar en el navegador sin cargar el catálogo entero.
import type { Categoria, GrupoEdad, Ocasion } from "./tipos";

export const GRUPOS_EDAD: GrupoEdad[] = ["0-12m", "1-2", "3-4", "5-7", "8+"];
export const CATEGORIAS: Categoria[] = ["baby", "building", "pretend", "stem", "arts", "outdoor", "games", "plush"];
export const OCASIONES: Ocasion[] = ["birthday", "holidays", "baby-shower", "just-because", "back-to-school"];

/** El color de cada edad (fichas del menú, bloques de la portada y el formulario de producto). */
export const FONDO_EDAD: Record<GrupoEdad, string> = {
  "0-12m": "bg-tint-cielo",
  "1-2": "bg-tint-menta",
  "3-4": "bg-tint-lila",
  "5-7": "bg-tint-durazno",
  "8+": "bg-tint-limon",
};

/** El mismo tono de cada edad, oscuro: para textos (AA) y para el punto de color del menú. */
export const TINTA_EDAD: Record<GrupoEdad, { texto: string; punto: string }> = {
  "0-12m": { texto: "text-tinta-cielo", punto: "bg-tinta-cielo" },
  "1-2": { texto: "text-tinta-menta", punto: "bg-tinta-menta" },
  "3-4": { texto: "text-tinta-lila", punto: "bg-tinta-lila" },
  "5-7": { texto: "text-tinta-durazno", punto: "bg-tinta-durazno" },
  "8+": { texto: "text-tinta-limon", punto: "bg-tinta-limon" },
};

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

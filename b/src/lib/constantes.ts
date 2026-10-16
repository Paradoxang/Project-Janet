// Listas fijas de la tienda, sin datos: se pueden usar en el navegador sin cargar el catálogo entero.
import type { Categoria, GrupoEdad, Ocasion } from "./tipos";

export const GRUPOS_EDAD: GrupoEdad[] = ["0-12m", "1-2", "3-4", "5-7", "8+"];
export const CATEGORIAS: Categoria[] = ["baby", "building", "pretend", "stem", "arts", "outdoor", "games", "plush"];
export const OCASIONES: Ocasion[] = ["birthday", "holidays", "baby-shower", "just-because", "back-to-school"];

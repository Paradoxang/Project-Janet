// Las dos secciones de la tienda (rediseño del 26-10): juguetes y productos saludables, separadas en la misma web y con
// la misma plantilla por detrás. Es una propuesta y sigue abierta con la clienta:
// arriba van las dos pestañas y la barra lateral cambia sus categorías según la sección.

export type Seccion = "juguetes" | "saludable";

export const RUTA_SALUDABLE = "/healthy";

/** Categorías de ejemplo de la sección saludable, para enseñar cómo cambia la barra lateral. Las decide la dueña. */
export const CATEGORIAS_SALUDABLES = ["comida", "cuidado", "hogar"] as const;
export const PUBLICOS_SALUDABLES = ["ninos", "adultos"] as const;

export function seccionDeRuta(ruta: string): Seccion {
  return ruta.startsWith(RUTA_SALUDABLE) ? "saludable" : "juguetes";
}

/** Páginas de catálogo: en escritorio llevan la barra lateral fija. En las demás se abre con el botón de menú. */
export function conBarraLateral(ruta: string): boolean {
  return ruta === "/" || ruta.startsWith("/search") || ruta.startsWith(RUTA_SALUDABLE);
}

/** El pago va sin distracciones: cabecera mínima y sin barra lateral. */
export function esPago(ruta: string): boolean {
  return ruta.startsWith("/checkout");
}

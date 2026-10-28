// Las secciones de la tienda (rediseño del 26-10): juguetes y productos saludables, separadas en la misma web y con la
// misma plantilla por detrás. Van en su propia fila, centrada debajo de la cabecera (28-10), para que quepan más.

export type Seccion = "juguetes" | "saludable";

export const RUTA_SALUDABLE = "/healthy";

/** Las secciones, en orden, con su ruta y el color de su punto. Sumar una es añadirla aquí (y a `Seccion`). */
export const SECCIONES: { id: Seccion; ruta: string; punto: string }[] = [
  { id: "juguetes", ruta: "/", punto: "bg-calendula" },
  { id: "saludable", ruta: RUTA_SALUDABLE, punto: "bg-aqua" },
];

/** Categorías de ejemplo de la sección saludable, para enseñar cómo cambia la barra lateral. Las decide la dueña. */
export const CATEGORIAS_SALUDABLES = ["comida", "cuidado", "hogar"] as const;
export const PUBLICOS_SALUDABLES = ["ninos", "adultos"] as const;

export function seccionDeRuta(ruta: string): Seccion {
  return ruta.startsWith(RUTA_SALUDABLE) ? "saludable" : "juguetes";
}

/** El pago va sin distracciones: cabecera mínima y sin barra lateral. */
export function esPago(ruta: string): boolean {
  return ruta.startsWith("/checkout");
}

// Totales del carrito y del pago, en centavos enteros. El impuesto es una ESTIMACIÓN de ejemplo:
// tasa promedio del estado del ZIP (en el desarrollo real lo calcula Stripe Tax al pagar).
import type { Impuestos, ProductoLigero } from "./tipos";
import { aCentavos } from "./formato";
import { estadoDeZip } from "./zip";

export const ENVIO_GRATIS_DESDE = 35;
export const ENVIO_ESTANDAR = 5.99;
export const ENVIO_EXPRES = 12.99;

export type MetodoEnvio = "estandar" | "expres";

export interface LineaTotal {
  id: string;
  qty: number;
  guardado: boolean;
}

export interface Totales {
  articulos: number;
  subtotal: number; // centavos
  envio: number; // centavos
  impuesto: number; // centavos
  total: number; // centavos
  estado: string | null;
  tasa: number;
  faltaParaGratis: number; // centavos
}

export function calcularTotales(
  lineas: LineaTotal[],
  catalogo: Map<string, ProductoLigero>,
  zip: string,
  impuestos: Impuestos,
  metodo: MetodoEnvio = "estandar",
): Totales {
  const activas = lineas.filter((l) => !l.guardado && catalogo.has(l.id));
  const articulos = activas.reduce((n, l) => n + l.qty, 0);
  const subtotal = activas.reduce((s, l) => s + aCentavos(catalogo.get(l.id)!.price) * l.qty, 0);
  const umbral = aCentavos(ENVIO_GRATIS_DESDE);
  let envio = 0;
  if (articulos > 0) {
    if (metodo === "expres") envio = aCentavos(ENVIO_EXPRES);
    else envio = subtotal >= umbral ? 0 : aCentavos(ENVIO_ESTANDAR);
  }
  const estado = estadoDeZip(zip);
  const tasa = estado ? (impuestos.estados[estado]?.rate ?? 0) : 0;
  // En la maqueta el impuesto se estima sobre los productos (no sobre el envío).
  const impuesto = Math.round(subtotal * tasa);
  return {
    articulos,
    subtotal,
    envio,
    impuesto,
    total: subtotal + envio + impuesto,
    estado,
    tasa,
    faltaParaGratis: Math.max(0, umbral - subtotal),
  };
}

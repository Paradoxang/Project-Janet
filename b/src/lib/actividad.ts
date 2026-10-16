// Actividad de la demo en este navegador: qué se registra y cómo se resume para el panel.

export type TipoEvento = "visita" | "producto" | "carrito" | "compra" | "busqueda";

export interface Evento {
  tipo: TipoEvento;
  fecha: string;
  /** Id del producto (vista de ficha o carrito). */
  producto?: string;
  /** Total de la compra, en centavos. */
  total?: number;
  /** Lo que se buscó. */
  texto?: string;
}

export interface ResumenActividad {
  visitas: number;
  productos: number;
  carrito: number;
  compras: number;
  /** En centavos. */
  ventas: number;
  /** Compras entre visitas (0 si no hay visitas). */
  conversion: number;
}

export function resumirActividad(eventos: Evento[]): ResumenActividad {
  const cuenta = (tipo: TipoEvento) => eventos.filter((e) => e.tipo === tipo).length;
  const visitas = cuenta("visita");
  const compras = cuenta("compra");
  return {
    visitas,
    productos: cuenta("producto"),
    carrito: cuenta("carrito"),
    compras,
    ventas: eventos.reduce((suma, e) => suma + (e.tipo === "compra" ? (e.total ?? 0) : 0), 0),
    conversion: visitas ? compras / visitas : 0,
  };
}

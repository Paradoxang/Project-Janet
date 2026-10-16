import { describe, expect, it } from "vitest";
import { resumirActividad, type Evento } from "@/lib/actividad";

const ev = (tipo: Evento["tipo"], extra: Partial<Evento> = {}): Evento => ({ tipo, fecha: "2026-10-16T10:00:00Z", ...extra });

describe("actividad de la demo", () => {
  it("cuenta visitas, fichas, carrito y compras, y suma las ventas", () => {
    const r = resumirActividad([
      ev("visita"),
      ev("visita"),
      ev("visita"),
      ev("visita"),
      ev("producto", { producto: "p12" }),
      ev("carrito", { producto: "p12" }),
      ev("compra", { total: 5299 }),
      ev("busqueda", { texto: "dinosaurio" }),
    ]);
    expect(r).toEqual({ visitas: 4, productos: 1, carrito: 1, compras: 1, ventas: 5299, conversion: 0.25 });
  });

  it("sin visitas, la conversión es 0 (no NaN)", () => {
    expect(resumirActividad([]).conversion).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { getCatalogoLigero, getTaxRates } from "@/lib/data";
import { calcularTotales } from "@/lib/totales";

const catalogo = new Map((await getCatalogoLigero()).map((p) => [p.id, p]));
const impuestos = await getTaxRates();

describe("totales del carrito", () => {
  it("bloques magnéticos a Seattle: envío gratis e impuesto estimado de WA", () => {
    const t = calcularTotales([{ id: "p12", qty: 1, guardado: false }], catalogo, "98101", impuestos);
    expect(t.subtotal).toBe(4999);
    expect(t.envio).toBe(0);
    expect(t.estado).toBe("WA");
    expect(t.impuesto).toBe(Math.round(4999 * impuestos.estados.WA.rate));
    expect(t.total).toBe(t.subtotal + t.impuesto);
  });

  it("por debajo de $35 cobra el envío estándar y dice cuánto falta", () => {
    const t = calcularTotales([{ id: "p01", qty: 1, guardado: false }], catalogo, "92101", impuestos);
    expect(t.subtotal).toBe(1299);
    expect(t.envio).toBe(599);
    expect(t.faltaParaGratis).toBe(3500 - 1299);
  });

  it("lo guardado para después no cuenta, y Oregón no cobra impuesto", () => {
    const t = calcularTotales(
      [
        { id: "p12", qty: 2, guardado: false },
        { id: "p09", qty: 1, guardado: true },
      ],
      catalogo,
      "97201",
      impuestos,
      "expres",
    );
    expect(t.articulos).toBe(2);
    expect(t.subtotal).toBe(9998);
    expect(t.envio).toBe(1299);
    expect(t.impuesto).toBe(0);
  });
});

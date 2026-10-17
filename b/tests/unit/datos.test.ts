import { describe, expect, it } from "vitest";
import { getPanel, getProducts, getStores, getTaxRates } from "@/lib/data";
import { coordenadasDeZip, distanciaMillas } from "@/lib/zip";

const productos = await getProducts();
const tiendas = await getStores();
const panel = await getPanel();
const impuestos = await getTaxRates();

describe("paquete de datos", () => {
  it("tiene 40 productos completos en inglés y español", () => {
    expect(productos).toHaveLength(40);
    expect(new Set(productos.map((p) => p.id)).size).toBe(40);
    expect(new Set(productos.map((p) => p.slug)).size).toBe(40);
    for (const p of productos) {
      expect(p.title.en && p.title.es, p.id).toBeTruthy();
      expect(p.bullets.en.length, p.id).toBeGreaterThanOrEqual(4);
      expect(p.bullets.en.length, p.id).toBe(p.bullets.es.length);
      expect(p.safety.en.length, p.id).toBe(p.safety.es.length);
      for (const r of p.related) expect(productos.some((o) => o.id === r), `${p.id} → ${r}`).toBe(true);
    }
  });

  it("tiene 6 tiendas DEMO con stock de todos los productos", () => {
    expect(tiendas).toHaveLength(6);
    for (const ti of tiendas) {
      for (const p of productos) expect(ti.stock[p.id], `${ti.id}/${p.id}`).toBeGreaterThanOrEqual(0);
    }
  });

  it("cuenta la historia de la demo: en Seattle no hay y en San Diego sí", () => {
    const seattle = tiendas.find((ti) => ti.id === "seattle")!;
    const sanDiego = tiendas.find((ti) => ti.id === "san-diego")!;
    expect(seattle.stock.p12).toBe(0);
    expect(sanDiego.stock.p12).toBe(4);
    // Desde Seattle, la tienda más cercana con bloques magnéticos es San Diego
    const origen = coordenadasDeZip("98101")!;
    const conStock = tiendas
      .filter((ti) => ti.stock.p12 > 0)
      .sort((a, b) => distanciaMillas(origen, a) - distanciaMillas(origen, b));
    expect(conStock[0].id).toBe("san-diego");
  });

  it("tiene 60 días de panel y avisos accionables en los dos idiomas", () => {
    expect(panel.days).toHaveLength(60);
    expect(panel.alerts.length).toBeGreaterThanOrEqual(3);
    for (const a of panel.alerts) expect(a.action.en && a.action.es).toBeTruthy();
  });

  it("tiene una tasa de impuesto de ejemplo por estado", () => {
    expect(Object.keys(impuestos.estados)).toHaveLength(51);
    for (const e of Object.values(impuestos.estados)) {
      expect(e.rate).toBeGreaterThanOrEqual(0);
      expect(e.rate).toBeLessThan(0.12);
    }
  });
});

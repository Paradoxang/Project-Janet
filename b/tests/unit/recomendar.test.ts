import { describe, expect, it } from "vitest";
import { getCatalogoLigero } from "@/lib/data";
import { recomendar } from "@/lib/recomendar";
import { cambiarClave, crearCuenta, huellaClave } from "@/lib/sesion";

describe("recomendaciones de la cuenta", () => {
  it("recomienda primero lo de la misma categoría que le gustó, sin repetir", async () => {
    const catalogo = await getCatalogoLigero();
    for (const gusto of catalogo) {
      const lista = recomendar(catalogo, [gusto.id], 6);
      expect(lista.map((p) => p.id)).not.toContain(gusto.id);
      expect(lista.every((p) => p.stockOnline > 0)).toBe(true);
      // Todo lo de su misma categoría (con stock) va antes que lo de otras categorías
      const mismos = catalogo.filter((p) => p.category === gusto.category && p.id !== gusto.id && p.stockOnline > 0);
      const primeros = lista.slice(0, Math.min(mismos.length, lista.length));
      expect(primeros.every((p) => p.category === gusto.category), gusto.slug).toBe(true);
    }
  });

  it("sin pistas, recomienda los más vendidos", async () => {
    const catalogo = await getCatalogoLigero();
    const lista = recomendar(catalogo, [], 3);
    expect(lista).toHaveLength(3);
    expect(lista.every((p) => p.bestSeller)).toBe(true);
  });
});

describe("cambiar la contraseña", () => {
  it("pide la actual, exige 8 caracteres y que sea otra; guarda solo la huella nueva", async () => {
    const r = await crearCuenta({}, { nombre: "Ana", correo: "ana@ejemplo.com", clave: "juguetes123" });
    if ("error" in r) throw new Error(r.error);
    const cuenta = r.cuenta;
    expect(await cambiarClave(cuenta, "otra-cosa", "nueva-clave-1")).toEqual({ error: "claveActual" });
    expect(await cambiarClave(cuenta, "juguetes123", "corta")).toEqual({ error: "claveCorta" });
    expect(await cambiarClave(cuenta, "juguetes123", "juguetes123")).toEqual({ error: "claveIgual" });
    const ok = await cambiarClave(cuenta, "juguetes123", "nueva-clave-1");
    if ("error" in ok) throw new Error(ok.error);
    expect(ok.cuenta.sal).not.toBe(cuenta.sal);
    expect((await huellaClave("nueva-clave-1", ok.cuenta.sal)).huella).toBe(ok.cuenta.huella);
    expect(JSON.stringify(ok.cuenta)).not.toContain("nueva-clave-1");
  });
});

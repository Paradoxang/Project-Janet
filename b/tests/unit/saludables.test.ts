import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { rutaProducto, srcProducto } from "@/lib/catalogo";
import { getCatalogoLigero } from "@/lib/data";
import { fotoSaludable, SALUDABLES, SALUDABLES_LIGEROS } from "@/lib/saludables";

// Los productos saludables se compran como los juguetes (28-10), pero no se mezclan con ellos.
describe("productos saludables", () => {
  it("cada uno tiene su foto en public/saludables", () => {
    for (const p of SALUDABLES) {
      expect(existsSync(join(process.cwd(), "public", fotoSaludable(p))), p.foto).toBe(true);
    }
  });

  it("en el carrito llevan su foto y enlazan a su tarjeta de la sección saludable", () => {
    for (const p of SALUDABLES_LIGEROS) {
      expect(p.seccion).toBe("saludable");
      expect(srcProducto(p)).toBe(`/saludables/${p.slug}.webp`);
      expect(rutaProducto(p)).toBe(`/healthy#${p.id}`);
    }
  });

  it("no comparten id con ningún juguete y no están en el catálogo de juguetes", async () => {
    const juguetes = await getCatalogoLigero();
    const ids = new Set(juguetes.map((p) => p.id));
    for (const p of SALUDABLES_LIGEROS) expect(ids.has(p.id), p.id).toBe(false);
    expect(juguetes.some((p) => p.seccion === "saludable")).toBe(false);
  });
});

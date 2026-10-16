import { describe, expect, it } from "vitest";
import { aCentavos, partesPrecio, sumarDiasHabiles } from "@/lib/formato";

describe("formato", () => {
  it("separa el precio sin errores de coma flotante", () => {
    expect(partesPrecio(24.99)).toEqual({ enteros: "24", centavos: "99" });
    expect(partesPrecio(0.1 + 0.2)).toEqual({ enteros: "0", centavos: "30" });
    expect(aCentavos(19.99) * 3).toBe(5997);
  });

  it("salta fines de semana", () => {
    const jueves = new Date(2026, 9, 15);
    expect(sumarDiasHabiles(jueves, 1).getDate()).toBe(16); // viernes
    expect(sumarDiasHabiles(jueves, 2).getDate()).toBe(19); // lunes
    expect(sumarDiasHabiles(jueves, 3).getDate()).toBe(20); // martes
  });
});

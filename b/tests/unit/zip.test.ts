import { describe, expect, it } from "vitest";
import { coordenadasDeZip, distanciaMillas, estadoDeZip, lugarDeZip, zipValido } from "@/lib/zip";

describe("ZIP", () => {
  it("reconoce estado y ciudad", () => {
    expect(estadoDeZip("98101")).toBe("WA");
    expect(lugarDeZip("98101")).toBe("Seattle");
    expect(estadoDeZip("92101")).toBe("CA");
    expect(lugarDeZip("92101")).toBe("San Diego");
    expect(estadoDeZip("77002")).toBe("TX");
    expect(estadoDeZip("33131")).toBe("FL");
    expect(estadoDeZip("10001")).toBe("NY");
    expect(estadoDeZip("02108")).toBe("MA");
  });

  it("valida el formato", () => {
    expect(zipValido("98101")).toBe(true);
    expect(zipValido("9810")).toBe(false);
    expect(zipValido("abcde")).toBe(false);
    expect(estadoDeZip("12")).toBeNull();
  });

  it("calcula distancias razonables", () => {
    const seattle = coordenadasDeZip("98101")!;
    const sanDiego = coordenadasDeZip("92101")!;
    const millas = distanciaMillas(seattle, sanDiego);
    expect(millas).toBeGreaterThan(1000);
    expect(millas).toBeLessThan(1100);
  });
});

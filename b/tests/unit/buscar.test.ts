import { describe, expect, it } from "vitest";
import { buscar, crearIndice, edadDeConsulta, palabrasDeConsulta } from "@/lib/buscar";
import { getCatalogoLigero } from "@/lib/data";

const catalogo = await getCatalogoLigero();
const indice = crearIndice(catalogo);
const ids = (q: string) => buscar(indice, catalogo, q).map((p) => p.id);

describe("buscador", () => {
  it("encuentra aunque se escriba mal", () => {
    expect(ids("magnetik tiles")[0]).toBe("p12");
    expect(ids("dinosaurs")[0]).toBe("p11");
    expect(ids("telescop")[0]).toBe("p17");
  });

  it("busca en español y sin tildes", () => {
    expect(ids("dinosaurio")).toContain("p11");
    expect(ids("xilofono")).toContain("p07");
    expect(ids("bloques magneticos")[0]).toBe("p12");
  });

  it("entiende la edad", () => {
    expect(edadDeConsulta("regalo niño 5 años")).toBe("5-7");
    expect(edadDeConsulta("gift for 5 year old")).toBe("5-7");
    expect(edadDeConsulta("toys for 18 months")).toBe("1-2");
    expect(edadDeConsulta("juguete bebé 6 meses")).toBe("0-12m");
    expect(edadDeConsulta("2 year old")).toBe("1-2");
    expect(edadDeConsulta("rocket")).toBeNull();
    expect(edadDeConsulta("100 piece puzzle")).toBeNull();
    expect(edadDeConsulta("2.4 GHz car")).toBeNull();
    expect(edadDeConsulta("juguetes 3 a 4 años")).toBe("3-4");
    expect(edadDeConsulta("toys 8+")).toBe("8+");
    expect(edadDeConsulta("5yo")).toBe("5-7");
    const deCinco = buscar(indice, catalogo, "regalo niño 5 años");
    expect(deCinco.length).toBeGreaterThan(0);
    expect(deCinco.every((p) => p.ageGroup === "5-7")).toBe(true);
    expect(deCinco.map((p) => p.id)).toContain("p12");
  });

  it("ignora palabras vacías y no busca con menos de 2 letras", () => {
    expect(palabrasDeConsulta("a gift for the kids")).toEqual([]);
    expect(buscar(indice, catalogo, "m")).toEqual([]);
  });
});

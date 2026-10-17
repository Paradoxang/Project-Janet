import { describe, expect, it } from "vitest";
import {
  aNumero,
  leerMateriales,
  leerMedidas,
  leerPeso,
  MATERIALES,
  MEDIDAS_VACIAS,
  PESO_VACIO,
  textoMateriales,
  textoMedidas,
  textoPeso,
} from "@/lib/detalles";
import { getProducts } from "@/lib/data";

describe("detalles del producto: medidas, peso y materiales", () => {
  it("acepta coma o punto decimal y nada que no sea un número positivo", () => {
    expect(aNumero("12,5")).toBe(12.5);
    expect(aNumero(" 12.5 ")).toBe(12.5);
    expect(aNumero("030")).toBe(30);
    expect(aNumero("1.50")).toBe(1.5);
    expect(aNumero("")).toBeNaN();
    expect(aNumero("treinta")).toBeNaN();
    expect(aNumero("-3")).toBeNaN();
    expect(aNumero("30 cm")).toBeNaN();
  });

  it("escribe las medidas y el peso con su unidad", () => {
    expect(textoMedidas({ ...MEDIDAS_VACIAS, largo: "60", ancho: "30,5", alto: "85" })).toBe("60 x 30.5 x 85 cm");
    expect(textoMedidas({ ...MEDIDAS_VACIAS, largo: "90", ancho: "60", unidad: "in" })).toBe("90 x 60 in");
    expect(textoMedidas({ ...MEDIDAS_VACIAS, largo: "1,2", ancho: "0,8", alto: "1", unidad: "m" })).toBe("1.2 x 0.8 x 1 m");
    expect(textoMedidas(MEDIDAS_VACIAS)).toBe("");
    expect(textoPeso({ valor: "4,50", unidad: "lb" })).toBe("4.5 lb");
    expect(textoPeso({ valor: "1.2", unidad: "kg" })).toBe("1.2 kg");
    expect(textoPeso(PESO_VACIO)).toBe("");
  });

  it("los materiales salen de la lista en los dos idiomas, siempre en el mismo orden", () => {
    expect(textoMateriales(["pintura-agua", "madera"])).toEqual({
      es: "Madera, pintura a base de agua",
      en: "Wood, water-based paint",
    });
    expect(textoMateriales([])).toEqual({ es: "", en: "" });
    expect(new Set(MATERIALES.map((m) => m.id)).size).toBe(MATERIALES.length);
  });

  it("vuelve a leer lo que escribió el formulario", () => {
    const medidas = { ...MEDIDAS_VACIAS, largo: "60", ancho: "30.5", alto: "85" };
    expect(leerMedidas(textoMedidas(medidas))).toEqual(medidas);
    expect(leerPeso("4.5 lb")).toEqual({ valor: "4.5", unidad: "lb" });
    expect(leerMateriales(textoMateriales(["madera", "pintura-agua"]))).toEqual(["madera", "pintura-agua"]);
    expect(leerMedidas("")).toEqual(MEDIDAS_VACIAS);
    expect(leerMateriales({ es: "", en: "" })).toEqual([]);
  });

  it("lo que no encaja no se adivina: se deja como estaba", () => {
    expect(leerMedidas("85")).toBeNull();
    expect(leerMedidas("30 x 20 x 15")).toBeNull();
    expect(leerMedidas("30.0 x 20 cm")).toBeNull();
    expect(leerPeso("C")).toBeNull();
    expect(leerPeso("1,2 kg")).toBeNull();
    expect(leerMateriales({ es: "Madera de tilo, pintura a base de agua", en: "Basswood, water-based paint" })).toBeNull();
    // En otro orden, tampoco: al reescribirlo cambiaría
    expect(leerMateriales({ es: "Pintura a base de agua, madera", en: "Water-based paint, wood" })).toBeNull();
  });

  it("las medidas y el peso de los 40 juguetes de ejemplo se leen y se reescriben idénticos", async () => {
    for (const p of await getProducts()) {
      const medidas = leerMedidas(p.specs.dimensions);
      const peso = leerPeso(p.specs.weight);
      expect(medidas, p.specs.dimensions).not.toBeNull();
      expect(peso, p.specs.weight).not.toBeNull();
      expect(textoMedidas(medidas!)).toBe(p.specs.dimensions);
      expect(textoPeso(peso!)).toBe(p.specs.weight);
    }
    const [p01] = await getProducts();
    expect(leerMedidas(p01.specs.dimensions)?.unidad).toBe("in");
    expect(leerMateriales(p01.specs.materials)).toEqual(["silicona"]);
  });
});

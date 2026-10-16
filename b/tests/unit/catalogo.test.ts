import { describe, expect, it } from "vitest";
import {
  aSlug,
  catalogoCompleto,
  catalogoVisible,
  DATOS_VACIOS,
  datosDesdeProducto,
  esNuevo,
  productoDesdeDatos,
  rutaProducto,
  SIN_CAMBIOS,
  srcProducto,
  validarProducto,
  type DatosProducto,
} from "@/lib/catalogo";
import { getCatalogoLigero, getProducts } from "@/lib/data";
import { AVISOS_SEGURIDAD, avisoComun, MEDIDAS_VACIAS } from "@/lib/detalles";

const datos: DatosProducto = {
  ...DATOS_VACIOS,
  titulo: { es: "Cocinita de madera", en: "" },
  precio: "59.9",
  stock: "8",
  edad: "3-4",
  categoria: "pretend",
  ilustracion: "tea-set",
  vinetas: [
    { es: "Horno que se abre", en: "" },
    { es: "", en: "" },
    { es: "  Incluye 6 utensilios ", en: "" },
  ],
};

describe("catálogo con los cambios de la dueña", () => {
  it("crea un producto nuevo desde el formulario (y rellena el idioma que falta)", () => {
    const p = productoDesdeDatos(datos);
    expect(esNuevo(p.id)).toBe(true);
    expect(p.title).toEqual({ es: "Cocinita de madera", en: "Cocinita de madera" });
    expect(p.slug).toBe("cocinita-de-madera");
    expect(p.price).toBe(59.9);
    expect(p.bullets.es).toEqual(["Horno que se abre", "Incluye 6 utensilios"]);
    expect(p.reviewCount).toBe(0);
    expect(rutaProducto(p)).toEqual({ pathname: "/p/nuevo", query: { id: p.id } });
    expect(srcProducto(p)).toBe("/productos/tea-set.svg");
    expect(srcProducto({ ...p, imagen: "data:image/jpeg;base64,xx" })).toBe("data:image/jpeg;base64,xx");
  });

  it("valida lo obligatorio", () => {
    expect(validarProducto(datos)).toEqual([]);
    expect(validarProducto(DATOS_VACIOS)).toEqual(["titulo", "precio", "edad", "categoria", "imagen"]);
    expect(validarProducto({ ...datos, precio: "-3", stock: "muchos" })).toEqual(["precio", "stock"]);
  });

  it("la tienda ve los nuevos, las ediciones y no ve lo oculto ni lo borrado", async () => {
    const base = await getCatalogoLigero();
    const nuevo = productoDesdeDatos(datos);
    const visible = catalogoVisible(base, {
      nuevos: [nuevo],
      ediciones: { p12: { price: 39.99, summary: { en: "x", es: "x" } } },
      ocultos: ["p04"],
      borrados: ["p01"],
    });
    expect(visible[0].id).toBe(nuevo.id);
    expect(visible.find((p) => p.id === "p12")?.price).toBe(39.99);
    expect(visible.find((p) => p.id === "p12")).not.toHaveProperty("summary");
    expect(visible.some((p) => p.id === "p04" || p.id === "p01")).toBe(false);
    expect(visible).toHaveLength(base.length - 2 + 1);
    // Sin cambios, el catálogo es el de ejemplo tal cual
    expect(catalogoVisible(base, SIN_CAMBIOS)).toEqual(base);
  });

  it("el panel ve también lo oculto, pero no lo borrado", async () => {
    const base = await getProducts();
    const todos = catalogoCompleto(base, { ...SIN_CAMBIOS, ocultos: ["p04"], borrados: ["p01"] });
    expect(todos.some((p) => p.id === "p04")).toBe(true);
    expect(todos.some((p) => p.id === "p01")).toBe(false);
  });

  it("editar un producto de ejemplo conserva sus reseñas", async () => {
    const [p] = await getProducts();
    const editado = productoDesdeDatos({ ...datosDesdeProducto(p), precio: "9.99" }, p);
    expect(editado.price).toBe(9.99);
    expect(editado.reviews).toEqual(p.reviews);
    expect(editado.id).toBe(p.id);
  });

  it("hace slugs legibles", () => {
    expect(aSlug("¡Tren de Madera, 40 piezas!")).toBe("tren-de-madera-40-piezas");
    expect(aSlug("???")).toBe("producto");
  });

  it("crea el producto con sus detalles: medidas y peso con unidad, piezas y materiales de la lista", () => {
    const p = productoDesdeDatos({
      ...datos,
      medidas: { ...MEDIDAS_VACIAS, largo: "60", ancho: "30,5", alto: "85" },
      peso: { valor: "4,5", unidad: "lb" },
      piezas: "12",
      materiales: ["pintura-agua", "madera"],
    });
    expect(p.specs).toMatchObject({
      dimensions: "60 x 30.5 x 85 cm",
      weight: "4.5 lb",
      pieces: 12,
      materials: { es: "Madera, pintura a base de agua", en: "Wood, water-based paint" },
    });
    // Al editarlo, el formulario vuelve con lo mismo
    const d = datosDesdeProducto(p);
    expect(d.medidas).toEqual({ ...MEDIDAS_VACIAS, largo: "60", ancho: "30.5", alto: "85" });
    expect(d.peso).toEqual({ valor: "4.5", unidad: "lb" });
    expect(d.piezas).toBe("12");
    expect(d.materiales).toEqual(["madera", "pintura-agua"]);
    expect(d.textoLibre).toEqual(DATOS_VACIOS.textoLibre);
  });

  it("valida los detalles: son opcionales, pero si se escriben, con números", () => {
    const con = (cambios: Partial<DatosProducto>) => validarProducto({ ...datos, ...cambios });
    expect(con({ medidas: { ...MEDIDAS_VACIAS, largo: "60" } })).toEqual(["medidas"]);
    expect(con({ medidas: { ...MEDIDAS_VACIAS, largo: "sesenta", ancho: "30" } })).toEqual(["medidas"]);
    expect(con({ medidas: { ...MEDIDAS_VACIAS, largo: "60", ancho: "30", alto: "0" } })).toEqual(["medidas"]);
    expect(con({ medidas: { ...MEDIDAS_VACIAS, largo: "60", ancho: "30" } })).toEqual([]);
    expect(con({ peso: { valor: "C", unidad: "kg" } })).toEqual(["peso"]);
    expect(con({ peso: { valor: "1,2", unidad: "kg" } })).toEqual([]);
    expect(con({ piezas: "2.5" })).toEqual(["piezas"]);
    expect(con({ piezas: "0" })).toEqual(["piezas"]);
    expect(con({ piezas: "12" })).toEqual([]);
  });

  it("editar un juguete de ejemplo sin tocar nada lo deja idéntico (los 20)", async () => {
    for (const p of await getProducts()) {
      expect(productoDesdeDatos(datosDesdeProducto(p), p)).toEqual(p);
    }
  });

  it("los puntos y las advertencias van en pares de idioma; si falta uno, se usa el otro", () => {
    const p = productoDesdeDatos({
      ...datos,
      vinetas: [
        { es: "Horno que se abre", en: "Oven door opens" },
        { es: "Incluye 6 utensilios", en: "" },
        { es: "", en: "" },
      ],
      seguridad: [{ es: AVISOS_SEGURIDAD[0].es, en: AVISOS_SEGURIDAD[0].en }, { es: "", en: "Not for outdoor use" }],
    });
    expect(p.bullets).toEqual({
      es: ["Horno que se abre", "Incluye 6 utensilios"],
      en: ["Oven door opens", "Incluye 6 utensilios"],
    });
    expect(p.safety.en).toEqual([AVISOS_SEGURIDAD[0].en, "Not for outdoor use"]);
    expect(p.safety.es[1]).toBe("Not for outdoor use");
  });

  it("al editar, las advertencias comunes se reconocen y el orden se conserva", async () => {
    const todos = await getProducts();
    const carro = todos.find((p) => p.id === "p14")!;
    const seguridad = datosDesdeProducto(carro).seguridad;
    expect(seguridad.map((a) => avisoComun(a)?.id ?? "propia")).toEqual(["propia", "pilas"]);
    const ids = todos.flatMap((p) => datosDesdeProducto(p).seguridad.map((a) => avisoComun(a)?.id)).filter(Boolean);
    expect(new Set(ids)).toEqual(new Set(["asfixia", "empaque", "pilas", "proyectiles"]));
  });

  it("lo escrito antes sin unidad (como «85» o «C») se conserva hasta que se rellenan los campos", async () => {
    const [base] = await getProducts();
    const viejo = { ...base, specs: { ...base.specs, dimensions: "85", weight: "C", materials: { es: "Tela", en: "Fabric" } } };
    const d = datosDesdeProducto(viejo);
    expect(d.textoLibre).toEqual({ medidas: "85", peso: "C", materiales: { es: "Tela", en: "Fabric" } });
    expect(productoDesdeDatos(d, viejo).specs).toEqual(viejo.specs);

    const cambiado = productoDesdeDatos(
      {
        ...d,
        medidas: { ...d.medidas, largo: "85", ancho: "40" },
        peso: { valor: "2", unidad: "kg" },
        materiales: ["algodon"],
      },
      viejo,
    );
    expect(cambiado.specs).toMatchObject({ dimensions: "85 x 40 cm", weight: "2 kg", materials: { es: "Algodón", en: "Cotton" } });
  });
});

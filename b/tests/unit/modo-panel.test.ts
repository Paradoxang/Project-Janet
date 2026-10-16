import { describe, expect, it } from "vitest";
import { esRutaPanel, scriptModoPanel } from "@/lib/modo-panel";

/** Corre el script de <head> con una ruta y lo que haya guardado el navegador; dice si marcó <html data-panel>. */
function marca(ruta: string, guardado: string | null) {
  const atributos = new Set<string>();
  const document = { documentElement: { setAttribute: (nombre: string) => atributos.add(nombre) } };
  const localStorage = { getItem: (clave: string) => (clave === "cuenta" ? guardado : null) };
  new Function("document", "localStorage", "location", scriptModoPanel())(document, localStorage, { pathname: ruta });
  return atributos.has("data-panel");
}

const sesion = (usuario: unknown) => JSON.stringify({ state: { usuario, cuentas: {} }, version: 1 });
const duena = sesion({ correo: "admin@example.com", nombre: "", rol: "admin" });

describe("panel a pantalla completa", () => {
  it("reconoce las páginas del panel (sin el idioma)", () => {
    expect(esRutaPanel("/panel")).toBe(true);
    expect(esRutaPanel("/panel/")).toBe(true);
    expect(esRutaPanel("/panel/catalogo/")).toBe(true);
    expect(esRutaPanel("/")).toBe(false);
    expect(esRutaPanel("/account/")).toBe(false);
    expect(esRutaPanel("/panelito")).toBe(false);
  });

  it("antes de pintar, recoge la cabecera solo si es administración y está en el panel", () => {
    expect(marca("/es/panel/", duena)).toBe(true);
    expect(marca("/en/panel/catalogo/", duena)).toBe(true);
    expect(marca("/es/", duena)).toBe(false);
    expect(marca("/es/p/magnetic-tiles/", duena)).toBe(false);
    expect(marca("/es/panel/", sesion({ correo: "ana@ejemplo.com", nombre: "Ana", rol: "cliente" }))).toBe(false);
    expect(marca("/es/panel/", sesion(null))).toBe(false);
    expect(marca("/es/panel/", null)).toBe(false);
  });

  it("si lo guardado está roto, no falla y deja la cabecera", () => {
    expect(() => marca("/es/panel/", "{roto")).not.toThrow();
    expect(marca("/es/panel/", "{roto")).toBe(false);
  });
});

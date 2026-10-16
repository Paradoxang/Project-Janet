// Única puerta de entrada a los datos. Hoy leen el JSON de /datos; en el desarrollo real leerán la API
// sin tocar las pantallas (por eso son asíncronas).
import productosJson from "@datos/products.json";
import tiendasJson from "@datos/stores.json";
import panelJson from "@datos/panel.json";
import impuestosJson from "@datos/tax-rates.json";
import { aLigero } from "./catalogo";
import type { Impuestos, Panel, Producto, ProductoLigero, Tienda } from "./tipos";

const productos = productosJson as Producto[];
const tiendas = tiendasJson as Tienda[];
const panel = panelJson as Panel;
const impuestos = impuestosJson as Impuestos;

export { CATEGORIAS, GRUPOS_EDAD, OCASIONES } from "./constantes";

export async function getProducts(): Promise<Producto[]> {
  return productos;
}

export async function getProduct(slug: string): Promise<Producto | undefined> {
  return productos.find((p) => p.slug === slug);
}

export async function getProductsById(ids: string[]): Promise<Producto[]> {
  return ids.map((id) => productos.find((p) => p.id === id)).filter((p): p is Producto => !!p);
}

export async function getStores(): Promise<Tienda[]> {
  return tiendas;
}

export async function getPanel(): Promise<Panel> {
  return panel;
}

export async function getTaxRates(): Promise<Impuestos> {
  return impuestos;
}

/** Catálogo mínimo para el navegador (buscador, carrito). */
export async function getCatalogoLigero(): Promise<ProductoLigero[]> {
  return productos.map(aLigero);
}

// Única puerta de entrada a los datos. Hoy leen el JSON de /datos; en el desarrollo real leerán la API
// sin tocar las pantallas (por eso son asíncronas).
import productosJson from "@datos/products.json";
import tiendasJson from "@datos/stores.json";
import panelJson from "@datos/panel.json";
import impuestosJson from "@datos/tax-rates.json";
import type {
  Categoria,
  GrupoEdad,
  Impuestos,
  Ocasion,
  Panel,
  Producto,
  ProductoLigero,
  Tienda,
} from "./tipos";

const productos = productosJson as Producto[];
const tiendas = tiendasJson as Tienda[];
const panel = panelJson as Panel;
const impuestos = impuestosJson as Impuestos;

export const GRUPOS_EDAD: GrupoEdad[] = ["0-12m", "1-2", "3-4", "5-7", "8+"];
export const CATEGORIAS: Categoria[] = [
  "baby",
  "building",
  "pretend",
  "stem",
  "arts",
  "outdoor",
  "games",
  "plush",
];
export const OCASIONES: Ocasion[] = ["birthday", "holidays", "baby-shower", "just-because", "back-to-school"];

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
  return productos.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    illustration: p.illustration,
    tint: p.tint,
    ageGroup: p.ageGroup,
    category: p.category,
    occasions: p.occasions,
    rating: p.rating,
    reviewCount: p.reviewCount,
    bestSeller: p.bestSeller,
    stockOnline: p.stockOnline,
    deliveryDays: p.deliveryDays,
    keywords: p.keywords,
  }));
}

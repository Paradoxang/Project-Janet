// Productos de ejemplo de la sección saludable (28-10): fotos hechas con IA que llegaron con la propuesta gráfica, en
// public/saludables/<foto>.webp (recortadas a 4:5). Son de muestra: todavía no se compran (el carrito y el pago trabajan
// con los juguetes). Los nombres y los textos solo dicen lo que pone la etiqueta de la foto, sin marcas.

import type { CATEGORIAS_SALUDABLES } from "./secciones";
import type { Idioma, Texto } from "./tipos";

export type CategoriaSaludable = (typeof CATEGORIAS_SALUDABLES)[number];
export type PublicoSaludable = "ninos" | "adultos" | "familia";

export interface ProductoSaludable {
  id: string;
  foto: string;
  titulo: Texto;
  resumen: Texto;
  precio: number;
  categoria: CategoriaSaludable;
  publico: PublicoSaludable;
}

export const SALUDABLES: ProductoSaludable[] = [
  {
    id: "s01",
    foto: "fruit-bar-pineapple",
    titulo: {
      en: "Pineapple Dried Fruit Bar, 30 g",
      es: "Barra de fruta deshidratada de piña, 30 g",
    },
    resumen: {
      en: "A snack-size bar for the lunchbox.",
      es: "Una barra de tamaño merienda para la lonchera.",
    },
    precio: 1.99,
    categoria: "comida",
    publico: "ninos",
  },
  {
    id: "s02",
    foto: "fruit-bar-banana",
    titulo: {
      en: "Banana & Cacao Dried Fruit Bar, 30 g",
      es: "Barra de fruta deshidratada de banano y cacao, 30 g",
    },
    resumen: {
      en: "Banana and cacao in a snack-size bar.",
      es: "Banano y cacao en una barra de tamaño merienda.",
    },
    precio: 1.99,
    categoria: "comida",
    publico: "ninos",
  },
  {
    id: "s03",
    foto: "granola",
    titulo: { en: "Sprouted Honey Hemp Granola", es: "Granola germinada con miel y cáñamo" },
    resumen: {
      en: "Granola with sprouted grains, honey and hemp.",
      es: "Granola con granos germinados, miel y cáñamo.",
    },
    precio: 6.99,
    categoria: "comida",
    publico: "adultos",
  },
  {
    id: "s04",
    foto: "cleansing-gel",
    titulo: {
      en: "Family Cleansing Gel, Hair & Body, 13.5 fl oz",
      es: "Gel limpiador familiar, cabello y cuerpo, 400 ml",
    },
    resumen: {
      en: "Fragrance-free, for the whole family.",
      es: "Sin perfume, para toda la familia.",
    },
    precio: 14.99,
    categoria: "cuidado",
    publico: "familia",
  },
  {
    id: "s05",
    foto: "body-wash",
    titulo: {
      en: "Hyaluronic Body Wash with Glycerin",
      es: "Gel de baño con ácido hialurónico y glicerina",
    },
    resumen: { en: "For all skin types.", es: "Para todo tipo de piel." },
    precio: 9.99,
    categoria: "cuidado",
    publico: "adultos",
  },
  {
    id: "s06",
    foto: "conditioner",
    titulo: {
      en: "Nourishing Conditioner, Vitamin E & Aloe Vera",
      es: "Acondicionador nutritivo, vitamina E y aloe vera",
    },
    resumen: {
      en: "Fragrance-free, for all hair types.",
      es: "Sin perfume, para todo tipo de cabello.",
    },
    precio: 11.49,
    categoria: "cuidado",
    publico: "adultos",
  },
  {
    id: "s07",
    foto: "deodorant",
    titulo: { en: "Aluminum-Free Deodorant, 3 oz", es: "Desodorante sin aluminio, 85 g" },
    resumen: { en: "Goes on clear.", es: "Se aplica transparente." },
    precio: 9.49,
    categoria: "cuidado",
    publico: "adultos",
  },
];

export const fotoSaludable = (p: ProductoSaludable) => `/saludables/${p.foto}.webp`;

export const saludablesDe = (categoria: CategoriaSaludable) =>
  SALUDABLES.filter((p) => p.categoria === categoria);

export const tituloSaludable = (p: ProductoSaludable, locale: string) => p.titulo[locale as Idioma];

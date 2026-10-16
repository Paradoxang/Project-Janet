import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { FichaBase } from "@/components/producto/ficha-producto";
import { getCatalogoLigero, getProduct, getProducts, getStores } from "@/lib/data";
import type { Idioma } from "@/lib/tipos";

export async function generateStaticParams() {
  const productos = await getProducts();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return { title: p.title[locale as Idioma], description: p.summary[locale as Idioma] };
}

export default async function PaginaProducto({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await getProduct(slug);
  if (!p) notFound();
  const tiendas = await getStores();
  const catalogo = await getCatalogoLigero();
  const relacionados = p.related
    .map((id) => catalogo.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);
  // La ficha aplica en el navegador los cambios que haya hecho la dueña (precio, fotos, oculto…).
  return <FichaBase p={p} tiendas={tiendas} relacionados={relacionados} />;
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FichaNueva } from "@/components/producto/ficha-producto";
import { getStores } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "producto" });
  return { title: t("nuevo") };
}

/** Ficha de los productos que crea la dueña (viven en su navegador, así que no tienen página propia). */
export default async function ProductoNuevo({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FichaNueva tiendas={await getStores()} />;
}

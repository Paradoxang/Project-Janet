import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaginaCarrito } from "@/components/carrito/pagina-carrito";
import { getTaxRates } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "carrito" });
  return { title: t("titulo") };
}

export default async function Carrito({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PaginaCarrito impuestos={await getTaxRates()} />;
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaginaDeseos } from "@/components/cuenta/pagina-deseos";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deseos" });
  return { title: t("titulo") };
}

export default async function ListaDeseos({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PaginaDeseos />;
}

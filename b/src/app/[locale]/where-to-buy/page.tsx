import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaginaDonde } from "@/components/donde/pagina-donde";
import { getStores } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "donde" });
  return { title: t("titulo") };
}

export default async function DondeComprar({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tiendas = await getStores();
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PaginaDonde tiendas={tiendas} />
    </Suspense>
  );
}

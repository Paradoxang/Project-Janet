import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResultadosBusqueda } from "@/components/busqueda/resultados";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "busqueda" });
  return { title: t("tituloVacio") };
}

export default async function PaginaBusqueda({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="mx-auto min-h-[50vh] max-w-7xl px-4 pt-5 md:px-6" />}>
      <ResultadosBusqueda />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Confirmacion } from "@/components/pago/confirmacion";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pago" });
  return { title: t("confirmacionTitulo") };
}

export default async function PaginaPedido({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Confirmacion />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Checkout } from "@/components/pago/checkout";
import { getTaxRates } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pago" });
  return { title: t("titulo") };
}

export default async function PaginaPago({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Checkout impuestos={await getTaxRates()} />;
}

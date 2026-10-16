import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaginaCatalogo } from "@/components/panel/pagina-catalogo";
import { SoloAdmin } from "@/components/panel/solo-admin";
import { getProducts } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gestion" });
  return { title: t("titulo") };
}

export default async function Catalogo({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <SoloAdmin>
      <PaginaCatalogo base={await getProducts()} />
    </SoloAdmin>
  );
}

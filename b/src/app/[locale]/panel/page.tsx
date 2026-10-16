import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaginaPanel } from "@/components/panel/pagina-panel";
import { SoloAdmin } from "@/components/panel/solo-admin";
import { getPanel, getStores } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "panel" });
  return { title: t("titulo") };
}

export default async function Panel({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <SoloAdmin>
      <PaginaPanel panel={await getPanel()} tiendas={await getStores()} />
    </SoloAdmin>
  );
}

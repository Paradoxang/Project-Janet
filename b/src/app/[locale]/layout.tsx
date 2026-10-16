import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito-sans";
import { Cabecera } from "@/components/cabecera/cabecera";
import { PanelCarrito } from "@/components/carrito/panel-carrito";
import { ObservadorRevelar } from "@/components/efectos/observador-revelar";
import { FranjaDemo } from "@/components/franja-demo";
import { Pie } from "@/components/pie";
import { ProveedorCatalogo } from "@/components/proveedor-catalogo";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { getCatalogoLigero } from "@/lib/data";
import { ICONOS, MARCA_INICIAL, scriptMarca } from "@/marca/script-marca";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("titulo"), template: `%s · ${t("titulo")}` },
    description: t("descripcion"),
    robots: { index: false, follow: false },
    icons: { icon: ICONOS[MARCA_INICIAL] },
  };
}

export default async function LayoutIdioma({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const catalogo = await getCatalogoLigero();

  return (
    <html lang={locale} data-marca={MARCA_INICIAL} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptMarca() }} />
      </head>
      <body id="arriba">
        <NextIntlClientProvider>
          <ProveedorCatalogo productos={catalogo}>
            <FranjaDemo />
            <Cabecera />
            <main className="min-h-[60vh]">{children}</main>
            <Pie />
            <PanelCarrito />
            <ObservadorRevelar />
            <Toaster position="top-center" />
          </ProveedorCatalogo>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

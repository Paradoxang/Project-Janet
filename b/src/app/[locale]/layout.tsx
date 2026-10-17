import type { Metadata } from "next";
import { Gabarito, Hanken_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito-sans";
import { Cabecera } from "@/components/cabecera/cabecera";
import { CabeceraFlotante } from "@/components/cabecera/cabecera-flotante";
import { PanelCarrito } from "@/components/carrito/panel-carrito";
import { ObservadorRevelar } from "@/components/efectos/observador-revelar";
import { RegistroVisitas } from "@/components/efectos/registro-actividad";
import { FranjaDemo } from "@/components/franja-demo";
import { ModoPanel } from "@/components/panel/modo-panel";
import { Pie } from "@/components/pie";
import { ProveedorCatalogo } from "@/components/proveedor-catalogo";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { getCatalogoLigero } from "@/lib/data";
import { scriptModoPanel } from "@/lib/modo-panel";
import { ICONOS, MARCA_INICIAL, scriptMarca } from "@/marca/script-marca";

// Letra de la versión neutra (OFL, servida desde la propia web por next/font). Brinco usa la suya (ver /b/marca).
const gabarito = Gabarito({ subsets: ["latin", "latin-ext"], variable: "--font-gabarito", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-hanken", display: "swap" });

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
    <html
      lang={locale}
      data-marca={MARCA_INICIAL}
      className={`${gabarito.variable} ${hanken.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptMarca() }} />
        <script dangerouslySetInnerHTML={{ __html: scriptModoPanel() }} />
      </head>
      <body id="arriba">
        <NextIntlClientProvider>
          <ProveedorCatalogo productos={catalogo}>
            <FranjaDemo />
            <CabeceraFlotante>
              <Cabecera />
            </CabeceraFlotante>
            <main className="min-h-[60vh]">{children}</main>
            <Pie />
            <PanelCarrito />
            <ObservadorRevelar />
            <RegistroVisitas />
            <ModoPanel />
            <Toaster position="top-center" />
          </ProveedorCatalogo>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

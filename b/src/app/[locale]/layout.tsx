import type { Metadata } from "next";
import { Cinzel_Decorative, Quicksand } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito-sans";
import { Cabecera, CabeceraPago } from "@/components/cabecera/cabecera";
import { CabeceraFlotante } from "@/components/cabecera/cabecera-flotante";
import { PanelCarrito } from "@/components/carrito/panel-carrito";
import { ObservadorRevelar } from "@/components/efectos/observador-revelar";
import { RegistroVisitas } from "@/components/efectos/registro-actividad";
import { FranjaDemo } from "@/components/franja-demo";
import { MarcoTienda } from "@/components/navegacion/marco-tienda";
import { ModoPanel } from "@/components/panel/modo-panel";
import { Pie } from "@/components/pie";
import { ProveedorCatalogo } from "@/components/proveedor-catalogo";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { getCatalogoLigero } from "@/lib/data";
import { scriptModoPanel } from "@/lib/modo-panel";
import { ICONOS, MARCA_INICIAL, scriptMarca } from "@/marca/script-marca";
import { scriptVariante } from "@/marca/script-variante";

// Letras del canon del rediseño (OFL, servidas desde la propia web por next/font): Cinzel Decorative para los títulos
// «mágicos» (opcional, clase font-magia), Fredoka para la interfaz y los títulos (ya viene de @fontsource) y Quicksand
// para el texto.
const cinzel = Cinzel_Decorative({
  weight: ["700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-cinzel",
  display: "swap",
});
const quicksand = Quicksand({
  subsets: ["latin", "latin-ext"],
  variable: "--font-quicksand",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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
      data-variante="color"
      className={`${cinzel.variable} ${quicksand.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptMarca() }} />
        <script dangerouslySetInnerHTML={{ __html: scriptVariante() }} />
        <script dangerouslySetInnerHTML={{ __html: scriptModoPanel() }} />
      </head>
      <body id="arriba">
        <NextIntlClientProvider>
          <ProveedorCatalogo productos={catalogo}>
            <FranjaDemo />
            <MarcoTienda
              cabecera={
                <CabeceraFlotante>
                  <Cabecera />
                </CabeceraFlotante>
              }
              cabeceraPago={<CabeceraPago />}
              pie={<Pie />}
            >
              {children}
            </MarcoTienda>
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

import type { Metadata } from "next";
import { Cinzel, Cinzel_Decorative, Cormorant_Garamond, Spectral } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

// Letras del rediseño (OFL, servidas desde la propia web por next/font). Santiago, 26-10: todas de remate afilado, como
// la del título. Cinzel Decorative para los títulos «mágicos» (clase font-magia); Cinzel, su hermana, para botones,
// píldoras y cejillas (font-grabado); Cormorant Garamond para nombres, precios y títulos de tarjeta (font-display), y
// Spectral para el texto.
const cinzel = Cinzel_Decorative({
  weight: ["700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-cinzel",
  display: "swap",
});
const cinzelGrabado = Cinzel({
  subsets: ["latin", "latin-ext"],
  variable: "--font-cinzel-ui",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-cormorant",
  display: "swap",
});
const spectral = Spectral({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-spectral",
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
      className={`${cinzel.variable} ${cinzelGrabado.variable} ${cormorant.variable} ${spectral.variable}`}
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
              pie={<Pie juguetes={catalogo.length} />}
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

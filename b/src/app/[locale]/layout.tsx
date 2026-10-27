import type { Metadata } from "next";
import { Nunito } from "next/font/google";
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

// La letra de la tienda (OFL, servida desde la propia web por next/font). Revisión del 27-10: la de la propuesta gráfica, Nunito (la
// redondeada), en todo: títulos, botones, cejillas y texto. Es variable: un solo archivo da del 200 al 1000.
const nunito = Nunito({
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
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
      className={nunito.variable}
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

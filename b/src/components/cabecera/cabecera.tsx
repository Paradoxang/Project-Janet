import { useTranslations } from "next-intl";
import { Lock, MapPin, ShoppingBag } from "lucide-react";
import { PestanasSeccion } from "@/components/navegacion/pestanas-seccion";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/marca/marca";
import { Buscador } from "./buscador";
import { EnlaceCuenta } from "./enlace-cuenta";
import { EnlaceDeseos } from "./enlace-deseos";
import { IconoCarrito } from "./icono-carrito";
import { MenuMovil } from "./menu-movil";
import { SelectorIdioma } from "./selector-idioma";

/**
 * Cabecera del rediseño (26-10): papel crema, el buscador grande en el centro (tendrá muchos productos: lo primero es
 * buscar) y, desde 1024 px, las dos secciones. En el celular, hamburguesa y el buscador en su propia
 * fila. Las categorías ya no van aquí: están en la barra lateral.
 */
export function Cabecera() {
  const t = useTranslations();
  return (
    <header
      className="cabecera-tienda border-line bg-papel/95 border-b backdrop-blur-sm"
      data-testid="cabecera"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-2 gap-y-2 px-3 py-2.5 md:flex-nowrap md:gap-x-4 md:px-6">
        <MenuMovil />
        {/* El nombre del enlace empieza por lo que se ve (el logo o su marcador) y añade adónde lleva. */}
        <Link href="/" className="shrink-0 rounded-md">
          <Logo className="h-8 md:h-9" />
          <span className="sr-only">{t("cabecera.irAlInicio")}</span>
        </Link>
        <PestanasSeccion className="hidden lg:block" />
        <div className="order-last w-full md:order-none md:flex-1">
          <Buscador />
        </div>
        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <Link
            href="/where-to-buy"
            aria-label={t("nav.dondeComprar")}
            title={t("nav.dondeComprar")}
            className="text-ink hover:bg-surface hidden size-11 place-items-center rounded-lg sm:grid"
          >
            <MapPin aria-hidden="true" className="size-6" />
          </Link>
          <SelectorIdioma />
          <EnlaceCuenta />
          <EnlaceDeseos />
          <IconoCarrito />
        </div>
      </div>
    </header>
  );
}

/** La cabecera del pago: sin buscador ni menús, como en las tiendas que convierten bien. Solo el logo y volver. */
export function CabeceraPago() {
  const t = useTranslations();
  return (
    <header className="border-line bg-papel border-b" data-testid="cabecera-pago">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0 rounded-md">
          <Logo className="h-8 md:h-9" />
          <span className="sr-only">{t("cabecera.irAlInicio")}</span>
        </Link>
        <p className="font-display flex items-center gap-1.5 text-[15px] font-semibold">
          <Lock aria-hidden="true" className="text-stock size-4" />
          {t("pago.seguro")}
        </p>
        <Link
          href="/cart"
          className="text-link inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-[14px] font-bold hover:underline"
        >
          <ShoppingBag aria-hidden="true" className="size-5" />
          <span className="hidden sm:inline">{t("pago.volverCarrito")}</span>
          <span className="sr-only sm:hidden">{t("pago.volverCarrito")}</span>
        </Link>
      </div>
    </header>
  );
}

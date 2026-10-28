import { useTranslations } from "next-intl";
import { IconoBolsa, IconoCandado, IconoPin } from "@/components/cuento/iconos";
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
 * Cabecera del rediseño (26-10): azul noche, como el cielo del canon, que se funde con el hero. El menú (con todas las
 * categorías), el logo, el buscador grande en el centro (tendrá muchos productos: lo primero es buscar) y los iconos en
 * crema. En el celular, el buscador va en su propia fila. Desde 1024 px, las secciones van en una segunda fila
 * centrada (revisión del 28-10: en la primera no cabían más); en el celular, en el cajón del menú.
 */
export function Cabecera() {
  const t = useTranslations();
  return (
    <header className="cabecera-tienda noche border-crema/10 border-b" data-testid="cabecera">
      <div className="envoltura flex flex-wrap items-center gap-x-2 gap-y-2 py-3 md:flex-nowrap md:gap-x-4">
        <MenuMovil />
        {/* El nombre del enlace empieza por lo que se ve (el logo o su marcador) y añade adónde lleva. */}
        <Link href="/" className="shrink-0 rounded-md">
          <Logo negativo className="h-8 md:h-9" />
          <span className="sr-only">{t("cabecera.irAlInicio")}</span>
        </Link>
        <div className="order-last w-full md:order-none md:flex-1">
          <Buscador />
        </div>
        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link
            href="/where-to-buy"
            aria-label={t("nav.dondeComprar")}
            title={t("nav.dondeComprar")}
            className="chip-icono hidden sm:grid"
          >
            <IconoPin className="size-5" />
          </Link>
          {/* En el celular el idioma va en el cajón del menú: así la cabecera cabe en dos filas. */}
          <span className="hidden sm:block">
            <SelectorIdioma oscuro />
          </span>
          <EnlaceCuenta />
          <EnlaceDeseos />
          <IconoCarrito />
        </div>
      </div>
      <div className="border-crema/10 hidden border-t lg:block">
        <div className="envoltura flex justify-center py-2">
          <PestanasSeccion className="max-w-full" />
        </div>
      </div>
    </header>
  );
}

/** La cabecera del pago: sin buscador ni menús, como en las tiendas que convierten bien. Solo el logo y volver. */
export function CabeceraPago() {
  const t = useTranslations();
  return (
    <header className="noche border-crema/10 border-b" data-testid="cabecera-pago">
      <div className="envoltura flex items-center justify-between gap-3 py-3.5">
        <Link href="/" className="shrink-0 rounded-md">
          <Logo negativo className="h-8 md:h-9" />
          <span className="sr-only">{t("cabecera.irAlInicio")}</span>
        </Link>
        <p className="font-display text-crema flex items-center gap-2 text-[15px] font-semibold">
          <IconoCandado className="text-calendula size-4" />
          {t("pago.seguro")}
        </p>
        <Link
          href="/cart"
          className="text-crema inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-[14px] font-bold underline-offset-4 hover:underline"
        >
          <IconoBolsa className="size-5" />
          <span className="hidden sm:inline">{t("pago.volverCarrito")}</span>
          <span className="sr-only sm:hidden">{t("pago.volverCarrito")}</span>
        </Link>
      </div>
    </header>
  );
}

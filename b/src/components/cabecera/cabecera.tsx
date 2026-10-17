import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TINTA_EDAD } from "@/lib/constantes";
import { CATEGORIAS, GRUPOS_EDAD, OCASIONES } from "@/lib/data";
import { Logo } from "@/marca/marca";
import { Buscador } from "./buscador";
import { EnlaceCuenta } from "./enlace-cuenta";
import { IconoCarrito } from "./icono-carrito";
import { MenuMovil } from "./menu-movil";
import { SelectorIdioma } from "./selector-idioma";
import { SelectorZip } from "./selector-zip";

export function Cabecera() {
  const t = useTranslations();
  return (
    <header className="cabecera-tienda border-b bg-white" data-testid="cabecera">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-2 px-3 pt-2 pb-2 md:flex-nowrap md:gap-x-4 md:px-6">
        <MenuMovil edades={GRUPOS_EDAD} categorias={CATEGORIAS} ocasiones={OCASIONES} />
        {/* El nombre del enlace empieza por lo que se ve (el logo o su marcador) y añade adónde lleva. */}
        <Link href="/" className="shrink-0 rounded-md">
          <Logo className="h-8 md:h-9" />
          <span className="sr-only">{t("cabecera.irAlInicio")}</span>
        </Link>
        <SelectorZip className="hidden max-w-[150px] lg:flex" />
        <div className="order-last w-full md:order-none md:flex-1">
          <Buscador />
        </div>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <SelectorIdioma />
          <EnlaceCuenta />
          <IconoCarrito />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-2 md:px-6 lg:hidden">
        <SelectorZip />
      </div>
      <nav aria-label={t("nav.edad")} className="mx-auto max-w-7xl">
        {/* Cada edad lleva su punto de color: el mismo tono la acompaña por toda la tienda. */}
        <ul className="relative flex gap-1.5 overflow-x-auto px-3 pb-2.5 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
          <li className="shrink-0">
            <Link
              href="/search"
              className="inline-flex h-9 items-center rounded-chip px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-ink hover:bg-surface"
            >
              {t("nav.todos")}
            </Link>
          </li>
          {GRUPOS_EDAD.map((e) => (
            <li key={e} className="shrink-0">
              <Link
                href={{ pathname: "/search", query: { edad: e } }}
                className="inline-flex h-9 items-center gap-2 rounded-chip px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-ink hover:bg-surface"
              >
                <span aria-hidden="true" className={`size-2.5 rounded-full ${TINTA_EDAD[e].punto}`} />
                {t(`edadCorta.${e}`)}
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <Link
              href="/where-to-buy"
              className="inline-flex h-9 items-center gap-1.5 rounded-chip px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-ink hover:bg-surface"
            >
              <MapPin aria-hidden="true" className="size-4 text-muted-ink" />
              {t("nav.dondeComprar")}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

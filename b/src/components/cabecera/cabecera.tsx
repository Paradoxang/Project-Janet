import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FONDO_EDAD } from "@/lib/constantes";
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
        <Link href="/" aria-label={t("cabecera.irAlInicio")} className="shrink-0 rounded-md">
          <Logo className="h-8 md:h-9" />
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
        <ul className="relative flex gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
          <li className="shrink-0">
            <Link
              href="/search"
              className="inline-flex h-8 items-center rounded-chip border bg-white px-3 text-[13px] font-bold whitespace-nowrap hover:bg-surface"
            >
              {t("nav.todos")}
            </Link>
          </li>
          {GRUPOS_EDAD.map((e) => (
            <li key={e} className="shrink-0">
              <Link
                href={{ pathname: "/search", query: { edad: e } }}
                className={`inline-flex h-8 items-center rounded-chip px-3 text-[13px] font-bold whitespace-nowrap text-ink hover:brightness-95 ${FONDO_EDAD[e]}`}
              >
                {t(`edadCorta.${e}`)}
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <Link
              href="/where-to-buy"
              className="inline-flex h-8 items-center rounded-chip border bg-white px-3 text-[13px] font-bold whitespace-nowrap hover:bg-surface"
            >
              {t("nav.dondeComprar")}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

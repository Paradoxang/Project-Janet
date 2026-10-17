"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { TINTA_EDAD } from "@/lib/constantes";
import type { GrupoEdad } from "@/lib/tipos";

/**
 * Las fichas de edad del menú de la cabecera. En la portada no salen, porque ahí ya están los bloques de «Regalos por
 * edad» (review de usuario, 16-10; Santiago: «quitarla solo en portada»). En el resto de páginas, sí.
 */
export function FichasEdadCabecera({ edades }: { edades: GrupoEdad[] }) {
  const t = useTranslations();
  const ruta = usePathname();
  if (ruta === "/") return null;
  return edades.map((e) => (
    <li key={e} className="shrink-0" data-testid="ficha-edad-cabecera">
      <Link
        href={{ pathname: "/search", query: { edad: e } }}
        className="inline-flex h-9 items-center gap-2 rounded-chip px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-ink hover:bg-surface"
      >
        {/* Cada edad lleva su punto de color: el mismo tono la acompaña por toda la tienda. */}
        <span aria-hidden="true" className={`size-2.5 rounded-full ${TINTA_EDAD[e].punto}`} />
        {t(`edadCorta.${e}`)}
      </Link>
    </li>
  ));
}

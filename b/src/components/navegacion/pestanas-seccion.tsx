"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { SECCIONES, seccionDeRuta } from "@/lib/secciones";
import { cn } from "@/lib/utils";

/**
 * Las pestañas de las secciones (juguetes y saludables; salen de lib/secciones.ts). Píldoras sobre azul noche: la
 * activa, en mandarina. Si son muchas, la fila se desliza de lado en vez de partirse.
 */
export function PestanasSeccion({
  className,
  alNavegar,
}: {
  className?: string;
  alNavegar?: () => void;
}) {
  const t = useTranslations("nav");
  const activa = seccionDeRuta(usePathname());
  return (
    <nav aria-label={t("secciones")} className={className}>
      <ul className="rounded-chip bg-crema/10 flex max-w-full items-center gap-1 overflow-x-auto p-1">
        {SECCIONES.map(({ id: s, ruta, punto }) => (
          <li key={s} className="shrink-0">
            <Link
              href={ruta}
              aria-current={activa === s ? "page" : undefined}
              onClick={alNavegar}
              data-testid={`pestana-${s}`}
              className={cn(
                "rounded-chip font-grabado flex h-9 items-center gap-2 px-4 text-[14px] font-bold whitespace-nowrap",
                activa === s ? "bg-mandarina text-noche" : "text-crema hover:bg-crema/10",
              )}
            >
              <span aria-hidden="true" className={cn("size-2 rounded-full", punto)} />
              {t(s)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

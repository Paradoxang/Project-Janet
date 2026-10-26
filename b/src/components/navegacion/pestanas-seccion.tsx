"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { RUTA_SALUDABLE, seccionDeRuta, type Seccion } from "@/lib/secciones";
import { cn } from "@/lib/utils";

const DESTINO: Record<Seccion, string> = { juguetes: "/", saludable: RUTA_SALUDABLE };
const PUNTO: Record<Seccion, string> = { juguetes: "bg-calendula", saludable: "bg-aqua" };

/**
 * Las dos pestañas de arriba: juguetes y saludables (propuesta, abierta con la clienta). Píldoras sobre azul noche:
 * la activa, en mandarina.
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
      <ul className="rounded-chip bg-crema/10 flex items-center gap-1 p-1">
        {(["juguetes", "saludable"] as const).map((s) => (
          <li key={s}>
            <Link
              href={DESTINO[s]}
              aria-current={activa === s ? "page" : undefined}
              onClick={alNavegar}
              data-testid={`pestana-${s}`}
              className={cn(
                "rounded-chip font-display flex h-9 items-center gap-2 px-4 text-[14px] font-semibold whitespace-nowrap",
                activa === s ? "bg-mandarina text-noche" : "text-crema hover:bg-crema/10",
              )}
            >
              <span aria-hidden="true" className={cn("size-2 rounded-full", PUNTO[s])} />
              {t(s)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

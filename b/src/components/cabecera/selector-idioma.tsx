"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Cambia inglés/español sin salir de la página (conserva la búsqueda y la posición). `oscuro`: sobre la barra del panel. */
export function SelectorIdioma({ oscuro = false }: { oscuro?: boolean }) {
  const t = useTranslations("cabecera");
  const locale = useLocale();
  const otro = locale === "es" ? "en" : "es";
  const pathname = usePathname();
  const router = useRouter();
  return (
    <a
      href={`/${otro}${pathname === "/" ? "/" : pathname}`}
      lang={otro}
      hrefLang={otro}
      data-testid="selector-idioma"
      aria-label={t("otroIdioma")}
      onClick={(e) => {
        e.preventDefault();
        const query = Object.fromEntries(new URLSearchParams(window.location.search));
        router.replace({ pathname, query }, { locale: otro, scroll: false });
      }}
      className={cn(
        "grid place-items-center rounded-md border-2 px-1.5 text-xs font-extrabold",
        oscuro ? "h-8 min-w-8 border-white/70 text-white hover:bg-white/10" : "h-9 min-w-9 border-ink text-ink hover:bg-surface",
      )}
    >
      {t("otroIdiomaCorto")}
    </a>
  );
}

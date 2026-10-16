"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

/** Cambia inglés/español sin salir de la página (conserva la búsqueda y la posición). */
export function SelectorIdioma() {
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
      className="grid h-9 min-w-9 place-items-center rounded-md border-2 border-ink px-1.5 text-xs font-extrabold text-ink hover:bg-surface"
    >
      {t("otroIdiomaCorto")}
    </a>
  );
}

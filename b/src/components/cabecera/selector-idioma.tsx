"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Cambia inglés/español sin salir de la página (conserva la búsqueda y la posición). `oscuro`: sobre la barra del panel.
 * `pie`: la versión del pie, con el nombre del idioma entero, como el de Amazon (review de usuario, 16-10).
 */
export function SelectorIdioma({ oscuro = false, pie = false }: { oscuro?: boolean; pie?: boolean }) {
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
      data-testid={pie ? "selector-idioma-pie" : "selector-idioma"}
      aria-label={pie ? undefined : `${t("otroIdiomaCorto")} · ${t("otroIdioma")}`}
      onClick={(e) => {
        e.preventDefault();
        const query = Object.fromEntries(new URLSearchParams(window.location.search));
        router.replace({ pathname, query }, { locale: otro, scroll: false });
      }}
      className={cn(
        pie
          ? "inline-flex h-10 items-center gap-2 justify-self-start rounded-md border border-white/40 px-3 text-sm font-bold text-white hover:bg-white/10"
          : "grid place-items-center rounded-md border-2 px-1.5 text-xs font-extrabold",
        !pie && (oscuro ? "h-8 min-w-8 border-white/70 text-white hover:bg-white/10" : "h-9 min-w-9 border-ink text-ink hover:bg-surface"),
      )}
    >
      {pie ? <Globe className="size-4" aria-hidden="true" /> : null}
      {pie ? t("otroIdioma") : t("otroIdiomaCorto")}
    </a>
  );
}

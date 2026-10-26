"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Cambia inglés/español sin salir de la página (conserva la búsqueda y la posición). `oscuro`: sobre la barra del panel.
 * `pie`: la versión del pie, con el nombre del idioma entero, como el de Amazon (review de usuario, 16-10).
 */
export function SelectorIdioma({
  oscuro = false,
  pie = false,
}: {
  oscuro?: boolean;
  pie?: boolean;
}) {
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
        // Rediseño del 26-10: en el pie, una píldora de contorno; en la cabecera azul noche, el chip redondo del canon.
        pie
          ? "font-display text-crema hover:bg-crema/10 inline-flex h-10 items-center gap-2 justify-self-start rounded-full px-4 text-[14px] font-semibold shadow-[inset_0_0_0_1px_currentColor]"
          : oscuro
            ? "chip-icono font-display text-[13px] font-semibold tracking-[0.06em]"
            : "border-ink font-display text-ink hover:bg-surface grid h-9 min-w-9 place-items-center rounded-full border-2 px-1.5 text-xs font-semibold",
      )}
    >
      {pie ? <span aria-hidden="true">✦</span> : null}
      {pie ? t("otroIdioma") : t("otroIdiomaCorto")}
    </a>
  );
}

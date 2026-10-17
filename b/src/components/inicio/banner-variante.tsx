import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * Portada de la variante colorida (propuesta P3 de la review de usuario, 16-10): un banner azul con una foto de niños
 * jugando, hecha con IA y marcada como tal. Solo se ve con la variante «color»; la portada blanca sigue siendo la de
 * siempre. Es el único h1 que se ve en esa variante.
 */
export function BannerVariante() {
  const t = useTranslations("inicio");
  return (
    <div
      className="solo-variante-color overflow-hidden rounded-card bg-[var(--m-variante-banner)] text-[var(--m-variante-banner-ink)] md:grid md:grid-cols-[1.05fr_1fr]"
      data-testid="banner-variante"
    >
      <div className="flex flex-col items-start justify-center gap-3 p-5 md:gap-4 md:p-10">
        <h1 id="portada-color" className="text-[30px] leading-[1.05] md:text-[50px]">
          {t("varianteTitulo")}
        </h1>
        <p className="max-w-md text-[15px] leading-snug text-white/90 md:text-[18px]">{t("heroTexto")}</p>
        <Link
          href="/search"
          className="mt-1 inline-flex h-11 items-center gap-2 rounded-btn bg-[var(--m-variante-acento)] px-5 text-[15px] font-bold text-[var(--m-variante-acento-ink)] shadow-[0_3px_0_0_rgb(0_0_0/0.25)] hover:brightness-105 active:translate-y-[3px] active:shadow-none"
        >
          {t("varianteBoton")}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <figure className="relative min-h-[210px] md:min-h-[340px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/variante/portada.webp"
          alt={t("varianteFotoAlt")}
          className="absolute inset-0 h-full w-full object-cover"
          data-testid="foto-ia"
        />
        <figcaption className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white">
          {t("imagenIA")}
        </figcaption>
      </figure>
    </div>
  );
}

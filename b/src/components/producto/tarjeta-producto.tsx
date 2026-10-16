import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Idioma, ProductoLigero } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { BotonAgregar } from "./boton-agregar";
import { Estrellas } from "./estrellas";
import { ImagenProducto } from "./imagen-producto";
import { Precio } from "./precio";

export function TarjetaProducto({ p, className }: { p: ProductoLigero; className?: string }) {
  const t = useTranslations("producto");
  const locale = useLocale() as Idioma;
  return (
    <article
      className={cn("relative flex h-full flex-col overflow-hidden rounded-card border bg-white", className)}
      data-testid="tarjeta-producto"
    >
      <Link href={`/p/${p.slug}`} className="relative block" tabIndex={-1} aria-hidden="true">
        <ImagenProducto
          illustration={p.illustration}
          tint={p.tint}
          alt=""
          etiqueta={t("imagenIlustrativa")}
        />
        {p.bestSeller ? (
          <span className="absolute top-2 left-2 rounded-chip bg-ink px-2 py-0.5 text-[10.5px] font-bold text-white">
            {t("masVendido")}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link
          href={`/p/${p.slug}`}
          className="line-clamp-2 text-[13.5px] leading-snug font-semibold text-ink hover:text-link hover:underline"
        >
          {p.title[locale]}
        </Link>
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-ink">
          <Estrellas valor={p.rating} className="text-[13px]" />
          <span>{p.rating.toFixed(1)}</span>
          <span>({p.reviewCount.toLocaleString("en-US")})</span>
        </div>
        <Precio usd={p.price} className="mt-1 text-xl" />
        <div className="mt-auto pt-2">
          <BotonAgregar id={p.id} compacto deshabilitado={p.stockOnline === 0} />
        </div>
      </div>
    </article>
  );
}

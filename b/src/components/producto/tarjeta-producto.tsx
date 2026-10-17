import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { esNuevo, rutaProducto, srcProducto } from "@/lib/catalogo";
import { TINTA_EDAD } from "@/lib/constantes";
import type { Idioma, ProductoLigero } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { BotonAgregar } from "./boton-agregar";
import { CapaHolo } from "./capa-holo";
import { Estrellas } from "./estrellas";
import { ImagenProducto } from "./imagen-producto";
import { Precio } from "./precio";

/**
 * Tarjeta de producto: sin caja ni sombra. El juguete va en su fondo de color, redondeado, y debajo el título, las
 * estrellas, el precio y «Add to cart». La edad va en la foto, en la tinta de su edad.
 */
export function TarjetaProducto({
  p,
  className,
  puesto,
}: {
  p: ProductoLigero;
  className?: string;
  /** Puesto en un ranking (1, 2, 3…): se dibuja grande sobre la foto. */
  puesto?: number;
}) {
  const t = useTranslations("producto");
  const te = useTranslations("edadCorta");
  const locale = useLocale() as Idioma;
  const ruta = rutaProducto(p);
  return (
    <article className={cn("group relative flex h-full flex-col", className)} data-testid="tarjeta-producto">
      <Link
        href={ruta}
        className="relative block overflow-hidden rounded-card transition-transform duration-200 group-hover:-translate-y-0.5"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ImagenProducto
          illustration={p.illustration}
          imagen={p.imagen}
          tint={p.tint}
          alt=""
          etiqueta={p.imagen ? undefined : t("imagenIlustrativa")}
          claseImagen="menear-al-pasar"
          capa={<CapaHolo src={srcProducto(p)} preset={puesto === 1 ? "bursts" : "stars"} />}
        />
        {puesto ? (
          <span
            aria-hidden="true"
            className="absolute top-1.5 left-2.5 font-display text-[50px] leading-none font-black text-white [-webkit-text-stroke:2px_var(--m-ink)] [paint-order:stroke_fill]"
          >
            {puesto}
          </span>
        ) : esNuevo(p.id) ? (
          <span className="absolute top-2.5 left-2.5 rounded-chip bg-stock px-2.5 py-0.5 text-[11px] font-bold text-white">
            {t("nuevo")}
          </span>
        ) : p.bestSeller ? (
          <span className="absolute top-2.5 left-2.5 rounded-chip bg-ink px-2.5 py-0.5 text-[11px] font-bold text-white">
            {t("masVendido")}
          </span>
        ) : null}
        <span
          className={`absolute top-2.5 right-2.5 rounded-chip bg-white/90 px-2 py-0.5 text-[11px] font-bold ${TINTA_EDAD[p.ageGroup].texto}`}
        >
          {te(p.ageGroup)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-2.5">
        <Link
          href={ruta}
          className="line-clamp-2 text-[14px] leading-snug font-semibold text-ink hover:text-link hover:underline"
        >
          {p.title[locale]}
        </Link>
        {p.reviewCount > 0 ? (
          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-ink">
            <Estrellas valor={p.rating} className="text-[13px]" />
            <span>{p.rating.toFixed(1)}</span>
            <span>({p.reviewCount.toLocaleString("en-US")})</span>
          </div>
        ) : (
          <p className="text-xs text-muted-ink">{t("sinResenas")}</p>
        )}
        <Precio usd={p.price} className="mt-0.5 text-[22px]" />
        <div className="mt-auto pt-2.5">
          <BotonAgregar id={p.id} compacto deshabilitado={p.stockOnline === 0} />
        </div>
      </div>
    </article>
  );
}

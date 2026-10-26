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
    <article
      className={cn("group relative flex h-full flex-col", className)}
      data-testid="tarjeta-producto"
    >
      <Link
        href={ruta}
        className="rounded-card relative block overflow-hidden shadow-[0_10px_26px_rgb(22_24_58/0.1)] transition-transform duration-300 ease-[var(--ease-cuento)] group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
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
            className="font-display absolute top-1.5 left-2.5 text-[50px] leading-none font-black text-white [-webkit-text-stroke:2px_var(--m-ink)] [paint-order:stroke_fill]"
          >
            {puesto}
          </span>
        ) : esNuevo(p.id) ? (
          <span className="rounded-chip bg-stock absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[11px] font-bold text-white">
            {t("nuevo")}
          </span>
        ) : p.bestSeller ? (
          <span className="rounded-chip bg-noche text-crema absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[11px] font-bold">
            {t("masVendido")}
          </span>
        ) : null}
        <span
          className={`rounded-chip absolute top-2.5 right-2.5 bg-white/90 px-2 py-0.5 text-[11px] font-bold ${TINTA_EDAD[p.ageGroup].texto}`}
        >
          {te(p.ageGroup)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-2.5">
        <Link
          href={ruta}
          className="font-display text-ink hover:text-link line-clamp-2 text-[15px] leading-snug font-medium hover:underline"
        >
          {p.title[locale]}
        </Link>
        {p.reviewCount > 0 ? (
          <div className="text-muted-ink flex flex-wrap items-center gap-1 text-xs">
            <Estrellas valor={p.rating} className="text-[13px]" />
            <span>{p.rating.toFixed(1)}</span>
            <span>({p.reviewCount.toLocaleString("en-US")})</span>
          </div>
        ) : (
          <p className="text-muted-ink text-xs">{t("sinResenas")}</p>
        )}
        <Precio usd={p.price} className="mt-0.5 text-[22px]" />
        <div className="mt-auto pt-2.5">
          <BotonAgregar id={p.id} compacto deshabilitado={p.stockOnline === 0} />
        </div>
      </div>
    </article>
  );
}

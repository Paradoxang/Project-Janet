import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { esNuevo, rutaProducto, srcProducto } from "@/lib/catalogo";
import type { Idioma, ProductoLigero } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { BotonAgregar } from "./boton-agregar";
import { CapaHolo } from "./capa-holo";
import { Estrellas } from "./estrellas";
import { ImagenProducto } from "./imagen-producto";
import { Precio } from "./precio";

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
  const locale = useLocale() as Idioma;
  const ruta = rutaProducto(p);
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card bg-white shadow-tarjeta transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_-12px_rgb(42_37_32/0.35)]",
        className,
      )}
      data-testid="tarjeta-producto"
    >
      <Link href={ruta} className="relative block" tabIndex={-1} aria-hidden="true">
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
            className="absolute top-1 left-2 font-sans text-[52px] leading-none font-black text-white [-webkit-text-stroke:2px_var(--m-ink)] [paint-order:stroke_fill]"
          >
            {puesto}
          </span>
        ) : esNuevo(p.id) ? (
          <span className="absolute top-2 left-2 rounded-chip bg-stock px-2 py-0.5 text-[10.5px] font-bold text-white">
            {t("nuevo")}
          </span>
        ) : p.bestSeller ? (
          <span className="absolute top-2 left-2 rounded-chip bg-ink px-2 py-0.5 text-[10.5px] font-bold text-white">
            {t("masVendido")}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <Link
          href={ruta}
          className="line-clamp-2 text-[13.5px] leading-snug font-semibold text-ink hover:text-link hover:underline"
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
        <Precio usd={p.price} className="mt-1 text-xl" />
        <div className="mt-auto pt-2">
          <BotonAgregar id={p.id} compacto deshabilitado={p.stockOnline === 0} />
        </div>
      </div>
    </article>
  );
}

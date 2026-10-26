import { useLocale, useTranslations } from "next-intl";
import { BotonAgregar } from "@/components/producto/boton-agregar";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Precio } from "@/components/producto/precio";
import { Link } from "@/i18n/navigation";
import { esNuevo, rutaProducto, srcProducto } from "@/lib/catalogo";
import { fotoIA } from "@/lib/fotos-ia";
import type { Idioma, ProductoLigero } from "@/lib/tipos";
import { cn } from "@/lib/utils";

/**
 * La tarjeta del canon, con un juguete en vez de un libro: portada de 12 px sobre el color de su edad, que se adelanta en
 * el estante y deja «asomar» un velo azul noche al pasar; debajo, título en Fredoka, la edad en cursiva, la categoría en
 * su chapita y el precio en caléndula. Va sobre azul noche.
 */
export function TarjetaCuento({
  p,
  prioridad = false,
}: {
  p: ProductoLigero;
  prioridad?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale() as Idioma;
  const ruta = rutaProducto(p);
  const foto = p.imagen ?? fotoIA(p.illustration);
  return (
    <article
      className="tarjeta-cuento relative flex h-full flex-col"
      data-testid="tarjeta-producto"
    >
      <Link
        href={ruta}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          "portada relative block aspect-[4/5] overflow-hidden rounded-[12px] shadow-[0_14px_34px_rgb(0_0_0/0.34)]",
          FONDO_TINTE[p.tint],
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto ?? srcProducto(p)}
          alt=""
          loading={prioridad ? "eager" : "lazy"}
          className={foto ? "h-full w-full object-cover" : "h-full w-full object-contain p-8"}
        />
        {esNuevo(p.id) ? (
          <span className="rounded-chip bg-stock absolute top-3 left-3 px-2.5 py-0.5 text-[11px] font-bold text-white">
            {t("producto.nuevo")}
          </span>
        ) : p.bestSeller ? (
          <span className="rounded-chip bg-noche text-crema absolute top-3 left-3 px-2.5 py-0.5 text-[11px] font-bold">
            {t("producto.masVendido")}
          </span>
        ) : null}
        {foto && !p.imagen ? (
          <span className="absolute bottom-2.5 left-2.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {t("inicio.imagenIACorta")}
          </span>
        ) : null}
        <span className="asomar bg-noche/70 text-crema absolute inset-0 flex flex-col justify-end gap-1 p-5">
          <span className="cejilla text-calendula">{t(`categoria.${p.category}`)}</span>
          <span className="font-display inline-flex items-center gap-1.5 text-[16px] font-semibold">
            {t("producto.verJuguete")}{" "}
            <span aria-hidden="true" className="size-4">
              →
            </span>
          </span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <h3 className="font-display text-crema line-clamp-2 text-[18px] leading-snug font-semibold">
          <Link href={ruta} className="underline-offset-4 hover:underline">
            {p.title[locale]}
          </Link>
        </h3>
        <p className="text-crema/75 text-[14px] italic">
          {t(`edad.${p.ageGroup}`)}
          {p.reviewCount > 0
            ? ` · ★ ${p.rating.toFixed(1)} (${p.reviewCount.toLocaleString("en-US")})`
            : ""}
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="rounded-chip border-crema/25 text-crema/85 border px-2.5 py-0.5 text-[12px]">
            {t(`categoria.${p.category}`)}
          </span>
          <Precio usd={p.price} className="text-calendula text-[26px]" />
        </div>
        <div className="mt-auto pt-3">
          <BotonAgregar id={p.id} compacto deshabilitado={p.stockOnline === 0} />
        </div>
      </div>
    </article>
  );
}

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { BotonAgregar } from "@/components/producto/boton-agregar";
import { Estrellas } from "@/components/producto/estrellas";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Precio } from "@/components/producto/precio";
import { Link } from "@/i18n/navigation";
import type { Idioma, Producto } from "@/lib/tipos";

/** Un juguete destacado con sus razones, para romper la cuadrícula. */
export function JugueteSemana({ p }: { p: Producto }) {
  const t = useTranslations();
  const locale = useLocale() as Idioma;
  // Las viñetas empiezan con una idea corta antes de los dos puntos: esa idea es la razón.
  const razones = p.bullets[locale].slice(0, 3).map((b) => b.split(":")[0]);
  return (
    <section
      data-revelar
      aria-labelledby="semana"
      className="grid overflow-hidden rounded-card bg-white shadow-tarjeta md:grid-cols-2"
    >
      <Link
        href={`/p/${p.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className={`textura-puntos relative grid min-h-[260px] place-items-center p-6 ${FONDO_TINTE[p.tint]}`}
      >
        <span className="absolute top-4 left-4 rounded-chip bg-ink px-3 py-1 text-[11.5px] font-extrabold tracking-wide text-white uppercase">
          {t("inicio.semana")}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/productos/${p.illustration}.svg`}
          alt=""
          className="flotar w-[74%] max-w-[320px]"
          style={{ "--giro": "-3deg" } as React.CSSProperties}
        />
        <span className="absolute bottom-2 left-3 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-muted-ink">
          {t("producto.imagenIlustrativa")}
        </span>
      </Link>
      <div className="grid content-center gap-3 p-5 md:p-8">
        <h2 id="semana" className="text-[24px] leading-tight md:text-[30px]">
          <Link href={`/p/${p.slug}`} className="hover:underline">
            {p.title[locale]}
          </Link>
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-muted-ink">
          <Estrellas valor={p.rating} className="text-[15px]" />
          <span className="font-bold text-ink">{p.rating.toFixed(1)}</span>({p.reviewCount.toLocaleString("en-US")})
        </p>
        <p className="mt-1 text-xs font-extrabold tracking-wide text-muted-ink uppercase">{t("inicio.semanaPor")}</p>
        <ul className="grid gap-1.5 text-[15px]">
          {razones.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-stock" aria-hidden="true" />
              {r}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <Precio usd={p.price} className="text-[32px]" />
          <div className="w-44">
            <BotonAgregar id={p.id} />
          </div>
        </div>
        <Link href={`/p/${p.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-link hover:underline">
          {t("inicio.semanaCta")} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

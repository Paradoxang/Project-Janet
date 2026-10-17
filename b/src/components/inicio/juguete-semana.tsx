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
    <section data-revelar aria-labelledby="semana" className="grid items-center gap-5 md:grid-cols-2 md:gap-12">
      <Link
        href={`/p/${p.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative grid min-h-[280px] place-items-center overflow-hidden rounded-card p-6 md:min-h-[420px] ${FONDO_TINTE[p.tint]}`}
      >
        <span className="absolute top-4 left-4 rounded-chip bg-white px-3 py-1 text-[13px] font-bold text-ink">
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
      <div className="grid content-center gap-3 md:pr-8">
        <h2 id="semana" className="text-[26px] leading-tight md:text-[40px] md:leading-[1.05]">
          <Link href={`/p/${p.slug}`} className="hover:underline">
            {p.title[locale]}
          </Link>
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-muted-ink">
          <Estrellas valor={p.rating} className="text-[15px]" />
          <span className="font-bold text-ink">{p.rating.toFixed(1)}</span>({p.reviewCount.toLocaleString("en-US")})
        </p>
        <p className="mt-2 text-[15px] font-bold">{t("inicio.semanaPor")}</p>
        <ul className="grid gap-1.5 text-[15px]">
          {razones.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-stock" aria-hidden="true" />
              {r}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap items-center gap-5">
          <Precio usd={p.price} className="text-[36px]" />
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

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconoHoja } from "@/components/cuento/iconos";
import { Cielo } from "@/components/cuento/cielo";
import { BotonAgregar } from "@/components/producto/boton-agregar";
import { TituloCuento } from "@/components/cuento/titulo-cuento";
import { Link } from "@/i18n/navigation";
import { precio } from "@/lib/formato";
import { fotoSaludable, saludablesDe, tituloSaludable } from "@/lib/saludables";
import { CATEGORIAS_SALUDABLES, PUBLICOS_SALUDABLES } from "@/lib/secciones";
import type { Idioma } from "@/lib/tipos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("saludable") };
}

/**
 * La sección saludable, con el canon (rediseño del 26-10): el mismo cielo y las mismas piezas que la juguetería, con el
 * aqua como acento. Desde el 28-10 enseña siete productos de muestra (lib/saludables.ts, fotos con IA de la propuesta
 * gráfica) que se compran como los juguetes: mismo botón, mismo carrito y mismo pago. La categoría sin productos sigue
 * con portadas marcador («Tu producto aquí»).
 */
export default async function PaginaSaludable({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("saludable");
  const tp = await getTranslations("producto");
  return (
    <>
      <section aria-labelledby="saludable-titulo" className="noche relative overflow-hidden">
        <Cielo />
        <div className="envoltura relative py-16 md:py-24">
          <p className="cejilla text-aqua flex items-center gap-2">
            <span aria-hidden="true" className="chispa bg-aqua text-[10px]" />
            {t("cejilla")}
          </p>
          <h1 id="saludable-titulo" className="titulo-cuento text-crema mt-4 max-w-3xl">
            {t("titulo")}
          </h1>
          <p className="text-crema/80 mt-5 max-w-2xl text-[17px] leading-relaxed">{t("texto")}</p>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {PUBLICOS_SALUDABLES.map((p) => (
              <li key={p}>
                <a href={`#${p}`} className="pildora">
                  {t(`publico.${p}`)}
                </a>
              </li>
            ))}
            {CATEGORIAS_SALUDABLES.map((c) => (
              <li key={c}>
                <a href={`#${c}`} className="pildora">
                  {t(`categoria.${c}`)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="papel-pintado">
        {CATEGORIAS_SALUDABLES.map((c, i) => (
          <section
            key={c}
            id={c}
            aria-labelledby={`saludable-${c}`}
            className="scroll-mt-28"
            data-revelar
          >
            <div className="envoltura pt-16 md:pt-24">
              <TituloCuento
                id={`saludable-${c}`}
                cejilla={`0${i + 1} · ${saludablesDe(c).length > 0 ? t("ejemplos", { n: saludablesDe(c).length }) : t("proximamente")}`}
              >
                {t(`categoria.${c}`)}
              </TituloCuento>
              {saludablesDe(c).length > 0 ? (
                <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-[30px] lg:grid-cols-4">
                  {saludablesDe(c).map((p) => (
                    <li
                      key={p.id}
                      id={p.id}
                      className="flex scroll-mt-28 flex-col gap-2"
                      data-testid="producto-saludable"
                    >
                      <span className="shadow-tarjeta relative block aspect-[4/5] overflow-hidden rounded-[12px] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fotoSaludable(p)}
                          alt={tituloSaludable(p, locale)}
                          width={800}
                          height={1000}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                        <span className="text-muted-ink absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] leading-tight font-bold">
                          {tp("imagenIlustrativaIA")}
                        </span>
                      </span>
                      <span className="text-aqua-tinta text-[12px] font-extrabold tracking-[0.08em] uppercase">
                        {t(`publico.${p.publico}`)}
                      </span>
                      <span className="font-display -mt-1 text-[17px] leading-snug font-extrabold text-balance">
                        {tituloSaludable(p, locale)}
                      </span>
                      <span className="text-muted-ink text-[14px]">
                        {p.resumen[locale as Idioma]}
                      </span>
                      <span className="font-display mt-auto pt-1 text-[19px] font-black">
                        {precio(p.precio, locale)}
                      </span>
                      <BotonAgregar id={p.id} compacto />
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-[30px] lg:grid-cols-4">
                  {Array.from({ length: 4 }, (_, n) => (
                    <li key={n} className="grid gap-3">
                      <span
                        aria-hidden="true"
                        className={`border-aqua-tinta/35 grid aspect-[4/5] place-items-center rounded-[12px] border-2 border-dashed ${n % 2 === i % 2 ? "bg-white/80" : "bg-tint-cielo"}`}
                      >
                        <IconoHoja className="text-aqua-tinta/60 size-10" />
                      </span>
                      <span className="font-display text-[17px] font-semibold">{t("tarjeta")}</span>
                      <span className="text-muted-ink -mt-2 text-[14px] italic">
                        {t("tarjetaTexto")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        {/* Anclas para «Para niños» y «Para adultos»: llevan a la nota de que los productos son de muestra. */}
        <div className="envoltura seccion">
          <section
            aria-labelledby="saludable-vacio"
            className="noche relative grid gap-4 overflow-hidden rounded-[18px] p-8 md:p-12"
          >
            <Cielo />
            <span id="ninos" className="scroll-mt-28" />
            <span id="adultos" className="scroll-mt-28" />
            <h2
              id="saludable-vacio"
              className="font-display text-crema relative text-[26px] font-bold md:text-[32px]"
            >
              {t("vacioTitulo")}
            </h2>
            <p className="text-crema/80 relative max-w-2xl text-[17px] leading-relaxed">
              {t("vacioTexto")}
            </p>
            <Link href="/search" className="placa relative mt-2 justify-self-start">
              {t("volverJuguetes")}{" "}
              <span aria-hidden="true" className="size-4">
                →
              </span>
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}

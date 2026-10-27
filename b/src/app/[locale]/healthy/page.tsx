import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconoHoja } from "@/components/cuento/iconos";
import { Cielo } from "@/components/cuento/cielo";
import { TituloCuento } from "@/components/cuento/titulo-cuento";
import { Link } from "@/i18n/navigation";
import { CATEGORIAS_SALUDABLES, PUBLICOS_SALUDABLES } from "@/lib/secciones";

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
 * aqua como acento. Hoy no hay productos saludables en el catálogo de ejemplo, así que cada categoría enseña portadas
 * marcador («Tu producto aquí»), igual que el logo neutro. Es una propuesta: la separación sigue abierta con la clienta.
 */
export default async function PaginaSaludable({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("saludable");
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
              <TituloCuento id={`saludable-${c}`} cejilla={`0${i + 1} · ${t("proximamente")}`}>
                {t(`categoria.${c}`)}
              </TituloCuento>
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
            </div>
          </section>
        ))}

        {/* Anclas para «Para niños» y «Para adultos»: hoy llevan a la misma nota, porque aún no hay productos. */}
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

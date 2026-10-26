import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Leaf } from "lucide-react";
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
 * La sección saludable (rediseño del 26-10). Hoy no hay productos saludables en el catálogo de ejemplo: la página
 * enseña cómo se separa de los juguetes (su color aqua, su barra lateral y sus categorías) con marcadores honestos, igual
 * que el logo neutro. Es una propuesta: la separación sigue abierta con la clienta.
 */
export default async function PaginaSaludable({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("saludable");
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-4 pb-6 md:gap-16 md:px-6 md:pt-6">
      <section
        aria-labelledby="saludable-titulo"
        className="bg-tint-cielo relative overflow-hidden rounded-[28px] p-6 md:p-12"
      >
        <span aria-hidden="true" className="chispa absolute top-8 right-10 text-[18px]" />
        <span
          aria-hidden="true"
          className="chispa absolute right-[22%] bottom-10 hidden text-[11px] md:block"
        />
        <p className="cejilla text-aqua-tinta">{t("cejilla")}</p>
        <h1
          id="saludable-titulo"
          className="font-magia mt-3 max-w-3xl text-[30px] leading-[1.14] font-bold md:text-[50px]"
        >
          {t("titulo")}
        </h1>
        <p className="text-ink/85 mt-4 max-w-2xl text-[16px] leading-relaxed md:text-[17.5px]">
          {t("texto")}
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {PUBLICOS_SALUDABLES.map((p) => (
            <li key={p}>
              <a
                href={`#${p}`}
                className="rounded-chip font-display hover:bg-aqua hover:text-noche inline-flex h-10 items-center bg-white px-4 text-[14px] font-semibold"
              >
                {t(`publico.${p}`)}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {CATEGORIAS_SALUDABLES.map((c, i) => (
        <section key={c} id={c} aria-labelledby={`saludable-${c}`} className="scroll-mt-28">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id={`saludable-${c}`}
              className="font-magia text-[24px] leading-tight font-bold md:text-[32px]"
            >
              {t(`categoria.${c}`)}
            </h2>
            <span className="rounded-chip border-aqua-tinta/30 text-aqua-tinta border bg-white px-3 py-1 text-[12px] font-bold">
              {t("proximamente")}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, n) => (
              <li
                key={n}
                className={`rounded-card border-aqua-tinta/30 grid aspect-[5/4] content-end gap-1 border-2 border-dashed p-4 ${n % 2 === i % 2 ? "bg-white/70" : "bg-tint-menta/60"}`}
              >
                <Leaf aria-hidden="true" className="text-aqua-tinta/60 mb-auto size-7" />
                <span className="font-display text-[15px] font-semibold">{t("tarjeta")}</span>
                <span className="text-muted-ink text-[13px]">{t("tarjetaTexto")}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Anclas para «Para niños» y «Para adultos»: hoy llevan a la misma nota, porque aún no hay productos. */}
      <section
        aria-labelledby="saludable-vacio"
        className="noche rounded-card grid gap-3 p-6 md:p-10"
      >
        <span id="ninos" className="scroll-mt-28" />
        <span id="adultos" className="scroll-mt-28" />
        <h2 id="saludable-vacio" className="font-display text-[24px] font-semibold md:text-[30px]">
          {t("vacioTitulo")}
        </h2>
        <p className="text-crema/80 max-w-2xl">{t("vacioTexto")}</p>
        <Link href="/search" className="placa mt-2 justify-self-start">
          {t("volverJuguetes")} <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    </div>
  );
}

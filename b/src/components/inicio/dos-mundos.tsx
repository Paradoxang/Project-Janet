import { useTranslations } from "next-intl";
import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RUTA_SALUDABLE } from "@/lib/secciones";

/** Tres juguetes en abanico, como cartas sobre la mesa: se enderezan al pasar (el estante 3D del canon, en pequeño). */
const ABANICO = [
  { foto: "magnetic-tiles", giro: "-9deg", x: "0%" },
  { foto: "plush-dragon", giro: "2deg", x: "26%" },
  { foto: "rocket-launcher", giro: "11deg", x: "52%" },
];

/**
 * «Una tienda, dos mundos» (rediseño del 26-10): los juguetes y lo saludable, cada uno con su apartado. Es una propuesta y
 * sigue abierta con la clienta; aquí se ve cómo quedaría.
 */
export function DosMundos() {
  const t = useTranslations("mundos");
  return (
    <section aria-labelledby="dos-mundos" data-revelar>
      <p className="cejilla text-mandarina-tinta mb-2">{t("cejilla")}</p>
      <h2
        id="dos-mundos"
        className="font-magia text-[26px] leading-[1.15] font-bold md:text-[38px]"
      >
        {t("titulo")}
      </h2>
      <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-5">
        <Link
          href="/search"
          className="noche group rounded-card relative grid min-h-[300px] overflow-hidden p-6 md:min-h-[360px] md:p-8"
          data-testid="mundo-juguetes"
        >
          <div className="relative z-10 grid max-w-[15rem] content-start gap-2">
            <p className="cejilla text-calendula">{t("juguetesCejilla")}</p>
            <p className="font-display text-[30px] leading-none font-semibold md:text-[36px]">
              {t("juguetes")}
            </p>
            <p className="text-crema/80 text-[15px] leading-snug">{t("juguetesTexto")}</p>
            <span className="font-display text-calendula mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold tracking-[0.12em] uppercase">
              {t("juguetesBoton")}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </span>
          </div>
          <div
            aria-hidden="true"
            className="absolute right-[-4%] bottom-[-6%] h-[62%] w-[66%] [perspective:900px]"
          >
            {ABANICO.map((a) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={a.foto}
                src={`/productos-ia/${a.foto}.webp`}
                alt=""
                loading="lazy"
                className="ring-crema/90 absolute bottom-0 aspect-[3/4] w-[46%] [transform:rotate(var(--giro))] rounded-[14px] object-cover shadow-[0_14px_34px_rgb(0_0_0/0.4)] ring-4 transition-transform duration-500 ease-[var(--ease-cuento)] group-hover:[transform:rotate(0deg)_translateY(-10px)] motion-reduce:transition-none"
                style={{ left: a.x, "--giro": a.giro } as React.CSSProperties}
              />
            ))}
          </div>
          <span className="rounded-chip absolute top-3 right-3 bg-black/60 px-2 py-0.5 text-[10.5px] font-bold text-white">
            {t("ia")}
          </span>
        </Link>

        <Link
          href={RUTA_SALUDABLE}
          className="group rounded-card bg-tint-cielo shadow-tarjeta relative grid min-h-[300px] overflow-hidden p-6 md:min-h-[360px] md:p-8"
          data-testid="mundo-saludable"
        >
          <div className="relative z-10 grid max-w-[16rem] content-start gap-2">
            <p className="cejilla text-aqua-tinta">{t("saludableCejilla")}</p>
            <p className="font-display text-[30px] leading-none font-semibold md:text-[36px]">
              {t("saludable")}
            </p>
            <p className="text-ink/80 text-[15px] leading-snug">{t("saludableTexto")}</p>
            <span className="font-display text-aqua-tinta mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold tracking-[0.12em] uppercase">
              {t("saludableBoton")}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </span>
          </div>
          <div
            aria-hidden="true"
            className="absolute right-5 bottom-5 grid grid-cols-2 gap-2.5 md:right-8 md:bottom-8"
          >
            {["bg-white", "bg-tint-menta", "bg-tint-limon", "bg-white"].map((fondo, i) => (
              <span
                key={i}
                className={`border-aqua-tinta/40 grid size-[68px] place-items-center rounded-[16px] border-2 border-dashed md:size-[84px] ${fondo}`}
              >
                <Leaf className="text-aqua-tinta/70 size-6" />
              </span>
            ))}
          </div>
        </Link>
      </div>
    </section>
  );
}

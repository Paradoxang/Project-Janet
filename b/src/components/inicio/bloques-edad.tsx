import { useTranslations } from "next-intl";
import { FONDO_EDAD, TINTA_EDAD } from "@/lib/constantes";
import { Link } from "@/i18n/navigation";
import type { GrupoEdad, ProductoLigero } from "@/lib/tipos";

const NUMERO: Record<GrupoEdad, { n: string; unidad: "meses" | "anios" }> = {
  "0-12m": { n: "0–12", unidad: "meses" },
  "1-2": { n: "1–2", unidad: "anios" },
  "3-4": { n: "3–4", unidad: "anios" },
  "5-7": { n: "5–7", unidad: "anios" },
  "8+": { n: "8+", unidad: "anios" },
};

/** Nombre del archivo de la foto de cada edad en la variante colorida (public/variante/). */
const ARCHIVO: Record<GrupoEdad, string> = { "0-12m": "0-12m", "1-2": "1-2", "3-4": "3-4", "5-7": "5-7", "8+": "8" };

/** Las edades como bloques de juguete: su color, el número grande en su tinta y un juguete asomando. */
export function BloquesEdad({ catalogo, edades }: { catalogo: ProductoLigero[]; edades: GrupoEdad[] }) {
  const t = useTranslations();
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3 lg:grid-cols-5">
      {edades.map((edad, i) => {
        const delGrupo = catalogo.filter((p) => p.ageGroup === edad);
        const rep = delGrupo.find((p) => p.bestSeller) ?? delGrupo[0];
        return (
          <li key={edad} className={i === 4 ? "col-span-2 sm:col-span-1" : undefined}>
            <Link
              href={{ pathname: "/search", query: { edad } }}
              data-testid={`edad-${edad}`}
              className={`group relative flex h-full min-h-[118px] flex-col justify-between overflow-hidden rounded-card p-3.5 shadow-[inset_0_-5px_0_0_rgb(0_0_0/0.06)] transition-transform duration-200 hover:-translate-y-1 md:min-h-[188px] md:p-5 ${FONDO_EDAD[edad]}`}
            >
              <span
                className={`font-display text-[40px] leading-none font-black tracking-tight md:text-[60px] ${TINTA_EDAD[edad].texto}`}
              >
                {NUMERO[edad].n}
              </span>
              <span className="relative z-10 max-w-[58%] text-[13.5px] leading-tight font-bold text-ink md:text-[15px]">
                {t(`inicio.${NUMERO[edad].unidad}`)}
                <span className="block font-medium text-ink/70">{t("inicio.productos", { n: delGrupo.length })}</span>
              </span>
              {rep ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/productos/${rep.illustration}.svg`}
                  alt=""
                  className="solo-variante-base menear-al-pasar absolute -right-2 -bottom-3 z-0 size-[92px] rotate-6 md:-right-3 md:-bottom-4 md:size-[132px]"
                />
              ) : null}
              {/* Variante colorida: un niño de esa edad jugando, en foto hecha con IA y marcada como tal. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/variante/edad-${ARCHIVO[edad]}.webp`}
                alt=""
                loading="lazy"
                className="solo-variante-color absolute inset-y-0 right-0 z-0 h-full w-[54%] object-cover object-[70%_50%] [mask-image:linear-gradient(to_right,transparent,#000_38%)]"
              />
              <span className="solo-variante-color absolute right-1.5 bottom-1.5 z-10 rounded bg-black/70 px-1 py-px text-[10px] font-bold text-white">
                {t("inicio.imagenIACorta")}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

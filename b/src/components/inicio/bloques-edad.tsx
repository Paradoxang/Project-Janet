import { useTranslations } from "next-intl";
import { FONDO_EDAD } from "@/lib/constantes";
import { Link } from "@/i18n/navigation";
import type { GrupoEdad, ProductoLigero } from "@/lib/tipos";

const NUMERO: Record<GrupoEdad, { n: string; unidad: "meses" | "anios" }> = {
  "0-12m": { n: "0–12", unidad: "meses" },
  "1-2": { n: "1–2", unidad: "anios" },
  "3-4": { n: "3–4", unidad: "anios" },
  "5-7": { n: "5–7", unidad: "anios" },
  "8+": { n: "8+", unidad: "anios" },
};

/** Las edades como bloques de juguete: número grande, sombra de bloque y un juguete asomando. */
export function BloquesEdad({ catalogo, edades }: { catalogo: ProductoLigero[]; edades: GrupoEdad[] }) {
  const t = useTranslations();
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {edades.map((edad, i) => {
        const delGrupo = catalogo.filter((p) => p.ageGroup === edad);
        const rep = delGrupo.find((p) => p.bestSeller) ?? delGrupo[0];
        return (
          <li key={edad} className={i === 4 ? "col-span-2 sm:col-span-1" : undefined}>
            <Link
              href={{ pathname: "/search", query: { edad } }}
              data-testid={`edad-${edad}`}
              aria-label={`${t(`edad.${edad}`)} · ${t("inicio.productos", { n: delGrupo.length })}`}
              className={`group relative flex h-full min-h-[136px] flex-col justify-between overflow-hidden rounded-card p-4 shadow-[4px_4px_0_0_rgb(42_37_32/0.14)] transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 ${FONDO_EDAD[edad]}`}
            >
              <span className="font-sans text-[40px] leading-none font-black tracking-tight text-ink">
                {NUMERO[edad].n}
              </span>
              <span className="relative z-10 max-w-[58%] text-[13px] leading-tight font-bold text-muted-ink">
                {t(`inicio.${NUMERO[edad].unidad}`)}
                <span className="block font-semibold">{t("inicio.productos", { n: delGrupo.length })}</span>
              </span>
              {rep ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/productos/${rep.illustration}.svg`}
                  alt=""
                  className="menear-al-pasar absolute -right-3 -bottom-3 z-0 size-[92px] rotate-6"
                />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

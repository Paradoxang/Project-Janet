import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Ocasion, ProductoLigero } from "@/lib/tipos";

const DIBUJO: Record<Ocasion, string> = {
  birthday: "rc-car",
  holidays: "train-set",
  "baby-shower": "teddy-bear",
  "just-because": "tea-set",
  "back-to-school": "art-set",
};
const FONDO: Record<Ocasion, string> = {
  birthday: "bg-tint-durazno",
  holidays: "bg-tint-menta",
  "baby-shower": "bg-tint-cielo",
  "just-because": "bg-tint-lila",
  "back-to-school": "bg-tint-limon",
};

/** Las ocasiones con nombre propio: así habla una juguetería, no un catálogo. */
export function Momentos({ catalogo, ocasiones }: { catalogo: ProductoLigero[]; ocasiones: Ocasion[] }) {
  const t = useTranslations();
  return (
    <ul className="relative -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:px-0 [&::-webkit-scrollbar]:hidden">
      {ocasiones.map((o) => {
        const n = catalogo.filter((p) => p.occasions.includes(o)).length;
        return (
          <li key={o} className="w-[56vw] max-w-[240px] shrink-0 snap-start md:w-auto md:max-w-none">
            <Link
              href={{ pathname: "/search", query: { ocasion: o } }}
              className={`group flex h-full flex-col overflow-hidden rounded-card transition-transform duration-200 hover:-translate-y-1 ${FONDO[o]}`}
            >
              <span className="grid aspect-[4/3] place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/productos/${DIBUJO[o]}.svg`} alt="" className="menear-al-pasar h-[80%]" loading="lazy" />
              </span>
              <span className="px-4 pb-4">
                <span className="block font-display text-[18px] leading-tight">{t(`inicio.momentos.${o}`)}</span>
                <span className="text-[13px] text-muted-ink">
                  {t(`ocasion.${o}`)} · {t("inicio.productos", { n })}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PorVariante } from "@/components/por-variante";
import { claseIlustracion, FotoIA } from "@/components/producto/foto-ia";
import { enLaTiendaBlanca } from "@/lib/fotos-ia";
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
        const deLaOcasion = catalogo.filter((p) => p.occasions.includes(o));
        const n = deLaOcasion.length;
        const nBlanca = deLaOcasion.filter(enLaTiendaBlanca).length;
        return (
          <li key={o} className="w-[56vw] max-w-[240px] shrink-0 snap-start md:w-auto md:max-w-none">
            <Link href={{ pathname: "/search", query: { ocasion: o } }} className="group flex h-full flex-col gap-2.5">
              <span
                className={`relative grid aspect-[4/3] place-items-center overflow-hidden rounded-card transition-transform duration-200 group-hover:-translate-y-1 ${FONDO[o]}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/productos/${DIBUJO[o]}.svg`}
                  alt=""
                  className={`menear-al-pasar h-[78%] ${claseIlustracion(DIBUJO[o]) ?? ""}`}
                  loading="lazy"
                />
                {/* Con foto con IA, la variante colorida enseña la foto (ver components/producto/foto-ia.tsx). */}
                <FotoIA illustration={DIBUJO[o]} />
              </span>
              <span className="px-0.5">
                <span className="block font-display text-[19px] leading-tight group-hover:underline">
                  {t(`inicio.momentos.${o}`)}
                </span>
                <span className="text-[13px] text-muted-ink">
                  {t(`ocasion.${o}`)} ·{" "}
                  <PorVariante blanca={t("inicio.productos", { n: nBlanca })} color={t("inicio.productos", { n })} />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

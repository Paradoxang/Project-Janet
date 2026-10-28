import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORIAS } from "@/lib/constantes";
import { fotoIA } from "@/lib/fotos-ia";
import { fotoSaludable, SALUDABLES } from "@/lib/saludables";
import { RUTA_SALUDABLE } from "@/lib/secciones";
import type { ProductoLigero, Tinte } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const FONDO: Record<Tinte, string> = {
  cielo: "bg-tint-cielo",
  menta: "bg-tint-menta",
  lila: "bg-tint-lila",
  durazno: "bg-tint-durazno",
  limon: "bg-tint-limon",
};

const FOTO =
  "absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100";
const CHAPITA =
  "bg-crema text-ink absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-col items-start rounded-[12px] px-3 py-2 leading-tight shadow-[0_8px_20px_rgb(22_24_58/0.22)]";

/**
 * «Compra por categoría» (28-10, en lugar de la línea de «cómo comprar»): un mosaico con las categorías de juguetes y el
 * rincón saludable. Cada baldosa lleva la foto con IA de su juguete más vendido, sobre el tinte de ese juguete, y el
 * nombre en una chapita crema que se lee sobre cualquier foto. La categoría con más juguetes va en grande. Si mañana hay
 * más categorías o secciones, el mosaico sigue llenándose en filas de cuatro.
 */
export function MosaicoCategorias({ catalogo }: { catalogo: ProductoLigero[] }) {
  const t = useTranslations();
  const baldosas = CATEGORIAS.map((c) => {
    const suyos = catalogo.filter((p) => p.category === c);
    const portada = [...suyos]
      .sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || b.rating - a.rating)
      .find((p) => fotoIA(p.illustration));
    return { c, n: suyos.length, portada };
  })
    .filter((b) => b.n > 0)
    .sort((a, b) => b.n - a.n);
  const saludable = SALUDABLES.find((p) => p.foto === "cleansing-gel") ?? SALUDABLES[0];
  return (
    <>
      <ul
        className="grid grid-cols-2 gap-3 md:gap-4 lg:auto-rows-[210px] lg:grid-cols-4"
        data-testid="mosaico-categorias"
      >
        {baldosas.map((b, i) => (
          <li
            key={b.c}
            className={
              i === 0
                ? "col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto"
                : "aspect-square lg:aspect-auto"
            }
          >
            <Link
              href={{ pathname: "/search", query: { categoria: b.c } }}
              className={cn(
                "group relative block h-full overflow-hidden rounded-[18px]",
                b.portada ? FONDO[b.portada.tint] : "bg-crema",
              )}
              data-testid={`categoria-${b.c}`}
            >
              {b.portada ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoIA(b.portada.illustration) ?? ""}
                  alt=""
                  loading="lazy"
                  className={FOTO}
                />
              ) : null}
              <span className={CHAPITA}>
                <span
                  className={cn(
                    "font-display font-extrabold",
                    i === 0 ? "text-[18px]" : "text-[15px]",
                  )}
                >
                  {t(`categoria.${b.c}`)}
                </span>
                <span className="text-muted-ink text-[13px]">
                  {t("categorias.juguetes", { n: b.n })}
                </span>
              </span>
            </Link>
          </li>
        ))}
        <li className="aspect-square lg:aspect-auto">
          <Link
            href={RUTA_SALUDABLE}
            className="group bg-tint-cielo relative block h-full overflow-hidden rounded-[18px]"
            data-testid="categoria-saludable"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fotoSaludable(saludable)} alt="" loading="lazy" className={FOTO} />
            <span className={CHAPITA}>
              <span className="font-display text-aqua-tinta flex items-center gap-1.5 text-[15px] font-extrabold">
                <span aria-hidden="true" className="bg-aqua size-2 rounded-full" />
                {t("categorias.saludable")}
              </span>
              <span className="text-muted-ink text-[13px]">{t("categorias.saludableTexto")}</span>
            </span>
          </Link>
        </li>
      </ul>
      <p className="text-muted-ink mt-3 text-right text-[12px]">{t("categorias.fotos")}</p>
    </>
  );
}

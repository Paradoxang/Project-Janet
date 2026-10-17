import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { FilaCatalogo } from "@/components/producto/fila-productos";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { FranjaConfianza } from "@/components/inicio/franja-confianza";
import { JugueteSemana } from "@/components/inicio/juguete-semana";
import { Momentos } from "@/components/inicio/momentos";
import { Novedades } from "@/components/inicio/novedades";
import { Portada } from "@/components/inicio/portada";
import { PromoTiendas } from "@/components/inicio/promo-tiendas";
import { Link } from "@/i18n/navigation";
import { CATEGORIAS, GRUPOS_EDAD, OCASIONES, getCatalogoLigero, getProduct } from "@/lib/data";

function Titulo({
  id,
  children,
  texto,
  verTodo,
}: {
  id: string;
  children: React.ReactNode;
  texto?: string;
  verTodo?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
      <div>
        <h2 id={id} className="text-[25px] leading-tight md:text-[34px]">
          {children}
        </h2>
        {texto ? <p className="mt-1 text-[15px] text-muted-ink md:text-base">{texto}</p> : null}
      </div>
      {verTodo}
    </div>
  );
}

export default async function Inicio({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const catalogo = await getCatalogoLigero();
  const destacado = await getProduct("magnetic-tiles");
  const verTodo = (href: string | { pathname: string; query: Record<string, string> }) => (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 pb-1 text-[14px] font-semibold text-link hover:underline"
    >
      {t("inicio.verTodo")} <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-4 pt-5 md:gap-20 md:px-6 md:pt-7">
      <div className="grid gap-5 md:gap-6">
        <Portada catalogo={catalogo} edades={GRUPOS_EDAD} />
        <FranjaConfianza />
      </div>

      <Novedades />

      <section aria-labelledby="mas-vendidos" data-revelar>
        <Titulo id="mas-vendidos" texto={t("inicio.masVendidosTexto")} verTodo={verTodo("/search")}>
          {t("inicio.masVendidos")}
        </Titulo>
        <FilaCatalogo criterio="masVendidos" ranking />
      </section>

      {destacado ? <JugueteSemana p={destacado} /> : null}

      <section aria-labelledby="por-ocasion" data-revelar>
        <Titulo id="por-ocasion">{t("inicio.porOcasion")}</Titulo>
        <Momentos catalogo={catalogo} ocasiones={OCASIONES} />
      </section>

      <PromoTiendas />

      <section aria-labelledby="menos-25" data-revelar>
        <Titulo
          id="menos-25"
          texto={t("inicio.menosDe25Texto")}
          verTodo={verTodo({ pathname: "/search", query: { max: "25" } })}
        >
          {t("inicio.menosDe25")}
        </Titulo>
        <FilaCatalogo criterio="menosDe25" />
      </section>

      <section aria-labelledby="por-categoria" data-revelar>
        <Titulo id="por-categoria">{t("inicio.porCategoria")}</Titulo>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 md:gap-x-4">
          {CATEGORIAS.map((c) => {
            const delGrupo = catalogo.filter((p) => p.category === c);
            const rep = delGrupo.find((p) => p.bestSeller) ?? delGrupo[0];
            return (
              <li key={c}>
                <Link href={{ pathname: "/search", query: { categoria: c } }} className="group flex h-full flex-col gap-2">
                  {rep ? (
                    <span
                      className={`grid aspect-[4/3] place-items-center rounded-card transition-transform duration-200 group-hover:-translate-y-1 ${FONDO_TINTE[rep.tint]}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/productos/${rep.illustration}.svg`}
                        alt=""
                        className="menear-al-pasar h-[78%]"
                        loading="lazy"
                      />
                    </span>
                  ) : null}
                  <span className="px-0.5 text-[15px] leading-tight font-bold group-hover:underline">
                    {t(`categoria.${c}`)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

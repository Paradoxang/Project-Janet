import { getTranslations, setRequestLocale } from "next-intl/server";
import { FilaCatalogo } from "@/components/producto/fila-productos";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { BloquesEdad } from "@/components/inicio/bloques-edad";
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
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-[24px] leading-tight md:text-[30px]">
          {children}
        </h2>
        {texto ? <p className="mt-1 text-[15px] text-muted-ink">{texto}</p> : null}
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
    <Link href={href} className="shrink-0 pb-1 text-sm font-bold text-link hover:underline">
      {t("inicio.verTodo")}
    </Link>
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 px-4 pt-4 md:gap-16 md:px-6 md:pt-6">
      <div className="grid gap-4">
        <Portada />
        <FranjaConfianza />
      </div>

      <Novedades />

      <section aria-labelledby="por-edad" data-revelar className="scroll-mt-14">
        <Titulo id="por-edad" texto={t("inicio.edadesTexto")}>
          {t("inicio.regalosPorEdad")}
        </Titulo>
        <BloquesEdad catalogo={catalogo} edades={GRUPOS_EDAD} />
      </section>

      {destacado ? <JugueteSemana p={destacado} /> : null}

      <section aria-labelledby="mas-vendidos" data-revelar>
        <Titulo id="mas-vendidos" texto={t("inicio.masVendidosTexto")} verTodo={verTodo("/search")}>
          {t("inicio.masVendidos")}
        </Titulo>
        <FilaCatalogo criterio="masVendidos" ranking />
      </section>

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
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIAS.map((c) => {
            const delGrupo = catalogo.filter((p) => p.category === c);
            const rep = delGrupo.find((p) => p.bestSeller) ?? delGrupo[0];
            return (
              <li key={c}>
                <Link
                  href={{ pathname: "/search", query: { categoria: c } }}
                  className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-tarjeta transition duration-200 hover:-translate-y-1"
                >
                  {rep ? (
                    <span className={`grid aspect-[4/3] place-items-center ${FONDO_TINTE[rep.tint]}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/productos/${rep.illustration}.svg`}
                        alt=""
                        className="menear-al-pasar h-[80%]"
                        loading="lazy"
                      />
                    </span>
                  ) : null}
                  <span className="px-3 py-2.5 text-[14px] leading-tight font-bold">{t(`categoria.${c}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

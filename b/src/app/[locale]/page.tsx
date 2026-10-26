import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { FilaCatalogo } from "@/components/producto/fila-productos";
import { claseIlustracion, FotoIA } from "@/components/producto/foto-ia";
import { enLaTiendaBlanca } from "@/lib/fotos-ia";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { BloquesEdad } from "@/components/inicio/bloques-edad";
import { DosMundos } from "@/components/inicio/dos-mundos";
import { FranjaConfianza } from "@/components/inicio/franja-confianza";
import { HeroCuento, type Diapositiva } from "@/components/inicio/hero-cuento";
import { JugueteSemana } from "@/components/inicio/juguete-semana";
import { Momentos } from "@/components/inicio/momentos";
import { Novedades } from "@/components/inicio/novedades";
import { PromoTiendas } from "@/components/inicio/promo-tiendas";
import { Link } from "@/i18n/navigation";
import { srcProducto } from "@/lib/catalogo";
import { CATEGORIAS, GRUPOS_EDAD, OCASIONES, getCatalogoLigero, getProduct } from "@/lib/data";
import type { Idioma } from "@/lib/tipos";

/** Las diapositivas del hero: familias jugando con juguetes del catálogo (fotos con IA de la variante colorida). */
const HERO = [
  { id: "torre", src: "/variante/portada.webp", posicion: "70% 50%", slug: "magnetic-tiles" },
  {
    id: "cohete",
    src: "/variante/edad-5-7.webp",
    posicion: "62% 40%",
    slug: "foam-rocket-launcher",
  },
  { id: "aros", src: "/variante/edad-1-2.webp", posicion: "62% 50%", slug: "rainbow-ring-stacker" },
  { id: "robot", src: "/variante/edad-8.webp", posicion: "58% 50%", slug: "robot-building-kit" },
] as const;

function Titulo({
  id,
  children,
  cejilla,
  texto,
  verTodo,
}: {
  id: string;
  children: React.ReactNode;
  cejilla?: string;
  texto?: string;
  verTodo?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
      <div>
        {cejilla ? <p className="cejilla text-mandarina-tinta mb-2">{cejilla}</p> : null}
        <h2 id={id} className="font-magia text-[26px] leading-[1.15] font-bold md:text-[38px]">
          {children}
        </h2>
        {texto ? (
          <p className="text-muted-ink mt-2 max-w-xl text-[15px] md:text-base">{texto}</p>
        ) : null}
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
  const diapositivas: Diapositiva[] = HERO.map((h) => {
    const p = catalogo.find((x) => x.slug === h.slug);
    return {
      id: h.id,
      tipo: "imagen",
      src: h.src,
      posicion: h.posicion,
      alt: t(`hero.alt.${h.id}`),
      producto: { slug: h.slug, titulo: p?.title[locale as Idioma] ?? "" },
    };
  });
  const verTodo = (href: string | { pathname: string; query: Record<string, string> }) => (
    <Link
      href={href}
      className="font-display text-link inline-flex shrink-0 items-center gap-1 pb-1 text-[14px] font-semibold hover:underline"
    >
      {t("inicio.verTodo")} <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-14 px-4 pt-4 md:gap-20 md:px-6 md:pt-6">
      <div className="grid gap-4 md:gap-5">
        <HeroCuento diapositivas={diapositivas} />
        <FranjaConfianza />
      </div>

      <section aria-labelledby="por-edad" id="edades" className="scroll-mt-28" data-revelar>
        <Titulo id="por-edad" cejilla={t("inicio.edadesCejilla")} texto={t("inicio.edadesTexto")}>
          {t("inicio.regalosPorEdad")}
        </Titulo>
        <BloquesEdad catalogo={catalogo} edades={GRUPOS_EDAD} />
      </section>

      <DosMundos />

      <Novedades />

      <section aria-labelledby="mas-vendidos" data-revelar>
        <Titulo
          id="mas-vendidos"
          cejilla={t("inicio.masVendidosCejilla")}
          texto={t("inicio.masVendidosTexto")}
          verTodo={verTodo("/search")}
        >
          {t("inicio.masVendidos")}
        </Titulo>
        <FilaCatalogo criterio="masVendidos" ranking />
      </section>

      {destacado ? <JugueteSemana p={destacado} /> : null}

      <section aria-labelledby="por-ocasion" data-revelar>
        <Titulo id="por-ocasion" cejilla={t("inicio.ocasionCejilla")}>
          {t("inicio.porOcasion")}
        </Titulo>
        <Momentos catalogo={catalogo} ocasiones={OCASIONES} />
      </section>

      <PromoTiendas />

      <section aria-labelledby="menos-25" data-revelar>
        <Titulo
          id="menos-25"
          cejilla={t("inicio.ofertasCejilla")}
          texto={t("inicio.menosDe25Texto")}
          verTodo={verTodo({ pathname: "/search", query: { max: "25" } })}
        >
          {t("inicio.menosDe25")}
        </Titulo>
        <FilaCatalogo criterio="menosDe25" />
      </section>

      <section aria-labelledby="por-categoria" data-revelar>
        {/* Cada categoría con su «promoción de la semana» (propuesta P4 de la review de usuario, aprobada el 16-10).
            Son ejemplos marcados DEMO y sin descuentos: la dueña pondrá las suyas. */}
        <Titulo id="por-categoria" cejilla={t("inicio.categoriaCejilla")} texto={t("promo.nota")}>
          {t("inicio.porCategoria")}
        </Titulo>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 md:gap-x-4">
          {CATEGORIAS.map((c) => {
            // El que representa la categoría sale en las dos tiendas: se elige entre los de la tienda blanca.
            const delGrupo = catalogo.filter((p) => p.category === c && enLaTiendaBlanca(p));
            const rep = delGrupo.find((p) => p.bestSeller) ?? delGrupo[0];
            return (
              <li key={c}>
                <Link
                  href={{ pathname: "/search", query: { categoria: c } }}
                  className="group flex h-full flex-col gap-2"
                >
                  {rep ? (
                    <span
                      className={`rounded-card relative grid aspect-[4/3] place-items-center overflow-hidden transition-transform duration-200 group-hover:-translate-y-1 ${FONDO_TINTE[rep.tint]}`}
                    >
                      {claseIlustracion(rep.illustration) !== null ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={srcProducto(rep)}
                          alt=""
                          className={`menear-al-pasar h-[78%] ${claseIlustracion(rep.illustration) ?? ""}`}
                          loading="lazy"
                        />
                      ) : null}
                      <FotoIA illustration={rep.illustration} />
                    </span>
                  ) : null}
                  <span className="font-display px-0.5 text-[16px] leading-tight font-semibold group-hover:underline">
                    {t(`categoria.${c}`)}
                  </span>
                  <span className="grid gap-1 px-0.5" data-testid="promo-semana">
                    <span className="text-ink flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold">
                      {t("promo.etiqueta")}
                      <span className="bg-surface text-muted-ink rounded border px-1 text-[10px] font-extrabold">
                        DEMO
                      </span>
                    </span>
                    <span className="text-muted-ink text-[13px] leading-snug">
                      {t(`promo.textos.${c}`)}
                    </span>
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

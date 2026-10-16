import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, MapPin } from "lucide-react";
import { FONDO_EDAD } from "@/components/cabecera/cabecera";
import { FilaProductos } from "@/components/producto/fila-productos";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CATEGORIAS, GRUPOS_EDAD, OCASIONES, getCatalogoLigero } from "@/lib/data";
import type { ProductoLigero } from "@/lib/tipos";
import { Mascota } from "@/marca/marca";

function representante(lista: ProductoLigero[]): ProductoLigero | undefined {
  return lista.find((p) => p.bestSeller) ?? lista[0];
}

function Titulo({ id, children, verTodo }: { id?: string; children: React.ReactNode; verTodo?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 id={id} className="text-[22px] leading-tight md:text-[26px]">
        {children}
      </h2>
      {verTodo}
    </div>
  );
}

export default async function Inicio({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const catalogo = await getCatalogoLigero();
  const masVendidos = catalogo.filter((p) => p.bestSeller).sort((a, b) => b.reviewCount - a.reviewCount);
  const menosDe25 = catalogo.filter((p) => p.price < 25).sort((a, b) => b.reviewCount - a.reviewCount);
  const verTodo = (href: string | { pathname: string; query: Record<string, string> }) => (
    <Link href={href} className="shrink-0 text-sm font-bold text-link hover:underline">
      {t("inicio.verTodo")}
    </Link>
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-10 px-4 pt-4 md:gap-14 md:px-6 md:pt-6">
      {/* Portada */}
      <section className="relative overflow-hidden rounded-card bg-warm" aria-labelledby="portada">
        <div className="flex items-end justify-between gap-2 pt-6 pr-3 pl-5 md:items-center md:px-12 md:py-12">
          <div className="max-w-xl pb-6 md:pb-0">
            <h1 id="portada" className="text-[27px] leading-[1.12] md:text-5xl">
              <span className="solo-brinco">{t("inicio.heroBrinco")}</span>
              <span className="solo-neutra">{t("inicio.heroNeutro")}</span>
            </h1>
            <p className="mt-3 max-w-md text-[15px] text-muted-ink md:text-lg">{t("inicio.heroTexto")}</p>
            <Button asChild variant="cta" size="xl" className="mt-5">
              <Link href="#por-edad">{t("inicio.heroBoton")}</Link>
            </Button>
          </div>
          <Mascota className="h-40 w-[112px] shrink-0 md:h-72 md:w-60" />
        </div>
      </section>

      {/* Regalos por edad */}
      <section aria-labelledby="por-edad">
        <Titulo id="por-edad">{t("inicio.regalosPorEdad")}</Titulo>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {GRUPOS_EDAD.map((edad, i) => {
            const delGrupo = catalogo.filter((p) => p.ageGroup === edad);
            const rep = representante(delGrupo);
            return (
              <li key={edad} className={i === 4 ? "col-span-2 sm:col-span-1" : undefined}>
                <Link
                  href={{ pathname: "/search", query: { edad } }}
                  data-testid={`edad-${edad}`}
                  className={`group flex h-full items-center justify-between gap-2 overflow-hidden rounded-card p-3 pr-1 hover:brightness-[0.97] ${FONDO_EDAD[edad]}`}
                >
                  <span>
                    <span className="block font-display text-lg leading-tight">{t(`edad.${edad}`)}</span>
                    <span className="mt-0.5 block text-[13px] text-muted-ink">
                      {t("inicio.productos", { n: delGrupo.length })}
                    </span>
                  </span>
                  {rep ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/productos/${rep.illustration}.svg`}
                      alt=""
                      className="size-20 shrink-0 transition-transform group-hover:scale-105"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Más vendidos */}
      <section aria-labelledby="mas-vendidos">
        <Titulo id="mas-vendidos" verTodo={verTodo("/search")}>
          {t("inicio.masVendidos")}
        </Titulo>
        <FilaProductos productos={masVendidos} />
      </section>

      {/* Tiendas */}
      <section
        aria-labelledby="tiendas"
        className="flex items-center gap-4 overflow-hidden rounded-card border bg-white p-5 md:p-8"
      >
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-warm text-brand-text md:size-20">
          <MapPin className="size-7 md:size-9" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 id="tiendas" className="text-xl leading-tight md:text-2xl">
            {t("inicio.tiendasTitulo")}
          </h2>
          <p className="mt-1 text-sm text-muted-ink md:text-base">{t("inicio.tiendasTexto")}</p>
          <Link
            href="/where-to-buy"
            className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-link hover:underline"
          >
            {t("inicio.tiendasBoton")} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <Mascota variante="cara" className="hidden size-24 shrink-0 md:block" />
      </section>

      {/* Menos de $25 */}
      <section aria-labelledby="menos-25">
        <Titulo id="menos-25" verTodo={verTodo({ pathname: "/search", query: { max: "25" } })}>
          {t("inicio.menosDe25")}
        </Titulo>
        <FilaProductos productos={menosDe25} />
      </section>

      {/* Por categoría */}
      <section aria-labelledby="por-categoria">
        <Titulo id="por-categoria">{t("inicio.porCategoria")}</Titulo>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIAS.map((c) => {
            const rep = representante(catalogo.filter((p) => p.category === c));
            return (
              <li key={c}>
                <Link
                  href={{ pathname: "/search", query: { categoria: c } }}
                  className="flex h-full flex-col overflow-hidden rounded-card border bg-white hover:border-ink/30"
                >
                  {rep ? (
                    <span className={`grid aspect-[4/3] place-items-center ${FONDO_TINTE[rep.tint]}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/productos/${rep.illustration}.svg`} alt="" className="h-[80%]" loading="lazy" />
                    </span>
                  ) : null}
                  <span className="px-3 py-2.5 text-[14px] leading-tight font-bold">{t(`categoria.${c}`)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Por ocasión */}
      <section aria-labelledby="por-ocasion">
        <Titulo id="por-ocasion">{t("inicio.porOcasion")}</Titulo>
        <ul className="flex flex-wrap gap-2">
          {OCASIONES.map((o) => (
            <li key={o}>
              <Link
                href={{ pathname: "/search", query: { ocasion: o } }}
                className="inline-flex h-10 items-center rounded-chip border bg-white px-4 text-sm font-bold hover:bg-surface"
              >
                {t(`ocasion.${o}`)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

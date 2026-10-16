import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TriangleAlert } from "lucide-react";
import { RegistroVistaProducto } from "@/components/efectos/registro-actividad";
import { CajaCompra } from "@/components/producto/caja-compra";
import { DisponibilidadTienda } from "@/components/producto/disponibilidad-tienda";
import { Estrellas } from "@/components/producto/estrellas";
import { FilaProductos } from "@/components/producto/fila-productos";
import { Galeria } from "@/components/producto/galeria";
import { Link } from "@/i18n/navigation";
import { getCatalogoLigero, getProduct, getProducts, getStores } from "@/lib/data";
import { fechaResena } from "@/lib/formato";
import type { Idioma } from "@/lib/tipos";

export async function generateStaticParams() {
  const productos = await getProducts();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return { title: p.title[locale as Idioma], description: p.summary[locale as Idioma] };
}

export default async function PaginaProducto({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: loc, slug } = await params;
  setRequestLocale(loc);
  const locale = loc as Idioma;
  const p = await getProduct(slug);
  if (!p) notFound();
  const t = await getTranslations();
  const tiendas = await getStores();
  const catalogo = await getCatalogoLigero();
  const relacionados = p.related
    .map((id) => catalogo.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const avisoPiezas = p.safety[locale].find((s) => /CHOKING|ASFIXIA/i.test(s));

  const detalles: [string, string][] = [
    [t("producto.edades"), p.specs.ages[locale]],
    [t("producto.medidas"), p.specs.dimensions],
    [t("producto.peso"), p.specs.weight],
    [t("producto.materiales"), p.specs.materials[locale]],
    [t("producto.pilas"), p.specs.batteries[locale]],
  ];
  if (p.specs.pieces) detalles.push([t("producto.piezas"), String(p.specs.pieces)]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-3 md:px-6 md:pt-5">
      <RegistroVistaProducto id={p.id} />
      <nav aria-label="breadcrumb" className="mb-3 text-[13px] text-muted-ink">
        <Link href="/search" className="hover:underline">
          {t("producto.migas")}
        </Link>
        {" › "}
        <Link href={{ pathname: "/search", query: { edad: p.ageGroup } }} className="hover:underline">
          {t(`edad.${p.ageGroup}`)}
        </Link>
        {" › "}
        <Link href={{ pathname: "/search", query: { categoria: p.category } }} className="hover:underline">
          {t(`categoria.${p.category}`)}
        </Link>
      </nav>

      {/* Una sola caja de compra: el orden lo deciden las áreas de la rejilla (móvil, tableta y escritorio). */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-5 [grid-template-areas:'g'_'i'_'c'_'r'] md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:[grid-template-areas:'g_i'_'g_c'_'g_r'] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,.75fr)] lg:[grid-template-areas:'g_i_c'_'g_r_c']">
        <div className="[grid-area:g] md:sticky md:top-12 md:self-start">
          <Galeria
            illustration={p.illustration}
            tint={p.tint}
            alt={p.title[locale]}
            medidas={p.specs.dimensions}
            edades={p.specs.ages[locale]}
          />
        </div>

        <div className="[grid-area:i]">
          <div>
            {p.bestSeller ? (
              <span className="mb-2 inline-block rounded-chip bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
                {t("producto.masVendido")}
              </span>
            ) : null}
            <h1 className="text-[22px] leading-snug md:text-[28px]" data-testid="titulo-producto">
              {p.title[locale]}
            </h1>
            <a href="#resenas" className="mt-1.5 inline-flex items-center gap-1.5 text-sm hover:underline">
              <span className="font-bold">{p.rating.toFixed(1)}</span>
              <Estrellas valor={p.rating} className="text-base" />
              <span className="text-link">{t("producto.calificaciones", { n: p.reviewCount })}</span>
            </a>
            <p className="mt-3 text-[15px] text-ink/90">{p.summary[locale]}</p>
          </div>
        </div>

        <div className="[grid-area:c] lg:sticky lg:top-12 lg:self-start">
          <CajaCompra
            id={p.id}
            precio={p.price}
            stockOnline={p.stockOnline}
            diasEntrega={p.deliveryDays}
            aviso={avisoPiezas}
          />
        </div>

        <div className="grid content-start gap-5 [grid-area:r]">
          <DisponibilidadTienda
            slug={p.slug}
            tiendas={tiendas.map((ti) => ({
              id: ti.id,
              city: ti.city,
              state: ti.state,
              address: ti.address,
              lat: ti.lat,
              lng: ti.lng,
              hours: ti.hours,
              unidades: ti.stock[p.id] ?? 0,
            }))}
          />

          <section aria-labelledby="acerca">
            <h2 id="acerca" className="text-xl">
              {t("producto.acercaDe")}
            </h2>
            <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-[15px] marker:text-muted-ink">
              {p.bullets[locale].map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="detalles">
            <h2 id="detalles" className="text-xl">
              {t("producto.detalles")}
            </h2>
            <dl className="mt-2 divide-y rounded-card bg-white text-sm shadow-tarjeta">
              {detalles.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[40%_1fr] gap-3 px-3 py-2">
                  <dt className="font-bold text-muted-ink">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {p.safety[locale].length > 0 ? (
            <section aria-labelledby="seguridad" className="rounded-card border border-low/30 bg-low/5 p-4">
              <h2 id="seguridad" className="flex items-center gap-2 text-lg text-low">
                <TriangleAlert className="size-5" aria-hidden="true" />
                {t("producto.seguridad")}
              </h2>
              <ul className="mt-2 grid gap-2 text-sm">
                {p.safety[locale].map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      {relacionados.length > 0 ? (
        <section aria-labelledby="recomendados" className="mt-12">
          <h2 id="recomendados" className="mb-3 text-[22px]">
            {t("producto.recomendados")}
          </h2>
          <FilaProductos productos={relacionados} />
        </section>
      ) : null}

      <section aria-labelledby="resenas" className="mt-12 scroll-mt-12" id="resenas">
        <h2 id="titulo-resenas" className="text-[22px]">
          {t("producto.resenas")}
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <Estrellas valor={p.rating} className="text-xl" />
          <span className="font-bold">{t("producto.estrellas", { rating: p.rating.toFixed(1) })}</span>
        </div>
        <p className="mt-1 text-sm text-muted-ink">{t("producto.calificaciones", { n: p.reviewCount })}</p>
        <p className="mt-3 inline-block rounded-md bg-surface px-3 py-2 text-[13px] font-semibold text-muted-ink">
          {t("producto.resenasEjemplo")}
        </p>
        <ul className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {p.reviews.map((r) => (
            <li key={r.id} className="grid content-start gap-1.5" data-testid="resena">
              <p className="flex items-center gap-2 text-sm font-bold">
                <span className="grid size-8 place-items-center rounded-full bg-surface text-xs">{r.name[0]}</span>
                {r.name}
                <span className="font-normal text-muted-ink">{t("producto.de", { estado: r.state })}</span>
              </p>
              <p className="flex items-center gap-2">
                <Estrellas valor={r.rating} className="text-sm" />
                <span className="text-sm font-bold">{r.title[locale]}</span>
              </p>
              <p className="text-xs text-muted-ink">
                {fechaResena(r.date, locale)} ·{" "}
                <span className="rounded bg-surface px-1 font-bold">{t("producto.resenaEjemplo")}</span>
              </p>
              <p className="text-[15px]">{r.body[locale]}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

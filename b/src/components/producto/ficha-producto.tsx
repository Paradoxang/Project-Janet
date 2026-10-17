"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PackageX, TriangleAlert } from "lucide-react";
import { RegistroVistaProducto } from "@/components/efectos/registro-actividad";
import { useCatalogoDeLaTienda } from "@/components/proveedor-catalogo";
import { Button } from "@/components/ui/button";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import { esNuevo } from "@/lib/catalogo";
import { fechaResena } from "@/lib/formato";
import type { Idioma, Producto, ProductoLigero, Tienda } from "@/lib/tipos";
import { useCatalogoLocal } from "@/stores/catalogo";
import { CajaCompra } from "./caja-compra";
import { DisponibilidadTienda } from "./disponibilidad-tienda";
import { Estrellas } from "./estrellas";
import { FilaProductos } from "./fila-productos";
import { Galeria } from "./galeria";

/** La ficha de un producto (de ejemplo o creado por la dueña). */
export function FichaProducto({
  p,
  tiendas,
  relacionados,
}: {
  p: Producto;
  tiendas: Tienda[];
  relacionados: ProductoLigero[];
}) {
  const t = useTranslations();
  const locale = useLocale() as Idioma;
  const nuevo = esNuevo(p.id);
  const avisoPiezas = p.safety[locale].find((s) => /CHOKING|ASFIXIA/i.test(s));
  const detalles = (
    [
      [t("producto.edades"), p.specs.ages[locale]],
      [t("producto.medidas"), p.specs.dimensions],
      [t("producto.peso"), p.specs.weight],
      [t("producto.materiales"), p.specs.materials[locale]],
      [t("producto.pilas"), p.specs.batteries[locale]],
      [t("producto.piezas"), p.specs.pieces ? String(p.specs.pieces) : ""],
    ] as [string, string][]
  ).filter(([, valor]) => valor);

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
            imagen={p.imagen}
            tint={p.tint}
            alt={p.title[locale]}
            medidas={p.specs.dimensions}
            edades={p.specs.ages[locale] || t(`edad.${p.ageGroup}`)}
          />
        </div>

        <div className="[grid-area:i]">
          <div>
            {nuevo ? (
              <span className="mb-2 inline-block rounded-chip bg-stock px-2 py-0.5 text-[11px] font-bold text-white">
                {t("producto.nuevo")}
              </span>
            ) : p.bestSeller ? (
              <span className="mb-2 inline-block rounded-chip bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
                {t("producto.masVendido")}
              </span>
            ) : null}
            <h1 className="text-[22px] leading-snug md:text-[28px]" data-testid="titulo-producto">
              {p.title[locale]}
            </h1>
            {p.reviewCount > 0 ? (
              <a href="#resenas" className="mt-1.5 inline-flex items-center gap-1.5 text-sm hover:underline">
                <span className="font-bold">{p.rating.toFixed(1)}</span>
                <Estrellas valor={p.rating} className="text-base" />
                <span className="text-link">{t("producto.calificaciones", { n: p.reviewCount })}</span>
              </a>
            ) : (
              <p className="mt-1.5 text-sm text-muted-ink">{t("producto.sinResenas")}</p>
            )}
            {p.summary[locale] ? <p className="mt-3 text-[15px] text-ink/90">{p.summary[locale]}</p> : null}
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
          {nuevo ? null : (
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
          )}

          {p.bullets[locale].length > 0 ? (
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
          ) : null}

          {detalles.length > 0 ? (
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
          ) : null}

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

      <section aria-labelledby="titulo-resenas" className="mt-12 scroll-mt-12" id="resenas">
        <h2 id="titulo-resenas" className="text-[22px]">
          {t("producto.resenas")}
        </h2>
        {p.reviews.length === 0 ? (
          <p className="mt-2 text-muted-ink">{t("producto.sinResenasTexto")}</p>
        ) : (
          <>
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
          </>
        )}
      </section>
    </div>
  );
}

/** Cuando el producto se ocultó, se borró o no existe en este navegador. */
function NoDisponible() {
  const t = useTranslations("producto");
  return (
    <div className="mx-auto grid max-w-md justify-items-center gap-3 px-4 pt-16 text-center" data-testid="no-disponible">
      <PackageX className="size-12 text-muted-ink" aria-hidden="true" />
      <h1 className="text-2xl">{t("yaNoDisponible")}</h1>
      <p className="text-muted-ink">{t("yaNoDisponibleTexto")}</p>
      <Button asChild variant="cta" size="lg">
        <Link href="/search">{t("verOtros")}</Link>
      </Button>
    </div>
  );
}

/** Ficha de un producto de ejemplo, con los cambios que haya hecho la dueña. */
export function FichaBase({ p, tiendas, relacionados }: { p: Producto; tiendas: Tienda[]; relacionados: ProductoLigero[] }) {
  const hidratado = useHidratado();
  const edicion = useCatalogoLocal((s) => s.ediciones[p.id]);
  const fuera = useCatalogoLocal((s) => s.ocultos.includes(p.id) || s.borrados.includes(p.id));
  if (hidratado && fuera) return <NoDisponible />;
  return <FichaProducto p={hidratado && edicion ? { ...p, ...edicion } : p} tiendas={tiendas} relacionados={relacionados} />;
}

/** Ficha de un producto creado por la dueña: /p/nuevo/?id=…. */
export function FichaNueva({ tiendas }: { tiendas: Tienda[] }) {
  const hidratado = useHidratado();
  const [id, setId] = useState<string | null>(null);
  const nuevos = useCatalogoLocal((s) => s.nuevos);
  const ocultos = useCatalogoLocal((s) => s.ocultos);
  const productos = useCatalogoDeLaTienda();

  // El id va en la dirección (?id=): se lee al cargar, sin pasar por la generación estática.
  useEffect(() => {
    setId(new URLSearchParams(window.location.search).get("id") ?? "");
  }, []);

  if (!hidratado || id === null) return <div className="min-h-[60vh]" />;
  const p = nuevos.find((n) => n.id === id);
  if (!p || ocultos.includes(p.id)) return <NoDisponible />;
  const relacionados = productos.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 6);
  return <FichaProducto p={p} tiendas={tiendas} relacionados={relacionados} />;
}

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
      <nav aria-label="breadcrumb" className="text-muted-ink mb-4 text-[13.5px]">
        <Link href="/" className="hover:underline">
          {t("nav.juguetes")}
        </Link>
        {" › "}
        <Link
          href={{ pathname: "/search", query: { edad: p.ageGroup } }}
          className="hover:underline"
        >
          {t(`edad.${p.ageGroup}`)}
        </Link>
        {" › "}
        <Link
          href={{ pathname: "/search", query: { categoria: p.category } }}
          className="hover:underline"
        >
          {t(`categoria.${p.category}`)}
        </Link>
      </nav>

      {/* Rediseño del 26-10, a partir de la ficha de la propuesta en Figma: la galería a la izquierda y, a la derecha, todo lo que hace
          falta para decidir (precio, stock, entrega, cantidad y los dos botones). Lo demás, en tarjetas debajo. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="md:sticky md:top-[calc(var(--alto-arriba,100px)+16px)] md:self-start">
          <Galeria
            illustration={p.illustration}
            imagen={p.imagen}
            tint={p.tint}
            alt={p.title[locale]}
            medidas={p.specs.dimensions}
            edades={p.specs.ages[locale] || t(`edad.${p.ageGroup}`)}
          />
        </div>

        <div className="grid content-start gap-5">
          <div>
            <p className="cejilla text-mandarina-tinta flex flex-wrap items-center gap-x-2 gap-y-1">
              {t(`categoria.${p.category}`)}
              <span aria-hidden="true" className="chispa text-[8px]" />
              {t(`edadCorta.${p.ageGroup}`)}
            </p>
            {nuevo ? (
              <span className="rounded-chip bg-stock mt-3 inline-block px-2.5 py-0.5 text-[11px] font-bold text-white">
                {t("producto.nuevo")}
              </span>
            ) : p.bestSeller ? (
              <span className="rounded-chip bg-noche text-crema mt-3 inline-block px-2.5 py-0.5 text-[11px] font-bold">
                {t("producto.masVendido")}
              </span>
            ) : null}
            <h1
              className="font-display mt-2 text-[26px] leading-[1.12] font-semibold md:text-[34px]"
              data-testid="titulo-producto"
            >
              {p.title[locale]}
            </h1>
            {p.reviewCount > 0 ? (
              <a
                href="#resenas"
                className="mt-2 inline-flex items-center gap-1.5 text-sm hover:underline"
              >
                <span className="font-bold">{p.rating.toFixed(1)}</span>
                <Estrellas valor={p.rating} className="text-base" />
                <span className="text-link">
                  {t("producto.calificaciones", { n: p.reviewCount })}
                </span>
              </a>
            ) : (
              <p className="text-muted-ink mt-2 text-sm">{t("producto.sinResenas")}</p>
            )}
            {p.summary[locale] ? (
              <p className="text-ink/85 mt-3 text-[16px] leading-relaxed">{p.summary[locale]}</p>
            ) : null}
          </div>
          <CajaCompra
            id={p.id}
            precio={p.price}
            stockOnline={p.stockOnline}
            diasEntrega={p.deliveryDays}
            aviso={avisoPiezas}
          />
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2">
        {p.bullets[locale].length > 0 ? (
          <section
            aria-labelledby="acerca"
            className="rounded-card shadow-tarjeta bg-white p-6 md:p-8"
          >
            <h2
              id="acerca"
              className="font-magia text-[22px] leading-tight font-bold md:text-[26px]"
            >
              {t("producto.acercaDe")}
            </h2>
            <ul className="mt-4 grid gap-2.5 text-[15.5px] leading-relaxed">
              {p.bullets[locale].map((b) => (
                <li key={b} className="flex gap-3">
                  <span aria-hidden="true" className="chispa mt-1.5 shrink-0 text-[10px]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {detalles.length > 0 ? (
          <section
            aria-labelledby="detalles"
            className="rounded-card shadow-tarjeta bg-white p-6 md:p-8"
          >
            <h2
              id="detalles"
              className="font-magia text-[22px] leading-tight font-bold md:text-[26px]"
            >
              {t("producto.detalles")}
            </h2>
            <dl className="divide-line mt-4 divide-y text-[15px]">
              {detalles.map(([k, v]) => (
                <div key={k} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-2.5">
                  <dt className="text-muted-ink">{k}</dt>
                  <dd className="font-display text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      {p.safety[locale].length > 0 ? (
        <section
          aria-labelledby="seguridad"
          className="rounded-r-card border-calendula mt-5 border-l-4 bg-[#fdf3d8] px-5 py-4 md:px-7"
        >
          <h2
            id="seguridad"
            className="font-display text-calendula-tinta flex items-center gap-2 text-[17px] font-semibold"
          >
            <TriangleAlert className="size-5" aria-hidden="true" />
            {t("producto.seguridad")}
          </h2>
          <ul className="mt-1.5 grid gap-1 text-[14.5px]">
            {p.safety[locale].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {nuevo ? null : (
        <div className="mt-12 md:mt-16">
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
        </div>
      )}

      {relacionados.length > 0 ? (
        <section aria-labelledby="recomendados" className="mt-14">
          <h2 id="recomendados" className="font-magia mb-5 text-[24px] font-bold md:text-[30px]">
            {t("producto.recomendados")}
          </h2>
          <FilaProductos productos={relacionados} />
        </section>
      ) : null}

      <section aria-labelledby="titulo-resenas" className="mt-14 scroll-mt-28" id="resenas">
        <h2 id="titulo-resenas" className="font-magia text-[24px] font-bold md:text-[30px]">
          {t("producto.resenas")}
        </h2>
        {p.reviews.length === 0 ? (
          <p className="text-muted-ink mt-2">{t("producto.sinResenasTexto")}</p>
        ) : (
          <>
            <div className="mt-2 flex items-center gap-2">
              <Estrellas valor={p.rating} className="text-xl" />
              <span className="font-bold">
                {t("producto.estrellas", { rating: p.rating.toFixed(1) })}
              </span>
            </div>
            <p className="text-muted-ink mt-1 text-sm">
              {t("producto.calificaciones", { n: p.reviewCount })}
            </p>
            <p className="bg-surface text-muted-ink mt-3 inline-block rounded-md px-3 py-2 text-[13px] font-semibold">
              {t("producto.resenasEjemplo")}
            </p>
            <ul className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {p.reviews.map((r) => (
                <li key={r.id} className="grid content-start gap-1.5" data-testid="resena">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <span className="bg-surface grid size-8 place-items-center rounded-full text-xs">
                      {r.name[0]}
                    </span>
                    {r.name}
                    <span className="text-muted-ink font-normal">
                      {t("producto.de", { estado: r.state })}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Estrellas valor={r.rating} className="text-sm" />
                    <span className="text-sm font-bold">{r.title[locale]}</span>
                  </p>
                  <p className="text-muted-ink text-xs">
                    {fechaResena(r.date, locale)} ·{" "}
                    <span className="bg-surface rounded px-1 font-bold">
                      {t("producto.resenaEjemplo")}
                    </span>
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
    <div
      className="mx-auto grid max-w-md justify-items-center gap-3 px-4 pt-16 text-center"
      data-testid="no-disponible"
    >
      <PackageX className="text-muted-ink size-12" aria-hidden="true" />
      <h1 className="text-2xl">{t("yaNoDisponible")}</h1>
      <p className="text-muted-ink">{t("yaNoDisponibleTexto")}</p>
      <Button asChild variant="cta" size="lg">
        <Link href="/search">{t("verOtros")}</Link>
      </Button>
    </div>
  );
}

/** Ficha de un producto de ejemplo, con los cambios que haya hecho la dueña. */
export function FichaBase({
  p,
  tiendas,
  relacionados,
}: {
  p: Producto;
  tiendas: Tienda[];
  relacionados: ProductoLigero[];
}) {
  const hidratado = useHidratado();
  const edicion = useCatalogoLocal((s) => s.ediciones[p.id]);
  const fuera = useCatalogoLocal((s) => s.ocultos.includes(p.id) || s.borrados.includes(p.id));
  if (hidratado && fuera) return <NoDisponible />;
  return (
    <FichaProducto
      p={hidratado && edicion ? { ...p, ...edicion } : p}
      tiendas={tiendas}
      relacionados={relacionados}
    />
  );
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
  const relacionados = productos
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 6);
  return <FichaProducto p={p} tiendas={tiendas} relacionados={relacionados} />;
}

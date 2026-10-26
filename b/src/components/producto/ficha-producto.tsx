"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconoAviso } from "@/components/cuento/iconos";
import { Cielo } from "@/components/cuento/cielo";
import { EstanteInclinado } from "@/components/cuento/estante-inclinado";
import { TarjetaCuento } from "@/components/cuento/tarjeta-cuento";
import { TituloCuento } from "@/components/cuento/titulo-cuento";
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

  // Rediseño del 26-10 con el canon: el canon no tiene ficha de producto, así que se toma la de la propuesta en Figma
  // (galería a la izquierda, todo lo de comprar a la derecha, tarjetas debajo) y se dibuja con sus piezas: la galería
  // como una portada sobre el cielo azul noche, las tarjetas de evento sobre el papel y el estante para los relacionados.
  return (
    <>
      <RegistroVistaProducto id={p.id} />
      <section aria-labelledby="titulo-producto" className="noche relative overflow-hidden">
        <Cielo cantidad={45} semilla={17} />
        <div className="envoltura relative pt-6 pb-14 md:pt-8 md:pb-20">
          <nav aria-label="breadcrumb" className="text-crema/75 mb-6 text-[13.5px]">
            <Link href="/" className="hover:text-crema hover:underline">
              {t("nav.juguetes")}
            </Link>
            {" › "}
            <Link
              href={{ pathname: "/search", query: { edad: p.ageGroup } }}
              className="hover:text-crema hover:underline"
            >
              {t(`edad.${p.ageGroup}`)}
            </Link>
            {" › "}
            <Link
              href={{ pathname: "/search", query: { categoria: p.category } }}
              className="hover:text-crema hover:underline"
            >
              {t(`categoria.${p.category}`)}
            </Link>
          </nav>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="md:sticky md:top-[calc(var(--alto-arriba,100px)+16px)] md:self-start">
              <div className="bg-crema text-ink rounded-[18px] p-3 shadow-[0_14px_34px_rgb(0_0_0/0.34)]">
                <Galeria
                  illustration={p.illustration}
                  imagen={p.imagen}
                  tint={p.tint}
                  alt={p.title[locale]}
                  medidas={p.specs.dimensions}
                  edades={p.specs.ages[locale] || t(`edad.${p.ageGroup}`)}
                />
              </div>
            </div>

            <div className="grid content-start gap-6">
              <div>
                <p className="cejilla text-calendula flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span aria-hidden="true" className="chispa text-[10px]" />
                  {t(`categoria.${p.category}`)} · {t(`edadCorta.${p.ageGroup}`)}
                </p>
                {nuevo ? (
                  <span className="rounded-chip bg-stock mt-4 inline-block px-2.5 py-0.5 text-[11px] font-bold text-white">
                    {t("producto.nuevo")}
                  </span>
                ) : p.bestSeller ? (
                  <span className="rounded-chip bg-crema text-noche mt-4 inline-block px-2.5 py-0.5 text-[11px] font-bold">
                    {t("producto.masVendido")}
                  </span>
                ) : null}
                <h1
                  id="titulo-producto"
                  className="font-display text-crema mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] font-bold"
                  data-testid="titulo-producto"
                >
                  {p.title[locale]}
                </h1>
                {p.reviewCount > 0 ? (
                  <a
                    href="#resenas"
                    className="text-crema/85 mt-3 inline-flex items-center gap-2 text-[15px] hover:underline"
                  >
                    <span className="text-calendula tracking-[0.1em]" aria-hidden="true">
                      ★★★★★
                    </span>
                    <span className="text-crema font-bold">{p.rating.toFixed(1)}</span>
                    <span>{t("producto.calificaciones", { n: p.reviewCount })}</span>
                  </a>
                ) : (
                  <p className="text-crema/75 mt-3 text-sm">{t("producto.sinResenas")}</p>
                )}
                {p.summary[locale] ? (
                  <p className="text-crema/85 mt-4 text-[17px] leading-relaxed">
                    {p.summary[locale]}
                  </p>
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
        </div>
      </section>

      <section aria-label={t("producto.detallesEtiqueta")} className="papel-pintado">
        <div className="envoltura seccion grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            {p.bullets[locale].length > 0 ? (
              <section aria-labelledby="acerca" className="tarjeta-evento p-7 md:p-9">
                <p className="cejilla text-mandarina-tinta">{t("producto.acercaCejilla")}</p>
                <h2 id="acerca" className="font-display mt-2 text-[26px] leading-tight font-bold">
                  {t("producto.acercaDe")}
                </h2>
                <ul className="mt-5 grid gap-3 text-[16px] leading-relaxed">
                  {p.bullets[locale].map((b) => (
                    <li key={b} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="chispa bg-mandarina mt-1.5 shrink-0 text-[11px]"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {detalles.length > 0 ? (
              <section aria-labelledby="detalles" className="tarjeta-evento p-7 md:p-9">
                <p className="cejilla text-aqua-tinta">{t("producto.detallesCejilla")}</p>
                <h2 id="detalles" className="font-display mt-2 text-[26px] leading-tight font-bold">
                  {t("producto.detalles")}
                </h2>
                <dl className="divide-ink/15 mt-5 divide-y divide-dashed text-[15.5px]">
                  {detalles.map(([k, v]) => (
                    <div key={k} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-3">
                      <dt className="text-muted-ink">{k}</dt>
                      <dd className="font-display text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>

          {p.safety[locale].length > 0 ? (
            <section aria-labelledby="seguridad" className="tarjeta-evento flex gap-5 p-7 md:p-9">
              <span aria-hidden="true" className="chispa mt-1 shrink-0 text-[30px]" />
              <div>
                <h2
                  id="seguridad"
                  className="font-display text-calendula-tinta text-[22px] font-bold"
                >
                  {t("producto.seguridad")}
                </h2>
                <ul className="mt-2 grid gap-1.5 text-[15px] leading-relaxed">
                  {p.safety[locale].map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

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
        </div>
      </section>

      {relacionados.length > 0 ? (
        <section
          aria-labelledby="recomendados"
          className="noche relative overflow-hidden"
          data-revelar
        >
          <Cielo cantidad={36} semilla={29} />
          <div className="envoltura seccion relative">
            <TituloCuento id="recomendados" noche cejilla={t("producto.recomendadosCejilla")}>
              {t("producto.recomendados")}
            </TituloCuento>
            <EstanteInclinado
              como="ul"
              className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-[30px] lg:grid-cols-3"
            >
              {relacionados.slice(0, 3).map((r) => (
                <li key={r.id}>
                  <TarjetaCuento p={r} />
                </li>
              ))}
            </EstanteInclinado>
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="titulo-resenas"
        className="papel-pintado scroll-mt-28"
        id="resenas"
        data-revelar
      >
        <div className="envoltura seccion">
          <TituloCuento
            id="titulo-resenas"
            cejilla={t("producto.resenasCejilla")}
            texto={
              p.reviews.length === 0 ? t("producto.sinResenasTexto") : t("producto.resenasEjemplo")
            }
          >
            {t("producto.resenas")}
          </TituloCuento>
          {p.reviews.length > 0 ? (
            <>
              <p className="-mt-6 mb-8 flex items-center gap-3">
                <Estrellas valor={p.rating} className="text-xl" />
                <span className="font-display text-[18px] font-semibold">
                  {t("producto.estrellas", { rating: p.rating.toFixed(1) })}
                </span>
                <span className="text-muted-ink">
                  · {t("producto.calificaciones", { n: p.reviewCount })}
                </span>
              </p>
              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {p.reviews.map((r, i) => (
                  <li
                    key={r.id}
                    className="tarjeta-evento grid content-start gap-2 p-6"
                    data-testid="resena"
                  >
                    <p className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`border-papel font-display text-noche grid size-12 place-items-center rounded-full border-4 text-[18px] font-bold ${["bg-mandarina", "bg-aqua", "bg-calendula"][i % 3]}`}
                      >
                        {r.name[0]}
                      </span>
                      <span className="grid">
                        <span className="font-display text-[16px] font-semibold">{r.name}</span>
                        <span className="text-muted-ink text-[13px]">
                          {t("producto.de", { estado: r.state })}
                        </span>
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Estrellas valor={r.rating} className="text-sm" />
                      <span className="text-[15px] font-bold">{r.title[locale]}</span>
                    </p>
                    <p className="text-[15px] leading-relaxed">{r.body[locale]}</p>
                    <p className="text-muted-ink text-xs">
                      {fechaResena(r.date, locale)} ·{" "}
                      <span className="bg-surface rounded px-1 font-bold">
                        {t("producto.resenaEjemplo")}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </section>
    </>
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
      <IconoAviso className="text-muted-ink size-12" />
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

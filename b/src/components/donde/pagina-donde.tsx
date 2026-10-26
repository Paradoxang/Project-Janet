"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  IconoCerrar,
  IconoDiana,
  IconoReloj,
  IconoRumbo,
  IconoTelefono,
} from "@/components/cuento/iconos";
import { Cielo, Orbitas } from "@/components/cuento/cielo";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { enlaceComoLlegar } from "@/components/producto/disponibilidad-tienda";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import type { Idioma, Tienda } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import {
  coordenadasDeZip,
  distanciaMillas,
  lugarDeZip,
  zipValido,
  type Coordenadas,
} from "@/lib/zip";
import { usePreferencias, ZIP_INICIAL } from "@/stores/preferencias";
import type { PuntoMapa, VistaMapa } from "./mapa-tiendas";
import { ImagenSuelta } from "@/components/producto/foto-ia";

const MapaTiendas = dynamic(() => import("./mapa-tiendas"), {
  ssr: false,
  loading: () => <div className="bg-surface h-full w-full animate-pulse" />,
});

// El acento de cada tienda en la línea (como los eventos del canon), en su tinta para el número grande.
const ACENTOS = [
  { chispa: "bg-mandarina", tinta: "text-mandarina-tinta" },
  { chispa: "bg-aqua", tinta: "text-aqua-tinta" },
  { chispa: "bg-calendula", tinta: "text-calendula-tinta" },
];

/**
 * Dónde comprar, con el canon (rediseño del 26-10). Pedido de la clienta: un mapa más amable, que se acerque solo al
 * escribir el ZIP y que se pueda alejar hasta ver todo EE. UU. Arriba, el cielo con el ZIP en el campo del boletín;
 * debajo, las tiendas como una línea de tiempo ordenada por distancia (el número grande son las millas) y el mapa al
 * lado, con «Ver todo EE. UU.».
 */
export function PaginaDonde({ tiendas }: { tiendas: Tienda[] }) {
  const t = useTranslations("donde");
  const locale = useLocale() as Idioma;
  const hidratado = useHidratado();
  const { productos } = useCatalogo();
  const zipGuardado = usePreferencias((s) => s.zip);
  const setZip = usePreferencias((s) => s.setZip);
  const zip = hidratado ? zipGuardado : ZIP_INICIAL;

  const [borrador, setBorrador] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gps, setGps] = useState<Coordenadas | null>(null);
  const [ubicando, setUbicando] = useState(false);
  const [foco, setFoco] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaMapa>("cerca");
  const [sinFiltro, setSinFiltro] = useState(false);
  // ?producto=… y ?tienda=… se leen al montar: así la página sale completa en el HTML estático (sin saltos). La tienda
  // llega desde la ficha de producto y se enfoca en el mapa.
  const [slugUrl, setSlugUrl] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setSlugUrl(q.get("producto"));
    const tienda = q.get("tienda");
    if (tienda && tiendas.some((ti) => ti.id === tienda)) setFoco(tienda);
  }, [tiendas]);

  const slug = sinFiltro ? null : slugUrl;
  const producto = slug ? productos.find((p) => p.slug === slug) : undefined;
  const origen = gps ?? coordenadasDeZip(zip);

  const lista = useMemo(
    () =>
      tiendas
        .map((ti) => ({
          ...ti,
          millas: origen ? distanciaMillas(origen, ti) : 0,
          unidades: producto ? (ti.stock[producto.id] ?? 0) : null,
          conStock: Object.values(ti.stock).filter((n) => n > 0).length,
        }))
        .sort((a, b) => a.millas - b.millas),
    [tiendas, origen, producto],
  );
  const masCercanaConStock = producto ? lista.find((ti) => (ti.unidades ?? 0) > 0) : undefined;

  const puntos: PuntoMapa[] = lista.map((ti) => ({
    id: ti.id,
    ciudad: ti.city,
    lat: ti.lat,
    lng: ti.lng,
    unidades: ti.unidades,
    detalle:
      ti.unidades === null
        ? ti.address
        : ti.unidades > 0
          ? t("tieneStock", { n: ti.unidades })
          : t("agotado"),
  }));
  const lugar = gps ? t("tuUbicacion") : `${lugarDeZip(zip) ?? ""} ${zip}`.trim();

  function usarUbicacion() {
    if (!navigator.geolocation) {
      setError(t("sinUbicacion"));
      return;
    }
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUbicando(false);
        setError(null);
        setFoco(null);
        setVista("cerca");
      },
      () => {
        setUbicando(false);
        setError(t("sinUbicacion"));
      },
      { timeout: 8000 },
    );
  }

  return (
    <>
      <section className="noche relative overflow-hidden" aria-labelledby="donde-titulo">
        <Cielo cantidad={70} semilla={61} />
        <Orbitas className="top-1/2 left-[78%] hidden w-[620px] -translate-x-1/2 -translate-y-1/2 opacity-60 md:block" />
        <div className="envoltura relative py-16 md:py-24">
          <p className="cejilla text-aqua flex items-center gap-2">
            <span aria-hidden="true" className="chispa bg-aqua text-[10px]" />
            {t("cejilla")}
          </p>
          <h1 id="donde-titulo" className="titulo-cuento text-crema mt-4 max-w-3xl">
            {t("tituloCuento")}
          </h1>
          <p className="text-crema/80 mt-4 max-w-xl text-[17px] leading-relaxed">{t("texto")}</p>

          <form
            className="mt-10 grid max-w-2xl gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const valor = (borrador ?? zip).trim();
              if (!zipValido(valor)) {
                setError(t("zipInvalido"));
                return;
              }
              setZip(valor);
              setGps(null);
              setError(null);
              setBorrador(null);
              // Buscar suelta la tienda enfocada y vuelve al encuadre del ZIP (en la review de usuario del 16-10,
              // «Buscar» dejaba el mapa quieto en la última tienda pulsada).
              setFoco(null);
              setVista("cerca");
            }}
          >
            <label htmlFor="zip-tiendas" className="cejilla text-crema/80">
              {t("zip")}
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <input
                id="zip-tiendas"
                inputMode="numeric"
                maxLength={5}
                autoComplete="postal-code"
                placeholder={t("zipPista")}
                value={borrador ?? zip}
                onChange={(e) => setBorrador(e.target.value.replace(/\D/g, ""))}
                aria-invalid={!!error}
                aria-describedby={error ? "error-zip-tiendas" : "lugar-zip-tiendas"}
                className="campo-boletin min-w-0 flex-1 basis-52 text-[1.5rem] tracking-[0.16em]"
                data-testid="zip-tiendas"
              />
              <button type="submit" className="placa" data-testid="buscar-tiendas">
                {t("buscar")} <span aria-hidden="true">✦</span>
              </button>
              <button
                type="button"
                onClick={usarUbicacion}
                disabled={ubicando}
                className="placa placa-texto text-crema disabled:opacity-60"
              >
                <IconoDiana className="size-4" />
                {ubicando ? t("ubicando") : t("cercaDeMi")}
              </button>
            </div>
            {error ? (
              <p
                id="error-zip-tiendas"
                role="alert"
                className="text-calendula text-[15px] font-semibold"
              >
                {error}
              </p>
            ) : (
              <p id="lugar-zip-tiendas" className="text-crema/80 text-[14px]">
                {t("desde", { lugar })} ·{" "}
                <span className="text-calendula font-semibold">{t("demo")}</span>
              </p>
            )}
          </form>
        </div>
      </section>

      <section aria-label={t("mapa")} className="papel-pintado">
        <div className="envoltura py-12 md:py-16">
          {producto ? (
            <div
              className="tarjeta-evento mb-8 flex flex-wrap items-center gap-3 p-4"
              data-testid="filtro-producto"
            >
              <ImagenSuelta
                illustration={producto.illustration}
                imagen={producto.imagen}
                className="size-12"
                claseFoto="size-12 rounded-full object-cover"
              />
              <p className="font-display flex-1 text-[16px] font-semibold">
                {t("disponibilidadDe", { producto: producto.title[locale] })}
              </p>
              <button
                type="button"
                onClick={() => setSinFiltro(true)}
                className="text-link inline-flex items-center gap-1 text-sm font-bold hover:underline"
              >
                <IconoCerrar className="size-4" />
                {t("quitarFiltro")}
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="lg:order-2">
              <div
                className="relative h-[380px] overflow-hidden rounded-[18px] shadow-[0_14px_34px_rgb(22_24_58/0.22)] ring-[6px] ring-white md:h-[580px] lg:sticky lg:top-[calc(var(--alto-arriba,100px)+20px)]"
                data-testid="mapa"
              >
                {hidratado ? (
                  <MapaTiendas
                    puntos={puntos}
                    foco={foco}
                    origen={origen}
                    vista={vista}
                    etiqueta={t("mapa")}
                    etiquetaOrigen={t("tuZip", { lugar })}
                    avisoZoom={t("zoomConTecla")}
                    alElegir={setFoco}
                  />
                ) : (
                  <div className="bg-surface h-full w-full animate-pulse" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFoco(null);
                    setVista(vista === "todas" ? "cerca" : "todas");
                  }}
                  className="pildora absolute top-3 right-3 z-[500] shadow-[0_6px_18px_rgb(22_24_58/0.22)]"
                  data-testid="ver-todo"
                >
                  <span aria-hidden="true" className="text-aqua-tinta size-4">
                    ✦
                  </span>
                  {vista === "todas" ? t("verCerca") : t("verTodo")}
                </button>
              </div>
            </div>

            <div className="lg:order-1">
              <p className="cejilla text-mandarina-tinta mb-6">
                {t("cuantas", { n: lista.length })} · {t("porDistancia")}
              </p>
              <ol className="relative grid gap-5 pl-11 md:pl-[70px]" data-testid="lista-tiendas">
                <span
                  aria-hidden="true"
                  className="border-ink/25 absolute top-3 bottom-3 left-[13px] border-l-2 border-dashed md:left-[27px]"
                />
                {lista.map((ti, i) => {
                  const destacada = masCercanaConStock?.id === ti.id;
                  const a = ACENTOS[i % ACENTOS.length];
                  return (
                    <li key={ti.id} data-testid={`ficha-${ti.id}`} className="relative">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "chispa absolute top-7 -left-[42px] text-[24px] md:-left-[56px] md:text-[28px]",
                          a.chispa,
                        )}
                      />
                      <div
                        className={cn(
                          // Toda la tarjeta se pulsa para verla en el mapa (review de usuario, 16-10).
                          "tarjeta-evento relative grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-2 p-5 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:gap-x-5 md:p-6",
                          destacada && "ring-stock ring-2",
                          foco === ti.id && "ring-aqua ring-2",
                        )}
                      >
                        <p className={cn("grid text-center", a.tinta)}>
                          <span className="font-display text-[24px] leading-none font-bold md:text-[34px]">
                            {Math.round(ti.millas).toLocaleString("en-US")}
                          </span>
                          <span className="cejilla text-ink/70 mt-1 text-[0.6rem]">mi</span>
                        </p>
                        <div className="min-w-0">
                          {destacada ? (
                            <p className="text-stock mb-1 text-[13px] font-bold">
                              {t("masCercana")}
                            </p>
                          ) : null}
                          <h2 className="font-display flex flex-wrap items-center gap-2 text-[19px] leading-tight font-semibold">
                            <button
                              type="button"
                              aria-pressed={foco === ti.id}
                              onClick={() => {
                                setFoco(ti.id);
                                document
                                  .querySelector('[data-testid="mapa"]')
                                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
                              }}
                              className="focus-visible:after:ring-ink text-left after:absolute after:inset-0 after:rounded-[18px] after:content-[''] focus-visible:outline-none focus-visible:after:ring-2"
                            >
                              {t("tienda", { ciudad: ti.city })}
                              <span className="sr-only"> · {t("verEnMapa")}</span>
                            </button>
                            <span className="bg-surface text-muted-ink rounded border px-1 font-sans text-[10px] font-extrabold">
                              DEMO
                            </span>
                          </h2>
                          {ti.unidades !== null ? (
                            <p
                              className={cn(
                                "mt-1 font-bold",
                                ti.unidades > 0 ? "text-stock" : "text-out",
                              )}
                            >
                              {ti.unidades > 0 ? t("tieneStock", { n: ti.unidades }) : t("agotado")}
                            </p>
                          ) : (
                            <p className="text-stock mt-1 text-sm font-bold">
                              {t("productosEnTienda", { n: ti.conStock })}
                            </p>
                          )}
                          <p className="mt-1 text-sm">{ti.address}</p>
                          <p className="text-muted-ink mt-1 flex items-center gap-1.5 text-sm">
                            <IconoReloj className="size-3.5" />
                            {ti.hours[locale]}
                          </p>
                          <p className="text-muted-ink flex items-center gap-1.5 text-sm">
                            <IconoTelefono className="size-3.5" />
                            {ti.phone}
                          </p>
                          {/* Encima de la tarjeta pulsable: «Cómo llegar» sigue abriendo Google Maps. */}
                          <a
                            href={enlaceComoLlegar(ti.lat, ti.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-link relative z-10 mt-2 inline-flex items-center gap-1 text-sm font-bold hover:underline"
                          >
                            <IconoRumbo className="size-3.5" />
                            {t("comoLlegar")}
                          </a>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
          {producto ? (
            <p className="mt-8">
              <Link
                href={`/p/${producto.slug}`}
                className="text-link text-sm font-bold hover:underline"
              >
                ‹ {producto.title[locale]}
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}

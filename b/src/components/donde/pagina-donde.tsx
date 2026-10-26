"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Globe2, LocateFixed, MapPin, Navigation, Phone, Search, X } from "lucide-react";
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

/**
 * Dónde comprar (rediseño del 26-10). Pedido de la clienta: un mapa más amable, que se acerque solo al escribir el ZIP
 * y que se pueda alejar hasta ver todo EE. UU. Aquí: un buscador por ZIP grande, el mapa que se acerca al ZIP y sus
 * tiendas, «Ver todo EE. UU.» y la lista ordenada por distancia.
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
    <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6 md:pt-6">
      <section
        className="noche relative overflow-hidden rounded-[28px] p-6 md:p-10"
        aria-labelledby="donde-titulo"
      >
        <span aria-hidden="true" className="chispa absolute top-8 right-10 text-[16px]" />
        <span
          aria-hidden="true"
          className="chispa absolute right-[30%] bottom-8 hidden text-[10px] md:block"
        />
        <p className="cejilla text-aqua">{t("cejilla")}</p>
        <h1
          id="donde-titulo"
          className="font-magia mt-3 text-[30px] leading-[1.14] font-bold md:text-[46px]"
        >
          {t("tituloCuento")}
        </h1>
        <p className="text-crema/80 mt-3 max-w-xl">{t("texto")}</p>

        <form
          className="mt-6 flex max-w-2xl flex-wrap gap-2.5"
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
            // Buscar suelta la tienda enfocada y vuelve al encuadre del ZIP (en la review de usuario del 16-10, «Buscar»
            // dejaba el mapa quieto en la última tienda pulsada).
            setFoco(null);
            setVista("cerca");
          }}
        >
          <label className="relative min-w-0 flex-1 basis-56" htmlFor="zip-tiendas">
            <span className="sr-only">{t("zip")}</span>
            <MapPin
              aria-hidden="true"
              className="text-aqua-tinta pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
            />
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
              className="rounded-chip bg-crema font-display text-noche placeholder:text-muted-ink h-14 w-full border-0 pr-4 pl-12 text-[19px] font-semibold tracking-[0.14em] placeholder:font-sans placeholder:text-[15px] placeholder:tracking-normal"
              data-testid="zip-tiendas"
            />
          </label>
          <button type="submit" className="placa min-h-14" data-testid="buscar-tiendas">
            <Search aria-hidden="true" className="size-4" />
            {t("buscar")}
          </button>
          <button
            type="button"
            onClick={usarUbicacion}
            disabled={ubicando}
            className="placa placa-contorno text-crema min-h-14 disabled:opacity-60"
          >
            <LocateFixed aria-hidden="true" className="size-4" />
            {ubicando ? t("ubicando") : t("cercaDeMi")}
          </button>
        </form>
        {error ? (
          <p
            id="error-zip-tiendas"
            role="alert"
            className="mt-3 text-sm font-semibold text-[#ffb59a]"
          >
            {error}
          </p>
        ) : (
          <p id="lugar-zip-tiendas" className="text-crema/75 mt-3 text-[14px]">
            {t("desde", { lugar })} ·{" "}
            <span className="text-calendula font-semibold">{t("demo")}</span>
          </p>
        )}
      </section>

      {producto ? (
        <div
          className="rounded-card shadow-tarjeta mt-5 flex flex-wrap items-center gap-3 bg-white p-3"
          data-testid="filtro-producto"
        >
          <ImagenSuelta
            illustration={producto.illustration}
            imagen={producto.imagen}
            className="size-12"
            claseFoto="size-12 rounded-md object-cover"
          />
          <p className="flex-1 text-sm font-bold">
            {t("disponibilidadDe", { producto: producto.title[locale] })}
          </p>
          <button
            type="button"
            onClick={() => setSinFiltro(true)}
            className="text-link inline-flex items-center gap-1 text-sm font-bold hover:underline"
          >
            <X className="size-4" aria-hidden="true" />
            {t("quitarFiltro")}
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="lg:order-2">
          <div
            className="rounded-card shadow-tarjeta relative h-[360px] overflow-hidden ring-4 ring-white md:h-[560px] lg:sticky lg:top-[calc(var(--alto-arriba,100px)+16px)]"
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
              className="rounded-chip font-display text-ink hover:bg-crema absolute top-3 right-3 z-[500] inline-flex h-10 items-center gap-2 bg-white px-4 text-[14px] font-semibold shadow-[0_6px_18px_rgb(22_24_58/0.18)]"
              data-testid="ver-todo"
            >
              <Globe2 aria-hidden="true" className="text-aqua-tinta size-4" />
              {vista === "todas" ? t("verCerca") : t("verTodo")}
            </button>
          </div>
        </div>

        <div className="lg:order-1">
          <p className="font-display mb-3 text-[15px] font-semibold">
            {t("cuantas", { n: lista.length })}{" "}
            <span className="text-muted-ink font-sans font-normal">· {t("porDistancia")}</span>
          </p>
          <ul className="grid content-start gap-3" data-testid="lista-tiendas">
            {lista.map((ti, i) => {
              const destacada = masCercanaConStock?.id === ti.id;
              return (
                <li
                  key={ti.id}
                  data-testid={`ficha-${ti.id}`}
                  className={cn(
                    // Toda la ficha se pulsa para verla en el mapa, y se levanta un poco al pasar por encima (review de
                    // usuario, 16-10).
                    "rounded-card shadow-tarjeta relative cursor-pointer bg-white p-4 transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                    destacada && "ring-stock ring-2",
                    foco === ti.id && "ring-aqua ring-2",
                  )}
                >
                  {destacada ? (
                    <p className="text-stock mb-1 text-[13px] font-bold">{t("masCercana")}</p>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="bg-noche font-display text-crema grid size-9 shrink-0 place-items-center rounded-full text-[15px] font-semibold"
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-display flex flex-wrap items-center gap-2 text-[17px] font-semibold">
                          <button
                            type="button"
                            aria-pressed={foco === ti.id}
                            onClick={() => {
                              setFoco(ti.id);
                              document
                                .querySelector('[data-testid="mapa"]')
                                ?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                            className="after:rounded-card focus-visible:after:ring-ink text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2"
                          >
                            {t("tienda", { ciudad: ti.city })}
                            <span className="sr-only"> · {t("verEnMapa")}</span>
                          </button>
                          <span className="bg-surface text-muted-ink rounded border px-1 font-sans text-[10px] font-extrabold">
                            DEMO
                          </span>
                        </h2>
                        <span className="rounded-chip bg-tint-cielo text-aqua-tinta shrink-0 px-2 py-0.5 text-[12.5px] font-bold">
                          {t("distancia", { n: Math.round(ti.millas).toLocaleString("en-US") })}
                        </span>
                      </div>
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
                        <Clock className="size-3.5" aria-hidden="true" />
                        {ti.hours[locale]}
                      </p>
                      <p className="text-muted-ink flex items-center gap-1.5 text-sm">
                        <Phone className="size-3.5" aria-hidden="true" />
                        {ti.phone}
                      </p>
                      {/* Encima de la ficha pulsable: «Cómo llegar» sigue abriendo Google Maps. */}
                      <a
                        href={enlaceComoLlegar(ti.lat, ti.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link relative z-10 mt-2 inline-flex items-center gap-1 text-sm font-bold hover:underline"
                      >
                        <Navigation className="size-3.5" aria-hidden="true" />
                        {t("comoLlegar")}
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {producto ? (
        <p className="mt-6">
          <Link
            href={`/p/${producto.slug}`}
            className="text-link text-sm font-bold hover:underline"
          >
            ‹ {producto.title[locale]}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

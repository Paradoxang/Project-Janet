"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, LocateFixed, MapPin, Navigation, Phone, X } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { enlaceComoLlegar } from "@/components/producto/disponibilidad-tienda";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import type { Idioma, Tienda } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { coordenadasDeZip, distanciaMillas, lugarDeZip, zipValido, type Coordenadas } from "@/lib/zip";
import { usePreferencias, ZIP_INICIAL } from "@/stores/preferencias";
import type { PuntoMapa } from "./mapa-tiendas";

const MapaTiendas = dynamic(() => import("./mapa-tiendas"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-card bg-surface" />,
});

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
  const [sinFiltro, setSinFiltro] = useState(false);
  // ?producto=… se lee al montar: así la página sale completa en el HTML estático (sin saltos).
  const [slugUrl, setSlugUrl] = useState<string | null>(null);
  useEffect(() => setSlugUrl(new URLSearchParams(window.location.search).get("producto")), []);

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
      },
      () => {
        setUbicando(false);
        setError(t("sinUbicacion"));
      },
      { timeout: 8000 },
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6">
      <h1 className="text-[28px] md:text-4xl">{t("titulo")}</h1>
      <p className="mt-1 text-muted-ink">{t("texto")}</p>
      <p className="mt-1 text-[13px] font-semibold text-muted-ink">{t("demo")}</p>

      <form
        className="mt-4 flex flex-wrap gap-2"
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
        }}
      >
        <label className="sr-only" htmlFor="zip-tiendas">
          {t("zip")}
        </label>
        <Input
          id="zip-tiendas"
          inputMode="numeric"
          maxLength={5}
          placeholder={t("zip")}
          value={borrador ?? zip}
          onChange={(e) => setBorrador(e.target.value.replace(/\D/g, ""))}
          className="h-11 w-36"
          data-testid="zip-tiendas"
        />
        <Button type="submit" variant="cta" size="lg" className="h-11" data-testid="buscar-tiendas">
          {t("buscar")}
        </Button>
        <Button type="button" variant="outline" size="lg" className="h-11" onClick={usarUbicacion} disabled={ubicando}>
          <LocateFixed aria-hidden="true" />
          {ubicando ? t("ubicando") : t("cercaDeMi")}
        </Button>
      </form>
      {error ? <p className="mt-2 text-sm text-out">{error}</p> : null}
      <p className="mt-2 text-[13px] text-muted-ink">
        {t("desde", { lugar: gps ? t("tuUbicacion") : `${lugarDeZip(zip) ?? ""} ${zip}`.trim() })}
      </p>

      {producto ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card bg-warm p-3" data-testid="filtro-producto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/productos/${producto.illustration}.svg`} alt="" className="size-12" />
          <p className="flex-1 text-sm font-bold">{t("disponibilidadDe", { producto: producto.title[locale] })}</p>
          <button
            type="button"
            onClick={() => setSinFiltro(true)}
            className="inline-flex items-center gap-1 text-sm font-bold text-link hover:underline"
          >
            <X className="size-4" aria-hidden="true" />
            {t("quitarFiltro")}
          </button>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="h-[340px] overflow-hidden rounded-card shadow-tarjeta md:h-[520px]" data-testid="mapa">
          {hidratado ? (
            <MapaTiendas puntos={puntos} foco={foco} etiqueta={t("mapa")} alElegir={setFoco} />
          ) : (
            <div className="h-full w-full animate-pulse bg-surface" />
          )}
        </div>

        <ul className="grid content-start gap-3" data-testid="lista-tiendas">
          {lista.map((ti) => {
            const destacada = masCercanaConStock?.id === ti.id;
            return (
              <li
                key={ti.id}
                data-testid={`ficha-${ti.id}`}
                className={cn("rounded-card bg-white p-4 shadow-tarjeta", destacada && "ring-2 ring-stock", foco === ti.id && "bg-surface")}
              >
                {destacada ? (
                  <p className="mb-1 text-xs font-extrabold tracking-wide text-stock uppercase">{t("masCercana")}</p>
                ) : null}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-lg">
                    <MapPin className="size-4" aria-hidden="true" />
                    {t("tienda", { ciudad: ti.city })}
                    <span className="rounded border bg-surface px-1 font-sans text-[10px] font-extrabold text-muted-ink">
                      DEMO
                    </span>
                  </h2>
                  <span className="shrink-0 text-[13px] text-muted-ink">
                    {t("distancia", { n: Math.round(ti.millas).toLocaleString("en-US") })}
                  </span>
                </div>
                {ti.unidades !== null ? (
                  <p className={cn("mt-1 font-bold", ti.unidades > 0 ? "text-stock" : "text-out")}>
                    {ti.unidades > 0 ? t("tieneStock", { n: ti.unidades }) : t("agotado")}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-bold text-stock">{t("productosEnTienda", { n: ti.conStock })}</p>
                )}
                <p className="mt-1 text-sm">{ti.address}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-ink">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {ti.hours[locale]}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-muted-ink">
                  <Phone className="size-3.5" aria-hidden="true" />
                  {ti.phone}
                </p>
                <div className="mt-2 flex flex-wrap gap-4">
                  <a
                    href={enlaceComoLlegar(ti.lat, ti.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-link hover:underline"
                  >
                    <Navigation className="size-3.5" aria-hidden="true" />
                    {t("comoLlegar")}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setFoco(ti.id);
                      document.querySelector('[data-testid="mapa"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="text-sm font-bold text-link hover:underline"
                  >
                    {t("verEnMapa")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {producto ? (
        <p className="mt-6">
          <Link href={`/p/${producto.slug}`} className="text-sm font-bold text-link hover:underline">
            ‹ {producto.title[locale]}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

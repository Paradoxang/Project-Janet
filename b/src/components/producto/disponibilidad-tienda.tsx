"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Navigation, Store } from "lucide-react";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import type { Idioma, Texto } from "@/lib/tipos";
import { coordenadasDeZip, distanciaMillas, lugarDeZip, zipValido } from "@/lib/zip";
import { usePreferencias, ZIP_INICIAL } from "@/stores/preferencias";

export interface TiendaProducto {
  id: string;
  city: string;
  state: string;
  address: string;
  lat: number;
  lng: number;
  hours: Texto;
  unidades: number;
}

export function enlaceComoLlegar(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * «Check nearby stock» (rediseño del 26-10, como en la ficha de la propuesta en Figma): se escribe el ZIP aquí mismo y salen las tres
 * tiendas más cercanas con su stock; si la más cercana no lo tiene, la más cercana que sí. Cada tienda lleva al mapa.
 */
export function DisponibilidadTienda({
  tiendas,
  slug,
}: {
  tiendas: TiendaProducto[];
  slug: string;
}) {
  const t = useTranslations("producto");
  const locale = useLocale() as Idioma;
  const hidratado = useHidratado();
  const zipGuardado = usePreferencias((s) => s.zip);
  const setZip = usePreferencias((s) => s.setZip);
  const zip = hidratado ? zipGuardado : ZIP_INICIAL;
  const [borrador, setBorrador] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const origen = coordenadasDeZip(zip);

  const ordenadas = tiendas
    .map((ti) => ({ ...ti, millas: origen ? distanciaMillas(origen, ti) : 0 }))
    .sort((a, b) => a.millas - b.millas);
  const conStock = ordenadas.find((ti) => ti.unidades > 0);
  const lista = ordenadas.slice(0, 3);

  return (
    <section
      className="rounded-card shadow-tarjeta grid gap-6 bg-white p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-8"
      aria-labelledby="disponibilidad"
      data-testid="disponibilidad"
    >
      <div className="grid content-start gap-3">
        <p className="cejilla text-aqua-tinta">{t("disponibilidadCejilla")}</p>
        <h2
          id="disponibilidad"
          className="font-magia text-[22px] leading-tight font-bold md:text-[26px]"
        >
          {t("disponibilidad")}
        </h2>
        <form
          className="mt-1 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const valor = (borrador ?? zip).trim();
            if (!zipValido(valor)) {
              setError(true);
              return;
            }
            setZip(valor);
            setBorrador(null);
            setError(false);
          }}
        >
          <label htmlFor="zip-ficha" className="sr-only">
            {t("zipEtiqueta")}
          </label>
          <input
            id="zip-ficha"
            inputMode="numeric"
            maxLength={5}
            autoComplete="postal-code"
            value={borrador ?? zip}
            onChange={(e) => setBorrador(e.target.value.replace(/\D/g, ""))}
            aria-invalid={error}
            aria-describedby={error ? "zip-ficha-error" : undefined}
            className="rounded-chip border-input font-display h-11 w-32 border bg-white px-4 text-[16px] font-semibold tracking-[0.12em]"
            data-testid="zip-ficha"
          />
          <button type="submit" className="placa placa-noche min-h-11 px-5 py-0">
            {t("zipBuscar")}
          </button>
        </form>
        {error ? (
          <p id="zip-ficha-error" className="text-out text-[13px] font-semibold">
            {t("zipInvalido")}
          </p>
        ) : (
          <p className="text-muted-ink text-[13px]">
            {t("cercaDe", { lugar: `${lugarDeZip(zip) ?? ""} ${zip}`.trim() })}
          </p>
        )}
        <Link
          href={{ pathname: "/where-to-buy", query: { producto: slug } }}
          className="text-link mt-1 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
        >
          <MapPin className="size-4" aria-hidden="true" />
          {t("verMapa")}
        </Link>
      </div>

      <div className="grid content-start gap-2.5">
        {/* Cada tienda lleva al mapa con ella enfocada (review de usuario, 16-10: «4 disponibles… clic… ver mapa»). */}
        <ul className="grid gap-2">
          {lista.map((ti) => (
            <li key={ti.id} data-testid={`tienda-${ti.id}`}>
              <Link
                href={{ pathname: "/where-to-buy", query: { producto: slug, tienda: ti.id } }}
                className="border-line hover:border-aqua-tinta hover:bg-tint-cielo/40 flex items-center gap-3 rounded-[14px] border px-4 py-3"
              >
                <Store aria-hidden="true" className="text-aqua-tinta size-5 shrink-0" />
                <span className="grid min-w-0 flex-1">
                  <span className="font-display flex flex-wrap items-center gap-1.5 text-[15px] font-semibold">
                    {ti.city}, {ti.state}
                    <span className="bg-surface text-muted-ink rounded border px-1 font-sans text-[10px] font-extrabold">
                      {t("tiendaDemo")}
                    </span>
                  </span>
                  <span className="text-muted-ink text-[13px]">
                    {t("millas", { n: Math.round(ti.millas).toLocaleString("en-US") })}
                  </span>
                </span>
                <span
                  className={`text-right text-[13.5px] font-bold ${ti.unidades > 0 ? "text-stock" : "text-out"}`}
                >
                  {ti.unidades > 0 ? t("enTienda", { n: ti.unidades }) : t("agotadoEnTienda")}
                </span>
                <span className="sr-only"> · {t("verEnMapa")}</span>
              </Link>
            </li>
          ))}
        </ul>

        {conStock && lista[0] && lista[0].unidades === 0 ? (
          <div
            className="bg-tint-menta/60 rounded-[14px] p-4 text-sm"
            data-testid="tienda-con-stock"
          >
            <p className="font-bold">{t("masCercana")}</p>
            <p className="mt-0.5">
              <b>{conStock.city}</b> ({t("enTienda", { n: conStock.unidades })}) ·{" "}
              {conStock.address}
            </p>
            <p className="text-muted-ink">{conStock.hours[locale]}</p>
            <a
              href={enlaceComoLlegar(conStock.lat, conStock.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link mt-1 inline-flex items-center gap-1 font-bold hover:underline"
            >
              <Navigation className="size-3.5" aria-hidden="true" />
              {t("comoLlegar")}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

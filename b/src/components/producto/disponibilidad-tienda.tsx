"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconoPin, IconoRumbo } from "@/components/cuento/iconos";
import { Cielo } from "@/components/cuento/cielo";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import type { Idioma, Texto } from "@/lib/tipos";
import { cn } from "@/lib/utils";
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
 * «Check nearby stock» (la ficha de la propuesta en Figma), dibujado con el canon: una tarjeta azul noche con su cielo,
 * el ZIP en el campo del boletín y las tres tiendas más cercanas con la distancia grande, como los eventos del canon.
 * Si la más cercana no lo tiene, sale la más cercana que sí. Cada tienda lleva al mapa.
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
      className="noche relative grid gap-10 overflow-hidden rounded-[18px] p-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-10"
      aria-labelledby="disponibilidad"
      data-testid="disponibilidad"
    >
      <Cielo cantidad={28} semilla={53} />
      <div className="relative grid content-start gap-4">
        <p className="cejilla text-aqua flex items-center gap-2">
          <span aria-hidden="true" className="chispa bg-aqua text-[10px]" />
          {t("disponibilidadCejilla")}
        </p>
        <h2
          id="disponibilidad"
          className="titulo-cuento text-crema text-[clamp(1.6rem,3vw,2.4rem)]"
        >
          {t("disponibilidad")}
        </h2>
        <form
          className="mt-2 flex flex-wrap items-end gap-3"
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
            className="campo-boletin max-w-44 flex-1 tracking-[0.18em]"
            data-testid="zip-ficha"
          />
          <button type="submit" className="placa">
            {t("zipBuscar")} <span aria-hidden="true">✦</span>
          </button>
        </form>
        {error ? (
          <p id="zip-ficha-error" role="alert" className="text-calendula text-[14px] font-semibold">
            {t("zipInvalido")}
          </p>
        ) : (
          <p className="text-crema/75 text-[14px]">
            {t("cercaDe", { lugar: `${lugarDeZip(zip) ?? ""} ${zip}`.trim() })}
          </p>
        )}
        <Link
          href={{ pathname: "/where-to-buy", query: { producto: slug } }}
          className="text-aqua inline-flex items-center gap-1.5 text-[15px] font-bold underline-offset-4 hover:underline"
        >
          <IconoPin className="size-4" />
          {t("verMapa")}
        </Link>
      </div>

      <div className="relative grid content-start gap-3">
        {/* Cada tienda lleva al mapa con ella enfocada (review de usuario, 16-10: «4 disponibles… clic… ver mapa»). */}
        <ul className="grid gap-3">
          {lista.map((ti) => (
            <li key={ti.id} data-testid={`tienda-${ti.id}`}>
              <Link
                href={{ pathname: "/where-to-buy", query: { producto: slug, tienda: ti.id } }}
                className="bg-crema/[0.07] ring-crema/15 hover:bg-crema/[0.12] grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[14px] px-5 py-4 ring-1"
              >
                <span className="text-calendula grid">
                  <span className="font-display text-[28px] leading-none font-bold">
                    {Math.round(ti.millas).toLocaleString("en-US")}
                  </span>
                  <span className="cejilla text-crema/75 text-[0.6rem]">mi</span>
                </span>
                <span className="grid min-w-0">
                  <span className="font-display text-crema flex flex-wrap items-center gap-1.5 text-[16px] font-semibold">
                    {ti.city}, {ti.state}
                    <span className="border-crema/30 text-crema/80 rounded border px-1 font-sans text-[10px] font-extrabold">
                      {t("tiendaDemo")}
                    </span>
                  </span>
                  <span className="text-crema/75 truncate text-[13px]">{ti.address}</span>
                </span>
                <span
                  className={cn(
                    "text-right text-[13.5px] font-bold",
                    ti.unidades > 0 ? "text-aqua" : "text-calendula",
                  )}
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
            className="bg-crema text-ink rounded-[14px] p-4 text-sm"
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
              <IconoRumbo className="size-3.5" />
              {t("comoLlegar")}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

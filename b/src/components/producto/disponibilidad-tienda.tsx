"use client";

import { useLocale, useTranslations } from "next-intl";
import { MapPin, Navigation } from "lucide-react";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import type { Idioma, Texto } from "@/lib/tipos";
import { coordenadasDeZip, distanciaMillas } from "@/lib/zip";
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

/** «Check store availability»: la tienda más cercana y, si allí no hay, la más cercana que sí lo tiene. */
export function DisponibilidadTienda({ tiendas, slug }: { tiendas: TiendaProducto[]; slug: string }) {
  const t = useTranslations("producto");
  const locale = useLocale() as Idioma;
  const hidratado = useHidratado();
  const zipGuardado = usePreferencias((s) => s.zip);
  const zip = hidratado ? zipGuardado : ZIP_INICIAL;
  const origen = coordenadasDeZip(zip);

  const ordenadas = tiendas
    .map((ti) => ({ ...ti, millas: origen ? distanciaMillas(origen, ti) : 0 }))
    .sort((a, b) => a.millas - b.millas);
  const conStock = ordenadas.find((ti) => ti.unidades > 0);
  const lista = ordenadas.slice(0, 3);

  return (
    <section className="rounded-card border p-4" aria-labelledby="disponibilidad" data-testid="disponibilidad">
      <h2 id="disponibilidad" className="flex items-center gap-2 text-lg">
        <MapPin className="size-5" aria-hidden="true" />
        {t("disponibilidad")}
      </h2>
      <ul className="mt-3 grid gap-2 text-sm">
        {lista.map((ti) => (
          <li key={ti.id} className="flex items-center gap-2" data-testid={`tienda-${ti.id}`}>
            <span
              className={`size-2.5 shrink-0 rounded-full ${ti.unidades > 0 ? "bg-stock" : "bg-out"}`}
              aria-hidden="true"
            />
            <span className="font-semibold">{ti.city}</span>
            <span className="rounded border bg-surface px-1 text-[10px] font-extrabold text-muted-ink">
              {t("tiendaDemo")}
            </span>
            <span className="text-muted-ink">· {t("millas", { n: Math.round(ti.millas).toLocaleString("en-US") })}</span>
            <span className={`ml-auto font-bold ${ti.unidades > 0 ? "text-stock" : "text-out"}`}>
              {ti.unidades > 0 ? t("enTienda", { n: ti.unidades }) : t("agotadoEnTienda")}
            </span>
          </li>
        ))}
      </ul>

      {conStock && lista[0] && lista[0].unidades === 0 ? (
        <div className="mt-3 rounded-md bg-surface p-3 text-sm" data-testid="tienda-con-stock">
          <p className="font-bold">{t("masCercana")}</p>
          <p className="mt-0.5">
            <b>{conStock.city}</b> ({t("enTienda", { n: conStock.unidades })}) · {conStock.address}
          </p>
          <p className="text-muted-ink">{conStock.hours[locale]}</p>
          <a
            href={enlaceComoLlegar(conStock.lat, conStock.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-bold text-link hover:underline"
          >
            <Navigation className="size-3.5" aria-hidden="true" />
            {t("comoLlegar")}
          </a>
        </div>
      ) : null}

      <Link
        href={{ pathname: "/where-to-buy", query: { producto: slug } }}
        className="mt-3 inline-block text-sm font-bold text-link hover:underline"
      >
        {t("verMapa")} ›
      </Link>
    </section>
  );
}

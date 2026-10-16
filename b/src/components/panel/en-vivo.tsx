"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Eye, Search, ShoppingBag, ShoppingCart, Store } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { resumirActividad, type TipoEvento } from "@/lib/actividad";
import { aDolares } from "@/lib/formato";
import type { Idioma } from "@/lib/tipos";
import { useActividad } from "@/stores/actividad";
import { useFormatos } from "./piezas";

const ICONO: Record<TipoEvento, typeof Eye> = {
  visita: Store,
  producto: Eye,
  carrito: ShoppingCart,
  compra: ShoppingBag,
  busqueda: Search,
};

/** «En vivo»: lo que se hizo en la tienda desde este navegador (visitas, fichas, carrito, compras). */
export function EnVivo() {
  const t = useTranslations("panel.enVivo");
  const locale = useLocale() as Idioma;
  const { porId } = useCatalogo();
  const { dinero, numero, pct } = useFormatos();
  const eventos = useActividad((s) => s.eventos);
  const borrar = useActividad((s) => s.borrar);
  const [ahora, setAhora] = useState(() => Date.now());

  // Si la tienda está abierta en otra pestaña, lo que pase ahí también llega aquí.
  useEffect(() => {
    const alCambiar = (e: StorageEvent) => {
      if (e.key === "actividad") void useActividad.persist.rehydrate();
    };
    window.addEventListener("storage", alCambiar);
    const reloj = setInterval(() => setAhora(Date.now()), 30_000);
    return () => {
      window.removeEventListener("storage", alCambiar);
      clearInterval(reloj);
    };
  }, []);

  const r = resumirActividad(eventos);
  // Las visitas se cuentan arriba; en la lista solo va lo que dice algo (fichas, carrito, compras, búsquedas).
  const recientes = eventos.filter((e) => e.tipo !== "visita").slice(0, 6);
  const relativo = new Intl.RelativeTimeFormat(locale === "es" ? "es" : "en", { numeric: "auto" });
  const hace = (fecha: string) => {
    const segundos = Math.round((new Date(fecha).getTime() - ahora) / 1000);
    if (segundos > -45) return relativo.format(0, "second");
    if (segundos > -3600) return relativo.format(Math.round(segundos / 60), "minute");
    return relativo.format(Math.round(segundos / 3600), "hour");
  };
  const nombre = (id?: string) => (id ? (porId.get(id)?.title[locale] ?? id) : "");

  const cifras: [string, string][] = [
    [t("visitas"), numero(r.visitas)],
    [t("productos"), numero(r.productos)],
    [t("carrito"), numero(r.carrito)],
    [t("compras"), numero(r.compras)],
    [t("ventas"), dinero(aDolares(r.ventas), 2)],
    [t("conversion"), pct(r.conversion)],
  ];

  return (
    <section
      id="en-vivo"
      aria-labelledby="titulo-en-vivo"
      className="scroll-mt-14 rounded-card border-2 border-stock/30 bg-white p-4 shadow-tarjeta md:p-5"
      data-testid="en-vivo"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="titulo-en-vivo" className="flex items-center gap-2 text-xl md:text-2xl">
            <span className="relative flex size-3" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-stock opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-3 rounded-full bg-stock" />
            </span>
            {t("titulo")}
          </h2>
          <p className="mt-1 text-sm text-muted-ink">{t("texto")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">{t("verTienda")}</Link>
          </Button>
          {eventos.length > 0 ? (
            <Button type="button" variant="outline" size="sm" onClick={borrar} data-testid="borrar-actividad">
              {t("borrar")}
            </Button>
          ) : null}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
        {cifras.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="rounded-md bg-surface px-3 py-2">
            <dt className="text-xs font-bold text-muted-ink">{etiqueta}</dt>
            <dd className="font-sans text-2xl font-extrabold tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>

      {recientes.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed p-3 text-sm text-muted-ink">{t("vacio")}</p>
      ) : (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-muted-ink">{t("ultimos")}</h3>
          <ol className="mt-2 grid gap-1.5" data-testid="ultimos-eventos">
            {recientes.map((e, i) => {
              const Icono = ICONO[e.tipo];
              return (
                <li key={`${e.fecha}-${i}`} className="flex items-center gap-2 text-sm">
                  <Icono className="size-4 shrink-0 text-muted-ink" aria-hidden="true" />
                  <span className="flex-1">
                    {t(`evento.${e.tipo}`, {
                      producto: nombre(e.producto),
                      monto: dinero(aDolares(e.total ?? 0), 2),
                      texto: e.texto ?? "",
                    })}
                  </span>
                  <span className="shrink-0 text-xs text-muted-ink">{hace(e.fecha)}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}

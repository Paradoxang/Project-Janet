"use client";

import { useLocale, useTranslations } from "next-intl";
import { Lightbulb, SearchX } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { srcProducto } from "@/lib/catalogo";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import type { Idioma, Panel } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Barra, Tarjeta, useFormatos } from "./piezas";

function Consejo({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-md bg-low/10 p-2.5 text-sm font-semibold text-ink">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-low" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Pedidos por hora del día, en barras. */
export function Horas({ horas }: { horas: Panel["hours"] }) {
  const t = useTranslations("panel");
  const locale = useLocale();
  const hora = (h: number) =>
    new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", { hour: "numeric" }).format(new Date(2026, 0, 1, h));
  const maximo = Math.max(...horas);
  const pico = horas.indexOf(maximo);
  const frase = t("fraseHoras", { desde: hora(pico), hasta: hora((pico + 1) % 24) });
  return (
    <Tarjeta id="titulo-horas" titulo={t("horas")} explicacion={t("explicaHoras")}>
      <p className="text-sm font-bold">{frase}</p>
      <figure aria-label={frase} className="grid gap-1">
        <div className="flex h-28 items-end gap-[3px]" aria-hidden="true">
          {horas.map((n, h) => (
            <span
              key={h}
              title={`${hora(h)}: ${n}`}
              className={cn("flex-1 rounded-t-sm", h === pico ? "bg-brand" : "bg-brand/35")}
              style={{ height: `${Math.max(4, (n / maximo) * 100)}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-muted-ink" aria-hidden="true">
          {[0, 6, 12, 18, 23].map((h) => (
            <span key={h}>{hora(h)}</span>
          ))}
        </div>
      </figure>
    </Tarjeta>
  );
}

export function Estados({ estados }: { estados: Panel["states"] }) {
  const t = useTranslations("panel");
  const { dinero, numero } = useFormatos();
  const maximo = Math.max(...estados.map((e) => e.orders));
  return (
    <Tarjeta id="titulo-estados" titulo={t("estados")} explicacion={t("explicaEstados")}>
      <ol className="grid gap-2.5">
        {estados.map((e) => (
          <li key={e.state} className="grid gap-1">
            <span className="flex justify-between gap-2 text-sm">
              <span className="font-bold">{e.state}</span>
              <span className="text-muted-ink tabular-nums">
                {t("pedidosMonto", { n: numero(e.orders), monto: dinero(e.revenue) })}
              </span>
            </span>
            <Barra valor={e.orders / maximo} />
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}

/** El más vendido, en grande. */
export function JugueteEstrella({ panel }: { panel: Panel }) {
  const t = useTranslations("panel");
  const locale = useLocale() as Idioma;
  const { porId } = useCatalogo();
  const { dinero, numero } = useFormatos();
  const primero = panel.bestSellers[0];
  const p = primero ? porId.get(primero.productId) : undefined;
  const datos = panel.products.find((x) => x.productId === primero?.productId);
  if (!primero || !p || !datos) return null;
  return (
    <Tarjeta id="titulo-estrella" titulo={t("estrella")}>
      <div className="flex items-center gap-4" data-testid="juguete-estrella">
        <span className={cn("grid size-24 shrink-0 place-items-center rounded-card", FONDO_TINTE[p.tint])}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={srcProducto(p)} alt="" className="size-20" />
        </span>
        <div className="grid gap-1">
          <p className="font-display text-lg leading-snug">{p.title[locale]}</p>
          <p className="text-sm">
            {t("fraseEstrella", {
              n: numero(primero.units),
              monto: dinero(primero.revenue),
              conv: Math.round((datos.units / datos.views) * 100),
            })}
          </p>
        </div>
      </div>
    </Tarjeta>
  );
}

/** Clics, carrito y ventas de cada juguete, con el aviso del que se mira mucho y se vende poco. */
export function ClicsVentas({ productos }: { productos: Panel["products"] }) {
  const t = useTranslations("panel");
  const locale = useLocale() as Idioma;
  const { porId } = useCatalogo();
  const { dinero, numero, pct } = useFormatos();
  const filas = productos
    .filter((x) => porId.has(x.productId))
    .map((x) => ({ ...x, conversion: x.views ? x.units / x.views : 0 }))
    .sort((a, b) => b.views - a.views);
  const conversiones = filas.map((f) => f.conversion).sort((a, b) => a - b);
  const mediana = conversiones[Math.floor(conversiones.length / 2)] ?? 0;
  // Entre los 5 más mirados, el que convierte menos de la mitad de lo normal.
  const flojo = filas.slice(0, 5).find((f) => f.conversion < mediana / 2);

  return (
    <Tarjeta id="titulo-clics-ventas" titulo={t("clicsVentas")} explicacion={t("explicaClicsVentas")} className="lg:col-span-2">
      {flojo ? (
        <Consejo>
          {t("interesSinVentas", {
            producto: porId.get(flojo.productId)?.title[locale] ?? "",
            clics: numero(flojo.views),
            conv: pct(flojo.conversion),
          })}
        </Consejo>
      ) : null}
      {/* En el celular la tabla se desliza: la zona recibe el foco para poder moverla con el teclado. */}
      <div className="overflow-x-auto rounded-md" tabIndex={0} role="region" aria-labelledby="titulo-clics-ventas">
        <table className="w-full min-w-[560px] text-[13px] tabular-nums" data-testid="tabla-clics">
          <thead>
            <tr className="border-b text-left text-muted-ink">
              <th className="py-1.5 pr-2 font-bold">{t("producto")}</th>
              <th className="px-2 py-1.5 text-right font-bold">{t("columnas.clics")}</th>
              <th className="px-2 py-1.5 text-right font-bold">{t("columnas.carrito")}</th>
              <th className="px-2 py-1.5 text-right font-bold">{t("columnas.vendidos")}</th>
              <th className="px-2 py-1.5 text-right font-bold">{t("columnas.conversion")}</th>
              <th className="py-1.5 pl-2 text-right font-bold">{t("columnas.ingresos")}</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.productId} className={cn("border-b last:border-0", f === flojo && "bg-low/10")}>
                <th scope="row" className="max-w-[200px] truncate py-1.5 pr-2 text-left font-semibold">
                  {porId.get(f.productId)?.title[locale]}
                </th>
                <td className="px-2 py-1.5 text-right">{numero(f.views)}</td>
                <td className="px-2 py-1.5 text-right">{numero(f.addedToCart)}</td>
                <td className="px-2 py-1.5 text-right">{numero(f.units)}</td>
                <td className="px-2 py-1.5 text-right font-bold">{pct(f.conversion)}</td>
                <td className="py-1.5 pl-2 text-right">{dinero(f.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Tarjeta>
  );
}

export function Busquedas({ busquedas }: { busquedas: Panel["searches"] }) {
  const t = useTranslations("panel");
  const { numero } = useFormatos();
  const maximo = Math.max(...busquedas.map((b) => b.count));
  const faltan = busquedas.filter((b) => !b.results).map((b) => `«${b.term}»`);
  return (
    <Tarjeta id="titulo-busquedas" titulo={t("busquedas")} explicacion={t("explicaBusquedas")} className="lg:row-span-2">
      {faltan.length > 0 ? <Consejo>{t("teFaltan", { lista: faltan.join(", ") })}</Consejo> : null}
      <ol className="grid gap-2.5" data-testid="busquedas">
        {busquedas.map((b) => (
          <li key={b.term} className="grid gap-1">
            <span className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-1.5 font-semibold">
                {b.term}
                {!b.results ? (
                  <span className="inline-flex items-center gap-1 rounded-chip bg-out/10 px-1.5 py-0.5 text-[11px] font-bold text-out">
                    <SearchX className="size-3" aria-hidden="true" />
                    {t("sinResultados")}
                  </span>
                ) : null}
              </span>
              <span className="text-muted-ink tabular-nums">{t("veces", { n: numero(b.count) })}</span>
            </span>
            <Barra valor={b.count / maximo} className={b.results ? undefined : "bg-out/60"} />
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}

export function Origen({ fuentes }: { fuentes: Panel["sources"] }) {
  const t = useTranslations("panel");
  const { numero, pct } = useFormatos();
  const maximo = Math.max(...fuentes.map((f) => f.visitors));
  return (
    <Tarjeta id="titulo-origen" titulo={t("origen")} explicacion={t("explicaOrigen")}>
      <ol className="grid gap-2.5" data-testid="origen">
        {fuentes.map((f) => (
          <li key={f.source} className="grid gap-1">
            <span className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
              <span className="font-bold">{t(`fuentes.${f.source}`)}</span>
              <span className="text-muted-ink tabular-nums">
                {t("visitasPedidos", { visitas: numero(f.visitors), pedidos: numero(f.orders) })} ·{" "}
                <span className="font-bold text-ink">{t("compranPct", { pct: pct(f.orders / f.visitors) })}</span>
              </span>
            </span>
            <Barra valor={f.visitors / maximo} />
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}

export function Dispositivos({ dispositivos }: { dispositivos: Panel["devices"] }) {
  const t = useTranslations("panel");
  const { pct } = useFormatos();
  const total = dispositivos.reduce((s, d) => s + d.visitors, 0);
  return (
    <Tarjeta id="titulo-dispositivos" titulo={t("dispositivos")} explicacion={t("explicaDispositivos")}>
      <ul className="grid gap-2.5">
        {dispositivos.map((d) => (
          <li key={d.device} className="grid gap-1">
            <span className="flex justify-between gap-2 text-sm">
              <span className="font-bold">
                {t(`dispositivo.${d.device}`)} · {pct(d.visitors / total, 0)}
              </span>
              <span className="font-bold tabular-nums">{t("compranPct", { pct: pct(d.orders / d.visitors) })}</span>
            </span>
            <Barra valor={d.visitors / total} />
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

export function Clientes({ clientes }: { clientes: Panel["customers"] }) {
  const t = useTranslations("panel");
  const { numero, pct } = useFormatos();
  const total = clientes.newOrders + clientes.returningOrders;
  const deVuelta = clientes.returningOrders / total;
  return (
    <Tarjeta id="titulo-clientes-vuelta" titulo={t("clientes")} explicacion={t("explicaClientes")}>
      <p className="text-sm font-bold">{t("fraseClientes", { pct: pct(deVuelta, 0) })}</p>
      <div className="flex h-4 overflow-hidden rounded-full" aria-hidden="true">
        <span className="bg-brand/40" style={{ width: `${(1 - deVuelta) * 100}%` }} />
        <span className="bg-brand" style={{ width: `${deVuelta * 100}%` }} />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-ink">{t("nuevos")}</dt>
          <dd className="font-bold tabular-nums">{numero(clientes.newOrders)}</dd>
        </div>
        <div>
          <dt className="text-muted-ink">{t("deVuelta")}</dt>
          <dd className="font-bold tabular-nums">{numero(clientes.returningOrders)}</dd>
        </div>
      </dl>
    </Tarjeta>
  );
}

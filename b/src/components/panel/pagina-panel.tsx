"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, CircleAlert, Clock, Info, TriangleAlert } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { useHidratado } from "@/hooks/use-hidratado";
import type { AvisoPanel, Idioma, Panel, Tienda } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Mascota } from "@/marca/marca";
import { GraficoVentas, type PuntoVentas } from "./grafico-ventas";

const DIA_MS = 86_400_000;

function suma(lista: number[]) {
  return lista.reduce((a, b) => a + b, 0);
}

function QueSignifica({ texto }: { texto: string }) {
  const t = useTranslations("panel");
  return (
    <details className="group text-[13px]">
      <summary className="flex cursor-pointer list-none items-center gap-1 font-bold text-link [&::-webkit-details-marker]:hidden">
        <Info className="size-3.5" aria-hidden="true" />
        {t("queSignifica")}
      </summary>
      <p className="mt-1.5 rounded-md bg-surface p-2.5 leading-snug text-ink/90">{texto}</p>
    </details>
  );
}

function Kpi({
  titulo,
  valor,
  cambio,
  frase,
  explicacion,
}: {
  titulo: string;
  valor: string;
  cambio: number;
  frase: string;
  explicacion: string;
}) {
  const t = useTranslations("panel");
  const locale = useLocale();
  const pct = new Intl.NumberFormat(locale === "es" ? "es-US" : "en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(Math.abs(cambio));
  const sube = cambio >= 0;
  return (
    <article className="grid content-start gap-2 rounded-card border bg-white p-4" data-testid="kpi">
      <h3 className="font-sans text-sm font-bold text-muted-ink">{titulo}</h3>
      <p className="font-sans text-[34px] leading-none font-extrabold">{valor}</p>
      <p className={cn("flex items-center gap-1 text-[13px] font-bold", sube ? "text-stock" : "text-out")}>
        {sube ? <ArrowUpRight className="size-4" aria-hidden="true" /> : <ArrowDownRight className="size-4" aria-hidden="true" />}
        {sube ? t("sube", { pct }) : t("baja", { pct })}
      </p>
      <p className="text-sm">{frase}</p>
      <QueSignifica texto={explicacion} />
    </article>
  );
}

const ESTILO_AVISO: Record<AvisoPanel["severity"], { clase: string; Icono: typeof TriangleAlert }> = {
  high: { clase: "border-out/40 bg-out/5 text-out", Icono: CircleAlert },
  medium: { clase: "border-low/40 bg-low/5 text-low", Icono: TriangleAlert },
  low: { clase: "border-line bg-surface text-muted-ink", Icono: Clock },
};

export function PaginaPanel({ panel, tiendas }: { panel: Panel; tiendas: Tienda[] }) {
  const t = useTranslations("panel");
  const locale = useLocale() as Idioma;
  const hidratado = useHidratado();
  const { productos, porId } = useCatalogo();
  const fmt = (usd: number, dec = 0) =>
    new Intl.NumberFormat(locale === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: dec,
      minimumFractionDigits: dec,
    }).format(usd);

  const anterior = panel.days.slice(0, 30);
  const actual = panel.days.slice(30);
  const ventas = suma(actual.map((d) => d.sales));
  const ventasAntes = suma(anterior.map((d) => d.sales));
  const pedidos = suma(actual.map((d) => d.orders));
  const pedidosAntes = suma(anterior.map((d) => d.orders));
  const ticket = ventas / pedidos;
  const ticketAntes = ventasAntes / pedidosAntes;

  // Las fechas de ejemplo se reanclan para que el último día sea ayer.
  const ultimo = new Date(`${panel.days[panel.days.length - 1].date}T12:00:00`);
  const ayer = new Date();
  ayer.setHours(12, 0, 0, 0);
  ayer.setTime(ayer.getTime() - DIA_MS);
  const desfase = hidratado ? Math.round((ayer.getTime() - ultimo.getTime()) / DIA_MS) : 0;
  const fecha = (iso: string) => new Date(new Date(`${iso}T12:00:00`).getTime() + desfase * DIA_MS);
  const corta = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", { month: "short", day: "numeric" });
  const larga = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric" });

  const puntos: PuntoVentas[] = actual.map((d, i) => ({
    etiqueta: corta.format(fecha(d.date)),
    etiquetaLarga: larga.format(fecha(d.date)),
    actual: d.sales,
    anterior: anterior[i].sales,
  }));
  const mejor = actual.reduce((m, d) => (d.sales > m.sales ? d : m), actual[0]);

  const f = panel.funnel;
  const pasos = (["visitors", "productViews", "addedToCart", "checkout", "purchased"] as const).map((k) => ({
    clave: k,
    n: f[k],
    pct: f[k] / f.visitors,
  }));
  const deCada100 = (n: number) => Math.round((n / f.visitors) * 100);

  const maxVendidos = Math.max(...panel.bestSellers.map((b) => b.units));

  const filasStock = productos
    .map((p) => {
      const celdas = [p.stockOnline, ...tiendas.map((ti) => ti.stock[p.id] ?? 0)];
      const problemas = celdas.filter((n) => n <= 2).length;
      return { p, celdas, problemas };
    })
    .sort((a, b) => b.problemas - a.problemas || Number(b.p.bestSeller) - Number(a.p.bestSeller));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 md:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-chip bg-surface px-2 py-0.5 text-xs font-bold text-muted-ink">{t("demo")}</span>
          <h1 className="mt-2 text-[28px] md:text-4xl">{t("titulo")}</h1>
          <p className="mt-1 text-muted-ink">{t("subtitulo")}</p>
        </div>
        <Mascota variante="cara" className="size-16 shrink-0 md:size-20" />
      </div>

      <section className="mt-5 grid gap-3 md:grid-cols-3" aria-label={t("titulo")}>
        <Kpi
          titulo={t("ventas")}
          valor={fmt(ventas)}
          cambio={ventas / ventasAntes - 1}
          frase={t("fraseVentas", { monto: fmt(ventas) })}
          explicacion={t("explicaVentas")}
        />
        <Kpi
          titulo={t("pedidos")}
          valor={pedidos.toLocaleString("en-US")}
          cambio={pedidos / pedidosAntes - 1}
          frase={t("frasePedidos", { n: pedidos, dia: Math.round(pedidos / 30) })}
          explicacion={t("explicaPedidos")}
        />
        <Kpi
          titulo={t("ticket")}
          valor={fmt(ticket, 2)}
          cambio={ticket / ticketAntes - 1}
          frase={t("fraseTicket", { monto: fmt(ticket, 2) })}
          explicacion={t("explicaTicket")}
        />
      </section>

      <section className="mt-8" aria-labelledby="que-hago">
        <h2 id="que-hago" className="text-2xl">
          {t("queHago")}
        </h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2" data-testid="avisos">
          {panel.alerts.map((a) => {
            const { clase, Icono } = ESTILO_AVISO[a.severity];
            return (
              <li key={a.id} className={cn("grid gap-1.5 rounded-card border p-4", clase)}>
                <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide uppercase">
                  <Icono className="size-4" aria-hidden="true" />
                  {t(`prioridad.${a.severity}`)}
                </p>
                <p className="font-bold text-ink">{a.title[locale]}</p>
                <p className="text-sm text-ink/85">{a.body[locale]}</p>
                {a.href ? (
                  <a href={a.href} className="mt-1 text-sm font-bold text-link hover:underline">
                    → {a.action[locale]}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-bold text-ink">→ {a.action[locale]}</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 rounded-card border p-4 md:p-5" aria-labelledby="grafico">
        <h2 id="grafico" className="text-xl">
          {t("grafico")}
        </h2>
        <p className="mt-1 text-sm">
          {t("mejorDia", { dia: hidratado ? larga.format(fecha(mejor.date)) : "", monto: fmt(mejor.sales) })}
        </p>
        <div className="mt-3">{hidratado ? <GraficoVentas datos={puntos} /> : <div className="h-72" />}</div>
        <div className="mt-2">
          <QueSignifica texto={t("explicaGrafico")} />
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border p-4 md:p-5" aria-labelledby="embudo" id="embudo">
          <h2 id="titulo-embudo" className="text-xl">
            {t("camino")}
          </h2>
          <p className="mt-1 text-sm font-bold" data-testid="frase-camino">
            {t("caminoFrase", { carrito: deCada100(f.addedToCart), compran: deCada100(f.purchased) })}
          </p>
          <ol className="mt-4 grid gap-3">
            {pasos.map((p) => (
              <li key={p.clave} className="grid gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{t(`pasos.${p.clave}`)}</span>
                  <span className="text-muted-ink tabular-nums">
                    {t("personas", { n: p.n.toLocaleString("en-US") })} · {Math.round(p.pct * 1000) / 10}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-surface">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(1.5, p.pct * 100)}%` }} />
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-3">
            <QueSignifica texto={t("explicaCamino")} />
          </div>
        </section>

        <section className="rounded-card border p-4 md:p-5" aria-labelledby="mas-vendidos-panel">
          <h2 id="mas-vendidos-panel" className="text-xl">
            {t("masVendidos")}
          </h2>
          <ol className="mt-4 grid gap-3">
            {panel.bestSellers.map((b, i) => {
              const p = porId.get(b.productId);
              if (!p) return null;
              return (
                <li key={b.productId} className="flex items-center gap-3">
                  <span className="w-4 text-sm font-bold text-muted-ink">{i + 1}</span>
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-md", FONDO_TINTE[p.tint])}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/productos/${p.illustration}.svg`} alt="" className="size-9" />
                  </span>
                  <span className="grid flex-1 gap-1">
                    <span className="line-clamp-1 text-sm font-semibold">{p.title[locale]}</span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 rounded-full bg-brand" style={{ width: `${(b.units / maxVendidos) * 70}%` }} />
                      <span className="text-xs text-muted-ink tabular-nums">{t("vendidos", { n: b.units })}</span>
                    </span>
                  </span>
                  <span className="text-sm font-bold tabular-nums">{fmt(b.revenue)}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-3">
            <QueSignifica texto={t("explicaMasVendidos")} />
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-card border p-4 md:p-5" aria-labelledby="stock" id="stock">
        <h2 id="titulo-stock" className="text-xl">
          {t("stock")}
        </h2>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-out" aria-hidden="true" /> {t("agotado")}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-low" aria-hidden="true" /> {t("pocos")}
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-stock" aria-hidden="true" /> {t("bien")}
          </li>
        </ul>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] border-separate border-spacing-0.5 text-[13px] tabular-nums" data-testid="tabla-stock">
            <thead>
              <tr className="text-left text-muted-ink">
                <th className="px-2 py-1 font-bold">{t("producto")}</th>
                <th className="px-2 py-1 text-center font-bold">{t("bodega")}</th>
                {tiendas.map((ti) => (
                  <th key={ti.id} className="px-2 py-1 text-center font-bold">
                    {ti.city}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filasStock.map(({ p, celdas }) => (
                <tr key={p.id}>
                  <th scope="row" className="max-w-[180px] truncate px-2 py-1 text-left font-semibold">
                    {p.title[locale]}
                  </th>
                  {celdas.map((n, i) => (
                    <td
                      key={i}
                      className={cn(
                        "rounded-sm px-2 py-1 text-center font-bold",
                        n === 0 ? "bg-out/12 text-out" : n <= 2 ? "bg-low/12 text-low" : "bg-stock/10 text-stock",
                      )}
                    >
                      {n === 0 ? "0 ✕" : n}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <QueSignifica texto={t("explicaStock")} />
        </div>
      </section>
    </div>
  );
}

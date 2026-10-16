"use client";

import { useLocale, useTranslations } from "next-intl";
import { CircleAlert, Clock, TriangleAlert } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { useHidratado } from "@/hooks/use-hidratado";
import type { AvisoPanel, Idioma, Panel, Tienda } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Mascota } from "@/marca/marca";
import { EnVivo } from "./en-vivo";
import { GraficoVentas, type PuntoVentas } from "./grafico-ventas";
import { Kpi, Tarjeta, useFormatos } from "./piezas";
import { Busquedas, Clientes, ClicsVentas, Dispositivos, Estados, Horas, JugueteEstrella, Origen } from "./secciones";
import { ANCHO_PANEL } from "./solo-admin";

const DIA_MS = 86_400_000;

function suma(lista: number[]) {
  return lista.reduce((a, b) => a + b, 0);
}

const ESTILO_AVISO: Record<AvisoPanel["severity"], { clase: string; Icono: typeof TriangleAlert }> = {
  high: { clase: "border-out/40 bg-out/5 text-out", Icono: CircleAlert },
  medium: { clase: "border-low/40 bg-low/5 text-low", Icono: TriangleAlert },
  low: { clase: "border-line bg-surface text-muted-ink", Icono: Clock },
};

const SECCIONES = [
  ["resumen", "resumen"],
  ["enVivo", "en-vivo"],
  ["ventas", "ventas"],
  ["productos", "productos"],
  ["clientes", "clientes"],
  ["inventario", "inventario"],
] as const;

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`titulo-${id}`} className="mt-10 scroll-mt-14">
      <h2 id={`titulo-${id}`} className="mb-3 text-2xl">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function PaginaPanel({ panel, tiendas }: { panel: Panel; tiendas: Tienda[] }) {
  const t = useTranslations("panel");
  const locale = useLocale() as Idioma;
  const hidratado = useHidratado();
  const { productos, porId } = useCatalogo();
  const { dinero, numero, pct } = useFormatos();

  const anterior = panel.days.slice(0, 30);
  const actual = panel.days.slice(30);
  const ventas = suma(actual.map((d) => d.sales));
  const ventasAntes = suma(anterior.map((d) => d.sales));
  const pedidos = suma(actual.map((d) => d.orders));
  const pedidosAntes = suma(anterior.map((d) => d.orders));
  const visitas = suma(actual.map((d) => d.visitors));
  const visitasAntes = suma(anterior.map((d) => d.visitors));
  const ticket = ventas / pedidos;
  const ticketAntes = ventasAntes / pedidosAntes;
  const conversion = pedidos / visitas;
  const conversionAntes = pedidosAntes / visitasAntes;
  const f = panel.funnel;
  const abandonados = f.addedToCart - f.purchased;

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
  const unidades = suma(filasStock.flatMap((fila) => fila.celdas));
  const agotados = filasStock.filter((fila) => fila.celdas.includes(0)).length;
  const pocos = filasStock.filter((fila) => !fila.celdas.includes(0) && fila.celdas.some((n) => n <= 2)).length;

  return (
    <div className={cn(ANCHO_PANEL, "pt-5")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-chip bg-surface px-2 py-0.5 text-xs font-bold text-muted-ink">{t("demo")}</span>
          <h1 className="mt-2 text-[28px] md:text-4xl">{t("titulo")}</h1>
          <p className="mt-1 text-muted-ink">{t("subtitulo")}</p>
        </div>
        <Mascota variante="cara" className="size-16 shrink-0 md:size-20" />
      </div>

      <nav aria-label={t("irA")} className="mt-4">
        <ul className="relative flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECCIONES.map(([clave, ancla]) => (
            <li key={clave} className="shrink-0">
              <a
                href={`#${ancla}`}
                className="inline-flex h-8 items-center rounded-chip border bg-white px-3 text-[13px] font-bold hover:bg-surface"
              >
                {t(`nav.${clave}`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="resumen" aria-labelledby="titulo-resumen" className="mt-5 grid scroll-mt-14 gap-3">
        <h2 id="titulo-resumen" className="sr-only">
          {t("nav.resumen")}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Kpi
            titulo={t("ventas")}
            valor={dinero(ventas)}
            cambio={ventas / ventasAntes - 1}
            frase={t("fraseVentas", { monto: dinero(ventas) })}
            explicacion={t("explicaVentas")}
          />
          <Kpi
            titulo={t("pedidos")}
            valor={numero(pedidos)}
            cambio={pedidos / pedidosAntes - 1}
            frase={t("frasePedidos", { n: pedidos, dia: Math.round(pedidos / 30) })}
            explicacion={t("explicaPedidos")}
          />
          <Kpi
            titulo={t("ticket")}
            valor={dinero(ticket, 2)}
            cambio={ticket / ticketAntes - 1}
            frase={t("fraseTicket", { monto: dinero(ticket, 2) })}
            explicacion={t("explicaTicket")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            titulo={t("visitas")}
            valor={numero(visitas)}
            cambio={visitas / visitasAntes - 1}
            frase={t("fraseVisitas", { n: numero(visitas), dia: numero(Math.round(visitas / 30)) })}
            explicacion={t("explicaVisitas")}
          />
          <Kpi
            titulo={t("clics")}
            valor={numero(f.productViews)}
            frase={t("fraseClics", { n: deCada100(f.productViews) })}
            explicacion={t("explicaClics")}
          />
          <Kpi
            titulo={t("conversion")}
            valor={pct(conversion)}
            cambio={conversion / conversionAntes - 1}
            frase={t("fraseConversion", { n: Math.round(conversion * 1000) / 10 })}
            explicacion={t("explicaConversion")}
          />
          <Kpi
            titulo={t("abandonados")}
            valor={numero(abandonados)}
            frase={t("fraseAbandonados", { monto: dinero(abandonados * ticket) })}
            explicacion={t("explicaAbandonados")}
          />
        </div>
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

      <div className="mt-8">{hidratado ? <EnVivo /> : null}</div>

      <Seccion id="ventas" titulo={t("nav.ventas")}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Tarjeta id="grafico" titulo={t("grafico")} explicacion={t("explicaGrafico")} className="lg:col-span-2">
            <p className="text-sm">
              {t("mejorDia", { dia: hidratado ? larga.format(fecha(mejor.date)) : "", monto: dinero(mejor.sales) })}
            </p>
            <div>{hidratado ? <GraficoVentas datos={puntos} /> : <div className="h-72" />}</div>
          </Tarjeta>
          <Horas horas={panel.hours} />
          <Estados estados={panel.states} />
        </div>
      </Seccion>

      <Seccion id="productos" titulo={t("nav.productos")}>
        <div className="grid gap-6 lg:grid-cols-2">
          <JugueteEstrella panel={panel} />
          <Busquedas busquedas={panel.searches} />
          <Tarjeta id="mas-vendidos-panel" titulo={t("masVendidos")} explicacion={t("explicaMasVendidos")}>
            <ol className="grid gap-3">
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
                    <span className="text-sm font-bold tabular-nums">{dinero(b.revenue)}</span>
                  </li>
                );
              })}
            </ol>
          </Tarjeta>
          <ClicsVentas productos={panel.products} />
        </div>
      </Seccion>

      <Seccion id="clientes" titulo={t("nav.clientes")}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Tarjeta id="titulo-embudo" ancla="embudo" titulo={t("camino")} explicacion={t("explicaCamino")}>
            <p className="text-sm font-bold" data-testid="frase-camino">
              {t("caminoFrase", { carrito: deCada100(f.addedToCart), compran: deCada100(f.purchased) })}
            </p>
            <ol className="grid gap-3">
              {pasos.map((p) => (
                <li key={p.clave} className="grid gap-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{t(`pasos.${p.clave}`)}</span>
                    <span className="text-muted-ink tabular-nums">
                      {t("personas", { n: numero(p.n) })} · {Math.round(p.pct * 1000) / 10}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(1.5, p.pct * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          </Tarjeta>
          <Origen fuentes={panel.sources} />
          <Dispositivos dispositivos={panel.devices} />
          <Clientes clientes={panel.customers} />
        </div>
      </Seccion>

      <Seccion id="inventario" titulo={t("nav.inventario")}>
        <p className="mb-3 text-sm font-bold" data-testid="resumen-stock">
          {t("resumenStock", { unidades: numero(unidades), agotados, pocos })}
        </p>
        <Tarjeta id="titulo-stock" ancla="stock" titulo={t("stock")} explicacion={t("explicaStock")}>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
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
          <div className="overflow-x-auto">
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
                          n === 0 ? "bg-out/15 text-ink" : n <= 2 ? "bg-low/20 text-ink" : "bg-stock/15 text-ink",
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
        </Tarjeta>
      </Seccion>
    </div>
  );
}

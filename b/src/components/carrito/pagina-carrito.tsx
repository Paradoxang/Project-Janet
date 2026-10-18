"use client";

import { useLocale, useTranslations } from "next-intl";
import { Gift } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { SelectorZip } from "@/components/cabecera/selector-zip";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Precio } from "@/components/producto/precio";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import { rutaProducto } from "@/lib/catalogo";
import { calcularTotales } from "@/lib/totales";
import type { Idioma, Impuestos } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Mascota } from "@/marca/marca";
import { MAX_QTY, useCarrito, type LineaCarrito } from "@/stores/carrito";
import { usePreferencias, ZIP_INICIAL } from "@/stores/preferencias";
import { BarraEnvio } from "./barra-envio";
import { Resumen } from "./resumen";
import { ImagenSuelta } from "@/components/producto/foto-ia";

function Linea({ linea }: { linea: LineaCarrito }) {
  const t = useTranslations();
  const locale = useLocale() as Idioma;
  const { porId } = useCatalogo();
  const { quitar, setQty, guardarParaDespues, moverAlCarrito } = useCarrito();
  const p = porId.get(linea.id);
  if (!p) return null;
  const accion = "text-[13px] font-bold text-link hover:underline";
  return (
    <li className="flex gap-3 border-b py-4 last:border-b-0" data-testid="linea-carrito">
      {/* La foto repite el enlace del título: fuera del orden del teclado y de los lectores de pantalla. */}
      <Link
        href={rutaProducto(p)}
        tabIndex={-1}
        aria-hidden="true"
        className={cn("grid size-24 shrink-0 place-items-center overflow-hidden rounded-card md:size-32", FONDO_TINTE[p.tint])}
      >
        <ImagenSuelta illustration={p.illustration} imagen={p.imagen} className="size-[85%]" claseFoto="size-full object-cover" />
      </Link>
      <div className="grid flex-1 content-start gap-1">
        <Link href={rutaProducto(p)} className="line-clamp-2 text-[15px] leading-snug font-semibold hover:underline">
          {p.title[locale]}
        </Link>
        <Precio usd={p.price} className="text-lg" />
        <p className={`text-[13px] font-bold ${p.stockOnline > 0 ? "text-stock" : "text-out"}`}>
          {p.stockOnline > 0 ? t("producto.enStock") : t("producto.noDisponible")}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          {!linea.guardado ? (
            <label className="flex items-center gap-1.5 text-[13px]">
              <span className="sr-only">{t("carrito.cantidad")}</span>
              <span aria-hidden="true">{t("producto.cantidad")}:</span>
              <select
                value={linea.qty}
                onChange={(e) => setQty(linea.id, Number(e.target.value))}
                className="h-8 rounded-md border bg-surface px-1.5 text-sm"
                data-testid="cantidad-linea"
              >
                {Array.from({ length: MAX_QTY }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button type="button" className={accion} onClick={() => quitar(linea.id)} data-testid="eliminar">
            {t("carrito.eliminar")}
          </button>
          {linea.guardado ? (
            <button type="button" className={accion} onClick={() => moverAlCarrito(linea.id)} data-testid="mover">
              {t("carrito.mover")}
            </button>
          ) : (
            <button type="button" className={accion} onClick={() => guardarParaDespues(linea.id)} data-testid="guardar">
              {t("carrito.guardar")}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function PaginaCarrito({ impuestos }: { impuestos: Impuestos }) {
  const t = useTranslations("carrito");
  const hidratado = useHidratado();
  const { porId } = useCatalogo();
  const { lineas, regalo, setRegalo } = useCarrito();
  const zipGuardado = usePreferencias((s) => s.zip);
  const zip = hidratado ? zipGuardado : ZIP_INICIAL;

  if (!hidratado) return <div className="mx-auto min-h-[50vh] max-w-7xl px-4 md:px-6" />;

  const activas = lineas.filter((l) => !l.guardado);
  const guardadas = lineas.filter((l) => l.guardado);
  const totales = calcularTotales(lineas, porId, zip, impuestos);
  const nombreEstado = totales.estado ? impuestos.estados[totales.estado]?.name : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6">
      <h1 className="text-[26px] md:text-3xl">{t("titulo")}</h1>

      {activas.length === 0 ? (
        <div className="textura-puntos mt-6 flex flex-col items-center gap-4 rounded-card bg-warm px-6 py-10 text-center" data-testid="carrito-vacio">
          <Mascota className="h-40 w-32" />
          <div>
            <p className="font-display text-2xl">{t("vacio")}</p>
            <p className="mt-1 text-muted-ink">{t("vacioTexto")}</p>
          </div>
          <Button asChild variant="cta" size="lg">
            <Link href="/">{t("seguirComprando")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-4">
            <div className="rounded-card bg-white p-4 shadow-tarjeta">
              <BarraEnvio subtotal={totales.subtotal} />
            </div>
            <ul className="rounded-card bg-white px-4 shadow-tarjeta">
              {activas.map((l) => (
                <Linea key={l.id} linea={l} />
              ))}
            </ul>
          </div>
          <aside className="grid gap-4 rounded-card bg-white p-4 shadow-tarjeta lg:sticky lg:top-12" aria-label={t("total")}>
            <Resumen totales={totales} nombreEstado={nombreEstado} />
            <div className="flex items-center justify-between gap-2 text-[13px] text-muted-ink">
              <SelectorZip />
            </div>
            <label className="flex items-start gap-2.5 rounded-md bg-surface p-3 text-sm">
              <Checkbox checked={regalo} onCheckedChange={(v) => setRegalo(v === true)} className="mt-0.5" data-testid="regalo" />
              <span>
                <span className="flex items-center gap-1.5 font-bold">
                  <Gift className="size-4" aria-hidden="true" />
                  {t("regalo")}
                </span>
                <span className="text-muted-ink">{t("regaloTexto")}</span>
              </span>
            </label>
            <Button asChild variant="cta" size="xl" className="w-full">
              <Link href="/checkout" data-testid="ir-a-pagar">
                {t("pagar")}
              </Link>
            </Button>
          </aside>
        </div>
      )}

      {guardadas.length > 0 ? (
        <section className="mt-8" aria-labelledby="guardados">
          <h2 id="guardados" className="text-xl">
            {t("guardados", { n: guardadas.length })}
          </h2>
          <ul className="mt-2 rounded-card bg-white px-4 shadow-tarjeta">
            {guardadas.map((l) => (
              <Linea key={l.id} linea={l} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

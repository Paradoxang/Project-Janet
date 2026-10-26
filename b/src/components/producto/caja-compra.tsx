"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconoAviso, IconoCandado } from "@/components/cuento/iconos";
import { BotonDeseos } from "@/components/cuenta/boton-deseos";
import { Button } from "@/components/ui/button";
import { useHidratado } from "@/hooks/use-hidratado";
import { useRouter } from "@/i18n/navigation";
import { fechaLarga, sumarDiasHabiles } from "@/lib/formato";
import { ENVIO_GRATIS_DESDE } from "@/lib/totales";
import { lugarDeZip } from "@/lib/zip";
import { MAX_QTY, useCarrito } from "@/stores/carrito";
import { usePreferencias, ZIP_INICIAL } from "@/stores/preferencias";
import { BotonAgregar } from "./boton-agregar";
import { Precio } from "./precio";

export function CajaCompra({
  id,
  precio,
  stockOnline,
  diasEntrega,
  aviso,
}: {
  id: string;
  precio: number;
  stockOnline: number;
  diasEntrega: number;
  /** Advertencia corta (p. ej. piezas pequeñas) que va junto al precio. */
  aviso?: string;
}) {
  const t = useTranslations("producto");
  const locale = useLocale();
  const router = useRouter();
  const hidratado = useHidratado();
  const zipGuardado = usePreferencias((s) => s.zip);
  const zip = hidratado ? zipGuardado : ZIP_INICIAL;
  const agregar = useCarrito((s) => s.agregar);
  const [qty, setQty] = useState(1);
  const disponible = stockOnline > 0;
  const fecha = hidratado ? fechaLarga(sumarDiasHabiles(new Date(), diasEntrega), locale) : "";
  const gratis = precio >= ENVIO_GRATIS_DESDE;

  return (
    <div
      className="rounded-card shadow-tarjeta text-ink grid gap-3.5 bg-white p-5 md:p-6"
      data-testid="caja-compra"
    >
      <div>
        <Precio usd={precio} className="text-[40px]" />
        <p className="text-muted-ink mt-1 text-[13px]">{t("impuesto")}</p>
      </div>

      {aviso ? (
        <p className="border-low/30 bg-low/5 text-low flex items-start gap-2 rounded-md border p-2.5 text-[12.5px] leading-snug font-semibold">
          <IconoAviso className="mt-0.5 size-4 shrink-0" />
          {aviso}
        </p>
      ) : null}

      {disponible ? (
        <>
          <p className="text-[15px] leading-snug" data-testid="entrega">
            {hidratado ? (
              <>
                <b>{gratis ? t("entregaGratis", { fecha }) : t("entrega", { fecha })}</b>{" "}
                <span className="text-muted-ink">
                  {t("a", { zip: `${lugarDeZip(zip) ?? ""} ${zip}`.trim() })}
                </span>
              </>
            ) : (
              <span className="bg-surface inline-block h-4 w-48 animate-pulse rounded" />
            )}
          </p>
          {!gratis ? <p className="text-muted-ink -mt-2 text-[13px]">{t("gratisDesde")}</p> : null}
          <p
            className={`text-lg font-bold ${stockOnline <= 5 ? "text-low" : "text-stock"}`}
            data-testid="estado-stock"
          >
            {stockOnline <= 5 ? t("quedanPocos", { n: stockOnline }) : t("enStock")}
          </p>
          <label className="flex items-center gap-2 text-sm font-bold">
            {t("cantidad")}
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="rounded-chip border-input font-display h-11 min-w-20 border bg-white px-3 text-[15px] font-semibold"
              data-testid="cantidad"
            >
              {Array.from({ length: Math.min(MAX_QTY, stockOnline) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-2">
            <BotonAgregar id={id} qty={qty} />
            <Button
              type="button"
              variant="buy"
              size="xl"
              className="w-full"
              data-testid="comprar-ahora"
              onClick={() => {
                agregar(id, qty);
                router.push("/checkout");
              }}
            >
              {t("comprar")}
            </Button>
            <BotonDeseos id={id} />
          </div>
          <p className="text-muted-ink flex flex-wrap justify-center gap-x-5 gap-y-1 pt-1 text-[13px]">
            <span className="inline-flex items-center gap-1.5">
              <IconoCandado className="size-3.5" />
              {t("pagoSeguro")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-3.5">
                ↺
              </span>
              {t("devolucionFacil")}
            </span>
          </p>
        </>
      ) : (
        <p className="text-out text-lg font-bold" data-testid="estado-stock">
          {t("noDisponible")}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";
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
    <div className="grid gap-3 rounded-card border p-4" data-testid="caja-compra">
      <div>
        <Precio usd={precio} className="text-[34px]" />
        <p className="mt-1 text-[13px] text-muted-ink">{t("impuesto")}</p>
      </div>

      {aviso ? (
        <p className="flex items-start gap-2 rounded-md border border-low/30 bg-low/5 p-2.5 text-[12.5px] leading-snug font-semibold text-low">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {aviso}
        </p>
      ) : null}

      {disponible ? (
        <>
          <p className="text-[15px] leading-snug" data-testid="entrega">
            {hidratado ? (
              <>
                <b>{gratis ? t("entregaGratis", { fecha }) : t("entrega", { fecha })}</b>{" "}
                <span className="text-muted-ink">{t("a", { zip: `${lugarDeZip(zip) ?? ""} ${zip}`.trim() })}</span>
              </>
            ) : (
              <span className="inline-block h-4 w-48 animate-pulse rounded bg-surface" />
            )}
          </p>
          {!gratis ? <p className="-mt-2 text-[13px] text-muted-ink">{t("gratisDesde")}</p> : null}
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
              className="h-9 rounded-md border bg-surface px-2 text-sm"
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
        </>
      ) : (
        <p className="text-lg font-bold text-out" data-testid="estado-stock">
          {t("noDisponible")}
        </p>
      )}
    </div>
  );
}

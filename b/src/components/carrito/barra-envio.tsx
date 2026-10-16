"use client";

import { useLocale, useTranslations } from "next-intl";
import { Truck } from "lucide-react";
import { aCentavos, aDolares, precio } from "@/lib/formato";
import { ENVIO_GRATIS_DESDE } from "@/lib/totales";

/** Barra de envío gratis: cuánto falta para llegar a $35. */
export function BarraEnvio({ subtotal }: { subtotal: number }) {
  const t = useTranslations("carrito");
  const locale = useLocale();
  const umbral = aCentavos(ENVIO_GRATIS_DESDE);
  const falta = Math.max(0, umbral - subtotal);
  const pct = Math.min(100, Math.round((subtotal / umbral) * 100));
  return (
    <div className="grid gap-1.5" data-testid="barra-envio">
      <p className={`flex items-center gap-2 text-sm font-bold ${falta === 0 ? "text-stock" : "text-ink"}`}>
        <Truck className="size-4 shrink-0" aria-hidden="true" />
        {falta === 0 ? t("gratisLogrado") : t("faltan", { monto: precio(aDolares(falta), locale) })}
      </p>
      <div
        className="h-2 overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className={`h-full rounded-full ${falta === 0 ? "bg-stock" : "bg-brand"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

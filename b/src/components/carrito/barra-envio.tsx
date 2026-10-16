"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Confeti } from "@/components/efectos/confeti";
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
  // Celebra solo el momento en que se cruza la meta (no al abrir un carrito que ya la cumplía).
  const faltaAntes = useRef(falta);
  const [disparo, setDisparo] = useState(0);
  useEffect(() => {
    if (faltaAntes.current > 0 && falta === 0) setDisparo((d) => d + 1);
    faltaAntes.current = falta;
  }, [falta]);
  return (
    <div className="relative grid gap-1.5" data-testid="barra-envio">
      <Confeti disparo={disparo} />
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
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${falta === 0 ? "bg-stock" : "bg-brand"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

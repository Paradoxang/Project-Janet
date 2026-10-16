"use client";

import { useLocale, useTranslations } from "next-intl";
import { aDolares, precio } from "@/lib/formato";
import type { Totales } from "@/lib/totales";

/** Subtotal, envío, impuesto estimado y total. */
export function Resumen({ totales, nombreEstado }: { totales: Totales; nombreEstado?: string }) {
  const t = useTranslations("carrito");
  const locale = useLocale();
  const fila = "flex items-baseline justify-between gap-4";
  const pct = new Intl.NumberFormat(locale === "es" ? "es-US" : "en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(totales.tasa);
  return (
    <div className="grid gap-2 text-[15px]" data-testid="resumen">
      <p className={fila}>
        <span>{t("subtotal", { n: totales.articulos })}</span>
        <span className="font-bold">{precio(aDolares(totales.subtotal), locale)}</span>
      </p>
      <p className={fila}>
        <span>{t("envio")}</span>
        <span className="font-bold" data-testid="resumen-envio">
          {totales.envio === 0 ? t("envioGratis") : precio(aDolares(totales.envio), locale)}
        </span>
      </p>
      <p className={fila}>
        <span>{totales.estado ? t("impuestoEstimado", { estado: totales.estado }) : t("impuestoSinZip")}</span>
        <span className="font-bold" data-testid="resumen-impuesto">
          {precio(aDolares(totales.impuesto), locale)}
        </span>
      </p>
      {totales.estado ? (
        <p className="text-xs leading-snug text-muted-ink">
          {t("impuestoNota", { estado: nombreEstado ?? totales.estado, tasa: pct })}
        </p>
      ) : null}
      <p className={`${fila} mt-1 border-t pt-3 text-lg`}>
        <span className="font-bold">{t("total")}</span>
        <span className="font-extrabold" data-testid="resumen-total">
          {precio(aDolares(totales.total), locale)}
        </span>
      </p>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Formatos del panel (dinero, números y porcentajes) en el idioma de la página. */
export function useFormatos() {
  const locale = useLocale();
  const region = locale === "es" ? "es-US" : "en-US";
  return {
    dinero: (usd: number, decimales = 0) =>
      new Intl.NumberFormat(region, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: decimales,
        minimumFractionDigits: decimales,
      }).format(usd),
    numero: (n: number) => new Intl.NumberFormat(region).format(n),
    pct: (x: number, decimales = 1) =>
      new Intl.NumberFormat(region, { style: "percent", maximumFractionDigits: decimales }).format(x),
  };
}

export function QueSignifica({ texto }: { texto: string }) {
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

export function Kpi({
  titulo,
  valor,
  cambio,
  frase,
  explicacion,
}: {
  titulo: string;
  valor: string;
  /** Cambio contra el periodo anterior (0,086 = +8,6 %). Sin él, no se muestra la flecha. */
  cambio?: number;
  frase: string;
  explicacion: string;
}) {
  const t = useTranslations("panel");
  const { pct } = useFormatos();
  const sube = (cambio ?? 0) >= 0;
  return (
    <article className="grid content-start gap-2 rounded-card bg-white p-4 shadow-tarjeta" data-testid="kpi">
      <h3 className="font-sans text-sm font-bold text-muted-ink">{titulo}</h3>
      <p className="font-sans text-[34px] leading-none font-extrabold">{valor}</p>
      {cambio !== undefined ? (
        <p className={cn("flex items-center gap-1 text-[13px] font-bold", sube ? "text-stock" : "text-out")}>
          {sube ? <ArrowUpRight className="size-4" aria-hidden="true" /> : <ArrowDownRight className="size-4" aria-hidden="true" />}
          {sube ? t("sube", { pct: pct(Math.abs(cambio)) }) : t("baja", { pct: pct(Math.abs(cambio)) })}
        </p>
      ) : null}
      <p className="text-sm">{frase}</p>
      <QueSignifica texto={explicacion} />
    </article>
  );
}

/** Tarjeta de una sección del panel: título, contenido y su «¿Qué significa esto?». */
export function Tarjeta({
  id,
  ancla,
  titulo,
  explicacion,
  children,
  className,
}: {
  /** Id del título (lo usa aria-labelledby). */
  id: string;
  /** Id de la tarjeta, para enlazarla (p. ej., desde un aviso: #stock). */
  ancla?: string;
  titulo: string;
  explicacion?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={ancla}
      className={cn("grid scroll-mt-14 content-start gap-3 rounded-card bg-white p-4 shadow-tarjeta md:p-5", className)}
      aria-labelledby={id}
    >
      <h3 id={id} className="text-xl">
        {titulo}
      </h3>
      {children}
      {explicacion ? <QueSignifica texto={explicacion} /> : null}
    </section>
  );
}

/** Barra horizontal simple (0 a 1). */
export function Barra({ valor, className }: { valor: number; className?: string }) {
  return (
    <span className="block h-2 rounded-full bg-surface" aria-hidden="true">
      <span
        className={cn("block h-full rounded-full bg-brand", className)}
        style={{ width: `${Math.max(1.5, Math.min(1, valor) * 100)}%` }}
      />
    </span>
  );
}

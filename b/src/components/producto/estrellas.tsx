import { cn } from "@/lib/utils";

/** Estrellas de valoración (decorativas: el número va siempre al lado en texto). */
export function Estrellas({ valor, className }: { valor: number; className?: string }) {
  const ancho = `${Math.max(0, Math.min(100, (valor / 5) * 100))}%`;
  return (
    <span className={cn("relative inline-block leading-none tracking-[-0.05em] whitespace-nowrap", className)} aria-hidden="true">
      <span className="text-line">★★★★★</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden text-star" style={{ width: ancho }}>
        ★★★★★
      </span>
    </span>
  );
}

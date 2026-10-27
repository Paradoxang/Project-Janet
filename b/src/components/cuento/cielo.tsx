import { cn } from "@/lib/utils";

/**
 * El cielo del canon, sin estrellas ni órbitas (revisión del 27-10: «quitar como ese estilo de estrellas, más que todo en
 * el giro»): solo el degradado de respaldo con sus nebulosas. Va de fondo (absolute inset-0) dentro de una sección azul
 * noche.
 */
export function Cielo({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("cielo pointer-events-none absolute inset-0 overflow-hidden", className)}
    />
  );
}

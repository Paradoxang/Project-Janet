import { partesPrecio } from "@/lib/formato";
import { cn } from "@/lib/utils";

/** Precio al estilo Amazon: $24⁹⁹. */
export function Precio({ usd, className }: { usd: number; className?: string }) {
  const { enteros, centavos } = partesPrecio(usd);
  return (
    <span className={cn("inline-flex items-start leading-none font-extrabold text-ink", className)}>
      <span className="sr-only">{`$${enteros}.${centavos}`}</span>
      <span aria-hidden="true" className="mt-[0.12em] text-[0.55em]">
        $
      </span>
      <span aria-hidden="true">{enteros}</span>
      <span aria-hidden="true" className="mt-[0.12em] text-[0.55em]">
        {centavos}
      </span>
    </span>
  );
}

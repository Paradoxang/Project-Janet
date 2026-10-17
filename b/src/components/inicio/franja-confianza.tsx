import { useTranslations } from "next-intl";
import { RotateCcw, Store, Truck } from "lucide-react";

const ICONOS = [Truck, Store, RotateCcw];

/** Tres promesas cortas, honestas y concretas, en una sola franja con líneas finas (sin tarjetas). */
export function FranjaConfianza() {
  const t = useTranslations("inicio");
  const items = t.raw("confianza") as { t: string; d: string }[];
  return (
    <ul className="relative -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-0 md:divide-x md:rounded-card md:border md:px-0 [&::-webkit-scrollbar]:hidden">
      {items.map((it, i) => {
        const Icono = ICONOS[i];
        return (
          <li
            key={it.t}
            className="flex min-w-[78%] snap-start items-center gap-3 rounded-card border px-4 py-3 md:min-w-0 md:rounded-none md:border-0 md:px-6 md:py-4"
          >
            <Icono className="size-6 shrink-0 text-ink" strokeWidth={1.75} aria-hidden="true" />
            <span className="leading-tight">
              <b className="block text-[14.5px] font-bold">{it.t}</b>
              <span className="text-[13px] text-muted-ink">{it.d}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

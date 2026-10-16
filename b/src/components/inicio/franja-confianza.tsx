import { useTranslations } from "next-intl";
import { RotateCcw, Store, Truck } from "lucide-react";

const ICONOS = [Truck, Store, RotateCcw];

/** Tres promesas cortas, honestas y concretas. */
export function FranjaConfianza() {
  const t = useTranslations("inicio");
  const items = t.raw("confianza") as { t: string; d: string }[];
  return (
    <ul className="relative -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:px-0 [&::-webkit-scrollbar]:hidden">
      {items.map((it, i) => {
        const Icono = ICONOS[i];
        return (
          <li key={it.t} className="flex min-w-[76%] snap-start items-center gap-3 rounded-card bg-white p-4 shadow-tarjeta md:min-w-0">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-warm text-ink">
              <Icono className="size-5" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <b className="block text-[15px]">{it.t}</b>
              <span className="text-[13px] text-muted-ink">{it.d}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

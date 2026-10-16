"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useHidratado } from "@/hooks/use-hidratado";
import { cn } from "@/lib/utils";
import { useCuenta, useDeseos } from "@/stores/cuenta";

export function BotonDeseos({ id }: { id: string }) {
  const t = useTranslations("producto");
  const hidratado = useHidratado();
  const deseos = useDeseos();
  const alternar = useCuenta((s) => s.alternarDeseo);
  const guardado = hidratado && deseos.includes(id);
  return (
    <button
      type="button"
      aria-pressed={guardado}
      onClick={() => alternar(id)}
      data-testid="deseos"
      className="inline-flex items-center justify-center gap-2 rounded-btn py-2 text-sm font-bold text-link hover:underline"
    >
      <Heart className={cn("size-4", guardado && "fill-current")} aria-hidden="true" />
      {guardado ? t("enListaDeseos") : t("listaDeseos")}
    </button>
  );
}

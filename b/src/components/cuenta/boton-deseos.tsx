"use client";

import { useTranslations } from "next-intl";
import { IconoCorazon } from "@/components/cuento/iconos";
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
      className="rounded-btn font-display text-link inline-flex items-center justify-center gap-2 py-2 text-[15px] font-semibold underline-offset-4 hover:underline"
    >
      <IconoCorazon className={cn("size-4", guardado ? "text-mandarina-tinta" : "opacity-70")} />
      {guardado ? t("enListaDeseos") : t("listaDeseos")}
    </button>
  );
}

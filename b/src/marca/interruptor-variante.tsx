"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Palette } from "lucide-react";
import type { VarianteId } from "./script-variante";

function varianteActual(): VarianteId {
  return document.documentElement.getAttribute("data-variante") === "color" ? "color" : "base";
}

/** Interruptor «Variante colorida»: la tienda blanca de siempre o la variante con más color y fotos hechas con IA. */
export function InterruptorVariante() {
  const t = useTranslations("demo");
  const [variante, setVariante] = useState<VarianteId | null>(null);

  useEffect(() => setVariante(varianteActual()), []);

  function cambiar() {
    const nueva: VarianteId = varianteActual() === "color" ? "base" : "color";
    document.documentElement.setAttribute("data-variante", nueva);
    try {
      localStorage.setItem("variante", nueva);
    } catch {}
    setVariante(nueva);
  }

  const activa = variante === "color";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activa}
      onClick={cambiar}
      aria-label={t("varianteColor")}
      title={t("varianteColor")}
      data-testid="interruptor-variante"
      className="inline-flex items-center gap-2 rounded-full px-2 py-0.5 font-bold text-white/90 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
    >
      <Palette className="size-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{t("varianteColor")}</span>
      <span
        className={`relative h-4 w-7 rounded-full transition-colors ${activa ? "bg-[#2f8cff]" : "bg-white/30"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${activa ? "left-3.5" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ICONOS, type MarcaId } from "./script-marca";

function marcaActual(): MarcaId {
  return document.documentElement.getAttribute("data-marca") === "brinco" ? "brinco" : "neutra";
}

/** Interruptor «Propuesta de marca»: enseña la tienda sin marca o con la marca Brinco. */
export function InterruptorMarca() {
  const t = useTranslations("demo");
  const [marca, setMarca] = useState<MarcaId | null>(null);

  useEffect(() => setMarca(marcaActual()), []);

  function cambiar() {
    const nueva: MarcaId = marcaActual() === "brinco" ? "neutra" : "brinco";
    document.documentElement.setAttribute("data-marca", nueva);
    try {
      localStorage.setItem("marca", nueva);
    } catch {}
    document.querySelector('link[rel="icon"]')?.setAttribute("href", ICONOS[nueva]);
    setMarca(nueva);
  }

  const activa = marca === "brinco";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activa}
      onClick={cambiar}
      aria-label={t("propuestaMarca")}
      title={t("propuestaMarca")}
      data-testid="interruptor-marca"
      className="inline-flex items-center gap-2 rounded-full px-2 py-0.5 font-semibold uppercase text-crema/90 hover:bg-crema/10 focus-visible:ring-2 focus-visible:ring-calendula focus-visible:outline-none"
    >
      <span className="hidden sm:inline">{t("propuestaMarca")}</span>
      <span
        className={`relative h-4 w-7 rounded-full transition-colors ${activa ? "bg-calendula" : "bg-crema/30"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${activa ? "left-3.5" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

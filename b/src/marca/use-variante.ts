"use client";

import { useSyncExternalStore } from "react";
import type { VarianteId } from "./script-variante";

// La variante la pone el script del <head> (script-variante.ts) y la cambia el interruptor: se lee del atributo de
// <html> y se sigue con un MutationObserver. En el servidor (y al hidratar) es «base», la tienda blanca.
function suscribir(aviso: () => void) {
  const vigia = new MutationObserver(aviso);
  vigia.observe(document.documentElement, { attributes: true, attributeFilter: ["data-variante"] });
  return () => vigia.disconnect();
}

const leer = (): VarianteId => (document.documentElement.getAttribute("data-variante") === "color" ? "color" : "base");

/** La variante de la maqueta que se ve ahora: «base» (la tienda blanca) o «color». */
export function useVariante(): VarianteId {
  // En el HTML estático, «color»: la del rediseño del 26-10.
  return useSyncExternalStore(suscribir, leer, () => "color");
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Evento } from "@/lib/actividad";

const MAXIMO = 400;

interface Actividad {
  eventos: Evento[];
  registrar: (evento: Omit<Evento, "fecha">) => void;
  borrar: () => void;
}

/**
 * Lo que pasa en la tienda en ESTE navegador (visitas, fichas vistas, carrito, compras y búsquedas),
 * para el bloque «En vivo» del panel. No se envía a ningún sitio.
 */
export const useActividad = create<Actividad>()(
  persist(
    (set) => ({
      eventos: [],
      registrar: (evento) =>
        set((s) => ({ eventos: [{ ...evento, fecha: new Date().toISOString() }, ...s.eventos].slice(0, MAXIMO) })),
      borrar: () => set({ eventos: [] }),
    }),
    { name: "actividad" },
  ),
);

/** Para registrar desde fuera de un componente (p. ej., desde la store del carrito). */
export const registrarActividad = (evento: Omit<Evento, "fecha">) => useActividad.getState().registrar(evento);

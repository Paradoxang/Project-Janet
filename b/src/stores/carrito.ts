"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { registrarActividad } from "./actividad";

export interface LineaCarrito {
  id: string;
  qty: number;
  /** «Save for later»: sigue en la lista pero no cuenta para el total. */
  guardado: boolean;
}

interface Carrito {
  lineas: LineaCarrito[];
  regalo: boolean;
  agregar: (id: string, qty?: number) => void;
  quitar: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  guardarParaDespues: (id: string) => void;
  moverAlCarrito: (id: string) => void;
  setRegalo: (regalo: boolean) => void;
  vaciar: () => void;
}

export const MAX_QTY = 10;

export const useCarrito = create<Carrito>()(
  persist(
    (set) => ({
      lineas: [],
      regalo: false,
      agregar: (id, qty = 1) => {
        registrarActividad({ tipo: "carrito", producto: id });
        set((s) => {
          const existe = s.lineas.find((l) => l.id === id);
          if (existe) {
            return {
              lineas: s.lineas.map((l) =>
                l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty), guardado: false } : l,
              ),
            };
          }
          return { lineas: [...s.lineas, { id, qty: Math.min(MAX_QTY, qty), guardado: false }] };
        });
      },
      quitar: (id) => set((s) => ({ lineas: s.lineas.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          lineas: s.lineas.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)),
        })),
      guardarParaDespues: (id) =>
        set((s) => ({ lineas: s.lineas.map((l) => (l.id === id ? { ...l, guardado: true } : l)) })),
      moverAlCarrito: (id) =>
        set((s) => ({ lineas: s.lineas.map((l) => (l.id === id ? { ...l, guardado: false } : l)) })),
      setRegalo: (regalo) => set({ regalo }),
      vaciar: () => set({ lineas: [], regalo: false }),
    }),
    { name: "carrito" },
  ),
);

export function contarArticulos(lineas: LineaCarrito[]): number {
  return lineas.filter((l) => !l.guardado).reduce((n, l) => n + l.qty, 0);
}

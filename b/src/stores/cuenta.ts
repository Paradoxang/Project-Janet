"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Cuenta simulada: sin contraseña y solo en este navegador. */
interface Cuenta {
  nombre: string | null;
  deseos: string[];
  entrar: (nombre: string) => void;
  salir: () => void;
  alternarDeseo: (id: string) => void;
}

export const useCuenta = create<Cuenta>()(
  persist(
    (set) => ({
      nombre: null,
      deseos: [],
      entrar: (nombre) => set({ nombre }),
      salir: () => set({ nombre: null }),
      alternarDeseo: (id) =>
        set((s) => ({ deseos: s.deseos.includes(id) ? s.deseos.filter((d) => d !== id) : [id, ...s.deseos] })),
    }),
    { name: "cuenta" },
  ),
);

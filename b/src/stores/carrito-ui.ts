"use client";

import { create } from "zustand";

/** Panel lateral del carrito: se abre al agregar un producto. */
interface CarritoUI {
  abierto: boolean;
  ultimo: string | null;
  abrir: (id: string) => void;
  cerrar: () => void;
}

export const useCarritoUI = create<CarritoUI>((set) => ({
  abierto: false,
  ultimo: null,
  abrir: (id) => set({ abierto: true, ultimo: id }),
  cerrar: () => set({ abierto: false }),
}));

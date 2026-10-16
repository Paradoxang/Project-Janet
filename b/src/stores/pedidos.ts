"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Pedido {
  id: string;
  fecha: string;
  llega: string;
  lineas: { id: string; qty: number; precio: number }[];
  subtotal: number;
  envio: number;
  impuesto: number;
  total: number;
  metodoPago: string;
  correo: string;
  nombre: string;
  direccion: string;
  regalo: boolean;
  /** Correo de la cuenta con la que se compró (sin cuenta: invitada). */
  cuenta?: string;
}

interface Pedidos {
  pedidos: Pedido[];
  guardar: (p: Pedido) => void;
}

/** «Mis pedidos» de la cuenta simulada (solo en este navegador). */
export const usePedidos = create<Pedidos>()(
  persist(
    (set) => ({
      pedidos: [],
      guardar: (p) => set((s) => ({ pedidos: [p, ...s.pedidos].slice(0, 20) })),
    }),
    { name: "pedidos" },
  ),
);

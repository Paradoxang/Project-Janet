"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { esNuevo, SIN_CAMBIOS, soloEditables, type CambiosCatalogo } from "@/lib/catalogo";
import type { Producto } from "@/lib/tipos";

interface CatalogoLocal extends CambiosCatalogo {
  /** Guarda un producto nuevo o editado. Devuelve false si el navegador no tiene espacio (fotos grandes). */
  guardar: (p: Producto) => boolean;
  alternarOculto: (id: string) => void;
  borrar: (id: string) => void;
  /** Vuelve al catálogo de ejemplo. */
  restaurar: () => void;
}

/** Los cambios que hace la dueña en su catálogo. Solo en este navegador (decisión del 16-10). */
export const useCatalogoLocal = create<CatalogoLocal>()(
  persist(
    (set) => ({
      ...SIN_CAMBIOS,
      guardar: (p) => {
        try {
          set((s) =>
            esNuevo(p.id)
              ? { nuevos: s.nuevos.some((n) => n.id === p.id) ? s.nuevos.map((n) => (n.id === p.id ? p : n)) : [p, ...s.nuevos] }
              : { ediciones: { ...s.ediciones, [p.id]: soloEditables(p) } },
          );
          return true;
        } catch {
          // localStorage lleno (p. ej., muchas fotos): el cambio queda solo hasta recargar.
          return false;
        }
      },
      alternarOculto: (id) =>
        set((s) => ({ ocultos: s.ocultos.includes(id) ? s.ocultos.filter((o) => o !== id) : [...s.ocultos, id] })),
      borrar: (id) =>
        set((s) => ({
          nuevos: s.nuevos.filter((n) => n.id !== id),
          ocultos: s.ocultos.filter((o) => o !== id),
          borrados: esNuevo(id) || s.borrados.includes(id) ? s.borrados : [...s.borrados, id],
        })),
      restaurar: () => set({ ...SIN_CAMBIOS }),
    }),
    {
      name: "catalogo",
      partialize: ({ nuevos, ediciones, ocultos, borrados }) => ({ nuevos, ediciones, ocultos, borrados }),
    },
  ),
);

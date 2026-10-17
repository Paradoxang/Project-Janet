"use client";

import { useCatalogo } from "@/components/proveedor-catalogo";
import { esNuevo } from "@/lib/catalogo";
import type { ProductoLigero } from "@/lib/tipos";
import { TarjetaProducto } from "./tarjeta-producto";

/** Fila horizontal deslizable de productos (en móvil se desliza con el dedo, como en Amazon). */
export function FilaProductos({ productos, ranking = false }: { productos: ProductoLigero[]; ranking?: boolean }) {
  // Con los cambios de la dueña: lo oculto o borrado no sale y lo editado sale con sus datos nuevos.
  const { porId } = useCatalogo();
  const lista = productos.map((p) => porId.get(p.id)).filter((p): p is ProductoLigero => !!p);
  if (lista.length === 0) return null;
  return (
    <div className="relative -mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
      <ul className="flex snap-x snap-mandatory gap-3.5 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-8 lg:grid-cols-5">
        {lista.map((p, i) => (
          <li key={p.id} className="w-[44vw] max-w-[220px] shrink-0 snap-start py-1 md:w-auto md:max-w-none">
            <TarjetaProducto p={p} puesto={ranking ? i + 1 : undefined} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export type Criterio = "masVendidos" | "menosDe25" | "novedades";

const ELEGIR: Record<Criterio, (lista: ProductoLigero[]) => ProductoLigero[]> = {
  masVendidos: (l) => l.filter((p) => p.bestSeller).sort((a, b) => b.reviewCount - a.reviewCount),
  menosDe25: (l) => l.filter((p) => p.price < 25).sort((a, b) => b.reviewCount - a.reviewCount),
  novedades: (l) => l.filter((p) => esNuevo(p.id)),
};

/** Fila calculada con el catálogo de la tienda (con los productos que agregue la dueña). */
export function FilaCatalogo({ criterio, ranking }: { criterio: Criterio; ranking?: boolean }) {
  const { productos } = useCatalogo();
  return <FilaProductos productos={ELEGIR[criterio](productos)} ranking={ranking} />;
}

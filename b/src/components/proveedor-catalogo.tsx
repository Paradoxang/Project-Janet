"use client";

import { createContext, useContext, useMemo } from "react";
import { useHidratado } from "@/hooks/use-hidratado";
import { catalogoVisible } from "@/lib/catalogo";
import { enLaTiendaBlanca } from "@/lib/fotos-ia";
import { useVariante } from "@/marca/use-variante";
import type { ProductoLigero } from "@/lib/tipos";
import { useCatalogoLocal } from "@/stores/catalogo";

interface Catalogo {
  productos: ProductoLigero[];
  porId: Map<string, ProductoLigero>;
}

const ContextoCatalogo = createContext<Catalogo | null>(null);

/**
 * El catálogo que ve la tienda: el de ejemplo y, ya en el navegador, con los cambios de la dueña
 * (productos nuevos, ediciones, ocultos y borrados).
 */
export function ProveedorCatalogo({
  productos,
  children,
}: {
  productos: ProductoLigero[];
  children: React.ReactNode;
}) {
  const hidratado = useHidratado();
  const nuevos = useCatalogoLocal((s) => s.nuevos);
  const ediciones = useCatalogoLocal((s) => s.ediciones);
  const ocultos = useCatalogoLocal((s) => s.ocultos);
  const borrados = useCatalogoLocal((s) => s.borrados);
  const valor = useMemo(() => {
    const lista = hidratado ? catalogoVisible(productos, { nuevos, ediciones, ocultos, borrados }) : productos;
    return { productos: lista, porId: new Map(lista.map((p) => [p.id, p])) };
  }, [hidratado, productos, nuevos, ediciones, ocultos, borrados]);
  return <ContextoCatalogo.Provider value={valor}>{children}</ContextoCatalogo.Provider>;
}

export function useCatalogo(): Catalogo {
  const c = useContext(ContextoCatalogo);
  if (!c) throw new Error("useCatalogo fuera de ProveedorCatalogo");
  return c;
}

/**
 * Los productos que se ofrecen en la tienda que se ve: en la tienda blanca, solo los dibujados (o con foto de la dueña);
 * en la colorida, todos (ver enLaTiendaBlanca). Para buscar y sugerir. El carrito, el pago, la lista de deseos y el
 * panel siguen con useCatalogo(), que los tiene todos.
 */
export function useCatalogoDeLaTienda(): ProductoLigero[] {
  const { productos } = useCatalogo();
  const variante = useVariante();
  return useMemo(() => (variante === "color" ? productos : productos.filter(enLaTiendaBlanca)), [productos, variante]);
}

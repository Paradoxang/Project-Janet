"use client";

import { createContext, useContext, useMemo } from "react";
import type { ProductoLigero } from "@/lib/tipos";

interface Catalogo {
  productos: ProductoLigero[];
  porId: Map<string, ProductoLigero>;
}

const ContextoCatalogo = createContext<Catalogo | null>(null);

export function ProveedorCatalogo({
  productos,
  children,
}: {
  productos: ProductoLigero[];
  children: React.ReactNode;
}) {
  const valor = useMemo(
    () => ({ productos, porId: new Map(productos.map((p) => [p.id, p])) }),
    [productos],
  );
  return <ContextoCatalogo.Provider value={valor}>{children}</ContextoCatalogo.Provider>;
}

export function useCatalogo(): Catalogo {
  const c = useContext(ContextoCatalogo);
  if (!c) throw new Error("useCatalogo fuera de ProveedorCatalogo");
  return c;
}

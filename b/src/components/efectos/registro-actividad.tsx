"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registrarActividad } from "@/stores/actividad";

/** Cuenta cada página que se abre en la tienda (la dueña mirando su panel no cuenta). */
export function RegistroVisitas() {
  const ruta = usePathname();
  useEffect(() => {
    if (/\/panel(\/|$)/.test(ruta)) return;
    registrarActividad({ tipo: "visita" });
  }, [ruta]);
  return null;
}

/** Cuenta que se abrió la ficha de un producto. */
export function RegistroVistaProducto({ id }: { id: string }) {
  useEffect(() => {
    registrarActividad({ tipo: "producto", producto: id });
  }, [id]);
  return null;
}

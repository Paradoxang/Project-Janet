"use client";

import { useLayoutEffect } from "react";
import { useHidratado } from "@/hooks/use-hidratado";
import { usePathname } from "@/i18n/navigation";
import { esRutaPanel } from "@/lib/modo-panel";
import { useCuenta } from "@/stores/cuenta";

/**
 * Con alguien de administración dentro del panel, la cabecera de la tienda se recoge y el panel ocupa toda la
 * pantalla; en la tienda vuelve. Mantiene <html data-panel> al entrar, salir y navegar (antes de pintar).
 * La primera vez lo pone scriptModoPanel, antes de hidratar.
 */
export function ModoPanel() {
  const hidratado = useHidratado();
  const pathname = usePathname();
  const admin = useCuenta((s) => s.usuario?.rol === "admin");

  useLayoutEffect(() => {
    if (hidratado) document.documentElement.toggleAttribute("data-panel", admin && esRutaPanel(pathname));
  }, [hidratado, admin, pathname]);

  return null;
}

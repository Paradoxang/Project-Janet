"use client";

import { usePathname } from "@/i18n/navigation";
import { esPago } from "@/lib/secciones";

/**
 * El marco de cada página de la tienda (rediseño del 26-10): cabecera, página y pie a todo el ancho, como el canon. En
 * el pago, la cabecera mínima y sin pie. La ruta se conoce al generar el HTML, así que cada página sale ya con su marco,
 * sin saltos.
 */
export function MarcoTienda({
  cabecera,
  cabeceraPago,
  pie,
  children,
}: {
  cabecera: React.ReactNode;
  cabeceraPago: React.ReactNode;
  pie: React.ReactNode;
  children: React.ReactNode;
}) {
  if (esPago(usePathname())) {
    return (
      <>
        {cabeceraPago}
        <main className="min-h-[60vh]">{children}</main>
      </>
    );
  }
  return (
    <>
      {cabecera}
      <main className="min-h-[60vh] min-w-0">{children}</main>
      {pie}
    </>
  );
}

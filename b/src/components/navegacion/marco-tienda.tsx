"use client";

import { usePathname } from "@/i18n/navigation";
import { conBarraLateral, esPago } from "@/lib/secciones";
import { BarraLateral } from "./barra-lateral";

/**
 * El marco de cada página de la tienda (rediseño del 26-10). En las páginas de catálogo, la barra lateral fija a la
 * izquierda desde 1024 px; en el pago, la cabecera mínima y sin pie. La ruta se conoce al generar el HTML, así que cada
 * página sale ya con su marco, sin saltos.
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
  const ruta = usePathname();
  if (esPago(ruta)) {
    return (
      <>
        {cabeceraPago}
        <main className="min-h-[60vh]">{children}</main>
      </>
    );
  }
  const lateral = conBarraLateral(ruta);
  return (
    <>
      {cabecera}
      <div className={lateral ? "lg:grid lg:grid-cols-[272px_minmax(0,1fr)]" : undefined}>
        {lateral ? (
          <aside className="cabecera-tienda border-line sticky top-[var(--alto-arriba,100px)] hidden max-h-[calc(100svh-var(--alto-arriba,100px))] self-start overflow-y-auto border-r px-3 pt-6 pb-10 lg:block">
            <BarraLateral />
          </aside>
        ) : null}
        <main className="min-h-[60vh] min-w-0">{children}</main>
      </div>
      {pie}
    </>
  );
}

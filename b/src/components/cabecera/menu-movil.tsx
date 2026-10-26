"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { BarraLateral } from "@/components/navegacion/barra-lateral";
import { PestanasSeccion } from "@/components/navegacion/pestanas-seccion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { conBarraLateral } from "@/lib/secciones";
import { cn } from "@/lib/utils";
import { Logo } from "@/marca/marca";

/**
 * El menú hamburguesa (pedido de la clienta): abre la misma barra lateral de categorías, con las dos
 * secciones arriba. En escritorio solo aparece en las páginas que no llevan la barra fija (ficha, mapa, carrito…).
 */
export function MenuMovil() {
  const t = useTranslations();
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const fija = conBarraLateral(usePathname());
  const enlace = "block rounded-lg px-3 py-2 text-[15px] hover:bg-surface";
  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("cabecera.menu")}
          data-testid="boton-menu"
          className={cn(
            "text-ink hover:bg-surface grid size-11 shrink-0 place-items-center rounded-lg",
            fija && "lg:hidden",
          )}
        >
          <Menu className="size-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-papel w-[86vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-line border-b p-4">
          <SheetTitle>
            <Logo className="h-8" />
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 p-3 pb-8">
          <PestanasSeccion alNavegar={cerrar} />
          <BarraLateral alNavegar={cerrar} />
          <div className="border-line border-t pt-3">
            <Link href="/faq" onClick={cerrar} className={enlace}>
              {t("nav.faq")}
            </Link>
            <Link href="/panel" onClick={cerrar} className={enlace}>
              {t("nav.panel")}
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

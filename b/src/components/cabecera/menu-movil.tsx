"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconoMenu } from "@/components/cuento/iconos";
import { BarraLateral } from "@/components/navegacion/barra-lateral";
import { PestanasSeccion } from "@/components/navegacion/pestanas-seccion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/marca/marca";
import { SelectorIdioma } from "./selector-idioma";

/**
 * El menú hamburguesa (pedido de la clienta): abre el cajón con las dos secciones y todas las categorías. Con el canon
 * no hay barra lateral fija en el escritorio (el catálogo se filtra con píldoras), así que el botón se ve siempre.
 */
export function MenuMovil() {
  const t = useTranslations();
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const enlace = "block rounded-lg px-3 py-2 text-[15px] text-crema hover:bg-crema/10";
  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("cabecera.menu")}
          data-testid="boton-menu"
          className="chip-icono shrink-0"
        >
          <IconoMenu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="cajon-noche noche border-crema/10 bg-noche text-crema w-[86vw] max-w-sm overflow-y-auto p-0"
      >
        <SheetHeader className="border-crema/15 border-b p-4">
          <SheetTitle>
            <Logo negativo className="h-8" />
          </SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 p-3 pb-8">
          <PestanasSeccion alNavegar={cerrar} />
          <BarraLateral alNavegar={cerrar} />
          <div className="border-crema/15 border-t pt-3">
            <Link href="/faq" onClick={cerrar} className={enlace}>
              {t("nav.faq")}
            </Link>
            <Link href="/panel" onClick={cerrar} className={enlace}>
              {t("nav.panel")}
            </Link>
            <div className="px-3 pt-3">
              <SelectorIdioma pie />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { CircleCheck } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { srcProducto } from "@/lib/catalogo";
import { aCentavos, aDolares, precio } from "@/lib/formato";
import type { Idioma } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { contarArticulos, useCarrito } from "@/stores/carrito";
import { useCarritoUI } from "@/stores/carrito-ui";
import { BarraEnvio } from "./barra-envio";

/** Panel lateral que aparece al agregar al carrito (como el de Amazon). */
export function PanelCarrito() {
  const t = useTranslations("carrito");
  const locale = useLocale() as Idioma;
  const { porId } = useCatalogo();
  const { abierto, ultimo, cerrar } = useCarritoUI();
  const lineas = useCarrito((s) => s.lineas);
  const activas = lineas.filter((l) => !l.guardado && porId.has(l.id));
  const subtotal = activas.reduce((s, l) => s + aCentavos(porId.get(l.id)!.price) * l.qty, 0);
  const agregado = ultimo ? porId.get(ultimo) : undefined;
  const n = contarArticulos(activas);

  return (
    <Sheet open={abierto} onOpenChange={(v) => (v ? null : cerrar())}>
      <SheetContent side="right" className="w-[88vw] max-w-sm gap-0 overflow-y-auto p-0" data-testid="panel-carrito">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-stock">
            <CircleCheck className="size-5" aria-hidden="true" />
            {t("agregadoTitulo")}
          </SheetTitle>
          <SheetDescription className="sr-only">{t("titulo")}</SheetDescription>
          {agregado ? (
            <div className="mt-2 flex items-center gap-3">
              <span className={cn("grid size-16 shrink-0 place-items-center rounded-md", FONDO_TINTE[agregado.tint])}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={srcProducto(agregado)} alt="" className="size-14" />
              </span>
              <span className="line-clamp-2 text-sm font-semibold">{agregado.title[locale]}</span>
            </div>
          ) : null}
        </SheetHeader>
        <div className="grid gap-4 p-4">
          <p className="text-lg">
            {t("subtotal", { n })}: <b>{precio(aDolares(subtotal), locale)}</b>
          </p>
          <BarraEnvio subtotal={subtotal} />
          <div className="grid gap-2">
            <Button asChild variant="cta" size="lg" className="w-full">
              <Link href="/checkout" onClick={cerrar} data-testid="panel-pagar">
                {t("pagar")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/cart" onClick={cerrar} data-testid="panel-ir-carrito">
                {t("irAlCarrito")}
              </Link>
            </Button>
          </div>
          {activas.length > 1 ? (
            <ul className="grid gap-2 border-t pt-4">
              {activas
                .filter((l) => l.id !== ultimo)
                .map((l) => {
                  const p = porId.get(l.id)!;
                  return (
                    <li key={l.id} className="flex items-center gap-3 text-sm">
                      <span className={cn("grid size-11 shrink-0 place-items-center rounded-md", FONDO_TINTE[p.tint])}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={srcProducto(p)} alt="" className="size-9" />
                      </span>
                      <span className="line-clamp-2 flex-1">{p.title[locale]}</span>
                      <span className="text-muted-ink">×{l.qty}</span>
                    </li>
                  );
                })}
            </ul>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

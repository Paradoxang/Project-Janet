"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { aCentavos, aDolares, precio } from "@/lib/formato";
import type { Idioma } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { contarArticulos, useCarrito } from "@/stores/carrito";
import { useCarritoUI } from "@/stores/carrito-ui";
import { BarraEnvio } from "./barra-envio";
import { ImagenSuelta } from "@/components/producto/foto-ia";

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
      <SheetContent
        side="right"
        className="cajon-noche noche border-crema/10 bg-noche text-crema w-[88vw] max-w-sm gap-0 overflow-y-auto p-0"
        data-testid="panel-carrito"
      >
        <SheetHeader className="border-crema/15 border-b p-5">
          <SheetTitle className="font-display text-crema flex items-center gap-2 text-[20px] font-semibold">
            <span aria-hidden="true" className="text-calendula">
              ✓
            </span>
            {t("agregadoTitulo")}
          </SheetTitle>
          <SheetDescription className="sr-only">{t("titulo")}</SheetDescription>
          {agregado ? (
            <div className="mt-2 flex items-center gap-3">
              <span
                className={cn(
                  "border-papel grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border-4",
                  FONDO_TINTE[agregado.tint],
                )}
              >
                <ImagenSuelta
                  illustration={agregado.illustration}
                  imagen={agregado.imagen}
                  className="size-14"
                  claseFoto="size-full object-cover"
                />
              </span>
              <span className="font-display text-crema line-clamp-2 text-[15px]">
                {agregado.title[locale]}
              </span>
            </div>
          ) : null}
        </SheetHeader>
        <div className="grid gap-5 p-5">
          <p className="font-display text-crema flex items-baseline justify-between gap-3 text-[17px]">
            {t("subtotal", { n })}
            <b className="text-calendula text-[24px]">{precio(aDolares(subtotal), locale)}</b>
          </p>
          <BarraEnvio subtotal={subtotal} noche />
          <div className="grid gap-2">
            <Button asChild variant="cta" size="lg" className="w-full">
              <Link href="/checkout" onClick={cerrar} data-testid="panel-pagar">
                {t("pagar")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-crema hover:bg-crema/10 w-full"
            >
              <Link href="/cart" onClick={cerrar} data-testid="panel-ir-carrito">
                {t("irAlCarrito")}
              </Link>
            </Button>
          </div>
          {activas.length > 1 ? (
            <ul className="border-crema/15 grid gap-3 border-t pt-5">
              {activas
                .filter((l) => l.id !== ultimo)
                .map((l) => {
                  const p = porId.get(l.id)!;
                  return (
                    <li key={l.id} className="text-crema flex items-center gap-3 text-sm">
                      <span
                        className={cn(
                          "border-papel grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-[3px]",
                          FONDO_TINTE[p.tint],
                        )}
                      >
                        <ImagenSuelta
                          illustration={p.illustration}
                          imagen={p.imagen}
                          className="size-9"
                          claseFoto="size-full object-cover"
                        />
                      </span>
                      <span className="line-clamp-2 flex-1">{p.title[locale]}</span>
                      <span className="text-crema/75">×{l.qty}</span>
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

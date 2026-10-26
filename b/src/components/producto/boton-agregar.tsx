"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCarrito } from "@/stores/carrito";
import { useCarritoUI } from "@/stores/carrito-ui";
import { cn } from "@/lib/utils";

export function BotonAgregar({
  id,
  qty = 1,
  compacto = false,
  className,
  deshabilitado = false,
}: {
  id: string;
  qty?: number;
  compacto?: boolean;
  className?: string;
  deshabilitado?: boolean;
}) {
  const t = useTranslations("producto");
  const agregar = useCarrito((s) => s.agregar);
  const abrirPanel = useCarritoUI((s) => s.abrir);
  const [agregado, setAgregado] = useState(false);
  useEffect(() => {
    if (!agregado) return;
    const reloj = setTimeout(() => setAgregado(false), 1600);
    return () => clearTimeout(reloj);
  }, [agregado]);
  return (
    <Button
      type="button"
      variant="cta"
      size={compacto ? "lg" : "xl"}
      disabled={deshabilitado}
      data-testid="agregar"
      className={cn("w-full", className)}
      onClick={() => {
        agregar(id, qty);
        setAgregado(true);
        abrirPanel(id);
      }}
    >
      {agregado ? (
        <>
          <span aria-hidden="true" className="saltito">
            ✓
          </span>
          {t("agregadoCorto")}
        </>
      ) : (
        t("agregar")
      )}
    </Button>
  );
}

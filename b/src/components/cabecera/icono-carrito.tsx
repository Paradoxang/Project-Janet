"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useHidratado } from "@/hooks/use-hidratado";
import { contarArticulos, useCarrito } from "@/stores/carrito";

export function IconoCarrito() {
  const t = useTranslations("cabecera");
  const hidratado = useHidratado();
  const lineas = useCarrito((s) => s.lineas);
  const n = hidratado ? contarArticulos(lineas) : 0;
  const anterior = useRef(n);
  const [salto, setSalto] = useState(0);
  useEffect(() => {
    if (n > anterior.current) setSalto((x) => x + 1);
    anterior.current = n;
  }, [n]);
  return (
    <Link
      href="/cart"
      data-testid="icono-carrito"
      aria-label={`${t("carrito")} (${n})`}
      className="relative grid size-10 place-items-center rounded-md text-ink hover:bg-surface"
    >
      <ShoppingCart className="size-6" aria-hidden="true" />
      <span
        key={salto}
        data-testid="contador-carrito"
        className="saltito absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-extrabold text-brand-ink"
      >
        {n}
      </span>
    </Link>
  );
}

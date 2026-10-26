"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const MAXIMO = 6; // grados de inclinación en el borde del estante

/**
 * El estante 3D del canon: la rejilla entera se inclina un poco hacia el cursor (rotateX/rotateY, 0,3 s) y cada portada
 * se adelanta al pasar (CSS: .tarjeta-cuento). Sin ratón fino o con «reducir movimiento», no se inclina.
 */
export function EstanteInclinado({
  children,
  className,
  como = "div",
  ...resto
}: {
  children: React.ReactNode;
  className?: string;
  /** «ul» cuando los hijos son <li> (una lista de productos). */
  como?: "div" | "ul";
} & React.AriaAttributes & { "data-testid"?: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const plano = useRef<HTMLElement>(null);

  useEffect(() => {
    const c = caja.current;
    const p = plano.current;
    if (!c || !p) return;
    const fino = window.matchMedia("(pointer: fine)").matches;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fino || quieto) return;
    let pendiente = 0;
    const mover = (e: PointerEvent) => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(() => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        p.style.setProperty("--ry", `${(x * MAXIMO).toFixed(2)}deg`);
        p.style.setProperty("--rx", `${(-y * MAXIMO).toFixed(2)}deg`);
      });
    };
    const soltar = () => {
      cancelAnimationFrame(pendiente);
      p.style.setProperty("--ry", "0deg");
      p.style.setProperty("--rx", "0deg");
    };
    c.addEventListener("pointermove", mover);
    c.addEventListener("pointerleave", soltar);
    return () => {
      cancelAnimationFrame(pendiente);
      c.removeEventListener("pointermove", mover);
      c.removeEventListener("pointerleave", soltar);
    };
  }, []);

  const Plano = como;
  return (
    <div ref={caja} className="estante">
      <Plano ref={plano as React.Ref<never>} className={cn("estante-plano", className)} {...resto}>
        {children}
      </Plano>
    </div>
  );
}

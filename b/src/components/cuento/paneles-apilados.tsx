"use client";

import { useEffect, useRef } from "react";

const limitar = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Los paneles apilados del canon: cada `.panel-apilado` se queda pegado arriba; cuando el siguiente lo tapa, se encoge
 * un 4 %, y el que llega entra desenfocado (hasta 10 px, que bajan rápido) hasta asentarse. Aquí solo se calculan --escala y --desenfoque al
 * bajar; lo pegado lo hace el CSS desde 768 px. Con «reducir movimiento» no se calcula nada y los paneles van quietos.
 */
export function PanelesApilados({ children }: { children: React.ReactNode }) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = caja.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ancho = window.matchMedia("(min-width: 768px)");
    const paneles = [...c.querySelectorAll<HTMLElement>(".panel-apilado")];
    let pendiente = 0;
    const medir = () => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(() => {
        const arriba =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--alto-arriba"),
          ) || 0;
        const alto = window.innerHeight - arriba;
        paneles.forEach((p, i) => {
          if (!ancho.matches) {
            p.style.removeProperty("--escala");
            p.style.removeProperty("--desenfoque");
            return;
          }
          const siguiente = paneles[i + 1];
          const tapado = siguiente
            ? limitar((alto - (siguiente.getBoundingClientRect().top - arriba)) / alto)
            : 0;
          const llegando = i === 0 ? 0 : limitar((p.getBoundingClientRect().top - arriba) / alto);
          p.style.setProperty("--escala", (1 - 0.04 * tapado).toFixed(4));
          // Al cuadrado: el panel que llega se asienta pronto y solo los últimos tramos van desenfocados.
          p.style.setProperty("--desenfoque", `${(10 * llegando * llegando).toFixed(2)}px`);
        });
      });
    };
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      cancelAnimationFrame(pendiente);
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  return <div ref={caja}>{children}</div>;
}

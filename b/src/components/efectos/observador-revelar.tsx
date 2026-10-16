"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Hace que las secciones con [data-revelar] aparezcan suavemente al llegar a ellas.
 * Lo que ya se ve al cargar no se anima (nada de parpadeos), y sin JavaScript todo se ve normal.
 */
export function ObservadorRevelar() {
  const ruta = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const raiz = document.documentElement;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-visto", "si");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    let pendiente = false;
    const vigilar = () => {
      pendiente = false;
      document.querySelectorAll<HTMLElement>("[data-revelar]:not([data-visto])").forEach((el) => {
        const r = el.getBoundingClientRect();
        const enPantalla = r.top < window.innerHeight && r.bottom > 0;
        if (enPantalla && !raiz.classList.contains("js-revelar")) el.setAttribute("data-visto", "inicio");
        else io.observe(el);
      });
    };
    vigilar();
    raiz.classList.add("js-revelar");
    const mo = new MutationObserver(() => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(vigilar);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ruta]);
  return null;
}

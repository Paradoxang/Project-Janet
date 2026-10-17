"use client";

import { useEffect, useRef, useState } from "react";

const UMBRAL = 6; // px de desplazamiento que cuentan como «bajar» o «subir» (evita parpadeos con el trackpad)

/**
 * La cabecera se queda pegada arriba: se esconde al bajar y vuelve en cuanto se sube un poco, como en Temu (review de
 * usuario, 16-10: «una forma cómoda de volver a la página de inicio»). Va debajo de la franja de demo, que nunca se
 * esconde. Con el foco dentro (teclado) no se esconde, y con «reducir movimiento» aparece y desaparece sin animación.
 */
export function CabeceraFlotante({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [oculta, setOculta] = useState(false);
  const [arriba, setArriba] = useState(0);

  useEffect(() => {
    const franja = ref.current?.previousElementSibling as HTMLElement | null;
    const medir = () => setArriba(franja?.offsetHeight ?? 0);
    medir();
    const observador = franja ? new ResizeObserver(medir) : null;
    if (franja) observador?.observe(franja);

    let ultimo = window.scrollY;
    let pendiente = false;
    const revisar = () => {
      pendiente = false;
      const y = window.scrollY;
      const delta = y - ultimo;
      if (y <= (ref.current?.offsetHeight ?? 0)) setOculta(false);
      else if (delta > UMBRAL) setOculta(true);
      else if (delta < -UMBRAL) setOculta(false);
      if (Math.abs(delta) > UMBRAL || y <= 0) ultimo = y;
    };
    const alDesplazar = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(revisar);
    };
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => {
      window.removeEventListener("scroll", alDesplazar);
      observador?.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="cabecera-flotante" data-oculta={oculta ? "" : undefined} style={{ top: arriba }}>
      {children}
    </div>
  );
}

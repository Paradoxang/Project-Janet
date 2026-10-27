"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/** El número que cuenta de 0 a `hasta` en 1,6 s (curva que frena) cuando aparece. Con «reducir movimiento», ya está. */
function CuentaArriba({ hasta }: { hasta: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let marco = 0;
    const vigia = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      vigia.disconnect();
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const x = Math.min(1, (ahora - inicio) / 1600);
        el.textContent = String(Math.round(hasta * (1 - Math.pow(1 - x, 3))));
        if (x < 1) marco = requestAnimationFrame(paso);
      };
      el.textContent = "0";
      marco = requestAnimationFrame(paso);
    });
    vigia.observe(el);
    return () => {
      vigia.disconnect();
      cancelAnimationFrame(marco);
    };
  }, [hasta]);
  return <span ref={ref}>{hasta}</span>;
}

/**
 * El boletín del pie, como en el canon: a la izquierda el número que cuenta y la invitación; a la derecha el correo en
 * el campo de línea y «Suscribirme →». Es de demostración: no se guarda ni se envía nada.
 */
export function Boletin({ juguetes }: { juguetes: number }) {
  const t = useTranslations("pie");
  const [hecho, setHecho] = useState(false);
  return (
    <div className="border-crema/15 grid gap-10 border-b pb-14 md:grid-cols-2 md:items-end md:gap-16">
      <div>
        <p className="cejilla text-calendula flex items-center gap-2">
          <span aria-hidden="true" className="chispa text-[10px]" />
          {t("boletinCejilla")}
        </p>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="subdisplay text-calendula">
            <CuentaArriba hasta={juguetes} />
          </span>
          <span className="font-display text-crema text-[18px] font-semibold">
            {t("boletinNumero")}
          </span>
        </p>
        <p className="font-display text-crema mt-3 max-w-md text-[clamp(1.4rem,2.6vw,2rem)] leading-tight font-semibold">
          {t("boletinTitulo")}
        </p>
      </div>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setHecho(true);
        }}
      >
        <label htmlFor="correo-boletin" className="cejilla text-crema/80">
          {t("boletinCorreo")}
        </label>
        <div className="flex flex-wrap items-end gap-3">
          <input
            id="correo-boletin"
            type="email"
            required
            autoComplete="off"
            placeholder={t("boletinPista")}
            className="campo-boletin min-w-0 flex-1 basis-56"
          />
          <button type="submit" className="placa">
            {t("boletinBoton")} <span aria-hidden="true">→</span>
          </button>
        </div>
        <p role="status" className="text-crema/75 text-[13px]">
          {hecho ? t("boletinGracias") : t("boletinNota")}
        </p>
      </form>
    </div>
  );
}

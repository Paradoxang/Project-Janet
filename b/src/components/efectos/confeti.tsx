"use client";

import { useMemo } from "react";

const COLORES = ["#E8505B", "#F2753A", "#FFC940", "#3FBF7F", "#3D8BFD", "#7B61FF", "#F48FB1"];

/** Una explosión corta de papelitos de colores. Se dibuja una vez por cada `disparo` distinto. */
export function Confeti({ disparo, cantidad = 26 }: { disparo: number; cantidad?: number }) {
  const piezas = useMemo(() => {
    // Pseudoaleatorio con semilla: el mismo disparo da el mismo dibujo (y no rompe la hidratación).
    let semilla = disparo * 9301 + 49297;
    const azar = () => {
      semilla = (semilla * 9301 + 49297) % 233280;
      return semilla / 233280;
    };
    return Array.from({ length: cantidad }, (_, i) => {
      const angulo = azar() * Math.PI * 2;
      const distancia = 60 + azar() * 110;
      return {
        i,
        x: `${Math.cos(angulo) * distancia}px`,
        y: `${Math.sin(angulo) * distancia - 40}px`,
        r: `${Math.round(azar() * 720 - 360)}deg`,
        color: COLORES[i % COLORES.length],
        retraso: `${Math.round(azar() * 120)}ms`,
      };
    });
  }, [disparo, cantidad]);

  if (disparo === 0) return null;
  return (
    <span key={disparo} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
      {piezas.map((p) => (
        <span
          key={p.i}
          className="papelito"
          style={
            {
              background: p.color,
              "--x": p.x,
              "--y": p.y,
              "--r": p.r,
              animationDelay: p.retraso,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

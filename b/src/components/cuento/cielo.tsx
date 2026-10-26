import { cn } from "@/lib/utils";

/**
 * Estrellas en sitios fijos, sacados de una semilla: el HTML del servidor y el del navegador salen iguales. Una de cada
 * siete es grande; todas titilan a su ritmo (6 s, con desfase).
 */
function estrellas(cantidad: number, semilla: number) {
  let s = semilla;
  const azar = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: cantidad }, () => {
    const x = azar() * 100;
    const y = azar() * 100;
    const r = azar();
    return {
      x: x.toFixed(2),
      y: y.toFixed(2),
      tam: r < 0.14 ? 3 : r < 0.5 ? 2 : 1,
      retraso: (azar() * 6).toFixed(2),
    };
  });
}

/** Las tres órbitas del canon (64 s, 44 s al revés y 30 s), con un planeta de cada acento. */
export function Orbitas({ className }: { className?: string }) {
  const anillos = [
    { tam: "100%", vuelta: "64s", color: "var(--m-mandarina)", reves: false },
    { tam: "74%", vuelta: "44s", color: "var(--m-aqua)", reves: true },
    { tam: "48%", vuelta: "30s", color: "var(--m-calendula)", reves: false },
  ];
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute aspect-square", className)}>
      {anillos.map((a) => (
        <span
          key={a.vuelta}
          className="orbita top-1/2 left-1/2"
          style={
            {
              width: a.tam,
              height: a.tam,
              marginLeft: `calc(${a.tam} / -2)`,
              marginTop: `calc(${a.tam} / -2)`,
              "--vuelta": a.vuelta,
              animationDirection: a.reves ? "reverse" : undefined,
            } as React.CSSProperties
          }
        >
          <i style={{ "--color": a.color } as React.CSSProperties} />
        </span>
      ))}
    </div>
  );
}

/**
 * El cielo del canon: el degradado de respaldo con sus nebulosas, las estrellas y, si se pide, las órbitas en el centro.
 * Va de fondo (absolute inset-0) dentro de una sección azul noche.
 */
export function Cielo({
  cantidad = 70,
  semilla = 7,
  orbitas = false,
  claseOrbitas,
  className,
}: {
  cantidad?: number;
  semilla?: number;
  orbitas?: boolean;
  claseOrbitas?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("cielo pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {estrellas(cantidad, semilla).map((e, i) => (
        <span
          key={i}
          className="estrella"
          style={{
            left: `${e.x}%`,
            top: `${e.y}%`,
            width: e.tam,
            height: e.tam,
            animationDelay: `-${e.retraso}s`,
          }}
        />
      ))}
      {orbitas ? <Orbitas className={claseOrbitas} /> : null}
    </div>
  );
}

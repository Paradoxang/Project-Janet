import { cn } from "@/lib/utils";

export interface Hito {
  id: string;
  /** Lo grande de la izquierda: un número de paso o una distancia. */
  numero: string;
  /** Lo pequeño debajo del número (p. ej. «paso» o «millas»). */
  unidad?: string;
  titulo: React.ReactNode;
  texto?: React.ReactNode;
  /** El acento del hito: cada uno con su color, como los eventos del canon. */
  color: "mandarina" | "aqua" | "calendula";
  /** Retratos redondos con borde de papel, apilados (fotos de juguetes). */
  fotos?: string[];
  /** Algo más en la tarjeta (enlaces, estado). */
  pie?: React.ReactNode;
  destacado?: boolean;
}

// Tintas oscuras: el número grande va sobre la tarjeta blanca y pide 3:1 (los acentos vivos no llegan).
const TINTA = {
  mandarina: "text-mandarina-tinta",
  aqua: "text-aqua-tinta",
  calendula: "text-calendula-tinta",
};
const CHISPA = { mandarina: "bg-mandarina", aqua: "bg-aqua", calendula: "bg-calendula" };

/**
 * La línea de tiempo del canon: una espina punteada a la izquierda que se dibuja al llegar (la sección lleva
 * data-revelar), una chispa de color por hito y tarjetas blancas de 18 px en tres columnas (número, cuerpo, retratos).
 */
export function LineaTiempo({ hitos, etiqueta }: { hitos: Hito[]; etiqueta: string }) {
  return (
    <ol aria-label={etiqueta} className="relative grid gap-5 pl-11 md:gap-6 md:pl-[84px]">
      <span
        aria-hidden="true"
        className="espina border-ink/25 absolute top-3 bottom-3 left-[13px] border-l-2 border-dashed md:left-[34px]"
      />
      {hitos.map((h) => (
        <li key={h.id} className="relative">
          <span
            aria-hidden="true"
            className={cn(
              "chispa absolute top-7 -left-[42px] text-[24px] md:-left-[64px] md:text-[30px]",
              CHISPA[h.color],
            )}
          />
          <div
            className={cn(
              "tarjeta-evento grid gap-x-7 gap-y-3 px-6 py-6 md:grid-cols-[110px_minmax(0,1fr)_auto] md:items-center md:px-[30px] md:py-[26px]",
              h.destacado && "ring-stock ring-2",
            )}
          >
            <p className={cn("grid", TINTA[h.color])}>
              <span className="subdisplay">{h.numero}</span>
              {h.unidad ? <span className="cejilla text-ink/70 mt-1">{h.unidad}</span> : null}
            </p>
            <div className="min-w-0">
              <h3 className="font-display text-ink text-[20px] leading-tight font-semibold">
                {h.titulo}
              </h3>
              {h.texto ? (
                <div className="text-ink/80 mt-1.5 text-[15.5px] leading-relaxed">{h.texto}</div>
              ) : null}
              {h.pie ? <div className="mt-2">{h.pie}</div> : null}
            </div>
            {h.fotos?.length ? (
              <div aria-hidden="true" className="flex -space-x-4">
                {h.fotos.map((f) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={f}
                    src={f}
                    alt=""
                    loading="lazy"
                    className="border-papel size-16 rounded-full border-4 object-cover md:size-[72px]"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

import { cn } from "@/lib/utils";

/**
 * El título de sección del canon: cejilla con su punto, el título en Nunito negra que se descubre como una
 * cortina al llegar (la sección lleva data-revelar) y una entradilla. `noche`: sobre azul noche.
 */
export function TituloCuento({
  id,
  cejilla,
  children,
  texto,
  noche = false,
  centrado = false,
  accion,
  className,
}: {
  id: string;
  cejilla?: string;
  children: React.ReactNode;
  texto?: React.ReactNode;
  noche?: boolean;
  centrado?: boolean;
  accion?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-9 flex flex-wrap items-end gap-x-6 gap-y-4 md:mb-12",
        centrado ? "justify-center text-center" : "justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0", centrado && "mx-auto")}>
        {cejilla ? (
          <p
            className={cn(
              "cejilla mb-3 flex items-center gap-2",
              centrado && "justify-center",
              noche ? "text-calendula" : "text-mandarina-tinta",
            )}
          >
            <span aria-hidden="true" className="chispa text-[10px]" />
            {cejilla}
          </p>
        ) : null}
        <h2 id={id} className={cn("titulo-cuento cortina", noche ? "text-crema" : "text-ink")}>
          {children}
        </h2>
        {texto ? (
          <p
            className={cn(
              "mt-4 max-w-xl text-[17px] leading-relaxed",
              centrado && "mx-auto",
              noche ? "text-crema/80" : "text-ink/80",
            )}
          >
            {texto}
          </p>
        ) : null}
      </div>
      {accion}
    </div>
  );
}

/** La palabra de acento de un título: el color lleva el énfasis (como en el canon, sin cursiva). */
export function acento(noche: boolean) {
  function Acento(trozo: React.ReactNode) {
    return <span className={noche ? "text-mandarina" : "text-mandarina-tinta"}>{trozo}</span>;
  }
  return Acento;
}

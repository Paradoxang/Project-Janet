import type { Tinte } from "@/lib/tipos";
import { cn } from "@/lib/utils";

export const FONDO_TINTE: Record<Tinte, string> = {
  cielo: "bg-tint-cielo",
  menta: "bg-tint-menta",
  lila: "bg-tint-lila",
  durazno: "bg-tint-durazno",
  limon: "bg-tint-limon",
};

/** Imagen de producto: ilustración propia sobre el fondo de su edad, rotulada como ilustrativa. */
export function ImagenProducto({
  illustration,
  tint,
  alt,
  etiqueta,
  className,
  prioridad = false,
  zoom = 1,
}: {
  illustration: string;
  tint: Tinte;
  alt: string;
  etiqueta?: string;
  className?: string;
  prioridad?: boolean;
  zoom?: number;
}) {
  return (
    <div className={cn("relative grid aspect-square place-items-center overflow-hidden", FONDO_TINTE[tint], className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/productos/${illustration}.svg`}
        alt={alt}
        width={240}
        height={240}
        loading={prioridad ? "eager" : "lazy"}
        className="h-[82%] w-[82%] object-contain"
        style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
      />
      {etiqueta ? (
        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] leading-tight font-bold text-muted-ink">
          {etiqueta}
        </span>
      ) : null}
    </div>
  );
}

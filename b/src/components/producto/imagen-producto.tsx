import { srcProducto } from "@/lib/catalogo";
import type { Tinte } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { claseIlustracion, FotoIA } from "./foto-ia";

export const FONDO_TINTE: Record<Tinte, string> = {
  cielo: "bg-tint-cielo",
  menta: "bg-tint-menta",
  lila: "bg-tint-lila",
  durazno: "bg-tint-durazno",
  limon: "bg-tint-limon",
};

/**
 * Imagen de producto: ilustración propia (o la foto que subió la dueña) sobre el fondo de su edad. Si el juguete tiene
 * foto con IA, la variante colorida enseña la foto (ver components/producto/foto-ia.tsx).
 */
export function ImagenProducto({
  illustration,
  imagen,
  tint,
  alt,
  etiqueta,
  className,
  prioridad = false,
  zoom = 1,
  claseImagen,
  capa,
}: {
  illustration: string;
  imagen?: string;
  tint: Tinte;
  alt: string;
  etiqueta?: string;
  className?: string;
  prioridad?: boolean;
  zoom?: number;
  claseImagen?: string;
  /** Algo encima de la imagen y debajo del rótulo (p. ej., la capa holográfica). */
  capa?: React.ReactNode;
}) {
  // La foto que sube la dueña manda: con ella no hay foto con IA.
  const conIlustracion = imagen ? undefined : claseIlustracion(illustration);
  const dibujo = conIlustracion !== null;
  return (
    <div className={cn("relative grid aspect-square place-items-center overflow-hidden", FONDO_TINTE[tint], className)}>
      {dibujo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={srcProducto({ illustration, imagen })}
          alt={alt}
          width={240}
          height={240}
          loading={prioridad ? "eager" : "lazy"}
          className={cn("h-[82%] w-[82%] object-contain", conIlustracion, claseImagen)}
          style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
        />
      ) : null}
      {imagen ? null : <FotoIA illustration={illustration} alt={alt} zoom={zoom} rotulo={Boolean(etiqueta)} prioridad={prioridad} />}
      {/* Con foto con IA, la capa (hecha con la ilustración) solo sale con la ilustración. */}
      {dibujo && capa ? (
        conIlustracion ? (
          <span className={cn("contents", conIlustracion)}>{capa}</span>
        ) : (
          capa
        )
      ) : null}
      {dibujo && etiqueta ? (
        <span
          className={cn(
            "absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] leading-tight font-bold text-muted-ink",
            conIlustracion,
          )}
        >
          {etiqueta}
        </span>
      ) : null}
    </div>
  );
}

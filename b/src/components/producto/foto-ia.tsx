import { useTranslations } from "next-intl";
import { srcProducto } from "@/lib/catalogo";
import { fotoIA, tieneIlustracion } from "@/lib/fotos-ia";
import { cn } from "@/lib/utils";

/**
 * La foto con IA del juguete, a sangre, con su rótulo «Imagen ilustrativa (IA)» (ver lib/fotos-ia.ts). Si el juguete
 * tiene ilustración propia, la foto solo se ve en la variante colorida; si no, siempre. Sin foto, no pinta nada.
 * Va dentro de un contenedor con `relative` y `overflow-hidden`.
 */
export function FotoIA({
  illustration,
  alt = "",
  zoom = 1,
  rotulo = true,
  prioridad = false,
}: {
  illustration: string;
  alt?: string;
  zoom?: number;
  rotulo?: boolean;
  prioridad?: boolean;
}) {
  const t = useTranslations("producto");
  const foto = fotoIA(illustration);
  if (!foto) return null;
  return (
    <span className={cn("absolute inset-0", tieneIlustracion(illustration) && "solo-variante-color")} data-testid="foto-ia-producto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto}
        alt={alt}
        width={600}
        height={600}
        loading={prioridad ? "eager" : "lazy"}
        className="h-full w-full object-cover"
        style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
      />
      {rotulo ? (
        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] leading-tight font-bold text-muted-ink">
          {t("imagenIlustrativaIA")}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Para lo que acompaña a la ilustración propia (ella, su rótulo, el holograma): con foto, solo se ve en la tienda blanca.
 * Devuelve null si ese juguete no tiene ilustración propia y sí foto: entonces la ilustración no se pinta.
 */
export function claseIlustracion(illustration: string): string | null | undefined {
  if (!fotoIA(illustration)) return undefined;
  return tieneIlustracion(illustration) ? "solo-variante-base" : null;
}

/**
 * Una imagen suelta del juguete, sin fondo ni rótulo (las miniaturas de la galería, la vista de medidas): la ilustración
 * (o la foto que subió la dueña) y, si tiene foto con IA, la foto, que en la variante colorida va en su lugar.
 */
export function ImagenSuelta({
  illustration,
  imagen,
  className,
  claseFoto,
  style,
}: {
  illustration: string;
  imagen?: string;
  className?: string;
  /** La clase de la foto, si no es la misma que la de la ilustración (la foto llena su cuadro). */
  claseFoto?: string;
  style?: React.CSSProperties;
}) {
  const conIlustracion = imagen ? undefined : claseIlustracion(illustration);
  const foto = imagen ? null : fotoIA(illustration);
  return (
    <>
      {conIlustracion !== null ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={srcProducto({ illustration, imagen })} alt="" className={cn(className, conIlustracion)} style={style} />
      ) : null}
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={foto}
          alt=""
          className={cn(claseFoto ?? className, tieneIlustracion(illustration) && "solo-variante-color")}
          style={style}
          data-testid="foto-ia-suelta"
        />
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Ruler } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { srcProducto } from "@/lib/catalogo";
import type { Tinte } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { fotoIA, tieneIlustracion } from "@/lib/fotos-ia";
import { claseIlustracion } from "./foto-ia";
import { FONDO_TINTE, ImagenProducto } from "./imagen-producto";

const ROTULO =
  "pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-muted-ink";

/** Galería deslizable: foto principal, detalle ampliado y medidas. */
export function Galeria({
  illustration,
  imagen,
  tint,
  alt,
  medidas,
  edades,
}: {
  illustration: string;
  imagen?: string;
  tint: Tinte;
  alt: string;
  medidas: string;
  edades: string;
}) {
  const t = useTranslations("producto");
  const src = srcProducto({ illustration, imagen });
  const conIlustracion = imagen ? undefined : claseIlustracion(illustration);
  const [api, setApi] = useState<CarouselApi>();
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (!api) return;
    const alCambiar = () => setActual(api.selectedScrollSnap());
    alCambiar();
    api.on("select", alCambiar);
    return () => {
      api.off("select", alCambiar);
    };
  }, [api]);

  const vistas = [
    <ImagenProducto key="a" illustration={illustration} imagen={imagen} tint={tint} alt={alt} prioridad className="textura-puntos rounded-card" />,
    <ImagenProducto key="b" illustration={illustration} imagen={imagen} tint={tint} alt="" zoom={1.7} className="textura-puntos rounded-card" />,
    <div key="c" className={cn("relative grid aspect-square place-items-center rounded-card", FONDO_TINTE[tint])}>
      <div className="grid w-[70%] gap-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="mx-auto w-[62%]" />
        {medidas ? (
          <div className="flex items-center justify-center gap-2 rounded-md bg-white/90 px-3 py-2 text-sm font-bold text-ink">
            <Ruler className="size-4" aria-hidden="true" />
            {medidas}
          </div>
        ) : null}
        <p className="text-sm font-bold text-muted-ink">{edades}</p>
      </div>
    </div>,
  ];

  return (
    <div className="grid gap-3" data-testid="galeria">
      <div className="relative">
        <Carousel setApi={setApi} opts={{ loop: false }} aria-label={alt}>
          <CarouselContent>
            {vistas.map((v, i) => (
              <CarouselItem key={i} aria-label={t("imagen", { n: i + 1, total: vistas.length })}>
                {v}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {/* El rótulo es para nuestras ilustraciones y fotos con IA; la foto que sube la dueña es la del producto. */}
        {imagen ? null : (
          <>
            {conIlustracion !== null ? (
              <span className={cn(ROTULO, conIlustracion)}>{t("imagenIlustrativa")}</span>
            ) : null}
            {fotoIA(illustration) ? (
              <span className={cn(ROTULO, tieneIlustracion(illustration) && "solo-variante-color")}>
                {t("imagenIlustrativaIA")}
              </span>
            ) : null}
          </>
        )}
      </div>
      <div className="flex justify-center gap-2">
        {vistas.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={t("verImagen", { n: i + 1 })}
            aria-current={actual === i}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "grid size-14 place-items-center overflow-hidden rounded-md border-2",
              FONDO_TINTE[tint],
              actual === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="size-11"
              style={i === 1 ? { transform: "scale(1.7)" } : undefined}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

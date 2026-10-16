"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Ruler } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import type { Tinte } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { FONDO_TINTE, ImagenProducto } from "./imagen-producto";

/** Galería deslizable: foto principal, detalle ampliado y medidas. */
export function Galeria({
  illustration,
  tint,
  alt,
  medidas,
  edades,
}: {
  illustration: string;
  tint: Tinte;
  alt: string;
  medidas: string;
  edades: string;
}) {
  const t = useTranslations("producto");
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
    <ImagenProducto key="a" illustration={illustration} tint={tint} alt={alt} prioridad className="rounded-card" />,
    <ImagenProducto key="b" illustration={illustration} tint={tint} alt="" zoom={1.7} className="rounded-card" />,
    <div key="c" className={cn("relative grid aspect-square place-items-center rounded-card", FONDO_TINTE[tint])}>
      <div className="grid w-[70%] gap-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/productos/${illustration}.svg`} alt="" className="mx-auto w-[62%]" />
        <div className="flex items-center justify-center gap-2 rounded-md bg-white/90 px-3 py-2 text-sm font-bold text-ink">
          <Ruler className="size-4" aria-hidden="true" />
          {medidas}
        </div>
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
        <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-bold text-muted-ink">
          {t("imagenIlustrativa")}
        </span>
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
              src={`/productos/${illustration}.svg`}
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

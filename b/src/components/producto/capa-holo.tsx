"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { HoloPreset } from "@/components/efectos/holo-card/HoloCard";
import { crearTurnos } from "@/lib/turnos";
import "@/components/efectos/holo-card/HoloCard.css";

// El efecto (WebGL) se descarga aparte y solo cuando una tarjeta lo va a usar.
const HoloCard = dynamic(() => import("@/components/efectos/holo-card/HoloCard"), { ssr: false });

/** Como mucho 8 hologramas a la vez: cada uno es un contexto WebGL y el navegador solo deja tener unos pocos. */
const MAX_HOLOGRAMAS = 8;
let turnos: ReturnType<typeof crearTurnos> | undefined;
function turnosWebgl() {
  turnos ??= crearTurnos(MAX_HOLOGRAMAS, (tarea) => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(tarea, { timeout: 500 });
    else setTimeout(tarea, 50);
  });
  return turnos;
}

/** WebGL dibujado por la CPU (SwiftShader, llvmpipe…). Chrome sin GPU no siempre lo avisa con failIfMajorPerformanceCaveat. */
function porSoftware(gl: WebGL2RenderingContext) {
  let nombre = String(gl.getParameter(gl.RENDERER));
  if (/^webkit webgl$/i.test(nombre)) {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    if (info) nombre = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
  }
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(nombre);
}

let hayGpu: boolean | undefined;
/**
 * ¿Hay WebGL2 con aceleración por hardware? Dibujado por software (equipos sin GPU, PageSpeed Insights)
 * traba la página, y ahí la tarjeta se queda con su imagen de siempre.
 * Crear el contexto de prueba bloquea unos milisegundos: se hace una sola vez, al llegar el primer turno.
 */
function tieneGpu() {
  if (hayGpu === undefined) {
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    } catch {}
    hayGpu = gl !== null && !porSoftware(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return hayGpu;
}

const LADO = 512;
const DIBUJO = Math.round(LADO * 0.82); // como en ImagenProducto: la ilustración ocupa el 82 %
const artes = new Map<string, Promise<string>>();

/**
 * Pinta la imagen del producto sobre su fondo, igual que la imagen de la tarjeta (al 82 %, sin recortar),
 * para usarla de textura. Sirve para las ilustraciones (SVG) y para las fotos que sube la dueña.
 */
function componerArte(src: string, fondo: string): Promise<string> {
  const clave = `${src}|${fondo}`;
  let arte = artes.get(clave);
  if (!arte) {
    arte = (async () => {
      let origen = src;
      let temporal: string | null = null;
      if (src.endsWith(".svg")) {
        // Los SVG solo traen viewBox: se les da tamaño para que se dibujen nítidos en cualquier navegador.
        const texto = await (await fetch(src)).text();
        const svg = texto.replace(/<svg\b(?![^>]*\swidth=)/, `<svg width="${DIBUJO}" height="${DIBUJO}"`);
        temporal = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        origen = temporal;
      }
      try {
        const imagen = new Image();
        imagen.src = origen;
        await imagen.decode();
        const lienzo = document.createElement("canvas");
        lienzo.width = LADO;
        lienzo.height = LADO;
        const ctx = lienzo.getContext("2d");
        if (!ctx) throw new Error("Sin canvas 2D");
        ctx.fillStyle = fondo;
        ctx.fillRect(0, 0, LADO, LADO);
        const proporcion = imagen.naturalWidth / imagen.naturalHeight || 1;
        const ancho = proporcion >= 1 ? DIBUJO : DIBUJO * proporcion;
        const alto = proporcion >= 1 ? DIBUJO / proporcion : DIBUJO;
        ctx.drawImage(imagen, (LADO - ancho) / 2, (LADO - alto) / 2, ancho, alto);
        const png = await new Promise<Blob | null>((listo) => lienzo.toBlob(listo));
        if (!png) throw new Error("Sin PNG");
        return URL.createObjectURL(png);
      } finally {
        if (temporal) URL.revokeObjectURL(temporal);
      }
    })();
    artes.set(clave, arte);
    arte.catch(() => artes.delete(clave));
  }
  return arte;
}

/**
 * Capa holográfica sobre la foto de una tarjeta de producto (HoloCard de React Bits, adaptado).
 * Debajo sigue la imagen normal: si no hay turno ni GPU, o se pidió menos movimiento, se ve esa.
 */
export function CapaHolo({ src, preset = "stars" }: { src: string; preset?: HoloPreset }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [turno, setTurno] = useState(false);
  const [arte, setArte] = useState<string | null>(null);

  // Pide turno mientras la tarjeta está a la vista y lo suelta cuando sale.
  // Si la persona pidió menos movimiento, o no hay GPU, se queda la imagen de siempre.
  useEffect(() => {
    const capa = ref.current;
    if (!capa || hayGpu === false || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let soltar: (() => void) | undefined;
    const vigia = new IntersectionObserver(
      (entradas) => {
        // Con scroll rápido llegan varias juntas: manda la última.
        if (entradas[entradas.length - 1]?.isIntersecting) {
          soltar ??= turnosWebgl().pedir(() => {
            if (tieneGpu()) {
              setTurno(true);
              return;
            }
            // Sin GPU: devuelve el turno y deja de vigilar.
            vigia.disconnect();
            soltar?.();
            soltar = undefined;
          });
        } else if (soltar) {
          soltar();
          soltar = undefined;
          setTurno(false);
        }
      },
      { rootMargin: "120px" },
    );
    vigia.observe(capa);
    return () => {
      vigia.disconnect();
      soltar?.();
    };
  }, []);

  // Con turno, compone el arte con el fondo de ahora; si cambia la marca (otros colores), lo recompone.
  useEffect(() => {
    // Un envoltorio sin caja (display: contents, p. ej. el de la foto con IA) no tiene fondo: manda el de fuera.
    let fondo = ref.current?.parentElement;
    while (fondo && getComputedStyle(fondo).display === "contents") fondo = fondo.parentElement;
    if (!turno || !fondo) return;
    let vigente = true;
    const componer = () => {
      componerArte(src, getComputedStyle(fondo).backgroundColor).then(
        (url) => vigente && setArte(url),
        () => {},
      );
    };
    componer();
    const marca = new MutationObserver(componer);
    marca.observe(document.documentElement, { attributes: true, attributeFilter: ["data-marca"] });
    return () => {
      vigente = false;
      marca.disconnect();
    };
  }, [turno, src]);

  return (
    <span ref={ref} aria-hidden="true" className="absolute inset-0" data-testid="capa-holo">
      {turno && arte ? (
        <HoloCard
          image={arte}
          preset={preset}
          intensity={0.5}
          glare={0.35}
          frame={0}
          edgeSparkle={0}
          radius={0}
          tiltMax={10}
          hoverScale={1.02}
          shadow={false}
          className="holo-card--tienda"
        />
      ) : null}
    </span>
  );
}

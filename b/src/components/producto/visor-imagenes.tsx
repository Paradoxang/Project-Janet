"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconoCerrar, IconoLupa, IconoRegla } from "@/components/cuento/iconos";
import { Dialog as DialogPrimitive } from "radix-ui";
import { fotoIA, tieneIlustracion } from "@/lib/fotos-ia";
import type { Tinte } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { claseIlustracion, ImagenSuelta } from "./foto-ia";
import { FONDO_TINTE, ImagenProducto } from "./imagen-producto";

const MIN = 1;
const MAX = 4;
// El tope según la foto (Santiago, 17-10: «Si ponle al visor un tope»): una foto no se amplía a más de 2 píxeles de
// pantalla por cada píxel suyo, que es cuando se empieza a ver blanda. Nunca baja de 200 %. Las ilustraciones son
// vectores: llegan a MAX.
const PIXELES_POR_PIXEL = 2;
const TOPE_MINIMO = 2;
const PASO = 1.4; // cada «+», «−» o golpe de rueda
const DOBLE = 2.5; // a cuánto acerca el doble clic o el doble toque
const MOVER = 60; // px que mueve cada flecha del teclado con zoom

export type VistaVisor = { tipo: "imagen"; zoom?: number } | { tipo: "medidas" };

/**
 * Visor ampliado de las imágenes de la ficha (encargo 20261017-07; Santiago, 17-10: «cuando alguien le da click a una
 * imagen esta debería ponerse "en el centro de la pantalla" y dejar hacer zoom»). Un diálogo de Radix a pantalla completa
 * (foco atrapado, Esc, la página no se mueve detrás) con zoom por rueda, pellizco, doble clic o doble toque y botones
 * + y −; con zoom, la imagen se arrastra (o se mueve con las flechas). Sin zoom, las flechas y el deslizar cambian de
 * vista. El rótulo de la imagen («Imagen ilustrativa (IA)») queda fijo y siempre a la vista. El zoom máximo depende de
 * la foto que se ve: ver PIXELES_POR_PIXEL.
 */
export function VisorImagenes({
  abierto,
  alCerrar,
  inicio,
  vistas,
  illustration,
  imagen,
  tint,
  titulo,
  medidas,
  edades,
  alVolver,
}: {
  abierto: boolean;
  alCerrar: () => void;
  inicio: number;
  vistas: VistaVisor[];
  illustration: string;
  imagen?: string;
  tint: Tinte;
  titulo: string;
  medidas: string;
  edades: string;
  /** Adónde vuelve el foco al cerrar: a la imagen que lo abrió. */
  alVolver: () => void;
}) {
  const t = useTranslations("visor");
  const tp = useTranslations("producto");
  const [indice, setIndice] = useState(inicio);
  const [escala, setEscala] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [gesto, setGesto] = useState(false);
  const [tope, setTope] = useState(MAX);
  const topeActual = useRef(MAX);
  const escenario = useRef<HTMLDivElement | null>(null);
  const marco = useRef<HTMLDivElement | null>(null);
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const inicioGesto = useRef<{
    escala: number;
    pos: { x: number; y: number };
    dist: number;
    medio: { x: number; y: number };
    x0: number;
    y0: number;
    movido: boolean;
  } | null>(null);
  const ultimoToque = useRef(0);
  const ultimoAlternar = useRef(0);

  const total = vistas.length;
  const vista = vistas[indice] ?? vistas[0];
  // La escala y la posición también en refs: varios golpes de rueda llegan antes de que React vuelva a pintar.
  const actual = useRef({ escala: 1, pos: { x: 0, y: 0 } });

  const fijar = useCallback((s: number, p: { x: number; y: number }) => {
    actual.current = { escala: s, pos: p };
    setEscala(s);
    setPos(p);
  }, []);

  const reiniciar = useCallback(
    (i: number) => {
      const v = vistas[i];
      fijar(v?.tipo === "imagen" ? (v.zoom ?? 1) : 1, { x: 0, y: 0 });
    },
    [vistas, fijar],
  );

  useEffect(() => {
    if (abierto) {
      setIndice(inicio);
      reiniciar(inicio);
    }
  }, [abierto, inicio, reiniciar]);

  /** Cuánto se puede mover la imagen con zoom sin que se salga del todo. */
  const limitar = useCallback((p: { x: number; y: number }, s: number) => {
    const lado = marco.current?.offsetWidth ?? 0;
    const max = ((s - 1) * lado) / 2;
    return { x: Math.max(-max, Math.min(max, p.x)), y: Math.max(-max, Math.min(max, p.y)) };
  }, []);

  /** Zoom manteniendo quieto el punto (relativo al centro del escenario) que está bajo el dedo o el puntero. */
  const zoomEn = useCallback(
    (nueva: number, punto = { x: 0, y: 0 }) => {
      const { escala: vieja, pos: p } = actual.current;
      const s = Math.min(topeActual.current, Math.max(MIN, nueva));
      const k = s / vieja;
      fijar(
        s,
        s === 1
          ? { x: 0, y: 0 }
          : limitar({ x: punto.x - (punto.x - p.x) * k, y: punto.y - (punto.y - p.y) * k }, s),
      );
    },
    [limitar, fijar],
  );

  const relativo = (x: number, y: number) => {
    const r = escenario.current!.getBoundingClientRect();
    return { x: x - (r.left + r.width / 2), y: y - (r.top + r.height / 2) };
  };

  const ir = useCallback(
    (i: number) => {
      const nuevo = (i + total) % total;
      setIndice(nuevo);
      reiniciar(nuevo);
    },
    [total, reiniciar],
  );

  /** El zoom máximo para lo que se ve ahora: con una foto, según sus píxeles; con una ilustración, MAX. */
  const medirTope = useCallback(() => {
    const m = marco.current;
    if (!m) return;
    const dpr = window.devicePixelRatio || 1;
    let nuevo = MAX;
    for (const img of m.querySelectorAll("img")) {
      // Solo la foto que se ve (la otra variante está con display: none) y ya cargada; un SVG no tiene tope.
      if (
        img.getClientRects().length === 0 ||
        !img.naturalWidth ||
        /\.svg($|\?)/.test(img.currentSrc || img.src)
      )
        continue;
      // El ancho de maqueta, sin el zoom del visor; con la escala propia de la imagen si la tiene (la vista de detalle).
      const transformada = getComputedStyle(img).transform;
      const propia =
        transformada && transformada !== "none" ? new DOMMatrixReadOnly(transformada).a : 1;
      const ancho = img.offsetWidth * propia * dpr;
      if (ancho > 0) nuevo = Math.min(nuevo, (PIXELES_POR_PIXEL * img.naturalWidth) / ancho);
    }
    nuevo = Math.min(MAX, Math.max(TOPE_MINIMO, nuevo));
    topeActual.current = nuevo;
    setTope(nuevo);
    if (actual.current.escala > nuevo) fijar(nuevo, limitar(actual.current.pos, nuevo));
  }, [fijar, limitar]);

  // El marco aparece dentro del portal del diálogo: se mide al montarse, al cargar cada imagen y al cambiar de tamaño.
  const quitarMarco = useRef<(() => void) | null>(null);
  const refMarco = useCallback(
    (el: HTMLDivElement | null) => {
      quitarMarco.current?.();
      quitarMarco.current = null;
      marco.current = el;
      if (!el) return;
      const alCargar = () => medirTope();
      el.addEventListener("load", alCargar, true);
      const tamano = new ResizeObserver(() => medirTope());
      tamano.observe(el);
      medirTope();
      quitarMarco.current = () => {
        el.removeEventListener("load", alCargar, true);
        tamano.disconnect();
      };
    },
    [medirTope],
  );

  // Al cambiar de vista, la imagen nueva puede venir ya cargada (sin «load»): se mide después de pintarla.
  useEffect(() => {
    if (!abierto) return;
    const marcoPintado = requestAnimationFrame(() => medirTope());
    return () => cancelAnimationFrame(marcoPintado);
  }, [abierto, indice, medirTope]);

  // La rueda acerca y aleja sin mover la página: el listener no es pasivo. Va en una ref de función porque el escenario
  // aparece dentro del portal del diálogo después de abrirlo, no en el mismo render.
  const quitarRueda = useRef<(() => void) | null>(null);
  const refEscenario = useCallback(
    (el: HTMLDivElement | null) => {
      quitarRueda.current?.();
      quitarRueda.current = null;
      escenario.current = el;
      if (!el) return;
      const alGirar = (e: WheelEvent) => {
        e.preventDefault();
        const r = el.getBoundingClientRect();
        const s = actual.current.escala;
        zoomEn(e.deltaY < 0 ? s * 1.15 : s / 1.15, {
          x: e.clientX - (r.left + r.width / 2),
          y: e.clientY - (r.top + r.height / 2),
        });
      };
      el.addEventListener("wheel", alGirar, { passive: false });
      quitarRueda.current = () => el.removeEventListener("wheel", alGirar);
    },
    [zoomEn],
  );

  // El teclado se escucha en todo el documento mientras está abierto: tocar la imagen puede dejar el foco fuera de los
  // botones y las teclas tienen que seguir funcionando.
  const teclado = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    if (!abierto) return;
    const f = (e: KeyboardEvent) => teclado.current(e);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [abierto]);

  function alBajar(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...punteros.current.values()];
    const medio =
      ps.length === 2 ? { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 } : ps[0];
    const dist = ps.length === 2 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0;
    inicioGesto.current = {
      escala,
      pos,
      dist,
      medio,
      x0: e.clientX,
      y0: e.clientY,
      movido: inicioGesto.current?.movido ?? false,
    };
    if (ps.length === 1) inicioGesto.current.movido = false;
    setGesto(true);
  }

  function alMover(e: React.PointerEvent) {
    if (!punteros.current.has(e.pointerId) || !inicioGesto.current) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = inicioGesto.current;
    const ps = [...punteros.current.values()];
    if (ps.length === 2 && g.dist > 0) {
      // Pellizco: la escala sigue a la distancia entre los dedos y la imagen sigue al punto medio.
      const dist = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      const medio = { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 };
      const s = Math.min(topeActual.current, Math.max(MIN, (g.escala * dist) / g.dist));
      const p = relativo(g.medio.x, g.medio.y);
      const base = {
        x: p.x - (p.x - g.pos.x) * (s / g.escala),
        y: p.y - (p.y - g.pos.y) * (s / g.escala),
      };
      fijar(
        s,
        s === 1
          ? { x: 0, y: 0 }
          : limitar({ x: base.x + medio.x - g.medio.x, y: base.y + medio.y - g.medio.y }, s),
      );
      g.movido = true;
    } else if (ps.length === 1) {
      const dx = e.clientX - g.x0;
      const dy = e.clientY - g.y0;
      if (Math.hypot(dx, dy) > 6) g.movido = true;
      const s = actual.current.escala;
      if (s > 1) fijar(s, limitar({ x: g.pos.x + dx, y: g.pos.y + dy }, s));
    }
  }

  function alSubir(e: React.PointerEvent) {
    const g = inicioGesto.current;
    const eraUno = punteros.current.size === 1;
    punteros.current.delete(e.pointerId);
    if (punteros.current.size > 0) {
      // Queda un dedo: el gesto sigue desde aquí, como un arrastre.
      const [resto] = punteros.current.values();
      inicioGesto.current = {
        escala,
        pos,
        dist: 0,
        medio: resto,
        x0: resto.x,
        y0: resto.y,
        movido: true,
      };
      return;
    }
    setGesto(false);
    if (!g || !eraUno) return;
    const dx = e.clientX - g.x0;
    // Sin zoom, deslizar cambia de vista.
    if (escala === 1 && Math.abs(dx) > 60 && total > 1) {
      ir(indice + (dx < 0 ? 1 : -1));
      return;
    }
    // Doble toque (en el celular el doble clic no llega siempre).
    if (e.pointerType !== "mouse" && !g.movido) {
      const ahora = e.timeStamp;
      if (ahora - ultimoToque.current < 300) {
        ultimoToque.current = 0;
        alternarZoom(e.clientX, e.clientY);
      } else ultimoToque.current = ahora;
    }
  }

  function alternarZoom(x: number, y: number) {
    // En el celular el doble toque también dispara un doble clic: el segundo, dentro de 400 ms, se ignora.
    const ahora = performance.now();
    if (ahora - ultimoAlternar.current < 400) return;
    ultimoAlternar.current = ahora;
    if (actual.current.escala > 1) zoomEn(1);
    else zoomEn(DOBLE, relativo(x, y));
  }

  function alTeclear(e: KeyboardEvent) {
    const k = e.key;
    if (k === "+" || k === "=") zoomEn(escala * PASO);
    else if (k === "-" || k === "_") zoomEn(escala / PASO);
    else if (k === "0") zoomEn(1);
    else if (escala > 1 && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(k)) {
      const d = {
        ArrowLeft: [MOVER, 0],
        ArrowRight: [-MOVER, 0],
        ArrowUp: [0, MOVER],
        ArrowDown: [0, -MOVER],
      }[k]!;
      const { pos: p } = actual.current;
      fijar(escala, limitar({ x: p.x + d[0], y: p.y + d[1] }, escala));
    } else if (k === "ArrowLeft" && total > 1) ir(indice - 1);
    else if (k === "ArrowRight" && total > 1) ir(indice + 1);
    else return;
    e.preventDefault();
  }

  teclado.current = alTeclear;

  // El rótulo de lo que se ve: la ilustración propia, la foto con IA o, con la foto de la dueña, ninguno.
  const conIlustracion = imagen ? undefined : claseIlustracion(illustration);
  const rotulo = "rounded-md bg-white/90 px-2 py-1 text-[12px] font-bold text-muted-ink";
  const boton =
    "grid size-11 shrink-0 place-items-center rounded-full bg-white/90 text-ink hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40";

  return (
    <DialogPrimitive.Root open={abierto} onOpenChange={(v) => (v ? null : alCerrar())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/92" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col outline-none"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            alVolver();
          }}
          data-testid="visor"
        >
          <DialogPrimitive.Title className="sr-only">
            {t("titulo", { producto: titulo })}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t("ayuda")}
          </DialogPrimitive.Description>

          <div className="flex items-center justify-between gap-2 px-3 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2 text-white md:px-6">
            <p
              className="min-w-16 text-sm font-bold"
              aria-live="polite"
              data-testid="visor-contador"
            >
              {t("contador", { n: indice + 1, total })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={boton}
                onClick={() => zoomEn(escala / PASO)}
                disabled={escala <= MIN}
                aria-label={t("alejar")}
                data-testid="visor-alejar"
              >
                <span aria-hidden="true" className="size-5">
                  −
                </span>
              </button>
              <span
                className="w-14 text-center text-sm font-bold tabular-nums"
                data-testid="visor-zoom"
              >
                {Math.round(escala * 100)} %
              </span>
              <button
                type="button"
                className={boton}
                onClick={() => zoomEn(escala * PASO)}
                disabled={escala >= tope - 0.001}
                aria-label={t("acercar")}
                data-testid="visor-acercar"
              >
                <span aria-hidden="true" className="size-5">
                  +
                </span>
              </button>
              <button
                type="button"
                className={boton}
                onClick={() => zoomEn(1)}
                disabled={escala === 1}
                aria-label={t("ajustar")}
              >
                <IconoLupa className="size-5" />
              </button>
            </div>
            <DialogPrimitive.Close
              className={boton}
              aria-label={t("cerrar")}
              data-testid="visor-cerrar"
            >
              <IconoCerrar className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div
            ref={refEscenario}
            className="relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden select-none"
            onPointerDown={alBajar}
            onPointerMove={alMover}
            onPointerUp={alSubir}
            onPointerCancel={alSubir}
            onDoubleClick={(e) => alternarZoom(e.clientX, e.clientY)}
            onClick={(e) => {
              // Un clic en el fondo cierra, como el fondo oscuro de un diálogo. Se mira dónde cayó y no el target: con el
              // puntero capturado, el clic de ratón llega al escenario aunque se haya pulsado la imagen.
              if (inicioGesto.current?.movido || (e.target as HTMLElement).closest("button"))
                return;
              const r = marco.current?.getBoundingClientRect();
              const dentro =
                r &&
                e.clientX >= r.left &&
                e.clientX <= r.right &&
                e.clientY >= r.top &&
                e.clientY <= r.bottom;
              if (!dentro) alCerrar();
            }}
            data-escala={escala.toFixed(2)}
            data-tope={tope.toFixed(2)}
            data-testid="visor-escenario"
          >
            <div
              ref={refMarco}
              className={cn(
                "aspect-square w-[min(94vw,calc(100dvh-10.5rem))] max-w-[860px]",
                escala > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in",
                !gesto &&
                  "transition-transform duration-150 ease-out motion-reduce:transition-none",
              )}
              style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${escala})` }}
            >
              {vista.tipo === "imagen" ? (
                <ImagenProducto
                  illustration={illustration}
                  imagen={imagen}
                  tint={tint}
                  alt={titulo}
                  prioridad
                  className="rounded-card h-full w-full"
                />
              ) : (
                <div
                  className={cn(
                    "rounded-card grid h-full w-full place-items-center",
                    FONDO_TINTE[tint],
                  )}
                >
                  <div className="grid w-[70%] gap-4 text-center">
                    <ImagenSuelta
                      illustration={illustration}
                      imagen={imagen}
                      className="mx-auto w-[62%]"
                      claseFoto="mx-auto w-[62%] rounded-xl"
                    />
                    {medidas ? (
                      <div className="text-ink flex items-center justify-center gap-2 rounded-md bg-white/90 px-3 py-2 text-base font-bold">
                        <IconoRegla className="size-5" />
                        {medidas}
                      </div>
                    ) : null}
                    <p className="text-muted-ink text-base font-bold">{edades}</p>
                  </div>
                </div>
              )}
            </div>

            {total > 1 ? (
              <>
                <button
                  type="button"
                  className={cn(boton, "absolute top-1/2 left-2 -translate-y-1/2 md:left-6")}
                  onClick={() => ir(indice - 1)}
                  aria-label={t("anterior")}
                  data-testid="visor-anterior"
                >
                  <span aria-hidden="true" className="size-6">
                    ‹
                  </span>
                </button>
                <button
                  type="button"
                  className={cn(boton, "absolute top-1/2 right-2 -translate-y-1/2 md:right-6")}
                  onClick={() => ir(indice + 1)}
                  aria-label={t("siguiente")}
                  data-testid="visor-siguiente"
                >
                  <span aria-hidden="true" className="size-6">
                    ›
                  </span>
                </button>
              </>
            ) : null}
          </div>

          {/* El rótulo queda fijo abajo: no crece con el zoom y siempre se ve. */}
          <div
            className="flex justify-center px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
            data-testid="visor-rotulo"
          >
            {imagen ? null : (
              <>
                {conIlustracion !== null ? (
                  <span className={cn(rotulo, conIlustracion)}>{tp("imagenIlustrativa")}</span>
                ) : null}
                {fotoIA(illustration) ? (
                  <span
                    className={cn(rotulo, tieneIlustracion(illustration) && "solo-variante-color")}
                  >
                    {tp("imagenIlustrativaIA")}
                  </span>
                ) : null}
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

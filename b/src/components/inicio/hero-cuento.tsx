"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { IconoPausa, IconoSeguir } from "@/components/cuento/iconos";
import { Cielo, Orbitas } from "@/components/cuento/cielo";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface Diapositiva {
  id: string;
  /** Hoy son fotos hechas con IA; cuando haya vídeos (pregunta abierta a Santiago), `video` con su `src` en mp4. */
  tipo: "imagen" | "video";
  src: string;
  /** Para el vídeo: la imagen que se ve mientras carga y con «reducir movimiento». */
  poster?: string;
  alt: string;
  posicion: string;
  producto: { slug: string; titulo: string };
}

const SEGUNDOS = 6;

const consultaMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)");
function suscribirMovimiento(avisar: () => void) {
  const mq = consultaMovimiento();
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
}

/**
 * El hero del canon (rediseño del 26-10), a pantalla completa: el cielo con sus estrellas, tres órbitas girando, el
 * «vídeo» (nuestras fotos de familias jugando, que pasan solas y se acercan despacio), un velo para leer y el contenido
 * en el centro, que entra línea a línea. Al bajar, la imagen se acerca y el contenido sube y se apaga.
 * Accesible: botón de pausa (WCAG 2.2.2) y puntos; con «reducir movimiento» todo queda quieto. Cada foto va marcada IA.
 */
export function HeroCuento({
  diapositivas,
  prueba,
}: {
  diapositivas: Diapositiva[];
  prueba: string;
}) {
  const t = useTranslations("hero");
  const reducir = useSyncExternalStore(
    suscribirMovimiento,
    () => consultaMovimiento().matches,
    () => false,
  );
  const [indice, setIndice] = useState(0);
  // null = lo que pida el sistema; true/false = lo que eligió la persona con el botón.
  const [pausaElegida, setPausaElegida] = useState<boolean | null>(null);
  const pausado = pausaElegida ?? reducir;
  const n = diapositivas.length;
  const seccion = useRef<HTMLElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  // Solo suena (mudo) el vídeo de la diapositiva activa: empieza desde el principio al llegar y se para con la pausa.
  // Los demás se quedan quietos en su fotograma, sin descargarse hasta que les toca (preload="none").
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === indice && !pausado) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [indice, pausado]);

  useEffect(() => {
    if (pausado || n < 2) return;
    const reloj = window.setInterval(() => setIndice((i) => (i + 1) % n), SEGUNDOS * 1000);
    return () => window.clearInterval(reloj);
  }, [pausado, n]);

  // La coreografía al bajar: --p va de 0 a 1 a lo largo del alto del hero.
  useEffect(() => {
    const el = seccion.current;
    if (!el || reducir) return;
    let pendiente = 0;
    const medir = () => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(() => {
        const p = Math.min(1, Math.max(0, window.scrollY / el.offsetHeight));
        el.style.setProperty("--p", p.toFixed(3));
      });
    };
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => {
      cancelAnimationFrame(pendiente);
      window.removeEventListener("scroll", medir);
      el.style.removeProperty("--p");
    };
  }, [reducir]);

  const actual = diapositivas[indice];
  const lineas = [
    t.rich("linea1", { acento: (x) => <span className="text-mandarina">{x}</span> }),
    t.rich("linea2", { acento: (x) => <span className="text-mandarina">{x}</span> }),
    t.rich("linea3", { acento: (x) => <span className="text-mandarina">{x}</span> }),
  ];

  return (
    <section
      ref={seccion}
      aria-labelledby="hero-titulo"
      className="noche relative isolate flex h-[calc(100svh-var(--alto-arriba,100px))] min-h-[600px] flex-col overflow-hidden"
      data-pausado={pausado ? "" : undefined}
      data-testid="hero"
    >
      <Cielo cantidad={90} />

      {/* El «vídeo»: las fotos, a sangre, dejando ver el cielo por debajo. */}
      <div className="absolute inset-0 [transform:scale(calc(1_+_0.12*var(--p,0)))]">
        {diapositivas.map((d, i) => (
          <div
            key={d.id}
            className="diapositiva absolute inset-0"
            data-activa={i === indice ? "" : undefined}
            aria-hidden={i !== indice}
          >
            {d.tipo === "video" && !reducir ? (
              <video
                ref={(v) => {
                  videos.current[i] = v;
                }}
                className="acercar h-full w-full object-cover opacity-60"
                style={{ objectPosition: d.posicion }}
                src={d.src}
                poster={d.poster}
                muted
                playsInline
                preload={i === 0 ? "auto" : "none"}
                aria-label={i === indice ? d.alt : undefined}
                data-testid="video-ia"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={d.tipo === "video" ? (d.poster ?? d.src) : d.src}
                alt={i === indice ? d.alt : ""}
                className="acercar h-full w-full object-cover opacity-60"
                style={{ objectPosition: d.posicion }}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                data-testid="foto-ia"
              />
            )}
          </div>
        ))}
      </div>

      <Orbitas className="top-[46%] left-1/2 w-[min(118svh,130vw)] -translate-x-1/2 -translate-y-1/2 opacity-80" />

      {/* El velo, más denso en el centro: ahí va el texto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_62%_58%_at_50%_46%,rgb(22_24_58/0.82)_0%,rgb(22_24_58/0.55)_60%,rgb(22_24_58/0.35)_100%)]"
      />

      <div className="envoltura relative z-10 flex flex-1 [transform:translateY(calc(-70px*var(--p,0)))] flex-col items-center justify-center text-center [opacity:calc(1_-_1.4*var(--p,0))]">
        <p
          className="cejilla entrar text-calendula flex items-center gap-2"
          style={{ "--retraso": "0.15s" } as React.CSSProperties}
        >
          <span aria-hidden="true" className="chispa text-[11px]" />
          {t("cejilla")}
        </p>
        <h1
          id="hero-titulo"
          className="titulo-cuento text-crema mt-5 text-[clamp(2.4rem,6.2vw,4.6rem)]"
        >
          {lineas.map((l, i) => (
            <span key={i} className="linea">
              <span style={{ "--retraso": `${0.1 + i * 0.13}s` } as React.CSSProperties}>{l}</span>
            </span>
          ))}
        </h1>
        <p
          className="entrar text-crema/85 mt-5 max-w-[38rem] text-[17px] leading-relaxed md:text-[19px]"
          style={{ "--retraso": "0.7s" } as React.CSSProperties}
        >
          {t("texto")}
        </p>
        <div
          className="entrar mt-8 flex flex-wrap justify-center gap-3"
          style={{ "--retraso": "0.85s" } as React.CSSProperties}
        >
          <Link href="/search" className="placa" data-testid="hero-comprar">
            {t("botonJuguetes")}{" "}
            <span aria-hidden="true" className="size-4">
              →
            </span>
          </Link>
          <Link href="/where-to-buy" className="placa placa-texto text-crema">
            <span aria-hidden="true" className="chispa text-[10px]" />
            {t("botonTiendas")}
          </Link>
        </div>
        <p
          className="entrar text-crema/80 mt-7 text-[14px]"
          style={{ "--retraso": "1s" } as React.CSSProperties}
        >
          <span aria-hidden="true" className="text-calendula mr-1.5 tracking-[0.1em]">
            ★★★★★
          </span>
          {prueba}
        </p>
      </div>

      {/* Un velo desde abajo para la barra de controles: allí el velo del centro es fino y la foto puede ser clara. */}
      <div
        aria-hidden="true"
        className="from-noche/95 via-noche/70 absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t to-transparent"
      />

      {/* Abajo: qué se ve ahora, la señal de bajar y los controles. */}
      <div className="envoltura relative z-10 grid items-center gap-3 pb-5 md:grid-cols-[1fr_auto_1fr] md:pb-7">
        <p className="text-crema/80 hidden min-w-0 text-[13px] md:block">
          <span className="cejilla text-aqua mr-2 text-[0.64rem]">{t("ahora")}</span>
          <Link
            href={`/p/${actual.producto.slug}`}
            className="text-crema font-semibold underline-offset-4 hover:underline"
          >
            {actual.producto.titulo}
          </Link>
          <span className="ml-2 rounded bg-black/60 px-1.5 py-0.5 text-[10.5px] font-bold whitespace-nowrap text-white">
            {t("ia")}
          </span>
        </p>
        <a
          href="#estante"
          className="botar text-crema/80 hover:text-crema hidden justify-self-center md:block"
          aria-label={t("bajar")}
        >
          <span aria-hidden="true" className="size-5">
            ↓
          </span>
        </a>
        <div className="flex items-center justify-center gap-1 md:justify-end">
          <button
            type="button"
            onClick={() => setPausaElegida(!pausado)}
            aria-label={pausado ? t("seguir") : t("pausar")}
            data-testid="hero-pausa"
            className="text-crema ring-crema/35 hover:bg-crema/10 grid size-11 place-items-center rounded-full ring-1"
          >
            {pausado ? <IconoSeguir className="size-4" /> : <IconoPausa className="size-4" />}
          </button>
          <ul className="flex items-center">
            {diapositivas.map((d, i) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setIndice(i)}
                  aria-label={t("diapositiva", { n: i + 1, total: n, titulo: d.producto.titulo })}
                  aria-current={i === indice ? "true" : undefined}
                  className="group grid size-11 place-items-center"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-2.5 rounded-full transition-all duration-500 motion-reduce:transition-none",
                      i === indice
                        ? "bg-calendula w-7"
                        : "bg-crema/45 group-hover:bg-crema/75 w-2.5",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
          <span className="ml-1 rounded bg-black/60 px-1.5 py-0.5 text-[10.5px] font-bold text-white md:hidden">
            {t("ia")}
          </span>
        </div>
      </div>
    </section>
  );
}

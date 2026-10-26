"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, MapPin, Pause, Play } from "lucide-react";
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
 * El hero del rediseño (26-10): lo primero que se ve es una ventana en arco con familias jugando y los juguetes, que
 * pasan solos con un fundido lento y un acercamiento suave, como un vídeo (pedido de la clienta). Alrededor
 * giran tres órbitas: el «orrery» del canon convertido en pelotas de juguete.
 * Accesible: botón de pausa (WCAG 2.2.2), puntos para elegir y, con «reducir movimiento», empieza parado y sin
 * animaciones. Cada foto está marcada como hecha con IA.
 */
export function HeroCuento({ diapositivas }: { diapositivas: Diapositiva[] }) {
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

  useEffect(() => {
    if (pausado || n < 2) return;
    const reloj = window.setInterval(() => setIndice((i) => (i + 1) % n), SEGUNDOS * 1000);
    return () => window.clearInterval(reloj);
  }, [pausado, n]);

  const actual = diapositivas[indice];

  return (
    <section
      aria-labelledby="hero-titulo"
      className="noche relative isolate overflow-hidden rounded-[28px]"
      data-pausado={pausado ? "" : undefined}
      data-testid="hero"
    >
      {/* Chispas de fondo */}
      <span
        aria-hidden="true"
        className="chispa absolute top-[12%] left-[6%] text-[14px] opacity-70"
      />
      <span
        aria-hidden="true"
        className="chispa absolute top-[70%] left-[44%] hidden text-[10px] opacity-60 md:block"
      />
      <span
        aria-hidden="true"
        className="chispa absolute right-[5%] bottom-[9%] text-[18px] opacity-80"
      />

      <div className="grid items-center gap-6 p-5 pb-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] md:gap-8 md:p-10 xl:p-14">
        <div className="order-2 grid justify-items-start gap-4 md:order-1 md:gap-5">
          <p className="cejilla text-calendula flex items-center gap-2">
            <span aria-hidden="true" className="chispa text-[11px]" />
            {t("cejilla")}
          </p>
          <h1
            id="hero-titulo"
            className="font-magia text-crema text-[34px] leading-[1.12] font-bold tracking-[0.01em] sm:text-[44px] xl:text-[60px]"
          >
            {/* El mandarina sobre el azul noche solo en letra grande (pide 3:1; da 4,1:1 o más con los lavados). */}
            {t.rich("titulo", {
              acento: (trozo) => <span className="text-mandarina">{trozo}</span>,
            })}
          </h1>
          <p className="text-crema/80 max-w-[34rem] text-[16px] leading-relaxed md:text-[17.5px]">
            {t("texto")}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/search" className="placa" data-testid="hero-comprar">
              {t("botonJuguetes")}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/where-to-buy" className="placa placa-contorno text-crema">
              <MapPin aria-hidden="true" className="size-4" />
              {t("botonTiendas")}
            </Link>
          </div>
          <p className="text-crema/80 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px]">
            <span className="cejilla text-aqua text-[0.66rem]">{t("ahora")}</span>
            <Link
              href={`/p/${actual.producto.slug}`}
              className="text-crema font-semibold underline-offset-4 hover:underline"
            >
              {actual.producto.titulo}
            </Link>
          </p>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[236px] sm:max-w-[400px] md:order-2 md:max-w-[500px]">
          {/* Las órbitas: tres anillos punteados con su pelota (mandarina, aqua y caléndula). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[46%] left-1/2 hidden aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2 sm:block"
          >
            <span className="orbita inset-0" style={{ "--vuelta": "64s" } as React.CSSProperties}>
              <i style={{ "--color": "var(--m-mandarina)" } as React.CSSProperties} />
            </span>
            <span
              className="orbita inset-[9%] [animation-direction:reverse]"
              style={{ "--vuelta": "44s" } as React.CSSProperties}
            >
              <i style={{ "--color": "var(--m-aqua)" } as React.CSSProperties} />
            </span>
          </div>

          <figure className="ring-crema/10 relative aspect-[4/4.4] overflow-hidden rounded-t-[999px] rounded-b-[32px] bg-[#23265a] shadow-[0_30px_60px_rgb(0_0_0/0.35)] ring-[6px]">
            {diapositivas.map((d, i) => (
              <div
                key={d.id}
                className="diapositiva absolute inset-0"
                data-activa={i === indice ? "" : undefined}
                aria-hidden={i !== indice}
              >
                {d.tipo === "video" && !reducir ? (
                  <video
                    className="acercar h-full w-full object-cover"
                    style={{ objectPosition: d.posicion }}
                    src={d.src}
                    poster={d.poster}
                    muted
                    loop
                    playsInline
                    autoPlay={!pausado}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.tipo === "video" ? (d.poster ?? d.src) : d.src}
                    alt={i === indice ? d.alt : ""}
                    className="acercar h-full w-full object-cover"
                    style={{ objectPosition: d.posicion }}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                    data-testid="foto-ia"
                  />
                )}
              </div>
            ))}
            <figcaption className="rounded-chip absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-white">
              {t("ia")}
            </figcaption>
          </figure>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPausaElegida(!pausado)}
              aria-label={pausado ? t("seguir") : t("pausar")}
              data-testid="hero-pausa"
              className="text-crema ring-crema/30 hover:bg-crema/10 grid size-11 place-items-center rounded-full ring-1"
            >
              {pausado ? (
                <Play aria-hidden="true" className="size-4" />
              ) : (
                <Pause aria-hidden="true" className="size-4" />
              )}
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
                          : "bg-crema/40 group-hover:bg-crema/70 w-2.5",
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

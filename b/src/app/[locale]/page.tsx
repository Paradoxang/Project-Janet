import { getTranslations, setRequestLocale } from "next-intl/server";
import { IconoHoja } from "@/components/cuento/iconos";
import { Cielo } from "@/components/cuento/cielo";
import { BuscarTiendaZip } from "@/components/cuento/buscar-tienda-zip";
import { EstanteInicio } from "@/components/cuento/estante-inicio";
import { LineaTiempo, type Hito } from "@/components/cuento/linea-tiempo";
import { PanelesApilados } from "@/components/cuento/paneles-apilados";
import { acento, TituloCuento } from "@/components/cuento/titulo-cuento";
import { BloquesEdad } from "@/components/inicio/bloques-edad";
import { HeroCuento, type Diapositiva } from "@/components/inicio/hero-cuento";
import { Link } from "@/i18n/navigation";
import { CATEGORIAS, GRUPOS_EDAD, getCatalogoLigero, getStores } from "@/lib/data";
import { RUTA_SALUDABLE } from "@/lib/secciones";
import type { Idioma } from "@/lib/tipos";

/**
 * Las diapositivas del hero: vídeos con IA de familias jugando con juguetes del catálogo (Kling 3.0 std en Higgsfield,
 * a partir de las fotos con IA de la variante colorida, ensanchadas a 16:9; Santiago, 26-10: «Usa higgsfield modelos
 * baratos»). Mudos, de 5 s y en 720p. El póster es su primer fotograma: es lo que se ve al cargar y con «reducir
 * movimiento».
 */
const HERO = [
  {
    id: "torre",
    src: "/hero/torre.mp4",
    poster: "/hero/torre.webp",
    posicion: "62% 50%",
    slug: "magnetic-tiles",
  },
  {
    id: "cohete",
    src: "/hero/cohete.mp4",
    poster: "/hero/cohete.webp",
    posicion: "64% 45%",
    slug: "foam-rocket-launcher",
  },
  {
    id: "aros",
    src: "/hero/aros.mp4",
    poster: "/hero/aros.webp",
    posicion: "58% 50%",
    slug: "rainbow-ring-stacker",
  },
  {
    id: "robot",
    src: "/hero/robot.mp4",
    poster: "/hero/robot.webp",
    posicion: "60% 50%",
    slug: "robot-building-kit",
  },
] as const;

/** Tres juguetes en abanico para el panel de la juguetería: portadas que flotan, como los libros del canon. */
const ABANICO = [
  { foto: "magnetic-tiles", giro: "-10deg", x: "0%", y: "10%" },
  { foto: "plush-dragon", giro: "3deg", x: "30%", y: "0%" },
  { foto: "rocket-launcher", giro: "12deg", x: "60%", y: "12%" },
];

/**
 * El inicio, con la estructura del canon (rediseño del 26-10): el hero a pantalla completa, el estante sobre azul
 * noche, cuatro paneles apilados (edades, juguetes, lo saludable y las tiendas), la línea de «cómo comprar» y el pie.
 */
export default async function Inicio({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const catalogo = await getCatalogoLigero();
  const tiendas = await getStores();
  const conNota = catalogo.filter((p) => p.reviewCount > 0);
  const nota = conNota.reduce((s, p) => s + p.rating, 0) / Math.max(1, conNota.length);
  const diapositivas: Diapositiva[] = HERO.map((h) => {
    const p = catalogo.find((x) => x.slug === h.slug);
    return {
      id: h.id,
      tipo: "video",
      src: h.src,
      poster: h.poster,
      posicion: h.posicion,
      alt: t(`hero.alt.${h.id}`),
      producto: { slug: h.slug, titulo: p?.title[locale as Idioma] ?? "" },
    };
  });
  const foto = (illustration: string) => `/productos-ia/${illustration}.webp`;
  const hitos: Hito[] = [
    {
      id: "edad",
      numero: "01",
      unidad: t("como.paso"),
      color: "mandarina",
      titulo: t("como.edadTitulo"),
      texto: t("como.edadTexto"),
      fotos: [foto("ring-stacker"), foto("teddy-bear")],
    },
    {
      id: "tienda",
      numero: "02",
      unidad: t("como.paso"),
      color: "aqua",
      titulo: t("como.tiendaTitulo"),
      texto: t("como.tiendaTexto", { n: tiendas.length }),
      fotos: [foto("train-set"), foto("tea-set")],
    },
    {
      id: "envio",
      numero: "03",
      unidad: t("como.paso"),
      color: "calendula",
      titulo: t("como.envioTitulo"),
      texto: t("como.envioTexto"),
      fotos: [foto("rc-car"), foto("science-kit")],
    },
    {
      id: "devolver",
      numero: "04",
      unidad: t("como.paso"),
      color: "mandarina",
      titulo: t("como.devolverTitulo"),
      texto: t("como.devolverTexto"),
      fotos: [foto("plush-puppy")],
    },
  ];

  return (
    <>
      <HeroCuento
        diapositivas={diapositivas}
        prueba={t("hero.prueba", {
          nota: nota.toFixed(1),
          juguetes: catalogo.length,
          tiendas: tiendas.length,
        })}
      />

      <EstanteInicio />

      <PanelesApilados>
        {/* 1 · Por edad, sobre el papel */}
        <section
          aria-labelledby="panel-edad"
          className="panel-apilado papel-pintado overflow-hidden"
          data-testid="panel-edad"
        >
          <div className="envoltura grid min-h-[inherit] content-center gap-10 py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="cejilla text-mandarina-tinta mb-3">01 · {t("paneles.edadCejilla")}</p>
                <h2 id="panel-edad" className="titulo-cuento">
                  {t.rich("paneles.edadTitulo", { acento: acento(false) })}
                </h2>
                <p className="text-ink/80 mt-4 max-w-md text-[17px] leading-relaxed">
                  {t("inicio.edadesTexto")}
                </p>
              </div>
              <Link href="/search" className="placa">
                {t("paneles.edadBoton")}{" "}
                <span aria-hidden="true" className="size-4">
                  →
                </span>
              </Link>
            </div>
            <BloquesEdad catalogo={catalogo} edades={GRUPOS_EDAD} />
          </div>
        </section>

        {/* 2 · La juguetería, en azul noche */}
        <section
          aria-labelledby="panel-juguetes"
          className="panel-apilado noche relative overflow-hidden"
          data-testid="panel-juguetes"
        >
          <Cielo cantidad={36} semilla={41} />
          <div className="envoltura relative grid min-h-[inherit] items-center gap-12 py-16 md:py-20 lg:grid-cols-2">
            <div>
              <p className="cejilla text-calendula mb-3">02 · {t("paneles.juguetesCejilla")}</p>
              <h2 id="panel-juguetes" className="titulo-cuento text-crema">
                {t.rich("paneles.juguetesTitulo", { acento: acento(true) })}
              </h2>
              <p className="text-crema/80 mt-4 max-w-md text-[17px] leading-relaxed">
                {t("paneles.juguetesTexto")}
              </p>
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {CATEGORIAS.map((c) => (
                  <li key={c}>
                    <Link
                      href={{ pathname: "/search", query: { categoria: c } }}
                      className="pildora"
                    >
                      {t(`categoria.${c}`)}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/search" className="placa mt-8">
                {t("paneles.juguetesBoton")}{" "}
                <span aria-hidden="true" className="size-4">
                  →
                </span>
              </Link>
            </div>
            <div aria-hidden="true" className="relative mx-auto aspect-[5/4] w-full max-w-[520px]">
              {ABANICO.map((a) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={a.foto}
                  src={`/productos-ia/${a.foto}.webp`}
                  alt=""
                  loading="lazy"
                  className="ring-crema/90 absolute aspect-[4/5] w-[40%] rounded-[12px] object-cover shadow-[0_14px_34px_rgb(0_0_0/0.45)] ring-4"
                  style={{ left: a.x, top: a.y, transform: `rotate(${a.giro})` }}
                />
              ))}
              <span className="absolute right-0 bottom-0 rounded bg-black/60 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                {t("mundos.ia")}
              </span>
            </div>
          </div>
        </section>

        {/* 3 · Lo saludable, en aqua (propuesta abierta) */}
        <section
          aria-labelledby="panel-saludable"
          className="panel-apilado bg-tint-cielo overflow-hidden"
          data-testid="panel-saludable"
        >
          <div className="envoltura grid min-h-[inherit] items-center gap-12 py-16 md:py-20 lg:grid-cols-2">
            <div>
              <p className="cejilla text-aqua-tinta mb-3">03 · {t("paneles.saludableCejilla")}</p>
              <h2 id="panel-saludable" className="titulo-cuento">
                {t.rich("paneles.saludableTitulo", {
                  acento: (x) => <span className="text-aqua-tinta">{x}</span>,
                })}
              </h2>
              <p className="text-ink/80 mt-4 max-w-md text-[17px] leading-relaxed">
                {t("mundos.saludableTexto")}
              </p>
              <Link href={RUTA_SALUDABLE} className="placa placa-noche mt-8">
                {t("mundos.saludableBoton")}{" "}
                <span aria-hidden="true" className="size-4">
                  →
                </span>
              </Link>
            </div>
            <div aria-hidden="true" className="mx-auto grid w-full max-w-[420px] grid-cols-2 gap-4">
              {["bg-white", "bg-tint-menta", "bg-tint-limon", "bg-white"].map((fondo, i) => (
                <span
                  key={i}
                  className={`border-aqua-tinta/40 grid aspect-square place-items-center rounded-[18px] border-2 border-dashed ${fondo}`}
                >
                  <IconoHoja className="text-aqua-tinta/70 size-9" />
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 4 · Las tiendas, en mandarina suave: el ZIP lleva al mapa */}
        <section
          aria-labelledby="panel-tiendas"
          className="panel-apilado bg-tint-durazno overflow-hidden"
          data-testid="panel-tiendas"
        >
          <div className="envoltura grid min-h-[inherit] items-center gap-12 py-16 md:py-20 lg:grid-cols-2">
            <div>
              <p className="cejilla text-mandarina-tinta mb-3">04 · {t("inicio.tiendasCejilla")}</p>
              <h2 id="panel-tiendas" className="titulo-cuento">
                {t.rich("paneles.tiendasTitulo", { acento: acento(false) })}
              </h2>
              <p className="text-ink/80 mt-4 mb-8 max-w-md text-[17px] leading-relaxed">
                {t("inicio.tiendasTexto")}
              </p>
              <BuscarTiendaZip papel />
            </div>
            <div aria-hidden="true" className="relative mx-auto w-full max-w-[440px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/productos/map-puzzle.svg"
                alt=""
                loading="lazy"
                className="w-full drop-shadow-[0_14px_24px_rgb(22_24_58/0.25)]"
              />
              <span className="bg-noche text-crema absolute top-2 right-2 grid size-28 place-items-center rounded-full text-center shadow-[0_10px_26px_rgb(22_24_58/0.35)]">
                <span>
                  <span className="subdisplay text-calendula block">{tiendas.length}</span>
                  <span className="cejilla text-[0.62rem]">{t("paneles.tiendasDemo")}</span>
                </span>
              </span>
            </div>
          </div>
        </section>
      </PanelesApilados>

      <section aria-labelledby="como-titulo" className="papel-pintado relative" data-revelar>
        <div className="envoltura seccion">
          <TituloCuento id="como-titulo" cejilla={t("como.cejilla")} texto={t("como.texto")}>
            {t.rich("como.titulo", { acento: acento(false) })}
          </TituloCuento>
          <LineaTiempo hitos={hitos} etiqueta={t("como.cejilla")} />
        </div>
      </section>
    </>
  );
}

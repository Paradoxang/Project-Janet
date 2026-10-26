"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useCatalogoDeLaTienda } from "@/components/proveedor-catalogo";
import { TarjetaProducto } from "@/components/producto/tarjeta-producto";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { buscar, crearIndice } from "@/lib/buscar";
import { FONDO_EDAD, TINTA_EDAD } from "@/lib/constantes";
import { fotoIA } from "@/lib/fotos-ia";
import type { Categoria, GrupoEdad, Ocasion } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const EDADES: GrupoEdad[] = ["0-12m", "1-2", "3-4", "5-7", "8+"];
const ORDENES = ["relevancia", "precio-asc", "precio-desc", "valoracion"] as const;
type Orden = (typeof ORDENES)[number];

export function ResultadosBusqueda() {
  const t = useTranslations();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const productos = useCatalogoDeLaTienda();
  const indice = useMemo(() => crearIndice(productos), [productos]);

  const q = params.get("q")?.trim() ?? "";
  const edad = params.get("edad") as GrupoEdad | null;
  const categoria = params.get("categoria") as Categoria | null;
  const ocasion = params.get("ocasion") as Ocasion | null;
  const max = Number(params.get("max")) || null;
  const orden = (ORDENES as readonly string[]).includes(params.get("orden") ?? "")
    ? (params.get("orden") as Orden)
    : "relevancia";

  const resultados = useMemo(() => {
    let lista = q
      ? buscar(indice, productos, q)
      : [...productos].sort((a, b) => b.reviewCount - a.reviewCount);
    if (edad) lista = lista.filter((p) => p.ageGroup === edad);
    if (categoria) lista = lista.filter((p) => p.category === categoria);
    if (ocasion) lista = lista.filter((p) => p.occasions.includes(ocasion));
    if (max) lista = lista.filter((p) => p.price < max);
    if (orden === "precio-asc") lista = [...lista].sort((a, b) => a.price - b.price);
    if (orden === "precio-desc") lista = [...lista].sort((a, b) => b.price - a.price);
    if (orden === "valoracion") lista = [...lista].sort((a, b) => b.rating - a.rating);
    return lista;
  }, [indice, productos, q, edad, categoria, ocasion, max, orden]);

  function cambiar(clave: string, valor: string | null) {
    const nuevo = Object.fromEntries(params.entries());
    if (valor === null) delete nuevo[clave];
    else nuevo[clave] = valor;
    router.replace({ pathname, query: nuevo }, { scroll: false });
  }

  const activos: { clave: string; texto: string }[] = [];
  if (categoria) activos.push({ clave: "categoria", texto: t(`categoria.${categoria}`) });
  if (ocasion) activos.push({ clave: "ocasion", texto: t(`ocasion.${ocasion}`) });
  if (max) activos.push({ clave: "max", texto: `< $${max}` });

  // La banda de la categoría (rediseño del 26-10): el color de la edad y una foto suya, o el juguete más vendido de la
  // categoría. En una búsqueda de texto, solo el título.
  const ARCHIVO_EDAD: Record<GrupoEdad, string> = {
    "0-12m": "0-12m",
    "1-2": "1-2",
    "3-4": "3-4",
    "5-7": "5-7",
    "8+": "8",
  };
  const repCategoria = categoria
    ? (productos.find((p) => p.category === categoria && p.bestSeller && fotoIA(p.illustration)) ??
      productos.find((p) => p.category === categoria && fotoIA(p.illustration)))
    : undefined;
  const foto = q
    ? null
    : edad
      ? `/variante/edad-${ARCHIVO_EDAD[edad]}.webp`
      : repCategoria
        ? fotoIA(repCategoria.illustration)
        : null;
  const titulo = q
    ? t("busqueda.titulo", { q })
    : edad
      ? t(`edad.${edad}`)
      : categoria
        ? t(`categoria.${categoria}`)
        : ocasion
          ? t(`ocasion.${ocasion}`)
          : t("busqueda.tituloVacio");
  const cejilla = q
    ? t("busqueda.cejillaBusqueda")
    : edad
      ? t("nav.edad")
      : categoria
        ? t("nav.categorias")
        : ocasion
          ? t("nav.ocasiones")
          : t("nav.juguetes");
  const fondo = edad ? FONDO_EDAD[edad] : categoria ? "bg-tint-durazno" : "bg-warm";
  const pildora = (activa: boolean) =>
    cn(
      "inline-flex h-10 items-center gap-2 rounded-chip px-4 font-display text-[14px] font-semibold transition-colors",
      activa
        ? "bg-mandarina text-noche shadow-[0_6px_16px_rgb(255_106_43/0.28)]"
        : "bg-white text-ink hover:bg-aqua hover:text-noche",
    );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6 md:pt-6">
      <header
        className={cn(
          "relative grid overflow-hidden rounded-[24px] md:min-h-[220px] md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]",
          fondo,
        )}
        data-testid="banda-categoria"
      >
        <div className="relative z-10 grid content-center gap-2 p-6 md:p-10">
          <p className={cn("cejilla", edad ? TINTA_EDAD[edad].texto : "text-mandarina-tinta")}>
            {cejilla}
          </p>
          <h1
            className="font-magia text-[28px] leading-[1.14] font-bold md:text-[44px]"
            data-testid="titulo-busqueda"
          >
            {titulo}
          </h1>
          <p className="text-ink/80 text-[15px]" data-testid="cuenta-resultados">
            {t("busqueda.resultados", { n: resultados.length })}
          </p>
        </div>
        {foto ? (
          <figure className="relative h-44 md:h-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto}
              alt=""
              className="absolute inset-0 h-full w-full object-cover md:[mask-image:linear-gradient(to_right,transparent,#000_30%)]"
            />
            <figcaption className="absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
              {t("inicio.imagenIACorta")}
            </figcaption>
          </figure>
        ) : null}
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {/* «Todos» (review de usuario, 16-10): para volver a ver todo sin tener que desmarcar la edad elegida. */}
        <button
          type="button"
          aria-pressed={!edad}
          onClick={() => cambiar("edad", null)}
          data-testid="filtro-todas-edades"
          className={pildora(!edad)}
        >
          {t("busqueda.todasEdades")}
        </button>
        {EDADES.map((e) => (
          <button
            key={e}
            type="button"
            aria-pressed={edad === e}
            onClick={() => cambiar("edad", edad === e ? null : e)}
            className={pildora(edad === e)}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2.5 rounded-full",
                TINTA_EDAD[e].punto,
                edad === e && "ring-2 ring-white",
              )}
            />
            {t(`edadCorta.${e}`)}
          </button>
        ))}
        {activos.map((a) => (
          <button
            key={a.clave}
            type="button"
            onClick={() => cambiar(a.clave, null)}
            className="rounded-chip bg-noche font-display text-crema inline-flex h-10 items-center gap-1.5 px-4 text-[14px] font-semibold"
          >
            {a.texto} <X className="size-3.5" aria-hidden="true" />
          </button>
        ))}
        <label className="text-muted-ink ml-auto flex items-center gap-2 text-[13.5px]">
          <span className="sr-only md:not-sr-only">{t("catalogo.ordenar")}</span>
          <select
            value={orden}
            onChange={(e) =>
              cambiar("orden", e.target.value === "relevancia" ? null : e.target.value)
            }
            className="rounded-chip border-input font-display text-ink h-10 border bg-white px-3 text-[14px] font-semibold"
          >
            {ORDENES.map((o) => (
              <option key={o} value={o}>
                {t(`catalogo.orden.${o}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* La «promoción de la semana» de la categoría (propuesta P4, aprobada el 16-10): un ejemplo DEMO, sin descuentos. */}
      {categoria ? (
        <aside
          aria-label={t("promo.etiqueta")}
          className="rounded-card shadow-tarjeta mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-white px-4 py-3"
          data-testid="promo-categoria"
        >
          <span className="rounded-chip bg-noche text-crema px-2.5 py-1 text-[12px] font-bold">
            {t("promo.etiqueta")}
          </span>
          <p className="min-w-0 flex-1 text-sm">
            <b>{t(`categoria.${categoria}`)}:</b> {t(`promo.textos.${categoria}`)}
          </p>
          <span className="bg-surface text-muted-ink rounded border px-1 text-[10px] font-extrabold">
            DEMO
          </span>
        </aside>
      ) : null}

      {resultados.length > 0 ? (
        <ul
          className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:gap-x-5 xl:grid-cols-4"
          data-testid="resultados"
        >
          {resultados.map((p) => (
            <li key={p.id}>
              <TarjetaProducto p={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-card shadow-tarjeta mt-10 bg-white p-8 text-center">
          <p className="font-display text-xl font-semibold">{t("busqueda.sinResultados", { q })}</p>
          <p className="text-muted-ink mt-1">{t("busqueda.sinResultadosTexto")}</p>
          <Link href="/" className="text-link mt-4 inline-block font-bold hover:underline">
            {t("inicio.regalosPorEdad")}
          </Link>
        </div>
      )}
    </div>
  );
}

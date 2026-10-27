"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconoCerrar } from "@/components/cuento/iconos";
import { useCatalogoDeLaTienda } from "@/components/proveedor-catalogo";
import { Cielo } from "@/components/cuento/cielo";
import { EstanteInclinado } from "@/components/cuento/estante-inclinado";
import { TarjetaCuento } from "@/components/cuento/tarjeta-cuento";
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
  const total = productos.length;

  // Rediseño del 26-10 con el canon: arriba, sobre el papel, el título y el retrato redondo de la edad o la categoría;
  // debajo, el catálogo sobre azul noche con píldoras (en lugar de la barra lateral) y el estante 3D a tres columnas.
  return (
    <>
      <header className="papel-pintado" data-testid="banda-categoria">
        <div className="envoltura grid items-center gap-10 py-12 md:grid-cols-[minmax(0,1fr)_auto] md:py-16">
          <div>
            <p
              className={cn(
                "cejilla mb-3 flex items-center gap-2",
                edad ? TINTA_EDAD[edad].texto : "text-mandarina-tinta",
              )}
            >
              <span aria-hidden="true" className="chispa text-[10px]" />
              {cejilla}
            </p>
            <h1 className="titulo-cuento" data-testid="titulo-busqueda">
              {titulo}
            </h1>
            <p className="text-ink/80 mt-4 text-[17px]" data-testid="cuenta-resultados">
              {t("busqueda.resultados", { n: resultados.length })}
              <span className="text-muted-ink"> · {t("busqueda.deTotal", { n: total })}</span>
            </p>
          </div>
          {foto ? (
            <figure className="relative mx-auto size-44 md:size-60">
              <span
                aria-hidden="true"
                className="border-ink/20 absolute -inset-5 rounded-full border-2 border-dashed md:-inset-7"
              />
              <span aria-hidden="true" className="chispa absolute -top-3 right-2 text-[22px]" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto}
                alt=""
                className={cn(
                  "border-papel size-full rounded-full border-[6px] object-cover shadow-[0_14px_34px_rgb(22_24_58/0.25)]",
                  edad ? FONDO_EDAD[edad] : "",
                )}
              />
              <figcaption className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/70 px-1.5 py-0.5 text-[10.5px] font-bold whitespace-nowrap text-white">
                {t("inicio.imagenIACorta")}
              </figcaption>
            </figure>
          ) : null}
        </div>
      </header>

      <section
        aria-label={t("busqueda.resultadosEtiqueta")}
        className="noche relative overflow-hidden"
      >
        <Cielo />
        <div className="envoltura relative py-12 md:py-16">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* «Todos» (review de usuario, 16-10): para volver a ver todo sin tener que desmarcar la edad elegida. */}
            <button
              type="button"
              aria-pressed={!edad}
              onClick={() => cambiar("edad", null)}
              data-testid="filtro-todas-edades"
              className="pildora"
            >
              {t("busqueda.todasEdades")}
            </button>
            {EDADES.map((e) => (
              <button
                key={e}
                type="button"
                aria-pressed={edad === e}
                onClick={() => cambiar("edad", edad === e ? null : e)}
                className="pildora"
              >
                <span
                  aria-hidden="true"
                  className={cn("size-2.5 rounded-full", TINTA_EDAD[e].punto)}
                />
                {t(`edadCorta.${e}`)}
              </button>
            ))}
            {activos.map((a) => (
              <button
                key={a.clave}
                type="button"
                onClick={() => cambiar(a.clave, null)}
                aria-label={t("busqueda.quitarFiltro", { filtro: a.texto })}
                className="pildora bg-calendula"
              >
                {a.texto} <IconoCerrar className="size-3.5" />
              </button>
            ))}
            <label className="text-crema/80 ml-auto flex items-center gap-2 text-[14px]">
              <span className="sr-only md:not-sr-only">{t("catalogo.ordenar")}</span>
              <select
                value={orden}
                onChange={(e) =>
                  cambiar("orden", e.target.value === "relevancia" ? null : e.target.value)
                }
                className="rounded-chip bg-crema font-display text-ink h-[2.6rem] border-0 px-4 text-[14px] font-semibold"
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
              className="bg-crema/[0.07] ring-crema/15 mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[18px] px-5 py-4 ring-1"
              data-testid="promo-categoria"
            >
              <span className="cejilla text-calendula">{t("promo.etiqueta")}</span>
              <p className="text-crema/90 min-w-0 flex-1 text-sm">
                <b>{t(`categoria.${categoria}`)}:</b> {t(`promo.textos.${categoria}`)}
              </p>
              <span className="border-crema/30 text-crema/80 rounded border px-1 text-[10px] font-extrabold">
                DEMO
              </span>
            </aside>
          ) : null}

          {resultados.length > 0 ? (
            <EstanteInclinado
              como="ul"
              className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-[30px] lg:grid-cols-3"
              data-testid="resultados"
            >
              {resultados.map((p, i) => (
                <li key={p.id}>
                  <TarjetaCuento p={p} prioridad={i < 3} />
                </li>
              ))}
            </EstanteInclinado>
          ) : (
            <div className="bg-crema/[0.07] ring-crema/15 mt-12 rounded-[18px] p-10 text-center ring-1">
              <p className="font-display text-crema text-2xl font-semibold">
                {t("busqueda.sinResultados", { q })}
              </p>
              <p className="text-crema/80 mt-2">{t("busqueda.sinResultadosTexto")}</p>
              <Link href="/search" className="placa mt-6">
                {t("nav.todosJuguetes")}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

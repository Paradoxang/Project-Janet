"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { TarjetaProducto } from "@/components/producto/tarjeta-producto";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { buscar, crearIndice } from "@/lib/buscar";
import { TINTA_EDAD } from "@/lib/constantes";
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
  const { productos } = useCatalogo();
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
    let lista = q ? buscar(indice, productos, q) : [...productos].sort((a, b) => b.reviewCount - a.reviewCount);
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

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6">
      <h1 className="text-2xl md:text-3xl" data-testid="titulo-busqueda">
        {q ? t("busqueda.titulo", { q }) : edad ? t(`edad.${edad}`) : t("busqueda.tituloVacio")}
      </h1>
      <p className="mt-1 text-sm text-muted-ink" data-testid="cuenta-resultados">
        {t("busqueda.resultados", { n: resultados.length })}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {EDADES.map((e) => (
          <button
            key={e}
            type="button"
            aria-pressed={edad === e}
            onClick={() => cambiar("edad", edad === e ? null : e)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-chip border px-3.5 text-[13.5px] font-semibold",
              edad === e ? "border-ink bg-ink text-white" : "bg-white hover:bg-surface",
            )}
          >
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", TINTA_EDAD[e].punto, edad === e && "ring-2 ring-white")} />
            {t(`edadCorta.${e}`)}
          </button>
        ))}
        {activos.map((a) => (
          <button
            key={a.clave}
            type="button"
            onClick={() => cambiar(a.clave, null)}
            className="inline-flex h-8 items-center gap-1 rounded-chip border border-ink bg-ink px-3 text-[13px] font-bold text-white"
          >
            {a.texto} <X className="size-3.5" aria-hidden="true" />
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-[13px] text-muted-ink">
          <span className="sr-only md:not-sr-only">{t("catalogo.ordenar")}</span>
          <select
            value={orden}
            onChange={(e) => cambiar("orden", e.target.value === "relevancia" ? null : e.target.value)}
            className="h-8 rounded-md border bg-white px-2 text-[13px] font-bold text-ink"
          >
            {ORDENES.map((o) => (
              <option key={o} value={o}>
                {t(`catalogo.orden.${o}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {resultados.length > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5" data-testid="resultados">
          {resultados.map((p) => (
            <li key={p.id}>
              <TarjetaProducto p={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-card border bg-surface p-8 text-center">
          <p className="font-display text-xl">{t("busqueda.sinResultados", { q })}</p>
          <p className="mt-1 text-muted-ink">{t("busqueda.sinResultadosTexto")}</p>
          <Link href="/" className="mt-4 inline-block font-bold text-link hover:underline">
            {t("inicio.regalosPorEdad")}
          </Link>
        </div>
      )}
    </div>
  );
}

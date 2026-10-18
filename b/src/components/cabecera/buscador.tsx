"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { buscar, crearIndice } from "@/lib/buscar";
import { rutaProducto } from "@/lib/catalogo";
import type { Idioma } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { useCatalogoDeLaTienda } from "@/components/proveedor-catalogo";
import { Precio } from "@/components/producto/precio";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { registrarActividad } from "@/stores/actividad";
import { ImagenSuelta } from "@/components/producto/foto-ia";

/** Buscador con sugerencias desde la 2.ª letra (patrón combobox accesible). */
export function Buscador({ className }: { className?: string }) {
  const t = useTranslations("cabecera");
  const locale = useLocale() as Idioma;
  const router = useRouter();
  const productos = useCatalogoDeLaTienda();
  const indice = useMemo(() => crearIndice(productos), [productos]);
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const idLista = useId();
  const entrada = useRef<HTMLInputElement>(null);

  const sugerencias = useMemo(
    () => (q.trim().length >= 2 ? buscar(indice, productos, q, 6) : []),
    [indice, productos, q],
  );
  const visible = abierto && q.trim().length >= 2;

  function irABusqueda() {
    const texto = q.trim();
    if (!texto) return;
    registrarActividad({ tipo: "busqueda", texto });
    setAbierto(false);
    entrada.current?.blur();
    router.push({ pathname: "/search", query: { q: texto } });
  }

  function irAProducto(p: { id: string; slug: string }) {
    setAbierto(false);
    setQ("");
    router.push(rutaProducto(p));
  }

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (visible && activo >= 0 && sugerencias[activo]) irAProducto(sugerencias[activo]);
        else irABusqueda();
      }}
    >
      <div className="flex h-12 items-center overflow-hidden rounded-chip border-[1.5px] border-ink bg-white p-1 focus-within:ring-3 focus-within:ring-ring/40">
        <input
          ref={entrada}
          type="search"
          role="combobox"
          aria-expanded={visible}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={visible && activo >= 0 ? `${idLista}-${activo}` : undefined}
          aria-label={t("buscar")}
          placeholder={t("buscar")}
          value={q}
          data-testid="buscador"
          autoComplete="off"
          enterKeyHint="search"
          onChange={(e) => {
            setQ(e.target.value);
            setAbierto(true);
            setActivo(-1);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          onKeyDown={(e) => {
            if (!visible) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActivo((i) => Math.min(sugerencias.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActivo((i) => Math.max(-1, i - 1));
            } else if (e.key === "Escape") {
              setAbierto(false);
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] text-ink outline-none placeholder:text-muted-ink [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label={t("buscarBoton")}
          className="grid aspect-square h-full place-items-center rounded-full bg-brand text-brand-ink hover:brightness-110"
        >
          <Search className="size-5" strokeWidth={2.5} />
        </button>
      </div>

      {visible ? (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-card border bg-white shadow-lg">
          {sugerencias.length > 0 ? (
            <p className="px-4 pt-2.5 pb-1 text-[13px] font-bold text-muted-ink">
              {t("sugerencias")}
            </p>
          ) : null}
          <ul id={idLista} role="listbox" aria-label={t("sugerencias")}>
            {sugerencias.map((p, i) => (
              <li
                key={p.id}
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === activo}
                data-testid="sugerencia"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => irAProducto(p)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-3 py-2",
                  i === activo ? "bg-surface" : "hover:bg-surface",
                )}
              >
                <span className={cn("grid size-11 shrink-0 place-items-center overflow-hidden rounded-md", FONDO_TINTE[p.tint])}>
                  <ImagenSuelta illustration={p.illustration} imagen={p.imagen} className="size-9" claseFoto="size-full object-cover" />
                </span>
                <span className="line-clamp-2 flex-1 text-sm leading-snug">{p.title[locale]}</span>
                <Precio usd={p.price} className="text-base" />
              </li>
            ))}
          </ul>
          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            className="block w-full border-t px-4 py-2.5 text-left text-sm font-bold text-link hover:bg-surface"
          >
            {t("verTodos", { q: q.trim() })}
          </button>
        </div>
      ) : null}
    </form>
  );
}

"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconoLupa } from "@/components/cuento/iconos";
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
      {/* Rediseño del 26-10: el campo del boletín del canon (transparente, con la línea abajo y caléndula al enfocar), con
          la lupa sólida delante y la placa «Buscar →» detrás. */}
      <div className="flex items-end gap-3">
        <IconoLupa className="text-crema/80 mb-3 size-5" />
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
          className="campo-boletin min-h-11 min-w-0 flex-1 text-[1.02rem] placeholder:font-sans placeholder:text-[0.95rem] [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" aria-label={t("buscarBoton")} className="placa min-h-10 px-4 py-2">
          <span className="hidden sm:inline">{t("buscarBoton")}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {visible ? (
        <div className="noche ring-crema/15 absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-[18px] shadow-[0_18px_40px_rgb(0_0_0/0.4)] ring-1">
          {sugerencias.length > 0 ? (
            <p className="cejilla text-calendula px-5 pt-4 pb-2">{t("sugerencias")}</p>
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
                  "flex cursor-pointer items-center gap-3 px-5 py-2.5",
                  i === activo ? "bg-crema/10" : "hover:bg-crema/10",
                )}
              >
                {/* El retrato redondo del canon, con su borde de papel. */}
                <span
                  className={cn(
                    "border-papel grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border-[3px]",
                    FONDO_TINTE[p.tint],
                  )}
                >
                  <ImagenSuelta
                    illustration={p.illustration}
                    imagen={p.imagen}
                    className="size-9"
                    claseFoto="size-full object-cover"
                  />
                </span>
                <span className="font-display text-crema line-clamp-2 flex-1 text-[15px] leading-snug">
                  {p.title[locale]}
                </span>
                <Precio usd={p.price} className="text-calendula text-[18px]" />
              </li>
            ))}
          </ul>
          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            className="border-crema/15 font-display text-calendula hover:bg-crema/10 flex w-full items-center gap-2 border-t px-5 py-3.5 text-left text-[14px] font-semibold"
          >
            {t("verTodos", { q: q.trim() })}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </form>
  );
}

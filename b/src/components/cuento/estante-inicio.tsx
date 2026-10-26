"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCatalogoDeLaTienda } from "@/components/proveedor-catalogo";
import { Link } from "@/i18n/navigation";
import { GRUPOS_EDAD, TINTA_EDAD } from "@/lib/constantes";
import type { GrupoEdad } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Cielo } from "./cielo";
import { EstanteInclinado } from "./estante-inclinado";
import { TarjetaCuento } from "./tarjeta-cuento";
import { acento, TituloCuento } from "./titulo-cuento";

type Filtro = "todos" | GrupoEdad | "menos25";
const MOSTRAR = 5;

/**
 * El catálogo del canon en el inicio: banda azul noche, píldoras para filtrar (todas, cada edad y menos de 25) y el
 * estante 3D a tres columnas con los más vendidos, más la tarjeta «Ver todos».
 */
export function EstanteInicio() {
  const t = useTranslations();
  const productos = useCatalogoDeLaTienda();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const filtrados = productos.filter((p) =>
    filtro === "todos" ? true : filtro === "menos25" ? p.price < 25 : p.ageGroup === filtro,
  );
  const lista = [...filtrados].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, MOSTRAR);
  const destino =
    filtro === "todos"
      ? "/search"
      : filtro === "menos25"
        ? { pathname: "/search", query: { max: "25" } }
        : { pathname: "/search", query: { edad: filtro } };
  const opciones: { id: Filtro; texto: string; punto?: string }[] = [
    { id: "todos", texto: t("estante.todos") },
    ...GRUPOS_EDAD.map((e) => ({ id: e, texto: t(`edadCorta.${e}`), punto: TINTA_EDAD[e].punto })),
    { id: "menos25", texto: t("estante.menos25") },
  ];

  return (
    <section
      id="estante"
      aria-labelledby="estante-titulo"
      className="noche relative scroll-mt-24 overflow-hidden"
      data-revelar
    >
      <Cielo cantidad={40} semilla={23} />
      <div className="envoltura seccion relative">
        <TituloCuento
          id="estante-titulo"
          noche
          cejilla={t("estante.cejilla")}
          texto={t("estante.texto")}
          accion={
            <Link href={destino} className="placa placa-texto text-crema">
              <span aria-hidden="true" className="chispa text-[10px]" />
              {t("estante.verTodos")}
            </Link>
          }
        >
          {t.rich("estante.titulo", { acento: acento(true) })}
        </TituloCuento>

        <div
          role="group"
          aria-label={t("estante.filtros")}
          className="mb-10 flex flex-wrap gap-2.5"
          data-testid="pildoras-estante"
        >
          {opciones.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={filtro === o.id}
              onClick={() => setFiltro(o.id)}
              className="pildora"
            >
              {o.punto ? (
                <span aria-hidden="true" className={cn("size-2.5 rounded-full", o.punto)} />
              ) : null}
              {o.texto}
            </button>
          ))}
        </div>

        <EstanteInclinado className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-[30px] lg:grid-cols-3">
          {lista.map((p, i) => (
            <TarjetaCuento key={p.id} p={p} prioridad={i < 3} />
          ))}
          <Link
            href={destino}
            className="tarjeta-cuento group portada border-crema/35 bg-crema/[0.04] hover:bg-crema/[0.08] grid aspect-[4/5] content-center justify-items-center gap-3 rounded-[12px] border border-dashed p-6 text-center"
          >
            <span className="subdisplay text-calendula">{filtrados.length}</span>
            <span className="font-display text-crema text-[19px] font-semibold">
              {t("estante.verTodos")}
            </span>
            <span
              aria-hidden="true"
              className="text-crema size-5 transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </EstanteInclinado>
      </div>
    </section>
  );
}

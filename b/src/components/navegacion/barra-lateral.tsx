"use client";

import { useTranslations } from "next-intl";
import { Blocks, ChevronDown, Gift, Leaf, MapPin } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { CATEGORIAS, GRUPOS_EDAD, OCASIONES, TINTA_EDAD } from "@/lib/constantes";
import {
  CATEGORIAS_SALUDABLES,
  PUBLICOS_SALUDABLES,
  RUTA_SALUDABLE,
  seccionDeRuta,
} from "@/lib/secciones";
import { cn } from "@/lib/utils";

const ENLACE =
  "flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-1.5 text-[14.5px] font-semibold text-ink hover:bg-surface";
const SUBENLACE =
  "flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-1 text-[14px] text-ink hover:bg-surface";

/** Un grupo que se pliega (details nativo: accesible y sin JavaScript). */
function Grupo({
  titulo,
  abierto,
  children,
}: {
  titulo: string;
  abierto?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={abierto} className="group/grupo">
      <summary className="font-display text-ink hover:bg-surface flex min-h-10 cursor-pointer list-none items-center justify-between rounded-lg px-3 py-1.5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
        {titulo}
        <ChevronDown
          aria-hidden="true"
          className="size-4 transition-transform group-open/grupo:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <ul className="border-line mt-0.5 mb-1.5 ml-3 grid gap-0.5 border-l-2 pl-2">{children}</ul>
    </details>
  );
}

/**
 * La barra de categorías (rediseño del 26-10): fija a la izquierda en escritorio y dentro del menú hamburguesa en el
 * celular, como pidió la clienta. Sus categorías cambian con la sección (juguetes o saludables).
 * `alNavegar` cierra el menú del celular al elegir.
 */
export function BarraLateral({ alNavegar }: { alNavegar?: () => void }) {
  const t = useTranslations();
  const ruta = usePathname();
  const seccion = seccionDeRuta(ruta);

  if (seccion === "saludable") {
    return (
      <nav aria-label={t("nav.saludable")} className="grid gap-1" data-testid="barra-lateral">
        <p className="cejilla text-aqua-tinta px-3 pt-1">{t("nav.explora")}</p>
        <p className="font-display px-3 pb-2 text-[22px] leading-tight font-semibold">
          {t("nav.saludable")}
        </p>
        <Link href={RUTA_SALUDABLE} onClick={alNavegar} className={ENLACE}>
          <Leaf aria-hidden="true" className="text-aqua-tinta size-4.5" />
          {t("nav.todoSaludable")}
        </Link>
        <Grupo titulo={t("nav.paraQuien")} abierto>
          {PUBLICOS_SALUDABLES.map((p) => (
            <li key={p}>
              <Link href={`${RUTA_SALUDABLE}#${p}`} onClick={alNavegar} className={SUBENLACE}>
                {t(`saludable.publico.${p}`)}
              </Link>
            </li>
          ))}
        </Grupo>
        <Grupo titulo={t("nav.categorias")} abierto>
          {CATEGORIAS_SALUDABLES.map((c) => (
            <li key={c}>
              <Link href={`${RUTA_SALUDABLE}#${c}`} onClick={alNavegar} className={SUBENLACE}>
                {t(`saludable.categoria.${c}`)}
              </Link>
            </li>
          ))}
        </Grupo>
        <p className="rounded-card bg-tint-cielo text-ink mx-1 mt-3 p-4 text-[13.5px] leading-snug">
          {t("saludable.notaBarra")}
        </p>
      </nav>
    );
  }

  return (
    <nav aria-label={t("nav.juguetes")} className="grid gap-1" data-testid="barra-lateral">
      <p className="cejilla text-mandarina-tinta px-3 pt-1">{t("nav.explora")}</p>
      <p className="font-display px-3 pb-2 text-[22px] leading-tight font-semibold">
        {t("nav.juguetes")}
      </p>
      <Link href="/search" onClick={alNavegar} className={ENLACE}>
        <Blocks aria-hidden="true" className="text-mandarina-tinta size-4.5" />
        {t("nav.todosJuguetes")}
      </Link>
      <Grupo titulo={t("nav.edad")} abierto>
        {GRUPOS_EDAD.map((e) => (
          <li key={e}>
            <Link
              href={{ pathname: "/search", query: { edad: e } }}
              onClick={alNavegar}
              className={SUBENLACE}
            >
              <span
                aria-hidden="true"
                className={cn("size-2.5 shrink-0 rounded-full", TINTA_EDAD[e].punto)}
              />
              {t(`edad.${e}`)}
            </Link>
          </li>
        ))}
      </Grupo>
      <Grupo titulo={t("nav.categorias")}>
        {CATEGORIAS.map((c) => (
          <li key={c}>
            <Link
              href={{ pathname: "/search", query: { categoria: c } }}
              onClick={alNavegar}
              className={SUBENLACE}
            >
              {t(`categoria.${c}`)}
            </Link>
          </li>
        ))}
      </Grupo>
      <Grupo titulo={t("nav.ocasiones")}>
        {OCASIONES.map((o) => (
          <li key={o}>
            <Link
              href={{ pathname: "/search", query: { ocasion: o } }}
              onClick={alNavegar}
              className={SUBENLACE}
            >
              {t(`ocasion.${o}`)}
            </Link>
          </li>
        ))}
      </Grupo>
      <Link href="/where-to-buy" onClick={alNavegar} className={ENLACE}>
        <MapPin aria-hidden="true" className="text-aqua-tinta size-4.5" />
        {t("nav.dondeComprar")}
      </Link>
      <div className="noche rounded-card mx-1 mt-4 grid gap-2 p-4">
        <Gift aria-hidden="true" className="text-calendula size-5" />
        <p className="font-display text-[17px] leading-tight font-semibold">
          {t("nav.regaloTitulo")}
        </p>
        <p className="text-crema/80 text-[13px] leading-snug">{t("nav.regaloTexto")}</p>
        <Link
          href={{ pathname: "/search", query: { ocasion: "birthday" } }}
          onClick={alNavegar}
          className="text-calendula text-[13.5px] font-bold underline-offset-4 hover:underline"
        >
          {t("nav.regaloBoton")} →
        </Link>
      </div>
    </nav>
  );
}

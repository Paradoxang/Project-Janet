"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Pencil, Plus, RotateCcw, Search, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Precio } from "@/components/producto/precio";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link, useRouter } from "@/i18n/navigation";
import { catalogoCompleto, esNuevo, rutaProducto, srcProducto } from "@/lib/catalogo";
import type { Idioma, Producto } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { useActividad } from "@/stores/actividad";
import { useCatalogoLocal } from "@/stores/catalogo";
import { FormularioProducto } from "./formulario-producto";
import { ANCHO_PANEL } from "./solo-admin";

type Formulario = { abierto: boolean; producto: Producto | null; vez: number };

/** La dueña gestiona sus productos: crear, editar, ocultar y borrar. La tienda lo muestra al momento. */
export function PaginaCatalogo({ base }: { base: Producto[] }) {
  const t = useTranslations("gestion");
  const tr = useTranslations();
  const locale = useLocale() as Idioma;
  const router = useRouter();
  const hidratado = useHidratado();
  const nuevos = useCatalogoLocal((s) => s.nuevos);
  const ediciones = useCatalogoLocal((s) => s.ediciones);
  const ocultos = useCatalogoLocal((s) => s.ocultos);
  const borrados = useCatalogoLocal((s) => s.borrados);
  const guardar = useCatalogoLocal((s) => s.guardar);
  const alternarOculto = useCatalogoLocal((s) => s.alternarOculto);
  const borrar = useCatalogoLocal((s) => s.borrar);
  const restaurar = useCatalogoLocal((s) => s.restaurar);
  const eventos = useActividad((s) => s.eventos);
  const [filtro, setFiltro] = useState("");
  const [formulario, setFormulario] = useState<Formulario>({ abierto: false, producto: null, vez: 0 });
  const [aBorrar, setABorrar] = useState<Producto | null>(null);
  const [restaurando, setRestaurando] = useState(false);

  if (!hidratado) return <div className="min-h-[60vh]" />;

  const todos = catalogoCompleto(base, { nuevos, ediciones, ocultos, borrados });
  const ilustraciones = [...new Set(base.map((p) => p.illustration))].sort();
  const vistas = new Map<string, number>();
  for (const e of eventos) if (e.tipo === "producto" && e.producto) vistas.set(e.producto, (vistas.get(e.producto) ?? 0) + 1);
  const busqueda = filtro.trim().toLowerCase();
  const lista = busqueda
    ? todos.filter((p) => `${p.title.es} ${p.title.en}`.toLowerCase().includes(busqueda))
    : todos;

  const abrir = (producto: Producto | null) => setFormulario((f) => ({ abierto: true, producto, vez: f.vez + 1 }));

  function alGuardar(p: Producto) {
    if (!guardar(p)) {
      toast.error(t("sinEspacio"));
      return;
    }
    setFormulario((f) => ({ ...f, abierto: false }));
    toast.success(t("guardado"), {
      action: { label: t("ver"), onClick: () => router.push(rutaProducto(p)) },
    });
  }

  return (
    <div className={cn(ANCHO_PANEL, "pt-5")}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] md:text-4xl">{t("titulo")}</h1>
          <p className="mt-1 text-muted-ink" data-testid="resumen-catalogo">
            {t("subtitulo", { total: todos.length, ocultos: todos.filter((p) => ocultos.includes(p.id)).length })}
          </p>
        </div>
        <Button type="button" variant="cta" size="lg" onClick={() => abrir(null)} data-testid="nuevo-producto">
          <Plus aria-hidden="true" />
          {t("nuevo")}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-dashed p-3 text-[13px] text-muted-ink">
        <p>{t("aviso")}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setRestaurando(true)} data-testid="restaurar-catalogo">
          <RotateCcw aria-hidden="true" />
          {t("restaurar")}
        </Button>
      </div>

      <div className="relative mt-4 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" aria-hidden="true" />
        <Input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder={t("buscar")}
          aria-label={t("buscar")}
          className="h-11 bg-white pl-9"
        />
      </div>

      {lista.length === 0 ? (
        <p className="mt-6 text-muted-ink">{t("vacio")}</p>
      ) : (
        <ul className="mt-4 grid gap-3" data-testid="lista-productos">
          {lista.map((p) => {
            const oculto = ocultos.includes(p.id);
            const nuevo = esNuevo(p.id);
            const nombre = p.title[locale];
            const n = vistas.get(p.id) ?? 0;
            return (
              <li
                key={p.id}
                className={cn("flex flex-wrap items-center gap-3 rounded-card bg-white p-3 shadow-tarjeta", oculto && "opacity-75")}
                data-testid="fila-producto"
              >
                <span className={cn("grid size-16 shrink-0 place-items-center rounded-md", FONDO_TINTE[p.tint])}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={srcProducto(p)} alt="" className="size-[82%] object-contain" />
                </span>
                <div className="grid min-w-0 flex-1 basis-48 gap-0.5">
                  <p className="line-clamp-2 font-semibold">{nombre}</p>
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <Precio usd={p.price} className="text-base" />
                    <span className="text-muted-ink">{t("stock", { n: p.stockOnline })}</span>
                  </p>
                  <p className="text-xs text-muted-ink">
                    {tr(`edadCorta.${p.ageGroup}`)} · {tr(`categoria.${p.category}`)} · {t("vistas", { n })}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-bold">
                    <span
                      className={cn(
                        "rounded-chip px-2 py-0.5",
                        oculto ? "bg-surface text-muted-ink" : "bg-tint-menta text-tinta-menta",
                      )}
                    >
                      {oculto ? t("estado.oculto") : t("estado.publicado")}
                    </span>
                    {nuevo ? <span className="rounded-chip bg-brand/10 px-2 py-0.5 text-ink">{t("estado.nuevo")}</span> : null}
                    {!nuevo && ediciones[p.id] ? (
                      <span className="rounded-chip bg-low/15 px-2 py-0.5 text-low">{t("estado.editado")}</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("acciones", { nombre })}>
                  <Button type="button" variant="outline" size="sm" onClick={() => abrir(p)} data-testid="editar-producto">
                    <Pencil aria-hidden="true" />
                    {t("editar")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      alternarOculto(p.id);
                      toast(oculto ? t("publicado") : t("ocultado"));
                    }}
                    data-testid="ocultar-producto"
                  >
                    {oculto ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                    {oculto ? t("publicar") : t("ocultar")}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setABorrar(p)} data-testid="borrar-producto">
                    <Trash2 aria-hidden="true" />
                    {t("borrar")}
                  </Button>
                  {oculto ? null : (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={rutaProducto(p)} data-testid="ver-producto">
                        <Store aria-hidden="true" />
                        {t("ver")}
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <FormularioProducto
        key={formulario.vez}
        abierto={formulario.abierto}
        producto={formulario.producto}
        ilustraciones={ilustraciones}
        alCerrar={() => setFormulario((f) => ({ ...f, abierto: false }))}
        alGuardar={alGuardar}
      />

      <Dialog open={aBorrar !== null} onOpenChange={(v) => !v && setABorrar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("borrarPregunta", { nombre: aBorrar?.title[locale] ?? "" })}</DialogTitle>
            <DialogDescription>{t("borrarTexto")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setABorrar(null)}>
              {t("cancelar")}
            </Button>
            <Button
              type="button"
              variant="cta"
              onClick={() => {
                if (aBorrar) borrar(aBorrar.id);
                setABorrar(null);
                toast(t("borrado"));
              }}
              data-testid="confirmar-borrar"
            >
              {t("confirmarBorrar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restaurando} onOpenChange={setRestaurando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("restaurarPregunta")}</DialogTitle>
            <DialogDescription>{t("restaurarTexto")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestaurando(false)}>
              {t("cancelar")}
            </Button>
            <Button
              type="button"
              variant="cta"
              onClick={() => {
                restaurar();
                setRestaurando(false);
                toast(t("restaurado"));
              }}
              data-testid="confirmar-restaurar"
            >
              {t("confirmarRestaurar")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

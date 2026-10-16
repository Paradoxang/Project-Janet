"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, Trash2 } from "lucide-react";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DATOS_VACIOS,
  datosDesdeProducto,
  productoDesdeDatos,
  srcProducto,
  validarProducto,
  type CampoConError,
  type DatosProducto,
} from "@/lib/catalogo";
import { CATEGORIAS, GRUPOS_EDAD, OCASIONES } from "@/lib/constantes";
import { reducirFoto } from "@/lib/foto";
import type { Idioma, Producto, Texto, Tinte } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const TINTES: Tinte[] = ["cielo", "menta", "lila", "durazno", "limon"];
const IDIOMAS: Idioma[] = ["es", "en"];
const CAJA_TEXTO =
  "w-full rounded-md border border-input bg-white px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm";

/** Un mismo dato en español y en inglés (la tienda es bilingüe). */
function ParIdiomas({
  id,
  etiqueta,
  valor,
  alCambiar,
  multilinea = false,
  error,
}: {
  id: string;
  etiqueta: string;
  valor: Texto;
  alCambiar: (v: Texto) => void;
  multilinea?: boolean;
  error?: string;
}) {
  const t = useTranslations("gestion.formulario");
  return (
    <fieldset className="grid gap-2" aria-describedby={error ? `error-${id}` : undefined}>
      <legend className="mb-1 text-sm font-bold">{etiqueta}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {IDIOMAS.map((idioma) => (
          <div key={idioma} className="grid gap-1">
            <Label htmlFor={`${id}-${idioma}`} className="text-xs font-semibold text-muted-ink">
              {t(idioma)}
            </Label>
            {multilinea ? (
              <textarea
                id={`${id}-${idioma}`}
                rows={3}
                value={valor[idioma]}
                onChange={(e) => alCambiar({ ...valor, [idioma]: e.target.value })}
                className={CAJA_TEXTO}
              />
            ) : (
              <Input
                id={`${id}-${idioma}`}
                value={valor[idioma]}
                onChange={(e) => alCambiar({ ...valor, [idioma]: e.target.value })}
                aria-invalid={error ? true : undefined}
                className="h-11 bg-white"
                data-testid={`producto-${id}-${idioma}`}
              />
            )}
          </div>
        ))}
      </div>
      {error ? (
        <p id={`error-${id}`} className="text-[13px] text-out">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Crear o editar un producto, en un panel lateral. */
export function FormularioProducto({
  abierto,
  producto,
  ilustraciones,
  alCerrar,
  alGuardar,
}: {
  abierto: boolean;
  /** null: producto nuevo. */
  producto: Producto | null;
  ilustraciones: string[];
  alCerrar: () => void;
  alGuardar: (p: Producto) => void;
}) {
  const t = useTranslations("gestion.formulario");
  const tr = useTranslations();
  const [datos, setDatos] = useState<DatosProducto>(() => (producto ? datosDesdeProducto(producto) : DATOS_VACIOS));
  const [errores, setErrores] = useState<CampoConError[]>([]);
  const [errorFoto, setErrorFoto] = useState(false);

  const cambiar = <K extends keyof DatosProducto>(campo: K, valor: DatosProducto[K]) =>
    setDatos((d) => ({ ...d, [campo]: valor }));
  const error = (campo: CampoConError) => (errores.includes(campo) ? t(`errores.${campo}`) : undefined);

  async function subirFoto(archivo: File | undefined) {
    if (!archivo) return;
    try {
      cambiar("imagen", await reducirFoto(archivo));
      setErrorFoto(false);
    } catch {
      setErrorFoto(true);
    }
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const encontrados = validarProducto(datos);
    setErrores(encontrados);
    if (encontrados.length > 0) {
      document.querySelector<HTMLElement>("[aria-invalid='true'], [data-error='si']")?.focus();
      return;
    }
    alGuardar(productoDesdeDatos(datos, producto ?? undefined));
  }

  const numero = (campo: "precio" | "stock" | "diasEntrega", etiqueta: string, decimal = false) => (
    <div className="grid gap-1">
      <Label htmlFor={`producto-${campo}`}>{etiqueta}</Label>
      <Input
        id={`producto-${campo}`}
        inputMode={decimal ? "decimal" : "numeric"}
        value={datos[campo === "diasEntrega" ? "diasEntrega" : campo]}
        onChange={(e) => cambiar(campo, e.target.value)}
        aria-invalid={error(campo) ? true : undefined}
        aria-describedby={error(campo) ? `error-${campo}` : undefined}
        className="h-11 bg-white"
        data-testid={`producto-${campo}`}
      />
      {error(campo) ? (
        <p id={`error-${campo}`} className="text-[13px] text-out">
          {error(campo)}
        </p>
      ) : null}
    </div>
  );

  const vistaPrevia = datos.imagen || datos.ilustracion ? srcProducto({ illustration: datos.ilustracion, imagen: datos.imagen }) : null;

  return (
    <Sheet open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-page sm:max-w-xl" data-testid="formulario-producto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{producto ? t("tituloEditar") : t("tituloNuevo")}</SheetTitle>
          <SheetDescription>{t("descripcion")}</SheetDescription>
        </SheetHeader>

        <form onSubmit={guardar} noValidate className="grid gap-6 px-4 pb-8">
          <section className="grid gap-4 rounded-card bg-white p-4 shadow-tarjeta" aria-labelledby="f-basico">
            <h3 id="f-basico" className="text-lg">
              {t("seccionBasico")}
            </h3>

            <div className="grid gap-2" data-error={error("imagen") ? "si" : undefined} tabIndex={error("imagen") ? -1 : undefined}>
              <p className="text-sm font-bold">{t("foto")}</p>
              <div className="flex items-start gap-3">
                <span className={cn("grid size-28 shrink-0 place-items-center rounded-card border", FONDO_TINTE[datos.tinte])}>
                  {vistaPrevia ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={vistaPrevia} alt="" className="size-[82%] object-contain" data-testid="vista-previa" />
                  ) : (
                    <ImagePlus className="size-8 text-muted-ink" aria-hidden="true" />
                  )}
                </span>
                <div className="grid gap-2">
                  <Label
                    htmlFor="producto-foto"
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-btn border bg-white px-4 text-sm font-bold hover:bg-surface"
                  >
                    <ImagePlus className="size-4" aria-hidden="true" />
                    {t("subirFoto")}
                  </Label>
                  <input
                    id="producto-foto"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => void subirFoto(e.target.files?.[0])}
                    data-testid="producto-foto"
                  />
                  {datos.imagen ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => cambiar("imagen", "")}>
                      <Trash2 aria-hidden="true" />
                      {t("quitarFoto")}
                    </Button>
                  ) : null}
                </div>
              </div>
              {errorFoto ? <p className="text-[13px] text-out">{t("errores.foto")}</p> : null}
              <p className="mt-1 text-xs font-bold text-muted-ink">{t("oElige")}</p>
              <ul className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                {ilustraciones.map((nombre) => (
                  <li key={nombre}>
                    <button
                      type="button"
                      aria-pressed={!datos.imagen && datos.ilustracion === nombre}
                      aria-label={t("ilustracion", { nombre })}
                      onClick={() => setDatos((d) => ({ ...d, ilustracion: nombre, imagen: "" }))}
                      className={cn(
                        "grid aspect-square w-full place-items-center rounded-md border-2 bg-surface",
                        !datos.imagen && datos.ilustracion === nombre ? "border-ink" : "border-transparent hover:border-line",
                      )}
                      data-testid={`ilustracion-${nombre}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/productos/${nombre}.svg`} alt="" className="size-[80%]" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
              {error("imagen") ? <p className="text-[13px] text-out">{error("imagen")}</p> : null}
            </div>

            <fieldset className="grid gap-1.5">
              <legend className="mb-1 text-sm font-bold">{t("fondo")}</legend>
              <div className="flex flex-wrap gap-2">
                {TINTES.map((tinte) => (
                  <label
                    key={tinte}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-chip border px-2.5 py-1 text-[13px] font-semibold",
                      datos.tinte === tinte && "border-ink bg-surface",
                    )}
                  >
                    <input
                      type="radio"
                      name="tinte"
                      value={tinte}
                      checked={datos.tinte === tinte}
                      onChange={() => cambiar("tinte", tinte)}
                      className="sr-only"
                    />
                    <span className={cn("size-4 rounded-full border", FONDO_TINTE[tinte])} aria-hidden="true" />
                    {t(`tintes.${tinte}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <ParIdiomas id="titulo" etiqueta={t("nombre")} valor={datos.titulo} alCambiar={(v) => cambiar("titulo", v)} error={error("titulo")} />
            <p className="-mt-2 text-xs text-muted-ink">{t("idiomasTexto")}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              {numero("precio", t("precio"), true)}
              {numero("stock", t("stock"))}
              {numero("diasEntrega", t("dias"))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["edad", t("edad"), GRUPOS_EDAD, "edad"],
                  ["categoria", t("categoria"), CATEGORIAS, "categoria"],
                ] as const
              ).map(([campo, etiqueta, opciones, prefijo]) => (
                <div key={campo} className="grid gap-1">
                  <Label htmlFor={`producto-${campo}`}>{etiqueta}</Label>
                  <select
                    id={`producto-${campo}`}
                    value={datos[campo]}
                    onChange={(e) => cambiar(campo, e.target.value as DatosProducto[typeof campo])}
                    aria-invalid={error(campo) ? true : undefined}
                    aria-describedby={error(campo) ? `error-${campo}` : undefined}
                    className="h-11 rounded-md border border-input bg-white px-2 text-sm aria-invalid:border-out"
                    data-testid={`producto-${campo}`}
                  >
                    <option value="">{t("elegir")}</option>
                    {opciones.map((o) => (
                      <option key={o} value={o}>
                        {tr(`${prefijo}.${o}`)}
                      </option>
                    ))}
                  </select>
                  {error(campo) ? (
                    <p id={`error-${campo}`} className="text-[13px] text-out">
                      {error(campo)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <fieldset className="grid gap-1.5">
              <legend className="mb-1 text-sm font-bold">{t("ocasiones")}</legend>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {OCASIONES.map((o) => (
                  <label key={o} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={datos.ocasiones.includes(o)}
                      onChange={(e) =>
                        cambiar("ocasiones", e.target.checked ? [...datos.ocasiones, o] : datos.ocasiones.filter((x) => x !== o))
                      }
                      className="size-4 accent-[var(--m-ink)]"
                    />
                    {tr(`ocasion.${o}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={datos.masVendido}
                onChange={(e) => cambiar("masVendido", e.target.checked)}
                className="size-4 accent-[var(--m-ink)]"
                data-testid="producto-mas-vendido"
              />
              {t("masVendido")}
            </label>
          </section>

          <section className="grid gap-4 rounded-card bg-white p-4 shadow-tarjeta" aria-labelledby="f-ficha">
            <h3 id="f-ficha" className="text-lg">
              {t("seccionFicha")}
            </h3>
            <ParIdiomas id="resumen" etiqueta={t("resumen")} valor={datos.resumen} alCambiar={(v) => cambiar("resumen", v)} multilinea />
            <ParIdiomas id="vinetas" etiqueta={t("vinetas")} valor={datos.vinetas} alCambiar={(v) => cambiar("vinetas", v)} multilinea />
            <ParIdiomas id="seguridad" etiqueta={t("seguridad")} valor={datos.seguridad} alCambiar={(v) => cambiar("seguridad", v)} multilinea />
          </section>

          <section className="grid gap-4 rounded-card bg-white p-4 shadow-tarjeta" aria-labelledby="f-detalles">
            <h3 id="f-detalles" className="text-lg">
              {t("seccionDetalles")}
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["medidas", t("medidas")],
                  ["peso", t("peso")],
                  ["piezas", t("piezas")],
                ] as const
              ).map(([campo, etiqueta]) => (
                <div key={campo} className="grid gap-1">
                  <Label htmlFor={`producto-${campo}`}>{etiqueta}</Label>
                  <Input
                    id={`producto-${campo}`}
                    value={datos[campo]}
                    onChange={(e) => cambiar(campo, e.target.value)}
                    inputMode={campo === "piezas" ? "numeric" : undefined}
                    className="h-11 bg-white"
                  />
                </div>
              ))}
            </div>
            <ParIdiomas id="materiales" etiqueta={t("materiales")} valor={datos.materiales} alCambiar={(v) => cambiar("materiales", v)} />
          </section>

          <div className="grid gap-2">
            {errores.length > 0 ? (
              <p role="alert" className="text-sm font-bold text-out" data-testid="error-producto">
                {t("revisa")}
              </p>
            ) : null}
            <Button type="submit" variant="cta" size="xl" data-testid="guardar-producto">
              {producto ? t("guardar") : t("crear")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { Fragment, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ImagePlus, Trash2, Upload } from "lucide-react";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Button } from "@/components/ui/button";
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
import { CATEGORIAS, FONDO_EDAD, GRUPOS_EDAD, OCASIONES } from "@/lib/constantes";
import {
  AVISOS_SEGURIDAD,
  avisoComun,
  conMayuscula,
  MATERIALES,
  UNIDADES_MEDIDA,
  UNIDADES_PESO,
  type UnidadMedida,
  type UnidadPeso,
} from "@/lib/detalles";
import { reducirFoto } from "@/lib/foto";
import type { Idioma, Producto, Tinte } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { Caja, Campo, Fichas, Grupo, Interruptor, ListaPuntos, Pasos, TextoBilingue, Unidades } from "./campos";

const TINTES: Tinte[] = ["cielo", "menta", "lila", "durazno", "limon"];

/** Una sección del formulario: tarjeta con título y para qué sirve. */
function Seccion({ id, titulo, texto, children }: { id: string; titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 rounded-card bg-white p-4 shadow-tarjeta sm:p-5" aria-labelledby={id}>
      <div>
        <h3 id={id} className="text-lg">
          {titulo}
        </h3>
        <p className="text-[13px] text-muted-ink">{texto}</p>
      </div>
      {children}
    </section>
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
  const locale = useLocale() as Idioma;
  const [datos, setDatos] = useState<DatosProducto>(() => (producto ? datosDesdeProducto(producto) : DATOS_VACIOS));
  const [errores, setErrores] = useState<CampoConError[]>([]);
  const [errorFoto, setErrorFoto] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  const cambiar = <K extends keyof DatosProducto>(campo: K, valor: DatosProducto[K]) =>
    setDatos((d) => ({ ...d, [campo]: valor }));
  const error = (campo: CampoConError) => (errores.includes(campo) ? t(`errores.${campo}`) : undefined);
  const alternar = <T,>(lista: T[], valor: T) => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor]);

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

  const vistaPrevia = datos.imagen || datos.ilustracion ? srcProducto({ illustration: datos.ilustracion, imagen: datos.imagen }) : null;
  const nombreUnidad = (u: UnidadMedida | UnidadPeso) => t(`unidades.${u}`);
  /** Lo que el producto ya decía y no encaja en los campos (se conserva hasta que se rellenen). */
  const hoyDice = (texto: string) => (texto ? <p className="text-xs text-muted-ink">{t("hoyDice", { texto })}</p> : null);
  const comunes = new Set(datos.seguridad.map((a) => avisoComun(a)?.id).filter(Boolean));

  return (
    <Sheet open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <SheetContent side="right" className="w-full gap-0 bg-page p-0 sm:max-w-2xl" data-testid="formulario-producto">
        <SheetHeader className="border-b bg-white px-5 pt-5 pb-4">
          <SheetTitle className="text-2xl">{producto ? t("tituloEditar") : t("tituloNuevo")}</SheetTitle>
          <SheetDescription>{t("descripcion")}</SheetDescription>
        </SheetHeader>

        <form onSubmit={guardar} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="grid flex-1 content-start gap-5 overflow-y-auto px-4 py-5 sm:px-5">
            <Seccion id="f-basico" titulo={t("seccionBasico")} texto={t("subBasico")}>
              {/* Foto: se arrastra o se elige; o una ilustración. Con su color de fondo. */}
              <div className="grid gap-3" data-error={error("imagen") ? "si" : undefined} tabIndex={error("imagen") ? -1 : undefined}>
                <p className="text-[13px] font-bold text-ink">{t("foto")}</p>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setArrastrando(true);
                  }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setArrastrando(false);
                    void subirFoto(e.dataTransfer.files?.[0]);
                  }}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border-2 border-dashed border-line p-3 transition-colors",
                    arrastrando && "border-ink bg-surface",
                    error("imagen") && "border-out/60",
                  )}
                  data-testid="zona-foto"
                >
                  <span className={cn("grid size-24 shrink-0 place-items-center rounded-lg sm:size-28", FONDO_TINTE[datos.tinte])}>
                    {vistaPrevia ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={vistaPrevia} alt="" className="size-[82%] object-contain" data-testid="vista-previa" />
                    ) : (
                      <ImagePlus className="size-8 text-muted-ink" aria-hidden="true" />
                    )}
                  </span>
                  <div className="grid gap-2">
                    <p className="text-sm font-bold text-ink">{t("arrastraFoto")}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="producto-foto"
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3.5 text-[13px] font-bold hover:border-input has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ink/15"
                      >
                        <Upload className="size-4" aria-hidden="true" />
                        {datos.imagen ? t("cambiarFoto") : t("subirFoto")}
                        <input
                          id="producto-foto"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => void subirFoto(e.target.files?.[0])}
                          data-testid="producto-foto"
                        />
                      </label>
                      {datos.imagen ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => cambiar("imagen", "")}>
                          <Trash2 aria-hidden="true" />
                          {t("quitarFoto")}
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-ink">{t("formatos")}</p>
                  </div>
                </div>
                {errorFoto ? <p className="text-[13px] font-semibold text-out">{t("errores.foto")}</p> : null}

                <p className="mt-1 text-xs font-bold text-muted-ink">{t("oElige")}</p>
                <ul className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                  {ilustraciones.map((nombre) => {
                    const elegida = !datos.imagen && datos.ilustracion === nombre;
                    return (
                      <li key={nombre}>
                        <button
                          type="button"
                          aria-pressed={elegida}
                          aria-label={t("ilustracion", { nombre })}
                          onClick={() => setDatos((d) => ({ ...d, ilustracion: nombre, imagen: "" }))}
                          className={cn(
                            "grid aspect-square w-full place-items-center rounded-lg bg-surface outline-none hover:ring-2 hover:ring-input focus-visible:ring-4 focus-visible:ring-ink/20",
                            elegida && "bg-white ring-2 ring-ink hover:ring-ink",
                          )}
                          data-testid={`ilustracion-${nombre}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/productos/${nombre}.svg`} alt="" className="size-[78%]" loading="lazy" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {error("imagen") ? <p className="text-[13px] font-semibold text-out">{error("imagen")}</p> : null}

                <div role="radiogroup" aria-label={t("fondo")} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="mr-1 text-xs font-bold text-muted-ink">
                    {t("fondo")}
                  </span>
                  {TINTES.map((tinte) => (
                    <label
                      key={tinte}
                      title={t(`tintes.${tinte}`)}
                      className={cn(
                        "grid size-8 cursor-pointer place-items-center rounded-full ring-1 ring-ink/15 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ink/20",
                        FONDO_TINTE[tinte],
                        datos.tinte === tinte && "ring-2 ring-ink ring-offset-2",
                      )}
                      data-testid={`tinte-${tinte}`}
                    >
                      <input
                        type="radio"
                        name="tinte"
                        value={tinte}
                        checked={datos.tinte === tinte}
                        onChange={() => cambiar("tinte", tinte)}
                        className="sr-only"
                      />
                      <span className="sr-only">{t(`tintes.${tinte}`)}</span>
                      {datos.tinte === tinte ? <Check className="size-4 text-ink" aria-hidden="true" /> : null}
                    </label>
                  ))}
                </div>
              </div>

              <TextoBilingue
                id="titulo"
                etiqueta={t("nombre")}
                valor={datos.titulo}
                alCambiar={(v) => cambiar("titulo", v)}
                ejemplo={t("ejNombre")}
                error={error("titulo")}
              />

              <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3">
                <Campo
                  etiqueta={t("precio")}
                  htmlFor="producto-precio"
                  ayuda={t("precioTexto")}
                  error={error("precio")}
                  idError="error-precio"
                  className="col-span-2 sm:col-span-1"
                >
                  <Caja
                    id="producto-precio"
                    prefijo="$"
                    sufijo="USD"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={datos.precio}
                    onChange={(e) => cambiar("precio", e.target.value)}
                    aria-invalid={error("precio") ? true : undefined}
                    aria-describedby={error("precio") ? "error-precio" : undefined}
                    data-testid="producto-precio"
                  />
                </Campo>
                <Campo etiqueta={t("stock")} htmlFor="producto-stock" ayuda={t("stockTexto")} error={error("stock")} idError="error-stock">
                  <Pasos
                    id="stock"
                    etiqueta={t("stock")}
                    valor={datos.stock}
                    alCambiar={(v) => cambiar("stock", v)}
                    max={99_999}
                    sufijo={t("uds")}
                    error={Boolean(error("stock"))}
                    describe={error("stock") ? "error-stock" : undefined}
                  />
                </Campo>
                <Campo
                  etiqueta={t("dias")}
                  htmlFor="producto-diasEntrega"
                  ayuda={t("diasTexto")}
                  error={error("diasEntrega")}
                  idError="error-diasEntrega"
                >
                  <Pasos
                    id="diasEntrega"
                    etiqueta={t("dias")}
                    valor={datos.diasEntrega}
                    alCambiar={(v) => cambiar("diasEntrega", v)}
                    min={1}
                    max={99}
                    sufijo={t("diasCorto")}
                    error={Boolean(error("diasEntrega"))}
                    describe={error("diasEntrega") ? "error-diasEntrega" : undefined}
                  />
                </Campo>
              </div>

              <Grupo leyenda={t("edad")} error={error("edad")} idError="error-edad">
                <Fichas
                  nombre="edad"
                  opciones={GRUPOS_EDAD.map((e) => ({ valor: e, texto: tr(`edadCorta.${e}`), punto: FONDO_EDAD[e] }))}
                  elegidas={datos.edad ? [datos.edad] : []}
                  alElegir={(e) => cambiar("edad", e)}
                  invalido={Boolean(error("edad"))}
                />
              </Grupo>

              <Grupo leyenda={t("categoria")} error={error("categoria")} idError="error-categoria">
                <Fichas
                  nombre="categoria"
                  opciones={CATEGORIAS.map((c) => ({ valor: c, texto: tr(`categoria.${c}`) }))}
                  elegidas={datos.categoria ? [datos.categoria] : []}
                  alElegir={(c) => cambiar("categoria", c)}
                  invalido={Boolean(error("categoria"))}
                />
              </Grupo>

              <Grupo leyenda={t("ocasiones")} ayuda={t("ocasionesTexto")}>
                <Fichas
                  nombre="ocasion"
                  varias
                  opciones={OCASIONES.map((o) => ({ valor: o, texto: tr(`ocasion.${o}`) }))}
                  elegidas={datos.ocasiones}
                  alElegir={(o) => cambiar("ocasiones", alternar(datos.ocasiones, o))}
                />
              </Grupo>

              <Interruptor
                id="producto-mas-vendido"
                titulo={t("masVendido")}
                texto={t("masVendidoTexto")}
                activo={datos.masVendido}
                alCambiar={(v) => cambiar("masVendido", v)}
              />
            </Seccion>

            <Seccion id="f-ficha" titulo={t("seccionFicha")} texto={t("subFicha")}>
              <TextoBilingue
                id="resumen"
                etiqueta={t("resumen")}
                valor={datos.resumen}
                alCambiar={(v) => cambiar("resumen", v)}
                ejemplo={t("ejResumen")}
                multilinea
              />
              <ListaPuntos
                id="vinetas"
                etiqueta={t("vinetas")}
                ayuda={t("vinetasTexto")}
                puntos={datos.vinetas}
                alCambiar={(v) => cambiar("vinetas", v)}
                ejemplo={t("ejPunto")}
                textoAgregar={t("agregarPunto")}
              />
              <ListaPuntos
                id="seguridad"
                etiqueta={t("seguridad")}
                ayuda={t("seguridadTexto")}
                puntos={datos.seguridad}
                alCambiar={(v) => cambiar("seguridad", v)}
                ejemplo={t("ejAviso")}
                textoAgregar={t("agregarAviso")}
                minimo={0}
                fija={(p) => {
                  const comun = avisoComun(p);
                  return comun ? t(`avisosComunes.${comun.id}`) : undefined;
                }}
                extra={
                  <Fichas
                    nombre="aviso"
                    varias
                    opciones={AVISOS_SEGURIDAD.map((a) => ({ valor: a.id, texto: t(`avisosComunes.${a.id}`) }))}
                    elegidas={AVISOS_SEGURIDAD.filter((a) => comunes.has(a.id)).map((a) => a.id)}
                    alElegir={(id) => {
                      const aviso = AVISOS_SEGURIDAD.find((a) => a.id === id)!;
                      cambiar(
                        "seguridad",
                        comunes.has(id)
                          ? datos.seguridad.filter((s) => avisoComun(s)?.id !== id)
                          : [...datos.seguridad.filter((s) => s.es.trim() || s.en.trim()), { es: aviso.es, en: aviso.en }],
                      );
                    }}
                  />
                }
              />
            </Seccion>

            <Seccion id="f-detalles" titulo={t("seccionDetalles")} texto={t("subDetalles")}>
              <Grupo leyenda={t("medidas")} ayuda={t("medidasTexto")} error={error("medidas")} idError="error-medidas">
                <div className="flex flex-wrap items-end gap-x-1.5 gap-y-2">
                  {(["largo", "ancho", "alto"] as const).map((eje, i) => (
                    <Fragment key={eje}>
                      {i > 0 ? (
                        <span aria-hidden="true" className="pb-3 text-sm font-bold text-muted-ink">
                          ×
                        </span>
                      ) : null}
                      <div className="grid w-[5.75rem] gap-1">
                        <label htmlFor={`producto-${eje}`} className="text-xs font-semibold text-muted-ink">
                          {t(eje)}
                        </label>
                        <Caja
                          id={`producto-${eje}`}
                          inputMode="decimal"
                          placeholder="0"
                          sufijo={datos.medidas.unidad}
                          value={datos.medidas[eje]}
                          onChange={(e) => cambiar("medidas", { ...datos.medidas, [eje]: e.target.value })}
                          aria-invalid={error("medidas") ? true : undefined}
                          aria-describedby={error("medidas") ? "error-medidas" : undefined}
                          data-testid={`producto-${eje}`}
                        />
                      </div>
                    </Fragment>
                  ))}
                  <span className="ml-1.5">
                    <Unidades
                      nombre="unidad-medida"
                      etiqueta={t("unidadMedidas")}
                      opciones={UNIDADES_MEDIDA}
                      valor={datos.medidas.unidad}
                      alCambiar={(unidad) => cambiar("medidas", { ...datos.medidas, unidad })}
                      nombreUnidad={nombreUnidad}
                    />
                  </span>
                </div>
                {hoyDice(datos.textoLibre.medidas)}
              </Grupo>

              <div className="grid gap-x-3 gap-y-5 sm:grid-cols-2">
                <Campo etiqueta={t("peso")} htmlFor="producto-peso" error={error("peso")} idError="error-peso">
                  <div className="flex gap-2">
                    <Caja
                      id="producto-peso"
                      inputMode="decimal"
                      placeholder={t("ejPeso")}
                      value={datos.peso.valor}
                      onChange={(e) => cambiar("peso", { ...datos.peso, valor: e.target.value })}
                      aria-invalid={error("peso") ? true : undefined}
                      aria-describedby={error("peso") ? "error-peso" : undefined}
                      className="flex-1"
                      data-testid="producto-peso"
                    />
                    <Unidades
                      nombre="unidad-peso"
                      etiqueta={t("unidadPeso")}
                      opciones={UNIDADES_PESO}
                      valor={datos.peso.unidad}
                      alCambiar={(unidad) => cambiar("peso", { ...datos.peso, unidad })}
                      nombreUnidad={nombreUnidad}
                    />
                  </div>
                  {hoyDice(datos.textoLibre.peso)}
                </Campo>

                <Campo etiqueta={t("piezas")} htmlFor="producto-piezas" ayuda={t("piezasTexto")} error={error("piezas")} idError="error-piezas">
                  <Pasos
                    id="piezas"
                    etiqueta={t("piezas")}
                    valor={datos.piezas}
                    alCambiar={(v) => cambiar("piezas", v)}
                    vacioEnCero
                    marcador={t("noAplica")}
                    error={Boolean(error("piezas"))}
                    describe={error("piezas") ? "error-piezas" : undefined}
                  />
                </Campo>
              </div>

              <Grupo leyenda={t("materiales")} ayuda={t("materialesTexto")}>
                <Fichas
                  nombre="material"
                  varias
                  opciones={MATERIALES.map((m) => ({ valor: m.id, texto: conMayuscula(m[locale]) }))}
                  elegidas={datos.materiales}
                  alElegir={(id) => cambiar("materiales", alternar(datos.materiales, id))}
                />
                {hoyDice(datos.textoLibre.materiales[locale] || datos.textoLibre.materiales[locale === "es" ? "en" : "es"])}
              </Grupo>
            </Seccion>
          </div>

          {/* Pie fijo: el botón siempre a la vista */}
          <div className="grid gap-2 border-t bg-white px-4 py-3 sm:px-5">
            {errores.length > 0 ? (
              <p role="alert" className="text-sm font-bold text-out" data-testid="error-producto">
                {t("revisa")}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="xl" onClick={alCerrar} className="flex-1 sm:flex-none">
                {t("cancelar")}
              </Button>
              <Button type="submit" variant="cta" size="xl" className="flex-[2] sm:ml-auto sm:flex-none sm:px-10" data-testid="guardar-producto">
                {producto ? t("guardar") : t("crear")}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

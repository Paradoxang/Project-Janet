"use client";

// Piezas del formulario de producto: cajas con prefijo y sufijo, pasos (− +), fichas para elegir, interruptor,
// pestañas de idioma y listas de puntos. Todas con el mismo alto, borde y foco, para que el formulario quede alineado.
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Minus, Plus, X } from "lucide-react";
import type { Idioma, Texto } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const IDIOMAS: Idioma[] = ["es", "en"];

/** Marco de una caja: blanco, redondeado, con borde suave y un foco claro (también en error). */
export const MARCO =
  "flex items-center rounded-xl border border-line bg-white transition-[border-color,box-shadow] hover:border-input has-[:focus-visible]:border-ink has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ink/10 has-[[aria-invalid=true]]:border-out has-[[aria-invalid=true]]:ring-4 has-[[aria-invalid=true]]:ring-out/10";
const TEXTO_CAJA = "w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted-ink/60";

/** Etiqueta, ayuda y error de un campo. `extra` va a la derecha de la etiqueta (p. ej. las pestañas de idioma). */
export function Campo({
  etiqueta,
  htmlFor,
  ayuda,
  error,
  idError,
  extra,
  className,
  children,
}: {
  etiqueta: string;
  htmlFor?: string;
  ayuda?: string;
  error?: string;
  idError?: string;
  extra?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <div className="flex min-h-7 items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-bold text-ink">
          {etiqueta}
        </label>
        {extra}
      </div>
      {children}
      {ayuda ? <p className="text-xs text-muted-ink">{ayuda}</p> : null}
      {error ? (
        <p id={idError} className="text-[13px] font-semibold text-out">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Un grupo de opciones (fichas, unidades…): como Campo, pero con fieldset y leyenda. */
export function Grupo({
  leyenda,
  ayuda,
  error,
  idError,
  extra,
  className,
  children,
}: {
  leyenda: string;
  ayuda?: string;
  error?: string;
  idError?: string;
  extra?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset
      className={cn("grid content-start gap-1.5", className)}
      aria-describedby={error ? idError : undefined}
      data-error={error ? "si" : undefined}
      tabIndex={error ? -1 : undefined}
    >
      {/* La leyenda tiene que ser la primera hija del fieldset: se lee aquí y se ve en la fila de abajo */}
      <legend className="sr-only">{leyenda}</legend>
      <div className="flex min-h-7 items-center justify-between gap-2">
        <span aria-hidden="true" className="text-[13px] font-bold text-ink">
          {leyenda}
        </span>
        {extra}
      </div>
      {ayuda ? <p className="-mt-1 text-xs text-muted-ink">{ayuda}</p> : null}
      {children}
      {error ? (
        <p id={idError} className="text-[13px] font-semibold text-out">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Caja de una línea, con prefijo ($) o sufijo (USD, cm…) dentro del marco. */
export function Caja({
  prefijo,
  sufijo,
  className,
  ref,
  ...props
}: React.ComponentProps<"input"> & { prefijo?: string; sufijo?: string }) {
  return (
    <div className={cn(MARCO, "h-11", className)}>
      {prefijo ? (
        <span aria-hidden="true" className="pl-3.5 text-[15px] font-semibold text-muted-ink">
          {prefijo}
        </span>
      ) : null}
      <input ref={ref} {...props} className={cn(TEXTO_CAJA, "h-full px-3.5", prefijo && "pl-1.5", sufijo && "pr-1.5")} />
      {sufijo ? (
        <span aria-hidden="true" className="pr-3.5 text-[13px] font-semibold whitespace-nowrap text-muted-ink">
          {sufijo}
        </span>
      ) : null}
    </div>
  );
}

/** Caja de varias líneas que crece con el texto. */
export function Area({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <div className={cn(MARCO, "items-stretch")}>
      <textarea
        rows={3}
        {...props}
        className={cn(TEXTO_CAJA, "max-h-72 min-h-24 resize-none px-3.5 py-2.5 leading-relaxed field-sizing-content", className)}
      />
    </div>
  );
}

/** Un número entero con − y +; también se puede escribir. Con `vacioEnCero`, por debajo de 1 queda vacío («no aplica»). */
export function Pasos({
  id,
  etiqueta,
  valor,
  alCambiar,
  min = 0,
  max = 9999,
  sufijo,
  vacioEnCero = false,
  marcador,
  error,
  describe,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (v: string) => void;
  min?: number;
  max?: number;
  sufijo?: string;
  vacioEnCero?: boolean;
  /** Lo que se lee cuando está vacío (p. ej. «No aplica»). */
  marcador?: string;
  error?: boolean;
  describe?: string;
}) {
  const t = useTranslations("gestion.formulario");
  const actual = /^\d+$/.test(valor.trim()) ? Number(valor) : null;
  const sumar = (paso: number) => {
    const n = Math.min(max, Math.max(min, (actual ?? 0) + paso));
    alCambiar(vacioEnCero && n === 0 ? "" : String(n));
  };
  const boton = "grid h-full w-11 shrink-0 place-items-center text-ink outline-none hover:bg-surface focus-visible:bg-surface disabled:opacity-30";
  return (
    <div className={cn(MARCO, "h-11 overflow-hidden")}>
      <button
        type="button"
        onClick={() => sumar(-1)}
        disabled={actual === null || actual <= min}
        aria-label={t("unoMenos", { campo: etiqueta })}
        className={boton}
        data-testid={`menos-${id}`}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        id={`producto-${id}`}
        inputMode="numeric"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        placeholder={marcador}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe}
        className={cn(TEXTO_CAJA, "h-full text-center font-semibold tabular-nums placeholder:font-normal")}
        data-testid={`producto-${id}`}
      />
      {sufijo ? (
        <span aria-hidden="true" className="pr-1 text-[13px] font-semibold whitespace-nowrap text-muted-ink">
          {sufijo}
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => sumar(1)}
        disabled={actual !== null && actual >= max}
        aria-label={t("unoMas", { campo: etiqueta })}
        className={boton}
        data-testid={`mas-${id}`}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const FICHA =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-[13px] font-semibold text-ink transition-colors select-none hover:border-input has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ink/15";
const FICHA_ELEGIDA = "border-ink bg-ink text-white hover:border-ink";

/** Fichas para elegir una (radio) o varias (casillas). `punto`: un color al lado del texto (las edades). */
export function Fichas<T extends string>({
  nombre,
  opciones,
  elegidas,
  alElegir,
  varias = false,
  invalido = false,
}: {
  nombre: string;
  opciones: { valor: T; texto: string; punto?: string }[];
  elegidas: T[];
  alElegir: (valor: T) => void;
  varias?: boolean;
  invalido?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map(({ valor, texto, punto }) => {
        const elegida = elegidas.includes(valor);
        return (
          <label
            key={valor}
            className={cn(FICHA, elegida && FICHA_ELEGIDA, invalido && !elegida && "border-out/50")}
            data-testid={`${nombre}-${valor}`}
          >
            <input
              type={varias ? "checkbox" : "radio"}
              name={nombre}
              value={valor}
              checked={elegida}
              onChange={() => alElegir(valor)}
              className="sr-only"
            />
            {elegida ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : punto ? (
              <span aria-hidden="true" className={cn("size-2.5 rounded-full ring-1 ring-ink/15", punto)} />
            ) : null}
            {texto}
          </label>
        );
      })}
    </div>
  );
}

/** Unidad con un solo toque (cm, m, in; kg, lb). */
export function Unidades<U extends string>({
  nombre,
  etiqueta,
  opciones,
  valor,
  alCambiar,
  nombreUnidad,
}: {
  nombre: string;
  etiqueta: string;
  opciones: readonly U[];
  valor: U;
  alCambiar: (u: U) => void;
  nombreUnidad: (u: U) => string;
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex h-11 shrink-0 items-stretch rounded-xl border border-line bg-surface p-1">
      {opciones.map((u) => (
        <label
          key={u}
          title={nombreUnidad(u)}
          className={cn(
            "grid min-w-10 cursor-pointer place-items-center rounded-lg px-2 text-sm font-bold text-muted-ink has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ink/15",
            valor === u && "bg-white text-ink shadow-sm",
          )}
          data-testid={`${nombre}-${u}`}
        >
          <input type="radio" name={nombre} value={u} checked={valor === u} onChange={() => alCambiar(u)} className="sr-only" />
          <span aria-hidden="true">{u}</span>
          <span className="sr-only">{nombreUnidad(u)}</span>
        </label>
      ))}
    </div>
  );
}

/** Interruptor de sí o no, con su explicación. */
export function Interruptor({
  id,
  titulo,
  texto,
  activo,
  alCambiar,
}: {
  id: string;
  titulo: string;
  texto?: string;
  activo: boolean;
  alCambiar: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3 hover:border-input"
      data-testid={`interruptor-${id}`}
    >
      <span className="grid gap-0.5">
        <span className="text-sm font-bold text-ink">{titulo}</span>
        {texto ? <span className="text-xs text-muted-ink">{texto}</span> : null}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={activo}
        onChange={(e) => alCambiar(e.target.checked)}
        className="peer sr-only"
        data-testid={id}
      />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 rounded-full bg-input transition-colors peer-checked:bg-ink peer-focus-visible:ring-4 peer-focus-visible:ring-ink/15 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}

/** ES / EN: qué idioma se está escribiendo. La marca ✓ dice qué idioma ya tiene texto. */
export function PestanasIdioma({
  campo,
  activo,
  alCambiar,
  lleno,
}: {
  campo: string;
  activo: Idioma;
  alCambiar: (i: Idioma) => void;
  lleno: Record<Idioma, boolean>;
}) {
  const t = useTranslations("gestion.formulario");
  return (
    <div role="group" aria-label={t("idiomaDelTexto")} className="flex shrink-0 rounded-full bg-surface p-0.5">
      {IDIOMAS.map((idioma) => (
        <button
          key={idioma}
          type="button"
          aria-pressed={activo === idioma}
          aria-label={lleno[idioma] ? t("idiomaEscrito", { idioma: t(idioma) }) : t(idioma)}
          onClick={() => alCambiar(idioma)}
          className={cn(
            "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-bold text-muted-ink outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
            activo === idioma && "bg-white text-ink shadow-sm",
          )}
          data-testid={`idioma-${campo}-${idioma}`}
        >
          {idioma.toUpperCase()}
          {lleno[idioma] ? <Check className="size-3 text-stock" aria-hidden="true" /> : null}
        </button>
      ))}
    </div>
  );
}

/** Lo que se ve en la caja del otro idioma si está vacía: lo que se usará en su lugar. */
function marcadorOtro(valor: Texto, idioma: Idioma, ejemplo: string, siVacio: (texto: string) => string) {
  const otro = idioma === "es" ? valor.en : valor.es;
  return otro.trim() ? siVacio(otro.trim()) : ejemplo;
}

/** Un texto en español e inglés, uno a la vez con pestañas (antes eran dos cajas lado a lado). */
export function TextoBilingue({
  id,
  etiqueta,
  valor,
  alCambiar,
  ejemplo,
  multilinea = false,
  error,
}: {
  id: string;
  etiqueta: string;
  valor: Texto;
  alCambiar: (v: Texto) => void;
  ejemplo: string;
  multilinea?: boolean;
  error?: string;
}) {
  const t = useTranslations("gestion.formulario");
  const [idioma, setIdioma] = useState<Idioma>("es");
  const props = {
    id: `${id}-${idioma}`,
    lang: idioma,
    value: valor[idioma],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => alCambiar({ ...valor, [idioma]: e.target.value }),
    placeholder: marcadorOtro(valor, idioma, ejemplo, (texto) => t("siVacio", { texto })),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `error-${id}` : undefined,
    "data-testid": `producto-${id}-${idioma}`,
  };
  return (
    <Campo
      etiqueta={etiqueta}
      htmlFor={props.id}
      error={error}
      idError={`error-${id}`}
      extra={
        <PestanasIdioma
          campo={id}
          activo={idioma}
          alCambiar={setIdioma}
          lleno={{ es: Boolean(valor.es.trim()), en: Boolean(valor.en.trim()) }}
        />
      }
    >
      {multilinea ? <Area {...props} /> : <Caja {...props} />}
    </Campo>
  );
}

/**
 * Lista de puntos en los dos idiomas: una caja por punto, Enter añade otro y × lo quita.
 * `fija`: las filas que no se escriben (las advertencias comunes), que se ven tal cual con su ×.
 */
export function ListaPuntos({
  id,
  etiqueta,
  ayuda,
  puntos,
  alCambiar,
  ejemplo,
  textoAgregar,
  minimo = 1,
  fija,
  extra,
}: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  puntos: Texto[];
  alCambiar: (puntos: Texto[]) => void;
  ejemplo: string;
  textoAgregar: string;
  minimo?: 0 | 1;
  fija?: (p: Texto) => string | undefined;
  extra?: React.ReactNode;
}) {
  const t = useTranslations("gestion.formulario");
  const [idioma, setIdioma] = useState<Idioma>("es");
  const filas = puntos.length > 0 || minimo === 0 ? puntos : [{ es: "", en: "" }];
  const cajas = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [enfocar, setEnfocar] = useState<number | null>(null);

  useEffect(() => {
    if (enfocar === null) return;
    cajas.current[enfocar]?.focus();
    setEnfocar(null);
  }, [enfocar]);

  const editables = filas.map((p, i) => ({ p, i })).filter(({ p }) => !fija?.(p));
  const agregar = (despues: number) => {
    const nuevas = [...filas];
    nuevas.splice(despues + 1, 0, { es: "", en: "" });
    alCambiar(nuevas);
    setEnfocar(despues + 1);
  };
  const quitar = (i: number) => {
    alCambiar(filas.filter((_, j) => j !== i));
    const anterior = editables.filter((e) => e.i < i).pop();
    if (anterior) setEnfocar(anterior.i);
  };

  return (
    <Grupo
      leyenda={etiqueta}
      ayuda={ayuda}
      extra={
        <PestanasIdioma
          campo={id}
          activo={idioma}
          alCambiar={setIdioma}
          lleno={{ es: filas.some((p) => p.es.trim()), en: filas.some((p) => p.en.trim()) }}
        />
      }
    >
      {extra}
      {filas.length > 0 ? (
        <ul className="grid gap-2">
          {filas.map((p, i) => {
            const comun = fija?.(p);
            return (
              <li key={i} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ink/40" />
                {comun ? (
                  <p className="flex-1 rounded-xl border border-dashed border-line bg-surface/60 px-3.5 py-2.5 text-[13px] leading-snug text-ink">
                    <span className="mr-1.5 inline-block rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-muted-ink">
                      {comun}
                    </span>
                    {p[idioma]}
                  </p>
                ) : (
                  // Crece con el texto (los puntos suelen ser frases largas); Enter añade otro punto en vez de saltar de línea
                  <div className={cn(MARCO, "flex-1 items-stretch")}>
                    <textarea
                      ref={(el) => {
                        cajas.current[i] = el;
                      }}
                      rows={1}
                      lang={idioma}
                      value={p[idioma]}
                      onChange={(e) =>
                        alCambiar(filas.map((f, j) => (j === i ? { ...f, [idioma]: e.target.value.replace(/\s*\n\s*/g, " ") } : f)))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          agregar(i);
                        }
                        if (e.key === "Backspace" && !p.es && !p.en && filas.length > minimo) {
                          e.preventDefault();
                          quitar(i);
                        }
                      }}
                      placeholder={marcadorOtro(p, idioma, i === 0 ? ejemplo : t("otroPunto"), (texto) => t("siVacio", { texto }))}
                      aria-label={`${etiqueta} ${i + 1}`}
                      className={cn(TEXTO_CAJA, "min-h-11 resize-none px-3.5 py-2.5 leading-snug field-sizing-content")}
                      data-testid={`${id}-${idioma}-${i}`}
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  disabled={!comun && filas.length <= minimo && !p.es && !p.en}
                  aria-label={t("quitarPunto", { n: i + 1 })}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-muted-ink outline-none hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/30 disabled:invisible"
                  data-testid={`quitar-${id}-${i}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <button
        type="button"
        onClick={() => agregar(filas.length - 1)}
        className="inline-flex w-fit items-center gap-1.5 rounded-full px-1 py-1 text-[13px] font-bold text-link outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ink/30"
        data-testid={`agregar-${id}`}
      >
        <Plus className="size-4" aria-hidden="true" />
        {textoAgregar}
      </button>
    </Grupo>
  );
}

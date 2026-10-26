"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconoAviso, IconoCandado, IconoTarjeta } from "@/components/cuento/iconos";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { Resumen } from "@/components/carrito/resumen";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link, useRouter } from "@/i18n/navigation";
import { aCentavos, aDolares, fechaLarga, precio, sumarDiasHabiles } from "@/lib/formato";
import {
  calcularTotales,
  ENVIO_ESTANDAR,
  ENVIO_EXPRES,
  ENVIO_GRATIS_DESDE,
  type MetodoEnvio,
} from "@/lib/totales";
import type { Idioma, Impuestos } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { zipValido } from "@/lib/zip";
import { registrarActividad } from "@/stores/actividad";
import { useCarrito } from "@/stores/carrito";
import { useCuenta } from "@/stores/cuenta";
import { usePedidos } from "@/stores/pedidos";
import { usePreferencias } from "@/stores/preferencias";
import { ImagenSuelta } from "@/components/producto/foto-ia";
import { Cielo } from "@/components/cuento/cielo";

type Pago = "tarjeta" | "apple" | "google" | "paypal" | "cuotas";
type Campo =
  | "correo"
  | "nombre"
  | "direccion"
  | "direccion2"
  | "ciudad"
  | "estado"
  | "zip"
  | "telefono";

// La dirección va en dos líneas (calle y número; apartamento o unidad) y el teléfono es para avisos de la entrega, como
// en Amazon (review de usuario, 16-10). Esos dos no son obligatorios.
const OPCIONALES: Campo[] = ["direccion2", "telefono"];

// 555-0100 a 555-0199: números reservados para ficción en EE. UU.
const EJEMPLO: Record<Campo, string> = {
  correo: "maria@example.com",
  nombre: "Maria Sample",
  direccion: "1200 Demo Ave",
  direccion2: "Apt 4",
  ciudad: "Seattle",
  estado: "WA",
  zip: "98101",
  telefono: "(206) 555-0123",
};

/** Los botones de pago rápido, con el color de cada marca (solo texto: sin sus logos). */
const RAPIDOS: {
  m: Extract<Pago, "apple" | "google" | "paypal">;
  nombre: string;
  clase: string;
}[] = [
  { m: "apple", nombre: "Apple Pay", clase: "bg-black text-white hover:bg-black/85" },
  { m: "google", nombre: "Google Pay", clase: "bg-[#202124] text-white hover:bg-[#202124]/85" },
  { m: "paypal", nombre: "PayPal", clase: "bg-[#ffc439] text-[#002f86] hover:brightness-95" },
];

/**
 * El pago (rediseño del 26-10), al estilo de Shopify sin ser Shopify (pedido de la clienta): una sola página,
 * el pago rápido arriba, y debajo contacto, entrega, envío y pago, con el resumen siempre a la vista (a la derecha en
 * escritorio, plegado arriba en el celular). Invitado o cuenta se elige en la misma página, sin ventana emergente.
 */
export function Checkout({ impuestos }: { impuestos: Impuestos }) {
  const t = useTranslations();
  const locale = useLocale() as Idioma;
  const router = useRouter();
  const hidratado = useHidratado();
  const { porId } = useCatalogo();
  const { lineas, regalo, vaciar } = useCarrito();
  const zipPreferido = usePreferencias((s) => s.zip);
  const guardarPedido = usePedidos((s) => s.guardar);
  const usuario = useCuenta((s) => s.usuario);

  const [modo, setModo] = useState<"invitado" | "cuenta">(() => (usuario ? "cuenta" : "invitado"));
  const [datos, setDatos] = useState<Record<Campo, string>>(() => ({
    correo: usuario?.correo ?? "",
    nombre: usuario?.nombre ?? "",
    direccion: "",
    direccion2: "",
    ciudad: "",
    estado: "",
    zip: "",
    telefono: "",
  }));
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [sinCuenta, setSinCuenta] = useState(false);
  const [envio, setEnvio] = useState<MetodoEnvio>("estandar");
  const [pago, setPago] = useState<Pago>("tarjeta");

  if (!hidratado) return <div className="mx-auto min-h-[60vh] max-w-6xl px-4 md:px-6" />;

  const activas = lineas.filter((l) => !l.guardado && porId.has(l.id));
  if (activas.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-12 text-center md:px-6">
        <p className="font-display text-2xl font-semibold">{t("carrito.vacio")}</p>
        <Button asChild variant="cta" size="lg" className="mt-5">
          <Link href="/">{t("carrito.seguirComprando")}</Link>
        </Button>
      </div>
    );
  }

  const zip = zipValido(datos.zip) ? datos.zip : zipPreferido;
  const totales = calcularTotales(lineas, porId, zip, impuestos, envio);
  const nombreEstado = totales.estado ? impuestos.estados[totales.estado]?.name : undefined;
  const hoy = new Date();
  const dias = Math.max(...activas.map((l) => porId.get(l.id)!.deliveryDays));
  const llegaEstandar = sumarDiasHabiles(hoy, dias);
  const llegaExpres = sumarDiasHabiles(hoy, 1);
  const llega = envio === "expres" ? llegaExpres : llegaEstandar;
  const cuota = precio(aDolares(Math.ceil(totales.total / 4)), locale);
  const total = precio(aDolares(totales.total), locale);

  const cambiar = (campo: Campo, valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  function validar(): boolean {
    // «Tengo una cuenta» sin haber entrado: primero hay que entrar (o seguir como invitado).
    const falta = modo === "cuenta" && !usuario;
    setSinCuenta(falta);
    if (falta) {
      document.getElementById("entrar-para-pagar")?.focus();
      return false;
    }
    const e: Partial<Record<Campo, string>> = {};
    for (const c of Object.keys(datos) as Campo[])
      if (!OPCIONALES.includes(c) && !datos[c].trim()) e[c] = t("pago.obligatorio");
    if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo))
      e.correo = t("pago.correoInvalido");
    if (datos.zip && !zipValido(datos.zip)) e.zip = t("pago.zipInvalido");
    // Un teléfono de EE. UU.: 10 cifras, o 11 con el 1 delante.
    const cifras = datos.telefono.replace(/\D/g, "");
    if (
      datos.telefono.trim() &&
      !(cifras.length === 10 || (cifras.length === 11 && cifras.startsWith("1")))
    ) {
      e.telefono = t("pago.telefonoInvalido");
    }
    setErrores(e);
    const primero = Object.keys(e)[0];
    if (primero) document.getElementById(`campo-${primero}`)?.focus();
    return !primero;
  }

  /** Sin `rapido`, el pedido del formulario. Con él, el pago rápido de la demo: la dirección de ejemplo y ese método. */
  function hacerPedido(rapido?: Pago) {
    if (!rapido && !validar()) return;
    const d = rapido
      ? { ...EJEMPLO, correo: usuario?.correo ?? (datos.correo || EJEMPLO.correo) }
      : datos;
    const metodo = rapido ?? pago;
    const conCuenta = rapido ? Boolean(usuario) : modo === "cuenta";
    const id = `DEMO-${Math.floor(100000 + Math.random() * 900000)}`;
    const nombresPago: Record<Pago, string> = {
      tarjeta: t("pago.tarjeta"),
      apple: "Apple Pay",
      google: "Google Pay",
      paypal: "PayPal",
      cuotas: t("pago.cuotas", { monto: cuota }),
    };
    guardarPedido({
      id,
      fecha: hoy.toISOString(),
      llega: llega.toISOString(),
      lineas: activas.map((l) => ({
        id: l.id,
        qty: l.qty,
        precio: aCentavos(porId.get(l.id)!.price),
      })),
      subtotal: totales.subtotal,
      envio: totales.envio,
      impuesto: totales.impuesto,
      total: totales.total,
      metodoPago: nombresPago[metodo],
      correo: d.correo,
      nombre: d.nombre,
      direccion: [d.direccion, d.direccion2, d.ciudad, `${d.estado} ${d.zip}`]
        .filter((x) => x.trim())
        .join(", "),
      regalo,
      cuenta: conCuenta ? usuario?.correo : undefined,
    });
    registrarActividad({ tipo: "compra", total: totales.total });
    vaciar();
    router.push({ pathname: "/order", query: { id } });
  }

  // Cada paso, una tarjeta de evento del canon (blanca, 18 px) con su número de paso en la cejilla.
  const seccion = "tarjeta-evento grid gap-4 p-6 md:p-8";
  const titulo = "font-display text-[23px] leading-tight font-bold";
  const paso = (n: number) => (
    <p className="cejilla text-mandarina-tinta -mb-2 flex items-center gap-2">
      <span aria-hidden="true" className="chispa bg-mandarina text-[9px]" />
      {t("pago.pasoDe", { n, total: 4 })}
    </p>
  );
  const opcion = (activa: boolean) =>
    cn(
      "-mt-px flex cursor-pointer items-center gap-3 border border-line bg-white px-4 py-3.5 first:mt-0 first:rounded-t-[14px] last:rounded-b-[14px]",
      activa && "relative z-10 border-mandarina-tinta bg-tint-durazno/40",
    );
  const campo = (c: Campo, etiqueta: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="grid gap-1.5">
      <Label
        htmlFor={`campo-${c}`}
        className="cejilla text-ink/80 text-[0.68rem] tracking-[0.16em]"
      >
        {etiqueta}
      </Label>
      <Input
        id={`campo-${c}`}
        value={datos[c]}
        aria-invalid={!!errores[c]}
        aria-describedby={errores[c] ? `error-${c}` : undefined}
        onChange={(e) => cambiar(c, e.target.value)}
        {...props}
      />
      {errores[c] ? (
        <p id={`error-${c}`} className="text-out text-[13px]">
          {errores[c]}
        </p>
      ) : null}
    </div>
  );

  const articulos = (
    <ul className="grid gap-3">
      {activas.map((l) => {
        const p = porId.get(l.id)!;
        return (
          <li key={l.id} className="flex items-center gap-3 text-[14px]">
            <span
              className={cn(
                "ring-line relative grid size-16 shrink-0 place-items-center rounded-[12px] ring-1",
                FONDO_TINTE[p.tint],
              )}
            >
              <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-[12px]">
                <ImagenSuelta
                  illustration={p.illustration}
                  imagen={p.imagen}
                  className="size-12"
                  claseFoto="size-full object-cover"
                />
              </span>
              <span className="bg-noche text-crema absolute -top-2 -right-2 grid size-6 place-items-center rounded-full text-[12px] font-bold">
                {l.qty}
              </span>
            </span>
            <span className="line-clamp-2 flex-1 font-medium">{p.title[locale]}</span>
            <span className="font-semibold">
              {precio(aDolares(aCentavos(p.price) * l.qty), locale)}
            </span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="lg:grid lg:min-h-[calc(100svh-120px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* El resumen plegado arriba, en el celular (como Shopify): se ve el total sin bajar. */}
      <details className="group noche lg:hidden" data-testid="resumen-movil">
        <summary className="mx-auto flex max-w-xl cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-aqua inline-flex items-center gap-1.5 text-[15px] font-semibold">
            <span className="group-open:hidden">{t("pago.verResumen")}</span>
            <span className="hidden group-open:inline">{t("pago.ocultarResumen")}</span>
            <span
              aria-hidden="true"
              className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
            >
              ▾
            </span>
          </span>
          <span className="font-display text-calendula text-[20px] font-bold">{total}</span>
        </summary>
        <div className="mx-auto max-w-xl px-4 pb-5">
          <div className="tarjeta-evento text-ink grid gap-5 p-5">
            {articulos}
            <Resumen totales={totales} nombreEstado={nombreEstado} />
          </div>
        </div>
      </details>

      <div className="lg:flex lg:justify-end">
        <div className="mx-auto grid w-full max-w-xl gap-6 px-4 py-8 md:px-8 lg:mx-0 lg:py-12 lg:pr-12">
          <p
            className="border-low/30 bg-low/5 text-low flex items-start gap-2 rounded-[12px] border p-3 text-[13px] font-semibold"
            data-testid="aviso-demo"
          >
            <IconoAviso className="mt-0.5 size-4 shrink-0" />
            {t("pago.aviso")}
          </p>

          <section aria-labelledby="pago-rapido" className="grid gap-3">
            <h1
              id="pago-rapido"
              className="font-display text-muted-ink text-center text-[15px] font-semibold"
            >
              {t("pago.rapido")}
            </h1>
            <div className="grid grid-cols-3 gap-2">
              {RAPIDOS.map((r) => (
                <button
                  key={r.m}
                  type="button"
                  onClick={() => hacerPedido(r.m)}
                  className={cn(
                    "h-12 rounded-[8px] px-2 text-[15px] font-bold whitespace-nowrap",
                    r.clase,
                  )}
                  data-testid={`rapido-${r.m}`}
                >
                  {r.nombre}
                </button>
              ))}
            </div>
            <p className="text-muted-ink text-center text-[12.5px]">{t("pago.rapidoNota")}</p>
            <p
              aria-hidden="true"
              className="text-muted-ink flex items-center gap-3 text-[13px] font-semibold"
            >
              <span className="bg-line h-px flex-1" />
              {t("pago.o")}
              <span className="bg-line h-px flex-1" />
            </p>
          </section>

          <section className={seccion} aria-labelledby="paso1">
            {paso(1)}
            <h2 id="paso1" className={titulo}>
              {t("pago.contacto")}
            </h2>
            {/* Invitado o cuenta, en la misma página y no en una ventana emergente: un paso menos. Por defecto,
                invitado. */}
            <RadioGroup
              value={modo}
              onValueChange={(v) => {
                setModo(v as "invitado" | "cuenta");
                setSinCuenta(false);
                if (v === "cuenta" && usuario) {
                  setDatos((d) => ({
                    ...d,
                    correo: usuario.correo,
                    nombre: d.nombre || usuario.nombre,
                  }));
                  setErrores((e) => ({ ...e, correo: undefined }));
                }
              }}
              aria-label={t("pago.comoCompras")}
              className="rounded-chip bg-papel grid grid-cols-2 gap-1 p-1"
            >
              {(["invitado", "cuenta"] as const).map((m) => (
                <Label
                  key={m}
                  htmlFor={`modo-${m}`}
                  className={cn(
                    "rounded-chip font-display has-[:focus-visible]:ring-aqua flex min-h-11 cursor-pointer items-center justify-center gap-2 px-3 text-center text-[14px] font-semibold has-[:focus-visible]:ring-3",
                    modo === m
                      ? "bg-mandarina text-noche"
                      : "text-ink hover:bg-aqua hover:text-noche",
                  )}
                >
                  <RadioGroupItem
                    id={`modo-${m}`}
                    value={m}
                    className="sr-only"
                    data-testid={`modo-${m}`}
                  />
                  {t(`pago.${m}Corto`)}
                </Label>
              ))}
            </RadioGroup>
            {modo === "invitado" ? (
              <>
                {campo("correo", t("pago.correo"), {
                  type: "email",
                  autoComplete: "off",
                  inputMode: "email",
                })}
                <p className="text-muted-ink text-[13px]">{t("pago.invitadoTexto")}</p>
              </>
            ) : usuario ? (
              <p
                className="shadow-tarjeta rounded-[12px] bg-white px-4 py-3 text-sm font-semibold"
                data-testid="comprando-como"
              >
                {t("pago.comprandoComo", {
                  nombre: usuario.nombre || usuario.correo,
                  correo: usuario.correo,
                })}
              </p>
            ) : (
              <div className="grid gap-2">
                <p className="text-muted-ink text-[13px]">{t("pago.cuentaTexto")}</p>
                <Link
                  id="entrar-para-pagar"
                  href={{ pathname: "/account", query: { volver: "/checkout" } }}
                  className="placa placa-noche"
                  data-testid="entrar-para-pagar"
                >
                  {t("pago.cuentaEntrar")}
                </Link>
                {sinCuenta ? (
                  <p role="alert" className="text-out text-[13px] font-semibold">
                    {t("pago.entraPrimero")}
                  </p>
                ) : null}
              </div>
            )}
          </section>

          <section className={seccion} aria-labelledby="paso2">
            {paso(2)}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="paso2" className={titulo}>
                {t("pago.entrega")}
              </h2>
              <button
                type="button"
                data-testid="rellenar"
                onClick={() => {
                  setDatos((d) => ({ ...EJEMPLO, correo: d.correo || EJEMPLO.correo }));
                  setErrores({});
                }}
                className="text-link text-[13.5px] font-bold underline-offset-4 hover:underline"
              >
                {t("pago.rellenar")}
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                {campo("nombre", t("pago.nombre"), { autoComplete: "off" })}
              </div>
              <div className="md:col-span-2">
                {campo("direccion", t("pago.direccion"), { autoComplete: "off" })}
              </div>
              <div className="md:col-span-2">
                {campo("direccion2", t("pago.direccion2"), { autoComplete: "off" })}
              </div>
              {campo("ciudad", t("pago.ciudad"), { autoComplete: "off" })}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="campo-estado"
                    className="cejilla text-ink/80 text-[0.68rem] tracking-[0.16em]"
                  >
                    {t("pago.estado")}
                  </Label>
                  <select
                    id="campo-estado"
                    value={datos.estado}
                    aria-invalid={!!errores.estado}
                    onChange={(e) => cambiar("estado", e.target.value)}
                    className="aria-invalid:border-out border-ink/40 font-display focus-visible:border-mandarina-tinta h-12 rounded-none border-0 border-b-2 bg-transparent px-0.5 text-[1.05rem] font-medium focus-visible:border-b-[3px] focus-visible:outline-none"
                  >
                    <option value="" />
                    {Object.entries(impuestos.estados).map(([codigo]) => (
                      <option key={codigo} value={codigo}>
                        {codigo}
                      </option>
                    ))}
                  </select>
                  {errores.estado ? <p className="text-out text-[13px]">{errores.estado}</p> : null}
                </div>
                {campo("zip", t("pago.zip"), {
                  inputMode: "numeric",
                  maxLength: 5,
                  autoComplete: "off",
                })}
              </div>
              <div className="md:col-span-2">
                {campo("telefono", t("pago.telefono"), {
                  type: "tel",
                  inputMode: "tel",
                  autoComplete: "off",
                })}
              </div>
            </div>
          </section>

          <section className={seccion} aria-labelledby="paso3">
            {paso(3)}
            <h2 id="paso3" className={titulo}>
              {t("pago.metodoEnvio")}
            </h2>
            <RadioGroup
              value={envio}
              onValueChange={(v) => setEnvio(v as MetodoEnvio)}
              className="grid gap-0"
            >
              {(["estandar", "expres"] as const).map((m) => {
                const fecha = fechaLarga(m === "expres" ? llegaExpres : llegaEstandar, locale);
                const costo =
                  m === "expres"
                    ? precio(ENVIO_EXPRES, locale)
                    : totales.subtotal >= aCentavos(ENVIO_GRATIS_DESDE)
                      ? t("carrito.envioGratis")
                      : precio(ENVIO_ESTANDAR, locale);
                return (
                  <Label key={m} htmlFor={`envio-${m}`} className={opcion(envio === m)}>
                    <RadioGroupItem id={`envio-${m}`} value={m} />
                    <span className="grid flex-1 gap-0.5">
                      <span className="font-bold">{t(`pago.${m}`)}</span>
                      <span className="text-stock text-[13px] font-semibold">
                        {t("pago.llegaEl", { fecha })}
                      </span>
                    </span>
                    <span className="font-bold">{costo}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </section>

          <section className={seccion} aria-labelledby="paso4">
            {paso(4)}
            <h2 id="paso4" className={titulo}>
              {t("pago.pago")}
            </h2>
            <p className="text-muted-ink -mt-1 flex items-center gap-1.5 text-[13px]">
              <IconoCandado className="size-3.5" />
              {t("pago.tarjetaNota")}
            </p>
            <RadioGroup
              value={pago}
              onValueChange={(v) => setPago(v as Pago)}
              className="grid gap-0"
            >
              {(
                [
                  ["tarjeta", t("pago.tarjeta")],
                  ["apple", "Apple Pay"],
                  ["google", "Google Pay"],
                  ["paypal", "PayPal"],
                  ["cuotas", t("pago.cuotas", { monto: cuota })],
                ] as [Pago, string][]
              ).map(([m, texto]) => (
                <Label key={m} htmlFor={`pago-${m}`} className={opcion(pago === m)}>
                  <RadioGroupItem id={`pago-${m}`} value={m} data-testid={`pago-${m}`} />
                  {m === "tarjeta" ? <IconoTarjeta className="text-muted-ink size-5" /> : null}
                  <span className="font-bold">{texto}</span>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <div className="grid gap-2">
            <Button
              type="button"
              variant="cta"
              size="xl"
              className="h-14 w-full text-[15px]"
              onClick={() => hacerPedido()}
              data-testid="hacer-pedido"
            >
              {t("pago.realizar")} · {total}
            </Button>
            {Object.values(errores).some(Boolean) ? (
              <p className="text-out text-sm font-bold" role="alert" data-testid="error-pago">
                {t("pago.errorCampos")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* El resumen, a la derecha sobre el cielo azul noche: una tarjeta blanca con lo que se compra y el total en
          caléndula, siempre a la vista. */}
      <aside className="noche relative hidden overflow-hidden lg:block" aria-labelledby="paso5">
        <Cielo cantidad={40} semilla={71} />
        <div className="sticky top-0 grid max-w-md gap-6 px-12 py-12">
          <div className="flex items-end justify-between gap-4">
            <h2 id="paso5" className="font-display text-crema text-[24px] font-bold">
              {t("pago.resumen")}
            </h2>
            <span className="subdisplay text-calendula text-[2.2rem]">{total}</span>
          </div>
          <div className="tarjeta-evento text-ink grid gap-6 p-7">
            {articulos}
            <Resumen totales={totales} nombreEstado={nombreEstado} />
          </div>
          <p className="text-crema/80 flex items-center gap-2 text-[13px]">
            <IconoCandado className="text-calendula size-3.5" />
            {t("pago.tarjetaNota")}
          </p>
        </div>
      </aside>
    </div>
  );
}

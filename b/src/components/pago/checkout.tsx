"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CreditCard, Lock, ShieldAlert } from "lucide-react";
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

type Pago = "tarjeta" | "apple" | "google" | "paypal" | "cuotas";
type Campo = "correo" | "nombre" | "direccion" | "direccion2" | "ciudad" | "estado" | "zip" | "telefono";

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
      <div className="mx-auto max-w-6xl px-4 pt-8 text-center md:px-6">
        <p className="font-display text-2xl">{t("carrito.vacio")}</p>
        <Button asChild variant="cta" size="lg" className="mt-4">
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

  const cambiar = (campo: Campo, valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  function validar(): boolean {
    // «Comprar con mi cuenta» sin haber entrado: primero hay que entrar (o pagar como invitada).
    const falta = modo === "cuenta" && !usuario;
    setSinCuenta(falta);
    if (falta) {
      document.getElementById("entrar-para-pagar")?.focus();
      return false;
    }
    const e: Partial<Record<Campo, string>> = {};
    for (const c of Object.keys(datos) as Campo[]) if (!OPCIONALES.includes(c) && !datos[c].trim()) e[c] = t("pago.obligatorio");
    if (datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) e.correo = t("pago.correoInvalido");
    if (datos.zip && !zipValido(datos.zip)) e.zip = t("pago.zipInvalido");
    // Un teléfono de EE. UU.: 10 cifras, o 11 con el 1 delante.
    const cifras = datos.telefono.replace(/\D/g, "");
    if (datos.telefono.trim() && !(cifras.length === 10 || (cifras.length === 11 && cifras.startsWith("1")))) {
      e.telefono = t("pago.telefonoInvalido");
    }
    setErrores(e);
    const primero = Object.keys(e)[0];
    if (primero) document.getElementById(`campo-${primero}`)?.focus();
    return !primero;
  }

  function hacerPedido() {
    if (!validar()) return;
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
      lineas: activas.map((l) => ({ id: l.id, qty: l.qty, precio: aCentavos(porId.get(l.id)!.price) })),
      subtotal: totales.subtotal,
      envio: totales.envio,
      impuesto: totales.impuesto,
      total: totales.total,
      metodoPago: nombresPago[pago],
      correo: datos.correo,
      nombre: datos.nombre,
      direccion: [datos.direccion, datos.direccion2, datos.ciudad, `${datos.estado} ${datos.zip}`].filter((x) => x.trim()).join(", "),
      regalo,
      cuenta: modo === "cuenta" ? usuario?.correo : undefined,
    });
    registrarActividad({ tipo: "compra", total: totales.total });
    vaciar();
    router.push({ pathname: "/order", query: { id } });
  }

  const caja = "rounded-card bg-white p-4 shadow-tarjeta md:p-5";
  const titulo = "mb-3 text-lg md:text-xl";
  const campo = (c: Campo, etiqueta: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="grid gap-1.5">
      <Label htmlFor={`campo-${c}`}>{etiqueta}</Label>
      <Input
        id={`campo-${c}`}
        value={datos[c]}
        aria-invalid={!!errores[c]}
        aria-describedby={errores[c] ? `error-${c}` : undefined}
        onChange={(e) => cambiar(c, e.target.value)}
        className="h-11"
        {...props}
      />
      {errores[c] ? (
        <p id={`error-${c}`} className="text-[13px] text-out">
          {errores[c]}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 md:px-6">
      <h1 className="flex items-center gap-2 text-[26px] md:text-3xl">
        <Lock className="size-6" aria-hidden="true" />
        {t("pago.titulo")}
      </h1>
      <p className="mt-3 flex items-start gap-2 rounded-md border border-low/30 bg-low/5 p-3 text-sm font-semibold text-low" data-testid="aviso-demo">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {t("pago.aviso")}
      </p>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <section className={caja} aria-labelledby="paso1">
            <h2 id="paso1" className={titulo}>
              {t("pago.paso1")}
            </h2>
            <RadioGroup
              value={modo}
              onValueChange={(v) => {
                setModo(v as "invitado" | "cuenta");
                setSinCuenta(false);
                if (v === "cuenta" && usuario) {
                  setDatos((d) => ({ ...d, correo: usuario.correo, nombre: d.nombre || usuario.nombre }));
                  setErrores((e) => ({ ...e, correo: undefined }));
                }
              }}
              className="grid gap-2"
            >
              {(["invitado", "cuenta"] as const).map((m) => (
                <Label
                  key={m}
                  htmlFor={`modo-${m}`}
                  className={cn("flex cursor-pointer items-start gap-3 rounded-md border p-3", modo === m && "border-ink bg-surface")}
                >
                  <RadioGroupItem id={`modo-${m}`} value={m} className="mt-0.5" data-testid={`modo-${m}`} />
                  <span className="grid gap-0.5">
                    <span className="font-bold">{t(`pago.${m}`)}</span>
                    <span className="text-[13px] font-normal text-muted-ink">{t(`pago.${m}Texto`)}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            {modo === "invitado" ? (
              <div className="mt-3">{campo("correo", t("pago.correo"), { type: "email", autoComplete: "off", inputMode: "email" })}</div>
            ) : usuario ? (
              <p className="mt-3 rounded-md bg-surface px-3 py-2 text-sm font-semibold" data-testid="comprando-como">
                {t("pago.comprandoComo", { nombre: usuario.nombre || usuario.correo, correo: usuario.correo })}
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                <Button asChild variant="outline" size="lg">
                  <Link id="entrar-para-pagar" href={{ pathname: "/account", query: { volver: "/checkout" } }} data-testid="entrar-para-pagar">
                    {t("pago.cuentaEntrar")}
                  </Link>
                </Button>
                {sinCuenta ? (
                  <p role="alert" className="text-[13px] font-semibold text-out">
                    {t("pago.entraPrimero")}
                  </p>
                ) : null}
              </div>
            )}
          </section>

          <section className={caja} aria-labelledby="paso2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 id="paso2" className="text-lg md:text-xl">
                {t("pago.paso2")}
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="rellenar"
                onClick={() => {
                  setDatos((d) => ({ ...EJEMPLO, correo: d.correo || EJEMPLO.correo }));
                  setErrores({});
                }}
              >
                {t("pago.rellenar")}
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">{campo("nombre", t("pago.nombre"), { autoComplete: "off" })}</div>
              <div className="md:col-span-2">{campo("direccion", t("pago.direccion"), { autoComplete: "off" })}</div>
              <div className="md:col-span-2">{campo("direccion2", t("pago.direccion2"), { autoComplete: "off" })}</div>
              {campo("ciudad", t("pago.ciudad"), { autoComplete: "off" })}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="campo-estado">{t("pago.estado")}</Label>
                  <select
                    id="campo-estado"
                    value={datos.estado}
                    aria-invalid={!!errores.estado}
                    onChange={(e) => cambiar("estado", e.target.value)}
                    className="h-11 rounded-md border border-input bg-white px-2 text-sm aria-invalid:border-out"
                  >
                    <option value="" />
                    {Object.entries(impuestos.estados).map(([codigo]) => (
                      <option key={codigo} value={codigo}>
                        {codigo}
                      </option>
                    ))}
                  </select>
                  {errores.estado ? <p className="text-[13px] text-out">{errores.estado}</p> : null}
                </div>
                {campo("zip", t("pago.zip"), { inputMode: "numeric", maxLength: 5, autoComplete: "off" })}
              </div>
              <div className="md:col-span-2">
                {campo("telefono", t("pago.telefono"), { type: "tel", inputMode: "tel", autoComplete: "off" })}
              </div>
            </div>
          </section>

          <section className={caja} aria-labelledby="paso3">
            <h2 id="paso3" className={titulo}>
              {t("pago.paso3")}
            </h2>
            <RadioGroup value={envio} onValueChange={(v) => setEnvio(v as MetodoEnvio)} className="grid gap-2">
              {(["estandar", "expres"] as const).map((m) => {
                const fecha = fechaLarga(m === "expres" ? llegaExpres : llegaEstandar, locale);
                const costo =
                  m === "expres"
                    ? precio(ENVIO_EXPRES, locale)
                    : totales.subtotal >= aCentavos(ENVIO_GRATIS_DESDE)
                      ? t("carrito.envioGratis")
                      : precio(ENVIO_ESTANDAR, locale);
                return (
                  <Label
                    key={m}
                    htmlFor={`envio-${m}`}
                    className={cn("flex cursor-pointer items-center gap-3 rounded-md border p-3", envio === m && "border-ink bg-surface")}
                  >
                    <RadioGroupItem id={`envio-${m}`} value={m} />
                    <span className="grid flex-1 gap-0.5">
                      <span className="font-bold text-stock">{t("pago.llegaEl", { fecha })}</span>
                      <span className="text-[13px] font-normal text-muted-ink">{t(`pago.${m}`)}</span>
                    </span>
                    <span className="font-bold">{costo}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </section>

          <section className={caja} aria-labelledby="paso4">
            <h2 id="paso4" className={titulo}>
              {t("pago.paso4")}
            </h2>
            <RadioGroup value={pago} onValueChange={(v) => setPago(v as Pago)} className="grid gap-2">
              {(
                [
                  ["tarjeta", t("pago.tarjeta")],
                  ["apple", "Apple Pay"],
                  ["google", "Google Pay"],
                  ["paypal", "PayPal"],
                  ["cuotas", t("pago.cuotas", { monto: cuota })],
                ] as [Pago, string][]
              ).map(([m, texto]) => (
                <Label
                  key={m}
                  htmlFor={`pago-${m}`}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-md border p-3", pago === m && "border-ink bg-surface")}
                >
                  <RadioGroupItem id={`pago-${m}`} value={m} data-testid={`pago-${m}`} />
                  {m === "tarjeta" ? <CreditCard className="size-5 text-muted-ink" aria-hidden="true" /> : null}
                  <span className="font-bold">{texto}</span>
                </Label>
              ))}
            </RadioGroup>
            <p className="mt-2 text-[13px] text-muted-ink">{t("pago.tarjetaNota")}</p>
          </section>
        </div>

        <aside className="grid gap-4 rounded-card bg-white p-4 shadow-tarjeta md:p-5 lg:sticky lg:top-12" aria-labelledby="paso5">
          <h2 id="paso5" className="text-lg">
            {t("pago.paso5")}
          </h2>
          <ul className="grid gap-2">
            {activas.map((l) => {
              const p = porId.get(l.id)!;
              return (
                <li key={l.id} className="flex items-center gap-3 text-sm">
                  <span className={cn("grid size-12 shrink-0 place-items-center overflow-hidden rounded-md", FONDO_TINTE[p.tint])}>
                    <ImagenSuelta illustration={p.illustration} imagen={p.imagen} className="size-10" claseFoto="size-full object-cover" />
                  </span>
                  <span className="line-clamp-2 flex-1">{p.title[locale]}</span>
                  <span className="text-muted-ink">×{l.qty}</span>
                </li>
              );
            })}
          </ul>
          <Resumen totales={totales} nombreEstado={nombreEstado} />
          <Button type="button" variant="cta" size="xl" className="w-full" onClick={hacerPedido} data-testid="hacer-pedido">
            {t("pago.realizar")}
          </Button>
          {Object.values(errores).some(Boolean) ? (
            <p className="text-sm font-bold text-out" role="alert" data-testid="error-pago">
              {t("pago.errorCampos")}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLAVE_MINIMA, CORREO_ADMIN, type ErrorSesion, type Usuario } from "@/lib/sesion";
import { useCuenta } from "@/stores/cuenta";

/**
 * Entrar o crear una cuenta (de la demo). El mismo formulario sirve a la dueña:
 * con el correo de administración entra al panel.
 */
export function FormularioAcceso({
  soloEntrar = false,
  alEntrar,
}: {
  /** Sin la opción de crear cuenta (p. ej., en la puerta del panel). */
  soloEntrar?: boolean;
  alEntrar?: (usuario: Usuario) => void;
}) {
  const t = useTranslations("acceso");
  const registrar = useCuenta((s) => s.registrar);
  const entrar = useCuenta((s) => s.entrar);
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState<ErrorSesion | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [olvide, setOlvide] = useState(false);
  const crear = modo === "crear";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const fallo = crear ? await registrar({ nombre, correo, clave }) : await entrar(correo, clave);
    setEnviando(false);
    setError(fallo);
    const usuario = useCuenta.getState().usuario;
    if (!fallo && usuario) alEntrar?.(usuario);
  }

  function cambiarModo(nuevo: "entrar" | "crear") {
    setModo(nuevo);
    setError(null);
    setOlvide(false);
  }

  const errorEn = (campos: ErrorSesion[]) => (error && campos.includes(error) ? true : undefined);

  return (
    <div className="grid gap-4">
      <form onSubmit={enviar} noValidate className="grid gap-3 rounded-card bg-white p-5 shadow-tarjeta" data-testid="form-acceso">
        <h2 className="text-xl">{crear ? t("tituloCrear") : t("tituloEntrar")}</h2>
        {crear ? (
          <div className="grid gap-1.5">
            <Label htmlFor="acceso-nombre">{t("nombre")}</Label>
            <Input
              id="acceso-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="given-name"
              aria-invalid={errorEn(["nombreVacio"])}
              className="h-11"
              data-testid="campo-nombre"
            />
          </div>
        ) : null}
        <div className="grid gap-1.5">
          <Label htmlFor="acceso-correo">{t("correo")}</Label>
          <Input
            id="acceso-correo"
            type="email"
            inputMode="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
            aria-invalid={errorEn(["correoInvalido", "correoUsado", "correoAdmin", "credenciales"])}
            className="h-11"
            data-testid="campo-correo"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="acceso-clave">{crear ? t("claveNueva") : t("clave")}</Label>
          <div className="relative">
            <Input
              id="acceso-clave"
              type={verClave ? "text" : "password"}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              autoComplete={crear ? "new-password" : "current-password"}
              minLength={crear ? CLAVE_MINIMA : undefined}
              aria-invalid={errorEn(["claveCorta", "claveVacia", "credenciales"])}
              className="h-11 pr-11"
              data-testid="campo-clave"
            />
            <button
              type="button"
              onClick={() => setVerClave((v) => !v)}
              aria-label={verClave ? t("ocultarClave") : t("mostrarClave")}
              aria-pressed={verClave}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-ink hover:text-ink"
            >
              {verClave ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-sm font-semibold text-out" data-testid="error-acceso">
            {t(`errores.${error}`)}
          </p>
        ) : null}
        <Button type="submit" variant="cta" size="xl" disabled={enviando} data-testid="boton-acceso">
          {crear ? t("botonCrear") : t("botonEntrar")}
        </Button>
        {!crear ? (
          <div className="text-sm">
            <button type="button" onClick={() => setOlvide((v) => !v)} className="font-bold text-link hover:underline">
              {t("olvide")}
            </button>
            {olvide ? <p className="mt-1.5 rounded-md bg-surface p-2.5 text-[13px]">{t("olvideTexto")}</p> : null}
          </div>
        ) : null}
        <p className="flex items-start gap-2 text-[13px] text-muted-ink">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t("aviso")}
        </p>
      </form>

      {soloEntrar ? null : (
        <div className="grid gap-2 text-center text-sm">
          <p className="text-muted-ink">{crear ? t("yaTienes") : t("esNueva")}</p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => cambiarModo(crear ? "entrar" : "crear")}
            data-testid={crear ? "ir-a-entrar" : "ir-a-crear"}
          >
            {crear ? t("irAEntrar") : t("irACrear")}
          </Button>
        </div>
      )}

      <details className="rounded-card border border-dashed p-3 text-[13px]">
        <summary className="cursor-pointer font-bold">{t("pruebas")}</summary>
        <ul className="mt-2 grid gap-1 text-muted-ink">
          <li>{t("pruebasCompradora")}</li>
          <li>{t("pruebasDuena", { correo: CORREO_ADMIN })}</li>
        </ul>
      </details>
    </div>
  );
}

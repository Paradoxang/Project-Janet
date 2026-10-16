"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ErrorSesion } from "@/lib/sesion";
import { useCuenta } from "@/stores/cuenta";

type ErrorClave = ErrorSesion | "noCoinciden";

/** Nombre, correo y cambio de contraseña de la compradora. */
export function DatosCuenta() {
  const t = useTranslations("cuenta");
  const usuario = useCuenta((s) => s.usuario);
  const cambiarNombre = useCuenta((s) => s.cambiarNombre);
  const cambiarClave = useCuenta((s) => s.cambiarClave);
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [errorNombre, setErrorNombre] = useState<ErrorSesion | null>(null);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repite, setRepite] = useState("");
  const [errorClave, setErrorClave] = useState<ErrorClave | null>(null);
  const [enviando, setEnviando] = useState(false);
  if (!usuario) return null;

  async function guardarClave(e: React.FormEvent) {
    e.preventDefault();
    if (nueva !== repite) {
      setErrorClave("noCoinciden");
      return;
    }
    setEnviando(true);
    const fallo = await cambiarClave(actual, nueva);
    setEnviando(false);
    setErrorClave(fallo);
    if (!fallo) {
      setActual("");
      setNueva("");
      setRepite("");
      toast.success(t("claveCambiada"));
    }
  }

  const campoClave = (id: string, etiqueta: string, valor: string, alCambiar: (v: string) => void, autocompletar: string) => (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      <Input
        id={id}
        type="password"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        autoComplete={autocompletar}
        aria-invalid={errorClave ? true : undefined}
        className="h-11 bg-white"
        data-testid={id}
      />
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form
        className="grid content-start gap-3 rounded-card bg-white p-5 shadow-tarjeta"
        onSubmit={(e) => {
          e.preventDefault();
          const fallo = cambiarNombre(nombre);
          setErrorNombre(fallo);
          if (!fallo) toast.success(t("nombreGuardado"));
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="cuenta-nombre">{t("nombre")}</Label>
          <Input
            id="cuenta-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="given-name"
            aria-invalid={errorNombre ? true : undefined}
            className="h-11 bg-white"
            data-testid="cuenta-nombre"
          />
          {errorNombre ? (
            <p role="alert" className="text-[13px] text-out">
              {t(`errores.${errorNombre}`)}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-medium">{t("correo")}</p>
          <p className="text-sm text-muted-ink">{usuario.correo}</p>
        </div>
        <Button type="submit" variant="outline" size="lg" data-testid="guardar-nombre">
          {t("guardarNombre")}
        </Button>
      </form>

      <form onSubmit={guardarClave} className="grid content-start gap-3 rounded-card bg-white p-5 shadow-tarjeta" noValidate>
        <h3 className="text-lg">{t("cambiarClave")}</h3>
        {campoClave("clave-actual", t("claveActual"), actual, setActual, "current-password")}
        {campoClave("clave-nueva", t("claveNueva"), nueva, setNueva, "new-password")}
        {campoClave("clave-repite", t("claveRepite"), repite, setRepite, "new-password")}
        {errorClave ? (
          <p role="alert" className="text-[13px] font-semibold text-out" data-testid="error-clave">
            {t(`errores.${errorClave}`)}
          </p>
        ) : null}
        <Button type="submit" variant="cta" size="lg" disabled={enviando} data-testid="cambiar-clave">
          {t("botonClave")}
        </Button>
      </form>
    </div>
  );
}

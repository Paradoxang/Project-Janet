"use client";

import { useTranslations } from "next-intl";
import { LockKeyhole, LogOut, Store } from "lucide-react";
import { FormularioAcceso } from "@/components/cuenta/formulario-acceso";
import { Button } from "@/components/ui/button";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import { useCuenta } from "@/stores/cuenta";

/** La zona de administración: solo la ve quien entró con el correo de administración. */
export function SoloAdmin({ children }: { children: React.ReactNode }) {
  const t = useTranslations("acceso");
  const hidratado = useHidratado();
  const usuario = useCuenta((s) => s.usuario);
  const salir = useCuenta((s) => s.salir);

  if (!hidratado) return <div className="min-h-[60vh]" />;

  if (usuario?.rol === "admin") {
    return (
      <>
        <div className="border-b bg-ink text-white" data-testid="barra-admin">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm md:px-6">
            <span className="flex items-center gap-1.5 font-bold">
              <LockKeyhole className="size-4" aria-hidden="true" />
              {t("barra")}
            </span>
            <span className="text-white/70">{usuario.correo}</span>
            <span className="ml-auto flex items-center gap-1">
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-bold hover:bg-white/10">
                <Store className="size-4" aria-hidden="true" />
                {t("verTienda")}
              </Link>
              <button
                type="button"
                onClick={salir}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-bold hover:bg-white/10"
                data-testid="salir-admin"
              >
                <LogOut className="size-4" aria-hidden="true" />
                {t("salir")}
              </button>
            </span>
          </div>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6 md:px-6" data-testid="puerta-admin">
      <span className="inline-flex items-center gap-1.5 rounded-chip bg-surface px-2.5 py-1 text-xs font-bold text-muted-ink">
        <LockKeyhole className="size-3.5" aria-hidden="true" />
        {t("zonaAdmin")}
      </span>
      <h1 className="mt-3 text-[26px] md:text-3xl">{t("tituloAdmin")}</h1>
      {usuario ? (
        <div className="mt-3 grid gap-3">
          <p className="text-muted-ink">{t("sinPermiso", { nombre: usuario.nombre })}</p>
          <Button type="button" variant="outline" size="lg" onClick={salir}>
            {t("cambiarCuenta")}
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-1 mb-4 text-muted-ink">{t("zonaAdminTexto")}</p>
          <FormularioAcceso soloEntrar />
        </>
      )}
    </div>
  );
}

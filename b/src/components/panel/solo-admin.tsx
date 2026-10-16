"use client";

import { useTranslations } from "next-intl";
import { LockKeyhole, LogOut, Store } from "lucide-react";
import { SelectorIdioma } from "@/components/cabecera/selector-idioma";
import { FormularioAcceso } from "@/components/cuenta/formulario-acceso";
import { Button } from "@/components/ui/button";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/marca/marca";
import { useCuenta } from "@/stores/cuenta";

/** Ancho del panel: más que la tienda, porque aquí la cabecera de la tienda se recoge (ver ModoPanel). */
export const ANCHO_PANEL = "mx-auto w-full max-w-[1600px] px-4 md:px-6 xl:px-8";

const BOTON_BARRA = "inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-bold hover:bg-white/10";

/**
 * La zona de administración: solo la ve quien entró con el correo de administración.
 * Dentro, una sola barra hace de cabecera (logo, secciones, idioma, tienda y salir) y el panel usa todo el ancho.
 */
export function SoloAdmin({ children }: { children: React.ReactNode }) {
  const t = useTranslations("acceso");
  const tDemo = useTranslations("demo");
  const hidratado = useHidratado();
  const pathname = usePathname().replace(/\/$/, "");
  const usuario = useCuenta((s) => s.usuario);
  const salir = useCuenta((s) => s.salir);

  if (!hidratado) return <div className="min-h-[60vh]" />;

  if (usuario?.rol === "admin") {
    return (
      <>
        <div className="border-b bg-ink text-white lg:sticky lg:top-0 lg:z-50" data-testid="barra-admin">
          <div className={cn(ANCHO_PANEL, "flex flex-wrap items-center gap-x-2 gap-y-2 py-2 text-sm sm:gap-x-3 lg:flex-nowrap lg:gap-x-4")}>
            <Logo negativo className="h-7 shrink-0" />
            <span className="flex items-center gap-1.5 font-bold whitespace-nowrap">
              <LockKeyhole className="size-4" aria-hidden="true" />
              <span className="max-sm:sr-only">{t("barra")}</span>
            </span>
            <span
              title={tDemo("franja")}
              className="rounded-chip border border-white/30 px-2 py-0.5 text-xs font-bold"
              data-testid="chip-demo"
            >
              {tDemo("corto")}
            </span>
            {/* En el celular va en una segunda línea; en la computadora, todo en una */}
            <div className="order-last flex w-full flex-wrap items-center gap-2 lg:order-none lg:w-auto lg:flex-1 lg:flex-nowrap">
              <nav aria-label={t("pestanas")}>
                <ul className="flex gap-1">
                  {(
                    [
                      ["/panel", t("resumen")],
                      ["/panel/catalogo", t("productos")],
                    ] as const
                  ).map(([ruta, texto]) => (
                    <li key={ruta}>
                      <Link
                        href={ruta}
                        aria-current={pathname === ruta ? "page" : undefined}
                        className="inline-flex rounded-md px-2.5 py-1 font-bold whitespace-nowrap text-white/80 hover:bg-white/10 aria-[current=page]:bg-white aria-[current=page]:text-ink"
                        data-testid={`pestana-${ruta === "/panel" ? "resumen" : "productos"}`}
                      >
                        {texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <span className="ml-auto flex min-w-0 items-center gap-2">
                <span className="hidden truncate text-white/70 xl:inline">{usuario.correo}</span>
                {usuario.invitado ? (
                  <span className="rounded-chip bg-white/15 px-2 py-0.5 text-xs font-bold whitespace-nowrap" data-testid="admin-invitado">
                    {t("invitado", { nombre: usuario.nombre })}
                  </span>
                ) : null}
              </span>
            </div>
            <span className="ml-auto flex items-center gap-1 lg:ml-0">
              <SelectorIdioma oscuro />
              <Link href="/" className={BOTON_BARRA} data-testid="ver-tienda">
                <Store className="size-4" aria-hidden="true" />
                <span className="max-md:sr-only">{t("verTienda")}</span>
              </Link>
              <button type="button" onClick={salir} className={BOTON_BARRA} data-testid="salir-admin">
                <LogOut className="size-4" aria-hidden="true" />
                <span className="max-md:sr-only">{t("salir")}</span>
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

"use client";

import { useTranslations } from "next-intl";
import { IconoBloques, IconoPersona } from "@/components/cuento/iconos";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import { useCuenta } from "@/stores/cuenta";

const ESTILO = "chip-icono relative";

/** Icono de cuenta de la cabecera: la inicial de quien entró y, para la dueña, el acceso al panel. */
export function EnlaceCuenta() {
  const t = useTranslations("cabecera");
  const hidratado = useHidratado();
  const usuario = useCuenta((s) => s.usuario);
  const u = hidratado ? usuario : null;

  if (u?.rol === "admin") {
    return (
      <Link
        href="/panel"
        aria-label={t("panel")}
        title={t("panel")}
        className={ESTILO}
        data-testid="enlace-cuenta"
      >
        <IconoBloques className="size-5" />
      </Link>
    );
  }
  return (
    <Link
      href="/account"
      aria-label={u ? t("cuentaDe", { nombre: u.nombre }) : t("cuenta")}
      className={ESTILO}
      data-testid="enlace-cuenta"
    >
      <IconoPersona className="size-5" />
      {u ? (
        <span
          aria-hidden="true"
          className="bg-calendula text-noche absolute right-0.5 bottom-0.5 grid size-4 place-items-center rounded-full text-[9px] leading-none font-bold uppercase"
        >
          {u.nombre.trim()[0]}
        </span>
      ) : null}
    </Link>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard, User } from "lucide-react";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import { useCuenta } from "@/stores/cuenta";

const ESTILO = "relative grid size-10 place-items-center rounded-md text-ink hover:bg-surface";

/** Icono de cuenta de la cabecera: la inicial de quien entró y, para la dueña, el acceso al panel. */
export function EnlaceCuenta() {
  const t = useTranslations("cabecera");
  const hidratado = useHidratado();
  const usuario = useCuenta((s) => s.usuario);
  const u = hidratado ? usuario : null;

  if (u?.rol === "admin") {
    return (
      <Link href="/panel" aria-label={t("panel")} title={t("panel")} className={ESTILO} data-testid="enlace-cuenta">
        <LayoutDashboard className="size-6" aria-hidden="true" />
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
      <User className="size-6" aria-hidden="true" />
      {u ? (
        <span
          aria-hidden="true"
          className="absolute right-0.5 bottom-0.5 grid size-4 place-items-center rounded-full bg-ink text-[9px] leading-none font-bold text-white uppercase"
        >
          {u.nombre.trim()[0]}
        </span>
      ) : null}
    </Link>
  );
}

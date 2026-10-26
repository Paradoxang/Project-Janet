"use client";

import { useTranslations } from "next-intl";
import { IconoCorazon } from "@/components/cuento/iconos";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import { useDeseos } from "@/stores/cuenta";

/**
 * El corazón de la cabecera lleva a la lista de deseos, con o sin cuenta (review de usuario, 16-10: «si lo agrego a la
 * wishlist, ¿dónde me quedó?»). Va entre la cuenta y el carrito, que es donde lo buscó.
 */
export function EnlaceDeseos() {
  const t = useTranslations("cabecera");
  const hidratado = useHidratado();
  const deseos = useDeseos();
  const n = hidratado ? deseos.length : 0;
  return (
    <Link
      href="/wishlist"
      data-testid="enlace-deseos"
      aria-label={`${t("deseos")}: ${n}`}
      className="chip-icono relative"
    >
      <IconoCorazon className="size-5" />
      {n > 0 ? (
        <span
          aria-hidden="true"
          data-testid="contador-deseos"
          className="bg-calendula text-noche absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-extrabold"
        >
          {n}
        </span>
      ) : null}
    </Link>
  );
}

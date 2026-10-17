"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
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
      className="relative grid size-10 place-items-center rounded-md text-ink hover:bg-surface"
    >
      <Heart className="size-6" aria-hidden="true" />
      {n > 0 ? (
        <span
          aria-hidden="true"
          data-testid="contador-deseos"
          className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-extrabold text-white"
        >
          {n}
        </span>
      ) : null}
    </Link>
  );
}

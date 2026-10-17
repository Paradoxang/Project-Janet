"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { TarjetaProducto } from "@/components/producto/tarjeta-producto";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import { useCuenta, useDeseos } from "@/stores/cuenta";

/** La lista de deseos, también sin cuenta: lo guardado como invitado pasa a la cuenta al entrar (stores/cuenta.ts). */
export function PaginaDeseos() {
  const t = useTranslations("deseos");
  const hidratado = useHidratado();
  const { porId } = useCatalogo();
  const usuario = useCuenta((s) => s.usuario);
  const alternarDeseo = useCuenta((s) => s.alternarDeseo);
  const deseos = useDeseos();

  if (!hidratado) return <div className="min-h-[60vh]" />;
  const productos = deseos.flatMap((id) => {
    const p = porId.get(id);
    return p ? [p] : [];
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 md:px-6">
      <h1 className="flex items-center gap-2 text-[26px] md:text-3xl">
        <Heart className="size-6" aria-hidden="true" />
        {t("titulo")}
      </h1>
      <p className="mt-1 text-sm text-muted-ink" data-testid="nota-deseos">
        {usuario ? t("conCuenta") : t("sinCuenta")}{" "}
        {usuario ? null : (
          <Link href={{ pathname: "/account", query: { volver: "/wishlist" } }} className="font-bold text-link hover:underline">
            {t("entrar")}
          </Link>
        )}
      </p>

      {productos.length === 0 ? (
        <div className="mt-6 rounded-card border bg-surface p-8 text-center" data-testid="deseos-vacia">
          <p className="font-display text-xl">{t("vacia")}</p>
          <p className="mt-1 text-muted-ink">{t("vaciaTexto")}</p>
          <Link href="/search" className="mt-4 inline-block font-bold text-link hover:underline">
            {t("verJuguetes")}
          </Link>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5" data-testid="lista-deseos">
          {productos.map((p) => (
            <li key={p.id} className="grid content-start gap-1">
              <TarjetaProducto p={p} />
              <button
                type="button"
                onClick={() => alternarDeseo(p.id)}
                className="justify-self-start text-[13px] font-bold text-link hover:underline"
              >
                {t("quitar")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

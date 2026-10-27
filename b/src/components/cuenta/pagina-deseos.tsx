"use client";

import { useTranslations } from "next-intl";
import { IconoCorazon } from "@/components/cuento/iconos";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { Cielo } from "@/components/cuento/cielo";
import { TarjetaCuento } from "@/components/cuento/tarjeta-cuento";
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
    <>
      <div className="papel-pintado">
        <div className="envoltura pt-12 pb-10 md:pt-16">
          <p className="cejilla text-mandarina-tinta mb-3 flex items-center gap-2">
            <IconoCorazon className="size-3.5" />
            {t("cejilla")}
          </p>
          <h1 className="titulo-cuento">{t("titulo")}</h1>
          <p className="text-ink/80 mt-4 text-[16px]" data-testid="nota-deseos">
            {usuario ? t("conCuenta") : t("sinCuenta")}{" "}
            {usuario ? null : (
              <Link
                href={{ pathname: "/account", query: { volver: "/wishlist" } }}
                className="text-link font-bold hover:underline"
              >
                {t("entrar")}
              </Link>
            )}
          </p>
        </div>
      </div>
      {/* La lista, en el estante del canon: azul noche, tres columnas y las mismas tarjetas que el catálogo. */}
      <section aria-labelledby="deseos-estante" className="noche relative overflow-hidden">
        <Cielo />
        <div className="envoltura seccion relative">
          <h2 id="deseos-estante" className="sr-only">
            {t("titulo")}
          </h2>
          {productos.length === 0 ? (
            <div
              className="bg-crema/[0.07] ring-crema/15 rounded-[18px] p-10 text-center ring-1"
              data-testid="deseos-vacia"
            >
              <p className="font-display text-crema text-2xl font-bold">{t("vacia")}</p>
              <p className="text-crema/80 mt-2">{t("vaciaTexto")}</p>
              <Link href="/search" className="placa mt-6">
                {t("verJuguetes")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <ul
              className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-[30px] lg:grid-cols-3"
              data-testid="lista-deseos"
            >
              {productos.map((p) => (
                <li key={p.id} className="grid content-start gap-2">
                  <TarjetaCuento p={p} />
                  <button
                    type="button"
                    onClick={() => alternarDeseo(p.id)}
                    className="font-display text-aqua justify-self-start text-[14px] font-semibold underline-offset-4 hover:underline"
                  >
                    {t("quitar")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

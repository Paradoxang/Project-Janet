"use client";

import { useTranslations } from "next-intl";
import { Cielo } from "@/components/cuento/cielo";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";

/**
 * Invitado o cuenta, en una ventana emergente al llegar al pago (Santiago, 26-10: «Ventana emergente»). Dos placas y
 * nada más: seguir como invitado cierra la ventana; entrar lleva a la cuenta y vuelve al pago. Cerrarla (Esc o fuera)
 * también es seguir como invitado. Con sesión iniciada no sale.
 */
export function EleccionCompra({
  abierta,
  alSeguirComoInvitado,
}: {
  abierta: boolean;
  alSeguirComoInvitado: () => void;
}) {
  const t = useTranslations("pago");
  return (
    <Dialog open={abierta} onOpenChange={(v) => (v ? null : alSeguirComoInvitado())}>
      <DialogContent
        showCloseButton={false}
        className="noche border-crema/15 bg-noche text-crema grid-cols-[minmax(0,1fr)] overflow-hidden rounded-[18px] p-0 sm:max-w-md"
        data-testid="ventana-compra"
      >
        {/* minmax(0,1fr): sin él, la placa larga (que no parte línea) ensancha la columna y la ventana se corta en el
            celular. */}
        <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-6 sm:p-8">
          <Cielo cantidad={26} semilla={13} />
          <div className="relative grid gap-3 text-center">
            <p className="cejilla text-calendula flex items-center justify-center gap-2">
              <span aria-hidden="true" className="chispa text-[10px]" />
              {t("ventanaCejilla")}
            </p>
            <DialogTitle className="font-display text-crema text-[30px] leading-tight font-bold">
              {t("ventanaTitulo")}
            </DialogTitle>
            <DialogDescription className="text-crema/80 text-[15px]">
              {t("ventanaTexto")}
            </DialogDescription>
          </div>
          <div className="relative grid gap-2">
            <button
              type="button"
              onClick={alSeguirComoInvitado}
              className="placa w-full whitespace-normal"
              data-testid="modo-invitado"
            >
              {t("invitadoCorto")} <span aria-hidden="true">→</span>
            </button>
            <p className="text-crema/75 mb-2 text-center text-[13px]">{t("invitadoTexto")}</p>
            <Link
              href={{ pathname: "/account", query: { volver: "/checkout" } }}
              className="placa placa-texto text-crema w-full whitespace-normal"
              data-testid="modo-cuenta"
            >
              <span aria-hidden="true">✦</span>
              {t("cuentaEntrar")}
            </Link>
            <p className="text-crema/75 text-center text-[13px]">{t("cuentaTexto")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

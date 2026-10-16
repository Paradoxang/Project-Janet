"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CircleCheck } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { Button } from "@/components/ui/button";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link } from "@/i18n/navigation";
import { aDolares, fechaLarga, precio } from "@/lib/formato";
import type { Idioma } from "@/lib/tipos";
import { Mascota } from "@/marca/marca";
import { usePedidos } from "@/stores/pedidos";

export function Confirmacion() {
  const t = useTranslations();
  const locale = useLocale() as Idioma;
  const hidratado = useHidratado();
  const id = useSearchParams().get("id");
  const pedidos = usePedidos((s) => s.pedidos);
  const { porId } = useCatalogo();
  if (!hidratado) return <div className="min-h-[60vh]" />;
  const pedido = pedidos.find((p) => p.id === id) ?? pedidos[0];
  if (!pedido) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-8 text-center">
        <Button asChild variant="cta" size="lg">
          <Link href="/">{t("pago.seguir")}</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6" data-testid="confirmacion">
      <div className="flex flex-col items-center gap-4 rounded-card bg-warm px-5 py-8 text-center">
        <Mascota className="h-40 w-32" />
        <h1 className="flex items-center gap-2 text-[26px] text-stock md:text-3xl">
          <CircleCheck className="size-7" aria-hidden="true" />
          {t("pago.confirmacionTitulo")}
        </h1>
        <p className="text-lg">
          <span className="solo-brinco">{t("pago.confirmacionBrinco")}</span>
          <span className="solo-neutra">{t("pago.confirmacionNeutra")}</span>
        </p>
        <p className="text-sm text-muted-ink">
          {t("pago.numero")}: <b className="text-ink" data-testid="numero-pedido">{pedido.id}</b>
        </p>
      </div>

      <div className="mt-5 grid gap-4 rounded-card border p-4 md:p-5">
        <p className="text-lg font-bold text-stock">{t("pago.llega", { fecha: fechaLarga(new Date(pedido.llega), locale) })}</p>
        <p className="text-sm">
          <b>{t("pago.enviadoA")}:</b> {pedido.nombre} · {pedido.direccion}
        </p>
        {pedido.regalo ? <p className="text-sm font-bold">🎁 {t("pago.regalo")}</p> : null}
        <ul className="grid gap-2 border-t pt-3 text-sm">
          {pedido.lineas.map((l) => (
            <li key={l.id} className="flex justify-between gap-3">
              <span>
                {porId.get(l.id)?.title[locale]} ×{l.qty}
              </span>
              <span className="font-bold">{precio(aDolares(l.precio * l.qty), locale)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between border-t pt-3 text-lg">
          <b>{t("carrito.total")}</b>
          <b>{precio(aDolares(pedido.total), locale)}</b>
        </p>
        <p className="text-sm text-muted-ink">{t("pago.pagadoCon", { metodo: pedido.metodoPago })}</p>
        <p className="text-sm text-muted-ink">{t("pago.recibo", { correo: pedido.correo })}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="cta" size="lg">
          <Link href="/">{t("pago.seguir")}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/account">{t("pago.verPedidos")}</Link>
        </Button>
      </div>
    </div>
  );
}

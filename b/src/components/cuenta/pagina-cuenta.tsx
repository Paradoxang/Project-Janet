"use client";

import { useLocale, useTranslations } from "next-intl";
import { RotateCcw, UserRound } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { TarjetaProducto } from "@/components/producto/tarjeta-producto";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Button } from "@/components/ui/button";
import { useHidratado } from "@/hooks/use-hidratado";
import { aDolares, fechaLarga, precio } from "@/lib/formato";
import type { Idioma } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { useCarrito } from "@/stores/carrito";
import { useCarritoUI } from "@/stores/carrito-ui";
import { useCuenta } from "@/stores/cuenta";
import { usePedidos } from "@/stores/pedidos";

export function PaginaCuenta() {
  const t = useTranslations("cuenta");
  const locale = useLocale() as Idioma;
  const hidratado = useHidratado();
  const { porId } = useCatalogo();
  const { nombre, deseos, entrar, salir, alternarDeseo } = useCuenta();
  const pedidos = usePedidos((s) => s.pedidos);
  const agregar = useCarrito((s) => s.agregar);
  const abrirPanel = useCarritoUI((s) => s.abrir);

  if (!hidratado) return <div className="min-h-[60vh]" />;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-5 md:px-6">
      <h1 className="text-[26px] md:text-3xl">{t("titulo")}</h1>
      <p className="mt-1 text-sm text-muted-ink">{t("nota")}</p>

      {nombre ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-card bg-warm p-4">
          <p className="flex items-center gap-2 font-display text-xl" data-testid="saludo">
            <UserRound className="size-6" aria-hidden="true" />
            {t("hola", { nombre })}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={salir}>
            {t("salir")}
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 rounded-card bg-white p-5 shadow-tarjeta md:max-w-md">
          <Button type="button" variant="cta" size="lg" onClick={() => entrar("Demo Customer")} data-testid="entrar-demo">
            {t("entrar")}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => entrar("Demo Customer")}>
            {t("registrarse")}
          </Button>
          <p className="text-[13px] text-muted-ink">{t("entrarTexto")}</p>
        </div>
      )}

      <section className="mt-8" aria-labelledby="mis-pedidos">
        <h2 id="mis-pedidos" className="text-xl">
          {t("pedidos")}
        </h2>
        {pedidos.length === 0 ? (
          <p className="mt-2 text-muted-ink">{t("sinPedidos")}</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {pedidos.map((pedido) => (
              <li key={pedido.id} className="overflow-hidden rounded-card bg-white shadow-tarjeta" data-testid="pedido">
                <div className="flex flex-wrap justify-between gap-2 border-b bg-surface px-4 py-2.5 text-[13px]">
                  <span>{t("pedidoDel", { fecha: fechaLarga(new Date(pedido.fecha), locale) })}</span>
                  <span className="font-bold">{precio(aDolares(pedido.total), locale)}</span>
                  <span className="text-muted-ink">{pedido.id}</span>
                </div>
                <ul className="grid gap-3 p-4">
                  {pedido.lineas.map((l) => {
                    const p = porId.get(l.id);
                    if (!p) return null;
                    return (
                      <li key={l.id} className="flex items-center gap-3">
                        <span className={cn("grid size-14 shrink-0 place-items-center rounded-md", FONDO_TINTE[p.tint])}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/productos/${p.illustration}.svg`} alt="" className="size-12" />
                        </span>
                        <span className="line-clamp-2 flex-1 text-sm">{p.title[locale]}</span>
                        <Button
                          type="button"
                          variant="cta"
                          size="sm"
                          data-testid="comprar-otra-vez"
                          onClick={() => {
                            agregar(l.id, l.qty);
                            abrirPanel(l.id);
                          }}
                        >
                          <RotateCcw aria-hidden="true" />
                          {t("comprarOtraVez")}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8" aria-labelledby="lista-deseos">
        <h2 id="lista-deseos" className="text-xl">
          {t("deseos")}
        </h2>
        {deseos.length === 0 ? (
          <p className="mt-2 text-muted-ink">{t("sinDeseos")}</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {deseos.map((id) => {
              const p = porId.get(id);
              if (!p) return null;
              return (
                <li key={id} className="grid gap-1">
                  <TarjetaProducto p={p} />
                  <button
                    type="button"
                    onClick={() => alternarDeseo(id)}
                    className="text-[13px] font-bold text-link hover:underline"
                  >
                    {t("quitar")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

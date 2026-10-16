"use client";

import { useLocale, useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { aDolares, fechaLarga, precio } from "@/lib/formato";
import type { Idioma } from "@/lib/tipos";
import { useAvisos, useCuenta, useDeseos, type Avisos } from "@/stores/cuenta";
import type { Pedido } from "@/stores/pedidos";

const CLAVES: (keyof Avisos)[] = ["pedidos", "stock", "ofertas"];

interface Correo {
  id: string;
  fecha: string;
  asunto: string;
  texto: string;
}

/** Qué correos quiere recibir y, como es una demo, los que le habríamos enviado. */
export function AvisosCorreo({ pedidos }: { pedidos: Pedido[] }) {
  const t = useTranslations("cuenta");
  const locale = useLocale() as Idioma;
  const { porId } = useCatalogo();
  const usuario = useCuenta((s) => s.usuario);
  const cuenta = useCuenta((s) => (s.usuario ? s.cuentas[s.usuario.correo] : undefined));
  const alternar = useCuenta((s) => s.alternarAviso);
  const avisos = useAvisos();
  const deseos = useDeseos();
  if (!usuario || !cuenta) return null;

  const hoy = new Date().toISOString();
  const correos: Correo[] = [
    {
      id: "bienvenida",
      fecha: cuenta.creada,
      asunto: t("correoBienvenida"),
      texto: t("correoBienvenidaTexto", { nombre: usuario.nombre }),
    },
  ];
  if (avisos.pedidos) {
    for (const p of pedidos) {
      correos.push({
        id: p.id,
        fecha: p.fecha,
        asunto: t("correoPedido", { id: p.id }),
        texto: t("correoPedidoTexto", { total: precio(aDolares(p.total), locale), fecha: fechaLarga(new Date(p.llega), locale) }),
      });
    }
  }
  if (avisos.stock) {
    for (const id of deseos) {
      const p = porId.get(id);
      if (p && p.stockOnline === 0) {
        correos.push({ id: `stock-${id}`, fecha: hoy, asunto: t("correoStock", { producto: p.title[locale] }), texto: t("correoStockTexto") });
      }
    }
  }
  if (avisos.ofertas) correos.push({ id: "ofertas", fecha: hoy, asunto: t("correoOfertas"), texto: t("correoOfertasTexto") });
  correos.sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid content-start gap-3 rounded-card bg-white p-5 shadow-tarjeta">
        <p className="text-sm text-muted-ink">{t("avisosTexto")}</p>
        <ul className="grid gap-3">
          {CLAVES.map((clave) => (
            <li key={clave}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  role="switch"
                  checked={avisos[clave]}
                  onChange={() => alternar(clave)}
                  className="mt-1 size-4 accent-[var(--m-ink)]"
                  data-testid={`aviso-${clave}`}
                />
                <span className="grid gap-0.5">
                  <span className="font-semibold">{t(`aviso.${clave}`)}</span>
                  <span className="text-[13px] text-muted-ink">{t(`aviso.${clave}Texto`)}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid content-start gap-3 rounded-card bg-white p-5 shadow-tarjeta">
        <h3 className="flex items-center justify-between gap-2 text-lg">
          {t("bandeja")}
          <span className="rounded-chip bg-surface px-2 py-0.5 text-xs font-bold text-muted-ink">{t("bandejaDemo")}</span>
        </h3>
        {correos.length === 0 ? (
          <p className="text-sm text-muted-ink">{t("bandejaVacia")}</p>
        ) : (
          <ul className="grid divide-y" data-testid="bandeja">
            {correos.map((c) => (
              <li key={c.id} className="flex gap-3 py-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted-ink" aria-hidden="true" />
                <span className="grid gap-0.5">
                  <span className="text-sm font-bold">{c.asunto}</span>
                  <span className="text-[13px] text-muted-ink">{c.texto}</span>
                  <span className="text-xs text-muted-ink">{fechaLarga(new Date(c.fecha), locale)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

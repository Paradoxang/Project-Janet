"use client";

import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboard, RotateCcw, UserRound } from "lucide-react";
import { AvisosCorreo } from "@/components/cuenta/avisos-correo";
import { DatosCuenta } from "@/components/cuenta/datos-cuenta";
import { FormularioAcceso } from "@/components/cuenta/formulario-acceso";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { FilaProductos } from "@/components/producto/fila-productos";
import { TarjetaProducto } from "@/components/producto/tarjeta-producto";
import { FONDO_TINTE } from "@/components/producto/imagen-producto";
import { Button } from "@/components/ui/button";
import { useHidratado } from "@/hooks/use-hidratado";
import { Link, useRouter } from "@/i18n/navigation";
import { srcProducto } from "@/lib/catalogo";
import { aDolares, fechaLarga, precio } from "@/lib/formato";
import { recomendar } from "@/lib/recomendar";
import type { Usuario } from "@/lib/sesion";
import type { Idioma } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { useCarrito } from "@/stores/carrito";
import { useCarritoUI } from "@/stores/carrito-ui";
import { useCuenta, useDeseos } from "@/stores/cuenta";
import { usePedidos } from "@/stores/pedidos";

const SECCIONES = [
  ["recomendados", "te-puede-gustar"],
  ["pedidos", "pedidos"],
  ["deseos", "favoritos"],
  ["datos", "datos"],
  ["avisos", "avisos"],
] as const;

/** Adónde ir al entrar: a `?volver=/ruta` si viene (solo rutas de esta web); la dueña, al panel. */
function destinoAlEntrar(usuario: Usuario): string | null {
  const volver = new URLSearchParams(window.location.search).get("volver");
  if (volver?.startsWith("/") && !volver.startsWith("//")) return volver;
  return usuario.rol === "admin" ? "/panel" : null;
}

export function PaginaCuenta() {
  const t = useTranslations("cuenta");
  const locale = useLocale() as Idioma;
  const router = useRouter();
  const hidratado = useHidratado();
  const { porId, productos } = useCatalogo();
  const usuario = useCuenta((s) => s.usuario);
  const salir = useCuenta((s) => s.salir);
  const alternarDeseo = useCuenta((s) => s.alternarDeseo);
  const deseos = useDeseos();
  const todos = usePedidos((s) => s.pedidos);
  const agregar = useCarrito((s) => s.agregar);
  const abrirPanel = useCarritoUI((s) => s.abrir);

  if (!hidratado) return <div className="min-h-[60vh]" />;

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md px-4 pt-5 md:px-6">
        <h1 className="mb-4 text-[26px] md:text-3xl">{t("titulo")}</h1>
        <FormularioAcceso
          alEntrar={(u) => {
            const destino = destinoAlEntrar(u);
            if (destino) router.push(destino);
          }}
        />
      </div>
    );
  }

  if (usuario.rol === "admin") {
    return (
      <div className="mx-auto max-w-md px-4 pt-5 md:px-6">
        <h1 className="text-[26px] md:text-3xl">{t("titulo")}</h1>
        <div className="mt-4 grid gap-3 rounded-card bg-white p-5 shadow-tarjeta" data-testid="cuenta-admin">
          <p className="font-display text-xl">
            {usuario.invitado ? t("adminInvitado", { nombre: usuario.nombre }) : t("admin")}
          </p>
          <p className="text-sm text-muted-ink">{t("adminTexto")}</p>
          <Button asChild variant="cta" size="lg">
            <Link href="/panel">
              <LayoutDashboard aria-hidden="true" />
              {t("irAlPanel")}
            </Link>
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={salir}>
            {t("salir")}
          </Button>
        </div>
      </div>
    );
  }

  const pedidos = todos.filter((p) => p.cuenta === usuario.correo);
  const comprados = pedidos.flatMap((p) => p.lineas.map((l) => l.id));
  const recomendados = recomendar(productos, [...deseos, ...comprados], 8);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-5 md:px-6">
      <h1 className="text-[26px] md:text-3xl">{t("titulo")}</h1>
      <p className="mt-1 text-sm text-muted-ink">{t("nota")}</p>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-card bg-warm p-4">
        <p className="flex items-center gap-2 font-display text-xl" data-testid="saludo">
          <UserRound className="size-6" aria-hidden="true" />
          {t("hola", { nombre: usuario.nombre })}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={salir} data-testid="salir">
          {t("salir")}
        </Button>
      </div>

      <nav aria-label={t("irA")} className="mt-4">
        <ul className="relative flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECCIONES.map(([clave, ancla]) => (
            <li key={clave} className="shrink-0">
              <a
                href={`#${ancla}`}
                className="inline-flex h-8 items-center rounded-chip border bg-white px-3 text-[13px] font-bold hover:bg-surface"
              >
                {t(`nav.${clave}`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {recomendados.length > 0 ? (
        <section id="te-puede-gustar" className="mt-8 scroll-mt-14" aria-labelledby="titulo-recomendados">
          <h2 id="titulo-recomendados" className="text-xl">
            {t("recomendados")}
          </h2>
          <p className="mt-1 mb-3 text-sm text-muted-ink">{t("recomendadosTexto")}</p>
          <FilaProductos productos={recomendados} />
        </section>
      ) : null}

      <section id="pedidos" className="mt-8 scroll-mt-14" aria-labelledby="mis-pedidos">
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
                          <img src={srcProducto(p)} alt="" className="size-12" />
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

      <section id="favoritos" className="mt-8 scroll-mt-14" aria-labelledby="lista-deseos">
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

      <section id="datos" className="mt-8 scroll-mt-14" aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" className="mb-3 text-xl">
          {t("datos")}
        </h2>
        <DatosCuenta />
      </section>

      <section id="avisos" className="mt-8 scroll-mt-14" aria-labelledby="titulo-avisos">
        <h2 id="titulo-avisos" className="mb-3 text-xl">
          {t("avisos")}
        </h2>
        <AvisosCorreo pedidos={pedidos} />
      </section>
    </div>
  );
}

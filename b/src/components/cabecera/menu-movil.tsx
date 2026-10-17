"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import type { Categoria, GrupoEdad, Ocasion } from "@/lib/tipos";
import { Logo } from "@/marca/marca";

export function MenuMovil({
  edades,
  categorias,
  ocasiones,
}: {
  edades: GrupoEdad[];
  categorias: Categoria[];
  ocasiones: Ocasion[];
}) {
  const t = useTranslations();
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const enlace = "block rounded-md px-3 py-2 text-[15px] hover:bg-surface";
  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("cabecera.menu")}
          className="grid size-10 place-items-center rounded-md text-ink hover:bg-surface"
        >
          <Menu className="size-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>
            <Logo className="h-8" />
          </SheetTitle>
        </SheetHeader>
        <nav className="grid gap-5 p-3 pb-8">
          <div>
            <p className="px-3 pb-1 text-[13px] font-bold text-muted-ink">{t("nav.edad")}</p>
            {edades.map((e) => (
              <Link key={e} href={{ pathname: "/search", query: { edad: e } }} onClick={cerrar} className={enlace}>
                {t(`edad.${e}`)}
              </Link>
            ))}
          </div>
          <div>
            <p className="px-3 pb-1 text-[13px] font-bold text-muted-ink">
              {t("nav.categorias")}
            </p>
            {categorias.map((c) => (
              <Link key={c} href={{ pathname: "/search", query: { categoria: c } }} onClick={cerrar} className={enlace}>
                {t(`categoria.${c}`)}
              </Link>
            ))}
          </div>
          <div>
            <p className="px-3 pb-1 text-[13px] font-bold text-muted-ink">
              {t("nav.ocasiones")}
            </p>
            {ocasiones.map((o) => (
              <Link key={o} href={{ pathname: "/search", query: { ocasion: o } }} onClick={cerrar} className={enlace}>
                {t(`ocasion.${o}`)}
              </Link>
            ))}
          </div>
          <div className="border-t pt-3">
            <Link href="/where-to-buy" onClick={cerrar} className={enlace}>
              {t("nav.dondeComprar")}
            </Link>
            <Link href="/faq" onClick={cerrar} className={enlace}>
              {t("nav.faq")}
            </Link>
            <Link href="/panel" onClick={cerrar} className={enlace}>
              {t("nav.panel")}
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

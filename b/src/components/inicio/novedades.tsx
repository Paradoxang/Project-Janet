"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { useCatalogo } from "@/components/proveedor-catalogo";
import { FilaCatalogo } from "@/components/producto/fila-productos";
import { esNuevo } from "@/lib/catalogo";

/** «Recién llegados»: los productos que agregó la dueña. Solo aparece si hay alguno. */
export function Novedades() {
  const t = useTranslations("inicio");
  const { productos } = useCatalogo();
  if (!productos.some((p) => esNuevo(p.id))) return null;
  return (
    <section aria-labelledby="novedades" data-testid="novedades">
      <div className="mb-4">
        <h2 id="novedades" className="flex items-center gap-2 text-[24px] leading-tight md:text-[30px]">
          <Sparkles className="size-6 text-trazo" aria-hidden="true" />
          {t("novedades")}
        </h2>
        <p className="mt-1 text-[15px] text-muted-ink">{t("novedadesTexto")}</p>
      </div>
      <FilaCatalogo criterio="novedades" />
    </section>
  );
}

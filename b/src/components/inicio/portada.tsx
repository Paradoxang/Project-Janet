import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Garabato } from "@/components/efectos/garabato";
import { Link } from "@/i18n/navigation";
import type { GrupoEdad, ProductoLigero } from "@/lib/tipos";
import { Mascota } from "@/marca/marca";
import { BannerVariante } from "./banner-variante";
import { BloquesEdad } from "./bloques-edad";

/**
 * Portada: un titular corto y, debajo, las cinco edades. Las mamás compran por edad, así que la primera pantalla
 * (también en el celular) ya deja elegir por dónde empezar.
 */
export function Portada({ catalogo, edades }: { catalogo: ProductoLigero[]; edades: GrupoEdad[] }) {
  const t = useTranslations("inicio");
  const g = (trozo: React.ReactNode) => <Garabato>{trozo}</Garabato>;
  return (
    <section aria-labelledby="portada" className="grid gap-5 md:gap-8">
      <BannerVariante />
      <div className="solo-variante-base flex items-end justify-between gap-4 md:gap-10">
        <div className="min-w-0">
          <h1 id="portada" className="text-[32px] leading-[1.04] md:text-[58px] md:leading-[1.02]">
            <span className="solo-brinco">{t.rich("heroBrincoRico", { g })}</span>
            <span className="solo-neutra">{t.rich("heroNeutroRico", { g })}</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-snug text-muted-ink md:mt-4 md:text-[18px]">
            {t("heroTexto")}
          </p>
        </div>
        <Mascota className="h-[96px] w-[84px] shrink-0 md:h-[148px] md:w-[116px]" />
      </div>

      <div id="por-edad" className="scroll-mt-14">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-[19px] leading-tight md:text-[22px]">{t("regalosPorEdad")}</h2>
          <Link
            href="/where-to-buy"
            className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold text-link hover:underline"
          >
            <MapPin aria-hidden="true" className="size-4" />
            {t("heroSecundario")}
          </Link>
        </div>
        <BloquesEdad catalogo={catalogo} edades={edades} />
      </div>
    </section>
  );
}

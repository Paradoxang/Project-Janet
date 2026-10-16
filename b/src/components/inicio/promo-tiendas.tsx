import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/** Banda oscura con el mapa-rompecabezas: cambia el ritmo de la página. */
export function PromoTiendas() {
  const t = useTranslations("inicio");
  return (
    <section
      data-revelar
      aria-labelledby="tiendas"
      className="relative grid items-center gap-4 overflow-hidden rounded-card bg-ink p-6 text-white md:grid-cols-[1.2fr_1fr] md:p-10"
    >
      <div>
        <h2 id="tiendas" className="text-[26px] leading-tight text-white md:text-4xl">
          {t("tiendasTitulo")}
        </h2>
        <p className="mt-2 max-w-md text-white/80">{t("tiendasTexto")}</p>
        <Button asChild size="lg" className="mt-5 bg-white text-ink hover:bg-white/90">
          <Link href="/where-to-buy">
            {t("tiendasBoton")} <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/productos/map-puzzle.svg"
        alt=""
        className="flotar w-full max-w-[300px] justify-self-center md:max-w-[360px]"
        style={{ "--giro": "-4deg" } as React.CSSProperties}
        loading="lazy"
      />
    </section>
  );
}

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** Banda azul noche con el mapa-rompecabezas: cambia el ritmo de la página y lleva al buscador de tiendas por ZIP. */
export function PromoTiendas() {
  const t = useTranslations("inicio");
  return (
    <section
      data-revelar
      aria-labelledby="tiendas"
      className="noche rounded-card relative grid items-center gap-4 overflow-hidden p-6 md:grid-cols-[1.2fr_1fr] md:p-10"
    >
      <div>
        <p className="cejilla text-aqua mb-2">{t("tiendasCejilla")}</p>
        <h2
          id="tiendas"
          className="font-magia text-crema text-[26px] leading-[1.15] font-bold md:text-[38px]"
        >
          {t("tiendasTitulo")}
        </h2>
        <p className="text-crema/80 mt-3 max-w-md">{t("tiendasTexto")}</p>
        <Link href="/where-to-buy" className="placa mt-6">
          {t("tiendasBoton")} <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
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

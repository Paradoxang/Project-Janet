import { useTranslations } from "next-intl";
import { Garabato } from "@/components/efectos/garabato";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Mascota } from "@/marca/marca";

/** Juguetes de la portada: posición, giro y desfase de la flotación. */
const PIEZAS = [
  { id: "magnetic-tiles", clase: "left-[24%] top-[6%] w-[44%] md:left-[26%] md:top-[2%] md:w-[46%]", giro: "-5deg", retraso: "0s" },
  { id: "rainbow-stacker", clase: "right-[0%] top-[4%] w-[30%] md:right-[-2%] md:top-[0%] md:w-[32%]", giro: "9deg", retraso: "0.9s" },
  { id: "teddy-bear", clase: "left-[2%] bottom-[2%] w-[30%] md:left-[-2%] md:w-[34%]", giro: "-7deg", retraso: "1.6s" },
  { id: "rocket-launcher", clase: "hidden md:block md:left-[32%] md:bottom-[-4%] md:w-[30%]", giro: "4deg", retraso: "0.4s" },
];

export function Portada() {
  const t = useTranslations("inicio");
  const g = (trozo: React.ReactNode) => <Garabato>{trozo}</Garabato>;
  return (
    <section className="textura-puntos relative overflow-hidden rounded-card bg-warm" aria-labelledby="portada">
      <div className="grid items-center gap-2 px-5 pt-7 md:grid-cols-[1.05fr_1fr] md:gap-6 md:px-12 md:py-14">
        <div className="relative z-10">
          <p className="inline-flex items-center rounded-chip bg-white/85 px-3 py-1 text-[11.5px] font-bold tracking-wide text-muted-ink uppercase shadow-sm">
            {t("heroEtiqueta")}
          </p>
          <h1 id="portada" className="mt-4 text-[34px] leading-[1.06] md:text-[56px]">
            <span className="solo-brinco">{t.rich("heroBrincoRico", { g })}</span>
            <span className="solo-neutra">{t.rich("heroNeutroRico", { g })}</span>
          </h1>
          <p className="mt-4 max-w-md text-[15.5px] text-muted-ink md:text-lg">{t("heroTexto")}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button asChild variant="cta" size="xl">
              <Link href="#por-edad">{t("heroBoton")}</Link>
            </Button>
            <Link
              href="/where-to-buy"
              className="text-[15px] font-bold underline decoration-trazo decoration-[3px] underline-offset-[5px] hover:decoration-ink"
            >
              {t("heroSecundario")}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-4 mb-4 h-[250px] w-full max-w-[400px] md:mt-0 md:mb-0 md:h-[400px] md:max-w-[480px]" aria-hidden="true">
          {PIEZAS.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={`/productos/${p.id}.svg`}
              alt=""
              className={`flotar absolute ${p.clase}`}
              style={{ "--giro": p.giro, "--retraso": p.retraso } as React.CSSProperties}
            />
          ))}
          <Mascota className="absolute right-[2%] bottom-[2%] h-[52%] w-[30%] md:right-[0%] md:bottom-[0%] md:h-[50%]" />
          <span className="absolute top-[2%] left-[0%] grid size-[78px] -rotate-12 place-items-center rounded-full bg-trazo p-2 text-center text-[10.5px] leading-tight font-extrabold text-ink shadow-lg ring-4 ring-white/80 md:top-[40%] md:size-[108px] md:text-[13px]">
            {t("pegatina")}
          </span>
        </div>
      </div>
    </section>
  );
}

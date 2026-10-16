import { useTranslations } from "next-intl";
import { ImageIcon } from "lucide-react";
import logoBrinco from "@marca/logo.svg";
import logoBrincoNegativo from "@marca/logo-negativo.svg";
import mascotaBrinco from "@marca/mascota.svg";
import simboloBrinco from "@marca/simbolo.svg";
import { cn } from "@/lib/utils";

/*
  Piezas que cambian con la marca. Las dos versiones van en el HTML y el CSS muestra solo la activa
  (clases .solo-brinco / .solo-neutra en globals.css), así se cambia al instante y sin parpadeo.
*/

export function NombreMarca() {
  const t = useTranslations("marca");
  return (
    <>
      <span className="solo-brinco">Brinco</span>
      <span className="solo-neutra">{t("nombreNeutro")}</span>
    </>
  );
}

export function Logo({ className, negativo = false }: { className?: string; negativo?: boolean }) {
  const t = useTranslations("marca");
  const logo = negativo ? logoBrincoNegativo : logoBrinco;
  return (
    <span className={cn("inline-flex h-8 items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt="Brinco"
        className="solo-brinco h-full w-auto"
      />
      <span
        className={cn(
          "solo-neutra inline-flex h-full items-center rounded-md border-2 border-dashed px-2.5 text-[11px] font-bold tracking-widest uppercase",
          negativo ? "border-white/50 text-white" : "border-muted-ink/40 text-muted-ink",
        )}
      >
        {t("tuLogo")}
      </span>
    </span>
  );
}

/** La mascota (Brinco) o su marcador en la versión neutra. */
export function Mascota({
  className,
  variante = "cuerpo",
}: {
  className?: string;
  variante?: "cuerpo" | "cara";
}) {
  const t = useTranslations("marca");
  const img = variante === "cara" ? simboloBrinco : mascotaBrinco;
  return (
    <span className={cn("relative inline-block", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src}
        width={img.width}
        height={img.height}
        alt=""
        aria-hidden="true"
        className="solo-brinco h-full w-full object-contain"
      />
      <span
        aria-hidden="true"
        className="solo-neutra absolute inset-1.5 flex flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed border-muted-ink/40 bg-white/85 text-center text-[11px] font-bold tracking-wide text-muted-ink uppercase"
      >
        <ImageIcon className="size-5" />
        {variante === "cara" ? null : t("mascota")}
      </span>
    </span>
  );
}

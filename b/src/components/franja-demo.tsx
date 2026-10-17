import { useTranslations } from "next-intl";
import { InterruptorMarca } from "@/marca/interruptor-marca";

/** Franja fija que avisa en todas las páginas de que es una maqueta con datos de ejemplo. */
export function FranjaDemo() {
  const t = useTranslations("demo");
  return (
    <aside
      aria-label={t("corto")}
      className="cabecera-tienda sticky top-0 z-50 flex items-center justify-center gap-x-2 bg-demo px-3 py-1 text-center text-[11.5px] text-white sm:gap-x-3"
      data-testid="franja-demo"
    >
      <span className="font-bold">{t("franja")}</span>
      <span aria-hidden="true" className="hidden text-white/40 sm:inline">
        |
      </span>
      <InterruptorMarca />
    </aside>
  );
}

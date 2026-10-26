import { useTranslations } from "next-intl";
import { InterruptorMarca } from "@/marca/interruptor-marca";

/**
 * Franja fija que avisa en todas las páginas de que es una maqueta con datos de ejemplo. En el rediseño ya no lleva el
 * interruptor de la variante colorida: la tienda sale siempre con las fotos (el antes y el después es la demo publicada).
 */
export function FranjaDemo() {
  const t = useTranslations("demo");
  return (
    <aside
      aria-label={t("corto")}
      className="cabecera-tienda border-crema/10 bg-demo font-display text-crema sticky top-0 z-50 flex items-center justify-center gap-x-2 border-b px-3 py-1 text-center text-[11px] tracking-[0.18em] uppercase sm:gap-x-3"
      data-testid="franja-demo"
    >
      <span className="font-semibold">{t("franja")}</span>
      <span aria-hidden="true" className="chispa hidden text-[8px] sm:inline-block" />
      <InterruptorMarca />
    </aside>
  );
}

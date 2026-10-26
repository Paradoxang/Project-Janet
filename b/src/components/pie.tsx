import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/marca/marca";
import { SelectorIdioma } from "./cabecera/selector-idioma";

// Créditos a los autores del código de terceros que usamos (pequeño y discreto, al final del pie).
const CREDITOS = {
  holo: "https://reactbits.dev",
  shadcn: "https://ui.shadcn.com",
  lucide: "https://lucide.dev",
};

export function Pie() {
  const t = useTranslations("pie");
  const enlace = "text-sm text-crema/85 hover:text-calendula hover:underline";
  const credito = (clave: keyof typeof CREDITOS, texto: React.ReactNode) => (
    <a
      href={CREDITOS[clave]}
      className="underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white"
    >
      {texto}
    </a>
  );
  return (
    <footer className="noche mt-16">
      <a
        href="#arriba"
        className="bg-crema/10 font-display hover:bg-crema/15 block py-3 text-center text-sm font-semibold"
      >
        {t("arriba")}
      </a>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div className="grid content-start gap-3">
          {/* El logo del pie también lleva al inicio, como en Amazon (review de usuario, 16-10). */}
          <Link href="/" className="justify-self-start rounded-md">
            <Logo negativo className="h-9" />
            <span className="sr-only">{t("irAlInicio")}</span>
          </Link>
          <p className="font-magia text-crema max-w-xs text-[19px] leading-snug font-bold">
            {t("cierre")}
          </p>
          <p className="max-w-xs text-sm text-white/70">{t("derechos")}</p>
          <SelectorIdioma pie />
          {/* País y moneda, solo de muestra (propuesta P5 de la review de usuario; Santiago: «dejalo como una propuesta
              visual de que se puede hacer»). No cambian nada: la tienda vende solo en EE. UU. y en dólares. */}
          <div className="grid gap-1.5" data-testid="pie-region">
            <div className="flex flex-wrap gap-2">
              <label className="grid gap-1 text-xs text-white/70">
                {t("pais")}
                <select
                  disabled
                  className="h-9 rounded-md border border-white/30 bg-transparent px-2 text-sm text-white/80"
                >
                  <option>{t("paisEEUU")}</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs text-white/70">
                {t("moneda")}
                <select
                  disabled
                  className="h-9 rounded-md border border-white/30 bg-transparent px-2 text-sm text-white/80"
                >
                  <option>USD ($)</option>
                </select>
              </label>
            </div>
            <p className="max-w-xs text-xs text-white/70">{t("muestraRegion")}</p>
          </div>
        </div>
        <nav className="grid content-start gap-2" aria-label={t("productos")}>
          <Link href="/search" className={enlace}>
            {t("productos")}
          </Link>
          <Link href="/where-to-buy" className={enlace}>
            {t("dondeComprar")}
          </Link>
          <Link href="/faq" className={enlace}>
            {t("faq")}
          </Link>
        </nav>
        <nav className="grid content-start gap-2" aria-label={t("faq")}>
          <Link href="/faq#returns" className={enlace}>
            {t("devoluciones")}
          </Link>
          <Link href="/faq#shipping" className={enlace}>
            {t("envios")}
          </Link>
          <Link href="/faq#privacy" className={enlace}>
            {t("privacidad")}
          </Link>
          <Link href="/panel" className={enlace}>
            {t("panel")}
          </Link>
        </nav>
        {/* «Conócenos», como el pie de Amazon. Santiago, en la review del 16-10: «lo puedo meter en la demo». Las páginas
            no existen todavía: se ven como lo que son, sin enlace y con «próximamente». */}
        <div className="grid content-start gap-2" data-testid="pie-conocenos">
          <p className="text-sm font-bold text-white">{t("conocenos")}</p>
          <ul className="grid gap-2 text-sm text-white/70">
            {(["sobreNosotros", "trabaja", "blog"] as const).map((k) => (
              <li key={k}>
                {t(k)} <span className="text-xs">· {t("proximamente")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p
          className="mx-auto max-w-7xl px-4 py-4 text-xs leading-relaxed text-white/60 md:px-6"
          data-testid="creditos"
        >
          {t.rich("creditos", {
            holo: (texto) => credito("holo", texto),
            shadcn: (texto) => credito("shadcn", texto),
            lucide: (texto) => credito("lucide", texto),
          })}
        </p>
      </div>
    </footer>
  );
}

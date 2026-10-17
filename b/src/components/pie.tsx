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
  const enlace = "text-sm text-white/85 hover:text-white hover:underline";
  const credito = (clave: keyof typeof CREDITOS, texto: React.ReactNode) => (
    <a
      href={CREDITOS[clave]}
      className="underline decoration-white/30 underline-offset-2 hover:text-white hover:decoration-white"
    >
      {texto}
    </a>
  );
  return (
    <footer className="mt-12 bg-ink text-white">
      <a href="#arriba" className="block bg-white/10 py-3 text-center text-sm font-bold hover:bg-white/15">
        {t("arriba")}
      </a>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div className="grid content-start gap-3">
          {/* El logo del pie también lleva al inicio, como en Amazon (review de usuario, 16-10). */}
          <Link href="/" className="justify-self-start rounded-md">
            <Logo negativo className="h-9" />
            <span className="sr-only">{t("irAlInicio")}</span>
          </Link>
          <p className="max-w-xs font-display text-lg leading-snug text-white">{t("cierre")}</p>
          <p className="max-w-xs text-sm text-white/70">{t("derechos")}</p>
          <SelectorIdioma pie />
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
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs leading-relaxed text-white/60 md:px-6" data-testid="creditos">
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

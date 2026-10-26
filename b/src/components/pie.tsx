import { useTranslations } from "next-intl";
import { Boletin } from "@/components/cuento/boletin";
import { Link } from "@/i18n/navigation";
import { RUTA_SALUDABLE } from "@/lib/secciones";
import { Logo } from "@/marca/marca";
import { SelectorIdioma } from "./cabecera/selector-idioma";

// Créditos a los autores del código de terceros que usamos (pequeño y discreto, al final del pie).
const CREDITOS = {
  holo: "https://reactbits.dev",
  shadcn: "https://ui.shadcn.com",
  lucide: "https://lucide.dev",
};

/**
 * El pie del canon (rediseño del 26-10): azul noche, el boletín a dos columnas arriba y debajo la rejilla de cinco
 * columnas de enlaces. Debajo de todo, los créditos.
 */
export function Pie({ juguetes }: { juguetes: number }) {
  const t = useTranslations("pie");
  const tn = useTranslations("nav");
  const ts = useTranslations("saludable");
  const enlace =
    "text-[15px] text-crema/85 underline-offset-4 hover:text-calendula hover:underline";
  const titulo = "cejilla mb-4 text-calendula";
  const credito = (clave: keyof typeof CREDITOS, texto: React.ReactNode) => (
    <a
      href={CREDITOS[clave]}
      className="decoration-crema/30 hover:text-crema hover:decoration-crema underline underline-offset-2"
    >
      {texto}
    </a>
  );
  return (
    <footer className="noche mt-0">
      <div className="envoltura seccion">
        <Boletin juguetes={juguetes} />

        <div className="grid gap-10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="grid content-start gap-4">
            {/* El logo del pie también lleva al inicio, como en Amazon (review de usuario, 16-10). */}
            <Link href="/" className="justify-self-start rounded-md">
              <Logo negativo className="h-9" />
              <span className="sr-only">{t("irAlInicio")}</span>
            </Link>
            <p className="text-crema/75 max-w-xs text-[14px]">{t("derechos")}</p>
            <SelectorIdioma pie />
            {/* País y moneda, solo de muestra (propuesta P5 de la review de usuario; Santiago: «dejalo como una
                propuesta visual de que se puede hacer»). No cambian nada: la tienda vende solo en EE. UU. y en dólares. */}
            <div className="grid gap-1.5" data-testid="pie-region">
              <div className="flex flex-wrap gap-2">
                <label className="text-crema/75 grid gap-1 text-xs">
                  {t("pais")}
                  <select
                    disabled
                    className="border-crema/30 text-crema/80 h-9 rounded-md border bg-transparent px-2 text-sm"
                  >
                    <option>{t("paisEEUU")}</option>
                  </select>
                </label>
                <label className="text-crema/75 grid gap-1 text-xs">
                  {t("moneda")}
                  <select
                    disabled
                    className="border-crema/30 text-crema/80 h-9 rounded-md border bg-transparent px-2 text-sm"
                  >
                    <option>USD ($)</option>
                  </select>
                </label>
              </div>
              <p className="text-crema/75 max-w-xs text-xs">{t("muestraRegion")}</p>
            </div>
          </div>

          <nav aria-label={tn("juguetes")}>
            <p className={titulo}>{tn("juguetes")}</p>
            <ul className="grid gap-2.5">
              <li>
                <Link href="/search" className={enlace}>
                  {tn("todosJuguetes")}
                </Link>
              </li>
              <li>
                <Link href={{ pathname: "/search", query: { max: "25" } }} className={enlace}>
                  {t("menos25")}
                </Link>
              </li>
              <li>
                <Link
                  href={{ pathname: "/search", query: { ocasion: "birthday" } }}
                  className={enlace}
                >
                  {tn("regaloTitulo")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={tn("saludable")}>
            <p className={titulo}>{tn("saludable")}</p>
            <ul className="grid gap-2.5">
              <li>
                <Link href={RUTA_SALUDABLE} className={enlace}>
                  {tn("todoSaludable")}
                </Link>
              </li>
              <li>
                <Link href={`${RUTA_SALUDABLE}#ninos`} className={enlace}>
                  {ts("publico.ninos")}
                </Link>
              </li>
              <li>
                <Link href={`${RUTA_SALUDABLE}#adultos`} className={enlace}>
                  {ts("publico.adultos")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t("ayuda")}>
            <p className={titulo}>{t("ayuda")}</p>
            <ul className="grid gap-2.5">
              <li>
                <Link href="/faq" className={enlace}>
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link href="/faq#shipping" className={enlace}>
                  {t("envios")}
                </Link>
              </li>
              <li>
                <Link href="/faq#returns" className={enlace}>
                  {t("devoluciones")}
                </Link>
              </li>
              <li>
                <Link href="/faq#privacy" className={enlace}>
                  {t("privacidad")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* «Conócenos», como el pie de Amazon. Santiago, en la review del 16-10: «lo puedo meter en la demo». Las
              páginas no existen todavía: se ven como lo que son, sin enlace y con «próximamente». */}
          <div data-testid="pie-conocenos">
            <p className={titulo}>{t("conocenos")}</p>
            <ul className="text-crema/85 grid gap-2.5 text-[15px]">
              <li>
                <Link href="/where-to-buy" className={enlace}>
                  {t("dondeComprar")}
                </Link>
              </li>
              <li>
                <Link href="/panel" className={enlace}>
                  {t("panel")}
                </Link>
              </li>
              {(["sobreNosotros", "trabaja", "blog"] as const).map((k) => (
                <li key={k} className="text-crema/75">
                  {t(k)} <span className="text-xs">· {t("proximamente")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-crema/15 border-t">
        <div className="envoltura flex flex-wrap items-center justify-between gap-3 py-5">
          <p className="text-crema/75 text-xs leading-relaxed" data-testid="creditos">
            {t.rich("creditos", {
              holo: (texto) => credito("holo", texto),
              shadcn: (texto) => credito("shadcn", texto),
              lucide: (texto) => credito("lucide", texto),
            })}
          </p>
          <a href="#arriba" className="cejilla text-crema/85 hover:text-calendula">
            ↑ {t("arriba")}
          </a>
        </div>
      </div>
    </footer>
  );
}

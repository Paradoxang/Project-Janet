import { expect, test } from "./fixtures";

// Las propuestas de la review de usuario que aprobó Santiago el 16-10 (P1, P3, P4 y P5).

test("P1: en la portada la cabecera no repite las fichas de edad; en el resto de páginas, sí", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.getByTestId("ficha-edad-cabecera")).toHaveCount(0);
  await expect(page.getByTestId("cabecera").getByRole("link", { name: "All toys" })).toBeVisible();
  await page.goto("/en/search/");
  await expect(page.getByTestId("ficha-edad-cabecera")).toHaveCount(5);
});

test("P3: la variante colorida se elige con ?variante= o con su interruptor, y marca sus fotos como hechas con IA", async ({
  page,
}) => {
  await page.goto("/en/?variante=color");
  await expect(page.locator("html")).toHaveAttribute("data-variante", "color");
  const banner = page.getByTestId("banner-variante");
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Illustrative image (AI)");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Toys to laugh, build and discover");
  await expect(page.getByText("AI image", { exact: true })).toHaveCount(5);
  // Se recuerda al cambiar de página
  await page.goto("/en/search/");
  await expect(page.locator("html")).toHaveAttribute("data-variante", "color");
  // El interruptor vuelve a la tienda blanca de siempre
  await page.goto("/en/");
  const interruptor = page.getByTestId("interruptor-variante");
  await expect(interruptor).toHaveAttribute("aria-checked", "true");
  await interruptor.click();
  await expect(page.locator("html")).toHaveAttribute("data-variante", "base");
  await expect(banner).toBeHidden();
  await expect(interruptor).toHaveAttribute("aria-checked", "false");
});

test("P3: sin elegir nada sale la tienda blanca de siempre", async ({ page }) => {
  await page.goto("/es/");
  await expect(page.locator("html")).toHaveAttribute("data-variante", "base");
  await expect(page.getByTestId("banner-variante")).toBeHidden();
  await expect(page.getByTestId("interruptor-variante")).toHaveAttribute("aria-checked", "false");
});

test("P4: cada categoría lleva su promoción de la semana, de ejemplo y marcada DEMO", async ({ page }) => {
  await page.goto("/en/");
  const promos = page.getByTestId("promo-semana");
  await expect(promos).toHaveCount(8);
  await expect(promos.first()).toContainText("Promotion of the week");
  await expect(promos.first()).toContainText("DEMO");
  await page.goto("/es/search/?categoria=building");
  const banner = page.getByTestId("promo-categoria");
  await expect(banner).toContainText("Semana de construir");
  await expect(banner).toContainText("DEMO");
});

test("P5: país y moneda en el pie, solo de muestra (no se pueden cambiar)", async ({ page }) => {
  await page.goto("/en/faq/");
  const region = page.getByTestId("pie-region");
  await expect(region.getByLabel("Country or region")).toBeDisabled();
  await expect(region.getByLabel("Currency")).toBeDisabled();
  await expect(region).toContainText("Preview only");
});

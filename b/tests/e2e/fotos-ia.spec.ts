import { expect, test } from "./fixtures";

// Las fotos de producto hechas con IA (Santiago, 17-10): la variante colorida las enseña, marcadas «Illustrative image
// (AI)»; la tienda blanca sigue con las ilustraciones. Un juguete sin foto (el puzle del mapa) sigue con su ilustración.

test("fotos con IA: la variante colorida enseña la foto marcada y la tienda blanca, la ilustración", async ({ page }) => {
  await page.goto("/en/search/?variante=color");
  const tarjeta = page.getByTestId("tarjeta-producto").filter({ hasText: "Magnetic Building Tiles" });
  const foto = tarjeta.getByTestId("foto-ia-producto");
  await expect(foto).toBeVisible();
  await expect(foto.locator("img")).toHaveAttribute("src", "/productos-ia/magnetic-tiles.webp");
  await expect(foto).toContainText("Illustrative image (AI)");
  await expect(tarjeta.locator('img[src="/productos/magnetic-tiles.svg"]')).toBeHidden();

  await page.goto("/en/search/?variante=base");
  await expect(foto).toBeHidden();
  await expect(tarjeta.locator('img[src="/productos/magnetic-tiles.svg"]')).toBeVisible();
  await expect(tarjeta.getByText("Illustrative image", { exact: true })).toBeVisible();
});

test("fotos con IA: un juguete sin foto sigue con su ilustración en la variante colorida", async ({ page }) => {
  await page.goto("/en/search/?variante=color");
  const tarjeta = page.getByTestId("tarjeta-producto").filter({ hasText: "USA Map Floor Puzzle" });
  await expect(tarjeta.getByTestId("foto-ia-producto")).toHaveCount(0);
  await expect(tarjeta.locator('img[src="/productos/map-puzzle.svg"]')).toBeVisible();
});

test("fotos con IA: en la ficha, las miniaturas y la vista de medidas también son la foto en la variante colorida", async ({
  page,
}) => {
  await page.goto("/en/p/magnetic-tiles/?variante=color");
  const galeria = page.getByTestId("galeria");
  // 3 miniaturas y la vista de medidas del carrusel
  await expect(galeria.getByTestId("foto-ia-suelta")).toHaveCount(4);
  await expect(galeria.getByRole("button", { name: "Show image 1" }).getByTestId("foto-ia-suelta")).toBeVisible();
  await expect(galeria.locator('img[src="/productos/magnetic-tiles.svg"]:visible')).toHaveCount(0);

  await page.goto("/en/p/magnetic-tiles/?variante=base");
  await expect(galeria.getByRole("button", { name: "Show image 1" }).getByTestId("foto-ia-suelta")).toBeHidden();
  await expect(galeria.getByRole("button", { name: "Show image 1" }).locator('img[src="/productos/magnetic-tiles.svg"]')).toBeVisible();
});

test("fotos con IA: «Shop by occasion» también enseña la foto en la variante colorida", async ({ page }) => {
  await page.goto("/en/?variante=color");
  const ocasion = page.getByRole("link", { name: /Birthday/ }).filter({ has: page.getByTestId("foto-ia-producto") }).first();
  await ocasion.scrollIntoViewIfNeeded();
  await expect(ocasion.getByTestId("foto-ia-producto")).toBeVisible();
  await expect(ocasion.locator('img[src="/productos-ia/rc-car.webp"]')).toBeVisible();
});

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

test("fotos con IA: en la variante colorida, los 40 juguetes del buscador enseñan su foto y ninguno su ilustración", async ({
  page,
}) => {
  await page.goto("/en/search/?variante=color");
  const tarjetas = page.getByTestId("tarjeta-producto");
  await expect(tarjetas).toHaveCount(40);
  await expect(tarjetas.getByTestId("foto-ia-producto")).toHaveCount(40);
  await expect(tarjetas.locator('img[src^="/productos/"]:visible')).toHaveCount(0);

  // La tienda blanca enseña solo los 20 dibujados (Santiago, 17-10): los del inventario nuevo no salen.
  await page.goto("/en/search/?variante=base");
  await expect(page.getByTestId("cuenta-resultados")).toHaveText("20 results");
  await expect(tarjetas).toHaveCount(20);
  await expect(tarjetas.locator('img[src^="/productos/"]:visible')).toHaveCount(20);
  await expect(tarjetas.filter({ hasText: "Marble Run" })).toHaveCount(0);
});

test("tienda blanca: el interruptor cambia el buscador al momento, de 20 a 40 y de vuelta", async ({ page }) => {
  // Buscar «marble» en la tienda blanca no trae el circuito de canicas (solo tiene foto): el buscador tolera errores y
  // trae otros parecidos, todos dibujados.
  await page.goto("/en/search/?q=marble");
  await expect(page.getByTestId("cuenta-resultados")).toBeVisible();
  await expect(page.getByTestId("tarjeta-producto").filter({ hasText: "Marble Run" })).toHaveCount(0);
  await page.goto("/en/search/");
  await expect(page.getByTestId("tarjeta-producto")).toHaveCount(20);
  await page.getByTestId("interruptor-variante").click();
  await expect(page.getByTestId("tarjeta-producto")).toHaveCount(40);
  await expect(page.getByTestId("cuenta-resultados")).toHaveText("40 results");
  await page.getByTestId("interruptor-variante").click();
  await expect(page.getByTestId("tarjeta-producto")).toHaveCount(20);
});

test("tienda blanca: en la portada, las cuentas y la fila de «menos de $25» siguen a la variante", async ({ page }) => {
  await page.goto("/en/?variante=base");
  // 5 a 7 años: 5 dibujados en la tienda blanca, 8 con los nuevos
  await expect(page.getByTestId("edad-5-7")).toContainText("5 toys", { useInnerText: true });
  const nuevoBarato = page.getByTestId("tarjeta-producto").filter({ hasText: "Plush Puppy" });
  await expect(nuevoBarato.locator("visible=true")).toHaveCount(0);

  await page.goto("/en/?variante=color");
  await expect(page.getByTestId("edad-5-7")).toContainText("8 toys", { useInnerText: true });
  await nuevoBarato.first().scrollIntoViewIfNeeded();
  await expect(nuevoBarato.first()).toBeVisible();
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

test("fotos con IA: en el carrito, un juguete dibujado sale con su foto en la variante colorida y con su dibujo en la blanca", async ({
  page,
}) => {
  // Santiago, 17-10: «En el carrito cuando añado los productos que estan dibujados no se les pone su imagen nueva con IA».
  await page.goto("/en/p/magnetic-tiles/?variante=color");
  await page.getByTestId("caja-compra").getByTestId("agregar").click();
  const panel = page.getByTestId("panel-carrito");
  await expect(panel.getByTestId("foto-ia-suelta").first()).toBeVisible();
  await expect(panel.locator('img[src="/productos/magnetic-tiles.svg"]:visible')).toHaveCount(0);

  await page.goto("/en/cart/");
  const linea = page.getByTestId("linea-carrito").filter({ hasText: "Magnetic Building Tiles" });
  await expect(linea.locator('img[src="/productos-ia/magnetic-tiles.webp"]')).toBeVisible();
  await expect(linea.locator('img[src="/productos/magnetic-tiles.svg"]')).toBeHidden();

  await page.goto("/en/cart/?variante=base");
  await expect(linea.locator('img[src="/productos/magnetic-tiles.svg"]')).toBeVisible();
  await expect(linea.locator('img[src="/productos-ia/magnetic-tiles.webp"]')).toBeHidden();
});

test("fotos con IA: «Shop by occasion» también enseña la foto en la variante colorida", async ({ page }) => {
  await page.goto("/en/?variante=color");
  const ocasion = page.getByRole("link", { name: /Birthday/ }).filter({ has: page.getByTestId("foto-ia-producto") }).first();
  await ocasion.scrollIntoViewIfNeeded();
  await expect(ocasion.getByTestId("foto-ia-producto")).toBeVisible();
  await expect(ocasion.locator('img[src="/productos-ia/rc-car.webp"]')).toBeVisible();
});

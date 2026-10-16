import { expect, test } from "@playwright/test";

test.describe("marca: neutra o Brinco", () => {
  test("por defecto sale sin marca, con marcadores, y el interruptor la cambia", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByTestId("franja-demo")).toContainText("Demo mockup · sample data");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-marca", "neutra");
    await expect(page.getByText("Your logo").first()).toBeVisible();
    await expect(page.getByAltText("Brinco").first()).toBeHidden();

    await page.getByTestId("interruptor-marca").click();
    await expect(html).toHaveAttribute("data-marca", "brinco");
    await expect(page.getByAltText("Brinco").first()).toBeVisible();
    await expect(page.getByText("Your logo").first()).toBeHidden();

    // Se recuerda al recargar
    await page.reload();
    await expect(html).toHaveAttribute("data-marca", "brinco");
  });

  test("?marca=… elige la marca desde el enlace", async ({ page }) => {
    await page.goto("/es/?marca=brinco");
    await expect(page.locator("html")).toHaveAttribute("data-marca", "brinco");
    await page.goto("/es/?marca=neutra");
    await expect(page.locator("html")).toHaveAttribute("data-marca", "neutra");
    await expect(page.getByText("Tu logo").first()).toBeVisible();
  });
});

test("la mamá de Seattle busca, ve que San Diego sí lo tiene y lo agrega", async ({ page }) => {
  await page.goto("/en/");
  const buscador = page.getByTestId("buscador");
  await buscador.click();
  await buscador.pressSequentially("magnetik");
  await expect(page.getByTestId("sugerencia").first()).toContainText("Magnetic");
  await buscador.press("Enter");

  await expect(page).toHaveURL(/\/en\/search\/?\?q=magnetik/);
  await expect(page.getByTestId("tarjeta-producto").first()).toContainText("Magnetic");
  await page.getByTestId("tarjeta-producto").first().getByRole("link").first().click();

  await expect(page.getByTestId("titulo-producto")).toContainText("Magnetic");
  await expect(page.getByTestId("tienda-seattle")).toContainText("Out of stock");
  await expect(page.getByTestId("tienda-con-stock")).toContainText("San Diego");
  await expect(page.getByTestId("tienda-con-stock")).toContainText("4 in stock");
  await expect(page.getByTestId("entrega")).toContainText("Seattle 98101");

  await page.getByTestId("caja-compra").getByTestId("agregar").click();
  await expect(page.getByTestId("panel-carrito")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("panel-carrito")).toBeHidden();
  await expect(page.getByTestId("contador-carrito")).toHaveText("1");

  // Cambia a español sin salir de la página y el carrito se conserva
  await page.getByTestId("selector-idioma").click();
  await expect(page).toHaveURL(/\/es\/p\/magnetic-tiles\/?/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByTestId("tienda-seattle")).toContainText("Agotado");
  await expect(page.getByTestId("contador-carrito")).toHaveText("1");
});

test("en español entiende «regalo niño 5 años»", async ({ page }) => {
  await page.goto("/es/search/?q=regalo%20ni%C3%B1o%205%20a%C3%B1os");
  await expect(page.getByTestId("titulo-busqueda")).toContainText("regalo niño 5 años");
  const tarjetas = page.getByTestId("tarjeta-producto");
  await expect(tarjetas.first()).toBeVisible();
  expect(await tarjetas.count()).toBeGreaterThan(2);
  await expect(page.getByTestId("resultados")).toContainText("magnéticos");
});

test("las fichas por edad filtran el catálogo", async ({ page }) => {
  await page.goto("/en/");
  await page.getByTestId("edad-5-7").click();
  await expect(page.getByTestId("titulo-busqueda")).toHaveText("5–7 years");
  await expect(page.getByTestId("cuenta-resultados")).toHaveText("5 results");
});

test("en el celular nada se sale de la pantalla", async ({ page }) => {
  for (const ruta of ["/en/", "/es/search/?edad=5-7", "/en/p/magnetic-tiles/", "/en/cart/", "/en/where-to-buy/", "/es/panel/"]) {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(desborde, ruta).toBeLessThanOrEqual(0);
  }
});

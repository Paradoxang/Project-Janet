import { entrarComoDuena, expect, test } from "./fixtures";

test("lo que pasa en la tienda aparece en vivo en el panel de la dueña", async ({ page }) => {
  // Una compradora: busca, mira un juguete, lo agrega y lo compra
  await page.goto("/es/");
  const buscador = page.getByTestId("buscador");
  await buscador.click();
  await buscador.pressSequentially("dinosaurio");
  await buscador.press("Enter");
  await expect(page).toHaveURL(/\/es\/search\/?\?q=dinosaurio/);

  await page.goto("/es/p/magnetic-tiles/");
  await page.getByTestId("caja-compra").getByTestId("comprar-ahora").click();
  await expect(page).toHaveURL(/\/es\/checkout\/?$/);
  await page.getByTestId("rellenar").click();
  await page.getByTestId("hacer-pedido").click();
  await expect(page).toHaveURL(/\/es\/order\/?\?id=DEMO-\d{6}/);

  // La dueña entra y lo ve
  await entrarComoDuena(page);
  const enVivo = page.getByTestId("en-vivo");
  await expect(enVivo).toContainText("Compras1");
  const eventos = page.getByTestId("ultimos-eventos");
  await expect(eventos).toContainText("Compró por $");
  await expect(eventos).toContainText("Agregó «Bloques magnéticos");
  await expect(eventos).toContainText("Buscó «dinosaurio»");

  await page.getByTestId("borrar-actividad").click();
  await expect(enVivo).toContainText("Todavía no hay actividad");
});

test("el panel explica clics, conversión, búsquedas sin resultados e inventario", async ({ page }) => {
  await entrarComoDuena(page);
  await expect(page.getByTestId("kpi")).toHaveCount(7);
  await expect(page.getByTestId("kpi").filter({ hasText: "Conversión" })).toContainText("De cada 100 visitas");
  await expect(page.getByTestId("juguete-estrella")).toContainText("magnéticos");
  // El juguete que se mira mucho y se vende poco
  await expect(page.getByText("Mucho interés y pocas ventas")).toContainText("Telescopio");
  await expect(page.getByTestId("tabla-clics").locator("tbody tr")).toHaveCount(20);
  await expect(page.getByTestId("busquedas")).toContainText("Sin resultados");
  await expect(page.getByTestId("origen")).toContainText("Instagram");
  await expect(page.getByTestId("resumen-stock")).toContainText("unidades en total");

  // El índice lleva a cada sección
  await page.getByRole("navigation", { name: "Ir a" }).getByRole("link", { name: "Inventario" }).click();
  await expect(page).toHaveURL(/#inventario$/);
});

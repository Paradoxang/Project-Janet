import { entrarComoDuena, expect, test } from "./fixtures";

test("dónde comprar: desde el producto, Seattle sin stock y San Diego destacada", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/");
  await page.getByRole("link", { name: /See stores on the map/ }).click();
  await expect(page).toHaveURL(/\/en\/where-to-buy\/?\?producto=magnetic-tiles/);
  await expect(page.getByTestId("filtro-producto")).toContainText("Magnetic");
  await expect(page.getByTestId("ficha-seattle")).toContainText("Out of stock");
  await expect(page.getByTestId("ficha-san-diego")).toContainText("Nearest store with stock");
  await expect(page.getByTestId("ficha-san-diego")).toContainText("4 in stock");
  // El mapa carga con su atribución visible
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".leaflet-control-attribution")).toContainText("OpenStreetMap");
  await expect(page.locator(".pin-tienda")).toHaveCount(6);
});

test("dónde comprar: buscar por ZIP reordena por distancia", async ({ page }) => {
  await page.goto("/es/where-to-buy/");
  await page.getByTestId("zip-tiendas").fill("33131");
  // Esperar a que el campo muestre lo escrito antes de buscar (como haría una persona).
  await expect(page.getByTestId("zip-tiendas")).toHaveValue("33131");
  await page.getByTestId("buscar-tiendas").click();
  const primera = page.getByTestId("lista-tiendas").locator("li").first();
  await expect(primera).toContainText("Miami");
});

test("panel de la dueña: números con su explicación y avisos", async ({ page }) => {
  await entrarComoDuena(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("¿Cómo va mi negocio?");
  await expect(page.getByTestId("kpi")).toHaveCount(3);
  await expect(page.getByTestId("avisos")).toContainText("Los bloques magnéticos se agotaron");
  await expect(page.getByTestId("frase-camino")).toContainText("De cada 100 visitantes");
  await expect(page.getByTestId("grafico-ventas").locator("svg").first()).toBeVisible();
  await page.getByText("¿Qué significa esto?").first().click();
  await expect(page.getByText("Todo el dinero que pagaron los clientes")).toBeVisible();
  await expect(page.getByTestId("tabla-stock")).toContainText("Seattle");
});

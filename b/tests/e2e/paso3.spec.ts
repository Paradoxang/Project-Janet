import { expect, test } from "@playwright/test";

test("carrito: panel lateral, envío gratis, impuesto por ZIP, guardar para después", async ({ page }) => {
  await page.goto("/en/p/usa-map-floor-puzzle/");
  await page.getByTestId("caja-compra").getByTestId("agregar").click();
  const panel = page.getByTestId("panel-carrito");
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId("barra-envio")).toContainText("more to get FREE delivery");
  await panel.getByTestId("panel-ir-carrito").click();

  await expect(page).toHaveURL(/\/en\/cart\/?$/);
  await expect(page.getByTestId("linea-carrito")).toHaveCount(1);
  await expect(page.getByTestId("resumen-envio")).toHaveText("$5.99");
  await expect(page.getByTestId("resumen")).toContainText("Estimated tax (WA)");

  // Con 3 unidades pasa de $35 y el envío es gratis
  await page.getByTestId("cantidad-linea").selectOption("3");
  await expect(page.getByTestId("resumen-envio")).toHaveText("FREE");
  await expect(page.locator("main").getByTestId("barra-envio")).toContainText("qualifies for FREE delivery");

  await page.getByTestId("guardar").click();
  await expect(page.getByTestId("carrito-vacio")).toBeVisible();
  await page.getByTestId("mover").click();
  await expect(page.getByTestId("linea-carrito")).toHaveCount(1);
});

test("pago como invitada con datos de ejemplo y confirmación", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/");
  await page.getByTestId("caja-compra").getByTestId("comprar-ahora").click();
  await expect(page).toHaveURL(/\/en\/checkout\/?$/);
  await expect(page.getByTestId("aviso-demo")).toBeVisible();

  // Sin datos, no deja pedir
  await page.getByTestId("hacer-pedido").click();
  await expect(page.getByTestId("error-pago")).toContainText("Complete the highlighted fields");

  await page.getByTestId("rellenar").click();
  await page.getByTestId("pago-apple").click();
  await page.getByTestId("hacer-pedido").click();

  await expect(page).toHaveURL(/\/en\/order\/?\?id=DEMO-\d{6}/);
  await expect(page.getByTestId("confirmacion")).toContainText("Order placed, thank you!");
  await expect(page.getByTestId("confirmacion")).toContainText("Apple Pay");
  await expect(page.getByTestId("contador-carrito")).toHaveText("0");
});

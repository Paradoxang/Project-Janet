import { expect, test } from "./fixtures";

// Los productos saludables se compran como los juguetes (Santiago, 28-10: «Yes, make them buyable»), sin mezclarse con
// ellos: mismo botón, mismo carrito y mismo pago, pero fuera del buscador de juguetes.

test("un producto saludable va al carrito y se compra como invitada", async ({ page }) => {
  await page.goto("/en/healthy/");
  const tarjeta = page
    .getByTestId("producto-saludable")
    .filter({ hasText: "Family Cleansing Gel" });
  await tarjeta.getByTestId("agregar").click();
  await expect(page.getByTestId("contador-carrito")).toHaveText("1");

  await page.goto("/en/checkout/");
  await page.getByTestId("modo-invitado").click();
  await page.getByTestId("rellenar").click();
  await page.getByTestId("hacer-pedido").click();
  await expect(page).toHaveURL(/\/en\/order\/?\?id=DEMO-\d{6}/);
  await expect(page.getByTestId("confirmacion")).toContainText("Family Cleansing Gel");
});

// El buscador es difuso: con «granola» puede traer algún juguete, pero nunca la granola ni otro saludable.
test("los productos saludables no salen en el buscador de juguetes", async ({ page }) => {
  await page.goto("/en/search/?q=granola");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("granola");
  await expect(page.locator("main")).not.toContainText("Honey Hemp Granola");
  await page.goto("/en/search/?q=cleansing%20gel");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("cleansing gel");
  await expect(page.locator("main")).not.toContainText("Family Cleansing Gel");
});

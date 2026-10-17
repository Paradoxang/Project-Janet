import { expect, test } from "./fixtures";

// Lo que cambió con la review de usuario del 16-10 (Usuario 1). Cada prueba nombra lo que pidió.

test("la cabecera se esconde al bajar y vuelve al subir un poco", async ({ page }) => {
  await page.goto("/en/search/");
  const cabecera = page.getByTestId("cabecera");
  const franja = await page.locator(".cabecera-flotante").evaluate((e) => (e.previousElementSibling as HTMLElement).offsetHeight);
  await page.mouse.wheel(0, 1500);
  await expect
    .poll(async () => {
      const caja = await cabecera.boundingBox();
      return caja ? caja.y + caja.height : Infinity;
    })
    .toBeLessThanOrEqual(franja + 1);
  await page.mouse.wheel(0, -200);
  await expect.poll(async () => Math.round((await cabecera.boundingBox())?.y ?? -1)).toBe(franja);
});

test("filtros de búsqueda: «Todos» quita la edad sin tener que desmarcarla", async ({ page }) => {
  await page.goto("/es/search/?edad=3-4");
  const todos = page.getByTestId("filtro-todas-edades");
  await expect(todos).toHaveAttribute("aria-pressed", "false");
  await todos.click();
  await expect(page).toHaveURL(/\/es\/search\/?$/);
  await expect(todos).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("cuenta-resultados")).toHaveText("20 resultados");
});

test("lista de deseos sin cuenta: el corazón de la cabecera cuenta y lleva a la lista", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/");
  await page.getByTestId("caja-compra").getByTestId("deseos").click();
  await expect(page.getByTestId("enlace-deseos")).toHaveAttribute("aria-label", "Wish list: 1");
  await page.getByTestId("enlace-deseos").click();
  await expect(page).toHaveURL(/\/en\/wishlist\/?$/);
  await expect(page.getByTestId("lista-deseos").getByTestId("tarjeta-producto")).toContainText("Magnetic");
  // Se guarda: sigue ahí al recargar
  await page.reload();
  await expect(page.getByTestId("lista-deseos").getByTestId("tarjeta-producto")).toContainText("Magnetic");
  await page.getByRole("button", { name: "Remove from list" }).click();
  await expect(page.getByTestId("deseos-vacia")).toBeVisible();
});

test("dónde comprar: la tienda de la ficha llega enfocada y toda la tarjeta se pulsa", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/");
  await page.getByTestId("tienda-seattle").getByRole("link").click();
  await expect(page).toHaveURL(/where-to-buy\/?\?producto=magnetic-tiles&tienda=seattle/);
  await expect(page.getByTestId("ficha-seattle").getByRole("button")).toHaveAttribute("aria-pressed", "true");
  // Pulsar la tarjeta por una esquina, lejos del nombre
  const miami = page.getByTestId("ficha-miami");
  await miami.scrollIntoViewIfNeeded();
  const caja = (await miami.boundingBox())!;
  await page.mouse.click(caja.x + caja.width - 12, caja.y + caja.height - 10);
  await expect(miami.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  // «Cómo llegar» sigue siendo su propio enlace, por encima de la tarjeta
  await expect(miami.getByRole("link", { name: "Get directions" })).toHaveAttribute("href", /google\.com\/maps/);
  // Buscar suelta la tienda enfocada
  await page.getByTestId("buscar-tiendas").click();
  await expect(miami.getByRole("button")).toHaveAttribute("aria-pressed", "false");
});

test("pago: dirección en dos líneas y teléfono opcional (si se escribe, completo)", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/");
  await page.getByTestId("caja-compra").getByTestId("comprar-ahora").click();
  await expect(page).toHaveURL(/\/en\/checkout\/?$/);
  await page.getByTestId("rellenar").click();
  await expect(page.locator("#campo-direccion2")).toHaveValue("Apt 4");
  await page.locator("#campo-telefono").fill("206 555");
  await page.getByTestId("hacer-pedido").click();
  await expect(page.locator("#error-telefono")).toHaveText("Enter a 10-digit US phone number.");
  await page.locator("#campo-telefono").fill("");
  await page.getByTestId("hacer-pedido").click();
  await expect(page).toHaveURL(/\/en\/order\//);
  await expect(page.locator("main")).toContainText("1200 Demo Ave, Apt 4, Seattle, WA 98101");
});

test("el pie: el logo lleva al inicio y el idioma se cambia también desde abajo", async ({ page }) => {
  await page.goto("/en/faq/");
  const pie = page.locator("footer");
  await expect(pie.getByRole("link", { name: /Go to home page/ })).toHaveAttribute("href", /\/en\/?$/);
  await expect(page.getByTestId("pie-conocenos")).toContainText("coming soon");
  await page.getByTestId("selector-idioma-pie").click();
  await expect(page).toHaveURL(/\/es\/faq\/?$/);
});

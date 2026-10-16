import { CORREO_ADMIN, entrarComoDuena, expect, test } from "./fixtures";

test("al entrar como administración, la cabecera de la tienda se recoge en el panel y vuelve en la tienda", async ({
  page,
}) => {
  const cabecera = page.getByTestId("cabecera");
  const franja = page.getByTestId("franja-demo");
  const barra = page.getByTestId("barra-admin");

  await page.goto("/es/panel/");
  await expect(page.getByTestId("puerta-admin")).toBeVisible();
  await expect(cabecera).toBeVisible();
  await expect(franja).toBeVisible();

  await page.getByTestId("campo-correo").fill(CORREO_ADMIN);
  await page.getByTestId("campo-clave").fill("lo-que-sea");
  await page.getByTestId("boton-acceso").click();
  await expect(barra).toBeVisible();
  await expect(cabecera).toBeHidden();
  await expect(franja).toBeHidden();
  await expect(barra.getByTestId("chip-demo")).toHaveText("Demo");

  // En la tienda vuelve la cabecera de siempre, con el acceso al panel
  await barra.getByTestId("ver-tienda").click();
  await expect(page).toHaveURL(/\/es\/?$/);
  await expect(cabecera).toBeVisible();
  await expect(franja).toBeVisible();
  await page.getByTestId("enlace-cuenta").click();
  await expect(barra).toBeVisible();
  await expect(cabecera).toBeHidden();

  // Cambiar de idioma no la vuelve a abrir
  await barra.getByTestId("selector-idioma").click();
  await expect(page).toHaveURL(/\/en\/panel\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How’s my business?");
  await expect(cabecera).toBeHidden();

  // Al salir, vuelve
  await page.getByTestId("salir-admin").click();
  await expect(page.getByTestId("puerta-admin")).toBeVisible();
  await expect(cabecera).toBeVisible();
  await expect(franja).toBeVisible();
});

test("al recargar el panel, la cabecera de la tienda no aparece ni un instante (antes de que cargue React)", async ({
  page,
}) => {
  await entrarComoDuena(page);
  // Sin el JavaScript de la página, React no arranca: lo único que corre es el script de <head>
  await page.route(/\/_next\/static\/.+\.js(\?.*)?$/, (ruta) => ruta.abort());
  await page.reload();
  await expect(page.getByTestId("barra-admin")).toHaveCount(0);
  await expect(page.getByTestId("cabecera")).toHaveCount(1);
  await expect(page.getByTestId("cabecera")).toBeHidden();
  await expect(page.getByTestId("franja-demo")).toBeHidden();
});

test("en una laptop, la barra va en una sola línea y las 7 cifras clave se ven sin bajar", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await entrarComoDuena(page);
  const barra = (await page.getByTestId("barra-admin").boundingBox())!;
  expect(barra.y).toBe(0);
  expect(barra.height).toBeLessThanOrEqual(56);
  // El panel usa el ancho que antes ocupaban los márgenes (antes, 1104 px)
  expect((await page.locator("#resumen").boundingBox())!.width).toBeGreaterThan(1250);
  const kpis = page.getByTestId("kpi");
  await expect(kpis).toHaveCount(7);
  const ultima = (await kpis.nth(6).boundingBox())!;
  expect(ultima.y + ultima.height).toBeLessThanOrEqual(768);
});

test("al bajar por el panel, la barra se queda arriba en la computadora", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await entrarComoDuena(page);
  await page.locator("#inventario").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("barra-admin")).toBeInViewport();
  expect((await page.getByTestId("barra-admin").boundingBox())!.y).toBe(0);
});

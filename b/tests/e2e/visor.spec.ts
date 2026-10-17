import { expect, test } from "./fixtures";

// El visor ampliado de la ficha (Santiago, 17-10: «cuando alguien le da click a una imagen esta debería ponerse "en el
// centro de la pantalla" y dejar hacer zoom»).

const escala = async (page: import("@playwright/test").Page) =>
  Number(await page.getByTestId("visor-escenario").getAttribute("data-escala"));

test("visor: se abre en el centro, con su rótulo, y la página no se mueve detrás", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/");
  await page.getByTestId("ampliar-1").click();
  const visor = page.getByRole("dialog", { name: /Enlarged image: Magnetic Building Tiles/ });
  await expect(visor).toBeVisible();
  await expect(page.getByTestId("visor-contador")).toHaveText("1 of 3");
  await expect(page.getByTestId("visor-rotulo")).toContainText("Illustrative image");
  await expect(page.locator("body")).toHaveAttribute("data-scroll-locked", /.*/);
});

test("visor: zoom con los botones, el teclado y el doble toque; con zoom, las flechas mueven la imagen", async ({ page }) => {
  await page.goto("/es/p/magnetic-tiles/");
  await page.getByTestId("ampliar-1").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByTestId("visor-acercar").click();
  await expect.poll(() => escala(page)).toBeCloseTo(1.4, 2);
  await page.keyboard.press("+");
  await expect.poll(() => escala(page)).toBeCloseTo(1.96, 2);
  await page.getByTestId("visor-alejar").click();
  await expect.poll(() => escala(page)).toBeCloseTo(1.4, 2);
  await page.keyboard.press("0");
  await expect.poll(() => escala(page)).toBe(1);
  // Doble toque: acerca a 250 % y otro doble toque vuelve a ajustar
  const caja = (await page.getByTestId("visor-escenario").boundingBox())!;
  const x = caja.x + caja.width / 2 + 30;
  const y = caja.y + caja.height / 2;
  await page.touchscreen.tap(x, y);
  await page.touchscreen.tap(x, y);
  await expect.poll(() => escala(page)).toBeCloseTo(2.5, 2);
  const marco = page.getByTestId("visor-escenario").locator("> div").first();
  const antes = await marco.evaluate((e) => (e as HTMLElement).style.transform);
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => marco.evaluate((e) => (e as HTMLElement).style.transform)).not.toBe(antes);
  await expect(page.getByTestId("visor-contador")).toHaveText("1 de 3");
});

test("visor: sin zoom, las flechas y los botones cambian de imagen; la de detalle se abre acercada", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/");
  await page.getByTestId("ampliar-1").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("visor-contador")).toHaveText("2 of 3");
  await expect.poll(() => escala(page)).toBeCloseTo(1.7, 2);
  await page.getByTestId("visor-siguiente").click();
  await expect(page.getByTestId("visor-contador")).toHaveText("3 of 3");
  await page.getByTestId("visor-anterior").click();
  await expect(page.getByTestId("visor-contador")).toHaveText("2 of 3");
});

// El tope según la foto (Santiago, 17-10: «Si ponle al visor un tope»): una foto no pasa de 2 píxeles de pantalla por
// píxel suyo, nunca menos de 200 %; las ilustraciones (vectores) llegan a 400 %.
const tope = async (page: import("@playwright/test").Page) =>
  Number(await page.getByTestId("visor-escenario").getAttribute("data-tope"));

async function acercarHastaElFinal(page: import("@playwright/test").Page) {
  const mas = page.getByTestId("visor-acercar");
  for (let i = 0; i < 8 && (await mas.isEnabled()); i++) await mas.click();
  await expect(mas).toBeDisabled();
}

test("visor: con una foto de 1024 px el zoom se para en su tope; con la ilustración llega a 400 %", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/?variante=color");
  await page.getByTestId("ampliar-1").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect.poll(() => tope(page)).toBeLessThan(4);
  const foto = await tope(page);
  expect(foto).toBeGreaterThanOrEqual(2);
  await acercarHastaElFinal(page);
  await expect.poll(() => escala(page)).toBeCloseTo(foto, 2);
  await expect(page.getByTestId("visor-zoom")).toHaveText(`${Math.round(foto * 100)} %`);
  // La rueda tampoco pasa del tope
  const caja = (await page.getByTestId("visor-escenario").boundingBox())!;
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await page.mouse.wheel(0, -600);
  await expect.poll(() => escala(page)).toBeCloseTo(foto, 2);

  await page.goto("/en/p/magnetic-tiles/?variante=base");
  await page.getByTestId("ampliar-1").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect.poll(() => tope(page)).toBe(4);
  await acercarHastaElFinal(page);
  await expect.poll(() => escala(page)).toBe(4);
});

test("visor: una foto que viene de 2048 px (el oso) aguanta más zoom que una de 1024", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/?variante=color");
  await page.getByTestId("ampliar-1").click();
  await expect.poll(() => tope(page)).toBeLessThan(4);
  const de1024 = await tope(page);
  await page.goto("/en/p/plush-teddy-bear/?variante=color");
  await page.getByTestId("ampliar-1").click();
  await expect.poll(() => tope(page)).toBeGreaterThan(de1024);
});

test("visor: Esc, ✕ y un clic en el fondo lo cierran, y el foco vuelve a la imagen", async ({ page }) => {
  await page.goto("/en/p/magnetic-tiles/");
  const imagen = page.getByTestId("ampliar-1");
  await imagen.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(imagen).toBeFocused();

  await imagen.click();
  await page.getByTestId("visor-cerrar").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(imagen).toBeFocused();

  await imagen.click();
  const caja = (await page.getByTestId("visor-escenario").boundingBox())!;
  await page.mouse.click(caja.x + 6, caja.y + caja.height - 6);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Un clic sobre la imagen no lo cierra
  await imagen.click();
  await page.getByTestId("visor-escenario").click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

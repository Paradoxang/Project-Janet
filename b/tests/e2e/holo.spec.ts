import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Tarjetas holográficas (WebGL). El Chromium de las pruebas tiene WebGL2 solo por software (SwiftShader):
// la tienda no monta el holograma ahí, así que casi todas estas pruebas simulan un equipo con GPU.
// Por software dibuja mucho más lento que un celular de verdad: estas pruebas tienen más tiempo.
const masVendidos = "section[aria-labelledby='mas-vendidos']";

/** Como Chrome --headless=new (el de Lighthouse): dibuja por software pero no lo avisa con failIfMajorPerformanceCaveat. */
async function sinAvisoDeSoftware(page: Page) {
  await page.addInitScript(() => {
    const contexto = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tipo: string, opciones?: unknown) {
      const sinAviso =
        opciones && typeof opciones === "object" ? { ...opciones, failIfMajorPerformanceCaveat: false } : opciones;
      return Reflect.apply(contexto, this, [tipo, sinAviso]);
    } as typeof contexto;
  });
}

/** Simula un equipo con GPU: además, tapa el nombre del renderizador («SwiftShader»). */
async function conGpu(page: Page) {
  await sinAvisoDeSoftware(page);
  await page.addInitScript(() => {
    const extension = WebGL2RenderingContext.prototype.getExtension;
    WebGL2RenderingContext.prototype.getExtension = function (this: WebGL2RenderingContext, nombre: string) {
      return nombre === "WEBGL_debug_renderer_info" ? null : Reflect.apply(extension, this, [nombre]);
    } as typeof extension;
  });
}

test.describe("tarjetas holográficas", () => {
  test.describe.configure({ timeout: 90_000 });

  test("brillan a la vista, dejan deslizar la fila y llevan a la ficha", async ({ page }) => {
    await conGpu(page);
    await page.goto("/en/");
    const fila = page.locator(masVendidos);
    await fila.scrollIntoViewIfNeeded();
    const holo = fila.locator(".holo-card[data-ready]").first();
    await expect(holo).toBeVisible({ timeout: 15_000 });
    // pan-y (el original) no dejaba deslizar la fila en horizontal con el dedo
    await expect(holo).toHaveCSS("touch-action", "manipulation");
    // el rótulo «Illustrative image» queda encima del holograma (exacto: el de la foto con IA, escondido en la tienda
    // blanca, dice «Illustrative image (AI)»)
    const rotulo = fila.getByTestId("tarjeta-producto").first().getByText("Illustrative image", { exact: true });
    await expect(rotulo).toBeVisible();

    await holo.click();
    await expect(page).toHaveURL(/\/en\/p\/[a-z-]+\/?$/);
  });

  test("con 20 productos en pantalla nunca hay más de 8 a la vez", async ({ page }) => {
    await conGpu(page);
    await page.goto("/en/search/");
    await expect(page.getByTestId("tarjeta-producto")).toHaveCount(20);
    await expect(page.locator(".holo-card[data-ready]").first()).toBeVisible({ timeout: 15_000 });
    let maximo = 0;
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, 450));
      await page.waitForTimeout(250);
      maximo = Math.max(maximo, await page.locator(".holo-card").count());
    }
    expect(maximo).toBeGreaterThan(0);
    expect(maximo).toBeLessThanOrEqual(8);
  });

  test("al cambiar de marca el holograma toma los colores nuevos", async ({ page }) => {
    await conGpu(page);
    await page.goto("/en/");
    await page.locator(masVendidos).scrollIntoViewIfNeeded();
    const arte = page.locator(`${masVendidos} .holo-card[data-ready] .holo-card__face img`).first();
    await expect(arte).toBeVisible({ timeout: 15_000 });
    const antes = await arte.getAttribute("src");
    await page.getByTestId("interruptor-marca").click();
    await expect(page.locator("html")).toHaveAttribute("data-marca", "brinco");
    await expect(arte).not.toHaveAttribute("src", antes ?? "");
  });

  test("con «reducir movimiento» se queda la imagen de siempre", async ({ page }) => {
    await conGpu(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/");
    // Prueba de que React ya responde (aquí no hay señal de ObservadorRevelar): el interruptor de marca cambia.
    await expect(async () => {
      await page.getByTestId("interruptor-marca").click();
      await expect(page.locator("html")).toHaveAttribute("data-marca", "brinco", { timeout: 1_000 });
    }).toPass();
    await page.locator(masVendidos).scrollIntoViewIfNeeded();
    await expect(page.locator(masVendidos).getByTestId("tarjeta-producto").first().locator("img").first()).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.locator(".holo-card")).toHaveCount(0);
  });

  test("sin GPU (WebGL por software, como PageSpeed) se queda la imagen de siempre", async ({ page }) => {
    await page.goto("/en/search/");
    await expect(page.getByTestId("tarjeta-producto")).toHaveCount(20);
    await page.waitForTimeout(1500);
    await expect(page.locator(".holo-card")).toHaveCount(0);
  });

  test("el pie da el crédito a sus autores", async ({ page }) => {
    await page.goto("/es/");
    const creditos = page.getByTestId("creditos");
    await expect(creditos.getByRole("link", { name: "HoloCard de React Bits" })).toHaveAttribute(
      "href",
      "https://reactbits.dev",
    );
    await expect(creditos).toContainText("David Haz");
  });

  test("sin GPU aunque el navegador no lo avise (Lighthouse) tampoco se monta", async ({ page }) => {
    // Pasó de verdad: en Chrome --headless=new se montaba por software y Lighthouse marcó 160 s de bloqueo.
    await sinAvisoDeSoftware(page);
    await page.goto("/en/search/");
    await expect(page.getByTestId("tarjeta-producto")).toHaveCount(20);
    await page.waitForTimeout(1500);
    await expect(page.locator(".holo-card")).toHaveCount(0);
  });
});

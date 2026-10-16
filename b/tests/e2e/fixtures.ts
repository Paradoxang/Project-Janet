import { test as base, expect } from "@playwright/test";

/**
 * Igual que el test de Playwright, pero cada page.goto espera a que la página sea interactiva.
 * Señal: <html class="js-revelar">, que pone ObservadorRevelar en su useEffect (después de hidratar).
 * Sin esto, contra la web publicada (más lenta) se podía escribir en un campo antes de que React lo controlara.
 * Con «reducir movimiento» ObservadorRevelar no corre y no hay señal: esas pruebas esperan por su cuenta.
 */
export const test = base.extend({
  page: async ({ page }, usar) => {
    const ir = page.goto.bind(page);
    page.goto = async (url, opciones) => {
      const respuesta = await ir(url, opciones);
      await page.waitForFunction(
        () =>
          document.documentElement.classList.contains("js-revelar") ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      return respuesta;
    };
    await usar(page);
  },
});

export { expect };

import { test as base, expect, type Page } from "@playwright/test";

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

export const CORREO_ADMIN = "admin@example.com";

/** La dueña entra por el login normal: correo de administración y, en la demo, cualquier contraseña. */
export async function entrarComoDuena(page: Page, idioma: "es" | "en" = "es") {
  await page.goto(`/${idioma}/account/`);
  await page.getByTestId("campo-correo").fill(CORREO_ADMIN);
  await page.getByTestId("campo-clave").fill("cualquier-cosa");
  await page.getByTestId("boton-acceso").click();
  await expect(page).toHaveURL(new RegExp(`/${idioma}/panel/?$`));
  await expect(page.getByTestId("barra-admin")).toBeVisible();
}

/** Crea una cuenta de compradora desde el formulario (queda dentro). */
export async function crearCuenta(page: Page, datos: { nombre: string; correo: string; clave: string }) {
  await page.getByTestId("ir-a-crear").click();
  await page.getByTestId("campo-nombre").fill(datos.nombre);
  await page.getByTestId("campo-correo").fill(datos.correo);
  await page.getByTestId("campo-clave").fill(datos.clave);
  await page.getByTestId("boton-acceso").click();
}

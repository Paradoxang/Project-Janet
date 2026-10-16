import path from "node:path";
import { CORREO_ADMIN, crearCuenta, entrarComoDuena, expect, test } from "./fixtures";

// El recorrido de la presentación, de punta a punta y en un mismo navegador:
// la dueña sube un juguete, una compradora lo encuentra y lo compra, y la dueña lo ve en su panel.
test("recorrido completo: la dueña sube un juguete, una compradora lo compra y la dueña lo ve en vivo", async ({ page }) => {
  // 1. La dueña crea el juguete
  await entrarComoDuena(page);
  await page.getByTestId("borrar-actividad").click().catch(() => {});
  await page.getByTestId("pestana-productos").click();
  await page.getByTestId("nuevo-producto").click();
  const formulario = page.getByTestId("formulario-producto");
  await formulario.getByTestId("producto-foto").setInputFiles(path.join(__dirname, "foto-prueba.png"));
  await formulario.getByTestId("producto-titulo-es").fill("Cocinita de madera con horno");
  await formulario.getByTestId("idioma-titulo-en").click();
  await formulario.getByTestId("producto-titulo-en").fill("Wooden play kitchen with oven");
  await formulario.getByTestId("producto-precio").fill("59.90");
  await formulario.getByTestId("edad-3-4").click();
  await formulario.getByTestId("categoria-pretend").click();
  await formulario.getByTestId("guardar-producto").click();
  await expect(formulario).toBeHidden();
  await page.getByTestId("salir-admin").click();

  // 2. Una compradora lo encuentra en la portada y lo compra creando su cuenta
  await page.goto("/es/");
  await page.getByTestId("novedades").getByRole("link", { name: "Cocinita de madera con horno" }).click();
  await expect(page.getByTestId("titulo-producto")).toHaveText("Cocinita de madera con horno");
  await page.getByTestId("caja-compra").getByTestId("comprar-ahora").click();
  await page.getByTestId("modo-cuenta").click();
  await page.getByTestId("entrar-para-pagar").click();
  await crearCuenta(page, { nombre: "Laura", correo: "laura@ejemplo.com", clave: "juguetes123" });
  await expect(page.getByTestId("comprando-como")).toContainText("laura@ejemplo.com");
  await page.getByTestId("rellenar").click();
  await page.getByTestId("hacer-pedido").click();
  await expect(page.getByTestId("confirmacion")).toContainText("Cocinita de madera con horno");

  // …y lo ve en su cuenta, con el correo de confirmación simulado
  await page.goto("/es/account/");
  await expect(page.getByTestId("pedido")).toContainText("Cocinita de madera con horno");
  await expect(page.getByTestId("bandeja")).toContainText("Recibimos tu pedido");
  await page.getByTestId("salir").click();

  // 3. La dueña vuelve a entrar y lo ve en vivo
  await page.getByTestId("campo-correo").fill(CORREO_ADMIN);
  await page.getByTestId("campo-clave").fill("cualquier-cosa");
  await page.getByTestId("boton-acceso").click();
  await expect(page).toHaveURL(/\/es\/panel\/?$/);
  const eventos = page.getByTestId("ultimos-eventos");
  await expect(eventos).toContainText("Compró por $");
  await expect(eventos).toContainText("Vio «Cocinita de madera con horno»");
  await expect(page.getByTestId("en-vivo")).toContainText("Compras1");
});

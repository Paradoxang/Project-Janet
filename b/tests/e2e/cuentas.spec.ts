import { CORREO_ADMIN, crearCuenta, entrarComoDuena, expect, test } from "./fixtures";

const ana = { nombre: "Ana", correo: "ana@ejemplo.com", clave: "juguetes123" };

test("una compradora crea su cuenta, sale y vuelve a entrar con su contraseña", async ({ page }) => {
  await page.goto("/es/account/");
  await crearCuenta(page, ana);
  await expect(page.getByTestId("saludo")).toHaveText("Hola, Ana");
  await expect(page.getByTestId("enlace-cuenta")).toHaveAttribute("aria-label", "Tu cuenta: Ana");
  // La contraseña no se guarda tal cual en el navegador
  expect(await page.evaluate(() => localStorage.getItem("cuenta"))).not.toContain(ana.clave);

  await page.getByTestId("salir").click();
  await page.getByTestId("campo-correo").fill("ANA@ejemplo.com");
  await page.getByTestId("campo-clave").fill("otra-clave");
  await page.getByTestId("boton-acceso").click();
  await expect(page.getByTestId("error-acceso")).toHaveText("El correo o la contraseña no coinciden.");

  await page.getByTestId("campo-clave").fill(ana.clave);
  await page.getByTestId("boton-acceso").click();
  await expect(page.getByTestId("saludo")).toHaveText("Hola, Ana");
});

test("no deja crear una cuenta con el correo de administración", async ({ page }) => {
  await page.goto("/es/account/");
  await crearCuenta(page, { ...ana, correo: CORREO_ADMIN });
  await expect(page.getByTestId("error-acceso")).toContainText("es el de administración");
});

test("la dueña entra con el correo de administración y ve el panel; al salir, se cierra", async ({ page }) => {
  await page.goto("/es/panel/");
  await expect(page.getByTestId("puerta-admin")).toBeVisible();
  await expect(page.getByTestId("kpi")).toHaveCount(0);

  await page.getByTestId("campo-correo").fill(CORREO_ADMIN);
  await page.getByTestId("campo-clave").fill("lo-que-sea");
  await page.getByTestId("boton-acceso").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("¿Cómo va mi negocio?");
  await expect(page.getByTestId("kpi")).toHaveCount(7);
  await expect(page.getByTestId("enlace-cuenta")).toHaveAttribute("aria-label", "Panel de administración");

  await page.getByTestId("salir-admin").click();
  await expect(page.getByTestId("puerta-admin")).toBeVisible();
});

test("una compradora no puede ver el panel", async ({ page }) => {
  await page.goto("/es/account/");
  await crearCuenta(page, ana);
  await expect(page.getByTestId("saludo")).toBeVisible();
  await page.goto("/es/panel/");
  await expect(page.getByTestId("puerta-admin")).toContainText("Esta zona es solo para la dueña");
  await expect(page.getByTestId("kpi")).toHaveCount(0);
});

test("los favoritos de antes de entrar pasan a la cuenta", async ({ page }) => {
  await page.goto("/es/p/magnetic-tiles/");
  await page.getByTestId("deseos").click();
  await expect(page.getByTestId("deseos")).toHaveAttribute("aria-pressed", "true");
  await page.goto("/es/account/");
  await crearCuenta(page, ana);
  await expect(page.getByTestId("saludo")).toBeVisible();
  await expect(page.locator("#favoritos").getByTestId("tarjeta-producto")).toContainText("magnéticos");
});

test("comprar con la cuenta: pide entrar, vuelve al pago y guarda el pedido en su historial", async ({ page }) => {
  await page.goto("/es/p/magnetic-tiles/");
  await page.getByTestId("caja-compra").getByTestId("comprar-ahora").click();
  await expect(page).toHaveURL(/\/es\/checkout\/?$/);
  await page.getByTestId("modo-cuenta").click();
  await page.getByTestId("entrar-para-pagar").click();

  await expect(page).toHaveURL(/\/es\/account\/?\?volver=/);
  await crearCuenta(page, ana);
  await expect(page).toHaveURL(/\/es\/checkout\/?$/);
  await expect(page.getByTestId("comprando-como")).toContainText(ana.correo);

  await page.getByTestId("rellenar").click();
  await page.getByTestId("hacer-pedido").click();
  await expect(page).toHaveURL(/\/es\/order\/?\?id=DEMO-\d{6}/);

  await page.goto("/es/account/");
  await expect(page.getByTestId("pedido")).toHaveCount(1);
  await expect(page.getByTestId("pedido")).toContainText("magnéticos");
});

test("en el celular el panel no se sale de la pantalla", async ({ page }) => {
  await entrarComoDuena(page);
  await page.waitForLoadState("networkidle");
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(desborde).toBeLessThanOrEqual(0);
});

test("la compradora cambia su nombre y su contraseña; la vieja deja de servir", async ({ page }) => {
  await page.goto("/es/account/");
  await crearCuenta(page, ana);
  await page.getByTestId("cuenta-nombre").fill("Ana María");
  await page.getByTestId("guardar-nombre").click();
  await expect(page.getByTestId("saludo")).toHaveText("Hola, Ana María");

  await page.getByTestId("clave-actual").fill("no-es-esta");
  await page.getByTestId("clave-nueva").fill("nueva-clave-1");
  await page.getByTestId("clave-repite").fill("nueva-clave-1");
  await page.getByTestId("cambiar-clave").click();
  await expect(page.getByTestId("error-clave")).toHaveText("La contraseña actual no coincide.");
  await page.getByTestId("clave-actual").fill(ana.clave);
  await page.getByTestId("cambiar-clave").click();
  await expect(page.getByTestId("error-clave")).toBeHidden();
  await expect(page.getByTestId("clave-actual")).toHaveValue("");

  await page.getByTestId("salir").click();
  await page.getByTestId("campo-correo").fill(ana.correo);
  await page.getByTestId("campo-clave").fill(ana.clave);
  await page.getByTestId("boton-acceso").click();
  await expect(page.getByTestId("error-acceso")).toBeVisible();
  await page.getByTestId("campo-clave").fill("nueva-clave-1");
  await page.getByTestId("boton-acceso").click();
  await expect(page.getByTestId("saludo")).toHaveText("Hola, Ana María");
});

test("avisos por correo: la bandeja simulada muestra la bienvenida y la confirmación del pedido", async ({ page }) => {
  await page.goto("/es/account/");
  await crearCuenta(page, ana);
  const bandeja = page.getByTestId("bandeja");
  await expect(bandeja).toContainText("Te damos la bienvenida");

  // Compra con su cuenta (ya entró: el pago viene con la cuenta elegida)
  await page.goto("/es/p/magnetic-tiles/");
  await page.getByTestId("caja-compra").getByTestId("comprar-ahora").click();
  await expect(page.getByTestId("comprando-como")).toContainText(ana.correo);
  await page.getByTestId("rellenar").click();
  await page.getByTestId("hacer-pedido").click();
  await expect(page).toHaveURL(/\/es\/order\/?\?id=DEMO-\d{6}/);

  await page.goto("/es/account/");
  await expect(bandeja).toContainText("Recibimos tu pedido DEMO-");
  await page.getByTestId("aviso-pedidos").click();
  await expect(bandeja).not.toContainText("Recibimos tu pedido");
  await page.getByTestId("aviso-ofertas").click();
  await expect(bandeja).toContainText("Ideas de regalo para esta semana");
});

test("te puede gustar: recomienda según sus favoritos, sin repetirlos", async ({ page }) => {
  await page.goto("/es/p/magnetic-tiles/");
  await page.getByTestId("deseos").click();
  await page.goto("/es/account/");
  await crearCuenta(page, ana);
  const recomendados = page.locator("#te-puede-gustar").getByTestId("tarjeta-producto");
  await expect(recomendados.first()).toBeVisible();
  expect(await recomendados.count()).toBeGreaterThan(2);
  await expect(recomendados.filter({ hasText: "Bloques magnéticos" })).toHaveCount(0);
});

test("el equipo entra al panel con su cuenta de administración invitada", async ({ page }) => {
  await page.goto("/es/account/");
  await page.getByTestId("campo-correo").fill("juan@example.com");
  await page.getByTestId("campo-clave").fill("cualquier-cosa");
  await page.getByTestId("boton-acceso").click();
  await expect(page).toHaveURL(/\/es\/panel\/?$/);
  await expect(page.getByTestId("admin-invitado")).toHaveText("Invitado: Juan");
  await expect(page.getByTestId("kpi")).toHaveCount(7);
  await page.goto("/es/account/");
  await expect(page.getByTestId("cuenta-admin")).toContainText("administración invitada (Juan)");
});

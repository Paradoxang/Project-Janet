import path from "node:path";
import { entrarComoDuena, expect, test } from "./fixtures";

const FOTO = path.join(__dirname, "foto-prueba.png");

test("la dueña crea un juguete con foto y aparece en la tienda; se puede comprar", async ({ page }) => {
  await entrarComoDuena(page);
  await page.getByTestId("pestana-productos").click();
  await expect(page).toHaveURL(/\/es\/panel\/catalogo\/?$/);
  await expect(page.getByTestId("fila-producto")).toHaveCount(20);

  await page.getByTestId("nuevo-producto").click();
  const formulario = page.getByTestId("formulario-producto");
  // Sin datos, no deja guardar y explica qué falta
  await formulario.getByTestId("guardar-producto").click();
  await expect(formulario.getByTestId("error-producto")).toBeVisible();
  await expect(formulario).toContainText("Escribe el nombre al menos en un idioma.");

  await formulario.getByTestId("producto-foto").setInputFiles(FOTO);
  await expect(formulario.getByTestId("vista-previa")).toHaveAttribute("src", /^data:image\/jpeg/);
  await formulario.getByTestId("producto-titulo-es").fill("Cocinita de madera con horno");
  await formulario.getByTestId("producto-precio").fill("59.90");
  await formulario.getByTestId("producto-edad").selectOption("3-4");
  await formulario.getByTestId("producto-categoria").selectOption("pretend");
  await formulario.locator("#vinetas-es").fill("Horno que se abre\nIncluye 6 utensilios");
  await formulario.getByTestId("guardar-producto").click();
  await expect(formulario).toBeHidden();
  await expect(page.getByTestId("fila-producto")).toHaveCount(21);
  await expect(page.getByTestId("fila-producto").first()).toContainText("Cocinita de madera con horno");

  // En la portada, «Recién llegados»
  await page.goto("/es/");
  const novedades = page.getByTestId("novedades");
  await expect(novedades.getByTestId("tarjeta-producto")).toContainText("Cocinita de madera con horno");
  await expect(novedades.getByTestId("tarjeta-producto").locator("img").first()).toHaveAttribute("src", /^data:image\/jpeg/);

  // En el buscador
  await page.goto("/es/search/?q=cocinita");
  const resultado = page.getByTestId("tarjeta-producto").filter({ hasText: "Cocinita de madera con horno" });
  await expect(resultado).toHaveCount(1);

  // Su ficha (ruta de los productos nuevos) y al carrito
  await resultado.getByRole("link").first().click();
  await expect(page).toHaveURL(/\/es\/p\/nuevo\/?\?id=n-/);
  await expect(page.getByTestId("titulo-producto")).toHaveText("Cocinita de madera con horno");
  await expect(page.getByText("Horno que se abre")).toBeVisible();
  await expect(page.getByText("Sin reseñas todavía")).toBeVisible();
  await page.getByTestId("caja-compra").getByTestId("agregar").click();
  await expect(page.getByTestId("panel-carrito")).toContainText("Cocinita de madera con horno");
});

test("editar el precio de un juguete de ejemplo cambia en toda la tienda; ocultar y borrar lo quitan", async ({ page }) => {
  await entrarComoDuena(page);
  await page.goto("/es/panel/catalogo/");
  const fila = page.getByTestId("fila-producto").filter({ hasText: "Oso de peluche" });
  await fila.getByTestId("editar-producto").click();
  const formulario = page.getByTestId("formulario-producto");
  await expect(formulario.getByTestId("producto-precio")).toHaveValue("17.99");
  await formulario.getByTestId("producto-precio").fill("12.50");
  await formulario.getByTestId("guardar-producto").click();
  await expect(fila).toContainText("Editado");

  await page.goto("/es/p/plush-teddy-bear/");
  await expect(page.getByTestId("caja-compra")).toContainText("12");
  await expect(page.getByTestId("caja-compra")).toContainText("50");

  // Ocultar: deja de salir en la tienda y su ficha avisa
  await page.goto("/es/panel/catalogo/");
  await fila.getByTestId("ocultar-producto").click();
  await expect(fila).toContainText("Oculto");
  await page.goto("/es/search/?q=oso");
  await expect(page.getByTestId("tarjeta-producto").filter({ hasText: "Oso de peluche" })).toHaveCount(0);
  await page.goto("/es/p/plush-teddy-bear/");
  await expect(page.getByTestId("no-disponible")).toBeVisible();

  // Borrar uno de ejemplo (con confirmación) y volver al catálogo de ejemplo
  await page.goto("/es/panel/catalogo/");
  await page.getByTestId("fila-producto").filter({ hasText: "Tren de madera" }).getByTestId("borrar-producto").click();
  await page.getByTestId("confirmar-borrar").click();
  await expect(page.getByTestId("fila-producto")).toHaveCount(19);
  await page.getByTestId("restaurar-catalogo").click();
  await page.getByTestId("confirmar-restaurar").click();
  await expect(page.getByTestId("fila-producto")).toHaveCount(20);
  await page.goto("/es/p/plush-teddy-bear/");
  await expect(page.getByTestId("titulo-producto")).toContainText("Oso de peluche");
});

test("los detalles se piden con su unidad, las piezas con − y + y los materiales de una lista; la ficha los muestra", async ({
  page,
}) => {
  await entrarComoDuena(page);
  await page.goto("/es/panel/catalogo/");
  await page.getByTestId("nuevo-producto").click();
  const formulario = page.getByTestId("formulario-producto");
  await formulario.getByTestId("ilustracion-tea-set").click();
  await formulario.getByTestId("producto-titulo-es").fill("Cocina de madera con horno");
  await formulario.getByTestId("producto-precio").fill("89");
  await formulario.getByTestId("producto-edad").selectOption("3-4");
  await formulario.getByTestId("producto-categoria").selectOption("pretend");

  // Medidas: con letras (o sin el ancho) no deja guardar
  await formulario.getByTestId("producto-largo").fill("sesenta");
  await formulario.getByTestId("guardar-producto").click();
  await expect(formulario).toContainText("Escribe al menos el largo y el ancho");
  await formulario.getByTestId("producto-largo").fill("60");
  await formulario.getByTestId("producto-ancho").fill("30,5");
  await formulario.getByTestId("producto-alto").fill("85");
  await expect(formulario.getByRole("radio", { name: "centímetros" })).toBeChecked();

  // Peso en libras
  await formulario.getByTestId("producto-peso").fill("4,5");
  await formulario.getByTestId("unidad-peso-lb").click();
  await expect(formulario.getByRole("radio", { name: "libras" })).toBeChecked();

  // Piezas con − y +
  for (let i = 0; i < 3; i++) await formulario.getByTestId("mas-piezas").click();
  await formulario.getByTestId("menos-piezas").click();
  await expect(formulario.getByTestId("producto-piezas")).toHaveValue("2");

  // Materiales: se marcan de la lista
  await formulario.getByTestId("material-madera").click();
  await formulario.getByTestId("material-pintura-agua").click();
  await expect(formulario.getByRole("checkbox", { name: "Madera", exact: true })).toBeChecked();
  await formulario.getByTestId("guardar-producto").click();
  await expect(formulario).toBeHidden();

  // La ficha, en español y en inglés
  await page.getByTestId("fila-producto").first().getByTestId("ver-producto").click();
  await expect(page.getByTestId("titulo-producto")).toHaveText("Cocina de madera con horno");
  const valores = page.locator('section[aria-labelledby="detalles"] dd');
  await expect(valores).toHaveText(["60 x 30.5 x 85 cm", "4.5 lb", "Madera, pintura a base de agua", "2"]);
  await page.getByTestId("selector-idioma").click();
  await expect(valores).toHaveText(["60 x 30.5 x 85 cm", "4.5 lb", "Wood, water-based paint", "2"]);
});

test("al editar un juguete de ejemplo, trae sus medidas y su peso con la unidad, y conserva sus materiales", async ({
  page,
}) => {
  await entrarComoDuena(page);
  await page.goto("/es/panel/catalogo/");
  await page.getByTestId("fila-producto").filter({ hasText: "Oso de peluche" }).getByTestId("editar-producto").click();
  const formulario = page.getByTestId("formulario-producto");
  await expect(formulario.getByTestId("producto-largo")).toHaveValue("9.1");
  await expect(formulario.getByTestId("producto-ancho")).toHaveValue("7.1");
  await expect(formulario.getByTestId("producto-alto")).toHaveValue("14");
  await expect(formulario.getByRole("radio", { name: "pulgadas" })).toBeChecked();
  await expect(formulario.getByTestId("producto-peso")).toHaveValue("0.7");
  await expect(formulario.getByRole("radio", { name: "libras" })).toBeChecked();
  await expect(formulario.getByTestId("producto-piezas")).toHaveValue("1");
  // Sus materiales no están en la lista: se conservan tal cual
  await expect(formulario).toContainText("Ahora dice «Peluche y relleno de poliéster»");
  await formulario.getByTestId("guardar-producto").click();
  await expect(formulario).toBeHidden();

  await page.goto("/es/p/plush-teddy-bear/");
  await expect(page.locator('section[aria-labelledby="detalles"] dd')).toHaveText([
    "Desde el nacimiento",
    "9.1 x 7.1 x 14 in",
    "0.7 lb",
    "Peluche y relleno de poliéster",
    "No requiere",
    "1",
  ]);
});

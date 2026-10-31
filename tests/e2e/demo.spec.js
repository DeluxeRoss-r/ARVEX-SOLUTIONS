import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function enter(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Explorar demo" }).click();
}
async function nav(page, name) {
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("button", { name, exact: true })
    .click();
}
async function more(page, name) {
  await nav(page, "Más");
  await page.getByRole("button", { name, exact: true }).click();
}
test("venta móvil calcula total, actualiza stock, ticket y persiste al recargar", async ({
  page,
}) => {
  await enter(page);
  await nav(page, "Vender");
  await page
    .getByRole("button", { name: "Agregar Café de origen", exact: true })
    .click();
  await page.getByRole("button", { name: "Ver carrito", exact: false }).click();
  await page.getByRole("button", { name: "Aumentar Café de origen" }).click();
  await expect(
    page
      .getByRole("dialog", { name: "Venta actual" })
      .getByTestId("cart-total"),
  ).toHaveText("$370.00");
  await page
    .getByRole("button", { name: "Simular venta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Venta simulada" }),
  ).toBeVisible();
  await expect(
    page.getByText("Sin cobro real. Sin valor fiscal."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nueva venta", exact: true }).click();
  await nav(page, "Productos");
  await expect(page.getByTestId("product-cafe")).toContainText(
    "22 disponibles",
  );
  await page.reload();
  await expect(page.getByTestId("product-cafe")).toContainText(
    "22 disponibles",
  );
});
test("buscador, categoría y estado vacío del catálogo", async ({ page }) => {
  await enter(page);
  await nav(page, "Productos");
  await page.getByLabel("Buscar productos", { exact: true }).fill("CAF-001");
  await expect(page.getByTestId("product-cafe")).toBeVisible();
  await expect(page.getByTestId("product-taza")).toHaveCount(0);
  await page
    .getByLabel("Buscar productos", { exact: true })
    .fill("inexistente");
  await expect(page.getByText("No encontramos productos")).toBeVisible();
  await page.getByLabel("Buscar productos", { exact: true }).fill("");
  await page.getByRole("button", { name: "Papelería", exact: true }).click();
  await expect(page.getByTestId("product-libreta")).toBeVisible();
  await expect(page.getByTestId("product-cafe")).toHaveCount(0);
});
test("inventario registra entrada y valida salida superior al saldo", async ({
  page,
}) => {
  await enter(page);
  await nav(page, "Inventario");
  await page
    .getByRole("button", { name: "Registrar movimiento", exact: true })
    .click();
  await page.getByLabel("Producto del movimiento").selectOption("cafe");
  await page.getByLabel("Cantidad del movimiento").fill("5");
  await page.getByLabel("Motivo").fill("Reposición de prueba");
  await page
    .getByRole("button", { name: "Guardar movimiento", exact: true })
    .click();
  await expect(page.getByText("Reposición de prueba")).toBeVisible();
  await nav(page, "Productos");
  await expect(page.getByTestId("product-cafe")).toContainText(
    "29 disponibles",
  );
  await nav(page, "Inventario");
  await page
    .getByRole("button", { name: "Registrar movimiento", exact: true })
    .click();
  await page.getByLabel("Tipo de movimiento").selectOption("salida");
  await page.getByLabel("Cantidad del movimiento").fill("999");
  await page.getByLabel("Motivo").fill("Salida de prueba");
  await page
    .getByRole("button", { name: "Guardar movimiento", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("supera las existencias");
});
test("sucursales aíslan stock y descartan carrito con confirmación", async ({
  page,
}) => {
  await enter(page);
  await nav(page, "Vender");
  await page
    .getByRole("button", { name: "Agregar Café de origen", exact: true })
    .click();
  page.once("dialog", (d) => d.dismiss());
  await page.getByLabel("Sucursal activa").selectOption("norte");
  await expect(page.getByLabel("Sucursal activa")).toHaveValue("centro");
  page.once("dialog", (d) => d.accept());
  await page.getByLabel("Sucursal activa").selectOption("norte");
  await expect(page.getByLabel("Sucursal activa")).toHaveValue("norte");
  await nav(page, "Productos");
  await expect(page.getByTestId("product-cafe")).toContainText(
    "16 disponibles",
  );
});
test("clientes filtra y muestra ficha, configuración se guarda localmente", async ({
  page,
}) => {
  await enter(page);
  await more(page, "Clientes");
  await page.getByLabel("Buscar clientes").fill("Nube");
  await page.getByRole("button", { name: "Ver Estudio Nube · Demo" }).click();
  await expect(page.getByRole("dialog")).toContainText("Historial de compras");
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await more(page, "Configuración");
  await page.getByLabel("Nombre de empresa").fill("Mi comercio demo");
  await page.getByRole("button", { name: "Guardar configuración" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Configuración guardada",
  );
  await page.reload();
  await expect(page.getByLabel("Nombre de empresa")).toHaveValue(
    "Mi comercio demo",
  );
});
test("reiniciar requiere confirmación y restaura datos", async ({ page }) => {
  await enter(page);
  await more(page, "Configuración");
  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "Restablecer datos demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Configuración", exact: true }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Restablecer datos demo" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Datos demo restablecidos",
  );
});
test("catálogo sin stock y carrito vacío no permiten venta", async ({
  page,
}) => {
  await enter(page);
  await nav(page, "Vender");
  await expect(
    page.getByRole("button", { name: "Agregar Filtros de café" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Ver carrito", exact: false }).click();
  await expect(
    page.getByRole("button", { name: "Simular venta", exact: true }),
  ).toBeDisabled();
});
test("sin desbordamiento ni errores graves de accesibilidad en móvil, tablet y escritorio", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ["Resumen", "Productos", "Vender", "Inventario"]) {
      await nav(page, name);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});

test("datos locales corruptos se recuperan y la demo funciona sin almacenamiento", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("arvex-demo-v1", '{"version":1,"inventory":null}');
  });
  await enter(page);
  await expect(
    page.getByRole("heading", { name: "Todo bajo control" }),
  ).toBeVisible();
  await nav(page, "Productos");
  await expect(page.getByTestId("product-cafe")).toContainText(
    "24 disponibles",
  );
});
test("almacenamiento bloqueado informa y permite vender en memoria", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Bloqueado", "QuotaExceededError");
    };
  });
  await enter(page);
  await expect(page.getByRole("alert")).toContainText(
    "No se pueden guardar cambios",
  );
  await nav(page, "Vender");
  await page
    .getByRole("button", { name: "Agregar Café de origen", exact: true })
    .click();
  await page.getByRole("button", { name: "Ver carrito", exact: false }).click();
  await page
    .getByRole("button", { name: "Simular venta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Venta simulada" }),
  ).toBeVisible();
});
test("carrito elimina unidades y devolución de foco al cerrar con Escape", async ({
  page,
}) => {
  await enter(page);
  await nav(page, "Vender");
  await page
    .getByRole("button", { name: "Agregar Café de origen", exact: true })
    .click();
  await page.getByRole("button", { name: "Ver carrito", exact: false }).click();
  await page.getByRole("button", { name: "Disminuir Café de origen" }).click();
  await expect(
    page.getByRole("button", { name: "Simular venta", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ver carrito", exact: false }),
  ).toBeFocused();
});
test("venta en escritorio usa carrito lateral y conserva la otra sucursal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await enter(page);
  await nav(page, "Vender");
  await page
    .getByRole("button", { name: "Agregar Taza de cerámica", exact: true })
    .click();
  await expect(
    page
      .getByRole("complementary", { name: "Carrito de venta" })
      .getByTestId("cart-total"),
  ).toHaveText("$149.00");
  await page
    .getByRole("button", { name: "Simular venta", exact: true })
    .click();
  await page.getByRole("button", { name: "Nueva venta", exact: true }).click();
  await nav(page, "Productos");
  await expect(page.getByTestId("product-taza")).toContainText(
    "17 disponibles",
  );
  await page.getByLabel("Sucursal activa").selectOption("norte");
  await expect(page.getByTestId("product-taza")).toContainText("5 disponibles");
});
test("acceso, configuración, clientes y diálogos cumplen comprobaciones axe", async ({
  page,
}) => {
  await page.goto("/");
  let scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.getByRole("button", { name: "Explorar demo" }).click();
  for (const name of ["Clientes", "Configuración"]) {
    await more(page, name);
    scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
  }
  await nav(page, "Inventario");
  await page
    .getByRole("button", { name: "Registrar movimiento", exact: true })
    .click();
  scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
});

test("saltar al contenido conserva la pantalla actual", async ({ page }) => {
  await enter(page);
  await nav(page, "Productos");
  await page.keyboard.press("Tab");
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Tus productos" }),
  ).toBeVisible();
  await expect(page.locator("#main-content")).toBeFocused();
});
test("configuración sin guardar se protege al navegar y cambiar sucursal", async ({
  page,
}) => {
  await enter(page);
  await more(page, "Configuración");
  await page.getByLabel("Nombre de empresa").fill("Borrador demo");
  page.once("dialog", (d) => d.dismiss());
  await nav(page, "Productos");
  await expect(page.getByLabel("Nombre de empresa")).toHaveValue(
    "Borrador demo",
  );
  page.once("dialog", (d) => d.dismiss());
  await page.getByLabel("Sucursal activa").selectOption("norte");
  await expect(page.getByLabel("Sucursal activa")).toHaveValue("centro");
  page.once("dialog", (d) => d.accept());
  await nav(page, "Productos");
  await expect(
    page.getByRole("heading", { name: "Tus productos" }),
  ).toBeVisible();
});
test("dos pestañas sincronizan ventas sin borrarlas al guardar configuración", async ({
  page,
  context,
}) => {
  await enter(page);
  const other = await context.newPage();
  await enter(other);
  await more(other, "Configuración");
  await nav(page, "Vender");
  await page
    .getByRole("button", { name: "Agregar Café de origen", exact: true })
    .click();
  await page.getByRole("button", { name: "Ver carrito", exact: false }).click();
  await page
    .getByRole("button", { name: "Simular venta", exact: true })
    .click();
  await other.getByLabel("Nombre de empresa").fill("Prueba dos pestañas");
  await other.getByRole("button", { name: "Guardar configuración" }).click();
  await page.reload();
  await nav(page, "Productos");
  await expect(page.getByTestId("product-cafe")).toContainText(
    "23 disponibles",
  );
  await other.close();
});

test("navegación activa conserva protección de cambios en configuración", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await enter(page);
  await nav(page, "Configuración");
  await page.getByLabel("Nombre de empresa").fill("Borrador que se conserva");
  await nav(page, "Configuración");
  page.once("dialog", (d) => d.dismiss());
  await nav(page, "Productos");
  await expect(page.getByLabel("Nombre de empresa")).toHaveValue(
    "Borrador que se conserva",
  );
});

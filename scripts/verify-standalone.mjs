import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, devices } from "@playwright/test";

const file = resolve("standalone/arvex-demo.html");
const html = await readFile(file, "utf8");
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  for (const mode of ["https-document"]) {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      deviceScaleFactor: 1,
    });
    const unexpected = [];
    const errors = [];
    const target = "https://arvex-demo.test/";
    await context.route("**/*", (route) => {
      if (route.request().url() === target) {
        return route.fulfill({
          status: 200,
          contentType: "text/html; charset=utf-8",
          body: html,
        });
      }
      unexpected.push(route.request().url());
      return route.abort();
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(target);
    await page.getByRole("button", { name: "Explorar demo" }).click();
    const nav = (name) =>
      page
        .getByRole("navigation", { name: "Navegación principal" })
        .getByRole("button", { name, exact: true })
        .click();
    await nav("Vender");
    await page
      .getByRole("button", { name: "Agregar Café de origen", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Ver carrito", exact: false })
      .click();
    assert.equal(
      await page.getByRole("dialog").getByTestId("cart-total").textContent(),
      "$185.00",
    );
    await page
      .getByRole("button", { name: "Simular venta", exact: true })
      .click();
    assert.equal(
      await page.getByRole("heading", { name: "Venta simulada" }).isVisible(),
      true,
    );
    await page
      .getByRole("button", { name: "Nueva venta", exact: true })
      .click();
    await nav("Productos");
    assert.match(
      await page.getByTestId("product-cafe").textContent(),
      /23 disponibles/,
    );
    await page.reload();
    assert.match(
      await page.getByTestId("product-cafe").textContent(),
      /23 disponibles/,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    assert.deepEqual(unexpected, []);
    assert.deepEqual(errors, []);
    console.log(
      `PASS ${mode}: acceso, venta, ticket, stock, recarga, móvil; cero recursos externos y errores JS.`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}

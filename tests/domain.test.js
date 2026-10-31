import test from "node:test";
import assert from "node:assert/strict";
import { createDemo, products } from "../src/data.js";
import {
  checkout,
  moveStock,
  cartTotal,
  salesFor,
  validateState,
} from "../src/domain.js";
const fixed = new Date("2026-10-30T12:00:00.000Z");
test("calcula importes en centavos y registra venta con existencias y movimiento", () => {
  const s = createDemo(fixed);
  const before = s.inventory.centro.cafe;
  const next = checkout(s, "centro", { cafe: 2, taza: 1 }, "mostrador", fixed);
  assert.equal(
    cartTotal({ cafe: 2, taza: 1 }),
    2 * products[0].price + products[1].price,
  );
  assert.equal(next.inventory.centro.cafe, before - 2);
  assert.equal(s.inventory.centro.cafe, before);
  assert.equal(next.sales.at(-1).total, cartTotal({ cafe: 2, taza: 1 }));
  assert.equal(next.movements.at(-1).delta, -1);
  assert.equal(next.sales.at(-1).customerId, "mostrador");
  assert.equal(next.inventory.norte.cafe, s.inventory.norte.cafe);
});
test("rechaza carrito vacío, productos desconocidos y cantidades inválidas", () => {
  const s = createDemo(fixed);
  for (const cart of [
    {},
    { cafe: 0 },
    { cafe: -1 },
    { cafe: 1.5 },
    { cafe: Infinity },
    { cafe: NaN },
    { noexiste: 1 },
  ])
    assert.throws(() => checkout(s, "centro", cart, "mostrador", fixed));
  assert.throws(() =>
    checkout(s, "desconocida", { cafe: 1 }, "mostrador", fixed),
  );
  assert.throws(() => checkout(s, "centro", { cafe: 1 }, "noexiste", fixed));
});
test("no vende más existencias ni modifica estado cuando falla", () => {
  const s = createDemo(fixed);
  const snapshot = JSON.stringify(s);
  assert.throws(
    () =>
      checkout(
        s,
        "centro",
        { cafe: s.inventory.centro.cafe + 1 },
        "mostrador",
        fixed,
      ),
    /existencias/i,
  );
  assert.equal(JSON.stringify(s), snapshot);
});
test("movimientos manuales respetan sucursal, saldo y cantidades enteras", () => {
  const s = createDemo(fixed);
  const n = moveStock(s, "centro", "cafe", 5, "Reposición demo", fixed);
  assert.equal(n.inventory.centro.cafe, s.inventory.centro.cafe + 5);
  assert.equal(n.inventory.norte.cafe, s.inventory.norte.cafe);
  assert.equal(n.movements.at(-1).delta, 5);
  assert.throws(
    () => moveStock(s, "centro", "cafe", -999, "Ajuste demo", fixed),
    /existencias/i,
  );
  for (const v of [0, 1.2, NaN])
    assert.throws(() => moveStock(s, "centro", "cafe", v, "Motivo", fixed));
  assert.throws(() => moveStock(s, "centro", "cafe", 1, "", fixed));
});
test("indicadores por sucursal y fecha derivan de las ventas reales", () => {
  const s = createDemo(fixed);
  const previous = salesFor(s, "centro", fixed);
  const n = checkout(s, "centro", { cafe: 1 }, "mostrador", fixed);
  assert.equal(salesFor(n, "centro", fixed).length, previous.length + 1);
  assert.equal(
    salesFor(n, "norte", fixed).length,
    salesFor(s, "norte", fixed).length,
  );
  assert.equal(n.sales.at(-1).total, products[0].price);
});
test("datos demo se reconcilian con todos los movimientos y soportan relectura", () => {
  const s = createDemo(fixed);
  assert.equal(validateState(JSON.parse(JSON.stringify(s))), true);
  assert.equal(validateState({ version: 1 }), false);
  for (const b of ["centro", "norte"])
    for (const p of products) {
      const balance = s.movements
        .filter((m) => m.branchId === b && m.productId === p.id)
        .reduce((a, m) => a + m.delta, 0);
      assert.equal(balance, s.inventory[b][p.id]);
    }
});

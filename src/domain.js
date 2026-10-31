import { products, customers } from "./data.js";
export const money = (cents) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(cents / 100);
export const dayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
export const productById = (id) => products.find((p) => p.id === id);
export function cartTotal(cart) {
  return Object.entries(cart).reduce((s, [id, q]) => {
    const p = productById(id);
    if (!p || !Number.isSafeInteger(q) || q < 1)
      throw new Error("Cantidad o producto inválido.");
    return s + p.price * q;
  }, 0);
}
export function salesFor(state, branchId, date) {
  return state.sales.filter(
    (s) => s.branchId === branchId && (!date || dayKey(s.at) === dayKey(date)),
  );
}
function checkBranch(state, branchId) {
  if (!["centro", "norte"].includes(branchId) || !state.inventory[branchId])
    throw new Error("Sucursal no válida.");
}
function id(prefix) {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}
export function checkout(state, branchId, cart, customerId, now = new Date()) {
  checkBranch(state, branchId);
  if (!Object.keys(cart).length)
    throw new Error("Agrega un producto antes de simular la venta.");
  if (!customers.some((c) => c.id === customerId))
    throw new Error("Cliente no válido.");
  const total = cartTotal(cart);
  for (const [pid, q] of Object.entries(cart))
    if (q > state.inventory[branchId][pid])
      throw new Error(
        `No hay existencias suficientes de ${productById(pid).name}.`,
      );
  const next = structuredClone(state);
  const saleId = id("DEMO");
  const items = Object.entries(cart).map(([productId, quantity]) => ({
    productId,
    quantity,
    price: productById(productId).price,
  }));
  next.sales.push({
    id: saleId,
    branchId,
    customerId,
    at: now.toISOString(),
    items,
    total,
  });
  for (const item of items) {
    next.inventory[branchId][item.productId] -= item.quantity;
    next.movements.push({
      id: id("MOV"),
      branchId,
      productId: item.productId,
      delta: -item.quantity,
      reason: `Venta ${saleId}`,
      at: now.toISOString(),
    });
  }
  return next;
}
export function moveStock(
  state,
  branchId,
  productId,
  delta,
  reason,
  now = new Date(),
) {
  checkBranch(state, branchId);
  if (
    !productById(productId) ||
    !Number.isSafeInteger(delta) ||
    delta === 0 ||
    Math.abs(delta) > 9999
  )
    throw new Error("Introduce una cantidad entera entre 1 y 9999.");
  if (!reason.trim() || reason.trim().length > 100)
    throw new Error("Indica un motivo de hasta 100 caracteres.");
  if (state.inventory[branchId][productId] + delta < 0)
    throw new Error("La salida supera las existencias disponibles.");
  const next = structuredClone(state);
  next.inventory[branchId][productId] += delta;
  next.movements.push({
    id: id("MOV"),
    branchId,
    productId,
    delta,
    reason: reason.trim(),
    at: now.toISOString(),
  });
  return next;
}
export function validateState(s) {
  try {
    if (
      s.version !== 1 ||
      typeof s.company !== "string" ||
      s.company.length > 80 ||
      !Array.isArray(s.sales) ||
      !Array.isArray(s.movements)
    )
      return false;
    for (const b of ["centro", "norte"]) {
      if (typeof s.branchNames[b] !== "string" || s.branchNames[b].length > 60)
        return false;
      for (const p of products)
        if (
          !Number.isSafeInteger(s.inventory[b][p.id]) ||
          s.inventory[b][p.id] < 0
        )
          return false;
    }
    for (const sale of s.sales)
      if (
        !sale.id ||
        !["centro", "norte"].includes(sale.branchId) ||
        !customers.some((c) => c.id === sale.customerId) ||
        !Number.isFinite(Date.parse(sale.at)) ||
        !sale.items.length ||
        sale.items.some(
          (i) =>
            !productById(i.productId) ||
            !Number.isSafeInteger(i.quantity) ||
            i.quantity < 1 ||
            i.price !== productById(i.productId).price,
        ) ||
        sale.total !== sale.items.reduce((a, i) => a + i.quantity * i.price, 0)
      )
        return false;
    for (const m of s.movements)
      if (
        !["centro", "norte"].includes(m.branchId) ||
        !productById(m.productId) ||
        !Number.isSafeInteger(m.delta) ||
        typeof m.reason !== "string" ||
        !Number.isFinite(Date.parse(m.at))
      )
        return false;
    for (const b of ["centro", "norte"])
      for (const p of products)
        if (
          s.movements
            .filter((m) => m.branchId === b && m.productId === p.id)
            .reduce((a, m) => a + m.delta, 0) !== s.inventory[b][p.id]
        )
          return false;
    return true;
  } catch {
    return false;
  }
}

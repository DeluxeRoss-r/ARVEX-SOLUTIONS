import React, { useState } from "react";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Filter,
} from "lucide-react";
import { products } from "./data.js";
import { moveStock } from "./domain.js";
import {
  PageHead,
  Button,
  Modal,
  Movements,
  ProductArt,
  Stock,
} from "./components.jsx";
export default function Inventory({ state, setState, branchId, notify }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("entrada");
  const [product, setProduct] = useState("cafe");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("todos");
  const stock = state.inventory[branchId];
  const movements = state.movements.filter(
    (m) =>
      m.branchId === branchId &&
      (filter === "todos" ||
        (filter === "entradas" ? m.delta > 0 : m.delta < 0)),
  );
  function save(e) {
    e.preventDefault();
    try {
      if (
        setState(
          moveStock(
            state,
            branchId,
            product,
            Number(quantity) * (type === "entrada" ? 1 : -1),
            reason,
          ),
        ) === false
      )
        return;
      setOpen(false);
      notify("Movimiento registrado. Existencias actualizadas.");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <>
      <PageHead
        title="Inventario"
        description="Cada entrada y salida, en su lugar."
      >
        <Button
          onClick={() => {
            setOpen(true);
            setReason("");
            setQuantity("1");
            setError("");
          }}
        >
          <Plus size={18} /> Registrar movimiento
        </Button>
      </PageHead>
      <div className="inventory-summary">
        <div>
          <span>Existencias actuales</span>
          <strong>
            {Object.values(stock).reduce((a, n) => a + n, 0)}{" "}
            <small>unidades</small>
          </strong>
        </div>
        <div>
          <span>Con stock bajo</span>
          <strong>
            {
              products.filter((p) => stock[p.id] > 0 && stock[p.id] <= p.min)
                .length
            }{" "}
            <small>productos</small>
          </strong>
        </div>
        <div>
          <span>Sin existencias</span>
          <strong>
            {products.filter((p) => stock[p.id] === 0).length}{" "}
            <small>productos</small>
          </strong>
        </div>
      </div>
      <div className="inventory-layout">
        <section className="panel">
          <div className="section-head">
            <h2>Movimientos</h2>
            <select
              aria-label="Filtrar movimientos"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="entradas">Entradas</option>
              <option value="salidas">Salidas</option>
            </select>
          </div>
          <p className="panel-note">
            Últimos 20 movimientos simulados de la sucursal
          </p>
          <Movements movements={movements} limit={20} />
          {!movements.length && (
            <p className="panel-note">No hay movimientos con este filtro.</p>
          )}
        </section>
        <section className="panel stock-panel">
          <div className="section-head">
            <h2>Existencias por producto</h2>
            <Package size={19} />
          </div>
          {products.map((p) => (
            <div className="attention-row" key={p.id}>
              <ProductArt product={p} small />
              <div>
                <strong>{p.name}</strong>
                <Stock count={stock[p.id]} min={p.min} />
              </div>
            </div>
          ))}
          <p className="panel-note stock-note">
            Los avisos usan el mínimo demo definido para cada producto.
          </p>
        </section>
      </div>
      {open && (
        <Modal title="Registrar movimiento" onClose={() => setOpen(false)}>
          <form onSubmit={save} className="form-stack">
            <p className="form-intro">
              Ajusta las existencias de {state.branchNames[branchId]}. Solo
              afecta esta demo.
            </p>
            <label className="field">
              Tipo de movimiento
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </label>
            <label className="field">
              Producto del movimiento
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {stock[p.id]} disponibles
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Cantidad del movimiento
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="9999"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <label className="field">
              Motivo
              <input
                required
                maxLength={100}
                placeholder="Ej. Reposición de mercancía demo"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="full-width">
              Guardar movimiento
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}

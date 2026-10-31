import React, { useRef, useState } from "react";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Check,
  CheckCheck,
  ReceiptText,
} from "lucide-react";
import { products, customers } from "./data.js";
import { checkout, cartTotal, money, productById } from "./domain.js";
import {
  PageHead,
  Button,
  ProductArt,
  Stock,
  Empty,
  Modal,
} from "./components.jsx";
import { ProductFilters, useProductFilter } from "./Catalog.jsx";
function Cart({
  cart,
  update,
  stock,
  customer,
  setCustomer,
  onCheckout,
  error,
}) {
  const entries = Object.entries(cart);
  const total = cartTotal(cart);
  return (
    <div className="cart-content">
      <label className="field">
        Cliente
        <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
          {customers.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="cart-lines">
        {!entries.length ? (
          <Empty title="Tu carrito está listo">
            Agrega productos para empezar una venta demo.
          </Empty>
        ) : (
          entries.map(([pid, q]) => {
            const p = productById(pid);
            return (
              <div className="cart-item" key={pid}>
                <div className="cart-item-top">
                  <ProductArt product={p} small />
                  <div>
                    <strong>{p.name}</strong>
                    <span>{money(p.price)} c/u</span>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Quitar ${p.name}`}
                    onClick={() => update(pid, 0)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="cart-item-bottom">
                  <div className="stepper">
                    <button
                      aria-label={`Disminuir ${p.name}`}
                      onClick={() => update(pid, q - 1)}
                    >
                      <Minus size={15} />
                    </button>
                    <span aria-label={`Cantidad de ${p.name}`}>{q}</span>
                    <button
                      aria-label={`Aumentar ${p.name}`}
                      disabled={q >= stock[pid]}
                      onClick={() => update(pid, q + 1)}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <strong>{money(p.price * q)}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="cart-summary">
        <div>
          <span>Subtotal</span>
          <span>{money(total)}</span>
        </div>
        <div>
          <span>Cargos adicionales</span>
          <span>{money(0)}</span>
        </div>
        <div className="cart-total">
          <strong>Total demo</strong>
          <strong data-testid="cart-total">{money(total)}</strong>
        </div>
        <p>No se calculan impuestos ni se procesa un pago.</p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <Button
          className="checkout"
          disabled={!entries.length}
          onClick={onCheckout}
        >
          Simular venta <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
export default function PointOfSale({
  state,
  setState,
  branchId,
  cart,
  setCart,
  notify,
}) {
  const filter = useProductFilter();
  const stock = state.inventory[branchId];
  const [customer, setCustomer] = useState("mostrador");
  const [showCart, setShowCart] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const selling = useRef(false);
  const count = Object.values(cart).reduce((a, q) => a + q, 0);
  function update(pid, q) {
    if (q > stock[pid]) {
      notify("No hay más existencias disponibles.");
      return;
    }
    setCart((prev) => {
      const next = { ...prev };
      if (q <= 0) delete next[pid];
      else next[pid] = q;
      return next;
    });
    setError("");
  }
  function sell() {
    if (selling.current) return;
    selling.current = true;
    try {
      const next = checkout(state, branchId, cart, customer);
      if (setState(next) === false) return;
      setReceipt(next.sales.at(-1));
      setCart({});
      setShowCart(false);
      setError("");
      notify("Venta demo registrada. Inventario actualizado.");
    } catch (e) {
      setError(e.message);
    } finally {
      setTimeout(() => {
        selling.current = false;
      }, 300);
    }
  }
  const cartProps = {
    cart,
    update,
    stock,
    customer,
    setCustomer,
    onCheckout: sell,
    error,
  };
  return (
    <>
      <PageHead
        title="Punto de venta"
        description="Una venta sencilla, de principio a fin."
      >
        <span className="demo-badge">
          <span /> Sin cobros reales
        </span>
      </PageHead>
      <div className="pos-layout">
        <section className="pos-products" aria-label="Productos para vender">
          <ProductFilters filter={filter} />
          <div className="pos-grid">
            {filter.filtered.map((p) => (
              <article className="pos-product" key={p.id}>
                <ProductArt product={p} />
                <div className="pos-product-info">
                  <h2>{p.name}</h2>
                  <span>{p.detail}</span>
                  <Stock count={stock[p.id]} min={p.min} />
                  <div className="pos-price">
                    <strong>{money(p.price)}</strong>
                    <button
                      className="add-product"
                      aria-label={`Agregar ${p.name}`}
                      disabled={
                        stock[p.id] === 0 || (cart[p.id] || 0) >= stock[p.id]
                      }
                      onClick={() => update(p.id, (cart[p.id] || 0) + 1)}
                    >
                      <Plus size={19} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!filter.filtered.length && (
            <Empty title="No encontramos productos">
              Prueba otro nombre o categoría.
            </Empty>
          )}
        </section>
        <aside className="desktop-cart panel" aria-label="Carrito de venta">
          <div className="section-head">
            <h2>Venta actual</h2>
            <span className="count-pill">{count}</span>
          </div>
          <Cart {...cartProps} />
        </aside>
      </div>
      <button
        id="cart-trigger"
        className="mobile-cart-button"
        onClick={() => setShowCart(true)}
        aria-label={`Ver carrito (${count} productos)`}
      >
        <span>
          <ShoppingBag size={20} />
          Ver carrito <b>{count}</b>
        </span>
        <strong>
          {money(cartTotal(cart))} <ArrowRight size={18} />
        </strong>
      </button>
      {showCart && (
        <Modal
          returnFocus="#cart-trigger"
          title="Venta actual"
          onClose={() => setShowCart(false)}
        >
          <Cart {...cartProps} />
        </Modal>
      )}
      {receipt && (
        <Modal title="Venta simulada" onClose={() => setReceipt(null)}>
          <div className="receipt">
            <span className="receipt-check">
              <Check size={30} />
            </span>
            <h3>Todo listo.</h3>
            <p>La venta quedó registrada en tu demo.</p>
            <div className="receipt-id">
              {receipt.id.slice(0, 18).toUpperCase()}
            </div>
            <div className="receipt-rows">
              {receipt.items.map((i) => (
                <div key={i.productId}>
                  <span>
                    {i.quantity} × {productById(i.productId).name}
                  </span>
                  <strong>{money(i.price * i.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="receipt-total">
              <span>Total simulado</span>
              <strong>{money(receipt.total)}</strong>
            </div>
            <p className="receipt-disclaimer">
              Sin cobro real. Sin valor fiscal.
            </p>
            <Button className="full-width" onClick={() => setReceipt(null)}>
              Nueva venta <Plus size={18} />
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

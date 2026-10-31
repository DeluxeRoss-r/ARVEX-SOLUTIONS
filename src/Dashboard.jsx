import React, { useState } from "react";
import {
  ArrowRight,
  Plus,
  ArrowUpRight,
  AlertCircle,
  ShoppingBag,
  Box,
  Users,
  ChevronRight,
} from "lucide-react";
import { products, customers } from "./data.js";
import { money, salesFor } from "./domain.js";
import {
  Button,
  PageHead,
  SalesChart,
  ProductArt,
  Stock,
} from "./components.jsx";
export default function Dashboard({ state, branchId, navigate }) {
  const [days, setDays] = useState(7);
  const sales = salesFor(state, branchId);
  const today = salesFor(state, branchId, new Date());
  const total = today.reduce((a, s) => a + s.total, 0);
  const stock = state.inventory[branchId];
  const low = products.filter((p) => stock[p.id] <= p.min);
  const top = products
    .map((p) => ({
      ...p,
      quantity: sales.reduce(
        (n, s) =>
          n +
          s.items
            .filter((i) => i.productId === p.id)
            .reduce((v, i) => v + i.quantity, 0),
        0,
      ),
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);
  const categories = [...new Set(products.map((p) => p.category))].map(
    (name) => ({
      name,
      total: sales.reduce(
        (sum, sale) =>
          sum +
          sale.items
            .filter(
              (i) =>
                products.find((p) => p.id === i.productId).category === name,
            )
            .reduce((a, i) => a + i.quantity * i.price, 0),
        0,
      ),
    }),
  );
  const categoryTotal = categories.reduce((sum, c) => sum + c.total, 0);
  const recent = [...sales]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 4);
  return (
    <>
      <PageHead
        title="Todo bajo control"
        description="Tu operación, de un vistazo. Datos de demostración."
      >
        <Button onClick={() => navigate("vender")}>
          <Plus size={18} /> Nueva venta
        </Button>
      </PageHead>
      <section className="metrics" aria-label="Indicadores de hoy">
        <div className="metric main-metric">
          <span>Ventas de hoy</span>
          <strong>{money(total)}</strong>
          <small>
            <span className="live-dot" /> {today.length} ventas simuladas · MXN
          </small>
        </div>
        <div className="metric">
          <span>Ticket promedio</span>
          <strong>
            {money(today.length ? Math.round(total / today.length) : 0)}
          </strong>
          <small>Por venta de hoy</small>
        </div>
        <div className="metric">
          <span>Unidades disponibles</span>
          <strong>
            {Object.values(stock).reduce((a, n) => a + n, 0)}
            <em> unid.</em>
          </strong>
          <small>{products.length} productos en catálogo</small>
        </div>
        <div className="metric">
          <span>Stock por revisar</span>
          <strong>
            {low.length}
            <em> productos</em>
          </strong>
          <button className="text-link" onClick={() => navigate("inventario")}>
            Ver inventario <ArrowUpRight size={14} />
          </button>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel sales-panel">
          <div className="section-head">
            <div>
              <h2>Ritmo de ventas</h2>
              <p>Importes de ventas simuladas · MXN</p>
            </div>
            <select
              aria-label="Periodo de ventas"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>7 días</option>
              <option value={3}>3 días</option>
            </select>
          </div>
          <SalesChart sales={sales} days={days} />
          <div className="chart-foot">
            <span>
              <i /> Ventas de la sucursal
            </span>
            <span>Hoy en azul</span>
          </div>
        </section>
        <section className="panel attention-panel">
          <div className="section-head">
            <h2>Necesitan atención</h2>
            <span className="count-pill">{low.length}</span>
          </div>
          <p className="panel-note">Mantén tus favoritos disponibles.</p>
          <div>
            {low.slice(0, 3).map((p) => (
              <div className="attention-row" key={p.id}>
                <ProductArt product={p} small />
                <div>
                  <strong>{p.name}</strong>
                  <Stock count={stock[p.id]} min={p.min} />
                </div>
                <AlertCircle size={17} className="warning-icon" />
              </div>
            ))}
          </div>
          <button className="panel-link" onClick={() => navigate("inventario")}>
            Revisar existencias <ArrowRight size={16} />
          </button>
        </section>
        <section className="panel recent-panel">
          <div className="section-head">
            <div>
              <h2>Ventas recientes</h2>
              <p>La actividad más reciente de esta sucursal</p>
            </div>
            <span className="subtle-icon">
              <ShoppingBag size={20} />
            </span>
          </div>
          <div className="sale-table">
            <div className="sale-table-head">
              <span>Venta / cliente</span>
              <span>Importe</span>
            </div>
            {recent.map((s) => (
              <div className="sale-row" key={s.id}>
                <div className="sale-id">
                  <span className="avatar small-avatar">
                    {customers.find((c) => c.id === s.customerId)?.initials}
                  </span>
                  <div>
                    <strong>
                      {customers.find((c) => c.id === s.customerId)?.name}
                    </strong>
                    <span>
                      {new Intl.DateTimeFormat("es-MX", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(s.at))}
                    </span>
                  </div>
                </div>
                <div className="sale-amount">
                  <strong>{money(s.total)}</strong>
                  <span>Simulada</span>
                </div>
              </div>
            ))}
          </div>
          {!recent.length && (
            <p className="panel-note">
              Aún no hay ventas. Tu siguiente venta aparecerá aquí.
            </p>
          )}
        </section>
        <section className="panel top-panel">
          <div className="section-head">
            <h2>Los más vendidos</h2>
            <Box size={19} className="subtle-icon" />
          </div>
          <p className="panel-note">Unidades · últimos 7 días y sesión demo</p>
          {top.map((p) => (
            <div className="top-row" key={p.id}>
              <ProductArt product={p} small />
              <div>
                <strong>{p.name}</strong>
                <span>{p.category}</span>
              </div>
              <b>
                {p.quantity}
                <small>unid.</small>
              </b>
            </div>
          ))}
          <button className="panel-link" onClick={() => navigate("productos")}>
            Explorar productos <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <section
        className="panel category-panel"
        aria-label="Ventas por categoría"
      >
        <div className="section-head">
          <div>
            <h2>Ventas por categoría</h2>
            <p>Historial de esta demo · {money(categoryTotal)} en total</p>
          </div>
        </div>
        <div className="category-chart">
          {categories.map((c) => (
            <div className="category-chart-row" key={c.name}>
              <div>
                <span>{c.name}</span>
                <strong>{money(c.total)}</strong>
              </div>
              <div className="category-track">
                <span
                  style={{
                    width: `${categoryTotal ? (c.total / categoryTotal) * 100 : 0}%`,
                  }}
                />
              </div>
              <small>
                {categoryTotal
                  ? Math.round((c.total / categoryTotal) * 100)
                  : 0}
                % del importe
              </small>
            </div>
          ))}
        </div>
      </section>
      <div className="demo-footnote">
        <span className="demo-dot" /> Estás en un entorno demo. Explora con
        tranquilidad: nada de lo que hagas genera un cobro.
      </div>
    </>
  );
}

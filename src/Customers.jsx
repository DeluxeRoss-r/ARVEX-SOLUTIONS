import React, { useState } from "react";
import { ArrowUpRight, Users, ChevronRight } from "lucide-react";
import { customers } from "./data.js";
import { salesFor, money } from "./domain.js";
import { PageHead, SearchField, Empty, Modal } from "./components.jsx";
export default function Customers({ state, branchId }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const sales = salesFor(state, branchId);
  const stats = (id) => {
    const list = sales.filter((s) => s.customerId === id);
    return {
      count: list.length,
      total: list.reduce((a, s) => a + s.total, 0),
      list: [...list].sort((a, b) => b.at.localeCompare(a.at)),
    };
  };
  const list = customers.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <PageHead
        title="Clientes"
        description="Conoce a quienes hacen crecer tu negocio."
      />
      <div className="customer-intro">
        <Users size={21} />
        <p>
          <strong>{customers.length} perfiles ficticios</strong>
          <span>
            Los nombres son ejemplos. No ingreses datos personales reales.
          </span>
        </p>
      </div>
      <SearchField
        value={query}
        onChange={setQuery}
        label="Buscar clientes"
        placeholder="Buscar un cliente demo…"
      />
      <div className="customer-list panel">
        {list.map((c) => {
          const s = stats(c.id);
          return (
            <button
              className="customer-row"
              key={c.id}
              aria-label={`Ver ${c.name}`}
              onClick={() => setSelected(c)}
            >
              <span className={`avatar ${c.color}`}>{c.initials}</span>
              <span className="customer-name">
                <strong>{c.name}</strong>
                <span>{c.type}</span>
              </span>
              <span className="customer-stat">
                <strong>{money(s.total)}</strong>
                <span>{s.count} compras demo</span>
              </span>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>
      {!list.length && (
        <Empty title="No encontramos clientes">Prueba otro nombre.</Empty>
      )}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="customer-detail">
            <span className={`avatar big-avatar ${selected.color}`}>
              {selected.initials}
            </span>
            <p>{selected.type} · Perfil de demostración</p>
            <div className="customer-summary">
              <span>{stats(selected.id).count} compras</span>
              <strong>{money(stats(selected.id).total)}</strong>
            </div>
            <h3>Historial de compras</h3>
            {stats(selected.id).list.map((s) => (
              <div className="history-row" key={s.id}>
                <span>
                  {new Intl.DateTimeFormat("es-MX", {
                    day: "numeric",
                    month: "long",
                  }).format(new Date(s.at))}
                </span>
                <strong>{money(s.total)}</strong>
              </div>
            ))}
            {!stats(selected.id).count && (
              <p>Aún no tiene compras en esta sucursal.</p>
            )}
            <p className="form-intro">
              Solo se muestra la actividad de {state.branchNames[branchId]}.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}

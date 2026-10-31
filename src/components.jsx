import React, { useEffect, useRef } from "react";
import { X, Search, Package, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { money, productById } from "./domain.js";
export function Brand() {
  return (
    <span className="brand">
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path
          d="M6 29 18 6l12 23M12 21h12"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        arvex<span className="brand-dot">.</span>
      </span>
    </span>
  );
}
export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function SearchField({ value, onChange, label, placeholder }) {
  return (
    <div className="search-field">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="icon-button"
          aria-label={`Limpiar ${label.toLowerCase()}`}
          onClick={() => onChange("")}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
export function PageHead({ title, description, children }) {
  return (
    <div className="page-head">
      <div>
        <h1 tabIndex={-1} id="page-title">
          {title}
        </h1>
        <p>{description}</p>
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}
export function ProductArt({ product, small = false }) {
  return (
    <span
      className={`product-art ${product.color} ${small ? "small" : ""}`}
      aria-hidden="true"
    >
      <span className={`object ${product.shape}`}>
        <i />
        <b />
      </span>
    </span>
  );
}
export function Stock({ count, min }) {
  return (
    <span
      className={`stock ${count === 0 ? "out" : count <= min ? "low" : ""}`}
    >
      <span aria-hidden="true" />
      {count === 0 ? "Agotado" : `${count} disponibles`}
    </span>
  );
}
export function Empty({ title, children }) {
  return (
    <div className="empty">
      <Package size={28} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Modal({ title, onClose, children, wide = false, returnFocus }) {
  const ref = useRef();
  useEffect(() => {
    const node = ref.current;
    node.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = old;
      if (returnFocus)
        queueMicrotask(() =>
          document.querySelector(returnFocus)?.focus({ preventScroll: true }),
        );
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function Movements({ movements, limit = 10 }) {
  return (
    <div className="movement-list">
      {movements
        .slice(-limit)
        .reverse()
        .map((m) => (
          <div className="movement" key={m.id}>
            <span className={`movement-icon ${m.delta > 0 ? "in" : ""}`}>
              {m.delta > 0 ? (
                <ArrowDownLeft size={18} />
              ) : (
                <ArrowUpRight size={18} />
              )}
            </span>
            <div className="movement-info">
              <strong>{productById(m.productId).name}</strong>
              <span>
                {m.reason.startsWith("Venta") ? "Venta demo" : m.reason} ·{" "}
                {new Intl.DateTimeFormat("es-MX", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(m.at))}
              </span>
            </div>
            <span className="movement-count">
              {m.delta > 0 ? "+" : ""}
              {m.delta}
              <small>unid.</small>
            </span>
          </div>
        ))}
    </div>
  );
}
export function SalesChart({ sales, days = 7 }) {
  const rows = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const key = date.toLocaleDateString();
    return {
      day: new Intl.DateTimeFormat("es-MX", { weekday: "short" })
        .format(date)
        .replace(".", ""),
      total: sales
        .filter((s) => new Date(s.at).toLocaleDateString() === key)
        .reduce((n, s) => n + s.total, 0),
    };
  });
  const max = Math.max(...rows.map((d) => d.total), 10000);
  const ceil = Math.ceil(max / 50000) * 50000;
  const height = 150;
  const width = 560;
  const left = 62;
  const right = 18;
  const barWidth = (width - left - right) / days;
  return (
    <div className="chart-wrap">
      <svg
        viewBox="0 0 560 220"
        className="sales-chart"
        role="img"
        aria-label={`Ventas demo de los últimos ${days} días. Total ${money(rows.reduce((n, r) => n + r.total, 0))}`}
      >
        <title>Ventas por día en MXN</title>
        <desc>{rows.map((r) => `${r.day}: ${money(r.total)}`).join("; ")}</desc>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line
              x1={left}
              x2="545"
              y1={15 + height * (1 - t)}
              y2={15 + height * (1 - t)}
              stroke="#e7ebf0"
              strokeDasharray={t ? "3 5" : undefined}
            />
            <text
              x="48"
              y={19 + height * (1 - t)}
              textAnchor="end"
              fill="#667085"
              fontSize="11"
            >
              ${Math.round((ceil * t) / 100)}
            </text>
          </g>
        ))}
        {rows.map((r, i) => (
          <g key={i}>
            <rect
              x={left + i * barWidth + barWidth * 0.22}
              y={15 + height * (1 - r.total / ceil)}
              width={barWidth * 0.56}
              height={Math.max((r.total / ceil) * height, 1)}
              rx="4"
              fill={i === days - 1 ? "#1d5fbf" : "#b4c9e5"}
            />
            <text
              x={left + i * barWidth + barWidth / 2}
              y="192"
              textAnchor="middle"
              fontSize="12"
              fill={i === days - 1 ? "#172436" : "#667085"}
            >
              {i === days - 1 ? "Hoy" : r.day}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Plus, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import { products } from "./data.js";
import { money } from "./domain.js";
import {
  PageHead,
  SearchField,
  ProductArt,
  Stock,
  Button,
  Empty,
} from "./components.jsx";
export function useProductFilter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "Todos" || p.category === category) &&
          `${p.name} ${p.sku} ${p.detail}`
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .includes(
              query
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .toLowerCase()
                .trim(),
            ),
      ),
    [query, category],
  );
  return { query, setQuery, category, setCategory, filtered };
}
export function ProductFilters({ filter, extra }) {
  return (
    <div className="catalog-tools">
      <div className="search-row">
        <SearchField
          value={filter.query}
          onChange={filter.setQuery}
          label="Buscar productos"
          placeholder="Buscar por nombre o código…"
        />
        {extra}
      </div>
      <div className="category-tabs" role="group" aria-label="Categorías">
        {["Todos", "Café y té", "Hogar", "Papelería"].map((c) => (
          <button
            key={c}
            onClick={() => filter.setCategory(c)}
            className={filter.category === c ? "selected" : ""}
            aria-pressed={filter.category === c}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
export default function Catalog({ state, branchId, navigate }) {
  const filter = useProductFilter();
  const [onlyLow, setOnlyLow] = useState(false);
  const stock = state.inventory[branchId];
  const items = filter.filtered.filter((p) => !onlyLow || stock[p.id] <= p.min);
  return (
    <>
      <PageHead
        title="Tus productos"
        description={`${products.length} productos para el día a día de tu negocio.`}
      >
        <Button onClick={() => navigate("vender")}>
          <Plus size={18} /> Vender productos
        </Button>
      </PageHead>
      <ProductFilters
        filter={filter}
        extra={
          <button
            className={`filter-toggle ${onlyLow ? "selected" : ""}`}
            aria-label="Solo stock bajo"
            aria-pressed={onlyLow}
            onClick={() => setOnlyLow(!onlyLow)}
          >
            <SlidersHorizontal size={18} />
            <span>Stock bajo</span>
          </button>
        }
      />
      <div className="result-label">
        <span>{items.length} productos</span>
        <span>Precios en MXN</span>
      </div>
      <div className="product-grid">
        {items.map((p) => (
          <article
            className="product-card"
            key={p.id}
            data-testid={`product-${p.id}`}
          >
            <div className="product-visual">
              <ProductArt product={p} />
              <span className="sku">{p.sku}</span>
            </div>
            <div className="product-info">
              <span className="product-category">{p.category}</span>
              <h2>{p.name}</h2>
              <p>{p.detail}</p>
              <div className="product-bottom">
                <strong>{money(p.price)}</strong>
                <Stock count={stock[p.id]} min={p.min} />
              </div>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <Empty title="No encontramos productos">
          Prueba otro nombre, código o categoría.
        </Empty>
      )}
    </>
  );
}

export const products = [
  {
    id: "cafe",
    name: "Café de origen",
    detail: "Tueste medio · 250 g",
    sku: "CAF-001",
    category: "Café y té",
    price: 18500,
    min: 10,
    color: "coffee",
    shape: "bag",
  },
  {
    id: "taza",
    name: "Taza de cerámica",
    detail: "Arena · 350 ml",
    sku: "HOG-002",
    category: "Hogar",
    price: 14900,
    min: 8,
    color: "sand",
    shape: "cup",
  },
  {
    id: "libreta",
    name: "Libreta esencial",
    detail: "Papel punteado · A5",
    sku: "PAP-003",
    category: "Papelería",
    price: 8900,
    min: 10,
    color: "blue",
    shape: "book",
  },
  {
    id: "te",
    name: "Té de manzanilla",
    detail: "Infusión · 20 sobres",
    sku: "CAF-004",
    category: "Café y té",
    price: 7500,
    min: 8,
    color: "sage",
    shape: "box",
  },
  {
    id: "termo",
    name: "Termo de acero",
    detail: "Grafito · 500 ml",
    sku: "HOG-005",
    category: "Hogar",
    price: 32900,
    min: 5,
    color: "slate",
    shape: "bottle",
  },
  {
    id: "pluma",
    name: "Bolígrafo fino",
    detail: "Tinta negra · 0.5 mm",
    sku: "PAP-006",
    category: "Papelería",
    price: 3500,
    min: 15,
    color: "peach",
    shape: "pen",
  },
  {
    id: "vela",
    name: "Vela de cedro",
    detail: "Cera vegetal · 180 g",
    sku: "HOG-007",
    category: "Hogar",
    price: 21900,
    min: 6,
    color: "rose",
    shape: "candle",
  },
  {
    id: "filtro",
    name: "Filtros de café",
    detail: "Papel natural · 40 piezas",
    sku: "CAF-008",
    category: "Café y té",
    price: 6500,
    min: 10,
    color: "cream",
    shape: "filter",
  },
];
export const customers = [
  {
    id: "mostrador",
    name: "Público general",
    type: "Venta de mostrador",
    initials: "PG",
    color: "slate",
  },
  {
    id: "estudio",
    name: "Estudio Nube · Demo",
    type: "Negocio ficticio",
    initials: "EN",
    color: "blue",
  },
  {
    id: "taller",
    name: "Taller Olivo · Demo",
    type: "Negocio ficticio",
    initials: "TO",
    color: "sage",
  },
  {
    id: "casa",
    name: "Casa Bruma · Demo",
    type: "Negocio ficticio",
    initials: "CB",
    color: "rose",
  },
  {
    id: "oficina",
    name: "Oficina Lino · Demo",
    type: "Negocio ficticio",
    initials: "OL",
    color: "sand",
  },
];
export function createDemo(now = new Date()) {
  const inventory = {
    centro: {
      cafe: 24,
      taza: 18,
      libreta: 32,
      te: 7,
      termo: 9,
      pluma: 46,
      vela: 4,
      filtro: 0,
    },
    norte: {
      cafe: 16,
      taza: 5,
      libreta: 22,
      te: 14,
      termo: 6,
      pluma: 28,
      vela: 12,
      filtro: 18,
    },
  };
  const sales = [];
  const movements = [];
  for (let day = 6; day >= 0; day--)
    for (const [bi, branchId] of ["centro", "norte"].entries()) {
      for (let j = 0; j < 2 + (day % 3); j++) {
        const p = products[(day + j + bi) % 7];
        const q = 1 + ((day + j) % 2);
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(
          day === 0 ? Math.max(0, now.getHours() - 2 + j) : 9 + j * 2,
          day === 0 ? Math.max(0, now.getMinutes() - 5) : 15,
          0,
          0,
        );
        const sale = {
          id: `D-${branchId === "centro" ? "C" : "N"}-${day}${j}`,
          branchId,
          customerId: customers[(day + j) % customers.length].id,
          at: date.toISOString(),
          items: [{ productId: p.id, quantity: q, price: p.price }],
          total: p.price * q,
        };
        sales.push(sale);
        movements.push({
          id: `M-${sale.id}`,
          branchId,
          productId: p.id,
          delta: -q,
          reason: `Venta ${sale.id}`,
          at: sale.at,
        });
      }
    }
  const opening = [];
  for (const branchId of ["centro", "norte"])
    for (const p of products) {
      const sold = movements
        .filter((m) => m.branchId === branchId && m.productId === p.id)
        .reduce((s, m) => s - m.delta, 0);
      const date = new Date(now);
      date.setDate(date.getDate() - 7);
      date.setHours(8, 0, 0, 0);
      opening.push({
        id: `OPEN-${branchId}-${p.id}`,
        branchId,
        productId: p.id,
        delta: inventory[branchId][p.id] + sold,
        reason: "Existencia inicial demo",
        at: date.toISOString(),
      });
    }
  return {
    version: 1,
    company: "Casa Norte · Demo",
    branchNames: { centro: "Sucursal Centro", norte: "Sucursal Norte" },
    inventory,
    sales,
    movements: [...opening, ...movements].sort((a, b) =>
      a.at.localeCompare(b.at),
    ),
  };
}

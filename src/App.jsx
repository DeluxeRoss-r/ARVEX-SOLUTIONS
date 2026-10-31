import React, { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowLeftRight,
  Users,
  Settings as SettingsIcon,
  MoreHorizontal,
  LogOut,
  ChevronDown,
  MapPin,
  ArrowRight,
  Check,
  ShieldCheck,
  Building2,
  PanelLeftClose,
  X,
  Menu,
} from "lucide-react";
import { Brand, Button, Modal } from "./components.jsx";
import { useDemo } from "./useDemo.js";
import { money, salesFor } from "./domain.js";
import Dashboard from "./Dashboard.jsx";
import Catalog from "./Catalog.jsx";
import PointOfSale from "./PointOfSale.jsx";
import Inventory from "./Inventory.jsx";
import Customers from "./Customers.jsx";
import Settings from "./Settings.jsx";
const pages = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "productos", label: "Productos", icon: Package },
  { id: "vender", label: "Vender", icon: ShoppingBag },
  { id: "inventario", label: "Inventario", icon: ArrowLeftRight },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "configuracion", label: "Configuración", icon: SettingsIcon },
];
function readSession() {
  try {
    return sessionStorage.getItem("arvex-demo-access") === "yes";
  } catch {
    return false;
  }
}
function initialPage() {
  const hash = location.hash.slice(1);
  return pages.some((p) => p.id === hash) ? hash : "resumen";
}
export default function App() {
  const [state, setState, storageError] = useDemo();
  const [entered, setEntered] = useState(readSession);
  const [page, setPage] = useState(initialPage);
  const [branchId, setBranchId] = useState(() => {
    try {
      return sessionStorage.getItem("arvex-demo-branch") === "norte"
        ? "norte"
        : "centro";
    } catch {
      return "centro";
    }
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const [cart, setCart] = useState({});
  const [status, setStatus] = useState("");
  const toast = useRef();
  const settingsDirty = useRef(false);
  const pageRef = useRef(page);
  pageRef.current = page;
  const canLeaveSettings = () =>
    !settingsDirty.current ||
    window.confirm(
      "Tienes cambios de configuración sin guardar. ¿Descartarlos y continuar?",
    );
  function notify(message) {
    setStatus(message);
    clearTimeout(toast.current);
    toast.current = setTimeout(() => setStatus(""), 5000);
  }
  useEffect(() => () => clearTimeout(toast.current), []);
  useEffect(() => {
    const warn = (event) => {
      if (settingsDirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    const onHash = () => {
      const next = initialPage();
      if (next === pageRef.current) return;
      if (!canLeaveSettings()) {
        history.replaceState(null, "", `#${pageRef.current}`);
        return;
      }
      settingsDirty.current = false;
      setPage(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  function navigate(id) {
    if (id === page) {
      setMoreOpen(false);
      return;
    }
    if (id !== page && !canLeaveSettings()) return;
    settingsDirty.current = false;
    setPage(id);
    location.hash = id;
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() =>
      document.getElementById("page-title")?.focus({ preventScroll: true }),
    );
  }
  function changeBranch(value) {
    if (value === branchId || !canLeaveSettings()) return;
    if (
      Object.keys(cart).length &&
      !window.confirm(
        "Cambiar de sucursal vaciará el carrito actual. ¿Continuar?",
      )
    )
      return;
    settingsDirty.current = false;
    setCart({});
    setBranchId(value);
    try {
      sessionStorage.setItem("arvex-demo-branch", value);
    } catch {
      /* La sesión sigue en memoria. */
    }
    notify(`Ahora estás en ${state.branchNames[value]}.`);
  }
  function enter() {
    setEntered(true);
    try {
      sessionStorage.setItem("arvex-demo-access", "yes");
    } catch {
      /* La sesión sigue en memoria. */
    }
    navigate("resumen");
  }
  function exit() {
    if (!canLeaveSettings()) return;
    if (
      Object.keys(cart).length &&
      !window.confirm("Salir vaciará el carrito actual. ¿Continuar?")
    )
      return;
    setCart({});
    settingsDirty.current = false;
    setEntered(false);
    try {
      sessionStorage.removeItem("arvex-demo-access");
    } catch {}
    setMoreOpen(false);
  }
  const branchSelect = (
    <label className="branch-select">
      <MapPin size={16} aria-hidden="true" />
      <select
        aria-label="Sucursal activa"
        value={branchId}
        onChange={(e) => changeBranch(e.target.value)}
      >
        {Object.entries(state.branchNames).map(([id, name]) => (
          <option key={id} value={id}>
            {name.replace(/^Sucursal /, "")}
          </option>
        ))}
      </select>
    </label>
  );
  if (!entered)
    return (
      <div className="login-page">
        <header className="login-header">
          <Brand />
          <span className="demo-badge">Demo interactiva</span>
        </header>
        <main className="login-layout">
          <section className="login-copy">
            <span className="login-mark">
              <Building2 size={25} />
            </span>
            <h1>
              Tu negocio.
              <br />
              <span>En orden.</span>
            </h1>
            <p>
              Ventas, productos e inventario en un solo lugar. Lleva el pulso de
              tu operación, estés donde estés.
            </p>
            <div className="login-access">
              <h2>Conoce ARVEX por dentro</h2>
              <p>Entra a una empresa ficticia y prueba todo con libertad.</p>
              <div className="company-preview">
                <span className="company-monogram">CN</span>
                <div>
                  <strong>{state.company}</strong>
                  <span>Comercio · México · MXN</span>
                </div>
              </div>
              {branchSelect}
              <Button onClick={enter} className="full-width">
                Explorar demo <ArrowRight size={19} />
              </Button>
              <span className="login-note">
                <ShieldCheck size={15} />
                Sin registro. Sin contraseñas. Sin cobros.
              </span>
            </div>
          </section>
          <section
            className="login-preview"
            aria-label="Vista de la operación demo"
          >
            <div className="preview-heading">
              <span className="preview-live">
                <span />
                Tu operación conectada
              </span>
              <span>ARVEX / DEMO</span>
            </div>
            <h2>
              Más claridad.
              <br />
              Menos pendientes.
            </h2>
            <div className="preview-ledger">
              <span>Ventas de hoy · Centro</span>
              <strong>
                {money(
                  salesFor(state, "centro", new Date()).reduce(
                    (s, v) => s + v.total,
                    0,
                  ),
                )}
              </strong>
              <div className="preview-bars" aria-hidden="true">
                {[40, 65, 46, 78, 57, 90, 70, 100, 82, 95, 72, 86].map(
                  (n, i) => (
                    <i key={i} style={{ height: `${n}%` }} />
                  ),
                )}
              </div>
              <small>Ilustración del ritmo de tu negocio</small>
            </div>
            <div className="preview-check">
              <Check size={18} />
              <div>
                <strong>Una venta. Todo actualizado.</strong>
                <span>Tu caja y tus existencias, siempre conectadas.</span>
              </div>
            </div>
            <div className="preview-bottom">
              <span>Caja</span>
              <i />
              <span>Inventario</span>
              <i />
              <span>Sucursales</span>
            </div>
          </section>
        </main>
        <footer className="login-footer">
          Solo datos ficticios · Demo sin valor fiscal · Cambios guardados en tu
          navegador
        </footer>
      </div>
    );
  const shared = { state, setState, branchId, notify };
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Brand />
          <span className="version-badge">DEMO</span>
        </div>
        <div className="workspace">
          <span className="company-monogram">CN</span>
          <div>
            <strong>{state.company}</strong>
            <span>Tu espacio de trabajo</span>
          </div>
        </div>
        <nav aria-label="Navegación principal" className="desktop-navigation">
          <span className="nav-group-label">Espacio de trabajo</span>
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(p.id)}
              aria-current={page === p.id ? "page" : undefined}
              className={page === p.id ? "active" : ""}
            >
              <p.icon size={19} />
              <span>{p.label}</span>
              {p.id === "vender" && <kbd aria-hidden="true">PV</kbd>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-demo">
            <ShieldCheck size={19} />
            <strong>Explora sin límites</strong>
            <p>Es una demo. Todas las operaciones son simuladas.</p>
          </div>
          <button className="logout" onClick={exit}>
            <LogOut size={17} />
            Salir de la demo
          </button>
          <div className="demo-user">
            <span className="avatar small-avatar">D</span>
            <div>
              <strong>Usuario demo</strong>
              <span>Administrador de prueba</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span className="mobile-brand">
              <Brand />
            </span>
            <span className="desktop-breadcrumb">
              Espacio de trabajo <span>/</span>{" "}
              {pages.find((p) => p.id === page)?.label}
            </span>
          </div>
          <div className="topbar-right">
            {branchSelect}
            <span className="demo-badge topbar-demo">
              <span /> Modo demo
            </span>
          </div>
        </header>
        <div className="mobile-company">
          {state.company}
          <span>Demo · MXN</span>
        </div>
        {storageError && (
          <div className="storage-warning" role="alert">
            {storageError}
          </div>
        )}
        <main
          id="main-content"
          className={`main-content page-${page}`}
          tabIndex={-1}
        >
          {page === "resumen" && <Dashboard {...shared} navigate={navigate} />}
          {page === "productos" && <Catalog {...shared} navigate={navigate} />}
          {page === "vender" && (
            <PointOfSale
              key={branchId}
              {...shared}
              cart={cart}
              setCart={setCart}
            />
          )}
          {page === "inventario" && <Inventory key={branchId} {...shared} />}
          {page === "clientes" && <Customers key={branchId} {...shared} />}
          {page === "configuracion" && (
            <Settings
              key={branchId}
              {...shared}
              resetCart={() => setCart({})}
              onDirtyChange={(dirty) => {
                settingsDirty.current = dirty;
              }}
            />
          )}
        </main>
        <footer className="app-footer">
          <span>ARVEX · Demo interactiva</span>
          <span>Datos ficticios · Sin valor fiscal</span>
        </footer>
      </div>
      <nav aria-label="Navegación principal" className="bottom-nav">
        {pages.slice(0, 4).map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(p.id)}
            aria-current={page === p.id ? "page" : undefined}
            className={page === p.id ? "active" : ""}
          >
            <p.icon size={21} />
            <span>{p.label}</span>
            {p.id === "vender" && Object.keys(cart).length > 0 && (
              <i className="cart-dot" />
            )}
          </button>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className={
            ["clientes", "configuracion"].includes(page) ? "active" : ""
          }
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={22} />
          <span>Más</span>
        </button>
      </nav>
      <div
        className={`toast ${status ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {status && (
          <>
            <Check size={18} />
            <span>{status}</span>
          </>
        )}
      </div>
      {moreOpen && (
        <Modal title="Más de tu negocio" onClose={() => setMoreOpen(false)}>
          <div className="more-menu">
            {pages.slice(4).map((p) => (
              <button key={p.id} onClick={() => navigate(p.id)}>
                <p.icon size={21} />
                <span>{p.label}</span>
                <ArrowRight size={18} />
              </button>
            ))}
            <button onClick={exit}>
              <LogOut size={21} />
              <span>Salir de la demo</span>
              <ArrowRight size={18} />
            </button>
            <p>
              Empresa: {state.company}
              <br />
              Sin autenticación ni pagos reales.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

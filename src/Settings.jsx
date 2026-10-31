import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  ShieldCheck,
  RotateCcw,
  Check,
  Save,
} from "lucide-react";
import { createDemo } from "./data.js";
import { PageHead, Button } from "./components.jsx";
export default function Settings({
  state,
  setState,
  branchId,
  notify,
  resetCart,
  onDirtyChange,
}) {
  const [company, setCompany] = useState(state.company);
  const [branch, setBranch] = useState(state.branchNames[branchId]);
  const [error, setError] = useState("");
  useEffect(() => {
    onDirtyChange(
      company !== state.company || branch !== state.branchNames[branchId],
    );
    return () => onDirtyChange(false);
  }, [
    company,
    branch,
    state.company,
    state.branchNames,
    branchId,
    onDirtyChange,
  ]);
  function save(e) {
    e.preventDefault();
    if (!company.trim() || !branch.trim()) {
      setError("Escribe el nombre de la empresa y la sucursal.");
      return;
    }
    if (
      setState({
        ...state,
        company: company.trim(),
        branchNames: { ...state.branchNames, [branchId]: branch.trim() },
      }) === false
    )
      return;
    setCompany(company.trim());
    setBranch(branch.trim());
    setError("");
    notify("Configuración guardada en este navegador.");
  }
  function reset() {
    if (
      !window.confirm(
        "¿Restablecer todos los datos demo? Se borrarán las ventas, ajustes y configuración de este navegador.",
      )
    )
      return;
    const fresh = createDemo();
    if (setState(fresh) === false) return;
    setCompany(fresh.company);
    setBranch(fresh.branchNames[branchId]);
    resetCart();
    notify("Datos demo restablecidos.");
  }
  return (
    <>
      <PageHead
        title="Configuración"
        description="El espacio de tu empresa, a tu manera."
      />
      <div className="settings-layout">
        <form className="panel settings-form" onSubmit={save}>
          <div className="section-head">
            <div>
              <h2>Empresa y sucursal</h2>
              <p>Configuración local de demostración</p>
            </div>
            <Building2 size={22} />
          </div>
          <label className="field">
            Nombre de empresa
            <input
              required
              maxLength={80}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <small>Usa únicamente nombres ficticios.</small>
          </label>
          <label className="field">
            Nombre de sucursal
            <input
              required
              maxLength={60}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </label>
          <div className="settings-fixed">
            <div>
              <span>Moneda de la demo</span>
              <strong>MXN · Peso mexicano</strong>
            </div>
            <div>
              <span>Giro de ejemplo</span>
              <strong>Comercio · multigiro</strong>
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit">
            <Save size={17} />
            Guardar configuración
          </Button>
        </form>
        <div className="settings-side">
          <section className="panel">
            <div className="section-head">
              <h2>Un entorno para explorar</h2>
              <ShieldCheck size={21} />
            </div>
            <ul className="demo-rules">
              <li>
                <Check size={17} />
                Sin autenticación real
              </li>
              <li>
                <Check size={17} />
                Sin pagos ni cargos
              </li>
              <li>
                <Check size={17} />
                Sin facturación fiscal
              </li>
              <li>
                <Check size={17} />
                Datos solo en este navegador
              </li>
            </ul>
            <p className="panel-note">
              Cambiar de sucursal cambia su inventario, ventas y movimientos.
              Esto no implementa seguridad multiempresa real.
            </p>
          </section>
          <section className="panel reset-panel">
            <h2>Volver a empezar</h2>
            <p>
              Restaura el catálogo, inventario, ventas y configuración de ambas
              sucursales.
            </p>
            <Button variant="secondary" onClick={reset}>
              <RotateCcw size={17} />
              Restablecer datos demo
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}

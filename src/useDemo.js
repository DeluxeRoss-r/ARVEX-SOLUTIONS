import { useCallback, useEffect, useRef, useState } from "react";
import { createDemo } from "./data.js";
import { validateState } from "./domain.js";
const key = "arvex-demo-v1";
const unavailable =
  "No se pueden guardar cambios en este navegador. La demo funciona, pero se perderán al cerrar.";
function decode(raw) {
  try {
    const value = JSON.parse(raw);
    return validateState(value) ? value : null;
  } catch {
    return null;
  }
}
export function useDemo() {
  const [state, setView] = useState(() => {
    try {
      return decode(localStorage.getItem(key)) || createDemo();
    } catch {
      return createDemo();
    }
  });
  const latest = useRef(state);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    // Persist initialization once. Subsequent writes happen synchronously at commit time,
    // so a delayed React effect cannot overwrite a newer operation from another tab.
    try {
      const other = decode(localStorage.getItem(key));
      if (other) {
        latest.current = other;
        setView(other);
      } else localStorage.setItem(key, JSON.stringify(latest.current));
    } catch {
      setStorageError(unavailable);
    }
    function sync(event) {
      if (event.key !== key) return;
      const other = decode(event.newValue);
      if (other) {
        latest.current = other;
        setView(other);
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const setState = useCallback((next) => {
    let storageAvailable = true;
    try {
      const other = decode(localStorage.getItem(key));
      if (other && JSON.stringify(other) !== JSON.stringify(latest.current)) {
        latest.current = other;
        setView(other);
        setStorageError(
          "Otra pestaña actualizó la demo. Tus datos se sincronizaron; revisa la operación y vuelve a intentarlo.",
        );
        return false;
      }
    } catch {
      storageAvailable = false;
    }
    latest.current = next;
    setView(next);
    if (storageAvailable) {
      try {
        localStorage.setItem(key, JSON.stringify(next));
        setStorageError("");
      } catch {
        setStorageError(unavailable);
      }
    } else setStorageError(unavailable);
    return true;
  }, []);
  return [state, setState, storageError];
}

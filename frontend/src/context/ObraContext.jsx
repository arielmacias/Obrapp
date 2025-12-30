import { createContext, useContext, useState } from "react";

const ObraContext = createContext(null);
const STORAGE_KEY = "obraSeleccionada";

export function ObraProvider({ children }) {
  const [obraSeleccionada, setObraSeleccionadaState] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const setObraSeleccionada = (obra) => {
    setObraSeleccionadaState(obra);
    if (obra) localStorage.setItem(STORAGE_KEY, JSON.stringify(obra));
    else localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ObraContext.Provider value={{ obraSeleccionada, setObraSeleccionada }}>
      {children}
    </ObraContext.Provider>
  );
}

export function useObra() {
  const ctx = useContext(ObraContext);
  if (!ctx) throw new Error("useObra debe usarse dentro de <ObraProvider>");
  return ctx;
}

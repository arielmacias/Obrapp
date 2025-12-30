import { useState } from "react";
import { useObra } from "../context/ObraContext";
import { createGasto } from "../api/gastos";

export default function GastosForm({ onGastoCreado }) {
  const { obraSeleccionada } = useObra();

  const [fecha, setFecha] = useState("");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [cuentaId, setCuentaId] = useState("");
  const [partida, setPartida] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!obraSeleccionada?.id) {
      setError("Selecciona una obra primero.");
      return;
    }
    if (!fecha || !concepto || !monto) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (Number(monto) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    if (!cuentaId || !partida) {
      setError("Cuenta y partida son obligatorios");
      return;
    }


    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Sesión expirada. Inicia sesión de nuevo.");
        return;
      }
console.log("MONTO ANTES DE ENVIAR:", monto);

      // ✅ Backend exige: obra_id, fecha, monto, cuenta_id, partida
    const payload = {
  obra_id: obraSeleccionada.id,
  fecha,
  monto: Number(monto),
  cuenta_id: Number(cuentaId),
  partida,
  concepto,
};

const nuevoGasto = await createGasto(payload, token);


      onGastoCreado?.(nuevoGasto);

      // limpiar form
      setFecha("");
      setConcepto("");
      setMonto("");
    } catch (e) {
      setError(e.message || "Error al registrar gasto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Registrar gasto</h3>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Concepto"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
        />
      </div>

      <div>
       <input
  type="number"
  placeholder="Monto"
  value={monto}
  onChange={(e) => setMonto(e.target.value)}
/>

      </div>

      <div>
  <input
    type="number"
    placeholder="Cuenta ID"
    value={cuentaId}
    onChange={(e) => setCuentaId(e.target.value)}
  />
</div>

<div>
  <input
    type="text"
    placeholder="Partida (ej. Materiales)"
    value={partida}
    onChange={(e) => setPartida(e.target.value)}
  />
</div>


      <button disabled={loading}>
        {loading ? "Guardando..." : "Guardar gasto"}
      </button>
    </form>
  );
}

import { useState } from "react";
import { useObra } from "../context/ObraContext";
import { createGasto } from "../api/gastos";

export default function GastosForm({ onGastoCreado }) {
  const { obraSeleccionada } = useObra();

  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [cuentaId, setCuentaId] = useState("");
  const [partida, setPartida] = useState("");
  const [comprobanteUrl, setComprobanteUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!obraSeleccionada?.id) {
      setError("Selecciona una obra primero.");
      return;
    }
    if (!fecha || !descripcion || !monto) {
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

      // ✅ Backend exige: obra_id, fecha, monto, cuenta_id, partida
      const payload = {
        obra_id: obraSeleccionada.id,
        fecha,
        monto: Number(monto),
        cuenta_id: Number(cuentaId),
        partida,
        descripcion,
        comprobante_url: comprobanteUrl || null,
      };

const nuevoGasto = await createGasto(payload, token);


      onGastoCreado?.(nuevoGasto);

      // limpiar form
      setFecha("");
      setDescripcion("");
      setMonto("");
      setComprobanteUrl("");
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
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
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

<div>
  <input
    type="url"
    placeholder="URL del comprobante (opcional)"
    value={comprobanteUrl}
    onChange={(e) => setComprobanteUrl(e.target.value)}
  />
</div>

      <button disabled={loading}>
        {loading ? "Guardando..." : "Guardar gasto"}
      </button>
    </form>
  );
}

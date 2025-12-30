import { useEffect, useState } from "react";
import { useObra } from "../context/ObraContext";
import { createEstimacion, fetchEstimacionDetalle, fetchEstimaciones } from "../api/estimaciones";

export default function Estimaciones() {
  const { obraSeleccionada } = useObra();
  const [estimaciones, setEstimaciones] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [form, setForm] = useState({ fecha_inicio: "", fecha_fin: "" });
  const [error, setError] = useState("");

  async function load() {
    const token = localStorage.getItem("token");
    if (!token || !obraSeleccionada?.id) return;
    const data = await fetchEstimaciones(obraSeleccionada.id, token);
    setEstimaciones(data);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [obraSeleccionada?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token || !obraSeleccionada?.id) return;
    const payload = {
      obra_id: obraSeleccionada.id,
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
    };
    await createEstimacion(payload, token);
    setForm({ fecha_inicio: "", fecha_fin: "" });
    await load();
  }

  async function handleDetalle(id) {
    const token = localStorage.getItem("token");
    if (!token) return;
    const data = await fetchEstimacionDetalle(id, token);
    setDetalle(data);
  }

  return (
    <div>
      <h1>Estimaciones</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <h3>Generar estimación semanal</h3>
        <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
          <input
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => setForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
          />
          <input
            type="date"
            value={form.fecha_fin}
            onChange={(e) => setForm((prev) => ({ ...prev, fecha_fin: e.target.value }))}
          />
          <button>Generar</button>
        </div>
      </form>

      <h3>Historial</h3>
      <ul>
        {estimaciones.map((est) => (
          <li key={est.id} style={{ marginBottom: 8 }}>
            {est.fecha_inicio} → {est.fecha_fin} — Total: ${est.total_estimacion}
            <button style={{ marginLeft: 8 }} onClick={() => handleDetalle(est.id)}>
              Ver detalle
            </button>
          </li>
        ))}
      </ul>

      {detalle && (
        <div style={{ marginTop: 24 }}>
          <h3>Detalle de estimación</h3>
          <p>
            Gastos: ${detalle.total_gastos} | Honorarios: ${detalle.honorarios} | Total: $
            {detalle.total_estimacion}
          </p>
          <ul>
            {detalle.gastos?.map((gasto) => (
              <li key={gasto.id}>
                {gasto.fecha} — {gasto.descripcion || "-"} — ${gasto.monto}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

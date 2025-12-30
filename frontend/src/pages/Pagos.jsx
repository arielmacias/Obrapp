import { useEffect, useState } from "react";
import { useObra } from "../context/ObraContext";
import { createPago, fetchPagos } from "../api/pagos";
import { fetchCuentas } from "../api/cuentas";
import { isAdmin } from "../utils/session";

export default function Pagos() {
  const { obraSeleccionada } = useObra();
  const [pagos, setPagos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [form, setForm] = useState({ fecha: "", monto: "", cuenta_id: "", descripcion: "" });
  const [error, setError] = useState("");

  const admin = isAdmin();

  async function load() {
    const token = localStorage.getItem("token");
    if (!token || !obraSeleccionada?.id) return;
    const data = await fetchPagos(obraSeleccionada.id, token);
    setPagos(data);
    if (admin) {
      const cuentasData = await fetchCuentas(token);
      setCuentas(cuentasData);
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [obraSeleccionada?.id]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token || !obraSeleccionada?.id) return;
    await createPago(
      {
        obra_id: obraSeleccionada.id,
        fecha: form.fecha,
        monto: Number(form.monto),
        cuenta_id: Number(form.cuenta_id),
        descripcion: form.descripcion || null,
      },
      token
    );
    setForm({ fecha: "", monto: "", cuenta_id: "", descripcion: "" });
    await load();
  }

  return (
    <div>
      <h1>Pagos del cliente</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {admin && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <h3>Registrar pago</h3>
          <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
            <input type="date" value={form.fecha} onChange={handleChange("fecha")} />
            <input type="number" placeholder="Monto" value={form.monto} onChange={handleChange("monto")} />
            <select value={form.cuenta_id} onChange={handleChange("cuenta_id")}>
              <option value="">Cuenta de entrada</option>
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <input placeholder="Observaciones" value={form.descripcion} onChange={handleChange("descripcion")} />
            <button>Guardar pago</button>
          </div>
        </form>
      )}

      <h3>Historial</h3>
      <ul>
        {pagos.map((pago) => (
          <li key={pago.id}>
            {pago.fecha} — ${pago.monto} {pago.descripcion ? `— ${pago.descripcion}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

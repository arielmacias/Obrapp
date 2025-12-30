import { useEffect, useState } from "react";
import { fetchCuentas } from "../api/cuentas";
import { createMovimiento, fetchMovimientos } from "../api/movimientos";
import { isAdmin } from "../utils/session";

export default function Movimientos() {
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [form, setForm] = useState({
    cuenta_origen: "",
    cuenta_destino: "",
    monto: "",
    fecha: "",
    nota: "",
  });
  const [error, setError] = useState("");

  const admin = isAdmin();

  async function load() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const [cuentasData, movimientosData] = await Promise.all([
      fetchCuentas(token),
      fetchMovimientos(token),
    ]);
    setCuentas(cuentasData);
    setMovimientos(movimientosData);
  }

  useEffect(() => {
    if (admin) {
      load().catch((e) => setError(e.message));
    }
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;
    await createMovimiento(
      {
        ...form,
        cuenta_origen: Number(form.cuenta_origen),
        cuenta_destino: Number(form.cuenta_destino),
        monto: Number(form.monto),
      },
      token
    );
    setForm({ cuenta_origen: "", cuenta_destino: "", monto: "", fecha: "", nota: "" });
    await load();
  }

  if (!admin) {
    return <p>Solo administradores pueden ver movimientos internos.</p>;
  }

  return (
    <div>
      <h1>Movimientos entre cuentas</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <h3>Registrar movimiento</h3>
        <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
          <select value={form.cuenta_origen} onChange={handleChange("cuenta_origen")}>
            <option value="">Cuenta origen</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select value={form.cuenta_destino} onChange={handleChange("cuenta_destino")}>
            <option value="">Cuenta destino</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <input type="number" placeholder="Monto" value={form.monto} onChange={handleChange("monto")} />
          <input type="date" value={form.fecha} onChange={handleChange("fecha")} />
          <input placeholder="Nota (opcional)" value={form.nota} onChange={handleChange("nota")} />
          <button>Guardar movimiento</button>
        </div>
      </form>

      <h3>Historial</h3>
      <ul>
        {movimientos.map((mov) => (
          <li key={mov.id}>
            {mov.fecha} — {mov.cuenta_origen} → {mov.cuenta_destino} — ${mov.monto}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createCuenta, fetchCuentas } from "../api/cuentas";
import { isAdmin } from "../utils/session";

export default function Cuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const admin = isAdmin();

  async function load() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const data = await fetchCuentas(token);
    setCuentas(data);
  }

  useEffect(() => {
    if (admin) {
      load().catch((e) => setError(e.message));
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await createCuenta({ nombre, descripcion }, token);
      setNombre("");
      setDescripcion("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!admin) {
    return <p>Solo administradores pueden ver cuentas internas.</p>;
  }

  return (
    <div>
      <h1>Cuentas internas</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <h3>Nueva cuenta</h3>
        <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
          <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <button disabled={loading}>{loading ? "Guardando..." : "Crear cuenta"}</button>
        </div>
      </form>

      <h3>Listado</h3>
      <ul>
        {cuentas.map((cuenta) => (
          <li key={cuenta.id}>
            {cuenta.nombre} {cuenta.descripcion ? `— ${cuenta.descripcion}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

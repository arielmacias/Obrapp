import { useEffect, useState } from "react";
import { asignarObra, createObra, getObras, terminarObra, updateObra } from "../api/obras";
import { fetchUsuarios } from "../api/usuarios";
import { isAdmin } from "../utils/session";

const emptyForm = {
  nombre: "",
  clave: "",
  direccion: "",
  cliente: "",
  responsable: "",
  fecha_inicio: "",
  porcentaje_honorarios: "",
  estado: "activa",
};

export default function Obras() {
  const [obras, setObras] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [residentes, setResidentes] = useState([]);
  const [asignacion, setAsignacion] = useState({ obraId: "", usuarioId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const admin = isAdmin();

  async function load() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const data = await getObras(token);
    setObras(data);
    if (admin) {
      const usuarios = await fetchUsuarios("residente", token);
      setResidentes(usuarios);
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const payload = {
        ...form,
        porcentaje_honorarios: Number(form.porcentaje_honorarios),
      };

      if (editId) {
        await updateObra(editId, payload, token);
      } else {
        await createObra(payload, token);
      }

      setForm(emptyForm);
      setEditId(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(obra) {
    setEditId(obra.id);
    setForm({
      nombre: obra.nombre || "",
      clave: obra.clave || "",
      direccion: obra.direccion || "",
      cliente: obra.cliente || "",
      responsable: obra.responsable || "",
      fecha_inicio: obra.fecha_inicio?.slice(0, 10) || "",
      porcentaje_honorarios: obra.porcentaje_honorarios || "",
      estado: obra.estado || "activa",
    });
  }

  async function handleTerminar(id) {
    const token = localStorage.getItem("token");
    if (!token) return;
    await terminarObra(id, token);
    await load();
  }

  async function handleAsignar(event) {
    event.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!asignacion.obraId || !asignacion.usuarioId) {
      setError("Selecciona obra y residente");
      return;
    }
    await asignarObra(asignacion.obraId, asignacion.usuarioId, token);
    setAsignacion({ obraId: "", usuarioId: "" });
  }

  return (
    <div>
      <h1>Obras</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {admin && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <h3>{editId ? "Editar obra" : "Nueva obra"}</h3>
          <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
            <input placeholder="Nombre" value={form.nombre} onChange={handleChange("nombre")} />
            <input placeholder="Clave (ABC)" value={form.clave} onChange={handleChange("clave")} />
            <input placeholder="Dirección" value={form.direccion} onChange={handleChange("direccion")} />
            <input placeholder="Cliente" value={form.cliente} onChange={handleChange("cliente")} />
            <input placeholder="Responsable" value={form.responsable} onChange={handleChange("responsable")} />
            <input type="date" value={form.fecha_inicio} onChange={handleChange("fecha_inicio")} />
            <input
              type="number"
              placeholder="Porcentaje honorarios"
              value={form.porcentaje_honorarios}
              onChange={handleChange("porcentaje_honorarios")}
            />
            <select value={form.estado} onChange={handleChange("estado")}>
              <option value="activa">Activa</option>
              <option value="terminada">Terminada</option>
            </select>
            <button disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      )}

      {admin && (
        <form onSubmit={handleAsignar} style={{ marginBottom: 24 }}>
          <h3>Asignar residente</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={asignacion.obraId}
              onChange={(e) => setAsignacion((prev) => ({ ...prev, obraId: e.target.value }))}
            >
              <option value="">Selecciona obra</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombre} ({obra.clave})
                </option>
              ))}
            </select>
            <select
              value={asignacion.usuarioId}
              onChange={(e) => setAsignacion((prev) => ({ ...prev, usuarioId: e.target.value }))}
            >
              <option value="">Selecciona residente</option>
              {residentes.map((residente) => (
                <option key={residente.id} value={residente.id}>
                  {residente.nombre} ({residente.correo})
                </option>
              ))}
            </select>
            <button>Asignar</button>
          </div>
        </form>
      )}

      <h3>Listado</h3>
      <ul>
        {obras.map((obra) => (
          <li key={obra.id} style={{ marginBottom: 12 }}>
            <strong>{obra.nombre}</strong> ({obra.clave}) — {obra.estado}
            <div style={{ fontSize: 14 }}>
              Cliente: {obra.cliente || "-"} | Responsable: {obra.responsable || "-"}
            </div>
            {admin && (
              <div style={{ marginTop: 6 }}>
                <button onClick={() => startEdit(obra)} style={{ marginRight: 8 }}>
                  Editar
                </button>
                {obra.estado !== "terminada" && (
                  <button onClick={() => handleTerminar(obra.id)}>Terminar</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

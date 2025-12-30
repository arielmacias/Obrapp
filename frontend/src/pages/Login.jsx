import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(correo, contrasena);

      const token = result.token;
      const usuario = result.usuario;

      if (!token) throw new Error("No llegó token");

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // 👇 IMPORTANTÍSIMO: al terminar login, manda al flujo FE-03
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Obrapp – Login nuevo</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />

        <button disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>

        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>
    </div>
  );
}

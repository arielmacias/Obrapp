import { API_BASE_URL } from "../config";

export async function login(correo, contrasena) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });

  // Si el backend devuelve error, lo mostramos bien
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Error en login");
  }

  return data;
}

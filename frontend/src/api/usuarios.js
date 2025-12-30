import { API_BASE_URL } from "../config";

export async function fetchUsuarios(rol, token) {
  const url = rol ? `${API_BASE_URL}/usuarios?rol=${rol}` : `${API_BASE_URL}/usuarios`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al cargar usuarios");
  return body;
}

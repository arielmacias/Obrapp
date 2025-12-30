import { API_BASE_URL } from "../config";

export async function fetchGastos(obraId, token) {
  const res = await fetch(`${API_BASE_URL}/gastos?obra_id=${obraId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al cargar gastos");
  return body;
}

export async function createGasto(data, token) {
  const res = await fetch(`${API_BASE_URL}/gastos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al registrar gasto");
  return body;
}

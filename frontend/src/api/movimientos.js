import { API_BASE_URL } from "../config";

export async function fetchMovimientos(token) {
  const res = await fetch(`${API_BASE_URL}/movimientos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al cargar movimientos");
  return body;
}

export async function createMovimiento(payload, token) {
  const res = await fetch(`${API_BASE_URL}/movimientos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al registrar movimiento");
  return body;
}

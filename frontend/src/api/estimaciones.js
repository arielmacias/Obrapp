import { API_BASE_URL } from "../config";

export async function fetchEstimaciones(obraId, token) {
  const res = await fetch(`${API_BASE_URL}/estimaciones?obra_id=${obraId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al cargar estimaciones");
  return body;
}

export async function createEstimacion(payload, token) {
  const res = await fetch(`${API_BASE_URL}/estimaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al generar estimación");
  return body;
}

export async function fetchEstimacionDetalle(id, token) {
  const res = await fetch(`${API_BASE_URL}/estimaciones/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al cargar estimación");
  return body;
}

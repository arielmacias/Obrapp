import { API_BASE_URL } from "../config";

export async function fetchPagos(obraId, token) {
  const res = await fetch(`${API_BASE_URL}/pagos?obra_id=${obraId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al cargar pagos");
  return body;
}

export async function createPago(payload, token) {
  const res = await fetch(`${API_BASE_URL}/pagos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al registrar pago");
  return body;
}

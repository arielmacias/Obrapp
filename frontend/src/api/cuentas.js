import { API_BASE_URL } from "../config";

export async function fetchCuentas(token) {
  const res = await fetch(`${API_BASE_URL}/cuentas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al cargar cuentas");
  return body;
}

export async function createCuenta(payload, token) {
  const res = await fetch(`${API_BASE_URL}/cuentas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || "Error al crear cuenta");
  return body;
}

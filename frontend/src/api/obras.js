import { API_BASE_URL } from "../config";

export async function getObras(token) {
  const res = await fetch(`${API_BASE_URL}/obras`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener obras");

  return data;
}

export async function createObra(payload, token) {
  const res = await fetch(`${API_BASE_URL}/obras`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear obra");
  return data;
}

export async function updateObra(id, payload, token) {
  const res = await fetch(`${API_BASE_URL}/obras/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar obra");
  return data;
}

export async function terminarObra(id, token) {
  const res = await fetch(`${API_BASE_URL}/obras/${id}/terminar`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al terminar obra");
  return data;
}

export async function asignarObra(id, usuarioId, token) {
  const res = await fetch(`${API_BASE_URL}/obras/${id}/asignar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ usuario_id: usuarioId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al asignar obra");
  return data;
}

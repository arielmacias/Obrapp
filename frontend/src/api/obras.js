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

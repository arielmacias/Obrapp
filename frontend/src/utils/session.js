export function getUsuario() {
  const raw = localStorage.getItem("usuario");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdmin() {
  const usuario = getUsuario();
  return usuario?.rol === "admin";
}

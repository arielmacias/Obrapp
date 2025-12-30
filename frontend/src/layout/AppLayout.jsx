import { Outlet, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <header style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
        <strong>Obrapp Admin</strong>
        <button onClick={logout} style={{ float: "right" }}>
          Logout
        </button>
      </header>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </>
  );
}

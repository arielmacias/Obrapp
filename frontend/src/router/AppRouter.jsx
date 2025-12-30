import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import SeleccionarObra from "../pages/SeleccionarObra";
import Gastos from "../pages/Gastos"; // ✅ NUEVO
import PrivateRoute from "../auth/PrivateRoute";
import { useObra } from "../context/ObraContext";

export default function AppRouter() {
  const { obraSeleccionada } = useObra();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/seleccionar-obra"
          element={
            <PrivateRoute>
              <SeleccionarObra />
            </PrivateRoute>
          }
        />

        {/* ✅ NUEVA RUTA: /gastos */}
        <Route
          path="/gastos"
          element={
            <PrivateRoute>
              {obraSeleccionada ? (
                <Gastos />
              ) : (
                <Navigate to="/seleccionar-obra" replace />
              )}
            </PrivateRoute>
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              {obraSeleccionada ? (
                <Home />
              ) : (
                <Navigate to="/seleccionar-obra" replace />
              )}
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

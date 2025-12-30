import { Link } from "react-router-dom";
import { useObra } from "../context/ObraContext";
import { isAdmin } from "../utils/session";

export default function Home() {
  const { obraSeleccionada } = useObra();
  const admin = isAdmin();

  return (
    <div>
      <h1>Panel</h1>
      {obraSeleccionada && (
        <p>
          Obra actual: <strong>{obraSeleccionada.nombre}</strong>
        </p>
      )}
      <nav style={{ display: "grid", gap: 8 }}>
        <Link to="/obras">Obras</Link>
        <Link to="/gastos">Gastos</Link>
        <Link to="/pagos">Pagos</Link>
        <Link to="/estimaciones">Estimaciones</Link>
        {admin && (
          <>
            <Link to="/cuentas">Cuentas internas</Link>
            <Link to="/movimientos">Movimientos</Link>
          </>
        )}
      </nav>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useObra } from "../context/ObraContext";
import { isAdmin } from "../utils/session";

export default function Home() {
  const { obraSeleccionada } = useObra();
  const admin = isAdmin();

  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Panel principal</p>
          <h1 className="page-title">Gestiona tu obra en un solo lugar</h1>
          <p className="page-subtitle">
            Accede rápido a gastos, pagos y estimaciones con un flujo claro.
          </p>
        </div>
        {obraSeleccionada && (
          <div className="selection-card">
            <span>Obra actual</span>
            <strong>{obraSeleccionada.nombre}</strong>
          </div>
        )}
      </section>

      <section className="page-card">
        <div className="card-header">
          <div>
            <h2>Navegación rápida</h2>
            <p>Elige el módulo que necesitas para continuar.</p>
          </div>
        </div>
        <nav className="link-grid">
          <Link className="nav-card" to="/obras">
            <div>
              <h3>Obras</h3>
              <p>Gestiona proyectos y su información general.</p>
            </div>
            <span className="nav-card-tag">Gestión</span>
          </Link>
          <Link className="nav-card" to="/gastos">
            <div>
              <h3>Gastos</h3>
              <p>Registra y controla egresos operativos.</p>
            </div>
            <span className="nav-card-tag">Finanzas</span>
          </Link>
          <Link className="nav-card" to="/pagos">
            <div>
              <h3>Pagos</h3>
              <p>Administra pagos a proveedores y equipos.</p>
            </div>
            <span className="nav-card-tag">Finanzas</span>
          </Link>
          <Link className="nav-card" to="/estimaciones">
            <div>
              <h3>Estimaciones</h3>
              <p>Seguimiento de avance y entregables.</p>
            </div>
            <span className="nav-card-tag">Control</span>
          </Link>
          {admin && (
            <>
              <Link className="nav-card" to="/cuentas">
                <div>
                  <h3>Cuentas internas</h3>
                  <p>Centraliza las cuentas administrativas.</p>
                </div>
                <span className="nav-card-tag">Admin</span>
              </Link>
              <Link className="nav-card" to="/movimientos">
                <div>
                  <h3>Movimientos</h3>
                  <p>Visualiza operaciones y conciliaciones.</p>
                </div>
                <span className="nav-card-tag">Admin</span>
              </Link>
            </>
          )}
        </nav>
      </section>
    </div>
  );
}

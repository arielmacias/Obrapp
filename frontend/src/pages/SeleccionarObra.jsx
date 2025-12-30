import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getObras } from "../api/obras";
import { useObra } from "../context/ObraContext";


export default function SeleccionarObra() {
  const [obras, setObras] = useState([]);
  const [error, setError] = useState("");
  const { setObraSeleccionada } = useObra();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    getObras(token)
      .then(setObras)
      .catch((e) => setError(e.message));
  }, []);

const onSelect = (obra) => {
  setObraSeleccionada(obra);
  navigate("/", { replace: true });
};


  return (
    <div style={{ padding: 16 }}>
      <h2>Selecciona una obra</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ paddingLeft: 16 }}>
        {obras.map((obra) => (
          <li key={obra.id} style={{ marginBottom: 8 }}>
            <button onClick={() => onSelect(obra)}>
              {obra.nombre} ({obra.clave})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

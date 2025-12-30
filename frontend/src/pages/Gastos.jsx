import { useEffect, useState } from "react";
import GastosList from "../components/GastosList";
import GastosForm from "../components/GastosForm";
import { useObra } from "../context/ObraContext";
import { fetchGastos, createGasto } from "../api/gastos";


export default function Gastos() {
  const { obraSeleccionada } = useObra();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token || !obraSeleccionada?.id) return;

      const data = await fetchGastos(obraSeleccionada.id, token);
      setGastos(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, [obraSeleccionada?.id]);

  function handleGastoCreado(gasto) {
    setGastos((prev) => [gasto, ...prev]);
  }

  return (
    <div>
      <h1>Gastos</h1>
      <GastosForm onGastoCreado={handleGastoCreado} />
      {loading ? <p>Cargando...</p> : <GastosList gastos={gastos} />}
    </div>
  );
}

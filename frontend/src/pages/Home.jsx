import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>HOME</h1>
      <Link to="/gastos">Ir a Gastos</Link>
    </div>
  );
}

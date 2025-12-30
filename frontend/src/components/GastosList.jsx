export default function GastosList({ gastos = [] }) {
  if (!gastos.length) return <p>No hay gastos registrados.</p>;

  return (
    <ul>
      {gastos.map((g) => (
        <li key={g.id}>
          {g.fecha} — {g.concepto} — ${g.monto}
        </li>
      ))}
    </ul>
  );
}

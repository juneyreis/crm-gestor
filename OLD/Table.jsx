export default function Table({ columns, data, onDelete }) {
  return (
    <table className="w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          {columns.map(col => (
            <th key={col} className="border px-3 py-2 text-left">
              {col}
            </th>
          ))}
          <th className="border px-3 py-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td className="border px-3 py-2">{row.cliente}</td>
            <td className="border px-3 py-2">{row.data_visita}</td>
            <td className="border px-3 py-2">{row.status}</td>
            <td className="border px-3 py-2">
              <button
                onClick={() => onDelete(row.id)}
                className="text-red-600 hover:underline"
              >
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <select
        className="border rounded px-3 py-2 focus:ring focus:ring-blue-200"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

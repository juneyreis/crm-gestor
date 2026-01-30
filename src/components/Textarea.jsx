export default function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        className="border rounded px-3 py-2 focus:ring focus:ring-blue-200"
        rows={4}
        {...props}
      />
    </div>
  );
}

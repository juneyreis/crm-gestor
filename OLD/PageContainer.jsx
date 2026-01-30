export default function PageContainer({ children }) {
  return (
    <main className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow p-6">
        {children}
      </div>
    </main>
  );
}

import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading, isSyncing } = useAuth();

  // O Admin principal (pelo email) entra direto sem esperar sync para ser resiliente
  const isPrimaryAdmin = user?.email === 'juneyreis@gmail.com';

  if (loading || (isSyncing && !isPrimaryAdmin && !user?.plan)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Validando sua licença...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado ou se parou de sincronizar e o usuário sumiu (logout), redirecionar
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

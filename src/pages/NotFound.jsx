import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import useTheme from '../hooks/useTheme';

export default function NotFound() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 dark:from-slate-950 dark:to-slate-900 dark:text-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>

          <p className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Página não encontrada
          </p>

          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
            Desculpe, a página que você está procurando não existe ou foi movida para outro local.
          </p>

          <Link
            to="/visitas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
          >
            <Home className="h-5 w-5" />
            Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  );
}

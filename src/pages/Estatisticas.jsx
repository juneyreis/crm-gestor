// src/pages/Estatisticas.jsx
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import VisitasMonthlyChart from '../components/charts/VisitasMonthlyChart';
import useAuth from '../hooks/useAuth';
import * as visitasService from '../services/visitasService';

export default function Estatisticas() {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar visitas do Supabase
  useEffect(() => {
    const loadVisits = async () => {
      setIsLoading(true);
      try {
        const data = await visitasService.listarVisitas(user?.id);
        setVisits(data || []);
      } catch (error) {
        console.error('Erro ao carregar visitas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadVisits();
    }
  }, [user?.id]);

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-xl p-6 md:p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Estatísticas</h1>
            <p className="text-slate-300">
              Análise detalhada de visitas comerciais e métricas de desempenho
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-slate-700">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando dados...</p>
            </div>
          </div>
        ) : visits.length > 0 ? (
          <VisitasMonthlyChart visits={visits} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Sem dados de visitas
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Registre visitas para visualizar as estatísticas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

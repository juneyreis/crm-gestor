// src/pages/Dashboard.jsx - ATUALIZADO
import { useState, useEffect } from 'react';
import { Calendar, Building2, Zap, Map, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAuth from '../hooks/useAuth';
import * as visitasService from '../services/visitasService';
import * as segmentosService from '../services/segmentosService';
import * as concorrentesService from '../services/concorrentesService';
import * as vendedoresService from '../services/vendedoresService';
import * as prospectsService from '../services/prospectsService';
import * as clientesService from '../services/clientesService';
import {
  Hash,
  ShieldAlert,
  Users,
  Target,
  CheckCircle,
  Briefcase
} from 'lucide-react';

// Função para parsear data sem timezone
const parseDataLocal = (dataString) => {
  try {
    const [year, month, day] = dataString.split('-').map(Number);
    return new Date(year, month - 1, day);
  } catch {
    return new Date(dataString);
  }
};

// Função para formatar data para exibição
export const formatarDataLocal = (dataString) => {
  try {
    const date = parseDataLocal(dataString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dataString;
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    hoje: 0,
    mes: 0,
    total: 0,
    cidades: 0,
    concorrentesUnicos: 0,
    // Novos contadores
    segmentosTotal: 0,
    concorrentesTotal: 0,
    vendedoresTotal: 0,
    prospectsTotal: 0,
    clientesTotal: 0
  });
  const [ultimasVisitas, setUltimasVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      if (!user?.id) return;

      try {

        const [
          visitas,
          segmentos,
          concorrentes,
          vendedores,
          prospects,
          clientes
        ] = await Promise.all([
          visitasService.listarVisitas(user.id),
          segmentosService.listarSegmentos(user.id),
          concorrentesService.listarConcorrentes(user.id),
          vendedoresService.listarVendedores(user.id),
          prospectsService.listar(user.id),
          clientesService.listar(user.id)
        ]);


        // Processamento de Visitas
        let statsVisitas = { hoje: 0, mes: 0, total: 0, cidades: 0, concorrentes: 0 };
        if (visitas && visitas.length > 0) {
          const today = new Date();
          const hoje = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

          statsVisitas.hoje = visitas.filter(v => parseDataLocal(v.data).getTime() === hoje.getTime()).length;
          statsVisitas.mes = visitas.filter(v => {
            const vd = parseDataLocal(v.data);
            return vd >= inicioMes && vd <= fimMes;
          }).length;
          statsVisitas.cidades = new Set(visitas.map(v => v.cidade)).size;
          statsVisitas.concorrentes = new Set(visitas.map(v => v.sistema)).size;
          statsVisitas.total = visitas.length;

          const ultimasVis = visitas
            .sort((a, b) => parseDataLocal(b.data).getTime() - parseDataLocal(a.data).getTime())
            .slice(0, 3);
          setUltimasVisitas(ultimasVis);
        }

        setStats({
          // Visitas (originais)
          hoje: statsVisitas.hoje,
          mes: statsVisitas.mes,
          total: statsVisitas.total,
          cidades: statsVisitas.cidades,
          concorrentesUnicos: statsVisitas.concorrentes,
          // Cadastros (novos)
          segmentosTotal: segmentos?.length || 0,
          concorrentesTotal: concorrentes?.length || 0,
          vendedoresTotal: vendedores?.length || 0,
          prospectsTotal: prospects?.length || 0,
          clientesTotal: clientes?.length || 0
        });

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [user?.id]);

  const statsAnteriores = [
    { label: 'Visitas Hoje', value: stats.hoje, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Visitas Mês', value: stats.mes, icon: Calendar, color: 'bg-green-500' },
    { label: 'Visitas Total', value: stats.total, icon: ListTodo, color: 'bg-purple-500' },
    { label: 'Cidades', value: stats.cidades, icon: Map, color: 'bg-indigo-500' },
    { label: 'Concorrentes', value: stats.concorrentesUnicos, icon: Zap, color: 'bg-orange-500' },
  ];

  const statsNovos = [
    { label: 'Segmentos', value: stats.segmentosTotal, icon: Hash, color: 'bg-cyan-500' },
    { label: 'Concorrentes', value: stats.concorrentesTotal, icon: ShieldAlert, color: 'bg-pink-500' },
    { label: 'Vendedores', value: stats.vendedoresTotal, icon: Briefcase, color: 'bg-amber-500' },
    { label: 'Prospects', value: stats.prospectsTotal, icon: Target, color: 'bg-emerald-500' },
    { label: 'Clientes', value: stats.clientesTotal, icon: CheckCircle, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Bem-vindo ao sistema de controle de prospects</p>
      </div>

      {/* Estatísticas de Visitas */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider ml-1">Estatísticas de Visitas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {statsAnteriores.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl shadow-inner`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estatísticas de Cadastros */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider ml-1">Estatísticas de Tabelas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {statsNovos.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl shadow-inner`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Últimas Visitas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Últimas Visitas</h2>
        <div className="space-y-4">
          {ultimasVisitas.length > 0 ? (
            ultimasVisitas.map((visita) => (
              <div key={visita.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{visita.prospect}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatarDataLocal(visita.data)} • {visita.cidade} • {visita.sistema}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma visita registrada</p>
          )}
        </div>
      </div>
    </div>
  );
}

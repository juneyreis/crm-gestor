import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parse, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useTheme from '../../hooks/useTheme';

// Função para parsear data sem timezone
const parseDataLocal = (dataString) => {
  try {
    const [year, month, day] = dataString.split('-').map(Number);
    return new Date(year, month - 1, day);
  } catch {
    return new Date(dataString);
  }
};

const COLOR_OPTIONS = {
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#A855F7',
  pink: '#EC4899',
  indigo: '#6366F1',
  cyan: '#06B6D4'
};

const COLOR_LABELS = {
  blue: 'Azul',
  green: 'Verde',
  purple: 'Roxo',
  pink: 'Rosa',
  indigo: 'Índigo',
  cyan: 'Ciano'
};

export default function VisitasMonthlyChart({ visits = [] }) {
  const [selectedColor, setSelectedColor] = useState('blue');
  const { theme } = useTheme();

  // Processar dados de visitas mensais
  const chartData = useMemo(() => {
    if (!visits || visits.length === 0) {
      return [];
    }

    // Encontrar a data mais antiga (usando parseDataLocal para evitar timezone)
    const sortedVisits = [...visits].sort((a, b) => parseDataLocal(a.data) - parseDataLocal(b.data));
    const oldestDate = parseDataLocal(sortedVisits[0].data);

    // Obter data local de hoje sem timezone
    const today = new Date();
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Gerar últimos 12 meses a partir da data mais antiga
    const months = [];
    let currentDate = new Date(oldestDate);

    while (currentDate <= localToday && months.length < 12) {
      const yearMonth = format(currentDate, 'MM/yyyy');
      months.push({
        date: new Date(currentDate),
        yearMonth,
        month: format(currentDate, 'MMM', { locale: ptBR }).toUpperCase(),
        year: format(currentDate, 'yyyy'),
        monthYear: format(currentDate, 'MMM/yyyy', { locale: ptBR }).toUpperCase(),
        count: 0
      });
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // Agrupar visitas por mês/ano (usando parseDataLocal para evitar timezone)
    visits.forEach(visit => {
      const visitDate = parseDataLocal(visit.data);
      const visitYearMonth = format(visitDate, 'MM/yyyy');

      const monthData = months.find(m => m.yearMonth === visitYearMonth);
      if (monthData) {
        monthData.count += 1;
      }
    });

    return months;
  }, [visits]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalVisits = chartData.reduce((sum, month) => sum + month.count, 0);
    const averageVisits = chartData.length > 0 ? (totalVisits / chartData.length).toFixed(1) : 0;
    const maxVisits = Math.max(...chartData.map(m => m.count), 0);
    const maxMonth = chartData.find(m => m.count === maxVisits);

    return {
      totalVisits,
      averageVisits,
      maxVisits,
      maxMonth: maxMonth ? maxMonth.monthYear : '-'
    };
  }, [chartData]);

  return (
    <div className="space-y-0">
      {/* Seletor de Cor */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visitas Mensais</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cor:</label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(COLOR_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[560px] bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-slate-700 mb-[-140px] mt-[140px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 140 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? '#475569' : '#e5e7eb'}
                vertical={false}
              />
              <XAxis
                dataKey="monthYear"
                angle={-45}
                textAnchor="end"
                height={140}
                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 13, fontWeight: 'bold', dy: 20 }}
              />
              <YAxis
                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                  border: `2px solid ${COLOR_OPTIONS[selectedColor]}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#f1f5f9' : '#1f2937'
                }}
                formatter={(value) => [`${value} visita${value !== 1 ? 's' : ''}`, 'Visitas']}
                labelStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#1f2937' }}
              />
              <Legend
                wrapperStyle={{
                  color: theme === 'dark' ? '#f1f5f9' : '#1f2937'
                }}
              />
              <Bar
                dataKey="count"
                fill={COLOR_OPTIONS[selectedColor]}
                name="Visitas"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Nenhuma dados de visitas disponíveis
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Visitas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Visitas</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalVisits}</div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Em {chartData.length} meses</p>
        </div>

        {/* Média Mensal */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Média Mensal</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.averageVisits}</div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Visitas por mês</p>
        </div>

        {/* Maior Pico */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Maior Pico</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.maxVisits}</div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{metrics.maxMonth}</p>
        </div>

        {/* Período */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Período Analisado</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{chartData.length}m</div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Últimos meses</p>
        </div>
      </div>
    </div>
  );
}

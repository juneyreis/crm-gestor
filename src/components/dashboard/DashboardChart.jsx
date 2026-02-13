import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

const parseDataLocal = (dataString) => {
    try {
        const [year, month, day] = dataString.split('-').map(Number);
        return new Date(year, month - 1, day);
    } catch {
        return new Date(dataString);
    }
};

export default function DashboardChart({ visits = [] }) {
    const { theme } = useTheme();

    const chartData = useMemo(() => {
        if (!visits || visits.length === 0) return [];

        const today = new Date();
        const months = [];

        // Gerar os últimos 6 meses (período menor como solicitado)
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push({
                yearMonth: format(d, 'MM/yyyy'),
                label: format(d, 'MMM', { locale: ptBR }).toUpperCase(),
                count: 0
            });
        }

        visits.forEach(visit => {
            const visitDate = parseDataLocal(visit.data);
            const visitYearMonth = format(visitDate, 'MM/yyyy');
            const monthData = months.find(m => m.yearMonth === visitYearMonth);
            if (monthData) monthData.count += 1;
        });

        return months;
    }, [visits]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-lg h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    Visitas x Mês
                </h2>
            </div>

            <div className="flex-1 min-h-[250px] w-full mt-2">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
                                }}
                                cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f8fafc' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#10B981"
                                radius={[4, 4, 0, 0]}
                                barSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Sem dados
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import ReportLayout from '../../components/reports/ReportLayout';
import * as visitasService from '../../services/visitasService';
import useAuth from '../../hooks/useAuth';
import { generatePDF, printReport } from '../../utils/exportUtils';
import { Search, Filter, ArrowUpDown, FileText, CheckCircle2, Clock, MapPin, Target, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function VisitasReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterTipo, setFilterTipo] = useState('all');

    // Ordenação
    const [sortField, setSortField] = useState('data');
    const [sortOrder, setSortOrder] = useState('desc');

    const { user } = useAuth();

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const visitasData = await visitasService.listarVisitas(user.id);
            setData(visitasData || []);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório de visitas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    // Lógica de Filtragem e Ordenação
    const filteredData = data
        .filter(item => {
            const matchesSearch =
                (item.prospect_nome || item.prospect || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.cidade || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
            const matchesTipo = filterTipo === 'all' || item.tipo === filterTipo;

            const itemDate = item.data;
            const matchesDateFrom = !dateFrom || itemDate >= dateFrom;
            const matchesDateTo = !dateTo || itemDate <= dateTo;

            return matchesSearch && matchesStatus && matchesTipo && matchesDateFrom && matchesDateTo;
        })
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === 'data') {
                valA = valA || '0000-00-00';
                valB = valB || '0000-00-00';
            } else {
                valA = valA?.toString().toUpperCase() || '';
                valB = valB?.toString().toUpperCase() || '';
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleExportPDF = () => {
        generatePDF('report-content', 'relatorio-visitas.pdf');
    };

    const handlePrint = () => {
        printReport('report-content');
    };

    // Cálculos de Resumo (KPIs)
    const totalVisits = data.length;
    const completedVisits = data.filter(v => v.status === 'Realizada').length;
    const realizationRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

    // Tipo mais comum
    const tipoCounts = data.reduce((acc, item) => {
        const t = item.tipo || 'N/A';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
    }, {});
    const dominantTipo = Object.entries(tipoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const filters = (
        <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por prospect ou cidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none transition-shadow"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
                            title="De"
                        />
                    </div>
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
                            title="Até"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Status: Todos</option>
                    <option value="Agendada">Agendada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Atrasada">Atrasada</option>
                </select>

                <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Tipo: Todos</option>
                    <option value="Sondagem">Sondagem</option>
                    <option value="Apresentação">Apresentação</option>
                    <option value="Prosseguimento">Prosseguimento</option>
                    <option value="Demonstração">Demonstração</option>
                    <option value="Negociação">Negociação</option>
                </select>
            </div>

            <div className="flex items-center justify-end px-2 text-xs text-slate-500 font-medium">
                <Filter className="h-3 w-3 mr-1" />
                <span>{filteredData.length} visitas no período</span>
            </div>
        </div>
    );

    return (
        <ReportLayout
            title="Relatório de Visitas"
            subtitle="Análise de performance comercial e histórico de atendimento"
            filters={filters}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            loading={loading}
        >
            {/* Summary Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Volume Total</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalVisits}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                        <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mb-1">Taxa Realização</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{realizationRate}%</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-emerald-900/20 rounded-xl shadow-sm">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest mb-1">Foco Principal</p>
                        <p className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none truncate max-w-[150px]">{dominantTipo}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-indigo-900/20 rounded-xl shadow-sm">
                        <Target className="h-5 w-5 text-indigo-500" />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <th
                                className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors w-28"
                                onClick={() => handleSort('data')}
                            >
                                <div className="flex items-center gap-1">
                                    Data {sortField === 'data' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Prospect / Cidade</th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Tipo / Turno</th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Prioridade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm uppercase">{item.prospect_nome || item.prospect}</div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                            <MapPin className="h-3 w-3" />
                                            {item.cidade || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{item.tipo || 'N/A'}</div>
                                        <div className="text-[10px] text-slate-400">{item.turno || 'Turno N/A'}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${item.status === 'Realizada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30' :
                                                item.status === 'Agendada' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30' :
                                                    item.status === 'Atrasada' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' :
                                                        'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-700/50 dark:border-slate-700'
                                            }`}>
                                            {item.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-black ${item.prioridade === 'Alta' ? 'text-orange-600' :
                                                item.prioridade === 'Média' ? 'text-amber-500' :
                                                    'text-slate-400'
                                            }`}>
                                            {item.prioridade}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-slate-400 italic font-medium">
                                    Nenhuma visita encontrada com os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filteredData.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all active:scale-[0.98]">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : ''}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${item.status === 'Realizada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    item.status === 'Agendada' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                {item.status}
                            </span>
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase mb-1 leading-tight">{item.prospect_nome || item.prospect}</h3>
                        <div className="flex items-center gap-1.5 mb-4 text-[10px] text-slate-500">
                            <MapPin className="h-3 w-3" />
                            {item.cidade || 'Sim Cidade'}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <span className="p-1 px-1.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                                    {item.tipo}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">{item.turno}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase ${item.prioridade === 'Alta' ? 'text-orange-500' : 'text-slate-400'}`}>
                                {item.prioridade}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    #report-content { box-shadow: none !important; border: none !important; padding: 0 !important; }
                    table { font-size: 10px !important; }
                    th, td { padding: 8px 4px !important; }
                    .rounded-xl, .rounded-2xl { border-radius: 4px !important; }
                }
            `}</style>
        </ReportLayout>
    );
}

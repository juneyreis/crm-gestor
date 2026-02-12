import React, { useState, useEffect } from 'react';
import ReportLayout from '../../components/reports/ReportLayout';
import * as segmentosService from '../../services/segmentosService';
import useAuth from '../../hooks/useAuth';
import { generatePDF, printReport } from '../../utils/exportUtils';
import { Search, Filter, ArrowUpDown, PieChart, CheckCircle, XCircle } from 'lucide-react';

export default function SegmentosReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlotar, setFilterPlotar] = useState('all');
    const [sortField, setSortField] = useState('descricao');
    const [sortOrder, setSortOrder] = useState('asc');

    const { user } = useAuth();

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const result = await segmentosService.listarSegmentos(user.id);
            setData(result || []);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    // Filtering & Sorting Logic
    const filteredData = data
        .filter(item => {
            const matchesSearch = item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPlotar = filterPlotar === 'all' ||
                (filterPlotar === 'yes' && item.plotar) ||
                (filterPlotar === 'no' && !item.plotar);
            return matchesSearch && matchesPlotar;
        })
        .sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            // Specific handling for numeric IDs vs string descriptions
            if (sortField === 'id') {
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }

            const strA = valA?.toString().toUpperCase() || '';
            const strB = valB?.toString().toUpperCase() || '';

            if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
            if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
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
        generatePDF('report-content', 'relatorio-segmentos.pdf');
    };

    const handlePrint = () => {
        printReport('report-content');
    };

    // Calculate Summary Stats
    const totalSegmentos = data.length;
    const totalPlotados = data.filter(i => i.plotar).length;
    const totalNaoPlotados = totalSegmentos - totalPlotados;

    const filters = (
        <>
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Filtrar por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none transition-shadow"
                />
            </div>

            <select
                value={filterPlotar}
                onChange={(e) => setFilterPlotar(e.target.value)}
                className="w-full md:w-40 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none transition-shadow cursor-pointer"
            >
                <option value="all">Status: Todos</option>
                <option value="yes">Ativos</option>
                <option value="no">Inativos</option>
            </select>

            <div className="flex items-center justify-end px-2 text-xs text-gray-500 font-medium whitespace-nowrap min-w-[80px]">
                <Filter className="h-3 w-3 mr-1" />
                <span>{filteredData.length} registros</span>
            </div>
        </>
    );

    return (
        <ReportLayout
            title="Relatório de Segmentos"
            subtitle="Listagem analítica de segmentos de mercado"
            filters={filters}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            loading={loading}
        >
            {/* Summary Stats Header (Bonus) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Segmentos</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{totalSegmentos}</p>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                        <PieChart className="h-4 w-4 text-slate-400" />
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold tracking-wider mb-1">Ativos (Plotar)</p>
                        <p className="text-xl font-black text-green-700 dark:text-green-400">{totalPlotados}</p>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-green-900/20 rounded-full shadow-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/30 p-3 rounded-lg border border-gray-100 dark:border-slate-700/30 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Inativos</p>
                        <p className="text-xl font-black text-gray-700 dark:text-slate-300">{totalNaoPlotados}</p>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-700/50 rounded-full shadow-sm">
                        <XCircle className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <th
                                className="py-2 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors w-20"
                                onClick={() => handleSort('id')}
                            >
                                <div className="flex items-center gap-1">
                                    ID {sortField === 'id' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th
                                className="py-2 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                                onClick={() => handleSort('descricao')}
                            >
                                <div className="flex items-center gap-1">
                                    Descrição {sortField === 'descricao' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th
                                className="py-2 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-center w-28"
                                onClick={() => handleSort('plotar')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    Status {sortField === 'plotar' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredData.length > 0 ? (
                            filteredData.map((item, idx) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group print:even:bg-slate-50"
                                >
                                    <td className="py-2 px-4 text-sm font-mono text-slate-400 group-hover:text-slate-600 dark:text-slate-500 transition-colors">
                                        {item.id}
                                    </td>
                                    <td className="py-2 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {item.descricao}
                                    </td>
                                    <td className="py-2 px-4 text-sm text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${item.plotar
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                            }`}>
                                            {item.plotar && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                                            {item.plotar ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="py-8 text-center text-slate-400 italic bg-slate-50/30 dark:bg-slate-800/20 rounded-lg m-4">
                                    Nenhum registro encontrado para os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View (Hidden on Desktop, Visible on Mobile) */}
            <div className="md:hidden space-y-4">
                {filteredData.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm animate-fade-in-up">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-mono text-slate-400">{item.id}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${item.plotar
                                ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                {item.plotar ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-1">{item.descricao}</h3>
                    </div>
                ))}
                {filteredData.length === 0 && (
                    <div className="py-12 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                        Nenhum registro encontrado.
                    </div>
                )}
            </div>

            {/* Print Footer Styles */}
            <div className="print-styles">
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @media print {
                            .no-print { display: none !important; }
                            /* Force table layout on print even for mobile width simulations */
                            .md\\:hidden { display: none !important; }
                            .md\\:block { display: block !important; }
                            /* Remove shadows and simplified borders for clean print */
                            .shadow-sm { box-shadow: none !important; }
                            .border { border-color: #e2e8f0 !important; }
                        }
                    `
                }} />
            </div>
        </ReportLayout>
    );
}

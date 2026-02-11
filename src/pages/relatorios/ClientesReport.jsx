import React, { useState, useEffect } from 'react';
import ReportLayout from '../../components/reports/ReportLayout';
import * as clientesService from '../../services/clientesService';
import * as segmentosService from '../../services/segmentosService';
import * as vendedoresService from '../../services/vendedoresService';
import useAuth from '../../hooks/useAuth';
import { generatePDF, printReport } from '../../utils/exportUtils';
import { Search, Filter, ArrowUpDown, Users, DollarSign, Star, TrendingUp, MapPin, Calendar, FileText, PieChart } from 'lucide-react';

export default function ClientesReport() {
    const [data, setData] = useState([]);
    const [segmentos, setSegmentos] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSegmento, setFilterSegmento] = useState('all');
    const [filterVendedor, setFilterVendedor] = useState('all');
    const [filterSatisfacao, setFilterSatisfacao] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Ordenação
    const [sortField, setSortField] = useState('nome');
    const [sortOrder, setSortOrder] = useState('asc');

    const { user } = useAuth();

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [clientesData, segmentsData, sellersData] = await Promise.all([
                clientesService.listar(user.id),
                segmentosService.listarSegmentos(user.id),
                vendedoresService.listarVendedores(user.id)
            ]);

            setData(clientesData || []);
            setSegmentos(segmentsData || []);
            setVendedores(sellersData || []);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório de clientes:', error);
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
            const clientName = item.prospects?.nome || item.nome || '';
            const matchesSearch =
                (clientName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.cidade || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.cnpj_cpf || '').includes(searchTerm);

            const matchesSegmento = filterSegmento === 'all' || item.segmento_id?.toString() === filterSegmento;
            const matchesVendedor = filterVendedor === 'all' || item.vendedor_id?.toString() === filterVendedor;
            const matchesSatisfacao = filterSatisfacao === 'all' || item.nivel_satisfacao === filterSatisfacao;

            const contractDate = item.data_inicio_contrato;
            const matchesDateFrom = !dateFrom || (contractDate && contractDate >= dateFrom);
            const matchesDateTo = !dateTo || (contractDate && contractDate <= dateTo);

            return matchesSearch && matchesSegmento && matchesVendedor && matchesSatisfacao && matchesDateFrom && matchesDateTo;
        })
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === 'valor_contrato') {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
            } else if (sortField === 'nome') {
                valA = a.prospects?.nome?.toUpperCase() || a.nome?.toUpperCase() || '';
                valB = b.prospects?.nome?.toUpperCase() || b.nome?.toUpperCase() || '';
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
        generatePDF('report-content', 'relatorio-clientes.pdf');
    };

    const handlePrint = () => {
        printReport('report-content');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // Cálculos de Resumo (KPIs)
    const totalClients = data.length;
    const totalMRR = data.reduce((acc, curr) => acc + (parseFloat(curr.valor_contrato) || 0), 0);

    // Média de Satisfação (estrelas)
    const activeClientsWithSatisfaction = data.filter(c => c.nivel_satisfacao);
    const starMap = { '⭐': 1, '⭐⭐': 2, '⭐⭐⭐': 3, '⭐⭐⭐⭐': 4, '⭐⭐⭐⭐⭐': 5 };
    const avgSatisfactionRaw = activeClientsWithSatisfaction.length > 0
        ? activeClientsWithSatisfaction.reduce((acc, curr) => acc + starMap[curr.nivel_satisfacao], 0) / activeClientsWithSatisfaction.length
        : 0;
    const avgSatisfactionPercent = Math.round((avgSatisfactionRaw / 5) * 100);

    const filters = (
        <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, cidade ou documento..."
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
                            title="Início Contrato De"
                        />
                    </div>
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
                            title="Início Contrato Até"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                    value={filterSegmento}
                    onChange={(e) => setFilterSegmento(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Segmento: Todos</option>
                    {segmentos.map(s => <option key={s.id} value={s.id}>{s.descricao}</option>)}
                </select>

                <select
                    value={filterVendedor}
                    onChange={(e) => setFilterVendedor(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Vendedor: Todos</option>
                    {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                </select>

                <select
                    value={filterSatisfacao}
                    onChange={(e) => setFilterSatisfacao(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer text-yellow-500 font-bold"
                >
                    <option value="all" className="text-slate-700 font-normal">Satisfação: Todas</option>
                    <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐ Excelente</option>
                    <option value="⭐⭐⭐⭐">⭐⭐⭐⭐ Muito Bom</option>
                    <option value="⭐⭐⭐">⭐⭐⭐ Bom</option>
                    <option value="⭐⭐">⭐⭐ Regular</option>
                    <option value="⭐">⭐ Ruim</option>
                </select>
            </div>

            <div className="flex items-center justify-end px-2 text-xs text-slate-500 font-medium">
                <Filter className="h-3 w-3 mr-1" />
                <span>{filteredData.length} clientes na visualização</span>
            </div>
        </div>
    );

    return (
        <ReportLayout
            title="Relatório de Clientes"
            subtitle="Análise financeira, contratual e de satisfação da base instalada"
            filters={filters}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            loading={loading}
        >
            {/* Summary Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Base Ativa</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalClients}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                        <Users className="h-5 w-5 text-blue-500" />
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mb-1">MRR Total (Mensal)</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{formatCurrency(totalMRR)}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-emerald-900/20 rounded-xl shadow-sm">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-black tracking-widest mb-1">Satisfação Média</p>
                        <p className="text-2xl font-black text-amber-700 dark:text-amber-400 leading-none">{avgSatisfactionPercent}%</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-amber-900/20 rounded-xl shadow-sm">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <th
                                className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors"
                                onClick={() => handleSort('nome')}
                            >
                                <div className="flex items-center gap-1">
                                    Cliente / Endereço {sortField === 'nome' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Categorias / Local</th>
                            <th
                                className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors"
                                onClick={() => handleSort('valor_contrato')}
                            >
                                <div className="flex items-center gap-1">
                                    Contrato {sortField === 'valor_contrato' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Contato / Início</th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status / Satisfação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm uppercase">{item.prospects?.nome || item.nome || 'NOME N/A'}</div>
                                        <div className="text-[10px] text-slate-400 font-medium line-clamp-1">{item.endereco || 'SEM ENDEREÇO'}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                                <PieChart className="h-3 w-3 text-slate-400" />
                                                {item.segmentos?.descricao || 'Sem Segmento'}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 capitalize">
                                                <MapPin className="h-3 w-3" />
                                                {item.cidade || 'Sim Cidade'} - {item.uf || '--'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-black text-slate-900 dark:text-white text-sm">{formatCurrency(item.valor_contrato)}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.tipo_contrato || 'MENSAL'}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                                            {item.contato_principal || 'N/A'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 italic">
                                            Início: {item.data_inicio_contrato ? new Date(item.data_inicio_contrato).toLocaleDateString('pt-BR') : '-'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-center">
                                        <div className="text-amber-500 text-xs mb-1 drop-shadow-sm">{item.nivel_satisfacao || '---'}</div>
                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-tighter border border-blue-100 dark:border-blue-900/30">
                                            Ativo
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-slate-400 italic font-medium">
                                    Nenhum cliente encontrado com os critérios de busca.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
                {filteredData.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all active:scale-[0.98]">
                        <div className="flex justify-between items-start mb-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 text-[8px] font-black uppercase tracking-tighter">
                                {item.segmentos?.descricao || 'GERAL'}
                            </span>
                            <div className="text-amber-500 text-[10px]">{item.nivel_satisfacao}</div>
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase mb-1 leading-tight">{item.prospects?.nome || item.nome || 'NOME N/A'}</h3>
                        <div className="flex items-center gap-1.5 mb-4 text-[10px] text-slate-500">
                            <MapPin className="h-3 w-3" />
                            {item.cidade || 'Sim Cidade'}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                            <div>
                                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Faturamento</p>
                                <p className="text-xs font-black text-emerald-600">{formatCurrency(item.valor_contrato)}</p>
                            </div>
                            <div>
                                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Vendedor</p>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{item.vendedores?.nome || 'N/A'}</p>
                            </div>
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

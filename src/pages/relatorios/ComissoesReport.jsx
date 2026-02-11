import React, { useState, useEffect } from 'react';
import ReportLayout from '../../components/reports/ReportLayout';
import * as comissoesService from '../../services/comissoesService';
import * as vendedoresService from '../../services/vendedoresService';
import useAuth from '../../hooks/useAuth';
import { generatePDF, printReport } from '../../utils/exportUtils';
import { Search, Filter, ArrowUpDown, Wallet, CheckCircle2, Clock, Calendar, TrendingUp, DollarSign, User, FileText } from 'lucide-react';

export default function ComissoesReport() {
    const [data, setData] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVendedor, setFilterVendedor] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Ordenação
    const [sortField, setSortField] = useState('vencimento');
    const [sortOrder, setSortOrder] = useState('desc');

    const { user } = useAuth();

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [comissoesData, sellersData] = await Promise.all([
                comissoesService.listarComissoes(user.id),
                vendedoresService.listarVendedores(user.id)
            ]);

            setData(comissoesData || []);
            setVendedores(sellersData || []);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório de comissões:', error);
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
            const clientName = item.clientes?.prospects?.nome || '';
            const matchesSearch =
                clientName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesVendedor = filterVendedor === 'all' || item.vendedor_id?.toString() === filterVendedor;
            const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

            const vencDate = item.vencimento;
            const matchesDateFrom = !dateFrom || (vencDate && vencDate >= dateFrom);
            const matchesDateTo = !dateTo || (vencDate && vencDate <= dateTo);

            return matchesSearch && matchesVendedor && matchesStatus && matchesDateFrom && matchesDateTo;
        })
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === 'valor_comissao') {
                valA = parseFloat(valA) || 0;
                valB = parseFloat(valB) || 0;
            } else if (sortField === 'cliente') {
                valA = a.clientes?.prospects?.nome?.toUpperCase() || '';
                valB = b.clientes?.prospects?.nome?.toUpperCase() || '';
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
        generatePDF('report-content', 'relatorio-comissoes.pdf');
    };

    const handlePrint = () => {
        printReport('report-content');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // Cálculos de Resumo (KPIs)
    const totalComission = filteredData.reduce((acc, curr) => acc + (parseFloat(curr.valor_comissao) || 0), 0);
    const paidComission = filteredData
        .filter(item => item.status === 'PAGA')
        .reduce((acc, curr) => acc + (parseFloat(curr.valor_comissao) || 0), 0);
    const pendingComission = filteredData
        .filter(item => item.status === 'PENDENTE')
        .reduce((acc, curr) => acc + (parseFloat(curr.valor_comissao) || 0), 0);

    const filters = (
        <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
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
                            title="Vencimento De"
                        />
                    </div>
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
                            title="Vencimento Até"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                    value={filterVendedor}
                    onChange={(e) => setFilterVendedor(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Vendedor: Todos</option>
                    {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Status: Todos</option>
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="PAGA">PAGA</option>
                    <option value="CANCELADA">CANCELADA</option>
                </select>
            </div>

            <div className="flex items-center justify-end px-2 text-xs text-slate-500 font-medium">
                <Filter className="h-3 w-3 mr-1" />
                <span>{filteredData.length} registros no período</span>
            </div>
        </div>
    );

    return (
        <ReportLayout
            title="Relatório de Comissões"
            subtitle="Fechamento financeiro e controle de comissionamento"
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
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{formatCurrency(totalComission)}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                        <Wallet className="h-5 w-5 text-blue-500" />
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mb-1">Comissões Pagas</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{formatCurrency(paidComission)}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-emerald-900/20 rounded-xl shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-black tracking-widest mb-1">Total Pendente</p>
                        <p className="text-2xl font-black text-amber-700 dark:text-amber-400 leading-none">{formatCurrency(pendingComission)}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-amber-900/20 rounded-xl shadow-sm">
                        <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <th
                                className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                                onClick={() => handleSort('cliente')}
                            >
                                <div className="flex items-center gap-1">
                                    Cliente {sortField === 'cliente' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Vendedor</th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Vigência</th>
                            <th
                                className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                                onClick={() => handleSort('vencimento')}
                            >
                                <div className="flex items-center gap-1">
                                    Vencimento {sortField === 'vencimento' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th
                                className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                                onClick={() => handleSort('valor_comissao')}
                            >
                                <div className="flex items-center gap-1">
                                    Valor {sortField === 'valor_comissao' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm uppercase">
                                            {item.clientes?.prospects?.nome || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                            <User className="h-3 w-3 text-slate-400" />
                                            {item.vendedores?.nome || 'Não definido'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.vigencia || '--/----'}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {item.vencimento ? new Date(item.vencimento.split('T')[0] + "T12:00:00").toLocaleDateString('pt-BR') : '-'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-black text-slate-900 dark:text-white text-sm">
                                            {formatCurrency(item.valor_comissao)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter uppercase border ${item.status === 'PAGA'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                : item.status === 'CANCELADA'
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-slate-400 italic font-medium">
                                    Nenhum registro de comissão encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
                {filteredData.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${item.status === 'PAGA' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {item.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{item.vigencia}</span>
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase mb-1 leading-tight">
                            {item.clientes?.prospects?.nome || 'CLIENTE N/A'}
                        </h3>
                        <div className="flex items-center gap-1.5 mb-4 text-[10px] text-slate-500">
                            <User className="h-3 w-3" />
                            {item.vendedores?.nome || 'Geral'}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
                            <div>
                                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Vencimento</p>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {item.vencimento ? new Date(item.vencimento.split('T')[0] + "T12:00:00").toLocaleDateString('pt-BR') : '-'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Valor</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.valor_comissao)}</p>
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

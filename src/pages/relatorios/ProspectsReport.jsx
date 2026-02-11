import React, { useState, useEffect } from 'react';
import ReportLayout from '../../components/reports/ReportLayout';
import * as prospectsService from '../../services/prospectsService';
import * as segmentosService from '../../services/segmentosService';
import * as vendedoresService from '../../services/vendedoresService';
import * as concorrentesService from '../../services/concorrentesService';
import useAuth from '../../hooks/useAuth';
import { generatePDF, printReport } from '../../utils/exportUtils';
import { Search, Filter, ArrowUpDown, Users, Target, Briefcase, MapPin, Phone, Mail, Building2, TrendingUp } from 'lucide-react';

export default function ProspectsReport() {
    const [data, setData] = useState([]);
    const [segmentos, setSegmentos] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [concorrentes, setConcorrentes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSegmento, setFilterSegmento] = useState('all');
    const [filterVendedor, setFilterVendedor] = useState('all');
    const [filterConcorrente, setFilterConcorrente] = useState('all');

    // Ordenação
    const [sortField, setSortField] = useState('nome');
    const [sortOrder, setSortOrder] = useState('asc');

    const { user } = useAuth();

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [prospectsData, segmentsData, sellersData, competitorsData] = await Promise.all([
                prospectsService.listar(user.id),
                segmentosService.listarSegmentos(user.id),
                vendedoresService.listarVendedores(user.id),
                concorrentesService.listarConcorrentes(user.id)
            ]);

            setData(prospectsData || []);
            setSegmentos(segmentsData || []);
            setVendedores(sellersData || []);
            setConcorrentes(competitorsData || []);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório de prospects:', error);
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
                item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.cidade && item.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesSegmento = filterSegmento === 'all' || item.segmento_id?.toString() === filterSegmento;
            const matchesVendedor = filterVendedor === 'all' || item.vendedor_id?.toString() === filterVendedor;
            const matchesConcorrente = filterConcorrente === 'all' || item.concorrente_id?.toString() === filterConcorrente;

            return matchesSearch && matchesSegmento && matchesVendedor && matchesConcorrente;
        })
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            // Tratamento especial para nomes e buscas textuais
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
        generatePDF('report-content', 'relatorio-prospects.pdf');
    };

    const handlePrint = () => {
        printReport('report-content');
    };

    // Cálculos de Resumo (KPIs)
    const totalProspects = data.length;
    const citiesCount = new Set(data.map(i => i.cidade).filter(Boolean)).size;

    // Segmento Dominante
    const segmentoCounts = data.reduce((acc, item) => {
        const desc = item.segmentos?.descricao || 'N/A';
        acc[desc] = (acc[desc] || 0) + 1;
        return acc;
    }, {});
    const dominantSegment = Object.entries(segmentoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const filters = (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Filtrar por nome, cidade ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none transition-shadow"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                    value={filterSegmento}
                    onChange={(e) => setFilterSegmento(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Segmento: Todos</option>
                    {segmentos.map(s => <option key={s.id} value={s.id}>{s.descricao}</option>)}
                </select>

                <select
                    value={filterVendedor}
                    onChange={(e) => setFilterVendedor(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Vendedor: Todos</option>
                    {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                </select>

                <select
                    value={filterConcorrente}
                    onChange={(e) => setFilterConcorrente(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none cursor-pointer"
                >
                    <option value="all">Concorrente: Todos</option>
                    {concorrentes.map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}
                </select>
            </div>

            <div className="flex items-center justify-end px-2 text-xs text-gray-500 font-medium">
                <Filter className="h-3 w-3 mr-1" />
                <span>{filteredData.length} registros encontrados</span>
            </div>
        </div>
    );

    return (
        <ReportLayout
            title="Relatório de Prospects"
            subtitle="Análise de oportunidades e pipeline de novos negócios"
            filters={filters}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            loading={loading}
        >
            {/* Summary Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Leads</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalProspects}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                        <Users className="h-5 w-5 text-blue-500" />
                    </div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest mb-1">Cidades</p>
                        <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 leading-none">{citiesCount}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-indigo-900/20 rounded-xl shadow-sm">
                        <MapPin className="h-5 w-5 text-indigo-500" />
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mb-1">Top Segmento</p>
                        <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-none truncate max-w-[150px]">{dominantSegment}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-emerald-900/20 rounded-xl shadow-sm">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider w-16">ID</th>
                            <th
                                className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors"
                                onClick={() => handleSort('nome')}
                            >
                                <div className="flex items-center gap-1">
                                    Prospect {sortField === 'nome' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Contato/Cidade</th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Categorias</th>
                            <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Data Cad.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 px-4 text-xs font-mono text-slate-400">{item.id}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm uppercase">{item.nome}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{item.contato || 'N/A'}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 capitalize">
                                                <MapPin className="h-3 w-3 text-slate-300" />
                                                {item.cidade || 'Sim Cidade'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                <Phone className="h-3 w-3 text-emerald-500/30" />
                                                {item.celular || item.telefone || 'Sem Fone'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.segmentos?.descricao && (
                                                <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-tighter">
                                                    {item.segmentos.descricao}
                                                </span>
                                            )}
                                            {item.concorrentes?.descricao && (
                                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-tighter border border-slate-200 dark:border-slate-700">
                                                    {item.concorrentes.descricao}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-xs font-medium text-slate-500">
                                        {item.data_cadastro ? new Date(item.data_cadastro).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-slate-400 italic font-medium">
                                    Nenhuma oportunidade encontrada com os filtros atuais.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filteredData.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-mono text-slate-400">#{item.id}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{item.data_cadastro ? new Date(item.data_cadastro).toLocaleDateString('pt-BR') : ''}</span>
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase mb-1">{item.nome}</h3>
                        <p className="text-xs text-slate-500 mb-4">{item.cidade || 'Localização não informada'}</p>

                        <div className="flex flex-wrap gap-2">
                            {item.segmentos?.descricao && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase">
                                    <Target className="h-2.5 w-2.5" />
                                    {item.segmentos.descricao}
                                </div>
                            )}
                            {item.celular && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase">
                                    <Phone className="h-2.5 w-2.5" />
                                    {item.celular}
                                </div>
                            )}
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
                }
            `}</style>
        </ReportLayout>
    );
}

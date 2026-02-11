import React, { useState, useEffect } from 'react';
import ReportLayout from '../../components/reports/ReportLayout';
import * as vendedoresService from '../../services/vendedoresService';
import useAuth from '../../hooks/useAuth';
import { generatePDF, printReport } from '../../utils/exportUtils';
import { Search, Filter, ArrowUpDown, UserCheck, Map, Globe, Phone, Mail, MapPin } from 'lucide-react';

export default function VendedoresReport() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUF, setFilterUF] = useState('all');
    const [sortField, setSortField] = useState('nome');
    const [sortOrder, setSortOrder] = useState('asc');

    const { user } = useAuth();

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const result = await vendedoresService.listarVendedores(user.id);
            setData(result || []);
        } catch (error) {
            console.error('Erro ao carregar dados do relatório de vendedores:', error);
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
            const matchesSearch =
                item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.cidade && item.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.celular && item.celular.includes(searchTerm));
            const matchesUF = filterUF === 'all' || item.uf === filterUF;
            return matchesSearch && matchesUF;
        })
        .sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

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
        generatePDF('report-content', 'relatorio-vendedores.pdf');
    };

    const handlePrint = () => {
        printReport('report-content');
    };

    // Calculate Summary Stats
    const totalVendedores = data.length;
    const uniqueCities = new Set(data.map(i => i.cidade).filter(Boolean)).size;
    const uniqueUFs = new Set(data.map(i => i.uf).filter(Boolean)).size;
    const ufs = [...new Set(data.map(i => i.uf).filter(Boolean))].sort();

    const filters = (
        <>
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Filtrar por nome, cidade ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none transition-shadow"
                />
            </div>

            <select
                value={filterUF}
                onChange={(e) => setFilterUF(e.target.value)}
                className="w-full md:w-40 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900 focus:ring-1 focus:ring-slate-400 outline-none transition-shadow cursor-pointer"
            >
                <option value="all">UF: Todas</option>
                {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf.toUpperCase()}</option>
                ))}
            </select>

            <div className="flex items-center justify-end px-2 text-xs text-gray-500 font-medium whitespace-nowrap min-w-[80px]">
                <Filter className="h-3 w-3 mr-1" />
                <span>{filteredData.length} registros</span>
            </div>
        </>
    );

    return (
        <ReportLayout
            title="Relatório de Vendedores"
            subtitle="Listagem analítica da equipe comercial e cobertura regional"
            filters={filters}
            onExportPDF={handleExportPDF}
            onPrint={handlePrint}
            loading={loading}
        >
            {/* Summary Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Vendedores</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{totalVendedores}</p>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                        <UserCheck className="h-4 w-4 text-slate-400" />
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider mb-1">Cidades Atendidas</p>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{uniqueCities}</p>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-emerald-900/20 rounded-full shadow-sm">
                        <Map className="h-4 w-4 text-emerald-500" />
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider mb-1">Cobertura (UFs)</p>
                        <p className="text-xl font-black text-amber-700 dark:text-amber-400">{uniqueUFs}</p>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-amber-900/20 rounded-full shadow-sm">
                        <Globe className="h-4 w-4 text-amber-500" />
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
                                onClick={() => handleSort('nome')}
                            >
                                <div className="flex items-center gap-1">
                                    Nome {sortField === 'nome' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th
                                className="py-2 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                                onClick={() => handleSort('cidade')}
                            >
                                <div className="flex items-center gap-1">
                                    Cidade/UF {sortField === 'cidade' && <ArrowUpDown className="h-3 w-3" />}
                                </div>
                            </th>
                            <th className="py-2 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                Contato
                            </th>
                            <th className="py-2 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                Endereço
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group print:even:bg-slate-50"
                                >
                                    <td className="py-3 px-4 text-xs font-mono text-slate-400 group-hover:text-slate-600 dark:text-slate-500 transition-colors">
                                        {item.id}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {item.nome}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                            {item.cidade ? (
                                                <>
                                                    <MapPin className="h-3 h-3 text-slate-300" />
                                                    <span>{item.cidade}{item.uf ? ` - ${item.uf}` : ''}</span>
                                                </>
                                            ) : (
                                                <span className="text-slate-300 italic">Não informada</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {item.celular ? (
                                                <>
                                                    <Phone className="h-3 w-3 text-emerald-500/50" />
                                                    <span>{item.celular}</span>
                                                </>
                                            ) : (
                                                <span className="text-slate-300 italic">N/A</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-xs text-slate-500 dark:text-slate-500 max-w-xs truncate" title={item.endereco}>
                                            {item.endereco || '-'}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-12 text-center text-slate-400 italic bg-slate-50/30 dark:bg-slate-800/20">
                                    Nenhum vendedor encontrado para os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredData.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm animate-fade-in-up">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-mono text-slate-400">{item.id}</span>
                            <div className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                {item.uf || 'Brasil'}
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">{item.nome}</h3>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span>{item.cidade || 'Cidade não inf.'} {item.uf ? `(${item.uf})` : ''}</span>
                            </div>
                            {item.celular && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Phone className="h-4 w-4 text-emerald-500" />
                                    <span>{item.celular}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredData.length === 0 && (
                    <div className="py-12 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                        Nenhum registro encontrado.
                    </div>
                )}
            </div>

            {/* Print Footer Styles */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .md\\:hidden { display: none !important; }
                    .md\\:block { display: block !important; }
                    .shadow-sm { box-shadow: none !important; }
                    .border { border-color: #e2e8f0 !important; }
                }
            `}</style>
        </ReportLayout>
    );
}

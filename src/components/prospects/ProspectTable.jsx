// src/components/prospects/ProspectTable.jsx
import { useState } from 'react';
import { Edit2, Trash2, Eye, Building, MapPin, Phone, User, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabaseClient as supabase } from '../../lib/supabaseClient';
import useAuth from '../../hooks/useAuth';
import * as prospectsService from '../../services/prospectsService';

const getClassificationColor = (classification) => {
    switch (classification) {
        case 'Ice': return 'bg-[#E0F7FA] text-cyan-800 border-cyan-200';
        case 'Cold': return 'bg-[#B3E5FC] text-blue-800 border-blue-200';
        case 'Warm': return 'bg-[#FFECB3] text-orange-800 border-orange-200';
        case 'Hot': return 'bg-[#FFCDD2] text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function ProspectTable({ prospects, onEdit, onRefresh }) {
    const { user } = useAuth();
    const [sortColumn, setSortColumn] = useState('data_cadastro');
    const [sortDirection, setSortDirection] = useState('desc');
    const [deletingId, setDeletingId] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
        } catch (error) {
            return dateString;
        }
    };

    const sortedProspects = [...prospects].sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (sortColumn === 'data_cadastro') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (typeof aValue === 'string') aValue = aValue.toUpperCase();
        if (typeof bValue === 'string') bValue = bValue.toUpperCase();

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleDelete = async (id, nome) => {
        if (!confirm(`Tem certeza que deseja excluir o prospect "${nome}"?`)) return;

        setDeletingId(id);
        try {
            await prospectsService.remover(id);
            if (onRefresh) onRefresh();
        } catch (error) {
            alert('Erro ao excluir prospect. Tente novamente.');
        } finally {
            setDeletingId(null);
        }
    };

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
    };

    if (prospects.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden">
            {/* Tabela Desktop */}
            <div className="hidden md:block max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 border-separate border-spacing-0">
                    <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 border-b border-gray-200 dark:border-slate-700" onClick={() => handleSort('nome')}>
                                <div className="flex items-center">
                                    <Building className="h-4 w-4 mr-2" />
                                    Nome
                                    <SortIcon column="nome" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 border-b border-gray-200 dark:border-slate-700" onClick={() => handleSort('classificacao')}>
                                <div className="flex items-center">
                                    Classificação
                                    <SortIcon column="classificacao" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 border-b border-gray-200 dark:border-slate-700" onClick={() => handleSort('status')}>
                                Status
                                <SortIcon column="status" />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                                Contato
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                                Cidade/UF
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {sortedProspects.map((p) => (
                            <tr key={p.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer" onDoubleClick={() => onEdit(p)}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white uppercase">{p.nome}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(p.data_cadastro)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getClassificationColor(p.classificacao)}`}>
                                        {p.classificacao || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600">
                                        {p.status || 'Novo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900 dark:text-gray-200">{p.telefone || p.celular || '-'}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{p.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-gray-200 uppercase">{p.cidade}/{p.uf}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{p.bairro}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(p)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id, p.nome)}
                                            disabled={deletingId === p.id}
                                            className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            {deletingId === p.id ? <div className="h-4 w-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full" /> : <Trash2 className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
                {sortedProspects.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm" onDoubleClick={() => onEdit(p)}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-900">{p.nome}</h3>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getClassificationColor(p.classificacao)}`}>
                                    {p.classificacao || 'N/A'}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => onEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(p.id, p.nome)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex gap-2 items-center">
                                <MapPin className="h-4 w-4" /> {p.cidade}/{p.uf} - {p.bairro}
                            </div>
                            <div className="flex gap-2 items-center">
                                <Phone className="h-4 w-4" /> {p.telefone || p.celular}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

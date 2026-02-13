import { useState } from 'react';
import { Edit2, Trash2, Calendar, MapPin, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, User, DollarSign, FileText, Star, Hash, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAuth from '../../hooks/useAuth';
import * as clientesService from '../../services/clientesService';

export default function ClienteTable({ clientes, onEdit, onRefresh, onDelete }) {
    const { user } = useAuth();
    const [sortColumn, setSortColumn] = useState('data_inicio_contrato');
    const [sortDirection, setSortDirection] = useState('desc');

    // Formatar data
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
        } catch (error) {
            return dateString;
        }
    };

    // Formatar Moeda
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Formatar Percentual
    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0,00%';
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value) + '%';
    };

    // Badges
    const getSatisfacaoBadge = (nivel) => {
        return "text-yellow-500 font-bold tracking-widest";
    }

    const getContratoBadge = (tipo) => {
        const styles = {
            'Mensal': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Trimestral': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
            'Semestral': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
            'Anual': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
            'Avulso': 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-slate-600'
        };
        return styles[tipo] || styles['Mensal'];
    };

    // Ordenar
    const sortedClientes = [...clientes].sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (sortColumn === 'nome') {
            aValue = a.prospects?.nome || '';
            bValue = b.prospects?.nome || '';
        }

        if (sortColumn === 'valor_contrato' || sortColumn === 'comissao') {
            aValue = parseFloat(aValue || 0);
            bValue = parseFloat(bValue || 0);
        }

        if (typeof aValue === 'string') aValue = aValue.toUpperCase();
        if (typeof bValue === 'string') bValue = bValue.toUpperCase();

        return sortDirection === 'asc'
            ? (aValue > bValue ? 1 : -1)
            : (aValue < bValue ? 1 : -1);
    });

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
    };

    if (clientes.length === 0) return null;

    return (
        <div className="overflow-hidden">
            {/* 🖥️ Tabela Desktop */}
            <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th onClick={() => handleSort('nome')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                <div className="flex items-center">Cliente <SortIcon column="nome" /></div>
                            </th>
                            <th onClick={() => handleSort('valor_contrato')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                <div className="flex items-center">Valor / Comis. <SortIcon column="valor_contrato" /></div>
                            </th>
                            <th onClick={() => handleSort('data_renovacao_contrato')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                <div className="flex items-center">Renovação <SortIcon column="data_renovacao_contrato" /></div>
                            </th>
                            <th onClick={() => handleSort('tipo_contrato')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                <div className="flex items-center">Contrato <SortIcon column="tipo_contrato" /></div>
                            </th>
                            <th onClick={() => handleSort('nivel_satisfacao')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                <div className="flex items-center">Satisfação <SortIcon column="nivel_satisfacao" /></div>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Local
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {sortedClientes.map((cliente) => (
                            <tr
                                key={cliente.id}
                                className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                onDoubleClick={() => onEdit(cliente)}
                            >
                                {/* Nome */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {cliente.prospects?.nome || 'Sem Nome'}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {cliente.segmentos?.descricao && (
                                                <span className="text-xs text-gray-500">
                                                    {cliente.segmentos.descricao}
                                                </span>
                                            )}
                                            {cliente.contato_principal && (
                                                <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                                                    👤 {cliente.contato_principal}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Valor */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-emerald-600">
                                            {formatCurrency(cliente.valor_contrato)}
                                        </span>
                                        {cliente.comissao > 0 && (
                                            <span className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                                                <Percent className="h-2.5 w-2.5" /> {formatPercent(cliente.comissao)}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Renovação */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                                            {formatDate(cliente.data_renovacao_contrato)}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            Início: {formatDate(cliente.data_inicio_contrato)}
                                        </span>
                                    </div>
                                </td>

                                {/* Contrato */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getContratoBadge(cliente.tipo_contrato)}`}>
                                        {cliente.tipo_contrato}
                                    </span>
                                </td>

                                {/* Satisfação */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getSatisfacaoBadge(cliente.nivel_satisfacao)}>
                                        {cliente.nivel_satisfacao}
                                    </span>
                                </td>

                                {/* Local */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col max-w-[200px]">
                                        <span className="text-sm text-gray-900 dark:text-white truncate">{cliente.cidade}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={cliente.endereco}>
                                            {cliente.uf}
                                        </span>
                                    </div>
                                </td>

                                {/* Ações */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-start gap-1 pl-1">
                                        <button
                                            onClick={() => onEdit(cliente)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(cliente.id, cliente.prospects?.nome)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 📱 Cards Mobile */}
            <div className="lg:hidden space-y-4 p-4">
                {sortedClientes.map((cliente) => (
                    <div
                        key={cliente.id}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm active:scale-[0.99] transition-transform"
                        onDoubleClick={() => onEdit(cliente)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border mb-2 ${getContratoBadge(cliente.tipo_contrato)}`}>
                                    {cliente.tipo_contrato}
                                </span>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                    {cliente.prospects?.nome || 'Sem Nome'}
                                </h3>
                                {cliente.contato_principal && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium italic">
                                        {cliente.contato_principal}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-1 -mr-2 -mt-2">
                                <button onClick={() => onEdit(cliente)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 className="h-5 w-5" /></button>
                                <button onClick={() => onDelete(cliente.id, cliente.prospects?.nome)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4">
                            <div className="col-span-2 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-bold text-emerald-600 text-lg">{formatCurrency(cliente.valor_contrato)}</span>
                                    {cliente.comissao > 0 && (
                                        <span className="text-[10px] text-orange-600 font-bold -mt-1">
                                            Comis: {formatPercent(cliente.comissao)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-yellow-500 tracking-widest text-sm font-bold">{cliente.nivel_satisfacao}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(cliente.data_renovacao_contrato)}</span>
                                    <span className="text-[10px] dark:text-gray-400">Renovação</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="dark:text-gray-300">{cliente.cidade}/{cliente.uf}</span>
                            </div>
                        </div>

                        {cliente.segmentos?.descricao && (
                            <div className="pt-3 border-t border-gray-100 dark:border-slate-700 mt-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    {cliente.segmentos?.descricao} {cliente.cnpj_cpf && `• ${cliente.cnpj_cpf}`}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}


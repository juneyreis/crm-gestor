import { Edit2, Trash2, CheckCircle, Clock, XCircle, ChevronUp, ChevronDown, Wallet } from 'lucide-react';
import { useState } from 'react';
import * as comissoesService from '../../services/comissoesService';
import ConfirmationModal from '../modals/ConfirmationModal';
import ComissaoMobileCard from './ComissaoMobileCard';

const formatCurrency = (val) => val?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
        const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('pt-BR');
    } catch {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    }
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'PAGA': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'CANCELADA': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        default: return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'PAGA': return <CheckCircle size={14} />;
        case 'CANCELADA': return <XCircle size={14} />;
        default: return <Clock size={14} />;
    }
};

const SortIcon = ({ col, sortColumn, sortDirection }) => {
    if (sortColumn !== col) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
};

export default function ComissaoTable({
    comissoes,
    loading,
    onEdit,
    onRefresh,
    hasActiveFilters
}) {
    const [sortColumn, setSortColumn] = useState('vencimento');
    const [sortDirection, setSortDirection] = useState('desc');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    if (loading && comissoes.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando comissões...</p>
            </div>
        );
    }

    if (comissoes.length === 0) {
        return (
            <div className="p-12 text-center flex flex-col items-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <Wallet className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {hasActiveFilters ? "Nenhuma comissão encontrada" : "Nenhuma comissão registrada"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    {hasActiveFilters
                        ? "Tente ajustar os filtros para encontrar o que procura."
                        : "Comece registrando o lançamento de uma nova comissão."}
                </p>
            </div>
        );
    }

    const getClienteNome = (com) => {
        const cliente = Array.isArray(com.clientes) ? com.clientes[0] : com.clientes;
        const prospect = Array.isArray(cliente?.prospects) ? cliente.prospects[0] : cliente?.prospects;
        return prospect?.nome || 'Cliente não encontrado';
    };

    const getVendedorNome = (com) => {
        const vendedor = Array.isArray(com.vendedores) ? com.vendedores[0] : com.vendedores;
        return vendedor?.nome || 'Vendedor não encontrado';
    };

    const sortedComissoes = [...comissoes].sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        if (sortColumn === 'cliente') aVal = getClienteNome(a);
        if (sortColumn === 'vendedor') aVal = getVendedorNome(a);

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const confirmDelete = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await comissoesService.excluirComissao(itemToDelete);
            onRefresh();
            setDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            alert("Erro ao excluir: " + error.message);
        }
    };

    const handleSort = (col) => {
        if (sortColumn === col) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(col);
            setSortDirection('asc');
        }
    };

    return (
        <div className="overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                            <th onClick={() => handleSort('status')} className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                                <div className="flex items-center gap-1">Status <SortIcon col="status" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                            </th>
                            <th onClick={() => handleSort('vigencia')} className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                                <div className="flex items-center gap-1">Vigência <SortIcon col="vigencia" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                            </th>
                            <th onClick={() => handleSort('cliente')} className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                                <div className="flex items-center gap-1">Cliente <SortIcon col="cliente" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                            </th>
                            <th onClick={() => handleSort('vendedor')} className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                                <div className="flex items-center gap-1">Vendedor <SortIcon col="vendedor" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                            </th>
                            <th onClick={() => handleSort('vencimento')} className="px-6 py-4 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                                <div className="flex items-center gap-1">Vencimento <SortIcon col="vencimento" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                            </th>
                            <th onClick={() => handleSort('valor_comissao')} className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                                <div className="flex items-center justify-end gap-1">Comissão <SortIcon col="valor_comissao" sortColumn={sortColumn} sortDirection={sortDirection} /></div>
                            </th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {sortedComissoes.map(com => (
                            <tr key={com.id} className="text-sm hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusStyle(com.status)}`}>
                                        {getStatusIcon(com.status)} {com.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{com.vigencia}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{getClienteNome(com)}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{getVendedorNome(com)}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(com.vencimento)}</td>
                                <td className="px-6 py-4 text-right font-bold text-orange-600">{formatCurrency(com.valor_comissao)}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => onEdit(com)} className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded" title="Editar"><Edit2 size={16} /></button>
                                    <button onClick={() => confirmDelete(com.id)} className="p-1 px-2 text-red-600 hover:bg-red-50 rounded" title="Excluir"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4 p-4">
                {sortedComissoes.map(com => (
                    <ComissaoMobileCard
                        key={com.id}
                        comissao={com}
                        onEdit={onEdit}
                        onDelete={confirmDelete}
                    />
                ))}
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                title="Excluir Comissão"
                message="Tem certeza que deseja excluir esta comissão? Esta ação não pode ser desfeita."
                confirmLabel="Sim, excluir"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
            />
        </div>
    );
}

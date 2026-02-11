import React from 'react';
import { Edit2, Trash2, CheckCircle, XCircle, Calendar, User, DollarSign, Briefcase } from 'lucide-react';

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

export default function ComissaoMobileCard({ comissao, onEdit, onDelete }) {
    function getStatusStyle(status) {
        switch (status) {
            case 'PAGA': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30';
            case 'PENDENTE': return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30';
            case 'CANCELADA': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30';
            default: return 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600';
        }
    }

    function getStatusIcon(status) {
        if (status === 'PAGA') return <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />;
        if (status === 'CANCELADA') return <XCircle className="h-3.5 w-3.5 flex-shrink-0" />;
        return <div className="w-2 h-2 rounded-full bg-current flex-shrink-0" />;
    }

    // CORREÇÃO: Acessa o nome do cliente através de clientes.prospects.nome
    const getClienteNome = () => {
        try {
            return comissao?.clientes?.prospects?.nome || 'Cliente não encontrado';
        } catch {
            return 'Cliente não encontrado';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm active:scale-[0.99] transition-transform space-y-4">
            {/* Header do Card */}
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusStyle(comissao.status)}`}>
                        {getStatusIcon(comissao.status)}
                        <span className="truncate">{comissao.status}</span>
                    </span>
                    <h3 className="mt-3 font-bold text-gray-900 dark:text-white text-lg leading-tight truncate" title={getClienteNome()}>
                        {getClienteNome()}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-medium flex items-center gap-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate" title={comissao.vendedores?.nome}>
                            {comissao.vendedores?.nome || 'Vendedor N/A'}
                        </span>
                    </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    <button
                        onClick={() => onEdit(comissao)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Editar"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(comissao.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Excluir"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Grid de Detalhes */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="space-y-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        Vigência
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={comissao.vigencia}>
                        {comissao.vigencia}
                    </p>
                </div>
                <div className="space-y-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        Vencimento
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={formatDate(comissao.vencimento)}>
                        {formatDate(comissao.vencimento)}
                    </p>
                </div>
                <div className="space-y-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                        <DollarSign className="h-3 w-3 flex-shrink-0" />
                        Comissão
                    </p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-500 truncate" title={formatCurrency(comissao.valor_comissao)}>
                        {formatCurrency(comissao.valor_comissao)}
                    </p>
                </div>
                <div className="space-y-1 min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                        <Briefcase className="h-3 w-3 flex-shrink-0" />
                        Contrato
                    </p>
                    <p className="text-xs text-gray-500 font-medium truncate" title={formatCurrency(comissao.valor_contrato)}>
                        {formatCurrency(comissao.valor_contrato)}
                    </p>
                </div>
            </div>
        </div>
    );
}
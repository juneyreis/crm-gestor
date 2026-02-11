import React from 'react';
import { Edit2, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import SegmentoMobileCard from './SegmentoMobileCard';

export default function SegmentoTable({
    segmentos,
    loading,
    error,
    onEdit,
    onDelete,
    onTogglePlotar
}) {
    if (loading && segmentos.length === 0) {
        return <div className="p-12 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">Carregando segmentos...</div>;
    }

    if (error) {
        return (
            <div className="p-12 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/20 flex flex-col items-center gap-3">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    if (segmentos.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                Nenhum segmento encontrado.
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* 🖥️ Visualização Desktop (Table) */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                            <th className="px-6 py-4 w-24">ID</th>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4 w-32 text-center">Plotar</th>
                            <th className="px-6 py-4 w-32 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {segmentos.map((segmento) => (
                            <tr key={segmento.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                    #{segmento.id}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white uppercase">
                                    {segmento.descricao}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onTogglePlotar(segmento.id, segmento.plotar)}
                                        className={`inline-flex items-center justify-center p-1.5 rounded-full transition-all border ${segmento.plotar
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-slate-600'
                                            }`}
                                        title={segmento.plotar ? "Ativo no mapa" : "Oculto no mapa"}
                                    >
                                        {segmento.plotar ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(segmento)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(segmento.id, segmento.descricao)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 📱 Visualização Mobile (Cards) */}
            <div className="lg:hidden space-y-4">
                {segmentos.map((segmento) => (
                    <SegmentoMobileCard
                        key={segmento.id}
                        segmento={segmento}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onTogglePlotar={onTogglePlotar}
                    />
                ))}
            </div>
        </div>
    );
}

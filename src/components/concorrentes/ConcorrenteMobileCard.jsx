import React from 'react';
import { Edit2, Trash2, CheckCircle, XCircle, FileText, Hash } from 'lucide-react';

export default function ConcorrenteMobileCard({ concorrente, onEdit, onDelete, onTogglePlotar }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm active:scale-[0.99] transition-transform">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <Hash className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            ID #{concorrente.id}
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight uppercase">
                            {concorrente.descricao}
                        </h3>
                    </div>
                </div>

                <div className="flex gap-1 -mr-2 -mt-2">
                    <button
                        onClick={() => onEdit(concorrente)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Editar"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(concorrente.id, concorrente.descricao)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Excluir"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {concorrente.observacoes && (
                <div className="mb-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/30 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50">
                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p className="uppercase leading-relaxed italic line-clamp-2">
                        {concorrente.observacoes}
                    </p>
                </div>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-none">
                    Exibir no Mapa
                </span>
                <button
                    onClick={() => onTogglePlotar(concorrente.id, concorrente.plotar)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${concorrente.plotar
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30'
                            : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-600'
                        }`}
                >
                    {concorrente.plotar ? (
                        <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            ATIVO
                        </>
                    ) : (
                        <>
                            <XCircle className="h-3.5 w-3.5" />
                            INATIVO
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
